import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BroadcastEmailDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsString()
  html?: string;
}

