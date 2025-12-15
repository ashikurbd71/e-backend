import { User } from "src/users/entities/user.entity";
import { OrdersitemEntity } from "src/ordersitem/entities/ordersitem.entity";
export declare class Order {
    id: number;
    customer?: User;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    items: OrdersitemEntity[];
    totalAmount: number;
    status: "pending" | "processing" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
    paymentReference?: string;
    paymentMethod: "DIRECT" | "COD";
    shippingTrackingId?: string;
    shippingProvider?: string;
    isPaid: boolean;
    companyId: string;
    deliveryType: "INSIDEDHAKA" | "OUTSIDEDHAKA";
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
