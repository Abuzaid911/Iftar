// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ user: null });
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Session fallback error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}