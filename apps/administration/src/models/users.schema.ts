import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import MongooseDelete from 'mongoose-delete';

@Schema({ versionKey: false })
// TODO: Change name to TenantUsersDocument
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

const UsersSchema = SchemaFactory.createForClass(TenantUsersDocument);

UsersSchema.plugin(MongooseDelete, { deletedBy: true, deletedByType: String });

export { UsersSchema };
