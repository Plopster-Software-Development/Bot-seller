import { Module } from '@nestjs/common';
import { AdministrationController } from './administration.controller';
import { AdministrationService } from './administration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule, LoggerModule } from '@app/common';
import { TenantsRepository } from './tenants/tenants.repository';
import { TenantUsersRepository } from './repository/tenant-users.repository';
import * as Joi from 'joi';
import { TenantDocument, TenantSchema } from './tenants/models/tenant.schema';
import {
  TenantUsersDocument,
  TenantUsersSchema,
} from './models/tenant-users.schema';
import { JwtModule } from '@nestjs/jwt';
import { TenantsModule } from './tenants/tenants.module';

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
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_APP'),
      }),
    }),
    TenantsModule,
  ],
  controllers: [AdministrationController],
  providers: [AdministrationService, TenantsRepository, TenantUsersRepository],
})
export class AdministrationModule {}
