import { NestFactory } from '@nestjs/core';
import { ConversationsModule } from './conversations.module';
import { Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(ConversationsModule);

  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get('PORT'),
    },
  });

  app.useLogger(app.get(Logger));

  await app.startAllMicroservices();
}
bootstrap();
