import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryEntity } from './entities/inventory.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { OrdersitemEntity } from 'src/ordersitem/entities/ordersitem.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(OrdersitemEntity)
    private readonly ordersitemRepo: Repository<OrdersitemEntity>,
  ) { }
  async create(createInventoryDto: CreateInventoryDto) {
    const product = await this.productRepo.findOne({
      where: { id: createInventoryDto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const inventory = this.inventoryRepo.create({
      product,
      stock: createInventoryDto.stock,
      sold: createInventoryDto.sold ?? 0,
    });
    return this.inventoryRepo.save(inventory);
  }

  async findAll() {
    return this.inventoryRepo.find({
      relations: { product: true },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const inventory = await this.inventoryRepo.findOne({
      where: { id },
      relations: { product: true },
    });
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    return inventory;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryDto) {
    const inventory = await this.findOne(id);

    if (typeof updateInventoryDto.productId === 'number') {
      const product = await this.productRepo.findOne({
        where: { id: updateInventoryDto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      inventory.product = product;
    }

    // Merge newStock with current stock when updating
    // If newStock is provided in the update, merge it with current stock
    if (typeof updateInventoryDto.newStock === 'number') {
      inventory.stock = Number(inventory.stock || 0) + Number(updateInventoryDto.newStock);
    }

    // If stock is provided directly, set it directly (this takes precedence over newStock merge)
    if (typeof updateInventoryDto.stock === 'number') {
      inventory.stock = updateInventoryDto.stock;
    }
    if (typeof updateInventoryDto.sold === 'number') {
      inventory.sold = updateInventoryDto.sold;
    }

    return this.inventoryRepo.save(inventory);
  }

  async remove(id: number) {
    const result = await this.inventoryRepo.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException('Inventory not found');
    }
    return { deleted: true, id };
  }

  // InventoryService: getAnalyticsSummary()
  async getAnalyticsSummary() {
    const totalItems = await this.inventoryRepo.count();

    const invAgg = await this.inventoryRepo
      .createQueryBuilder('inv')
      .leftJoin('inv.product', 'prod')
      .select('COALESCE(SUM(inv.stock), 0)', 'totalStock')
      .addSelect('COALESCE(SUM(inv.sold), 0)', 'totalSold')
      .addSelect(
        'COALESCE(SUM(inv.stock * COALESCE(prod.discountPrice, prod.price)), 0)',
        'totalStockValue',
      )
      .addSelect('COALESCE(SUM(inv.totalIncome), 0)', 'inventoryRecordedIncome')
      .getRawOne();

    const revenueAgg = await this.ordersitemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.order', 'ord')
      .select('COALESCE(SUM(oi.totalPrice), 0)', 'totalRevenue')
      .where('ord.isPaid = :paid', { paid: true })
      .getRawOne();

    const lowStockCount = await this.inventoryRepo
      .createQueryBuilder('inv')
      .where('inv.isLowStock = :low', { low: true })
      .orWhere('inv.stock <= :threshold', { threshold: 5 })
      .getCount();

    return {
      totalItems,
      totalStock: Number(invAgg?.totalStock ?? 0),
      totalSold: Number(invAgg?.totalSold ?? 0),
      totalStockValue: Number(invAgg?.totalStockValue ?? 0),
      inventoryRecordedIncome: Number(invAgg?.inventoryRecordedIncome ?? 0),
      totalRevenuePaidOrders: Number(revenueAgg?.totalRevenue ?? 0),
      lowStockCount,
    };
  }

  // InventoryService: getLowStock()
  async getLowStock(threshold = 5) {
    return this.inventoryRepo.find({
      where: [
        { isLowStock: true },
        { stock: (threshold as unknown) as any }, // placeholder to ensure TypeORM handles below via query builder
      ],
      relations: { product: true },
      order: { stock: 'ASC' },
    });
  }

  // InventoryService: getTopSellers()
  async getTopSellers(limit = 10, from?: Date, to?: Date) {
    let qb = this.ordersitemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'prod')
      .innerJoin('oi.order', 'ord')
      .select('prod.id', 'productId')
      .addSelect('prod.name', 'productName')
      .addSelect('COALESCE(SUM(oi.quantity), 0)', 'soldQuantity')
      .addSelect('COALESCE(SUM(oi.totalPrice), 0)', 'revenue')
      .where('ord.isPaid = :paid', { paid: true });

    if (from) {
      qb = qb.andWhere('oi.createdAt >= :from', { from });
    }
    if (to) {
      qb = qb.andWhere('oi.createdAt <= :to', { to });
    }

    const rows = await qb
      .groupBy('prod.id')
      .addGroupBy('prod.name')
      .orderBy('soldQuantity', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      productId: Number(r.productId),
      productName: r.productName,
      soldQuantity: Number(r.soldQuantity),
      revenue: Number(r.revenue),
    }));
  }
}
