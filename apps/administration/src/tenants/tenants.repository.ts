import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantDocument } from './models/tenant.schema';

@Injectable()
export class TenantsRepository extends AbstractRepository<TenantDocument> {
  protected readonly logger = new Logger(TenantsRepository.name);

  constructor(
    @InjectModel(TenantDocument.name, 'adminConnection')
    private readonly tenantModel: Model<TenantDocument>,
  ) {
    super(tenantModel);
  }
}
