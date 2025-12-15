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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_entity_1 = require("./entities/inventory.entity");
const product_entity_1 = require("../products/entities/product.entity");
const ordersitem_entity_1 = require("../ordersitem/entities/ordersitem.entity");
let InventoryService = class InventoryService {
    inventoryRepo;
    productRepo;
    ordersitemRepo;
    constructor(inventoryRepo, productRepo, ordersitemRepo) {
        this.inventoryRepo = inventoryRepo;
        this.productRepo = productRepo;
        this.ordersitemRepo = ordersitemRepo;
    }
    async create(createInventoryDto, companyId) {
        if (!companyId) {
            throw new common_1.NotFoundException('CompanyId is required');
        }
        const product = await this.productRepo.findOne({
            where: { id: createInventoryDto.productId, companyId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const inventory = this.inventoryRepo.create({
            product,
            stock: createInventoryDto.stock,
            sold: createInventoryDto.sold ?? 0,
            companyId: companyId,
        });
        return this.inventoryRepo.save(inventory);
    }
    async findAll(companyId) {
        return this.inventoryRepo.find({
            where: { companyId },
            relations: { product: true },
            order: { id: 'DESC' },
        });
    }
    async findOne(id, companyId) {
        const inventory = await this.inventoryRepo.findOne({
            where: { id, companyId },
            relations: { product: true },
        });
        if (!inventory) {
            throw new common_1.NotFoundException('Inventory not found');
        }
        return inventory;
    }
    async update(id, updateInventoryDto, companyId) {
        const inventory = await this.findOne(id, companyId);
        if (typeof updateInventoryDto.productId === 'number') {
            const product = await this.productRepo.findOne({
                where: { id: updateInventoryDto.productId, companyId },
            });
            if (!product) {
                throw new common_1.NotFoundException('Product not found');
            }
            inventory.product = product;
        }
        if (typeof updateInventoryDto.newStock === 'number') {
            inventory.stock = Number(inventory.stock || 0) + Number(updateInventoryDto.newStock);
        }
        if (typeof updateInventoryDto.stock === 'number') {
            inventory.stock = updateInventoryDto.stock;
        }
        if (typeof updateInventoryDto.sold === 'number') {
            inventory.sold = updateInventoryDto.sold;
        }
        inventory.companyId = companyId;
        return this.inventoryRepo.save(inventory);
    }
    async remove(id, companyId) {
        const inventory = await this.findOne(id, companyId);
        const result = await this.inventoryRepo.softDelete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException('Inventory not found');
        }
        return { deleted: true, id };
    }
    async getAnalyticsSummary(companyId) {
        const totalItems = await this.inventoryRepo.count({
            where: { companyId },
        });
        const invAgg = await this.inventoryRepo
            .createQueryBuilder('inv')
            .leftJoin('inv.product', 'prod')
            .select('COALESCE(SUM(inv.stock), 0)', 'totalStock')
            .addSelect('COALESCE(SUM(inv.sold), 0)', 'totalSold')
            .addSelect('COALESCE(SUM(inv.stock * COALESCE(prod.discountPrice, prod.price)), 0)', 'totalStockValue')
            .addSelect('COALESCE(SUM(inv.totalIncome), 0)', 'inventoryRecordedIncome')
            .where('inv.companyId = :companyId', { companyId })
            .getRawOne();
        const revenueAgg = await this.ordersitemRepo
            .createQueryBuilder('oi')
            .innerJoin('oi.order', 'ord')
            .select('COALESCE(SUM(oi.totalPrice), 0)', 'totalRevenue')
            .where('ord.isPaid = :paid', { paid: true })
            .andWhere('ord.companyId = :companyId', { companyId })
            .getRawOne();
        const lowStockCount = await this.inventoryRepo
            .createQueryBuilder('inv')
            .where('inv.companyId = :companyId', { companyId })
            .andWhere('(inv.isLowStock = :low OR inv.stock <= :threshold)', { low: true, threshold: 5 })
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
    async getLowStock(threshold = 5, companyId) {
        const whereConditions = [];
        if (companyId) {
            whereConditions.push({ companyId, isLowStock: true });
            whereConditions.push({ companyId, stock: threshold });
        }
        else {
            whereConditions.push({ isLowStock: true });
            whereConditions.push({ stock: threshold });
        }
        return this.inventoryRepo.find({
            where: whereConditions,
            relations: { product: true },
            order: { stock: 'ASC' },
        });
    }
    async getTopSellers(limit = 10, from, to, companyId) {
        let qb = this.ordersitemRepo
            .createQueryBuilder('oi')
            .innerJoin('oi.product', 'prod')
            .innerJoin('oi.order', 'ord')
            .select('prod.id', 'productId')
            .addSelect('prod.name', 'productName')
            .addSelect('COALESCE(SUM(oi.quantity), 0)', 'soldQuantity')
            .addSelect('COALESCE(SUM(oi.totalPrice), 0)', 'revenue')
            .where('ord.isPaid = :paid', { paid: true });
        if (companyId) {
            qb = qb.andWhere('ord.companyId = :companyId', { companyId });
        }
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
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_entity_1.InventoryEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(ordersitem_entity_1.OrdersitemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map