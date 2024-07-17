import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantUsersDocument } from '../models/tenant-users.schema';

@Injectable()
export class TenantUsersRepository extends AbstractRepository<TenantUsersDocument> {
  protected readonly logger = new Logger(TenantUsersRepository.name);

  constructor(
    @InjectModel(TenantUsersDocument.name, 'adminConnection')
    private readonly tenantUsersModel: Model<TenantUsersDocument>,
  ) {
    super(tenantUsersModel);
  }
}
