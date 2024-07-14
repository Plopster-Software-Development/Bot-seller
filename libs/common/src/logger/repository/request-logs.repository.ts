import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository, RequestLogDocument } from '@app/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RequestLogsRepository extends AbstractRepository<RequestLogDocument> {
  protected readonly logger = new Logger(RequestLogsRepository.name);

  constructor(
    @InjectModel(RequestLogDocument.name)
    requestLogModel: Model<RequestLogDocument>,
  ) {
    super(requestLogModel);
  }
}
