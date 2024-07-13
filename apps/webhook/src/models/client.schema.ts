import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class ClientDocument extends AbstractDocument {
  @Prop()
  alias: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ default: Date.now })
  registerDate: Date;
}

export const ClientSchema = SchemaFactory.createForClass(ClientDocument);
