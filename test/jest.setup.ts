import { PrismaClient } from '@prisma/client';

// Extend Jest's timeout since we're dealing with a real database
jest.setTimeout(30000);

// Create a test database connection
const prisma = new PrismaClient();

// Clean up database before all tests
beforeAll(async () => {
  try {
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.error('Error cleaning up database:', error);
  }
});

// Clean up database after all tests
afterAll(async () => {
  try {
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error cleaning up database:', error);
    await prisma.$disconnect();
  }
}); 