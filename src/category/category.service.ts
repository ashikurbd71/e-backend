import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";

import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryEntity } from "./entities/category.entity";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>
  ) {}

  async create(createDto: CreateCategoryDto): Promise<CategoryEntity  > {
const category = this.categoryRepository.create({
  name: createDto.name,
  slug: createDto.slug
    ? createDto.slug.toLowerCase()
    : createDto.name.toLowerCase().replace(/\s+/g, "-"),
  isActive: createDto.isActive ?? true,
  photo: createDto.photo,
});


    if (createDto.parentId) {
      const parent = await this.categoryRepository.findOne({ where: { id: createDto.parentId } });
      if (!parent) throw new NotFoundException("Parent category not found");
      category.parent = parent;
    }

    return this.categoryRepository.save(category);
  }

async findAll(): Promise<CategoryEntity[]> {
  const categories = await this.categoryRepository.find({
    where: { deletedAt: IsNull()}, // only non-deleted
    relations: ["parent", "children"],
  });

  // ensure slug is always string
  return categories.map(cat => ({
    ...cat,
    slug: cat.slug ? cat.slug.toLowerCase() : cat.name.toLowerCase().replace(/\s+/g, "-"),
  }));
}


async findOne(id: number): Promise<CategoryEntity> {
  const category = await this.categoryRepository.findOne({
    where: { id, deletedAt: IsNull() },
    relations: ["parent", "children"],
  });

  if (!category) throw new NotFoundException("Category not found");

  // ensure slug is never undefined
  category.slug = category.slug
    ? category.slug.toLowerCase()
    : category.name.toLowerCase().replace(/\s+/g, "-");

  return category;
}


  async update(id: number, updateDto: UpdateCategoryDto): Promise<CategoryEntity> {
    const category = await this.findOne(id);

    if (updateDto.name) category.name = updateDto.name;
    if (updateDto.slug) category.slug = updateDto.slug;
    if (updateDto.photo) category.photo = updateDto.photo;
    if (updateDto.isActive !== undefined) category.isActive = updateDto.isActive;

    if (updateDto.parentId) {
      const parent = await this.categoryRepository.findOne({ where: { id: updateDto.parentId } });
      if (!parent) throw new NotFoundException("Parent category not found");
      if (parent.id === id) throw new BadRequestException("Category cannot be its own parent");
      category.parent = parent;
    }

    return this.categoryRepository.save(category);
  }

  async softDelete(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.softRemove(category); // Soft delete sets deletedAt timestamp
  }

  async toggleActive(id: number, active?: boolean): Promise<CategoryEntity> {
    const category = await this.findOne(id);
    category.isActive = active !== undefined ? active : !category.isActive;
    return this.categoryRepository.save(category);
  }
}
