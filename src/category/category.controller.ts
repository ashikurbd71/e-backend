import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpStatus, Patch, Query } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createDto: CreateCategoryDto) {
    const category = await this.categoryService.create(createDto);
    return { statusCode: HttpStatus.CREATED, message: "Category created", data: category };
  }

  @Get()
  async findAll() {
    const categories = await this.categoryService.findAll();
    return { statusCode: HttpStatus.OK, data: categories };
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const category = await this.categoryService.findOne(id);
    return { statusCode: HttpStatus.OK, data: category };
  }

  @Patch(":id")
  async update(@Param("id", ParseIntPipe) id: number, @Body() updateDto: UpdateCategoryDto) {
    const category = await this.categoryService.update(id, updateDto);
    return { statusCode: HttpStatus.OK, message: "Category updated", data: category };
  }

  @Delete(":id")
  async softDelete(@Param("id", ParseIntPipe) id: number) {
    await this.categoryService.softDelete(id);
    return { statusCode: HttpStatus.OK, message: "Category soft deleted" };
  }

  @Patch(":id/toggle-active")
  async toggleActive(@Param("id", ParseIntPipe) id: number, @Query("active") active?: string) {
    const activeBool =
      active !== undefined
        ? ["true", "1"].includes(active.toLowerCase())
        : undefined;

    const category = await this.categoryService.toggleActive(id, activeBool);
    const state = category.isActive ? "activated" : "disabled";
    return { statusCode: HttpStatus.OK, message: `Category ${state}`, data: category };
  }
}
