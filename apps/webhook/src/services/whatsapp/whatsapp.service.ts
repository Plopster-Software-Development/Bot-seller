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

@Injectable()
export class WhatsappService {
  private readonly dialogflowClient: any;
  private readonly twilioClient: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly conversationRepository: ConversationsRepository,
    private readonly clientsRepository: ClientsRepository,
    private readonly logger: Logger,
  ) {
    const credentialsPath = this.configService.get(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );

    this.dialogflowClient = new dialogflow.SessionsClient({
      keyFilename: credentialsPath,
    });

    //Existen varias credenciales de twilio dependiendo del proyecto, como gestioanrlo???
    this.twilioClient = new Twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_ACCOUNT_TOKEN'),
    );
  }

  public async whatsappProcessMessage(webhookDto?: TwilioMessageDto) {
    try {
      const customerPhoneNo = webhookDto.From.replace('whatsapp', '');

      const userId = await this.findOrCreateUser(
        webhookDto.ProfileName,
        customerPhoneNo,
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

  // private async processAudioMessage(conversationValues: ValueDto) {
  //   const botPhoneNumberId = conversationValues.metadata.phone_number_id;
  //   const customerPhoneNo = conversationValues.contacts[0].wa_id;
  //   const customerName = conversationValues.contacts[0].profile.name;
  //   const customerMessage = `${customerName}, I'm very sorry, I can't process audio messages yet. However, my creators are working hard on adding this functionality.`;

  //   await this.sendWhatsAppMessage(
  //     botPhoneNumberId,
  //     customerPhoneNo,
  //     customerMessage,
  //   );
  // }

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
}
