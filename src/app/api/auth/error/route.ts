import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const callbackUrl = searchParams.get('callbackUrl')

  // If no error is present, redirect to home
  if (!error && !errorDescription) {
    return redirect('/')
  }

  let errorMessage = errorDescription || 'An authentication error occurred'
  let statusCode = 500

  switch (error) {
    case 'Configuration':
      errorMessage = 'Server configuration error. Please check your environment variables.'
      statusCode = 500
      break
    case 'AccessDenied':
      errorMessage = 'Access denied. Please sign in with an authorized account.'
      statusCode = 403
      break
    case 'Verification':
      errorMessage = 'The verification link is invalid or has expired.'
      statusCode = 400
      break
    case 'OAuthSignin':
      errorMessage = 'Error occurred during sign in. Please try again.'
      statusCode = 400
      break
    case 'OAuthCallback':
      errorMessage = 'Error occurred during authentication callback.'
      statusCode = 400
      break
    case 'OAuthCreateAccount':
      errorMessage = 'Could not create user account.'
      statusCode = 400
      break
    case 'EmailCreateAccount':
      errorMessage = 'Could not create user account. Email may be already in use.'
      statusCode = 400
      break
    case 'Callback':
      errorMessage = 'Error occurred during authentication callback.'
      statusCode = 400
      break
    case 'TokenExpired':
      errorMessage = 'Your session has expired. Please sign in again.'
      statusCode = 401
      break
    default:
      statusCode = 500
  }

  return NextResponse.json(
    { 
      error: errorMessage,
      code: error || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString(),
      redirectUrl: callbackUrl || '/'
    },
    { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json'
      }
    }
  )
}