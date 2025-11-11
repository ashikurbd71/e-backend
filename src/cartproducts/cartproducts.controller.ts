import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpStatus } from '@nestjs/common';
import { CartproductsService } from './cartproducts.service';
import { CreateCartproductDto } from './dto/create-cartproduct.dto';
import { UpdateCartproductDto } from './dto/update-cartproduct.dto';

@Controller('cartproducts')
export class CartproductsController {
  constructor(private readonly cartproductsService: CartproductsService) {}

  @Post()
  async create(@Body() createCartproductDto: CreateCartproductDto) {
    const data = await this.cartproductsService.create(createCartproductDto);
    return { statusCode: HttpStatus.CREATED, message: 'Added to cart', data };
  }



  @Get('user/:userId')
  async findByUser(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.cartproductsService.findUserCart(userId);
    return { statusCode: HttpStatus.OK, data };
  }

 

  @Delete('user/:userId')
  async clearUserCart(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.cartproductsService.clearUserCart(userId);
    return { statusCode: HttpStatus.OK, message: 'User cart cleared', data };
  }

  @Post(':userId/order')
  async orderFromCart(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() payload?: { paymentMethod?: 'DIRECT' | 'COD'; pickupPoint?: any },
  ) {
    const data = await this.cartproductsService.orderFromUserCart(userId, payload);
    return { statusCode: HttpStatus.CREATED, message: 'Order created from cart', data };
  }
}
