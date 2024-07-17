import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import MongooseDelete from 'mongoose-delete';

@Schema({ versionKey: false })
export class InventoryDocument extends AbstractDocument {
  @Prop({ type: Types.ObjectId, required: true, ref: 'TenantDocument' })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'ProdutsDocument' })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'UsersDocument' })
  userId: Types.ObjectId;

  @Prop()
  quantity: number;

  @Prop()
  provider: string;

  @Prop()
  action: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

const InventorySchema = SchemaFactory.createForClass(InventoryDocument);

InventorySchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
});

export { InventorySchema };
