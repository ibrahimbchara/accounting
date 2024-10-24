import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Test the database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
}

export { prisma, testConnection };