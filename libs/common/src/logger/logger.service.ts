import { Injectable } from '@nestjs/common';
import { ErrorLogDocument } from './models/error-log.schema';
import { RequestLogDocument } from './models/request-log.schema';
import { RequestLogsRepository } from './repository/request-logs.repository';
import { ErrorLogsRepository } from './repository/error-logs.repository';

@Injectable()
export class LoggerService {
  constructor(
    private readonly requestLogsRepository: RequestLogsRepository,
    private readonly errorLogsRepository: ErrorLogsRepository,
  ) {}

  async logRequest(log: any): Promise<RequestLogDocument> {
    return await this.requestLogsRepository.create({ ...log });
  }

  async logError(log: any): Promise<ErrorLogDocument> {
    return await this.errorLogsRepository.create({ ...log });
  }
}
