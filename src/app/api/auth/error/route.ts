import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  let errorMessage = errorDescription || 'An authentication error occurred'
  
  switch (error) {
    case 'Configuration':
      errorMessage = 'Server configuration error. Please check your environment variables.'
      break
    case 'AccessDenied':
      errorMessage = 'Access denied. Please sign in with an authorized account.'
      break
    case 'Verification':
      errorMessage = 'The verification link is invalid or has expired.'
      break
    case 'OAuthSignin':
      errorMessage = 'Error occurred during sign in. Please try again.'
      break
    case 'OAuthCallback':
      errorMessage = 'Error occurred during authentication callback.'
      break
    case 'OAuthCreateAccount':
      errorMessage = 'Could not create user account.'
      break
    case 'EmailCreateAccount':
      errorMessage = 'Could not create user account. Email may be already in use.'
      break
    case 'Callback':
      errorMessage = 'Error occurred during authentication callback.'
      break
    case 'TokenExpired':
      errorMessage = 'Your session has expired. Please sign in again.'
      break
    default:
      if (error) {
        errorMessage = `Authentication error: ${error}`
      }
  }

  return NextResponse.json(
    { 
      error: errorMessage,
      code: error || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    },
    { 
      status: error ? 400 : 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  )
}