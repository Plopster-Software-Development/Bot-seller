import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';

@Controller('api')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('/ping-conversations')
  pingConversations() {
    return this.apiGatewayService.pingConversations();
  }
}
