"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const payments_module_1 = require("../payments/payments.module");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("./entities/order.entity");
const ordersitem_entity_1 = require("../ordersitem/entities/ordersitem.entity");
const product_entity_1 = require("../products/entities/product.entity");
const inventory_entity_1 = require("../inventory/entities/inventory.entity");
const user_entity_1 = require("../users/entities/user.entity");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            payments_module_1.PaymentsModule,
            typeorm_1.TypeOrmModule.forFeature([
                order_entity_1.Order,
                ordersitem_entity_1.OrdersitemEntity,
                product_entity_1.ProductEntity,
                inventory_entity_1.InventoryEntity,
                user_entity_1.User,
            ]),
        ],
        controllers: [orders_controller_1.OrderController],
        providers: [orders_service_1.OrderService],
        exports: [orders_service_1.OrderService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map