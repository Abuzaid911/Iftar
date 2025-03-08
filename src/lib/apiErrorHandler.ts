// src/lib/apiErrorHandler.ts
import { NextResponse } from 'next/server';

type ErrorResponseOptions = {
  status?: number;
  details?: string | null;
  errorType?: string;
}

export function errorResponse(
  message: string, 
  options: ErrorResponseOptions = {}
) {
  const {
    status = 500,
    details = null,
    errorType = 'UNKNOWN_ERROR'
  } = options;

  console.error(`[API Error] ${message}${details ? `: ${details}` : ''}`);

  return NextResponse.json(
    {
      error: message,
      type: errorType,
      details: details,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

export async function handleApiRoute(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const isPrismaError = message.includes('Prisma') || 
                         message.includes('database') ||
                         message.includes('connection');
    
    return errorResponse(
      'An error occurred while processing your request',
      {
        status: 500,
        details: message,
        errorType: isPrismaError ? 'DATABASE_ERROR' : 'SERVER_ERROR'
      }
    );
  }
}