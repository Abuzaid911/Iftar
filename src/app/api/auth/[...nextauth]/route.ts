import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const handler = NextAuth({
  debug: true, // Add debug mode to see what's happening
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign in callback:', { user, account, profile });
      return true;
    },
    async session({ session, user }) {
      console.log('Session callback:', { session, user });
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {
    async createUser(message) {
      console.log('User created:', message);
    },
    async signIn(message) {
      console.log('Sign in event:', message);
    },
  },
});

export { handler as GET, handler as POST };