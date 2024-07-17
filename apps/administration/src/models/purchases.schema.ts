import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import MongooseDelete from 'mongoose-delete';

@Schema({ versionKey: false })
export class Item {
  @Prop({ type: Types.ObjectId, required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;
}

@Schema({ versionKey: false })
export class PurchaseDocument extends AbstractDocument {
  @Prop({ type: Types.ObjectId, required: true, ref: 'ProdutsDocument' })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'UsersDocument' })
  clientId: Types.ObjectId;

  @Prop({ default: [] })
  items: Item[];

  @Prop()
  totalPrice: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

const PurchaseSchema = SchemaFactory.createForClass(PurchaseDocument);

PurchaseSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
});

export { PurchaseSchema };
