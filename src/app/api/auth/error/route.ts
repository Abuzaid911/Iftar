import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')

  let errorMessage = 'An authentication error occurred'
  
  switch (error) {
    case 'Configuration':
      errorMessage = 'There is a problem with the server configuration.'
      break
    case 'AccessDenied':
      errorMessage = 'Access denied. You do not have permission to access this resource.'
      break
    case 'Verification':
      errorMessage = 'The verification link is invalid or has expired.'
      break
    default:
      if (error) {
        errorMessage = `Authentication error: ${error}`
      }
  }

  return NextResponse.json(
    { error: errorMessage },
    { status: error ? 400 : 500 }
  )
}