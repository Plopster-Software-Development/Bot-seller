import { All, Body, Controller, Get, Query } from '@nestjs/common';
import { WhatsappMessageDTO } from './dto';
import { WhatsappService } from './services/whatsapp/whatsapp.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly whatsAppService: WhatsappService) {}

  @Get('ping')
  async handlePing() {
    return 'pong';
  }

  @All('whatsapp')
  async handleWebhook(
    @Query() queryParams?: Record<string, string>,
    @Body() webhookDto?: WhatsappMessageDTO,
  ): Promise<any> {
    try {
      return await this.whatsAppService.whatsappProcessMessage(
        queryParams,
        webhookDto,
      );
    } catch (error) {
      console.log(
        `Error returned to Controller ${JSON.stringify(error) ?? error}`,
      );
    }
  }
}
