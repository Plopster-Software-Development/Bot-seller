import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import MongooseDelete from 'mongoose-delete';

@Schema({ versionKey: false })
export class TenantDocument extends AbstractDocument {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  country: string;

  @Prop()
  city: string;

  @Prop()
  province: string;

  @Prop()
  address: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  email: string;
}

const TenantSchema = SchemaFactory.createForClass(TenantDocument);

TenantSchema.plugin(MongooseDelete, { deletedBy: true, deletedByType: String });

export { TenantSchema };
