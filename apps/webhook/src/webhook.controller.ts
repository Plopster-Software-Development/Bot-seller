import { All, Body, Controller, Get, Query } from '@nestjs/common';
import { WhatsappService } from './services/whatsapp/whatsapp.service';
import { TwilioMessageDto } from './dto/twilio-message.dto';

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
    @Body() webhookDto?: TwilioMessageDto,
  ): Promise<any> {
    try {
      return await this.whatsAppService.whatsappProcessMessage(webhookDto);
    } catch (error) {
      console.log(
        `Error returned to Controller ${JSON.stringify(error) ?? error}`,
      );
    }
  }
}
