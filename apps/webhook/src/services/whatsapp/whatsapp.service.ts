import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ChangesDto, ValueDto, WhatsappMessageDTO } from '../../dto';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ConversationsRepository } from '../../repository/conversations.repository';
import { ClientsRepository } from '../../repository/clients.repository';
import dialogflow from '@google-cloud/dialogflow';
import { Types } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { ConversationDocument } from '../../models/conversation.schema';

@Injectable()
export class WhatsappService {
  private readonly dialogflowClient: any;
  private conversationChanges: ChangesDto;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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
  }

  public async whatsappProcessMessage(
    queryParams?: Record<string, string>,
    webhookDto?: WhatsappMessageDTO,
  ) {
    try {
      const challengeResponse = this.webhookVerification(queryParams);
      if (challengeResponse) {
        return challengeResponse;
      }

      this.conversationChanges = this.validateRequestStructure(webhookDto);
      if (!this.conversationChanges) {
        return;
      }

      const userId = await this.findOrCreateUser();

      const conversationId = await this.findOrCreateConversation(
        userId,
        this.conversationChanges,
      );

      if (conversationId.found) {
        await this.updateConversation(
          conversationId._id,
          this.conversationChanges,
          null,
          'user',
        );
      }

      const dialogFlowResponse = await this.processDialogFlowMessage(
        this.conversationChanges,
        conversationId._id.toString(),
      );

      await this.updateConversation(
        conversationId._id,
        this.conversationChanges,
        dialogFlowResponse.fulfillmentText,
        'bot',
      );

      return await this.sendWhatsAppMessage(
        this.conversationChanges.value.metadata.phone_number_id,
        this.conversationChanges.value.contacts[0].wa_id,
        dialogFlowResponse.fulfillmentText,
      );
    } catch (error) {
      throw error;
    }
  }

  private async findOrCreateUser(): Promise<Types.ObjectId> {
    try {
      let user = await this.clientsRepository.findOne({
        phone: this.conversationChanges.value.contacts[0].wa_id,
      });

      if (!user) {
        user = await this.clientsRepository.create({
          alias: this.conversationChanges.value.contacts[0].profile.name,
          name: '',
          email: '',
          phone: this.conversationChanges.value.contacts[0].wa_id,
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
    conversationChanges: ChangesDto,
  ): Promise<{ found: boolean; _id: Types.ObjectId }> {
    try {
      const conversation = await this.conversationRepository.findOne({
        clientId: userId,
      });

      if (!conversation || this.isConversationExpired(conversation)) {
        const conversationId = await this.createConversation(
          userId,
          conversationChanges,
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
    conversationChanges: ChangesDto,
  ): Promise<Types.ObjectId> {
    const messageTimestamp = parseInt(
      conversationChanges.value.messages[0].timestamp,
    );
    try {
      const newConversation = await this.conversationRepository.create({
        clientId: userId,
        startDate: new Date(messageTimestamp * 1000),
        endDate: null,
        message: [
          {
            messageId: new Types.ObjectId(),
            timestamp: new Date(messageTimestamp * 1000),
            author: 'user',
            content: conversationChanges.value.messages[0].text.body,
          },
        ],
      });
      return newConversation._id;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create conversation');
    }
  }

  private async processDialogFlowMessage(
    conversationChanges: ChangesDto,
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
            text: conversationChanges.value.messages[0].text.body,
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
    conversationChanges: ChangesDto,
    message: string | null,
    author: string,
  ) {
    try {
      const messageTimestamp = parseInt(
        conversationChanges.value.messages[0].timestamp,
      );
      await this.conversationRepository.findOneAndUpdate(
        { _id: conversationId },
        {
          $push: {
            message: {
              messageId: new Types.ObjectId(),
              timestamp: new Date(messageTimestamp * 1000),
              author: author,
              content:
                message ?? conversationChanges.value.messages[0].text.body,
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
    botPhoneNumberId: string,
    customerPhoneNo: string,
    customerMessage: string,
  ) {
    try {
      const requestData = {
        messaging_product: 'whatsapp',
        to: customerPhoneNo,
        text: { body: customerMessage },
      };

      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.configService.get('FACEBOOK_GRAPH_API_TK')}`,
        },
      };

      const whatsAppResponse = await lastValueFrom(
        this.httpService.post(
          `https://graph.facebook.com/v19.0/${botPhoneNumberId}/messages`,
          requestData,
          headers,
        ),
      );

      this.logger.log(`WhatsApp Response: ${JSON.stringify(whatsAppResponse)}`);
      return whatsAppResponse;
    } catch (error) {
      console.log(
        `sendWhatsAppMessage ERROR ==> ${JSON.stringify(error) ?? error} }`,
      );

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

  private webhookVerification(queryParams?: Record<string, string>): string {
    const mode = queryParams?.['hub.mode'];
    const challenge = queryParams?.['hub.challenge'];
    const verifyToken = queryParams?.['hub.verify_token'];
    const webhookVerifyToken = this.configService.get('WEBHOOK_VERIFY_TOKEN');

    if (mode && verifyToken) {
      if (mode === 'subscribe' && verifyToken === webhookVerifyToken) {
        return challenge;
      }
      throw new ForbiddenException('Invalid webhook verification token');
    }
  }

  private validateRequestStructure(
    webhookDto?: WhatsappMessageDTO,
  ): ChangesDto {
    if (!webhookDto || webhookDto.object !== 'whatsapp_business_account') {
      throw new BadRequestException('Invalid request object');
    }

    const conversationChanges = webhookDto.entry?.[0]?.changes?.[0];
    if (!conversationChanges) {
      throw new BadRequestException('Invalid webhook structure');
    }

    const messageType = conversationChanges.value?.messages?.[0]?.type;
    if (messageType === 'audio') {
      this.processAudioMessage(conversationChanges.value);
      return null;
    }

    return conversationChanges;
  }

  private async processAudioMessage(conversationValues: ValueDto) {
    const botPhoneNumberId = conversationValues.metadata.phone_number_id;
    const customerPhoneNo = conversationValues.contacts[0].wa_id;
    const customerName = conversationValues.contacts[0].profile.name;
    const customerMessage = `${customerName}, I'm very sorry, I can't process audio messages yet. However, my creators are working hard on adding this functionality.`;

    await this.sendWhatsAppMessage(
      botPhoneNumberId,
      customerPhoneNo,
      customerMessage,
    );
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
}
