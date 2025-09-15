import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Or } from 'typeorm';
import { Wallet } from './wallet.entity';
import { WalletListResponseDto, WalletResponseDto, WalletQueryDto, PaginationDto } from './wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async getUserWallets(userId: number, query: WalletQueryDto): Promise<WalletListResponseDto> {
    const {
      search,
      sortBy = 'created_at',
      sortOrder = 'ASC',
      page = 1,
      limit = 10,
    } = query;

    // Xây dựng where condition
    let whereCondition: any = { user_id: userId };
    
    if (search) {
      // Tìm kiếm theo cả tên ví và địa chỉ ví
      whereCondition = [
        { user_id: userId, name: Like(`%${search}%`) },
        { user_id: userId, sol_address: Like(`%${search}%`) }
      ];
    }

    // Xây dựng order condition
    const orderCondition: any = {};
    orderCondition[sortBy] = sortOrder;

    // Tính toán offset
    const offset = (page - 1) * limit;

    // Lấy tổng số records (cho pagination)
    const total = await this.walletRepository.count({
      where: whereCondition,
    });

    // Lấy danh sách wallets với pagination
    const wallets = await this.walletRepository.find({
      where: whereCondition,
      select: ['id', 'sol_address', 'name', 'wallet_type', 'created_at'],
      order: orderCondition,
      skip: offset,
      take: limit,
    });

    const walletResponses: WalletResponseDto[] = wallets.map(wallet => ({
      id: wallet.id,
      sol_address: wallet.sol_address,
      name: wallet.name,
      wallet_type: wallet.wallet_type,
      created_at: wallet.created_at,
    }));

    // Tính tổng số trang
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationDto = {
      page,
      limit,
      total,
      totalPages,
    };

    return {
      wallets: walletResponses,
      pagination,
    };
  }
}
