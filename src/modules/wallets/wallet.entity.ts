import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum WalletType {
  MAIN = 'main',
  OTHER = 'other',
  IMPORT = 'import'
}

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  sol_address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({ type: 'text' })
  private_key: string;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: WalletType.OTHER,
    enum: WalletType
  })
  wallet_type: WalletType;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.wallets)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
