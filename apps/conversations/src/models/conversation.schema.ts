import { AbstractDocument } from '@app/common/database/abstract.schema';
import { Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class ConversationDocument extends AbstractDocument {}

export const ConversationSchema =
  SchemaFactory.createForClass(ConversationDocument);
