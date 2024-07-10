import { CONVERSATIONS_SERVICE } from '@app/common';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { map } from 'rxjs';

@Injectable()
export class ApiGatewayService {
  constructor(
    @Inject(CONVERSATIONS_SERVICE)
    private readonly conversationService: ClientProxy,
  ) {}

  pingConversations() {
    const startTs = Date.now();
    return this.conversationService
      .send<string>('ping', {})
      .pipe(
        map((message: string) => ({ message, duration: Date.now() - startTs })),
      );
  }
}
