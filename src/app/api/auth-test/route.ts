// src/app/api/auth-test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + "...",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Present" : "Missing",
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Present" : "Missing",
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}