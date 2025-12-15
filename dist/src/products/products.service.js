"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const category_entity_1 = require("../category/entities/category.entity");
const ordersitem_entity_1 = require("../ordersitem/entities/ordersitem.entity");
let ProductService = class ProductService {
    productRepository;
    categoryRepository;
    orderItemRepository;
    constructor(productRepository, categoryRepository, orderItemRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.orderItemRepository = orderItemRepository;
    }
    async create(createDto, companyId) {
        if (!companyId) {
            throw new common_1.BadRequestException("CompanyId is required");
        }
        const category = await this.categoryRepository.findOne({
            where: { id: createDto.categoryId, companyId }
        });
        if (!category)
            throw new common_1.NotFoundException("Category not found");
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
    async findAll(companyId, options) {
        const relations = options?.relations || ["category"];
        return this.productRepository.find({
            where: { deletedAt: (0, typeorm_2.IsNull)(), companyId },
            relations: relations.includes("category") ? relations : [...relations, "category"],
        });
    }
    async findByCategory(companyId, categoryName, categoryId, options) {
        let categoryIdToFilter;
        if (categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: categoryId, companyId, deletedAt: (0, typeorm_2.IsNull)() }
            });
            if (!category) {
                return [];
            }
            categoryIdToFilter = category.id;
        }
        else if (categoryName) {
            const category = await this.categoryRepository.findOne({
                where: { name: categoryName, companyId, deletedAt: (0, typeorm_2.IsNull)() }
            });
            if (!category) {
                return [];
            }
            categoryIdToFilter = category.id;
        }
        else {
            return [];
        }
        const relations = options?.relations || ["category"];
        const finalRelations = relations.includes("category") ? relations : [...relations, "category"];
        return this.productRepository.find({
            where: {
                deletedAt: (0, typeorm_2.IsNull)(),
                companyId,
                category: { id: categoryIdToFilter }
            },
            relations: finalRelations,
        });
    }
    async findOne(id, companyId, options) {
        const product = await this.productRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)(), companyId },
            relations: ["category"],
        });
        if (!product)
            throw new common_1.NotFoundException("Product not found");
        return product;
    }
    async update(id, updateDto, companyId) {
        const product = await this.findOne(id, companyId);
        if (updateDto.name)
            product.name = updateDto.name;
        if (updateDto.sku)
            product.sku = updateDto.sku;
        if (updateDto.price !== undefined)
            product.price = updateDto.price;
        if (updateDto.discountPrice !== undefined)
            product.discountPrice = updateDto.discountPrice;
        if (updateDto.isActive !== undefined)
            product.isActive = updateDto.isActive;
        if (updateDto.description !== undefined)
            product.description = updateDto.description;
        if (updateDto.images !== undefined)
            product.images = updateDto.images;
        if (updateDto.thumbnail !== undefined)
            product.thumbnail = updateDto.thumbnail;
        if (updateDto.isFlashSell !== undefined)
            product.isFlashSell = updateDto.isFlashSell;
        if (updateDto.flashSellStartTime !== undefined) {
            product.flashSellStartTime = updateDto.flashSellStartTime ? new Date(updateDto.flashSellStartTime) : undefined;
        }
        if (updateDto.flashSellEndTime !== undefined) {
            product.flashSellEndTime = updateDto.flashSellEndTime ? new Date(updateDto.flashSellEndTime) : undefined;
        }
        if (updateDto.flashSellPrice !== undefined)
            product.flashSellPrice = updateDto.flashSellPrice;
        if (updateDto.categoryId) {
            const category = await this.categoryRepository.findOne({
                where: { id: updateDto.categoryId, companyId }
            });
            if (!category)
                throw new common_1.NotFoundException("Category not found");
            product.category = category;
        }
        return this.productRepository.save(product);
    }
    async softDelete(id, companyId) {
        const product = await this.findOne(id, companyId);
        await this.productRepository.softRemove(product);
    }
    async toggleActive(id, active, companyId) {
        const product = await this.findOne(id, companyId);
        product.isActive = active;
        return this.productRepository.save(product);
    }
    async findTrending(companyId, days = 30, limit = 10) {
        try {
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - days);
            const trendingProducts = await this.orderItemRepository
                .createQueryBuilder('orderItem')
                .innerJoin('orderItem.product', 'product')
                .innerJoin('orderItem.order', 'order')
                .where('orderItem.companyId = :companyId', { companyId })
                .andWhere('order.companyId = :companyId', { companyId })
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
            const productIds = trendingProducts.map((item) => item.productId).filter(Boolean);
            if (productIds.length === 0) {
                return [];
            }
            const products = await this.productRepository.find({
                where: { id: (0, typeorm_2.In)(productIds), deletedAt: (0, typeorm_2.IsNull)(), companyId, isActive: true },
                relations: ['category'],
            });
            const productMap = new Map(products.map((p) => [p.id, p]));
            return productIds.map((id) => productMap.get(id)).filter(Boolean);
        }
        catch (error) {
            console.error('Error in findTrending:', error);
            return [];
        }
    }
    async setFlashSell(productIds, flashSellStartTime, flashSellEndTime, flashSellPrice, companyId) {
        const products = await this.productRepository.find({
            where: { id: (0, typeorm_2.In)(productIds), deletedAt: (0, typeorm_2.IsNull)(), companyId },
        });
        if (products.length !== productIds.length) {
            throw new common_1.NotFoundException("One or more products not found");
        }
        if (flashSellEndTime <= flashSellStartTime) {
            throw new Error("Flash sell end time must be after start time");
        }
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
    async removeFlashSell(productIds, companyId) {
        const products = await this.productRepository.find({
            where: { id: (0, typeorm_2.In)(productIds), deletedAt: (0, typeorm_2.IsNull)(), companyId },
        });
        if (products.length !== productIds.length) {
            throw new common_1.NotFoundException("One or more products not found");
        }
        products.forEach((product) => {
            product.isFlashSell = false;
            product.flashSellStartTime = undefined;
            product.flashSellEndTime = undefined;
            product.flashSellPrice = undefined;
        });
        return this.productRepository.save(products);
    }
    async getActiveFlashSellProducts(companyId) {
        const now = new Date();
        return this.productRepository.find({
            where: {
                isFlashSell: true,
                deletedAt: (0, typeorm_2.IsNull)(),
                companyId,
            },
            relations: ["category"],
        }).then(products => {
            return products.filter(product => {
                if (!product.flashSellStartTime || !product.flashSellEndTime) {
                    return false;
                }
                return now >= product.flashSellStartTime && now <= product.flashSellEndTime;
            });
        });
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.CategoryEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(ordersitem_entity_1.OrdersitemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductService);
//# sourceMappingURL=products.service.js.map