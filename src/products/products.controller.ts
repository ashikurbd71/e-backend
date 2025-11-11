import { Controller, Get, Post, Put, Delete, Patch, Body, Param, ParseIntPipe, HttpStatus, Query } from "@nestjs/common";
import { ProductService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Controller("products")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createDto: CreateProductDto) {
    const product = await this.productService.create(createDto);
    return { statusCode: HttpStatus.CREATED, message: "Product created", data: product };
  }

  @Get()
  async findAll() {
    const products = await this.productService.findAll({
      relations: ["inventory"],
    });
    return { statusCode: HttpStatus.OK, data: products };
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const product = await this.productService.findOne(id, {
      relations: ["inventory"],
    });
    return { statusCode: HttpStatus.OK, data: product };
  }

  @Patch(":id")
  async update(@Param("id", ParseIntPipe) id: number, @Body() updateDto: UpdateProductDto) {
    const product = await this.productService.update(id, updateDto);
    return { statusCode: HttpStatus.OK, message: "Product updated", data: product };
  }

  @Delete(":id")
  async softDelete(@Param("id", ParseIntPipe) id: number) {
    await this.productService.softDelete(id);
    return { statusCode: HttpStatus.OK, message: "Product soft deleted" };
  }

  @Patch(":id/toggle-active")
  async toggleActive(@Param("id", ParseIntPipe) id: number, @Query("active") active: string) {
    const isActive = active === "true";
    const product = await this.productService.toggleActive(id, isActive);
    return { statusCode: HttpStatus.OK, message: `Product ${isActive ? "activated" : "disabled"}`, data: product };
  }
}
