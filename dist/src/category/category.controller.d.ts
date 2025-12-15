import { HttpStatus } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(createDto: CreateCategoryDto, companyIdFromQuery?: string, companyIdFromToken?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/category.entity").CategoryEntity;
    }>;
    findAll(companyId: string): Promise<{
        statusCode: HttpStatus;
        data: import("./entities/category.entity").CategoryEntity[];
    }>;
    findOne(id: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        data: import("./entities/category.entity").CategoryEntity;
    }>;
    update(id: number, updateDto: UpdateCategoryDto, companyIdFromQuery?: string, companyIdFromToken?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/category.entity").CategoryEntity;
    }>;
    softDelete(id: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
    toggleActive(id: number, active: string | undefined, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/category.entity").CategoryEntity;
    }>;
}
