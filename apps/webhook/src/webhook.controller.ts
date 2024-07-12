import { All, Body, Controller, Get, Query } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookDto } from './dto/webhook.dto';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get('ping')
  async handlePing() {
    return 'pong';
  }

  @All('whatsapp')
  async handleWebhook(
    @Query() queryParams: Record<string, string>,
    @Body() webhookDto?: WebhookDto,
  ): Promise<any> {
    return this.webhookService.whatsappProcessMessage(queryParams, webhookDto);
  }
}
