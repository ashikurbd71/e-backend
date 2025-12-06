import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { InventoryEntity } from '../inventory/entities/inventory.entity';
import { OrdersitemEntity } from '../ordersitem/entities/ordersitem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      User,
      ProductEntity,
      InventoryEntity,
      OrdersitemEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}




