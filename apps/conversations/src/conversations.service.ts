import { Injectable } from '@nestjs/common';
import { ConversationsRepository } from './conversations.repository';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
  ) {}

  create(createConversationDto: CreateConversationDto) {
    return this.conversationsRepository.create({
      ...createConversationDto,
      timestamp: new Date(),
      userId: '123',
    });
  }

  findAll() {
    return this.conversationsRepository.find({});
  }

  findOne(_id: string) {
    return this.conversationsRepository.findOne({ _id });
  }

  update(_id: string, updateConversationDto: UpdateConversationDto) {
    return this.conversationsRepository.findOneAndUpdate(
      { _id },
      { $set: updateConversationDto },
    );
  }

  remove(_id: string) {
    return this.conversationsRepository.findOneAndDelete({ _id });
  }
}
