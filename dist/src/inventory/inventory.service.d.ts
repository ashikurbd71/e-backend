import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { Repository } from 'typeorm';
import { InventoryEntity } from './entities/inventory.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { OrdersitemEntity } from 'src/ordersitem/entities/ordersitem.entity';
export declare class InventoryService {
    private readonly inventoryRepo;
    private readonly productRepo;
    private readonly ordersitemRepo;
    constructor(inventoryRepo: Repository<InventoryEntity>, productRepo: Repository<ProductEntity>, ordersitemRepo: Repository<OrdersitemEntity>);
    create(createInventoryDto: CreateInventoryDto, companyId: string): Promise<InventoryEntity>;
    findAll(companyId: string): Promise<InventoryEntity[]>;
    findOne(id: number, companyId: string): Promise<InventoryEntity>;
    update(id: number, updateInventoryDto: UpdateInventoryDto, companyId: string): Promise<InventoryEntity>;
    remove(id: number, companyId: string): Promise<{
        deleted: boolean;
        id: number;
    }>;
    getAnalyticsSummary(companyId: string): Promise<{
        totalItems: number;
        totalStock: number;
        totalSold: number;
        totalStockValue: number;
        inventoryRecordedIncome: number;
        totalRevenuePaidOrders: number;
        lowStockCount: number;
    }>;
    getLowStock(threshold?: number, companyId?: string): Promise<InventoryEntity[]>;
    getTopSellers(limit?: number, from?: Date, to?: Date, companyId?: string): Promise<{
        productId: number;
        productName: any;
        soldQuantity: number;
        revenue: number;
    }[]>;
}
