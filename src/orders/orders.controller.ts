import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch, UseGuards } from "@nestjs/common";
import { OrderService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanyIdGuard } from 'src/common/guards/company-id.guard';
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller("orders")
// @UseGuards(JwtAuthGuard, CompanyIdGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  async create(@Body() dto: CreateOrderDto, @CompanyId() companyId: string) {
    const o = await this.orderService.create(dto, companyId);
    return { statusCode: 201, message: "Order created", data: o };
  }

  @Get()
  async findAll(@CompanyId() companyId: string) {
    const o = await this.orderService.findAll(companyId);
    return { statusCode: 200, data: o };
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const o = await this.orderService.findOne(id, companyId);
    return { statusCode: 200, data: o };
  }

  @Patch(":id/complete")
  async complete(@Param("id", ParseIntPipe) id: number, @Body() body: { paymentRef?: string }, @CompanyId() companyId: string) {
    const o = await this.orderService.completeOrder(id, companyId, body?.paymentRef);
    return { statusCode: 200, message: "Order completed", data: o };
  }

  @Patch(":id/deliver")
  async deliver(@Param("id", ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const o = await this.orderService.deliverOrder(id, companyId);
    return { statusCode: 200, message: "Order delivered", data: o };
  }

  @Patch(":id/cancel")
  async cancel(@Param("id", ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const res = await this.orderService.cancelOrder(id, companyId);
    return { statusCode: 200, ...res };
  }

  // Add success alias (maps to deliver)
  @Patch(":id/success")
  async success(@Param("id", ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const o = await this.orderService.deliverOrder(id, companyId);
    return { statusCode: 200, message: "Order success", data: o };
  }


  @Patch(":id/ship")
  async ship(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { trackingId?: string; provider?: string },
    @CompanyId() companyId: string,
  ) {
    const o = await this.orderService.shipOrder(id, companyId, body?.trackingId, body?.provider);
    return { statusCode: 200, message: "Order shipped", data: o };
  }

  @Patch(":id/refund")
  async refund(@Param("id", ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const o = await this.orderService.refundOrder(id, companyId);
    return { statusCode: 200, message: "Order refunded", data: o };
  }
}
