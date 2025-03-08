// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client"

// Custom error handling
class PrismaClientSingleton {
  private static instance: PrismaClient;
  private static isConnecting: boolean = false;
  private static connectionPromise: Promise<void> | null = null;
  private static retryCount: number = 0;
  private static maxRetries: number = 3;

  static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      console.log('[Prisma] Creating new PrismaClient instance');
      PrismaClientSingleton.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'error', 'warn'] 
          : ['error'],
        errorFormat: 'pretty',
      });
    }
    return PrismaClientSingleton.instance;
  }

  static async connect(): Promise<void> {
    if (PrismaClientSingleton.isConnecting && PrismaClientSingleton.connectionPromise) {
      return PrismaClientSingleton.connectionPromise;
    }

    PrismaClientSingleton.isConnecting = true;
    PrismaClientSingleton.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        const client = PrismaClientSingleton.getInstance();
        // Test connection with simple query
        await client.$queryRaw`SELECT 1 as connected`;
        console.log('[Prisma] Connected to database');
        PrismaClientSingleton.retryCount = 0;
        resolve();
      } catch (error) {
        console.error('[Prisma] Connection error:', error);
        
        if (PrismaClientSingleton.retryCount < PrismaClientSingleton.maxRetries) {
          PrismaClientSingleton.retryCount++;
          console.log(`[Prisma] Retrying connection (${PrismaClientSingleton.retryCount}/${PrismaClientSingleton.maxRetries})`);
          
          // Wait before retrying
          await new Promise(r => setTimeout(r, 1000));
          
          // Disconnect and reconnect
          try {
            await PrismaClientSingleton.instance.$disconnect();
          } catch (e) {
            // Ignore disconnect errors
          }
          
          // Create a new instance
          PrismaClientSingleton.instance = new PrismaClient({
            log: process.env.NODE_ENV === 'development' 
              ? ['query', 'error', 'warn'] 
              : ['error'],
            errorFormat: 'pretty',
          });
          
          // Try again
          PrismaClientSingleton.isConnecting = false;
          resolve(PrismaClientSingleton.connect());
        } else {
          console.error('[Prisma] Max retries reached, giving up');
          reject(error);
        }
      } finally {
        PrismaClientSingleton.isConnecting = false;
      }
    });

    return PrismaClientSingleton.connectionPromise;
  }
}

// For development purposes, log the database URL (with credentials hidden)
if (process.env.NODE_ENV === 'development') {
  const dbUrl = process.env.DATABASE_URL || '';
  const maskedUrl = dbUrl.replace(/(.*?:\/\/)([^@]*@)/, '$1***:***@');
  console.log(`[Prisma] Connecting to: ${maskedUrl}`);
}

// Export the prisma client
export const prisma = PrismaClientSingleton.getInstance();

// Ensure connection before returning
export async function ensureConnection() {
  try {
    await PrismaClientSingleton.connect();
    return true;
  } catch (error) {
    console.error('[Prisma] Failed to connect to database after multiple retries', error);
    return false;
  }
}

// Global for NextJS hot reloading
if (process.env.NODE_ENV !== "production") {
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
  }
}