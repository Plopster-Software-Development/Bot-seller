import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import * as Joi from 'joi';
import { DatabaseModule, LoggerModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { ConversationsRepository } from './conversations.repository';
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
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
    }),
    ConversationsModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository],
})
export class ConversationsModule {}
