import { ProductEntity } from "src/products/entities/product.entity";
export declare class InventoryEntity {
    id: number;
    product: ProductEntity;
    stock: number;
    newStock: number;
    sold: number;
    totalIncome: number;
    isLowStock: boolean;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
