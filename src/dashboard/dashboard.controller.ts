import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanyIdGuard } from 'src/common/guards/company-id.guard';
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, CompanyIdGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    async getDashboard(@CompanyId() companyId: string) {
        const data = await this.dashboardService.getDashboardData(companyId);
        return {
            statusCode: 200,
            message: 'Dashboard data retrieved successfully',
            data,
        };
    }
}







