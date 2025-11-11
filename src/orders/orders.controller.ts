import { Controller, Post, Body, Get, Param, ParseIntPipe, Patch } from "@nestjs/common";
import { OrderService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    const o = await this.orderService.create(dto);
    return { statusCode: 201, message: "Order created", data: o };
  }

  @Get()
  async findAll() {
    const o = await this.orderService.findAll();
    return { statusCode: 200, data: o };
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const o = await this.orderService.findOne(id);
    return { statusCode: 200, data: o };
  }

  @Patch(":id/complete")
  async complete(@Param("id", ParseIntPipe) id: number, @Body() body: { paymentRef?: string }) {
    const o = await this.orderService.completeOrder(id, body?.paymentRef);
    return { statusCode: 200, message: "Order completed", data: o };
  }

  @Patch(":id/deliver")
  async deliver(@Param("id", ParseIntPipe) id: number) {
    const o = await this.orderService.deliverOrder(id);
    return { statusCode: 200, message: "Order delivered", data: o };
  }

  @Patch(":id/cancel")
  async cancel(@Param("id", ParseIntPipe) id: number) {
    const res = await this.orderService.cancelOrder(id);
    return { statusCode: 200, ...res };
  }

  // Add success alias (maps to deliver)
  @Patch(":id/success")
  async success(@Param("id", ParseIntPipe) id: number) {
    const o = await this.orderService.deliverOrder(id);
    return { statusCode: 200, message: "Order success", data: o };
  }

  
  @Patch(":id/ship")
  async ship(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { trackingId?: string; provider?: string },
  ) {
    const o = await this.orderService.shipOrder(id, body?.trackingId, body?.provider);
    return { statusCode: 200, message: "Order shipped", data: o };
  }

  @Patch(":id/refund")
  async refund(@Param("id", ParseIntPipe) id: number) {
    const o = await this.orderService.refundOrder(id);
    return { statusCode: 200, message: "Order refunded", data: o };
  }
}
