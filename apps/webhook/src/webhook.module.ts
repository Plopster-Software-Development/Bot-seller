import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { LoggerModule, RequestLoggerMiddleware } from '@app/common';
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
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      connectionName: 'clientInteractions',
      useFactory: (configService: ConfigService) => ({
        uri: `${configService.get('MONGODB_URI')}/client-interactions}`,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(
      [
        { name: ClientDocument.name, schema: ClientSchema },
        { name: ConversationDocument.name, schema: ConversationSchema },
      ],
      'clientInteractions',
    ),
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/webhook/.env',
      validationSchema: Joi.object({
        GOOGLE_APPLICATION_CREDENTIALS: Joi.string().required(),
        WEBHOOK_VERIFY_TOKEN: Joi.string().required(),
        FACEBOOK_GRAPH_API_TK: Joi.string().required(),
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
        LOGGING_MONGODB_URI: Joi.string().required(),
      }),
    }),
    HttpModule,
  ],
  controllers: [WebhookController],
  providers: [
    WhatsappService,
    ClientsRepository,
    ConversationsRepository,
    Logger,
  ],
})
export class WebhookModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
