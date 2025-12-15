import { OrderService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(dto: CreateOrderDto, companyIdFromQuery?: string, companyIdFromToken?: string): Promise<{
        statusCode: number;
        message: string;
        data: {
            order: import("./entities/order.entity").Order | null;
            payment: any;
        };
    }>;
    getMyOrders(userId: number, companyId: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/order.entity").Order[];
    }>;
    findAll(companyId: string): Promise<{
        statusCode: number;
        data: import("./entities/order.entity").Order[];
    }>;
    findOne(id: number, companyId: string): Promise<{
        statusCode: number;
        data: import("./entities/order.entity").Order;
    }>;
    complete(id: number, body: {
        paymentRef?: string;
    }, companyId: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/order.entity").Order;
    }>;
    deliver(id: number, companyId: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/order.entity").Order;
    }>;
    cancel(id: number, userId: number, companyId: string): Promise<{
        message: string;
        statusCode: number;
    }>;
    success(id: number, companyId: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/order.entity").Order;
    }>;
    ship(id: number, body: {
        trackingId?: string;
        provider?: string;
    }, companyId: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/order.entity").Order;
    }>;
    refund(id: number, companyId: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/order.entity").Order;
    }>;
}
