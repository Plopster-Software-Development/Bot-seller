import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientDocument } from '../../../administration/src/models/client.schema';

@Injectable()
export class ClientsRepository extends AbstractRepository<ClientDocument> {
  protected readonly logger = new Logger(ClientsRepository.name);

  constructor(
    @InjectModel(ClientDocument.name)
    clientModel: Model<ClientDocument>,
  ) {
    super(clientModel);
  }
}
