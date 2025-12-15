import { Repository } from "typeorm";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryEntity } from "./entities/category.entity";
export declare class CategoryService {
    private categoryRepository;
    constructor(categoryRepository: Repository<CategoryEntity>);
    create(createDto: CreateCategoryDto, companyId: string): Promise<CategoryEntity>;
    findAll(companyId: string): Promise<CategoryEntity[]>;
    findOne(id: number, companyId: string): Promise<CategoryEntity>;
    update(id: number, updateDto: UpdateCategoryDto, companyId: string): Promise<CategoryEntity>;
    softDelete(id: number, companyId: string): Promise<void>;
    toggleActive(id: number, active: boolean | undefined, companyId: string): Promise<CategoryEntity>;
}
