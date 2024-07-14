import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LoggerService } from './logger.service';
import { ErrorLogDocument, ErrorLogSchema } from './models/error-log.schema';
import {
  RequestLogDocument,
  RequestLogSchema,
} from './models/request-log.schema';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { RequestLogsRepository } from './repository/request-logs.repository';
import { ErrorLogsRepository } from './repository/error-logs.repository';
import { DatabaseModule } from '../database';

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
    DatabaseModule,
    DatabaseModule.forFeature([
      { name: ErrorLogDocument.name, schema: ErrorLogSchema },
      { name: RequestLogDocument.name, schema: RequestLogSchema },
    ]),
  ],
  providers: [
    LoggerService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    RequestLogsRepository,
    ErrorLogsRepository,
  ],
  exports: [LoggerService, RequestLogDocument, ErrorLogDocument],
})
export class LoggerModule {}
