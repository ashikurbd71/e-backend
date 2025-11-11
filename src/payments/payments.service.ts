import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SslInitiateDto } from './dto/ssl-initiate.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly http: HttpService) {}

  async initiateSslPayment(dto: SslInitiateDto) {
    const initUrl = process.env.SSL_INIT_URL;
    const payload = {
      store_id: process.env.SSL_STORE_ID,
      store_passwd: process.env.SSL_STORE_PASSWORD,
      total_amount: dto.amount,
      currency: dto.currency || 'BDT',
      tran_id: dto.orderId,
      success_url: process.env.SSL_SUCCESS_URL,
      fail_url: process.env.SSL_FAIL_URL,
      cancel_url: process.env.SSL_CANCEL_URL,
      emi_option: 0,
      cus_name: dto.customerName,
      cus_email: dto.customerEmail,
      cus_phone: dto.customerPhone,
      cus_add1: dto.customerAddress || '',
      shipping_method: 'NO',
      product_category: 'General',
      product_profile: 'general',
    };

    if (!initUrl) {
      throw new Error('SSL_INIT_URL is not defined');
    }
    const response = await firstValueFrom(this.http.post(initUrl, payload));
    return response.data;
  }

  async validateSslPayment(valId: string) {
    const validateUrl = process.env.SSL_VALIDATION_URL;
    const params = {
      store_id: process.env.SSL_STORE_ID,
      store_passwd: process.env.SSL_STORE_PASSWORD,
      val_id: valId,
    };
    if (!validateUrl) {
      throw new Error('SSL_VALIDATION_URL is not defined');
    }
    const response = await firstValueFrom(this.http.get(validateUrl, { params }));
    return response.data;
  }

  async createCashOnDelivery(orderId: string, amount: number, address: string) {
    return {
      orderId,
      amount,
      address,
      paymentMethod: 'COD',
      status: 'pending',
      message: 'Cash on delivery placed. Collect payment on delivery.',
    };
  }
}