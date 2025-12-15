import { ProductImageDto } from "./product-image.dto";
export declare class CreateProductDto {
    name: string;
    sku: string;
    price: number;
    discountPrice?: number;
    categoryId: number;
    isActive?: boolean;
    description?: string;
    images?: ProductImageDto[];
    thumbnail?: string;
    isFlashSell?: boolean;
    flashSellStartTime?: string;
    flashSellEndTime?: string;
    flashSellPrice?: number;
}
