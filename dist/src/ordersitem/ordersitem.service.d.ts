import { CreateOrdersitemDto } from './dto/create-ordersitem.dto';
import { UpdateOrdersitemDto } from './dto/update-ordersitem.dto';
import { Repository } from 'typeorm';
import { OrdersitemEntity } from './entities/ordersitem.entity';
import { Order } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
export declare class OrdersitemService {
    private readonly orderItemRepo;
    private readonly orderRepo;
    private readonly productRepo;
    constructor(orderItemRepo: Repository<OrdersitemEntity>, orderRepo: Repository<Order>, productRepo: Repository<ProductEntity>);
    create(dto: CreateOrdersitemDto): Promise<OrdersitemEntity>;
    findAll(): Promise<OrdersitemEntity[]>;
    findOne(id: number): Promise<OrdersitemEntity>;
    update(id: number, dto: UpdateOrdersitemDto): Promise<OrdersitemEntity>;
    remove(id: number): Promise<void>;
}
