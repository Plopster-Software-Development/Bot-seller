import { PartialType } from '@nestjs/mapped-types';
import { CreateTenantDto } from './create-tenant.dto';
import { Types } from 'mongoose';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  id: Types.ObjectId;
}
