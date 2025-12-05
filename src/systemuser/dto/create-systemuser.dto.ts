import { IsArray, IsEmail, IsEnum, IsString, MinLength, IsOptional, IsNumber, IsObject } from 'class-validator';
import { FeaturePermission } from '../feature-permission.enum';

export class PaymentInfoDto {
  @IsOptional()
  @IsString()
  paymentstatus?: string;

  @IsOptional()
  @IsString()
  paymentmethod?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  packagename?: string;
}

export class CreateSystemuserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  companyLogo?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  branchLocation?: string;

  @IsArray()
  @IsEnum(FeaturePermission, { each: true })
  permissions: FeaturePermission[];

  @IsOptional()
  @IsObject()
  paymentInfo?: PaymentInfoDto;
}
