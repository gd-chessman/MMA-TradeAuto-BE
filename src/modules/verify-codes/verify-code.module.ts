import { Module } from '@nestjs/common';
import { VerifyCodeService } from './verify-code.service';

@Module({
  providers: [VerifyCodeService],
  exports: [VerifyCodeService],
})
export class VerifyCodeModule {}
