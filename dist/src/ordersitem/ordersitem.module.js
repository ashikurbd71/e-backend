"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersitemModule = void 0;
const common_1 = require("@nestjs/common");
const ordersitem_service_1 = require("./ordersitem.service");
const ordersitem_controller_1 = require("./ordersitem.controller");
const typeorm_1 = require("@nestjs/typeorm");
const ordersitem_entity_1 = require("./entities/ordersitem.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
let OrdersitemModule = class OrdersitemModule {
};
exports.OrdersitemModule = OrdersitemModule;
exports.OrdersitemModule = OrdersitemModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ordersitem_entity_1.OrdersitemEntity, order_entity_1.Order, product_entity_1.ProductEntity])],
        controllers: [ordersitem_controller_1.OrdersitemController],
        providers: [ordersitem_service_1.OrdersitemService],
    })
], OrdersitemModule);
//# sourceMappingURL=ordersitem.module.js.map