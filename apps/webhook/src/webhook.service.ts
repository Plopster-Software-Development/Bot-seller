import { ForbiddenException, Injectable } from '@nestjs/common';
import { WebhookDto } from './dto/webhook.dto';
import dialogflow from '@google-cloud/dialogflow';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class WebhookService {
  private readonly dialogflowClient: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.dialogflowClient = new dialogflow.SessionsClient();
  }

  async whatsappProcessMessage(
    queryParams: Record<string, string>,
    webhookDto?: WebhookDto,
  ) {
    console.log(`WEBHOOKDTO => ${JSON.stringify(webhookDto)}`);

    const mode = queryParams['hub.mode'] ?? undefined;
    const challenge = queryParams['hub.challenge'] ?? undefined;
    const verifyToken = queryParams['hub.verify_token'] ?? undefined;

    const webhookVerifyToken = this.configService.get('WEBHOOK_VERIFY_TOKEN');

    if (mode && verifyToken) {
      if (mode === 'subscribe' && verifyToken === webhookVerifyToken) {
        return challenge;
      }
      throw new ForbiddenException('Invalid webhook verification token');
    }

    if (webhookDto && webhookDto.object === 'whatsapp_business_account') {
      const projectId = await this.dialogflowClient.getProjectId();
      const { value, field } = webhookDto?.entry[0]?.changes[0];

      if (value && field === 'messages') {
        const botPhoneNumberId = value.metadata.phone_number_id;
        // const botPhoneNumber = value.metadata.display_phone_number;

        const customerPhoneNo = value.contacts[0].wa_id;
        const customerName = value.contacts[0].profile.name;
        const cutomerMessage = value.messages[0].text.body;

        const sessionPath = this.dialogflowClient.projectAgentSessionPath(
          projectId,
          customerName,
        );

        const request = {
          session: sessionPath,
          queryInput: {
            text: {
              text: webhookDto.entry,
              languageCode: 'en-US',
            },
          },
        };

        const responses = await this.dialogflowClient.detectIntent(request);
        const result = responses[0].queryResult;
        return { response: result.fulfillmentText };
      }
    }
    return 'Something';
  }

  // response = this.httpService.post(
  //   `https://graph.facebook.com/v13.0/${botPhoneNumberId}}/messages?access_token=${this.configService.get('FACEBOOK_GRAPH_API_TK')}`,
  //   {
  //     messaging_product: 'whatsapp',
  //     to: customerPhoneNo,
  //     text: {
  //       body: `Hey ${customerName}! the message you've sent is ${cutomerMessage}`,
  //     },
  //   },
  //   {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   },
  // );
}
