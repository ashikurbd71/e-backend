import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInventoryDto: CreateInventoryDto) {
    const data = await this.inventoryService.create(createInventoryDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Inventory created',
      data,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.inventoryService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory list fetched',
      data,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.inventoryService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory fetched',
      data,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateInventoryDto: UpdateInventoryDto) {
    const data = await this.inventoryService.update(id, updateInventoryDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory updated',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.inventoryService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Inventory deleted',
      data,
    };
  }

  @Get('analytics/summary')
  @HttpCode(HttpStatus.OK)
  async summary() {
    const data = await this.inventoryService.getAnalyticsSummary();
    return {
      statusCode: HttpStatus.OK,
      message: 'Analytics summary fetched',
      data,
    };
  }

  @Get('analytics/low-stock')
  @HttpCode(HttpStatus.OK)
  async lowStock(@Query('threshold') threshold?: string) {
    const th = threshold ? parseInt(threshold, 10) : 5;
    const data = await this.inventoryService.getLowStock(Number.isNaN(th) ? 5 : th);
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
  ) {
    const l = limit ? parseInt(limit, 10) : 10;
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const data = await this.inventoryService.getTopSellers(Number.isNaN(l) ? 10 : l, fromDate, toDate);
    return {
      statusCode: HttpStatus.OK,
      message: 'Top sellers fetched',
      data,
    };
  }
}
