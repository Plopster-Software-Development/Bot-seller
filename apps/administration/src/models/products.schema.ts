import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import MongooseDelete from 'mongoose-delete';

@Schema({ versionKey: false })
export class ProductDocument extends AbstractDocument {
  @Prop({ type: Types.ObjectId, required: true, ref: 'TenantDocument' })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'UsersDocument' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'CategoryDocument' })
  categoryId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  slug: string;

  @Prop()
  gallery: object;

  @Prop({ required: true })
  frontPage: string;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  titleVariety: string;

  @Prop()
  varieties: object;

  @Prop()
  noSells: number;

  @Prop()
  noPoints: number;

  @Prop({ default: 'editing', required: true })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

const ProductSchema = SchemaFactory.createForClass(ProductDocument);

ProductSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
});

export { ProductSchema };
