import { Controller, Post, Body, Res, Req, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { TelegramLoginDto, GoogleLoginDto, LoginResponseDto, UserInfoDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/telegram')
  @HttpCode(HttpStatus.OK)
  async loginWithTelegram(
    @Body() loginDto: TelegramLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.loginWithTelegram(loginDto, response);
  }

  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(
    @Body() loginDto: GoogleLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.loginWithGoogle(loginDto, response);
  }


  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.refreshAccessToken(request, response);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    return this.authService.logout(response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: Request): Promise<UserInfoDto> {
    return this.authService.getCurrentUser((req as any).user.id);
  }
}
