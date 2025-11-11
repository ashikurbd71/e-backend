import { IsNumber } from 'class-validator';

export class CreateOrdersitemDto {
  @IsNumber()
  orderId: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}