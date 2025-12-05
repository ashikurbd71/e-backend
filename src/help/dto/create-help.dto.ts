import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { SupportStatus } from '../entities/help.entity';

export class CreateHelpDto {
  @IsEmail()
  email: string;

  @IsString()
  issue: string;

  @IsOptional()
  @IsEnum(SupportStatus)
  status?: SupportStatus;

  @IsOptional()
  @IsString()
  companyId?: string;
}