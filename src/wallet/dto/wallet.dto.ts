import { IsNumber, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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