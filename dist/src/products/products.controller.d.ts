import { HttpStatus } from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FlashSellDto } from './dto/flash-sell.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    create(createDto: CreateProductDto, companyIdFromQuery?: string, companyIdFromToken?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/product.entity").ProductEntity;
    }>;
    findAll(companyId: string): Promise<{
        statusCode: HttpStatus;
        data: import("./entities/product.entity").ProductEntity[];
    }>;
    findByCategory(companyId: string, categories?: string, categoryId?: string): Promise<{
        statusCode: HttpStatus;
        data: import("./entities/product.entity").ProductEntity[];
    }>;
    findTrending(companyId: string, days?: string, limit?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: never[];
    } | {
        statusCode: HttpStatus;
        data: import("./entities/product.entity").ProductEntity[];
        message?: undefined;
    }>;
    findOne(id: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        data: import("./entities/product.entity").ProductEntity;
    }>;
    update(id: number, updateDto: UpdateProductDto, companyIdFromQuery?: string, companyIdFromToken?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/product.entity").ProductEntity;
    }>;
    softDelete(id: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
    toggleActive(id: number, active: string, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/product.entity").ProductEntity;
    }>;
    setFlashSell(flashSellDto: FlashSellDto, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/product.entity").ProductEntity[];
    }>;
    removeFlashSell(body: {
        productIds: number[];
    }, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/product.entity").ProductEntity[];
    }>;
    getActiveFlashSellProducts(companyId: string): Promise<{
        statusCode: HttpStatus;
        data: import("./entities/product.entity").ProductEntity[];
    }>;
}
