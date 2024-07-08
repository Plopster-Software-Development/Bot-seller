import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

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
  ],
})
export class LoggerModule {}
