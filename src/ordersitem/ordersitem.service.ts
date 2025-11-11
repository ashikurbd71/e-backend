import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrdersitemDto } from './dto/create-ordersitem.dto';
import { UpdateOrdersitemDto } from './dto/update-ordersitem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersitemEntity } from './entities/ordersitem.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersitemService {
  constructor(
    @InjectRepository(OrdersitemEntity)
    private readonly orderItemRepo: Repository<OrdersitemEntity>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}
  async create(dto: CreateOrdersitemDto): Promise<OrdersitemEntity> {
    const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const totalPrice = Number(dto.unitPrice) * Number(dto.quantity);

    const item = this.orderItemRepo.create({
      order,
      product,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      totalPrice,
    });

    return this.orderItemRepo.save(item);
  }

  async findAll(): Promise<OrdersitemEntity[]> {
    return this.orderItemRepo.find({
      relations: { order: true, product: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<OrdersitemEntity> {
    const item = await this.orderItemRepo.findOne({
      where: { id },
      relations: { order: true, product: true },
    });
    if (!item) throw new NotFoundException('Ordersitem not found');
    return item;
  }

  async update(id: number, dto: UpdateOrdersitemDto): Promise<OrdersitemEntity> {
    const item = await this.findOne(id);

    if (dto.quantity !== undefined) item.quantity = dto.quantity;
    if (dto.unitPrice !== undefined) item.unitPrice = dto.unitPrice;

    // recompute total
    item.totalPrice = Number(item.unitPrice) * Number(item.quantity);

    if (dto.orderId) {
      const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
      if (!order) throw new NotFoundException('Order not found');
      item.order = order;
    }

    if (dto.productId) {
      const product = await this.productRepo.findOne({ where: { id: dto.productId } });
      if (!product) throw new NotFoundException('Product not found');
      item.product = product;
    }

    return this.orderItemRepo.save(item);
  }

  async remove(id: number): Promise<void> {
    const result = await this.orderItemRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException('Ordersitem not found');
  }
}
