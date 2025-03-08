// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Handler is the only export from this file
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };