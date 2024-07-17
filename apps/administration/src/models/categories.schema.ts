import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import MongooseDelete from 'mongoose-delete';

@Schema({ versionKey: false })
export class CategoryDocument extends AbstractDocument {
  @Prop({ type: Types.ObjectId, required: true, ref: 'TenantDocument' })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'UsersDocument' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

const CategorieSchema = SchemaFactory.createForClass(CategoryDocument);

CategorieSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
});

export { CategorieSchema };
