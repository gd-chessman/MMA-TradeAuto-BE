import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramBotService } from './telegram-bot.service';
import { User } from '../users/user.entity';
import { Wallet } from '../wallets/wallet.entity';
import { VerifyCode } from '../verify-codes/verify-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Wallet, VerifyCode]),
  ],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}