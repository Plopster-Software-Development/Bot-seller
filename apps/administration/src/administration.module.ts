import { Module } from '@nestjs/common';
import { AdministrationController } from './administration.controller';
import { AdministrationService } from './administration.service';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@app/common';

@Module({
  imports: [
    DatabaseModule.forRootAsync(
      'adminConnection',
      (configService: ConfigService) =>
        `${configService.get<string>('MONGODB_URI')}/admin-interactions`,
      [
        // { name: ClientDocument.name, schema: ClientSchema },
      ],
    ),
  ],
  controllers: [AdministrationController],
  providers: [AdministrationService],
})
export class AdministrationModule {}
