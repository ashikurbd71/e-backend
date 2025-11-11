import { Module } from '@nestjs/common';
import { OrdersitemService } from './ordersitem.service';
import { OrdersitemController } from './ordersitem.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersitemEntity } from './entities/ordersitem.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrdersitemEntity, Order, ProductEntity])],
  controllers: [OrdersitemController],
  providers: [OrdersitemService],
})
export class OrdersitemModule {}
