// OrdersitemController
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { OrdersitemService } from './ordersitem.service';
import { CreateOrdersitemDto } from './dto/create-ordersitem.dto';
import { UpdateOrdersitemDto } from './dto/update-ordersitem.dto';

@Controller('ordersitem')
export class OrdersitemController {
  constructor(private readonly ordersitemService: OrdersitemService) {}

  @Post()
  async create(@Body() createOrdersitemDto: CreateOrdersitemDto) {
    const item = await this.ordersitemService.create(createOrdersitemDto);
    return { statusCode: HttpStatus.CREATED, message: 'Ordersitem created', data: item };
  }

  @Get()
  async findAll() {
    const items = await this.ordersitemService.findAll();
    return { statusCode: HttpStatus.OK, data: items };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.ordersitemService.findOne(+id);
    return { statusCode: HttpStatus.OK, data: item };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrdersitemDto: UpdateOrdersitemDto) {
    const updated = await this.ordersitemService.update(+id, updateOrdersitemDto);
    return { statusCode: HttpStatus.OK, message: 'Ordersitem updated', data: updated };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.ordersitemService.remove(+id);
    return { statusCode: HttpStatus.OK, message: 'Ordersitem removed' };
  }
}
