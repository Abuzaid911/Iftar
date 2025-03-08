import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      winners: [],
      status: 'success'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}