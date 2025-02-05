import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TopUpDto, ChargeDto, WalletParamDto, WalletResponseDto, TransactionResponseDto } from './dto/wallet.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ 
    status: 201, 
    description: 'Wallet created successfully.',
    type: WalletResponseDto
  })
  async createWallet(): Promise<WalletResponseDto> {
    return this.walletService.createWallet();
  }

  @Post('topup/:id')
  @ApiOperation({ summary: 'Add balance to wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance added successfully.',
    type: WalletResponseDto
  })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  async topUp(
    @Param() params: WalletParamDto, 
    @Body() topUpDto: TopUpDto
  ): Promise<WalletResponseDto> {
    return this.walletService.topUp(params.id, topUpDto);
  }

  @Post('charge/:id')
  @ApiOperation({ summary: 'Charge wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Charge successful.',
    type: WalletResponseDto
  })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  @ApiResponse({ status: 400, description: 'Insufficient balance.' })
  async charge(
    @Param() params: WalletParamDto, 
    @Body() chargeDto: ChargeDto
  ): Promise<WalletResponseDto> {
    return this.walletService.charge(params.id, chargeDto);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get wallet transactions' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transactions retrieved successfully.',
    type: [TransactionResponseDto]
  })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  async getTransactions(
    @Param() params: WalletParamDto
  ): Promise<TransactionResponseDto[]> {
    return this.walletService.getTransactions(params.id);
  }
} 