import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger.service';
import { Types } from 'mongoose';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    const log = {
      _id: new Types.ObjectId(),
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      response: res.locals.data || null,
      statusCode: res.statusCode,
      responseTime: Date.now() - startTime,
      ip: req.ip,
      timestamp: new Date(),
      microservice: process.env.MICROSERVICE_NAME,
    };

    res.on('finish', async () => {
      await this.loggerService.logRequest(log);
    });

    next();
  }
}
