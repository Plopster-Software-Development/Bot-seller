import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { DatabaseModule, LoggerModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { HttpModule } from '@nestjs/axios';
import { ClientsRepository } from './repository/clients.repository';
import { ConversationsRepository } from './repository/conversations.repository';
import { ClientDocument, ClientSchema } from './models/client.schema';
import {
  ConversationDocument,
  ConversationSchema,
} from './models/conversation.schema';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: ClientDocument.name, schema: ClientSchema },
      { name: ConversationDocument.name, schema: ConversationSchema },
    ]),
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: 'apps/webhook/.env',
      validationSchema: Joi.object({
        GOOGLE_APPLICATION_CREDENTIALS: Joi.string().required(),
        WEBHOOK_VERIFY_TOKEN: Joi.string().required(),
        FACEBOOK_GRAPH_API_TK: Joi.string().required(),
        PORT: Joi.number().required(),
        MONGODB_URI: Joi.string().required(),
      }),
    }),
    HttpModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, ClientsRepository, ConversationsRepository],
})
export class WebhookModule {}
