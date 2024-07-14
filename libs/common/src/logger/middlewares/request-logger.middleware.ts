import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', async () => {
      await this.loggerService.logRequest({
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
      });
    });

    next();
  }
}
