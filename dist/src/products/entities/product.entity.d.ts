import { CategoryEntity } from "src/category/entities/category.entity";
export declare class ProductEntity {
    id: number;
    name: string;
    sku: string;
    price: number;
    discountPrice?: number;
    description?: string;
    images?: {
        url: string;
        alt?: string;
        isPrimary?: boolean;
    }[];
    thumbnail?: string;
    isActive: boolean;
    isFlashSell: boolean;
    flashSellStartTime?: Date;
    flashSellEndTime?: Date;
    flashSellPrice?: number;
    companyId: string;
    category: CategoryEntity;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
