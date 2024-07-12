import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationsService } from './conversations.service';
import { RequestDTO } from './dto/create-conversation.dto';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessagePattern('ping')
  ping() {
    return of('pong').pipe(delay(1000));
  }

  @MessagePattern('conversationsManager')
  conversationsManager(@Payload() conversationRequestDto: RequestDTO) {
    console.log(`conversationsManager ${conversationRequestDto}`);
    // return this.conversationsService.create(createConversationDto);
  }
}
