import { NestFactory } from '@nestjs/core';
import { WhatsappWebhookModule } from './whatsapp-webhook.module';

async function bootstrap() {
  const app = await NestFactory.create(WhatsappWebhookModule);
  await app.listen(3000);
}
bootstrap();
