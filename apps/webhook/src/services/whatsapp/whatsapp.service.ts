import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConversationsRepository } from '../../repository/conversations.repository';
import { ClientsRepository } from '../../repository/clients.repository';
import dialogflow from '@google-cloud/dialogflow';
import { Types } from 'mongoose';
import { ConversationDocument } from '../../models/conversation.schema';
import { TwilioMessageDto } from '../../dto/twilio-message.dto';
import { Twilio } from 'twilio';
import { PrismaClient } from '@prisma/client';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

interface BotCredentials {
  twilioSID: string;
  twilioTK: string;
  gCredsCloud: string;
}

@Injectable()
export class WhatsappService {
  private dialogflowClient: any;
  private twilioClient: any;
  private botCredentials: BotCredentials;
  private client: S3Client;
  private bucketName = this.configService.get('S3_BUCKET_NAME');

  constructor(
    private readonly configService: ConfigService,
    private readonly conversationRepository: ConversationsRepository,
    private readonly clientsRepository: ClientsRepository,
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
  ) {
    this.client = new S3Client({
      region: this.configService.get('S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
  }

  public async whatsappProcessMessage(webhookDto?: TwilioMessageDto) {
    try {
      this.initializeKeys(webhookDto.To);

      const userId = await this.findOrCreateUser(
        webhookDto.ProfileName,
        this.replaceParamsFromString(webhookDto.From, 'whatsapp', ''),
      );

      const conversationId = await this.findOrCreateConversation(
        userId,
        webhookDto.Body,
      );

      if (conversationId.found) {
        await this.updateConversation(
          conversationId._id,
          webhookDto.Body,
          'user',
        );
      }

      const dialogFlowResponse = await this.processDialogFlowMessage(
        webhookDto.Body,
        conversationId._id.toString(),
      );

      await this.updateConversation(
        conversationId._id,
        dialogFlowResponse.fulfillmentText,
        'bot',
      );

      return await this.sendWhatsAppMessage(
        webhookDto.From,
        dialogFlowResponse.fulfillmentText,
      );
    } catch (error) {
      throw error;
    }
  }

  private async findOrCreateUser(
    customerAlias: string,
    customerPhoneNo: string,
  ): Promise<Types.ObjectId> {
    try {
      let user = await this.clientsRepository.findOne({
        phone: customerPhoneNo,
      });

      if (!user) {
        user = await this.clientsRepository.create({
          alias: customerAlias,
          fullName: null,
          email: null,
          phone: customerPhoneNo,
          billingAddress: null,
          gender: null,
          dniType: null,
          dni: null,
          registerDate: new Date(),
        });
      }

      return user._id;
    } catch (error) {
      throw new InternalServerErrorException('Failed to find or create user');
    }
  }

  private async findOrCreateConversation(
    userId: Types.ObjectId,
    conversationMessage?: string,
  ): Promise<{ found: boolean; _id: Types.ObjectId }> {
    try {
      const conversation = await this.conversationRepository.findOne({
        clientId: userId,
      });

      if (!conversation || this.isConversationExpired(conversation)) {
        const conversationId = await this.createConversation(
          userId,
          conversationMessage,
        );

        return { found: false, _id: conversationId };
      }

      return {
        found: true,
        _id: conversation._id,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to find or create conversation',
      );
    }
  }

  private async createConversation(
    userId: Types.ObjectId,
    message: string,
  ): Promise<Types.ObjectId> {
    try {
      const newConversation = await this.conversationRepository.create({
        clientId: userId,
        startDate: new Date(),
        endDate: null,
        message: [
          {
            messageId: new Types.ObjectId(),
            timestamp: new Date(),
            author: 'user',
            content: message,
            messageStatus: '',
          },
        ],
      });
      return newConversation._id;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create conversation');
    }
  }

  private async processDialogFlowMessage(
    customerMessage: string,
    sessionId: string,
  ) {
    try {
      const sessionPath = this.dialogflowClient.projectAgentSessionPath(
        await this.dialogflowClient.getProjectId(),
        sessionId,
      );

      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: customerMessage,
            languageCode: 'en-US',
          },
        },
      };

      const responses = await this.dialogflowClient.detectIntent(request);
      return responses[0].queryResult;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to process Dialogflow message',
      );
    }
  }

  private async updateConversation(
    conversationId: Types.ObjectId,
    message: string | null,
    author: string,
  ) {
    try {
      await this.conversationRepository.findOneAndUpdate(
        { _id: conversationId },
        {
          $push: {
            message: {
              messageId: new Types.ObjectId(),
              timestamp: new Date(),
              author: author,
              content: message,
            },
          },
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update conversation with bot message',
      );
    }
  }

  private async sendWhatsAppMessage(
    customerPhoneNo: string,
    botMessage: string,
  ) {
    try {
      const messageRequest = {
        body: botMessage,
        from: `whatsapp:${this.configService.get<string>('TWILIO_PHONE_NUMBER')}`,
        to: `${customerPhoneNo}`,
      };
      console.log(messageRequest);
      const message = await this.twilioClient.messages.create(messageRequest);

      return message;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to send message via WhatsApp',
      );
    }
  }

  private isConversationAlive(startDate: Date): boolean {
    const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000;
    const timeDifference = Math.abs(startDate.getTime() - Date.now());
    return timeDifference <= MILLISECONDS_IN_A_DAY;
  }

  private async expireConversation(conversationId: Types.ObjectId) {
    try {
      await this.conversationRepository.findOneAndUpdate(
        { _id: conversationId },
        { endDate: Date.now() },
      );
    } catch (error) {
      throw new InternalServerErrorException('Failed to expire conversation');
    }
  }

  private isConversationExpired(conversation: ConversationDocument): boolean {
    //todo: puede existir mas de una conversacion 1 viva muchas muertas

    if (conversation.endDate) {
      return true;
    }

    const userMessages = conversation.message.filter(
      (message) => message.author === 'user',
    );

    const lastUserMessage = userMessages[userMessages.length - 1];
    const isConversationAlive = this.isConversationAlive(
      lastUserMessage.timestamp,
    );

    if (!isConversationAlive) {
      this.expireConversation(conversation._id);
      return true;
    }

    return false;
  }

  private async fetchBotCredentials(
    twilioPhoneNumber: string,
  ): Promise<BotCredentials> {
    try {
      const credentials = await this.prisma.bot_credentials.findUnique({
        where: {
          twilioPhoneNumber: twilioPhoneNumber,
        },
        select: {
          twilioSID: true,
          twilioTK: true,
          gCredsCloud: true,
        },
      });

      return credentials;
    } catch (error) {
      throw error;
    } finally {
      // En aplicaciones de producción, considera mover el manejo de la conexión de Prisma a otro lugar
      await this.prisma.$disconnect();
    }
  }

  private async initializeKeys(twilioPhoneNumber: string) {
    const botCredentials = await this.fetchBotCredentials(
      this.replaceParamsFromString(twilioPhoneNumber, 'whatsapp', ''),
    );

    const bucketName = 'gcloudcredsbot';
    const key = botCredentials.gCredsCloud.split(bucketName + '/')[1];

    const gCloudCreds = await this.getJsonFileContent(key);

    this.dialogflowClient = new dialogflow.SessionsClient({
      credentials: gCloudCreds,
    });

    this.twilioClient = new Twilio(
      botCredentials.twilioSID,
      botCredentials.twilioTK,
    );
  }

  private streamToPromise = (stream: Readable): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  };

  private async getJsonFileContent(key: string): Promise<any> {
    try {
      // Create the GetObjectCommand
      const command = new GetObjectCommand({
        Bucket: 'gcloudcredsbot', // Ensure this is the correct bucket name
        Key: key,
      });

      // Send the command to S3
      const response = await this.client.send(command);

      // Check if response.Body is a Readable stream
      if (response.Body instanceof Readable) {
        // Convert the readable stream to a buffer
        const buffer = await this.streamToPromise(response.Body);

        // Convert the buffer to a string and parse it as JSON
        const json = JSON.parse(buffer.toString('utf-8'));

        return json;
      } else {
        throw new Error('Unexpected response body type');
      }
    } catch (error) {
      console.error('Error getting JSON from S3:', error);
      throw error;
    }
  }

  private replaceParamsFromString(
    value: string,
    search: string,
    replace: string,
  ): string {
    return value.replace(search, replace);
  }
}
