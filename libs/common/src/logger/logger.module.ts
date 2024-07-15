import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LoggerService } from './logger.service';
import { ErrorLogDocument, ErrorLogSchema } from './models/error-log.schema';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import {
  RequestLogDocument,
  RequestLogSchema,
} from './models/request-log.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            prettyPrint: {
              translateTime: 'SYS:HH:mm:ss.l',
            },
          },
        },
      },
    }),
    MongooseModule.forRootAsync({
      connectionName: 'loggingConnection',
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('LOGGING_MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(
      [
        { name: ErrorLogDocument.name, schema: ErrorLogSchema },
        { name: RequestLogDocument.name, schema: RequestLogSchema },
      ],
      'loggingConnection',
    ),
  ],
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
