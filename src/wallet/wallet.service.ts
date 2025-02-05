import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TopUpDto, ChargeDto } from './dto/wallet.dto';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

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

    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: data.amount,
          },
        },
      }),
      this.prisma.transaction.create({
        data: {
          amount: data.amount,
          type: 'TOP_UP',
          userId: userId,
        },
      }),
    ]);

    return updatedUser;
  }

  async charge(userId: string, data: ChargeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.balance < data.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const [updatedUser] = await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          balance: {
            decrement: data.amount,
          },
        },
      }),
      this.prisma.transaction.create({
        data: {
          amount: data.amount,
          type: 'CHARGE',
          userId: userId,
        },
      }),
    ]);

    return updatedUser;
  }

  async getTransactions(userId: string) {
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

    return user.transactions;
  }
} 