import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { ProductEntity } from "src/products/entities/product.entity";
import { CreateProductDto } from "src/products/dto/create-product.dto";
import { UpdateProductDto } from "src/products/dto/update-product.dto";
import { CategoryEntity } from "src/category/entities/category.entity";


@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>
  ) {}

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
}
