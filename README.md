# E-Wallet API

A NestJS-based E-Wallet API that allows users to create wallets, manage balances through top-ups and charges, and view transaction history. Built with NestJS, Prisma ORM, and SQLite.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Error Handling](#error-handling)
- [Development](#development)
- [Testing](#testing)

## Features

- ✅ Create wallet accounts with zero initial balance
- 💰 Top-up wallet balance with validation
- 💳 Charge (deduct) from wallet with balance checks
- 📜 View transaction history
- 🔒 Built-in validation and error handling
- 📝 Swagger API documentation
- 🎯 Type-safe transaction handling
- 🔄 Atomic transactions for balance operations

## Tech Stack

- **Framework**: NestJS v10
- **Database**: SQLite
- **ORM**: Prisma
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator & class-transformer
- **Type Safety**: TypeScript

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd e-wallet-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env

# The default SQLite configuration is:
DATABASE_URL="file:./dev.db"
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init
```

## Running the App

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, visit `http://localhost:3000/api` to access the Swagger documentation.

### API Endpoints

#### Create Wallet
```http
POST /wallet
Response: WalletResponseDto
```

#### Top-up Wallet
```http
POST /wallet/topup/:id
Body: {
  "amount": number // Positive number with up to 2 decimal places
}
Response: WalletResponseDto
```

#### Charge Wallet
```http
POST /wallet/charge/:id
Body: {
  "amount": number // Positive number with up to 2 decimal places
}
Response: WalletResponseDto
```

#### Get Transaction History
```http
GET /wallet/transactions/:id
Response: TransactionResponseDto[]
```

### Example Requests

#### Create a New Wallet
```bash
curl -X POST http://localhost:3000/wallet
```

#### Top-up Wallet
```bash
curl -X POST http://localhost:3000/wallet/topup/YOUR_WALLET_ID \
  -H "Content-Type: application/json" \
  -d '{"amount": 100.00}'
```

#### Charge Wallet
```bash
curl -X POST http://localhost:3000/wallet/charge/YOUR_WALLET_ID \
  -H "Content-Type: application/json" \
  -d '{"amount": 50.00}'
```

#### Get Transactions
```bash
curl http://localhost:3000/wallet/transactions/YOUR_WALLET_ID
```

## Database Schema

### User Model
```prisma
model User {
  id           String        @id @default(uuid())
  balance      Float         @default(0.00)
  transactions Transaction[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}
```

### Transaction Model
```prisma
model Transaction {
  id        String   @id @default(uuid())
  amount    Float
  type      String   // 'TOP_UP' or 'CHARGE'
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

## Error Handling

The API includes comprehensive error handling for:
- ❌ Invalid amounts (negative or zero)
- ❌ Insufficient balance for charges
- ❌ Non-existent wallet IDs
- ❌ Invalid input validation
- ❌ Invalid transaction types

Error responses follow a consistent format:
```json
{
  "statusCode": number,
  "message": string,
  "error": string
}
```

## Development

### Database Management

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (caution: deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Code Style

The project uses ESLint and Prettier for code formatting:
```bash
# Format code
npm run format

# Lint code
npm run lint
```

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
