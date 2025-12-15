import { HttpStatus } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    create(createInventoryDto: CreateInventoryDto, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/inventory.entity").InventoryEntity;
    }>;
    findAll(companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/inventory.entity").InventoryEntity[];
    }>;
    findOne(id: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/inventory.entity").InventoryEntity;
    }>;
    update(id: number, updateInventoryDto: UpdateInventoryDto, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/inventory.entity").InventoryEntity;
    }>;
    remove(id: number, companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            deleted: boolean;
            id: number;
        };
    }>;
    summary(companyId: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            totalItems: number;
            totalStock: number;
            totalSold: number;
            totalStockValue: number;
            inventoryRecordedIncome: number;
            totalRevenuePaidOrders: number;
            lowStockCount: number;
        };
    }>;
    lowStock(threshold?: string, companyId?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/inventory.entity").InventoryEntity[];
    }>;
    topSellers(limit?: string, from?: string, to?: string, companyId?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            productId: number;
            productName: any;
            soldQuantity: number;
            revenue: number;
        }[];
    }>;
}
