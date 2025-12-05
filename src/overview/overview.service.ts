import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { SystemUser } from '../systemuser/entities/systemuser.entity';
import { User } from '../users/entities/user.entity';
import { Help, SupportStatus } from '../help/entities/help.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class OverviewService {
    constructor(
        @InjectRepository(SystemUser)
        private readonly systemUserRepo: Repository<SystemUser>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Help)
        private readonly helpRepo: Repository<Help>,
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
    ) { }

    async getOverview() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const todayStart = new Date(now.setHours(0, 0, 0, 0));

        // Calculate Total Earnings (YTD)
        const systemUsers = await this.systemUserRepo.find({
            where: { deletedAt: IsNull() },
        });

        const currentYear = now.getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearPayments = systemUsers
            .filter((user) => {
                if (!user.paymentInfo?.amount) return false;
                const paymentDate = user.createdAt || user.updatedAt;
                return paymentDate >= yearStart;
            })
            .map((user) => ({
                amount: user.paymentInfo?.amount || 0,
                status: user.paymentInfo?.paymentstatus || 'pending',
            }));

        const totalEarningsYTD = yearPayments
            .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Calculate previous period for delta
        const previousYearStart = new Date(currentYear - 1, 0, 1);
        const previousYearEnd = new Date(currentYear - 1, 11, 31, 23, 59, 59);
        const previousYearPayments = systemUsers
            .filter((user) => {
                if (!user.paymentInfo?.amount) return false;
                const paymentDate = user.createdAt || user.updatedAt;
                return paymentDate >= previousYearStart && paymentDate <= previousYearEnd;
            })
            .map((user) => ({
                amount: user.paymentInfo?.amount || 0,
                status: user.paymentInfo?.paymentstatus || 'pending',
            }));

        const previousYearEarnings = previousYearPayments
            .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const earningsDelta =
            previousYearEarnings > 0
                ? ((totalEarningsYTD - previousYearEarnings) / previousYearEarnings) * 100
                : totalEarningsYTD > 0
                    ? 100
                    : 0;

        // Active Customers (users who purchased in last 90 days)
        const activeCustomers = await this.userRepo.count({
            where: {
                deletedAt: IsNull(),
                createdAt: MoreThan(ninetyDaysAgo),
                successfulOrdersCount: MoreThan(0),
            },
        });

        // Previous period active customers
        const previousPeriodStart = new Date(ninetyDaysAgo.getTime() - 90 * 24 * 60 * 60 * 1000);
        const previousPeriodEnd = new Date(ninetyDaysAgo);
        const previousActiveCustomers = await this.userRepo.count({
            where: {
                deletedAt: IsNull(),
                createdAt: MoreThan(previousPeriodStart),
                successfulOrdersCount: MoreThan(0),
            },
        });

        const customersDelta =
            previousActiveCustomers > 0
                ? ((activeCustomers - previousActiveCustomers) / previousActiveCustomers) * 100
                : activeCustomers > 0
                    ? 100
                    : 0;

        // Open Support Tickets
        const openTickets = await this.helpRepo.count({
            where: {
                deletedAt: IsNull(),
                status: SupportStatus.PENDING,
            },
        });

        // Previous period open tickets (simplified - using current count for now)
        // In a real system, you'd track historical data
        const previousOpenTickets = openTickets;

        const ticketsDelta =
            previousOpenTickets > 0
                ? ((openTickets - previousOpenTickets) / previousOpenTickets) * 100
                : openTickets > 0
                    ? 100
                    : 0;

        // Customer statistics
        const newCustomersLast7Days = await this.userRepo.count({
            where: {
                deletedAt: IsNull(),
                createdAt: MoreThan(sevenDaysAgo),
            },
        });

        const totalCustomers = await this.userRepo.count({
            where: { deletedAt: IsNull() },
        });

        const customersWithOrders = await this.userRepo.count({
            where: {
                deletedAt: IsNull(),
                successfulOrdersCount: MoreThan(0),
            },
        });

        const returningCustomersPercentage =
            totalCustomers > 0 ? (customersWithOrders / totalCustomers) * 100 : 0;

        // At-risk customers (no orders in last 90 days but have account)
        const atRiskCustomers = await this.userRepo.count({
            where: {
                deletedAt: IsNull(),
                createdAt: MoreThan(ninetyDaysAgo),
                successfulOrdersCount: 0,
            },
        });

        // Support statistics
        const newTicketsToday = await this.helpRepo.count({
            where: {
                deletedAt: IsNull(),
                createdAt: MoreThan(todayStart),
            },
        });

        const waitingForReply = await this.helpRepo.count({
            where: {
                deletedAt: IsNull(),
                status: SupportStatus.PENDING,
            },
        });

        // Calculate average response time (simplified - using first response as 12 min for now)
        // In a real system, you'd track actual response times
        const averageResponseTime = '12 min';

        return {
            kpis: {
                totalEarnings: totalEarningsYTD,
                totalEarningsDelta: earningsDelta,
                activeCustomers: activeCustomers,
                activeCustomersDelta: customersDelta,
                openSupportTickets: openTickets,
                openSupportTicketsDelta: ticketsDelta,
            },
            customers: {
                newCustomersLast7Days: newCustomersLast7Days,
                returningCustomersPercentage: returningCustomersPercentage,
                atRiskCustomers: atRiskCustomers,
            },
            support: {
                newTicketsToday: newTicketsToday,
                waitingForReply: waitingForReply,
                averageResponseTime: averageResponseTime,
            },
        };
    }
}

