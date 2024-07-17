import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import MongooseDelete from 'mongoose-delete';

@Schema({ versionKey: false })
export class BotDocument extends AbstractDocument {
  @Prop({ type: Types.ObjectId, required: true, ref: 'TenantDocument' })
  tenantId: Types.ObjectId;

  @Prop({ required: true })
  clientSecret: string;

  @Prop()
  botName: string;

  @Prop()
  gCloudCredentialsPath: string;

  @Prop()
  whatsAppTK: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

const BotSchema = SchemaFactory.createForClass(BotDocument);

BotSchema.plugin(MongooseDelete, { deletedBy: true, deletedByType: String });

export { BotSchema };
