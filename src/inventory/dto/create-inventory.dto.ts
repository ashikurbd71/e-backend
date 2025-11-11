import { IsInt, Min, IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sold?: number;
}