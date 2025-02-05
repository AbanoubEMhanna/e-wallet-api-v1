import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionType } from '../src/wallet/wallet.service';
import { v4 as uuidv4 } from 'uuid';

describe('WalletController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let walletId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    // Apply the same validation pipe as in main.ts
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    await app.init();

    // Clean the database before tests
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /wallet', () => {
    it('should create a new wallet', async () => {
      const response = await request(app.getHttpServer())
        .post('/wallet')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.balance).toBe(0);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
      walletId = response.body.id;
    });

    it('should create unique wallets', async () => {
      const [wallet1, wallet2] = await Promise.all([
        request(app.getHttpServer()).post('/wallet'),
        request(app.getHttpServer()).post('/wallet')
      ]);

      expect(wallet1.body.id).not.toBe(wallet2.body.id);
    });
  });

  describe('POST /wallet/topup/:id', () => {
    it('should top up wallet successfully', async () => {
      const amount = 100.00;
      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .send({ amount })
        .expect(201);

      expect(response.body.balance).toBe(amount);
      expect(response.body.id).toBe(walletId);
    });

    it('should accumulate balance on multiple top-ups', async () => {
      const amount1 = 50.00;
      const amount2 = 75.00;
      
      await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .send({ amount: amount1 })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .send({ amount: amount2 })
        .expect(201);

      expect(response.body.balance).toBe(225.00); // 100 + 50 + 75
    });

    it('should fail with negative amount', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .send({ amount: -50 })
        .expect(400);

      expect(response.body.message).toEqual(['amount must be a positive number']);
    });

    it('should fail with zero amount', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .send({ amount: 0 })
        .expect(400);

      expect(response.body.message).toEqual(['amount must be a positive number']);
    });

    it('should fail with non-existent wallet', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${nonExistentId}`)
        .send({ amount: 50 })
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should fail with invalid amount type', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .send({ amount: 'invalid' })
        .expect(400);

      expect(response.body.message).toEqual([
        'amount must be a positive number',
        'amount must be a number conforming to the specified constraints'
      ]);
    });
  });

  describe('POST /wallet/charge/:id', () => {
    it('should charge wallet successfully', async () => {
      const chargeAmount = 50.00;
      const response = await request(app.getHttpServer())
        .post(`/wallet/charge/${walletId}`)
        .send({ amount: chargeAmount })
        .expect(201);

      expect(response.body.balance).toBe(175.00); // 225 - 50
    });

    it('should handle multiple charges', async () => {
      const charge1 = 25.00;
      const charge2 = 50.00;

      await request(app.getHttpServer())
        .post(`/wallet/charge/${walletId}`)
        .send({ amount: charge1 })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/wallet/charge/${walletId}`)
        .send({ amount: charge2 })
        .expect(201);

      expect(response.body.balance).toBe(100.00); // 175 - 25 - 50
    });

    it('should fail with insufficient balance', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/charge/${walletId}`)
        .send({ amount: 1000 })
        .expect(400);

      expect(response.body.message).toBe('Insufficient balance');
    });

    it('should fail with negative amount', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/charge/${walletId}`)
        .send({ amount: -50 })
        .expect(400);

      expect(response.body.message).toEqual(['amount must be a positive number']);
    });

    it('should fail with zero amount', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/charge/${walletId}`)
        .send({ amount: 0 })
        .expect(400);

      expect(response.body.message).toEqual(['amount must be a positive number']);
    });

    it('should fail with non-existent wallet', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app.getHttpServer())
        .post(`/wallet/charge/${nonExistentId}`)
        .send({ amount: 50 })
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /wallet/transactions/:id', () => {
    it('should get wallet transactions', async () => {
      const response = await request(app.getHttpServer())
        .get(`/wallet/transactions/${walletId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(6); // All previous transactions
      
      // Verify transaction details
      const transactions = response.body;
      expect(transactions.some(t => t.type === TransactionType.TOP_UP)).toBe(true);
      expect(transactions.some(t => t.type === TransactionType.CHARGE)).toBe(true);

      // Verify transaction properties
      const transaction = transactions[0];
      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('amount');
      expect(transaction).toHaveProperty('type');
      expect(transaction).toHaveProperty('userId');
      expect(transaction).toHaveProperty('createdAt');
    });

    it('should fail with non-existent wallet', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app.getHttpServer())
        .get(`/wallet/transactions/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should return transactions in descending order by date', async () => {
      const response = await request(app.getHttpServer())
        .get(`/wallet/transactions/${walletId}`)
        .expect(200);

      const transactions = response.body;
      for (let i = 1; i < transactions.length; i++) {
        const prevDate = new Date(transactions[i - 1].createdAt);
        const currDate = new Date(transactions[i].createdAt);
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
      }
    });

    it('should return empty array for wallet with no transactions', async () => {
      // Create a new wallet
      const newWalletResponse = await request(app.getHttpServer())
        .post('/wallet')
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/wallet/transactions/${newWalletResponse.body.id}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid UUID format', async () => {
      const response = await request(app.getHttpServer())
        .get('/wallet/transactions/invalid-uuid')
        .expect(400);

      expect(response.body.message).toEqual(['id must be a UUID']);
    });

    it('should handle invalid request body', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .send({ invalidField: 100 })
        .expect(400);

      expect(response.body.message).toEqual([
        'property invalidField should not exist',
        'amount must be a positive number',
        'amount must be a number conforming to the specified constraints'
      ]);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .send({})
        .expect(400);

      expect(response.body.message).toEqual([
        'amount must be a positive number',
        'amount must be a number conforming to the specified constraints'
      ]);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .set('Content-Type', 'application/json')
        .send('{"amount":')
        .expect(400);

      expect(response.body).toHaveProperty('statusCode', 400);
    });

    it('should handle decimal precision', async () => {
      const response = await request(app.getHttpServer())
        .post(`/wallet/topup/${walletId}`)
        .send({ amount: 10.999 })
        .expect(201);

      expect(response.body.balance).toBe(111.00); // Previous 100 + 11.00 (rounded)
    });
  });
});
