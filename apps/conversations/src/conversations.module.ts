import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import * as Joi from 'joi';
import { DatabaseModule, LoggerModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import {
  ConversationDocument,
  ConversationSchema,
} from './models/conversation.schema';
import { ConversationsRepository } from './conversations.repository';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: ConversationDocument.name, schema: ConversationSchema },
    ]),
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/conversations/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        HOST: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
    }),
    ConversationsModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository],
})
export class ConversationsModule {}
