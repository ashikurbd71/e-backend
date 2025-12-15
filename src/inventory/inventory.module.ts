import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './entities/inventory.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { OrdersitemEntity } from '../ordersitem/entities/ordersitem.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryEntity, ProductEntity, OrdersitemEntity, Order])],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
