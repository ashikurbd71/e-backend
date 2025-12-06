import { Module } from '@nestjs/common';
import { ProductService } from './products.service';
import { ProductController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { OrdersitemEntity } from 'src/ordersitem/entities/ordersitem.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity, OrdersitemEntity])],
  controllers: [ProductController],
  providers: [ProductService, JwtAuthGuard, PermissionGuard],
})
export class ProductModule {}
