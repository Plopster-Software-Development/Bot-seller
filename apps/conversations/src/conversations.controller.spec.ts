import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

describe('ConversationsController', () => {
  let conversationsController: ConversationsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [ConversationsService],
    }).compile();

    conversationsController = app.get<ConversationsController>(ConversationsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(conversationsController.getHello()).toBe('Hello World!');
    });
  });
});
