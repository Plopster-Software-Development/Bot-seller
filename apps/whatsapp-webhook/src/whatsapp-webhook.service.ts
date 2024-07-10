import { Injectable } from '@nestjs/common';
import { WebhookDto } from './dto/webhook.dto';
import dialogflow from '@google-cloud/dialogflow';

@Injectable()
export class WhatsappWebhookService {
  private readonly dialogflowClient: any;

  constructor() {
    this.dialogflowClient = new dialogflow.SessionsClient();
  }

  async processMessage(webhookDto: WebhookDto) {
    const projectId = await this.dialogflowClient.getProjectId();

    const sessionPath = this.dialogflowClient.projectAgentSessionPath(
      projectId,
      'whatsapp-user-phone-no',
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: webhookDto.message,
          languageCode: 'en-US',
        },
      },
    };

    const responses = await this.dialogflowClient.detectIntent(request);
    const result = responses[0].queryResult;

    // Aquí puedes manejar la respuesta de Dialogflow según tus necesidades
    return { response: result.fulfillmentText };
  }
}
