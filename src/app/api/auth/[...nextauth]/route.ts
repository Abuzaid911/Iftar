import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter'; // Changed to next-auth adapter
import { prisma } from '@/lib/prisma';

const handler = NextAuth({
  debug: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt', // Explicitly set session strategy
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Sign in callback:', { user, account, profile });
      return true;
    },
    async session({ session, token, user }) { // Updated to handle both JWT and database sessions
      console.log('Session callback:', { session, token, user });
      
      // For JWT strategy
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      // For database strategy
      else if (session?.user && user?.id) {
        session.user.id = user.id;
      }
      
      return session;
    },
    async jwt({ token, user }) {
      // Save the user ID to the token right after signin
      if (user) {
        token.userId = user.id;
      }
      return token;
    }
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