import { CreateInventoryDto } from './create-inventory.dto';
declare const UpdateInventoryDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateInventoryDto>>;
export declare class UpdateInventoryDto extends UpdateInventoryDto_base {
    stock?: any;
    newStock?: any;
    sold?: any;
    productId?: any;
    companyId?: string;
}
export {};
