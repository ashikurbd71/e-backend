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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const flash_sell_dto_1 = require("./dto/flash-sell.dto");
const company_id_decorator_1 = require("../common/decorators/company-id.decorator");
let ProductController = class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    async create(createDto, companyIdFromQuery, companyIdFromToken) {
        const companyId = companyIdFromQuery || companyIdFromToken;
        if (!companyId) {
            throw new common_1.BadRequestException('companyId is required');
        }
        const product = await this.productService.create(createDto, companyId);
        return { statusCode: common_1.HttpStatus.CREATED, message: 'Product created', data: product };
    }
    async findAll(companyId) {
        const products = await this.productService.findAll(companyId);
        return { statusCode: common_1.HttpStatus.OK, data: products };
    }
    async findByCategory(companyId, categories, categoryId) {
        const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;
        const products = await this.productService.findByCategory(companyId, categories, parsedCategoryId);
        return { statusCode: common_1.HttpStatus.OK, data: products };
    }
    async findTrending(companyId, days, limit) {
        if (!companyId) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: 'companyId is required', data: [] };
        }
        const daysParam = days ? parseInt(days, 10) : 30;
        const limitParam = limit ? parseInt(limit, 10) : 10;
        const products = await this.productService.findTrending(companyId, daysParam, limitParam);
        return { statusCode: common_1.HttpStatus.OK, data: products };
    }
    async findOne(id, companyId) {
        const product = await this.productService.findOne(id, companyId);
        return { statusCode: common_1.HttpStatus.OK, data: product };
    }
    async update(id, updateDto, companyIdFromQuery, companyIdFromToken) {
        const companyId = companyIdFromQuery || companyIdFromToken;
        if (!companyId)
            throw new common_1.BadRequestException('companyId is required');
        const product = await this.productService.update(id, updateDto, companyId);
        return { statusCode: common_1.HttpStatus.OK, message: "Product updated", data: product };
    }
    async softDelete(id, companyId) {
        await this.productService.softDelete(id, companyId);
        return { statusCode: common_1.HttpStatus.OK, message: "Product soft delet" };
    }
    async toggleActive(id, active, companyId) {
        const isActive = active === "true";
        const product = await this.productService.toggleActive(id, isActive, companyId);
        return { statusCode: common_1.HttpStatus.OK, message: `Product ${isActive ? "activated" : "disabled"}`, data: product };
    }
    async setFlashSell(flashSellDto, companyId) {
        const startTime = new Date(flashSellDto.flashSellStartTime);
        const endTime = new Date(flashSellDto.flashSellEndTime);
        const products = await this.productService.setFlashSell(flashSellDto.productIds, startTime, endTime, flashSellDto.flashSellPrice, companyId);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Flash sell set for selected products",
            data: products,
        };
    }
    async removeFlashSell(body, companyId) {
        const products = await this.productService.removeFlashSell(body.productIds, companyId);
        return {
            statusCode: common_1.HttpStatus.OK,
            message: "Flash sell removed from selected products",
            data: products,
        };
    }
    async getActiveFlashSellProducts(companyId) {
        const products = await this.productService.getActiveFlashSellProducts(companyId);
        return {
            statusCode: common_1.HttpStatus.OK,
            data: products,
        };
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, company_id_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('category'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('categories')),
    __param(2, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findByCategory", null);
__decorate([
    (0, common_1.Get)('trending'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('days')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findTrending", null);
__decorate([
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, company_id_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('companyId')),
    __param(3, (0, company_id_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_product_dto_1.UpdateProductDto, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, company_id_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Patch)(":id/toggle-active"),
    __param(0, (0, common_1.Param)("id", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("active")),
    __param(2, (0, company_id_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "toggleActive", null);
__decorate([
    (0, common_1.Post)("flash-sell"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, company_id_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [flash_sell_dto_1.FlashSellDto, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "setFlashSell", null);
__decorate([
    (0, common_1.Delete)("flash-sell"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, company_id_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "removeFlashSell", null);
__decorate([
    (0, common_1.Get)("flash-sell/active"),
    __param(0, (0, company_id_decorator_1.CompanyId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getActiveFlashSellProducts", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductService])
], ProductController);
//# sourceMappingURL=products.controller.js.map