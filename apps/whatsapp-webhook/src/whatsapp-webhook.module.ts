import { Module } from '@nestjs/common';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { WhatsappWebhookService } from './whatsapp-webhook.service';

@Module({
  imports: [],
  controllers: [WhatsappWebhookController],
  providers: [WhatsappWebhookService],
})
export class WhatsappWebhookModule {}
