import { HttpStatus } from '@nestjs/common';
import { CartproductsService } from './cartproducts.service';
import { CreateCartproductDto } from './dto/create-cartproduct.dto';
export declare class CartproductsController {
    private readonly cartproductsService;
    constructor(cartproductsService: CartproductsService);
    create(createCartproductDto: CreateCartproductDto, companyId?: string, companyIdFromToken?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/cartproduct.entity").Cartproduct;
    }>;
    findByUser(userId: number, companyId?: string, companyIdFromToken?: string): Promise<{
        statusCode: HttpStatus;
        data: import("./entities/cartproduct.entity").Cartproduct[];
    }>;
    clearUserCart(userId: number, companyId?: string, companyIdFromToken?: string): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            affected: number;
        };
    }>;
    orderFromCart(userId: number, payload?: {
        paymentMethod?: 'DIRECT' | 'COD';
        pickupPoint?: any;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            order: import("../orders/entities/order.entity").Order | null;
            payment: any;
        };
    }>;
}
