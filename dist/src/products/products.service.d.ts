import { Repository } from "typeorm";
import { ProductEntity } from "src/products/entities/product.entity";
import { CreateProductDto } from "src/products/dto/create-product.dto";
import { UpdateProductDto } from "src/products/dto/update-product.dto";
import { CategoryEntity } from "src/category/entities/category.entity";
import { OrdersitemEntity } from "src/ordersitem/entities/ordersitem.entity";
export declare class ProductService {
    private productRepository;
    private categoryRepository;
    private orderItemRepository;
    constructor(productRepository: Repository<ProductEntity>, categoryRepository: Repository<CategoryEntity>, orderItemRepository: Repository<OrdersitemEntity>);
    create(createDto: CreateProductDto, companyId: string): Promise<ProductEntity>;
    findAll(companyId: string, options?: {
        relations?: string[];
    }): Promise<ProductEntity[]>;
    findByCategory(companyId: string, categoryName?: string, categoryId?: number, options?: {
        relations?: string[];
    }): Promise<ProductEntity[]>;
    findOne(id: number, companyId: string, options?: {
        relations?: string[];
    }): Promise<ProductEntity>;
    update(id: number, updateDto: UpdateProductDto, companyId: string): Promise<ProductEntity>;
    softDelete(id: number, companyId: string): Promise<void>;
    toggleActive(id: number, active: boolean, companyId: string): Promise<ProductEntity>;
    findTrending(companyId: string, days?: number, limit?: number): Promise<ProductEntity[]>;
    setFlashSell(productIds: number[], flashSellStartTime: Date, flashSellEndTime: Date, flashSellPrice: number | undefined, companyId: string): Promise<ProductEntity[]>;
    removeFlashSell(productIds: number[], companyId: string): Promise<ProductEntity[]>;
    getActiveFlashSellProducts(companyId: string): Promise<ProductEntity[]>;
}
