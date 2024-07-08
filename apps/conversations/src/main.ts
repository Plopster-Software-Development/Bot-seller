import { NestFactory } from '@nestjs/core';
import { ConversationsModule } from './conversations.module';
import { Transport } from '@nestjs/microservices';
import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  let configService: INestMicroservice;
  const app = await NestFactory.createMicroservice(ConversationsModule, {
    transport: Transport.TCP,
    options: async () => {
      configService = await app.get(ConfigService);
      return {
        host: configService.get('CONVERSATIONS_HOST'),
        port: configService.get('CONVERSATIONS_PORT'),
      };
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.useLogger(app.get(Logger));
  await app.listen();
}
bootstrap();
