# E-Wallet API

A NestJS-based E-Wallet API that allows users to create wallets, manage balances through top-ups and charges, and view transaction history.

## Features

- Create wallet accounts
- Top-up wallet balance
- Charge (deduct) from wallet balance
- View transaction history
- Built-in validation and error handling
- SQLite database with Prisma ORM

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

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

3. Set up the database:
```bash
npx prisma migrate dev --name init
```

4. Start the application:
```bash
# development
npm run start:dev

# production
npm run build
npm run start:prod
```

## API Endpoints

### Create Wallet
- **POST** `/wallet/create`
- Creates a new wallet with 0.00 balance
- Response: Wallet object with ID and balance

### Top-up Wallet
- **POST** `/wallet/topup/:id`
- Add money to wallet
- Request body:
```json
{
  "amount": 100.00
}
```
- Response: Updated wallet object

### Charge Wallet
- **POST** `/wallet/charge/:id`
- Deduct money from wallet
- Request body:
```json
{
  "amount": 50.00
}
```
- Response: Updated wallet object

### Get Transaction History
- **GET** `/wallet/transactions/:id`
- Get all transactions for a wallet
- Response: Array of transactions

## Error Handling

The API includes proper error handling for:
- Invalid amounts (negative or zero)
- Insufficient balance for charges
- Non-existent wallet IDs
- Invalid input validation

## Development

### Database Migrations

To create a new migration after schema changes:
```bash
npx prisma migrate dev --name <migration-name>
```

### Code Style

The project uses ESLint and Prettier for code formatting. Run:
```bash
npm run format
npm run lint
```

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
