import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import MongooseDelete from 'mongoose-delete';

@Schema({ versionKey: false })
export class TenantUsersDocument extends AbstractDocument {
  @Prop({ type: Types.ObjectId, required: true, ref: 'TenantDocument' })
  tenantId: Types.ObjectId;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  roleId: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

const TenantUsersSchema = SchemaFactory.createForClass(TenantUsersDocument);

TenantUsersSchema.plugin(MongooseDelete, {
  deletedBy: true,
  deletedByType: String,
});

export { TenantUsersSchema };
