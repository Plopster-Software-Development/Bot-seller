import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationDocument } from './models/conversation.schema';
import { AbstractRepository } from '@app/common';

@Injectable()
export class ConversationsRepository extends AbstractRepository<ConversationDocument> {
  protected readonly logger = new Logger(ConversationsRepository.name);

  constructor(
    @InjectModel(ConversationDocument.name)
    reservationModel: Model<ConversationDocument>,
  ) {
    super(reservationModel);
  }
}
