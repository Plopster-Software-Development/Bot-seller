import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationsService } from './conversations.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
// import { RequestDTO } from './dto/dialogflow-request.dto';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {
    console.log('test');
  }

  @MessagePattern('ping')
  ping() {
    return of('pong').pipe(delay(1000));
  }

  @MessagePattern('conversationsManager')
  conversationsManager(@Payload() conversationRequestDto: any) {
    console.log(
      `conversationsManager => ${JSON.stringify(conversationRequestDto)}`,
    );
  }
}
