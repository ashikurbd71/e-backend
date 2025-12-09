import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, HttpStatus, Patch, Query, BadRequestException } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) { }

  @Post()
  async create(
    @Body() createDto: CreateCategoryDto,
    @Query("companyId") companyIdFromQuery?: string,
    @CompanyId() companyIdFromToken?: string
  ) {
    const companyId = companyIdFromQuery || companyIdFromToken;
    if (!companyId) throw new BadRequestException("companyId is required");
    const category = await this.categoryService.create(createDto, companyId as string);
    return { statusCode: HttpStatus.CREATED, message: "Category created", data: category };
  }

  @Get()
  async findAll(@CompanyId() companyId: string) {
    const categories = await this.categoryService.findAll(companyId);
    return { statusCode: HttpStatus.OK, data: categories };
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const category = await this.categoryService.findOne(id, companyId);
    return { statusCode: HttpStatus.OK, data: category };
  }

  @Patch(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoryDto,
    @Query("companyId") companyIdFromQuery?: string,
    @CompanyId() companyIdFromToken?: string
  ) {
    const companyId = companyIdFromQuery || companyIdFromToken;
    const category = await this.categoryService.update(id, updateDto, companyId as string);
    return { statusCode: HttpStatus.OK, message: "Category updated", data: category };
  }

  @Delete(":id")
  async softDelete(
    @Param("id", ParseIntPipe) id: number,
    @CompanyId() companyId: string,
  ) {
    await this.categoryService.softDelete(id, companyId);
    return { statusCode: HttpStatus.OK, message: "Category soft deleted" };
  }

  @Patch(":id/toggle-active")
  async toggleActive(
    @Param("id", ParseIntPipe) id: number,
    @Query("active") active: string | undefined,
    @CompanyId() companyId: string,
  ) {
    const activeBool =
      active !== undefined
        ? ["true", "1"].includes(active.toLowerCase())
        : undefined;

    const category = await this.categoryService.toggleActive(id, activeBool, companyId);
    const state = category.isActive ? "activated" : "disabled";
    return { statusCode: HttpStatus.OK, message: `Category ${state}`, data: category };
  }
}
