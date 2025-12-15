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
exports.EarningsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const systemuser_entity_1 = require("../systemuser/entities/systemuser.entity");
let EarningsService = class EarningsService {
    systemUserRepo;
    constructor(systemUserRepo) {
        this.systemUserRepo = systemUserRepo;
    }
    async getEarningsOverview() {
        const users = await this.systemUserRepo.find({
            where: { deletedAt: (0, typeorm_2.IsNull)() },
        });
        const now = new Date();
        const currentYear = now.getFullYear();
        const yearStart = new Date(currentYear, 0, 1);
        const yearPayments = users
            .filter((user) => {
            if (!user.paymentInfo?.amount)
                return false;
            const paymentDate = user.createdAt || user.updatedAt;
            return paymentDate >= yearStart;
        })
            .map((user) => ({
            amount: user.paymentInfo?.amount || 0,
            status: user.paymentInfo?.paymentstatus || 'pending',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
        const totalEarningsYTD = yearPayments
            .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const allPayments = users
            .filter((user) => user.paymentInfo?.amount)
            .map((user) => ({
            amount: user.paymentInfo?.amount || 0,
            status: user.paymentInfo?.paymentstatus || 'pending',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentPayments = allPayments.filter((p) => p.createdAt >= thirtyDaysAgo || p.updatedAt >= thirtyDaysAgo);
        const totalRecentRevenue = recentPayments
            .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const avgDailyRevenue = totalRecentRevenue / 30;
        const paidAmount = allPayments
            .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingAmount = allPayments
            .filter((p) => p.status?.toLowerCase() === 'pending' || !p.status)
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalAmount = paidAmount + pendingAmount;
        const paidPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
        const pendingPercentage = totalAmount > 0 ? (pendingAmount / totalAmount) * 100 : 0;
        const activeMarkets = new Set(users
            .filter((user) => user.paymentInfo?.amount && user.companyId)
            .map((user) => user.companyId)).size;
        const monthlyEarnings = [];
        for (let i = 7; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
            const monthPayments = allPayments.filter((p) => (p.createdAt >= monthStart && p.createdAt <= monthEnd) ||
                (p.updatedAt >= monthStart && p.updatedAt <= monthEnd));
            const monthTotal = monthPayments
                .filter((p) => p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed')
                .reduce((sum, p) => sum + (p.amount || 0), 0);
            monthlyEarnings.push({
                month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-01`,
                totalPNL: monthTotal,
            });
        }
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const clearedPayouts = allPayments
            .filter((p) => (p.status?.toLowerCase() === 'paid' || p.status?.toLowerCase() === 'completed') &&
            (p.updatedAt >= last7Days || p.createdAt >= last7Days))
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const scheduledPending = allPayments
            .filter((p) => p.status?.toLowerCase() === 'pending' || !p.status)
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const disputedOnHold = allPayments
            .filter((p) => p.status?.toLowerCase() === 'disputed' ||
            p.status?.toLowerCase() === 'on hold' ||
            p.status?.toLowerCase() === 'hold')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        const channelBreakdown = {};
        allPayments.forEach((p) => {
            const user = users.find((u) => (u.createdAt === p.createdAt || u.updatedAt === p.updatedAt) &&
                u.paymentInfo?.amount === p.amount);
            const channel = user?.paymentInfo?.packagename || 'Other';
            channelBreakdown[channel] = (channelBreakdown[channel] || 0) + (p.amount || 0);
        });
        const lastMonthTotal = monthlyEarnings[monthlyEarnings.length - 1]?.totalPNL || 0;
        const previousMonthTotal = monthlyEarnings[monthlyEarnings.length - 2]?.totalPNL || 0;
        const earningsDelta = previousMonthTotal > 0 ? ((lastMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 : 0;
        const avgDailyDelta = recentPayments.length > 0
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
};
exports.EarningsService = EarningsService;
exports.EarningsService = EarningsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(systemuser_entity_1.SystemUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], EarningsService);
//# sourceMappingURL=earnings.service.js.map