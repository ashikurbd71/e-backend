import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanyIdGuard } from 'src/common/guards/company-id.guard';
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, CompanyIdGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInventoryDto: CreateInventoryDto, @CompanyId() companyId: string) {
    const data = await this.inventoryService.create(createInventoryDto, companyId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Inventory created',
      data,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CompanyId() companyId: string) {
    const data = await this.inventoryService.findAll(companyId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory list fetched',
      data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const data = await this.inventoryService.findOne(id, companyId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory fetched',
      data,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateInventoryDto: UpdateInventoryDto, @CompanyId() companyId: string) {
    const data = await this.inventoryService.update(id, updateInventoryDto, companyId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory updated',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const data = await this.inventoryService.remove(id, companyId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory deleted',
      data,
    };
  }

  @Get('analytics/summary')
  @HttpCode(HttpStatus.OK)
  async summary(@CompanyId() companyId: string) {
    const data = await this.inventoryService.getAnalyticsSummary(companyId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Analytics summary fetched',
      data,
    };
  }

  @Get('analytics/low-stock')
  @HttpCode(HttpStatus.OK)
  async lowStock(@Query('threshold') threshold?: string, @CompanyId() companyId?: string) {
    const th = threshold ? parseInt(threshold, 10) : 5;
    const data = await this.inventoryService.getLowStock(Number.isNaN(th) ? 5 : th, companyId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Low stock inventory fetched',
      data,
    };
  }

  @Get('analytics/top-sellers')
  @HttpCode(HttpStatus.OK)
  async topSellers(
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @CompanyId() companyId?: string,
  ) {
    const l = limit ? parseInt(limit, 10) : 10;
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const data = await this.inventoryService.getTopSellers(Number.isNaN(l) ? 10 : l, fromDate, toDate, companyId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Top sellers fetched',
      data,
    };
  }
}
