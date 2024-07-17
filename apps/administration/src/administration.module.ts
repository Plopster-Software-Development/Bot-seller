import { Module } from '@nestjs/common';
import { AdministrationController } from './administration.controller';
import { AdministrationService } from './administration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule, LoggerModule } from '@app/common';
import { TenantsRepository } from './repository/tenants.repository';
import { TenantUsersRepository } from './repository/tenant-users.repository';
import * as Joi from 'joi';
import { TenantDocument, TenantSchema } from './models/tenant.schema';
import {
  TenantUsersDocument,
  TenantUsersSchema,
} from './models/tenant-users.schema';

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
      'adminConnection',
      (configService: ConfigService) =>
        `${configService.get<string>('MONGODB_URI')}/admin-interactions`,
      [
        { name: TenantDocument.name, schema: TenantSchema },
        { name: TenantUsersDocument.name, schema: TenantUsersSchema },
      ],
    ),
    LoggerModule,
  ],
  controllers: [AdministrationController],
  providers: [AdministrationService, TenantsRepository, TenantUsersRepository],
})
export class AdministrationModule {}
