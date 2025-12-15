import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { InventoryEntity } from '../inventory/entities/inventory.entity';
import { OrdersitemEntity } from '../ordersitem/entities/ordersitem.entity';
export declare class DashboardService {
    private orderRepo;
    private userRepo;
    private productRepo;
    private inventoryRepo;
    private orderItemRepo;
    constructor(orderRepo: Repository<Order>, userRepo: Repository<User>, productRepo: Repository<ProductEntity>, inventoryRepo: Repository<InventoryEntity>, orderItemRepo: Repository<OrdersitemEntity>);
    getDashboardData(companyId: string): Promise<{
        stats: {
            title: string;
            value: string;
            delta: string;
            tone: string;
        }[];
        lineChartData: {
            month: string;
            totalPNL: number;
        }[];
        radialChartData: {
            paid: number;
            unpaid: number;
        }[];
        recentOrders: {
            product: string;
            customer: string;
            id: string;
            date: string;
            status: string;
        }[];
        bestSellers: {
            name: string;
            sales: string;
            id: string;
        }[];
        topCustomers: {
            name: string;
            orders: string;
        }[];
    }>;
    private calculateStats;
    private getLineChartData;
    private getRadialChartData;
    private getRecentOrders;
    private getBestSellingProducts;
    private getTopCustomers;
}
