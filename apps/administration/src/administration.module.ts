import { Module } from '@nestjs/common';
import { AdministrationController } from './administration.controller';
import { AdministrationService } from './administration.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      connectionName: 'adminConnection',
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('LOGGING_MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(
      [
        // { name: ErrorLogDocument.name, schema: ErrorLogSchema },
        // { name: RequestLogDocument.name, schema: RequestLogSchema },
      ],
      'adminConnection',
    ),
  ],
  controllers: [AdministrationController],
  providers: [AdministrationService],
})
export class AdministrationModule {}
