import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { SslInitiateDto } from './dto/ssl-initiate.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('ssl/initiate')
  @HttpCode(HttpStatus.OK)
  async initiateSsl(@Body() dto: SslInitiateDto) {
    const res = await this.paymentsService.initiateSslPayment(dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'SSL payment initiated',
      data: res,
    };
  }

  @Get('ssl/callback')
  @HttpCode(HttpStatus.OK)
  async sslCallback(@Query() query: any) {
    if (query?.val_id) {
      const validation = await this.paymentsService.validateSslPayment(query.val_id);
      return {
        statusCode: HttpStatus.OK,
        message: 'SSL payment validated',
        data: validation,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'SSL callback received',
      data: query,
    };
  }

  @Post('cod')
  @HttpCode(HttpStatus.CREATED)
  async cashOnDelivery(@Body() body: { orderId: string; amount: number; address: string }) {
    const data = await this.paymentsService.createCashOnDelivery(body.orderId, body.amount, body.address);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Cash on delivery placed',
      data,
    };
  }
}