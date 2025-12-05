import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { InventoryEntity } from '../inventory/entities/inventory.entity';
import { OrdersitemEntity } from '../ordersitem/entities/ordersitem.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Order)
        private orderRepo: Repository<Order>,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        @InjectRepository(ProductEntity)
        private productRepo: Repository<ProductEntity>,
        @InjectRepository(InventoryEntity)
        private inventoryRepo: Repository<InventoryEntity>,
        @InjectRepository(OrdersitemEntity)
        private orderItemRepo: Repository<OrdersitemEntity>,
    ) { }

    async getDashboardData(companyId: string) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Get all orders for this company
        const allOrders = await this.orderRepo.find({
            where: { companyId },
            relations: ['items', 'items.product', 'customer'],
        });

        // Get orders from last 30 days for new customers calculation
        const recentOrders = allOrders.filter(
            (order) => order.createdAt >= thirtyDaysAgo,
        );

        // Calculate stats
        const stats = await this.calculateStats(companyId, allOrders, recentOrders);

        // Calculate line chart data (last 7 days)
        const lineChartData = await this.getLineChartData(companyId, sevenDaysAgo, now);

        // Calculate radial chart data (paid vs unpaid)
        const radialChartData = this.getRadialChartData(allOrders);

        // Get recent orders (last 10)
        const recentOrdersList = await this.getRecentOrders(companyId, 10);

        // Get best selling products
        const bestSellers = await this.getBestSellingProducts(companyId, 3);

        // Get top customers
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

    private async calculateStats(
        companyId: string,
        allOrders: Order[],
        recentOrders: Order[],
    ) {
        // Ecommerce Revenue (total from all paid/delivered orders)
        const paidOrders = allOrders.filter(
            (order) => order.isPaid || order.status === 'paid' || order.status === 'delivered',
        );
        const totalRevenue = paidOrders.reduce(
            (sum, order) => sum + Number(order.totalAmount || 0),
            0,
        );

        // Previous period revenue for comparison (orders from 30-60 days ago)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const previousPeriodOrders = allOrders.filter(
            (order) =>
                order.createdAt >= sixtyDaysAgo && order.createdAt < thirtyDaysAgo,
        );
        const previousRevenue = previousPeriodOrders
            .filter(
                (order) =>
                    order.isPaid || order.status === 'paid' || order.status === 'delivered',
            )
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
        const revenueDelta =
            previousRevenue > 0
                ? (((totalRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
                : '0.0';
        const revenueDeltaSign = totalRevenue >= previousRevenue ? '+' : '';

        // New Customers (customers created in last 30 days)
        const newCustomersCount = await this.userRepo.count({
            where: {
                companyId,
                createdAt: Between(thirtyDaysAgo, now),
            },
        });

        // Previous period new customers
        const previousNewCustomers = await this.userRepo.count({
            where: {
                companyId,
                createdAt: Between(sixtyDaysAgo, thirtyDaysAgo),
            },
        });
        const customersDelta =
            previousNewCustomers > 0
                ? (
                    ((newCustomersCount - previousNewCustomers) /
                        previousNewCustomers) *
                    100
                ).toFixed(1)
                : '0.0';
        const customersDeltaSign = newCustomersCount >= previousNewCustomers ? '+' : '';

        // Repeat Purchase Rate (customers with more than 1 order)
        const customerOrderCounts = new Map<number, number>();
        recentOrders.forEach((order) => {
            if (order.customer?.id) {
                customerOrderCounts.set(
                    order.customer.id,
                    (customerOrderCounts.get(order.customer.id) || 0) + 1,
                );
            }
        });
        const repeatCustomers = Array.from(customerOrderCounts.values()).filter(
            (count) => count > 1,
        ).length;
        const totalCustomersWithOrders = customerOrderCounts.size;
        const repeatPurchaseRate =
            totalCustomersWithOrders > 0
                ? ((repeatCustomers / totalCustomersWithOrders) * 100).toFixed(2)
                : '0.00';

        // Previous period repeat purchase rate
        const previousPeriodCustomerCounts = new Map<number, number>();
        previousPeriodOrders.forEach((order) => {
            if (order.customer?.id) {
                previousPeriodCustomerCounts.set(
                    order.customer.id,
                    (previousPeriodCustomerCounts.get(order.customer.id) || 0) + 1,
                );
            }
        });
        const previousRepeatCustomers = Array.from(
            previousPeriodCustomerCounts.values(),
        ).filter((count) => count > 1).length;
        const previousTotalCustomers = previousPeriodCustomerCounts.size;
        const previousRepeatRate =
            previousTotalCustomers > 0
                ? ((previousRepeatCustomers / previousTotalCustomers) * 100).toFixed(2)
                : '0.00';
        const repeatDelta =
            previousRepeatRate !== '0.00'
                ? (
                    ((parseFloat(repeatPurchaseRate) - parseFloat(previousRepeatRate)) /
                        parseFloat(previousRepeatRate)) *
                    100
                ).toFixed(1)
                : '0.0';
        const repeatDeltaSign =
            parseFloat(repeatPurchaseRate) >= parseFloat(previousRepeatRate) ? '+' : '';

        // Average Order Value
        const avgOrderValue =
            paidOrders.length > 0
                ? totalRevenue / paidOrders.length
                : 0;
        const previousAvgOrderValue =
            previousPeriodOrders.length > 0
                ? previousPeriodOrders
                    .filter(
                        (order) =>
                            order.isPaid ||
                            order.status === 'paid' ||
                            order.status === 'delivered',
                    )
                    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0) /
                previousPeriodOrders.filter(
                    (order) =>
                        order.isPaid ||
                        order.status === 'paid' ||
                        order.status === 'delivered',
                ).length
                : 0;
        const avgOrderDelta =
            previousAvgOrderValue > 0
                ? (
                    ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) *
                    100
                ).toFixed(1)
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

    private async getLineChartData(
        companyId: string,
        startDate: Date,
        endDate: Date,
    ) {
        const orders = await this.orderRepo.find({
            where: {
                companyId,
                createdAt: Between(startDate, endDate),
            },
            relations: ['items'],
        });

        // Group orders by date and calculate total PNL (revenue) per day
        const dailyRevenue = new Map<string, number>();

        orders
            .filter(
                (order) =>
                    order.isPaid || order.status === 'paid' || order.status === 'delivered',
            )
            .forEach((order) => {
                const dateKey = order.createdAt.toISOString().split('T')[0];
                const current = dailyRevenue.get(dateKey) || 0;
                dailyRevenue.set(dateKey, current + Number(order.totalAmount || 0));
            });

        // Convert to array format expected by frontend
        const chartData = Array.from(dailyRevenue.entries())
            .map(([date, totalPNL]) => ({
                month: date,
                totalPNL: Math.round(totalPNL * 100) / 100, // Round to 2 decimal places
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

        return chartData;
    }

    private getRadialChartData(orders: Order[]) {
        const paidCount = orders.filter(
            (order) => order.isPaid || order.status === 'paid' || order.status === 'delivered',
        ).length;
        const unpaidCount = orders.filter(
            (order) => !order.isPaid && order.status !== 'paid' && order.status !== 'delivered',
        ).length;

        const total = paidCount + unpaidCount;
        if (total === 0) {
            return [{ paid: 0, unpaid: 0 }];
        }

        const paidPercentage = Math.round((paidCount / total) * 100);
        const unpaidPercentage = 100 - paidPercentage;

        return [{ paid: paidPercentage, unpaid: unpaidPercentage }];
    }

    private async getRecentOrders(companyId: string, limit: number = 10) {
        const orders = await this.orderRepo.find({
            where: { companyId },
            relations: ['items', 'items.product', 'customer'],
            order: { createdAt: 'DESC' },
            take: limit,
        });

        return orders.map((order) => {
            const firstItem = order.items?.[0];
            const productName = firstItem?.product?.name || 'N/A';
            const customerName =
                order.customer?.name || order.customerName || 'Guest';
            const orderId = `#${order.id.toString().padStart(6, '0')}`;
            const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
            const status =
                order.status.charAt(0).toUpperCase() + order.status.slice(1);

            return {
                product: productName,
                customer: customerName,
                id: orderId,
                date,
                status,
            };
        });
    }

    private async getBestSellingProducts(companyId: string, limit: number = 3) {
        // Get all order items for this company
        const orderItems = await this.orderItemRepo.find({
            where: { companyId },
            relations: ['product', 'order'],
        });

        // Filter only from paid/delivered orders
        const paidOrderItems = orderItems.filter(
            (item) =>
                item.order.isPaid ||
                item.order.status === 'paid' ||
                item.order.status === 'delivered',
        );

        // Group by product and sum quantities
        const productSales = new Map<
            number,
            { name: string; sales: number; id: number }
        >();

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

        // Sort by sales and take top N
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

    private async getTopCustomers(companyId: string, limit: number = 3) {
        // Get all orders for this company
        const orders = await this.orderRepo.find({
            where: { companyId },
            relations: ['customer'],
        });

        // Count orders per customer (only paid/delivered orders)
        const customerOrderCounts = new Map<
            number,
            { name: string; count: number }
        >();

        orders
            .filter(
                (order) =>
                    order.isPaid ||
                    order.status === 'paid' ||
                    order.status === 'delivered',
            )
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

        // Sort by order count and take top N
        const topCustomers = Array.from(customerOrderCounts.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
            .map((customer) => ({
                name: customer.name,
                orders: `${customer.count} ${customer.count === 1 ? 'Order' : 'Orders'}`,
            }));

        return topCustomers;
    }
}

