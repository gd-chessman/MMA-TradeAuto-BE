import { WalletType } from './wallet.entity';
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class WalletResponseDto {
  id: number;
  sol_address: string;
  name: string;
  wallet_type: WalletType;
  created_at: Date;
}

export class PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class WalletListResponseDto {
  wallets: WalletResponseDto[];
  pagination: PaginationDto;
}

export class WalletQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string; // Tìm kiếm theo tên ví hoặc địa chỉ ví

  @IsOptional()
  @IsEnum(['name', 'sol_address', 'wallet_type', 'created_at'])
  sortBy?: 'name' | 'sol_address' | 'wallet_type' | 'created_at';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}