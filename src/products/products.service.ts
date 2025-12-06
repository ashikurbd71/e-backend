import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository, In } from "typeorm";
import { ProductEntity } from "src/products/entities/product.entity";
import { CreateProductDto } from "src/products/dto/create-product.dto";
import { UpdateProductDto } from "src/products/dto/update-product.dto";
import { FlashSellDto } from "src/products/dto/flash-sell.dto";
import { CategoryEntity } from "src/category/entities/category.entity";
import { OrdersitemEntity } from "src/ordersitem/entities/ordersitem.entity";


@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(OrdersitemEntity)
    private orderItemRepository: Repository<OrdersitemEntity>
  ) { }

  async create(createDto: CreateProductDto, companyId: string): Promise<ProductEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id: createDto.categoryId, companyId }
    });
    if (!category) throw new NotFoundException("Category not found");

    const product = this.productRepository.create({
      name: createDto.name,
      sku: createDto.sku,
      price: createDto.price,
      discountPrice: createDto.discountPrice,
      category,
      isActive: createDto.isActive ?? true,
      description: createDto.description,
      images: createDto.images,
      thumbnail: createDto.thumbnail,
      isFlashSell: createDto.isFlashSell ?? false,
      flashSellStartTime: createDto.flashSellStartTime ? new Date(createDto.flashSellStartTime) : undefined,
      flashSellEndTime: createDto.flashSellEndTime ? new Date(createDto.flashSellEndTime) : undefined,
      flashSellPrice: createDto.flashSellPrice,
      companyId,
    });

    return this.productRepository.save(product);
  }

  async findAll(companyId: string, options?: { relations?: string[] }): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { deletedAt: IsNull(), companyId },
      relations: ["category"],
    });
  }

  async findOne(id: number, companyId: string, options?: { relations?: string[] }): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: IsNull(), companyId },
      relations: ["category"],
    });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async update(id: number, updateDto: UpdateProductDto, companyId: string): Promise<ProductEntity> {
    const product = await this.findOne(id, companyId);

    if (updateDto.name) product.name = updateDto.name;
    if (updateDto.sku) product.sku = updateDto.sku;
    if (updateDto.price !== undefined) product.price = updateDto.price;
    if (updateDto.discountPrice !== undefined) product.discountPrice = updateDto.discountPrice;
    if (updateDto.isActive !== undefined) product.isActive = updateDto.isActive;

    if (updateDto.description !== undefined) product.description = updateDto.description;
    if (updateDto.images !== undefined) product.images = updateDto.images;
    if (updateDto.thumbnail !== undefined) product.thumbnail = updateDto.thumbnail;

    if (updateDto.isFlashSell !== undefined) product.isFlashSell = updateDto.isFlashSell;
    if (updateDto.flashSellStartTime !== undefined) {
      product.flashSellStartTime = updateDto.flashSellStartTime ? new Date(updateDto.flashSellStartTime) : undefined;
    }
    if (updateDto.flashSellEndTime !== undefined) {
      product.flashSellEndTime = updateDto.flashSellEndTime ? new Date(updateDto.flashSellEndTime) : undefined;
    }
    if (updateDto.flashSellPrice !== undefined) product.flashSellPrice = updateDto.flashSellPrice;

    if (updateDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateDto.categoryId, companyId }
      });
      if (!category) throw new NotFoundException("Category not found");
      product.category = category;
    }

    return this.productRepository.save(product);
  }

  async softDelete(id: number, companyId: string): Promise<void> {
    const product = await this.findOne(id, companyId);
    await this.productRepository.softRemove(product);
  }

  async toggleActive(id: number, active: boolean, companyId: string): Promise<ProductEntity> {
    const product = await this.findOne(id, companyId);
    product.isActive = active;
    return this.productRepository.save(product);
  }

  async findTrending(companyId: string, days: number = 30, limit: number = 10): Promise<ProductEntity[]> {
    // Calculate the date threshold (e.g., 30 days ago)
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get order items from recent orders, grouped by product
    const trendingProducts = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.product', 'product')
      .innerJoin('orderItem.order', 'order')
      .where('orderItem.companyId = :companyId', { companyId })
      .andWhere('orderItem.deletedAt IS NULL')
      .andWhere('order.deletedAt IS NULL')
      .andWhere('order.createdAt >= :dateThreshold', { dateThreshold })
      .andWhere('product.deletedAt IS NULL')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .select('product.id', 'productId')
      .addSelect('SUM(orderItem.quantity)', 'totalSold')
      .groupBy('product.id')
      .orderBy('totalSold', 'DESC')
      .limit(limit)
      .getRawMany();

    // Extract product IDs
    const productIds = trendingProducts.map((item) => item.productId);

    if (productIds.length === 0) {
      return [];
    }

    // Fetch full product details with category
    const products = await this.productRepository.find({
      where: { id: In(productIds), deletedAt: IsNull(), companyId, isActive: true },
      relations: ['category'],
    });

    // Sort products by the order from trendingProducts query
    const productMap = new Map(products.map((p) => [p.id, p]));
    return productIds.map((id) => productMap.get(id)).filter(Boolean) as ProductEntity[];
  }

  async setFlashSell(
    productIds: number[],
    flashSellStartTime: Date,
    flashSellEndTime: Date,
    flashSellPrice: number | undefined,
    companyId: string
  ): Promise<ProductEntity[]> {
    // Validate that all products exist and belong to the company
    const products = await this.productRepository.find({
      where: { id: In(productIds), deletedAt: IsNull(), companyId },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException("One or more products not found");
    }

    // Validate time range
    if (flashSellEndTime <= flashSellStartTime) {
      throw new Error("Flash sell end time must be after start time");
    }

    // Update all products with flash sell information
    products.forEach((product) => {
      product.isFlashSell = true;
      product.flashSellStartTime = flashSellStartTime;
      product.flashSellEndTime = flashSellEndTime;
      if (flashSellPrice !== undefined) {
        product.flashSellPrice = flashSellPrice;
      }
    });

    return this.productRepository.save(products);
  }

  async removeFlashSell(productIds: number[], companyId: string): Promise<ProductEntity[]> {
    const products = await this.productRepository.find({
      where: { id: In(productIds), deletedAt: IsNull(), companyId },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException("One or more products not found");
    }

    products.forEach((product) => {
      product.isFlashSell = false;
      product.flashSellStartTime = undefined;
      product.flashSellEndTime = undefined;
      product.flashSellPrice = undefined;
    });

    return this.productRepository.save(products);
  }

  async getActiveFlashSellProducts(companyId: string): Promise<ProductEntity[]> {
    const now = new Date();
    return this.productRepository.find({
      where: {
        isFlashSell: true,
        deletedAt: IsNull(),
        companyId,
      },
      relations: ["category"],
    }).then(products => {
      // Filter products that are currently within the flash sell time range
      return products.filter(product => {
        if (!product.flashSellStartTime || !product.flashSellEndTime) {
          return false;
        }
        return now >= product.flashSellStartTime && now <= product.flashSellEndTime;
      });
    });
  }
}
