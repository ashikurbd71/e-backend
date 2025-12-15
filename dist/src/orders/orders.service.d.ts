import { Repository, DataSource } from "typeorm";
import { Order } from "./entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ProductEntity } from "src/products/entities/product.entity";
import { InventoryEntity } from "src/inventory/entities/inventory.entity";
import { User } from "src/users/entities/user.entity";
import { OrdersitemEntity } from "src/ordersitem/entities/ordersitem.entity";
import { PaymentsService } from "src/payments/payments.service";
export declare class OrderService {
    private orderRepo;
    private orderItemRepo;
    private productRepo;
    private inventoryRepo;
    private userRepo;
    private dataSource;
    private readonly paymentsService;
    private readonly mailer;
    constructor(orderRepo: Repository<Order>, orderItemRepo: Repository<OrdersitemEntity>, productRepo: Repository<ProductEntity>, inventoryRepo: Repository<InventoryEntity>, userRepo: Repository<User>, dataSource: DataSource, paymentsService: PaymentsService, mailer: {
        sendMail: (message: unknown) => Promise<{
            id?: string;
        }>;
    });
    create(createDto: CreateOrderDto, companyId: string): Promise<{
        order: Order | null;
        payment: any;
    }>;
    findAll(companyId: string): Promise<Order[]>;
    findByCustomerId(customerId: number, companyId: string): Promise<Order[]>;
    findOne(id: number, companyId: string): Promise<Order>;
    completeOrder(id: number, companyId: string, paymentRef?: string): Promise<Order>;
    cancelOrder(id: number, companyId: string, userId?: number): Promise<{
        message: string;
    }>;
    deliverOrder(id: number, companyId: string): Promise<Order>;
    shipOrder(id: number, companyId: string, trackingId?: string, provider?: string): Promise<Order>;
    refundOrder(id: number, companyId: string): Promise<Order>;
    private sendLowStockEmail;
}
