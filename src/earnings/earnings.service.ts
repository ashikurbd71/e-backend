import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SystemUser } from '../systemuser/entities/systemuser.entity';

@Injectable()
export class EarningsService {
    constructor(
        @InjectRepository(SystemUser)
        private readonly systemUserRepo: Repository<SystemUser>,
    ) { }

    async getEarningsOverview() {
        // Get all system users with payment info
        const users = await this.systemUserRepo.find({
            where: { deletedAt: IsNull() },
        });

        // Calculate metrics from paymentInfo
        const now = new Date();
        const currentYear = now.getFullYear();
        const yearStart = new Date(currentYear, 0, 1);

        // Filter payments for current year
        const yearPayments = users
            .filter((user) => {
                if (!user.paymentInfo?.amount) return false;
                const paymentDate = user.createdAt || user.updatedAt;
                return paymentDate >= yearStart;
            })
            .map((user) => ({
                amount: user.paymentInfo?.amount || 0,
                status: user.paymentInfo?.paymentstatus || 'pending',
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }));

        // Total Earnings (YTD)
        const totalEarningsYTD = yearPayments
            .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // All payments (including pending) for calculations
        const allPayments = users
            .filter((user) => user.paymentInfo?.amount)
            .map((user) => ({
                amount: user.paymentInfo?.amount || 0,
                status: user.paymentInfo?.paymentstatus || 'pending',
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }));

        // Last 30 days payments
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentPayments = allPayments.filter(
            (p) => p.createdAt >= thirtyDaysAgo || p.updatedAt >= thirtyDaysAgo,
        );

        // Average Daily Revenue (last 30 days)
        const totalRecentRevenue = recentPayments
            .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const avgDailyRevenue = totalRecentRevenue / 30;

        // Paid vs Pending
        const paidAmount = allPayments
            .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingAmount = allPayments
            .filter((p) => p.status?.toLowerCase() === 'pending' || !p.status)
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalAmount = paidAmount + pendingAmount;
        const paidPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
        const pendingPercentage = totalAmount > 0 ? (pendingAmount / totalAmount) * 100 : 0;

        // Active Markets (count of unique companies with payments)
        const activeMarkets = new Set(
            users
                .filter((user) => user.paymentInfo?.amount && user.companyId)
                .map((user) => user.companyId),
        ).size;

        // Monthly earnings for chart (last 8 months)
        const monthlyEarnings: { month: string; totalPNL: number }[] = [];
        for (let i = 7; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

            const monthPayments = allPayments.filter(
                (p) =>
                    (p.createdAt >= monthStart && p.createdAt <= monthEnd) ||
                    (p.updatedAt >= monthStart && p.updatedAt <= monthEnd),
            );

            const monthTotal = monthPayments
                .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
                .reduce((sum, p) => sum + (p.amount || 0), 0);

            monthlyEarnings.push({
                month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`,
                totalPNL: monthTotal,
            });
        }

        // Payout status breakdown
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const clearedPayouts = allPayments
            .filter(
                (p) =>
                    (p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed') &&
                    (p.updatedAt >= last7Days || p.createdAt >= last7Days),
            )
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const scheduledPending = allPayments
            .filter((p) => p.status?.toLowerCase() === 'pending' || !p.status)
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        const disputedOnHold = allPayments
            .filter(
                (p) =>
                    p.status?.toLowerCase() === 'disputed' ||
                    p.status?.toLowerCase() === 'on hold' ||
                    p.status?.toLowerCase() === 'hold',
            )
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Channel breakdown (using package names as channels)
        const channelBreakdown: Record<string, number> = {};
        allPayments.forEach((p) => {
            const user = users.find(
                (u) =>
                    (u.createdAt === p.createdAt || u.updatedAt === p.updatedAt) &&
                    u.paymentInfo?.amount === p.amount,
            );
            const channel = user?.paymentInfo?.packagename || 'Other';
            channelBreakdown[channel] = (channelBreakdown[channel] || 0) + (p.amount || 0);
        });

        // Calculate percentage changes (simplified - comparing last month vs previous month)
        const lastMonthTotal = monthlyEarnings[monthlyEarnings.length - 1]?.totalPNL || 0;
        const previousMonthTotal = monthlyEarnings[monthlyEarnings.length - 2]?.totalPNL || 0;
        const earningsDelta =
            previousMonthTotal > 0 ? ((lastMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0;

        const avgDailyDelta =
            recentPayments.length > 0
                ? ((avgDailyRevenue - (totalRecentRevenue / 60)) / (totalRecentRevenue / 60)) * 100
                : 0;

        return {
            kpis: {
                totalEarningsYTD: totalEarningsYTD,
                avgDailyRevenue: avgDailyRevenue,
                paidPercentage: paidPercentage,
                pendingPercentage: pendingPercentage,
                activeMarkets: activeMarkets,
                earningsDelta: earningsDelta,
                avgDailyDelta: avgDailyDelta,
            },
            chartData: monthlyEarnings,
            payoutStatus: {
                clearedPayouts: clearedPayouts,
                scheduledPending: scheduledPending,
                disputedOnHold: disputedOnHold,
            },
            channelBreakdown: Object.entries(channelBreakdown).map(([name, amount]) => ({
                name,
                amount,
            })),
        };
    }
}
