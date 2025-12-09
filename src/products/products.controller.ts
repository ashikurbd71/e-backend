import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FlashSellDto } from './dto/flash-sell.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { FeaturePermission } from 'src/systemuser/feature-permission.enum';
import { CompanyIdGuard } from 'src/common/guards/company-id.guard';
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller('products')
// @UseGuards(JwtAuthGuard, CompanyIdGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post()
  async create(
    @Body() createDto: CreateProductDto,
    @Query('companyId') companyIdFromQuery?: string,
    @CompanyId() companyIdFromToken?: string,
  ) {
    const companyId = companyIdFromQuery || companyIdFromToken;
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }

    const product = await this.productService.create(createDto, companyId);
    return { statusCode: HttpStatus.CREATED, message: 'Product created', data: product };
  }

  @Get()
  async findAll(
    @Query('companyId') companyId: string
  ) {
    const products = await this.productService.findAll(companyId);
    return { statusCode: HttpStatus.OK, data: products };
  }

  @Get('category')
  async findByCategory(
    @Query('companyId') companyId: string,
    @Query('categories') categories?: string,
    @Query('categoryId') categoryId?: string
  ) {
    const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;
    const products = await this.productService.findByCategory(
      companyId,
      categories,
      parsedCategoryId
    );
    return { statusCode: HttpStatus.OK, data: products };
  }

  @Get('trending')
  async findTrending(
    @Query('companyId') companyId: string,
    @Query('days') days?: string,
    @Query('limit') limit?: string,
  ) {
    if (!companyId) {
      return { statusCode: HttpStatus.BAD_REQUEST, message: 'companyId is required', data: [] };
    }
    const daysParam = days ? parseInt(days, 10) : 30;
    const limitParam = limit ? parseInt(limit, 10) : 10;
    const products = await this.productService.findTrending(companyId, daysParam, limitParam);
    return { statusCode: HttpStatus.OK, data: products };
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const product = await this.productService.findOne(id, companyId);
    return { statusCode: HttpStatus.OK, data: product };
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductDto,
    @Query('companyId') companyIdFromQuery?: string,
    @CompanyId() companyIdFromToken?: string,
  ) {
    const companyId = companyIdFromQuery || companyIdFromToken;
    if (!companyId) throw new BadRequestException('companyId is required');
    const product = await this.productService.update(id, updateDto, companyId);
    return { statusCode: HttpStatus.OK, message: "Product updated", data: product };
  }

  @Delete(":id")
  async softDelete(@Param("id", ParseIntPipe) id: number, @CompanyId() companyId: string) {
    await this.productService.softDelete(id, companyId);
    return { statusCode: HttpStatus.OK, message: "Product soft deleted" };
  }

  @Patch(":id/toggle-active")
  async toggleActive(@Param("id", ParseIntPipe) id: number, @Query("active") active: string, @CompanyId() companyId: string) {
    const isActive = active === "true";
    const product = await this.productService.toggleActive(id, isActive, companyId);
    return { statusCode: HttpStatus.OK, message: `Product ${isActive ? "activated" : "disabled"}`, data: product };
  }

  @Post("flash-sell")
  async setFlashSell(@Body() flashSellDto: FlashSellDto, @CompanyId() companyId: string) {
    const startTime = new Date(flashSellDto.flashSellStartTime);
    const endTime = new Date(flashSellDto.flashSellEndTime);
    const products = await this.productService.setFlashSell(
      flashSellDto.productIds,
      startTime,
      endTime,
      flashSellDto.flashSellPrice,
      companyId
    );
    return {
      statusCode: HttpStatus.OK,
      message: "Flash sell set for selected products",
      data: products,
    };
  }

  @Delete("flash-sell")
  async removeFlashSell(@Body() body: { productIds: number[] }, @CompanyId() companyId: string) {
    const products = await this.productService.removeFlashSell(body.productIds, companyId);
    return {
      statusCode: HttpStatus.OK,
      message: "Flash sell removed from selected products",
      data: products,
    };
  }

  @Get("flash-sell/active")
  async getActiveFlashSellProducts(@CompanyId() companyId: string) {
    const products = await this.productService.getActiveFlashSellProducts(companyId);
    return {
      statusCode: HttpStatus.OK,
      data: products,
    };
  }
}
