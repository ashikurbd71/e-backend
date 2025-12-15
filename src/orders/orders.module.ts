import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
import { PaymentsModule } from '../payments/payments.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersitemEntity } from '../ordersitem/entities/ordersitem.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { InventoryEntity } from '../inventory/entities/inventory.entity';
import { User } from '../users/entities/user.entity';


@Module({
  imports: [
    PaymentsModule,
    TypeOrmModule.forFeature([
      Order,
      OrdersitemEntity,
      ProductEntity,
      InventoryEntity,
      User,

    ]),

  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrdersModule { }
