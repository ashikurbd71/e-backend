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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
const inventory_entity_1 = require("../inventory/entities/inventory.entity");
const user_entity_1 = require("../users/entities/user.entity");
const ordersitem_entity_1 = require("../ordersitem/entities/ordersitem.entity");
const payments_service_1 = require("../payments/payments.service");
const common_2 = require("@nestjs/common");
let OrderService = class OrderService {
    orderRepo;
    orderItemRepo;
    productRepo;
    inventoryRepo;
    userRepo;
    dataSource;
    paymentsService;
    mailer;
    constructor(orderRepo, orderItemRepo, productRepo, inventoryRepo, userRepo, dataSource, paymentsService, mailer) {
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.productRepo = productRepo;
        this.inventoryRepo = inventoryRepo;
        this.userRepo = userRepo;
        this.dataSource = dataSource;
        this.paymentsService = paymentsService;
        this.mailer = mailer;
    }
    async create(createDto, companyId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let customer = null;
            if (typeof createDto.customerId === "number") {
                customer = await this.userRepo.findOneBy({ id: createDto.customerId, companyId });
                if (!customer)
                    throw new common_1.NotFoundException("Customer not found");
            }
            const order = new order_entity_1.Order();
            order.customer = customer ?? undefined;
            order.customerName = customer?.name ?? createDto.customerName ?? "";
            order.customerPhone = customer?.phone ?? createDto.customerPhone ?? "";
            order.customerAddress = createDto.shippingAddress ?? customer?.address ?? createDto.customerAddress ?? "";
            order.status = "pending";
            order.paymentMethod = createDto.paymentMethod ?? "DIRECT";
            order.deliveryType = createDto.deliveryType ?? "INSIDEDHAKA";
            order.companyId = companyId;
            const items = [];
            let total = 0;
            for (const it of createDto.items) {
                const product = await this.productRepo.findOne({
                    where: {
                        id: it.productId,
                        companyId,
                        deletedAt: (0, typeorm_2.IsNull)()
                    }
                });
                if (!product)
                    throw new common_1.NotFoundException(`Product ${it.productId} not found`);
                const inventory = await this.inventoryRepo.findOne({
                    where: { product: { id: product.id }, companyId }
                });
                if (inventory && inventory.stock < it.quantity) {
                    throw new common_1.BadRequestException(`Insufficient stock for product ${product.id}. Available: ${inventory.stock}, Requested: ${it.quantity}`);
                }
                const finalPrice = product.discountPrice || product.price;
                const oi = new ordersitem_entity_1.OrdersitemEntity();
                oi.order = order;
                oi.product = product;
                oi.quantity = it.quantity;
                oi.unitPrice = +finalPrice;
                oi.totalPrice = +finalPrice * it.quantity;
                oi.companyId = companyId;
                total += oi.totalPrice;
                items.push(oi);
            }
            order.items = items;
            order.totalAmount = total;
            const savedOrder = await queryRunner.manager.save(order);
            await queryRunner.commitTransaction();
            const fullOrder = await this.orderRepo.findOne({
                where: { id: savedOrder.id, companyId },
                relations: ["items", "items.product", "customer"],
            });
            const customerAddress = fullOrder?.customerAddress ?? "";
            let payment = null;
            if (fullOrder.paymentMethod === "DIRECT") {
                payment = await this.paymentsService.initiateSslPayment({
                    amount: fullOrder ? +fullOrder.totalAmount : 0,
                    currency: "BDT",
                    orderId: fullOrder.id.toString(),
                    customerName: fullOrder.customer?.name ?? fullOrder.customerName ?? "",
                    customerEmail: fullOrder.customer?.email ?? "",
                    customerPhone: fullOrder.customer?.phone ?? fullOrder.customerPhone ?? "",
                    customerAddress,
                });
            }
            return { order: fullOrder, payment };
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(companyId) {
        return this.orderRepo.find({
            where: { companyId },
            relations: ["items", "items.product", "customer"]
        });
    }
    async findByCustomerId(customerId, companyId) {
        return this.orderRepo.find({
            where: {
                customer: { id: customerId },
                companyId
            },
            relations: ["items", "items.product", "customer"],
            order: { createdAt: 'DESC' }
        });
    }
    async findOne(id, companyId) {
        const o = await this.orderRepo.findOne({
            where: { id, companyId },
            relations: ["items", "items.product", "customer"]
        });
        if (!o)
            throw new common_1.NotFoundException("Order not found");
        return o;
    }
    async completeOrder(id, companyId, paymentRef) {
        const order = await this.findOne(id, companyId);
        if (!order)
            throw new common_1.NotFoundException("Order not found");
        if (order.status === "cancelled")
            throw new common_1.BadRequestException("Order cancelled");
        order.isPaid = true;
        order.paymentReference = paymentRef ?? undefined;
        order.status = "paid";
        await this.orderRepo.save(order);
        for (const it of order.items) {
            const inv = await this.inventoryRepo.findOne({
                where: { product: { id: it.product.id }, companyId },
                relations: ["product"]
            });
            if (inv) {
                inv.sold += it.quantity;
                await this.inventoryRepo.save(inv);
            }
        }
        return this.findOne(id, companyId);
    }
    async cancelOrder(id, companyId, userId) {
        const order = await this.findOne(id, companyId);
        if (userId && order.customer?.id !== userId) {
            throw new common_1.BadRequestException("You can only cancel your own orders");
        }
        if (order.status === "cancelled")
            throw new common_1.BadRequestException("Already cancelled");
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        if (hoursDiff > 24) {
            throw new common_1.BadRequestException("Orders can only be cancelled within 24 hours of placement");
        }
        order.status = "cancelled";
        await this.orderRepo.save(order);
        for (const it of order.items) {
            const inv = await this.inventoryRepo.findOne({
                where: { product: { id: it.product.id }, companyId }
            });
            if (inv) {
                inv.stock += it.quantity;
                await this.inventoryRepo.save(inv);
            }
        }
        if (order.customer?.id) {
            const user = await this.userRepo.findOne({
                where: { id: order.customer.id, companyId }
            });
            if (user) {
                user.cancelledOrdersCount = (user.cancelledOrdersCount ?? 0) + 1;
                await this.userRepo.save(user);
            }
        }
        return { message: "Order cancelled" };
    }
    async deliverOrder(id, companyId) {
        const order = await this.findOne(id, companyId);
        if (!order)
            throw new common_1.NotFoundException("Order not found");
        if (order.status === "cancelled")
            throw new common_1.BadRequestException("Order cancelled");
        order.status = "delivered";
        await this.orderRepo.save(order);
        const LOW_STOCK_THRESHOLD = +(process.env.LOW_STOCK_THRESHOLD ?? 5);
        for (const it of order.items) {
            const inv = await this.inventoryRepo.findOne({
                where: { product: { id: it.product.id }, companyId },
                relations: ["product"]
            });
            if (!inv)
                continue;
            inv.stock -= it.quantity;
            if (inv.stock < 0)
                inv.stock = 0;
            inv.sold += it.quantity;
            const itemIncome = Number(it.unitPrice) * Number(it.quantity);
            inv.totalIncome = Number(inv.totalIncome || 0) + itemIncome;
            inv.isLowStock = inv.stock <= LOW_STOCK_THRESHOLD;
            await this.inventoryRepo.save(inv);
            if (inv.isLowStock) {
                await this.sendLowStockEmail(inv);
            }
        }
        if (order.customer?.id) {
            const user = await this.userRepo.findOne({
                where: { id: order.customer.id, companyId }
            });
            if (user) {
                user.successfulOrdersCount = (user.successfulOrdersCount ?? 0) + 1;
                await this.userRepo.save(user);
            }
        }
        return this.findOne(id, companyId);
    }
    async shipOrder(id, companyId, trackingId, provider) {
        const order = await this.findOne(id, companyId);
        if (!order)
            throw new common_1.NotFoundException("Order not found");
        if (order.status === "cancelled")
            throw new common_1.BadRequestException("Order cancelled");
        const wasAlreadyShipped = order.status === "shipped";
        order.status = "shipped";
        if (trackingId)
            order.shippingTrackingId = trackingId;
        if (provider)
            order.shippingProvider = provider;
        await this.orderRepo.save(order);
        if (!wasAlreadyShipped) {
            const LOW_STOCK_THRESHOLD = +(process.env.LOW_STOCK_THRESHOLD ?? 5);
            for (const it of order.items) {
                const inv = await this.inventoryRepo.findOne({
                    where: { product: { id: it.product.id }, companyId },
                    relations: ["product"]
                });
                if (!inv)
                    continue;
                inv.stock = Math.max(0, inv.stock - it.quantity);
                inv.sold += it.quantity;
                const itemIncome = Number(it.unitPrice) * Number(it.quantity);
                inv.totalIncome = Number(inv.totalIncome || 0) + itemIncome;
                inv.isLowStock = inv.stock <= LOW_STOCK_THRESHOLD;
                await this.inventoryRepo.save(inv);
                if (inv.isLowStock) {
                    await this.sendLowStockEmail(inv);
                }
            }
        }
        return this.findOne(id, companyId);
    }
    async refundOrder(id, companyId) {
        const order = await this.findOne(id, companyId);
        if (!order)
            throw new common_1.NotFoundException("Order not found");
        if (order.status === "cancelled")
            throw new common_1.BadRequestException("Order cancelled");
        order.status = "refunded";
        order.isPaid = false;
        await this.orderRepo.save(order);
        for (const it of order.items) {
            const inv = await this.inventoryRepo.findOne({
                where: { product: { id: it.product.id }, companyId },
                relations: ["product"]
            });
            if (!inv)
                continue;
            inv.stock += it.quantity;
            inv.sold = Math.max(0, inv.sold - it.quantity);
            const itemIncome = Number(it.unitPrice) * Number(it.quantity);
            inv.totalIncome = Math.max(0, Number(inv.totalIncome || 0) - itemIncome);
            await this.inventoryRepo.save(inv);
        }
        return this.findOne(id, companyId);
    }
    async sendLowStockEmail(inv) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL;
            if (!adminEmail) {
                console.warn("ADMIN_EMAIL is not set. Low stock alert:", {
                    productId: inv.product?.id,
                    sku: inv.product?.sku,
                    stock: inv.stock,
                });
                return;
            }
            const info = await this.mailer.sendMail({
                from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
                to: adminEmail,
                subject: `Low Stock Alert: ${inv.product?.name ?? "Product"} (${inv.product?.sku ?? ""})`,
                text: `Product ${inv.product?.name} (${inv.product?.sku}) is low on stock.\nCurrent stock: ${inv.stock}\nThreshold: ${process.env.LOW_STOCK_THRESHOLD ?? 5}`,
            });
            if (process.env.NODE_ENV !== "production") {
                console.log("Low stock email sent:", info?.id);
            }
        }
        catch (e) {
            console.error("Failed to send low stock email:", e);
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(ordersitem_entity_1.OrdersitemEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(inventory_entity_1.InventoryEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(7, (0, common_2.Inject)('MAILER_TRANSPORT')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        payments_service_1.PaymentsService, Object])
], OrderService);
//# sourceMappingURL=orders.service.js.map