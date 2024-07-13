import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ versionKey: false })
export class Item {
  @Prop({ type: Types.ObjectId, required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

@Schema({ versionKey: false })
export class OrderDetailsDocument extends AbstractDocument {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Cliente' })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Conversacion' })
  conversationId: Types.ObjectId;

  @Prop({ type: [Item], default: [] })
  items: Item[];

  @Prop({ required: true })
  total: number;

  @Prop({ default: Date.now })
  updateDate: Date;
}

export const OrderDetailsSchema =
  SchemaFactory.createForClass(OrderDetailsDocument);
