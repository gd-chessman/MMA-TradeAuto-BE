import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Wallet } from '../wallets/wallet.entity';
import { VerifyCode } from '../verify-codes/verify-code.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  full_name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'boolean', default: false })
  is_verified_email: boolean;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  telegram_id: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Wallet, wallet => wallet.user)
  wallets: Wallet[];

  @OneToMany(() => VerifyCode, verifyCode => verifyCode.user)
  verify_codes: VerifyCode[];
}
