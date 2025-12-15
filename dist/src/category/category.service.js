"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
let CategoryService = class CategoryService {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async create(createDto, companyId) {
        const category = this.categoryRepository.create({
            name: createDto.name,
            slug: createDto.slug
                ? createDto.slug.toLowerCase()
                : createDto.name.toLowerCase().replace(/\s+/g, "-"),
            isActive: createDto.isActive ?? true,
            photo: createDto.photo,
            companyId,
        });
        if (createDto.parentId) {
            const parent = await this.categoryRepository.findOne({
                where: { id: createDto.parentId, companyId }
            });
            if (!parent)
                throw new common_1.NotFoundException("Parent category not found");
            category.parent = parent;
        }
        return this.categoryRepository.save(category);
    }
    async findAll(companyId) {
        const categories = await this.categoryRepository.find({
            where: { deletedAt: (0, typeorm_2.IsNull)(), companyId },
            relations: ["parent", "children"],
        });
        return categories.map(cat => ({
            ...cat,
            slug: cat.slug ? cat.slug.toLowerCase() : cat.name.toLowerCase().replace(/\s+/g, "-"),
        }));
    }
    async findOne(id, companyId) {
        const category = await this.categoryRepository.findOne({
            where: { id, deletedAt: (0, typeorm_2.IsNull)(), companyId },
            relations: ["parent", "children"],
        });
        if (!category)
            throw new common_1.NotFoundException("Category not found");
        category.slug = category.slug
            ? category.slug.toLowerCase()
            : category.name.toLowerCase().replace(/\s+/g, "-");
        return category;
    }
    async update(id, updateDto, companyId) {
        const category = await this.findOne(id, companyId);
        if (updateDto.name !== undefined)
            category.name = updateDto.name;
        if (updateDto.slug !== undefined || updateDto.name !== undefined) {
            const normalizedSlug = updateDto.slug
                ? updateDto.slug.toLowerCase()
                : (updateDto.name ?? category.name).toLowerCase().replace(/\s+/g, "-");
            category.slug = normalizedSlug;
        }
        if (updateDto.photo !== undefined)
            category.photo = updateDto.photo;
        if (updateDto.isActive !== undefined)
            category.isActive = updateDto.isActive;
        if (updateDto.parentId !== undefined) {
            if (updateDto.parentId === null) {
                category.parent = null;
            }
            else {
                const parent = await this.categoryRepository.findOne({
                    where: { id: updateDto.parentId, companyId }
                });
                if (!parent)
                    throw new common_1.NotFoundException("Parent category not found");
                if (parent.id === id)
                    throw new common_1.BadRequestException("Category cannot be its own parent");
                category.parent = parent;
            }
        }
        return this.categoryRepository.save(category);
    }
    async softDelete(id, companyId) {
        const category = await this.findOne(id, companyId);
        await this.categoryRepository.softRemove(category);
    }
    async toggleActive(id, active, companyId) {
        const category = await this.findOne(id, companyId);
        category.isActive = active !== undefined ? active : !category.isActive;
        return this.categoryRepository.save(category);
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.CategoryEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoryService);
//# sourceMappingURL=category.service.js.map