import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import {
  DatabaseModule,
  LoggerModule,
  RequestLoggerMiddleware,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios';
import { ClientsRepository } from './repository/clients.repository';
import { ConversationsRepository } from './repository/conversations.repository';
import { ClientDocument, ClientSchema } from './models/client.schema';
import {
  ConversationDocument,
  ConversationSchema,
} from './models/conversation.schema';
import { WhatsappService } from './services/whatsapp/whatsapp.service';
import { PrismaService } from './services/prisma.service';
import { PrismaClient } from '@prisma/client';
import { DecryptService } from './services/decrypt.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/webhook/.env',
      validationSchema: Joi.object({
        GOOGLE_APPLICATION_CREDENTIALS: Joi.string().required(),
        WEBHOOK_VERIFY_TOKEN: Joi.string().required(),
        FACEBOOK_GRAPH_API_TK: Joi.string().required(),
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
      }),
    }),
    DatabaseModule.forRootAsync(
      'clientInteractions',
      (configService: ConfigService) =>
        `${configService.get<string>('MONGODB_URI')}/client-interactions`,
      [
        { name: ClientDocument.name, schema: ClientSchema },
        { name: ConversationDocument.name, schema: ConversationSchema },
      ],
    ),
    LoggerModule,
    HttpModule,
  ],
  controllers: [WebhookController],
  providers: [
    WhatsappService,
    ClientsRepository,
    ConversationsRepository,
    Logger,
    PrismaService,
    PrismaClient,
    {
      provide: DecryptService,
      useFactory: () => {
        const keys = [
          Buffer.from('QWJaRZaChs71JlyPHamjnxxOIuvwOmpmG5YtyH6Qw2c=', 'base64'),
        ];
        return new DecryptService(keys);
      },
    },
  ],
  exports: [ClientsRepository, ConversationsRepository, DecryptService],
})
export class WebhookModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
