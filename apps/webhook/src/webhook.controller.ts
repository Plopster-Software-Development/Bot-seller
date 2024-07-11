import { Body, Controller, Get, Post } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookDto } from './dto/webhook.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get('ping')
  async handlePing() {
    return 'pong';
  }

  @Post('whatsapp')
  async handleWebhook(@Body() webhookDto: WebhookDto) {
    console.log(`Webhook DTO: ${JSON.stringify(webhookDto)}`);
    return this.webhookService.processMessage(webhookDto);
  }
}
