import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository, ErrorLogDocument } from '@app/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ErrorLogsRepository extends AbstractRepository<ErrorLogDocument> {
  protected readonly logger = new Logger(ErrorLogsRepository.name);

  constructor(
    @InjectModel(ErrorLogDocument.name)
    errorLogModel: Model<ErrorLogDocument>,
  ) {
    super(errorLogModel);
  }
}
