import { IsNumber, IsPositive, IsUUID, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../wallet.service';

type TransactionTypeValues = typeof TransactionType[keyof typeof TransactionType];

export class TopUpDto {
  @ApiProperty({
    description: 'Amount to add to the wallet',
    minimum: 0.01,
    example: 100.00
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class ChargeDto {
  @ApiProperty({
    description: 'Amount to charge from the wallet',
    minimum: 0.01,
    example: 50.00
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class WalletParamDto {
  @ApiProperty({
    description: 'Wallet ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  id: string;
}

export class WalletResponseDto {
  @ApiProperty({
    description: 'Wallet ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Current balance',
    example: 150.00
  })
  balance: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-02-05T21:34:12.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-02-05T21:34:12.000Z'
  })
  updatedAt: Date;
}

export class TransactionResponseDto {
  @ApiProperty({
    description: 'Transaction ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 100.00
  })
  amount: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: Object.values(TransactionType),
    example: TransactionType.TOP_UP
  })
  @IsIn(Object.values(TransactionType))
  type: TransactionTypeValues;

  @ApiProperty({
    description: 'Wallet ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  userId: string;

  @ApiProperty({
    description: 'Transaction timestamp',
    example: '2024-02-05T21:34:12.000Z'
  })
  createdAt: Date;
} 