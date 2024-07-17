import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderDetailsDocument } from '../models/orderDetails.schema';

@Injectable()
export class OrderDetailsRepository extends AbstractRepository<OrderDetailsDocument> {
  protected readonly logger = new Logger(OrderDetailsRepository.name);

  constructor(
    @InjectModel(OrderDetailsDocument.name)
    OrderDetailsModel: Model<OrderDetailsDocument>,
  ) {
    super(OrderDetailsModel);
  }
}
