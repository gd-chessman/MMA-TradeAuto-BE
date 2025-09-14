import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class TelegramLoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  telegram_id: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  code: string;
}

export class LoginResponseDto {
  message: string;
}

export class UserInfoDto {
  id: number;
  telegram_id: string;
  full_name?: string;
  email?: string;
  is_verified_email: boolean;
  created_at: Date;
}

