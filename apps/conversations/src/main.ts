import { NestFactory } from '@nestjs/core';
import { ConversationsModule } from './conversations.module';

async function bootstrap() {
  const app = await NestFactory.create(ConversationsModule);
  await app.listen(3000);
}
bootstrap();
