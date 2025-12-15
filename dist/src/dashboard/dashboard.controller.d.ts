import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(companyId: string): Promise<{
        statusCode: number;
        message: string;
        data: {
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
        };
    }>;
}
