import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { User } from '../users/user.entity';
import { VerifyCode } from '../verify-codes/verify-code.entity';
import { TelegramLoginDto, LoginResponseDto, UserInfoDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(VerifyCode)
    private verifyCodeRepository: Repository<VerifyCode>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async loginWithTelegram(loginDto: TelegramLoginDto, response: Response): Promise<LoginResponseDto> {
    const { telegram_id, code } = loginDto;

    // Tìm user theo telegram_id
    const user = await this.userRepository.findOne({
      where: { telegram_id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Tìm verify code chưa sử dụng
    const verifyCode = await this.verifyCodeRepository.findOne({
      where: {
        user_id: user.id,
        code,
        type: 3, // telegram_link
        is_used: false,
      },
    });

    if (!verifyCode) {
      throw new UnauthorizedException('Invalid or expired verification code');
    }

    // Kiểm tra code có hết hạn không
    if (new Date() > verifyCode.expires_at) {
      throw new UnauthorizedException('Verification code has expired');
    }

    // Đánh dấu code đã sử dụng
    verifyCode.is_used = true;
    await this.verifyCodeRepository.save(verifyCode);

    // Tạo access token và refresh token
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Set HTTP only cookies
    this.setAccessTokenCookie(response, accessToken);
    this.setRefreshTokenCookie(response, refreshToken);

    return {
      message: 'Login successful',
    };
  }


  generateAccessToken(user: any): string {
    const payload = { 
      sub: user.id, 
      telegram_id: user.telegram_id,
      email: user.email,
      type: 'access'
    };
    
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });
  }

  generateRefreshToken(user: any): string {
    const payload = { 
      sub: user.id, 
      telegram_id: user.telegram_id,
      type: 'refresh'
    };
    
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
  }

  setAccessTokenCookie(response: Response, token: string): void {
    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  }

  setRefreshTokenCookie(response: Response, token: string): void {
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  async refreshAccessToken(request: Request, response: Response): Promise<LoginResponseDto> {
    // Lấy refresh token từ cookie
    const refreshToken = request.cookies?.refresh_token;
    
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Tạo access token mới
    const newAccessToken = this.generateAccessToken(user);
    this.setAccessTokenCookie(response, newAccessToken);

    return {
      message: 'Token refreshed successfully',
    };
  }

  async logout(response: Response): Promise<LoginResponseDto> {
    // Xóa cả access token và refresh token cookies
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });
    
    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });

    return {
      message: 'Logout successful',
    };
  }

  async getCurrentUser(userId: number): Promise<UserInfoDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      telegram_id: user.telegram_id,
      full_name: user.full_name,
      email: user.email,
      is_verified_email: user.is_verified_email,
      created_at: user.created_at,
    };
  }

}
