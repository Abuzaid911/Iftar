// src/app/api/auth/error/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  
  console.error('Auth Error:', {
    error,
    description: searchParams.get('error_description'),
    callback: searchParams.get('callbackUrl')
  });

  let errorMessage = 'An authentication error occurred';
  let statusCode = 500;

  // Map common NextAuth errors to user-friendly messages
  switch (error) {
    case 'Configuration':
      errorMessage = 'Server configuration error';
      break;
    case 'AccessDenied':
      errorMessage = 'Access denied';
      statusCode = 403;
      break;
    case 'Verification':
      errorMessage = 'Verification link invalid or expired';
      statusCode = 400;
      break;
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'EmailCreateAccount':
    case 'Callback':
      errorMessage = 'Error during authentication';
      statusCode = 400;
      break;
    case 'CredentialsSignin':
      errorMessage = 'Invalid credentials';
      statusCode = 401;
      break;
    case 'SessionRequired':
      errorMessage = 'Please sign in to access this page';
      statusCode = 401;
      break;
    default:
      statusCode = 500;
  }

  return NextResponse.json(
    { 
      error: errorMessage,
      code: error || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    },
    { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    }
  );
}