import { IsInt, Min } from 'class-validator';

export class CreateCartproductDto {
  @IsInt()
  userId: number;

  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}