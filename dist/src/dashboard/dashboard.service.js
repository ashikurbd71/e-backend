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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const inventory_entity_1 = require("../inventory/entities/inventory.entity");
const ordersitem_entity_1 = require("../ordersitem/entities/ordersitem.entity");
let DashboardService = class DashboardService {
    orderRepo;
    userRepo;
    productRepo;
    inventoryRepo;
    orderItemRepo;
    constructor(orderRepo, userRepo, productRepo, inventoryRepo, orderItemRepo) {
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.inventoryRepo = inventoryRepo;
        this.orderItemRepo = orderItemRepo;
    }
    async getDashboardData(companyId) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const allOrders = await this.orderRepo.find({
            where: { companyId },
            relations: ['items', 'items.product', 'customer'],
        });
        const recentOrders = allOrders.filter((order) => order.createdAt >= thirtyDaysAgo);
        const stats = await this.calculateStats(companyId, allOrders, recentOrders);
        const lineChartData = await this.getLineChartData(companyId, sevenDaysAgo, now);
        const radialChartData = this.getRadialChartData(allOrders);
        const recentOrdersList = await this.getRecentOrders(companyId, 10);
        const bestSellers = await this.getBestSellingProducts(companyId, 3);
        const topCustomers = await this.getTopCustomers(companyId, 3);
        return {
            stats,
            lineChartData,
            radialChartData,
            recentOrders: recentOrdersList,
            bestSellers,
            topCustomers,
        };
    }
    async calculateStats(companyId, allOrders, recentOrders) {
        const paidOrders = allOrders.filter((order) => order.isPaid || order.status === 'paid' || order.status === 'delivered');
        const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const previousPeriodOrders = allOrders.filter((order) => order.createdAt >= sixtyDaysAgo && order.createdAt < thirtyDaysAgo);
        const previousRevenue = previousPeriodOrders
            .filter((order) => order.isPaid || order.status === 'paid' || order.status === 'delivered')
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
        const revenueDelta = previousRevenue > 0
            ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
            : '0.0';
        const revenueDeltaSign = totalRevenue >= previousRevenue ? '+' : '';
        const newCustomersCount = await this.userRepo.count({
            where: {
                companyId,
                createdAt: (0, typeorm_2.Between)(thirtyDaysAgo, now),
            },
        });
        const previousNewCustomers = await this.userRepo.count({
            where: {
                companyId,
                createdAt: (0, typeorm_2.Between)(sixtyDaysAgo, thirtyDaysAgo),
            },
        });
        const customersDelta = previousNewCustomers > 0
            ? (((newCustomersCount - previousNewCustomers) /
                previousNewCustomers) *
                100).toFixed(1)
            : '0.0';
        const customersDeltaSign = newCustomersCount >= previousNewCustomers ? '+' : '';
        const customerOrderCounts = new Map();
        recentOrders.forEach((order) => {
            if (order.customer?.id) {
                customerOrderCounts.set(order.customer.id, (customerOrderCounts.get(order.customer.id) || 0) + 1);
            }
        });
        const repeatCustomers = Array.from(customerOrderCounts.values()).filter((count) => count > 1).length;
        const totalCustomersWithOrders = customerOrderCounts.size;
        const repeatPurchaseRate = totalCustomersWithOrders > 0
            ? ((repeatCustomers / totalCustomersWithOrders) * 100).toFixed(2)
            : '0.00';
        const previousPeriodCustomerCounts = new Map();
        previousPeriodOrders.forEach((order) => {
            if (order.customer?.id) {
                previousPeriodCustomerCounts.set(order.customer.id, (previousPeriodCustomerCounts.get(order.customer.id) || 0) + 1);
            }
        });
        const previousRepeatCustomers = Array.from(previousPeriodCustomerCounts.values()).filter((count) => count > 1).length;
        const previousTotalCustomers = previousPeriodCustomerCounts.size;
        const previousRepeatRate = previousTotalCustomers > 0
            ? ((previousRepeatCustomers / previousTotalCustomers) * 100).toFixed(2)
            : '0.00';
        const repeatDelta = previousRepeatRate !== '0.00'
            ? (((parseFloat(repeatPurchaseRate) - parseFloat(previousRepeatRate)) /
                parseFloat(previousRepeatRate)) *
                100).toFixed(1)
            : '0.0';
        const repeatDeltaSign = parseFloat(repeatPurchaseRate) >= parseFloat(previousRepeatRate) ? '+' : '';
        const avgOrderValue = paidOrders.length > 0
            ? totalRevenue / paidOrders.length
            : 0;
        const previousAvgOrderValue = previousPeriodOrders.length > 0
            ? previousPeriodOrders
                .filter((order) => order.isPaid ||
                order.status === 'paid' ||
                order.status === 'delivered')
                .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0) /
                previousPeriodOrders.filter((order) => order.isPaid ||
                    order.status === 'paid' ||
                    order.status === 'delivered').length
            : 0;
        const avgOrderDelta = previousAvgOrderValue > 0
            ? (((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) *
                100).toFixed(1)
            : '0.0';
        const avgOrderDeltaSign = avgOrderValue >= previousAvgOrderValue ? '+' : '';
        return [
            {
                title: 'Ecommerce Revenue',
                value: `$${totalRevenue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`,
                delta: `${revenueDeltaSign}${revenueDelta}%`,
                tone: parseFloat(revenueDelta) >= 0 ? 'green' : 'red',
            },
            {
                title: 'New Customers',
                value: newCustomersCount.toString(),
                delta: `${customersDeltaSign}${customersDelta}%`,
                tone: parseFloat(customersDelta) >= 0 ? 'green' : 'red',
            },
            {
                title: 'Repeat Purchase Rate',
                value: `${repeatPurchaseRate}%`,
                delta: `${repeatDeltaSign}${repeatDelta}%`,
                tone: parseFloat(repeatDelta) >= 0 ? 'blue' : 'red',
            },
            {
                title: 'Average Order Value',
                value: `$${avgOrderValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`,
                delta: `${avgOrderDeltaSign}${avgOrderDelta}%`,
                tone: parseFloat(avgOrderDelta) >= 0 ? 'default' : 'red',
            },
        ];
    }
    async getLineChartData(companyId, startDate, endDate) {
        const orders = await this.orderRepo.find({
            where: {
                companyId,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['items'],
        });
        const dailyRevenue = new Map();
        orders
            .filter((order) => order.isPaid || order.status === 'paid' || order.status === 'delivered')
            .forEach((order) => {
            const dateKey = order.createdAt.toISOString().split('T')[0];
            const current = dailyRevenue.get(dateKey) || 0;
            dailyRevenue.set(dateKey, current + Number(order.totalAmount || 0));
        });
        const chartData = Array.from(dailyRevenue.entries())
            .map(([date, totalPNL]) => ({
            month: date,
            totalPNL: Math.round(totalPNL * 100) / 100,
        }))
            .sort((a, b) => a.month.localeCompare(b.month));
        return chartData;
    }
    getRadialChartData(orders) {
        const paidCount = orders.filter((order) => order.isPaid || order.status === 'paid' || order.status === 'delivered').length;
        const unpaidCount = orders.filter((order) => !order.isPaid && order.status !== 'paid' && order.status !== 'delivered').length;
        const total = paidCount + unpaidCount;
        if (total === 0) {
            return [{ paid: 0, unpaid: 0 }];
        }
        const paidPercentage = Math.round((paidCount / total) * 100);
        const unpaidPercentage = 100 - paidPercentage;
        return [{ paid: paidPercentage, unpaid: unpaidPercentage }];
    }
    async getRecentOrders(companyId, limit = 10) {
        const orders = await this.orderRepo.find({
            where: { companyId },
            relations: ['items', 'items.product', 'customer'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return orders.map((order) => {
            const firstItem = order.items?.[0];
            const productName = firstItem?.product?.name || 'N/A';
            const customerName = order.customer?.name || order.customerName || 'Guest';
            const orderId = `#${order.id.toString().padStart(6, '0')}`;
            const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
            const status = order.status.charAt(0).toUpperCase() + order.status.slice(1);
            return {
                product: productName,
                customer: customerName,
                id: orderId,
                date,
                status,
            };
        });
    }
    async getBestSellingProducts(companyId, limit = 3) {
        const orderItems = await this.orderItemRepo.find({
            where: { companyId },
            relations: ['product', 'order'],
        });
        const paidOrderItems = orderItems.filter((item) => item.order.isPaid ||
            item.order.status === 'paid' ||
            item.order.status === 'delivered');
        const productSales = new Map();
        paidOrderItems.forEach((item) => {
            if (item.product) {
                const existing = productSales.get(item.product.id) || {
                    name: item.product.name,
                    sales: 0,
                    id: item.product.id,
                };
                existing.sales += item.quantity;
                productSales.set(item.product.id, existing);
            }
        });
        const topProducts = Array.from(productSales.values())
            .sort((a, b) => b.sales - a.sales)
            .slice(0, limit)
            .map((product) => ({
            name: product.name,
            sales: product.sales >= 1000 ? `${(product.sales / 1000).toFixed(1)}k+ Sales` : `${product.sales} Sales`,
            id: product.id.toString(),
        }));
        return topProducts;
    }
    async getTopCustomers(companyId, limit = 3) {
        const orders = await this.orderRepo.find({
            where: { companyId },
            relations: ['customer'],
        });
        const customerOrderCounts = new Map();
        orders
            .filter((order) => order.isPaid ||
            order.status === 'paid' ||
            order.status === 'delivered')
            .forEach((order) => {
            if (order.customer?.id) {
                const existing = customerOrderCounts.get(order.customer.id) || {
                    name: order.customer.name,
                    count: 0,
                };
                existing.count += 1;
                customerOrderCounts.set(order.customer.id, existing);
            }
        });
        const topCustomers = Array.from(customerOrderCounts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
            .map((customer) => ({
            name: customer.name,
            orders: `${customer.count} ${customer.count === 1 ? 'Order' : 'Orders'}`,
        }));
        return topCustomers;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(inventory_entity_1.InventoryEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(ordersitem_entity_1.OrdersitemEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map