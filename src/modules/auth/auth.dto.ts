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

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  code: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  path?: string;
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

// Google OAuth Interfaces
export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface GoogleUserInfo {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  sub: string; // Google ID
}

export interface GoogleTokenInfo extends GoogleUserInfo {
  iss: string;
  aud: string;
}

