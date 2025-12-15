import { Repository } from 'typeorm';
import { SystemUser } from '../systemuser/entities/systemuser.entity';
export declare class EarningsService {
    private readonly systemUserRepo;
    constructor(systemUserRepo: Repository<SystemUser>);
    getEarningsOverview(): Promise<{
        kpis: {
            totalEarningsYTD: number;
            avgDailyRevenue: number;
            paidPercentage: number;
            pendingPercentage: number;
            activeMarkets: number;
            earningsDelta: number;
            avgDailyDelta: number;
        };
        chartData: {
            month: string;
            totalPNL: number;
        }[];
        payoutStatus: {
            clearedPayouts: number;
            scheduledPending: number;
            disputedOnHold: number;
        };
        channelBreakdown: {
            name: string;
            amount: number;
        }[];
    }>;
}
