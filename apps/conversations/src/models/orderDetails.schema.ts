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

  @Prop()
  titleVariety: string;

  @Prop()
  variety: string;

  @Prop({ required: true })
  price: number;
}

@Schema({ versionKey: false })
export class OrderDetailsDocument extends AbstractDocument {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Cliente' })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Conversacion' })
  conversationId: Types.ObjectId;

  @Prop({ default: [] })
  items: Item[];

  @Prop({ required: true })
  totalPrice: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OrderDetailsSchema =
  SchemaFactory.createForClass(OrderDetailsDocument);
