import { Injectable } from '@nestjs/common';
import { WebhookDto } from './dto/webhook.dto';
import dialogflow from '@google-cloud/dialogflow';

@Injectable()
export class WebhookService {
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
