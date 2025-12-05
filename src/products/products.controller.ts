import {
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
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { Permission } from 'src/common/decorators/permission.decorator';
import { FeaturePermission } from 'src/systemuser/feature-permission.enum';
import { CompanyIdGuard } from 'src/common/guards/company-id.guard';
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, CompanyIdGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createDto: CreateProductDto, @CompanyId() companyId: string) {
    const product = await this.productService.create(createDto, companyId);
    return { statusCode: HttpStatus.CREATED, message: 'Product created', data: product };
  }

  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permission(FeaturePermission.PRODUCTS)
  @Get()
  async findAll(@CompanyId() companyId: string) {
    const products = await this.productService.findAll(companyId, {
      relations: ['inventory'],
    });
    return { statusCode: HttpStatus.OK, data: products };
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const product = await this.productService.findOne(id, companyId, {
      relations: ["inventory"],
    });
    return { statusCode: HttpStatus.OK, data: product };
  }

  @Patch(":id")
  async update(@Param("id", ParseIntPipe) id: number, @Body() updateDto: UpdateProductDto, @CompanyId() companyId: string) {
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
}
