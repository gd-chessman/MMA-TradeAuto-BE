import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('verify_codes')
export class VerifyCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'int' })
  type: number; // 1=email_verification, 2=password_reset, 3=telegram_link

  @Column({ type: 'boolean', default: false })
  is_used: boolean;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.verify_codes)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
