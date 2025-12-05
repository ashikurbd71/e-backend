import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCartproductDto } from './dto/create-cartproduct.dto';
import { UpdateCartproductDto } from './dto/update-cartproduct.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cartproduct } from './entities/cartproduct.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { OrderService } from 'src/orders/orders.service';
import { RequestContextService } from 'src/common/services/request-context.service';

@Injectable()
export class CartproductsService {
  async findUserCart(userId: number) {
    return this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['product', 'user'],
      order: { updatedAt: 'DESC' },
    });
  }
  constructor(
    @InjectRepository(Cartproduct)
    private readonly cartRepo: Repository<Cartproduct>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly ordersService: OrderService,
    private readonly requestContextService: RequestContextService,
  ) {}

  async create(dto: CreateCartproductDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.cartRepo.findOne({
      where: { user: { id: user.id }, product: { id: product.id } },
      relations: ['user', 'product'],
    });

    if (existing) {
      existing.quantity += dto.quantity;
      existing.unitPrice = +product.price;
      existing.totalPrice = +existing.unitPrice * existing.quantity;
      return this.cartRepo.save(existing);
    }

    const item = this.cartRepo.create({
      user,
      product,
      quantity: dto.quantity,
      unitPrice: +product.price,
      totalPrice: +product.price * dto.quantity,
    });

    return this.cartRepo.save(item);
  }

  async findAll(userId?: number) {
    const where = userId ? { user: { id: userId } } : {};
    return this.cartRepo.find({
      where,
      relations: ['product', 'user'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const item = await this.cartRepo.findOne({
      where: { id },
      relations: ['product', 'user'],
    });
    if (!item) throw new NotFoundException('Cart item not found');
    return item;
  }

  async update(id: number, dto: UpdateCartproductDto) {
    const item = await this.findOne(id);
    if (dto.quantity !== undefined) {
      if (dto.quantity < 1) throw new BadRequestException('Quantity must be at least 1');
      item.quantity = dto.quantity;
    }
    item.totalPrice = +item.unitPrice * item.quantity;
    return this.cartRepo.save(item);
  }

  async remove(id: number) {
    const res = await this.cartRepo.softDelete(id);
    if (!res.affected) throw new NotFoundException('Cart item not found');
  }

  async clearUserCart(userId: number) {
    const items = await this.cartRepo.find({
      where: { user: { id: userId } },
    });

    if (!items.length) {
      throw new NotFoundException('No cart items found for user');
    }

    await this.cartRepo.softDelete(items.map((i) => i.id));
    return { affected: items.length };
  }

  async orderFromUserCart(userId: number, payload?: { paymentMethod?: 'DIRECT' | 'COD'; pickupPoint?: any }) {
    const items = await this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['product', 'user'],
    });
    if (!items.length) throw new BadRequestException('Cart is empty');

    const companyId = this.requestContextService.getCompanyId();
    const orderDto = {
      customerId: userId,
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      paymentMethod: payload?.paymentMethod,
      pickupPoint: payload?.pickupPoint,
    };

    const order = await this.ordersService.create(orderDto, companyId);

    // Clear cart (soft delete)
    await this.cartRepo.softDelete(items.map((i) => i.id));

    return order;
  }
}
