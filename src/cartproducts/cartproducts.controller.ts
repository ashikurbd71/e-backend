import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, HttpStatus, BadRequestException, UseGuards } from '@nestjs/common';
import { CartproductsService } from './cartproducts.service';
import { CreateCartproductDto } from './dto/create-cartproduct.dto';
import { UpdateCartproductDto } from './dto/update-cartproduct.dto';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyIdGuard } from '../common/guards/company-id.guard';

@Controller('cartproducts')
export class CartproductsController {
  constructor(private readonly cartproductsService: CartproductsService) { }

  @Post()
  async create(
    @Body() createCartproductDto: CreateCartproductDto,
    @Query('companyId') companyId?: string,
    @CompanyId() companyIdFromToken?: string,
  ) {
    const effectiveCompanyId = companyId || companyIdFromToken || createCartproductDto.companyId;
    if (!effectiveCompanyId) {
      throw new BadRequestException('companyId is required');
    }
    const data = await this.cartproductsService.create(
      { ...createCartproductDto, companyId: effectiveCompanyId },
      effectiveCompanyId
    );
    return { statusCode: HttpStatus.CREATED, message: 'Added to cart', data };
  }



  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('companyId') companyId?: string,
    @CompanyId() companyIdFromToken?: string,
  ) {
    const effectiveCompanyId = companyId || companyIdFromToken;
    if (!effectiveCompanyId) {
      throw new BadRequestException('companyId is required');
    }
    const data = await this.cartproductsService.findUserCart(userId, effectiveCompanyId);
    return { statusCode: HttpStatus.OK, data };
  }



  @Delete('user/:userId')
  async clearUserCart(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('companyId') companyId?: string,
    @CompanyId() companyIdFromToken?: string,
  ) {
    const effectiveCompanyId = companyId || companyIdFromToken;
    if (!effectiveCompanyId) {
      throw new BadRequestException('companyId is required');
    }
    const data = await this.cartproductsService.clearUserCart(userId, effectiveCompanyId);
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
