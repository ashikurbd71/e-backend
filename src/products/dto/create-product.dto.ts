import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { ProductImageDto } from "./product-image.dto";

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discountPrice?: number;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsBoolean()
  isFlashSell?: boolean;

  @IsOptional()
  @IsDateString()
  flashSellStartTime?: string;

  @IsOptional()
  @IsDateString()
  flashSellEndTime?: string;

  @IsOptional()
  @IsNumber()
  flashSellPrice?: number;
}
