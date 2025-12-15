import { OverviewService } from './overview.service';
export declare class OverviewController {
    private readonly overviewService;
    constructor(overviewService: OverviewService);
    getOverview(): Promise<{
        kpis: {
            totalEarnings: number;
            totalEarningsDelta: number;
            activeCustomers: number;
            activeCustomersDelta: number;
            openSupportTickets: number;
            openSupportTicketsDelta: number;
        };
        customers: {
            newCustomersLast7Days: number;
            returningCustomersPercentage: number;
            atRiskCustomers: number;
        };
        support: {
            newTicketsToday: number;
            waitingForReply: number;
            averageResponseTime: string;
        };
    }>;
}
