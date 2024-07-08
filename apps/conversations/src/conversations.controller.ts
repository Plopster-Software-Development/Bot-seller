import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @MessagePattern('createConversation')
  create(@Payload() createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(createConversationDto);
  }

  @MessagePattern('findAllConversations')
  findAll() {
    return this.conversationsService.findAll();
  }

  @MessagePattern('findOneConversation')
  findOne(@Payload() id: string) {
    return this.conversationsService.findOne(id);
  }

  @MessagePattern('updateConversation')
  update(@Payload() updateConversationDto: UpdateConversationDto) {
    return this.conversationsService.update(
      updateConversationDto.id,
      updateConversationDto,
    );
  }

  @MessagePattern('removeConversation')
  remove(@Payload() id: string) {
    return this.conversationsService.remove(id);
  }
}
