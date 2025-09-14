import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TelegramLoginDto {
  @IsString()
  @IsNotEmpty()
  telegram_id: string;

  @IsString()
  @IsNotEmpty()
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

