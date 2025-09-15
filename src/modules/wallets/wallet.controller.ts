import { Controller, Get, UseGuards, Req, Query, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { WalletService } from './wallet.service';
import { WalletListResponseDto, WalletQueryDto } from './wallet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getUserWallets(
    @Req() req: Request,
    @Query(new ValidationPipe({ transform: true })) query: WalletQueryDto,
  ): Promise<WalletListResponseDto> {
    const userId = (req as any).user.id;
    return this.walletService.getUserWallets(userId, query);
  }
}
