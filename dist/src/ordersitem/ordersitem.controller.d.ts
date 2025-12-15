import { HttpStatus } from '@nestjs/common';
import { OrdersitemService } from './ordersitem.service';
import { CreateOrdersitemDto } from './dto/create-ordersitem.dto';
import { UpdateOrdersitemDto } from './dto/update-ordersitem.dto';
export declare class OrdersitemController {
    private readonly ordersitemService;
    constructor(ordersitemService: OrdersitemService);
    create(createOrdersitemDto: CreateOrdersitemDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/ordersitem.entity").OrdersitemEntity;
    }>;
    findAll(): Promise<{
        statusCode: HttpStatus;
        data: import("./entities/ordersitem.entity").OrdersitemEntity[];
    }>;
    findOne(id: string): Promise<{
        statusCode: HttpStatus;
        data: import("./entities/ordersitem.entity").OrdersitemEntity;
    }>;
    update(id: string, updateOrdersitemDto: UpdateOrdersitemDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/ordersitem.entity").OrdersitemEntity;
    }>;
    remove(id: string): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
}
