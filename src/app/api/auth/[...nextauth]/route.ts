// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // Fall back to JWT if database connection fails
  session: {
    strategy: 'jwt',
  },
  // Add robust error handling
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('[NextAuth] Sign In Attempt:', { 
        email: user.email,
        provider: account?.provider 
      });
      return true;
    },
    async session({ session, token }) {
      console.log('[NextAuth] Session callback triggered');
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        console.log('[NextAuth] JWT callback - User found');
        token.userId = user.id;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
});

export { handler as GET, handler as POST };