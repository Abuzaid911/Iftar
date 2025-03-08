// src/app/api/db-test/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as connected`;
    return NextResponse.json({ status: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to database', details: error },
      { status: 500 }
    );
  }
}