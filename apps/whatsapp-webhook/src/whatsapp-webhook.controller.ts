import { Body, Controller, Post } from '@nestjs/common';
import { WhatsappWebhookService } from './whatsapp-webhook.service';
import { WebhookDto } from './dto/webhook.dto';

@Controller()
export class WhatsappWebhookController {
  constructor(
    private readonly whatsappWebhookService: WhatsappWebhookService,
  ) {}

  @Post()
  async handleWebhook(@Body() webhookDto: WebhookDto) {
    return this.whatsappWebhookService.processMessage(webhookDto);
  }
}
