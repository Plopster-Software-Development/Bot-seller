import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import * as Joi from 'joi';
import {
  DatabaseModule,
  LoggerModule,
  RequestLoggerMiddleware,
} from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConversationsRepository } from './conversations.repository';
import {
  ClientDocument,
  ClientSchema,
} from '../../administration/src/models/client.schema';
import {
  ConversationDocument,
  ConversationSchema,
} from './models/conversation.schema';
import {
  OrderDetailsDocument,
  OrderDetailsSchema,
} from './models/orderDetails.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
    }),
    DatabaseModule.forRootAsync(
      'clientInteractions',
      (configService: ConfigService) =>
        `${configService.get<string>('MONGODB_URI')}/client-interactions`,
      [
        { name: ClientDocument.name, schema: ClientSchema },
        { name: ConversationDocument.name, schema: ConversationSchema },
        { name: OrderDetailsDocument.name, schema: OrderDetailsSchema },
      ],
    ),
    LoggerModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsRepository],
})
export class ConversationsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
