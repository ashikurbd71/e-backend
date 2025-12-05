# Multi-Tenant Implementation Guide

This document outlines the multi-tenant implementation with auto-generated `companyId` for the e-commerce backend.

## Overview

Every system user has a unique auto-generated `companyId` (format: `COMP-000001`, `COMP-000002`, etc.). All entities are filtered by `companyId` to ensure data isolation between tenants.

## Implementation Status

### ✅ Completed

1. **CompanyId Service** (`src/common/services/company-id.service.ts`)
   - Auto-generates companyId in format `COMP-000001`, `COMP-000002`, etc.
   - Fetches last created companyId and increments

2. **SystemUser Entity** (`src/systemuser/entities/systemuser.entity.ts`)
   - Added `companyId` field (unique, required)

3. **SystemUser Service** (`src/systemuser/systemuser.service.ts`)
   - Auto-generates companyId on user creation
   - Includes companyId in JWT payload

4. **JWT Strategy** (`src/systemuser/jwt.strategy.ts`)
   - Returns companyId in validated payload

5. **Guards & Decorators**
   - `CompanyIdGuard` (`src/common/guards/company-id.guard.ts`) - Extracts companyId from JWT
   - `@CompanyId()` decorator (`src/common/decorators/company-id.decorator.ts`) - Parameter decorator

6. **Entities Updated** (all have `companyId` column):
   - ✅ SystemUser
   - ✅ Product
   - ✅ Category
   - ✅ Order
   - ✅ OrderItem
   - ✅ User
   - ✅ Inventory
   - ✅ CartProduct
   - ✅ Banner
   - ✅ Promocode
   - ✅ Setting
   - ✅ Help

7. **Services Updated** (with companyId filtering):
   - ✅ ProductService
   - ✅ CategoryService
   - ✅ OrderService
   - ✅ UsersService

### ⚠️ Remaining Services to Update

The following services need to be updated following the same pattern:

1. **InventoryService** (`src/inventory/inventory.service.ts`)
2. **CartproductsService** (`src/cartproducts/cartproducts.service.ts`)
3. **BannerService** (`src/banner/banner.service.ts`)
4. **PromocodeService** (`src/promocode/promocode.service.ts`)
5. **SettingService** (`src/setting/setting.service.ts`)
6. **HelpService** (`src/help/help.service.ts`)
7. **OrdersitemService** (`src/ordersitem/ordersitem.service.ts`)

## Implementation Pattern

### 1. Service Method Pattern

All service methods should accept `companyId` as a parameter and filter queries:

```typescript
// Before
async findAll(): Promise<Entity[]> {
  return this.repo.find();
}

// After
async findAll(companyId: string): Promise<Entity[]> {
  return this.repo.find({ 
    where: { companyId } 
  });
}
```

### 2. Create Method Pattern

Always set `companyId` when creating entities:

```typescript
async create(dto: CreateDto, companyId: string): Promise<Entity> {
  const entity = this.repo.create({
    ...dto,
    companyId, // Always include companyId
  });
  return this.repo.save(entity);
}
```

### 3. Find Methods Pattern

Always filter by `companyId`:

```typescript
async findOne(id: number, companyId: string): Promise<Entity> {
  const entity = await this.repo.findOne({ 
    where: { id, companyId } 
  });
  if (!entity) throw new NotFoundException('Entity not found');
  return entity;
}
```

### 4. Update/Delete Methods Pattern

Always verify companyId matches:

```typescript
async update(id: number, dto: UpdateDto, companyId: string): Promise<Entity> {
  const entity = await this.findOne(id, companyId); // This already filters by companyId
  // ... update logic
  return this.repo.save(entity);
}
```

### 5. Controller Pattern

Use guards and decorator:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanyIdGuard } from 'src/common/guards/company-id.guard';
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller('resources')
@UseGuards(JwtAuthGuard, CompanyIdGuard) // Apply guards at controller level
export class ResourceController {
  @Get()
  async findAll(@CompanyId() companyId: string) {
    return this.service.findAll(companyId);
  }

  @Post()
  async create(@Body() dto: CreateDto, @CompanyId() companyId: string) {
    return this.service.create(dto, companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @CompanyId() companyId: string) {
    return this.service.findOne(id, companyId);
  }
}
```

### 6. Related Entity Queries

When querying related entities, always filter by companyId:

```typescript
// Before
const product = await this.productRepo.findOne({ 
  where: { id: productId } 
});

// After
const product = await this.productRepo.findOne({ 
  where: { id: productId, companyId } 
});
```

## Example: Complete Service Update

### InventoryService Example

```typescript
// src/inventory/inventory.service.ts

async create(createInventoryDto: CreateInventoryDto, companyId: string) {
  const product = await this.productRepo.findOne({
    where: { id: createInventoryDto.productId, companyId }, // Filter by companyId
  });
  if (!product) {
    throw new NotFoundException('Product not found');
  }
  const inventory = this.inventoryRepo.create({
    product,
    stock: createInventoryDto.stock,
    sold: createInventoryDto.sold ?? 0,
    companyId, // Set companyId
  });
  return this.inventoryRepo.save(inventory);
}

async findAll(companyId: string) {
  return this.inventoryRepo.find({
    where: { companyId }, // Filter by companyId
    relations: { product: true },
    order: { id: 'DESC' },
  });
}

async findOne(id: number, companyId: string) {
  const inventory = await this.inventoryRepo.findOne({
    where: { id, companyId }, // Filter by companyId
    relations: { product: true },
  });
  if (!inventory) {
    throw new NotFoundException('Inventory not found');
  }
  return inventory;
}

async update(id: number, updateInventoryDto: UpdateInventoryDto, companyId: string) {
  const inventory = await this.findOne(id, companyId); // Already filters by companyId

  if (typeof updateInventoryDto.productId === 'number') {
    const product = await this.productRepo.findOne({
      where: { id: updateInventoryDto.productId, companyId }, // Filter by companyId
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    inventory.product = product;
  }
  // ... rest of update logic
  return this.inventoryRepo.save(inventory);
}
```

## Database Migration Notes

After implementing, you'll need to:

1. **Add companyId column to existing tables** (if you have existing data):
   ```sql
   ALTER TABLE tbl_products ADD COLUMN "companyId" VARCHAR NOT NULL DEFAULT 'COMP-000000';
   -- Repeat for all tables
   ```

2. **Backfill companyId for existing SystemUsers**:
   ```sql
   -- Generate companyIds for existing users
   UPDATE system_users SET "companyId" = 'COMP-' || LPAD(id::text, 6, '0') WHERE "companyId" IS NULL;
   ```

3. **Backfill companyId for all other entities** (assign based on creator or default):
   ```sql
   -- Example: Assign products to first system user's companyId
   UPDATE tbl_products SET "companyId" = (SELECT "companyId" FROM system_users LIMIT 1);
   ```

4. **Remove default values and add constraints**:
   ```sql
   ALTER TABLE tbl_products ALTER COLUMN "companyId" DROP DEFAULT;
   ALTER TABLE tbl_products ADD CONSTRAINT "FK_products_companyId" FOREIGN KEY ("companyId") REFERENCES system_users("companyId");
   ```

## Testing Checklist

- [ ] SystemUser creation generates unique companyId
- [ ] JWT contains companyId
- [ ] CompanyIdGuard extracts companyId from JWT
- [ ] All queries filter by companyId
- [ ] Users can only access their own data
- [ ] Cross-tenant access is prevented
- [ ] Related entity queries respect companyId

## Security Considerations

1. **Never trust client-provided companyId** - Always extract from JWT
2. **Always filter by companyId** - Never query without companyId filter
3. **Validate companyId in guards** - CompanyIdGuard ensures it exists
4. **Use transactions** - When creating related entities, ensure all have same companyId

## Next Steps

1. Update remaining services following the pattern above
2. Update remaining controllers to use CompanyIdGuard and @CompanyId() decorator
3. Run database migrations
4. Test multi-tenant isolation
5. Update API documentation

