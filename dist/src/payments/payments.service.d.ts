import { HttpService } from '@nestjs/axios';
import { SslInitiateDto } from './dto/ssl-initiate.dto';
export declare class PaymentsService {
    private readonly http;
    constructor(http: HttpService);
    initiateSslPayment(dto: SslInitiateDto): Promise<any>;
    validateSslPayment(valId: string): Promise<any>;
    createCashOnDelivery(orderId: string, amount: number, address: string): Promise<{
        orderId: string;
        amount: number;
        address: string;
        paymentMethod: string;
        status: string;
        message: string;
    }>;
}
