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
exports.OrdersitemService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ordersitem_entity_1 = require("./entities/ordersitem.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
let OrdersitemService = class OrdersitemService {
    orderItemRepo;
    orderRepo;
    productRepo;
    constructor(orderItemRepo, orderRepo, productRepo) {
        this.orderItemRepo = orderItemRepo;
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }
    async create(dto) {
        const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const product = await this.productRepo.findOne({ where: { id: dto.productId } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
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
    async findAll() {
        return this.orderItemRepo.find({
            relations: { order: true, product: true },
            order: { id: 'DESC' },
        });
    }
    async findOne(id) {
        const item = await this.orderItemRepo.findOne({
            where: { id },
            relations: { order: true, product: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Ordersitem not found');
        return item;
    }
    async update(id, dto) {
        const item = await this.findOne(id);
        if (dto.quantity !== undefined)
            item.quantity = dto.quantity;
        if (dto.unitPrice !== undefined)
            item.unitPrice = dto.unitPrice;
        item.totalPrice = Number(item.unitPrice) * Number(item.quantity);
        if (dto.orderId) {
            const order = await this.orderRepo.findOne({ where: { id: dto.orderId } });
            if (!order)
                throw new common_1.NotFoundException('Order not found');
            item.order = order;
        }
        if (dto.productId) {
            const product = await this.productRepo.findOne({ where: { id: dto.productId } });
            if (!product)
                throw new common_1.NotFoundException('Product not found');
            item.product = product;
        }
        return this.orderItemRepo.save(item);
    }
    async remove(id) {
        const result = await this.orderItemRepo.softDelete(id);
        if (!result.affected)
            throw new common_1.NotFoundException('Ordersitem not found');
    }
};
exports.OrdersitemService = OrdersitemService;
exports.OrdersitemService = OrdersitemService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ordersitem_entity_1.OrdersitemEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersitemService);
//# sourceMappingURL=ordersitem.service.js.map