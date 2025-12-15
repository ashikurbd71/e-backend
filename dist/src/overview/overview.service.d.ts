import { Repository } from 'typeorm';
import { SystemUser } from '../systemuser/entities/systemuser.entity';
import { User } from '../users/entities/user.entity';
import { Help } from '../help/entities/help.entity';
import { Order } from '../orders/entities/order.entity';
export declare class OverviewService {
    private readonly systemUserRepo;
    private readonly userRepo;
    private readonly helpRepo;
    private readonly orderRepo;
    constructor(systemUserRepo: Repository<SystemUser>, userRepo: Repository<User>, helpRepo: Repository<Help>, orderRepo: Repository<Order>);
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
