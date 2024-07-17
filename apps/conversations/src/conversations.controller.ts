import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationsService } from './conversations.service';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
// import { RequestDTO } from './dto/dialogflow-request.dto';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessagePattern('ping')
  ping() {
    return of('pong').pipe(delay(1000));
  }

  @MessagePattern('conversationsManager')
  conversationsManager(@Payload() conversationRequestDto: any) {
    // TODO: 2. Validate and sanitize the conversationRequestDto
    // TODO: 3. Save the conversation in the database or update the data if already exists
    // TODO: 4 .Took a key value of the conversation to identify if we should start saving the items the user wannna purchase or if we only need to keep saving the conversation
    // TODO: 5. Identify if the user wants to pay and in that generate a Payment URL with Stripe
    // TODO: 7. Returns the payment URL
    console.log(
      `conversationsManager => ${JSON.stringify(conversationRequestDto)}`,
    );

    // return this.conversationsService.generatePaymentURL();
  }
}
