import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
// import { RequestDTO } from './dto/dialogflow-request.dto';

@Controller('api')
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Get('/ping-conversations')
  pingConversations() {
    return this.apiGatewayService.pingConversations();
  }

  @Post('conversations')
  conversationsManager(@Body() apiGatewayDto?: any) {
    console.log(`conversationsManager ==> ${JSON.stringify(apiGatewayDto)}}`);
    return this.apiGatewayService.conversationsManager(apiGatewayDto);
  }
}
