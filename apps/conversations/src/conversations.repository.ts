import { AbstractRepository } from '@app/common/database/abstract.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConversationDocument } from './models/conversation.schema';

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