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
exports.OrdersitemController = void 0;
const common_1 = require("@nestjs/common");
const ordersitem_service_1 = require("./ordersitem.service");
const create_ordersitem_dto_1 = require("./dto/create-ordersitem.dto");
const update_ordersitem_dto_1 = require("./dto/update-ordersitem.dto");
let OrdersitemController = class OrdersitemController {
    ordersitemService;
    constructor(ordersitemService) {
        this.ordersitemService = ordersitemService;
    }
    async create(createOrdersitemDto) {
        const item = await this.ordersitemService.create(createOrdersitemDto);
        return { statusCode: common_1.HttpStatus.CREATED, message: 'Ordersitem created', data: item };
    }
    async findAll() {
        const items = await this.ordersitemService.findAll();
        return { statusCode: common_1.HttpStatus.OK, data: items };
    }
    async findOne(id) {
        const item = await this.ordersitemService.findOne(+id);
        return { statusCode: common_1.HttpStatus.OK, data: item };
    }
    async update(id, updateOrdersitemDto) {
        const updated = await this.ordersitemService.update(+id, updateOrdersitemDto);
        return { statusCode: common_1.HttpStatus.OK, message: 'Ordersitem updated', data: updated };
    }
    async remove(id) {
        await this.ordersitemService.remove(+id);
        return { statusCode: common_1.HttpStatus.OK, message: 'Ordersitem removed' };
    }
};
exports.OrdersitemController = OrdersitemController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ordersitem_dto_1.CreateOrdersitemDto]),
    __metadata("design:returntype", Promise)
], OrdersitemController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersitemController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersitemController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ordersitem_dto_1.UpdateOrdersitemDto]),
    __metadata("design:returntype", Promise)
], OrdersitemController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersitemController.prototype, "remove", null);
exports.OrdersitemController = OrdersitemController = __decorate([
    (0, common_1.Controller)('ordersitem'),
    __metadata("design:paramtypes", [ordersitem_service_1.OrdersitemService])
], OrdersitemController);
//# sourceMappingURL=ordersitem.controller.js.map