import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import dialogflow from '@google-cloud/dialogflow';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ChangesDto, ValueDto, WhatsappMessageDTO } from './dto';

@Injectable()
export class WebhookService {
  private readonly dialogflowClient: any;
  private readonly validMessageTypes: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const credentialsPath = this.configService.get(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );

    this.dialogflowClient = new dialogflow.SessionsClient({
      keyFilename: credentialsPath,
    });

    this.validMessageTypes = {
      active: {
        text: {
          processable: true,
        },
        audio: {
          processable: false,
        },
      },
    };
  }

  async whatsappProcessMessage(
    queryParams?: Record<string, string>,
    webhookDto?: WhatsappMessageDTO,
  ) {
    try {
      const challengeResponse = this.webhookVerification(queryParams);

      if (challengeResponse) {
        return challengeResponse;
      }

      const conversationChanges = this.validateRequestStructure(webhookDto);

      if (!conversationChanges) {
        return;
      }

      const dialogFlowResponse: any = await this.chatBotMessageProcedure(
        conversationChanges.value,
        conversationChanges.field,
      );

      await this.sendMessageWPP(
        conversationChanges.value.metadata.phone_number_id,
        conversationChanges.value.contacts[0].wa_id,
        dialogFlowResponse.fulfillmentText,
      );
    } catch (error) {
      if (error.response?.status === 403) {
        throw new ForbiddenException('Access denied');
      }
      throw error;
    }
  }

  webhookVerification(queryParams?: Record<string, string>) {
    const mode = queryParams['hub.mode'];
    const challenge = queryParams['hub.challenge'];
    const verifyToken = queryParams['hub.verify_token'];

    const webhookVerifyToken = this.configService.get('WEBHOOK_VERIFY_TOKEN');

    if (mode && verifyToken) {
      if (mode === 'subscribe' && verifyToken === webhookVerifyToken) {
        return challenge;
      }
      throw new ForbiddenException('Invalid webhook verification token');
    }
  }

  validateRequestStructure(webhookDto?: WhatsappMessageDTO): ChangesDto {
    if (!webhookDto || webhookDto?.object !== 'whatsapp_business_account') {
      throw new BadRequestException('Invalid request object');
    }

    const conversationChanges = webhookDto?.entry?.[0]?.changes[0];

    if (!conversationChanges) {
      throw new BadRequestException('Invalid webhook structure');
    }

    const messageType = conversationChanges?.value?.messages?.[0]?.type;

    if (messageType === 'audio') {
      const conversationValues = conversationChanges.value;
      const botPhoneNumberId = conversationValues.metadata.phone_number_id;
      const customerPhoneNo = conversationValues.contacts[0].wa_id;
      const customerName = conversationValues.contacts[0].profile.name;
      const customerMessage = `${customerName}, I'm very sorry, I can't process audio messages yet. However, my creators are working hard on adding this functionality.`;

      this.sendMessageWPP(botPhoneNumberId, customerPhoneNo, customerMessage);

      return;
    }
    return conversationChanges;
  }

  async chatBotMessageProcedure(conversationValues: ValueDto, field: string) {
    if (!conversationValues && field !== 'messages') {
      return;
    }

    const projectId = await this.dialogflowClient.getProjectId();

    const sessionPath = this.dialogflowClient.projectAgentSessionPath(
      projectId,
      'test',
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: conversationValues.messages[0].text.body,
          languageCode: 'en-US',
        },
      },
    };
    const responses = await this.dialogflowClient.detectIntent(request);

    return responses[0].queryResult;
  }

  async sendMessageWPP(
    botPhoneNumberId: string,
    customerPhoneNo: string,
    customerMessage: string,
  ) {
    try {
      const requestData = {
        messaging_product: 'whatsapp',
        to: customerPhoneNo,
        text: {
          body: customerMessage,
        },
      };

      const headers = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.configService.get('FACEBOOK_GRAPH_API_TK')}`,
        },
      };

      const whatsAppResponse = this.httpService.post(
        `https://graph.facebook.com/v19.0/${botPhoneNumberId}/messages`,
        requestData,
        headers,
      );

      const something = await lastValueFrom(whatsAppResponse);

      console.log(`Response: ${JSON.stringify(something.data)}`);
    } catch (error) {
      console.error(`ERROR: ${error}`);
      throw new InternalServerErrorException(
        'Failed to send message via WhatsApp',
      );
    }
  }
}
