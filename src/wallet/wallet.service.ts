import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TopUpDto, ChargeDto, TransactionResponseDto } from './dto/wallet.dto';

export const TransactionType = {
  TOP_UP: 'TOP_UP',
  CHARGE: 'CHARGE'
} as const;

type TransactionTypeValues = typeof TransactionType[keyof typeof TransactionType];

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  private roundAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  async createWallet() {
    return this.prisma.user.create({
      data: {
        balance: 0.00,
      },
    });
  }

  async topUp(userId: string, data: TopUpDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roundedAmount = this.roundAmount(data.amount);

    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: roundedAmount,
          },
        },
      }),
      this.prisma.transaction.create({
        data: {
          amount: roundedAmount,
          type: TransactionType.TOP_UP,
          userId: userId,
        },
      }),
    ]);

    return {
      ...updatedUser,
      balance: this.roundAmount(updatedUser.balance),
    };
  }

  async charge(userId: string, data: ChargeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roundedAmount = this.roundAmount(data.amount);

    if (user.balance < roundedAmount) {
      throw new BadRequestException('Insufficient balance');
    }

    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: roundedAmount,
          },
        },
      }),
      this.prisma.transaction.create({
        data: {
          amount: roundedAmount,
          type: TransactionType.CHARGE,
          userId: userId,
        },
      }),
    ]);

    return {
      ...updatedUser,
      balance: this.roundAmount(updatedUser.balance),
    };
  }

  async getTransactions(userId: string): Promise<TransactionResponseDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.transactions.map(transaction => ({
      ...transaction,
      amount: this.roundAmount(transaction.amount),
      type: transaction.type as TransactionTypeValues
    }));
  }
} 