// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma, ensureConnection } from '@/lib/prisma';

export async function GET() {
  console.log('[API] GET /api/health - Health check requested');
  
  const startTime = Date.now();
  const results = {
    status: 'unknown',
    database: {
      connected: false,
      responseTime: 0,
      error: null as string | null,
    },
    environment: {
      database: !!process.env.DATABASE_URL,
      cloudinary: !!(
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET
      ),
      nextAuth: !!(
        process.env.NEXTAUTH_SECRET && 
        process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET
      ),
    },
    timestamp: new Date().toISOString(),
  };

  try {
    // Test database connection
    console.log('[API] Health check - Testing database connection');
    const dbStartTime = Date.now();
    
    const connected = await ensureConnection();
    results.database.connected = connected;
    
    if (connected) {
      // Run a simple query to make sure we can read/write
      await prisma.$queryRaw`SELECT 1 as connected`;
      
      // Check if we can access a table
      const userCount = await prisma.user.count();
      const postCount = await prisma.post.count();
      
      results.database.responseTime = Date.now() - dbStartTime;
      console.log('[API] Health check - Database connected, counts:', { users: userCount, posts: postCount });
    } else {
      results.database.error = 'Failed to connect to database';
      console.error('[API] Health check - Database connection failed');
    }
    
    results.status = results.database.connected ? 'healthy' : 'unhealthy';
  } catch (error) {
    console.error('[API] Health check - Error:', error);
    results.status = 'error';
    results.database.error = error instanceof Error ? error.message : 'Unknown database error';
  }

  // Add total response time
  const responseTime = Date.now() - startTime;
  
  return NextResponse.json({
    ...results,
    responseTime,
  }, { 
    status: results.status === 'healthy' ? 200 : 500 
  });
}