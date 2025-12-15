import { Order } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
export declare class OrdersitemEntity {
    id: number;
    order: Order;
    product: ProductEntity;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
