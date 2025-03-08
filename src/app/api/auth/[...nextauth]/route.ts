import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV !== 'production',
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
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('Sign in callback:', { user, account, profile });
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        return true; // Return true to continue even if there's an error
      }
    },
    async session({ session, token, user }) {
      try {
        console.log('Session callback:', { session, token, user });
        
        if (session?.user && token?.sub) {
          session.user.id = token.sub;
        }
        
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        return session;
      }
    },
    async jwt({ token, user }) {
      try {
        // Save the user ID to the token right after signin
        if (user) {
          token.userId = user.id;
        }
        return token;
      } catch (error) {
        console.error('Error in jwt callback:', error);
        return token;
      }
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get the session from server components
export const auth = () => getServerSession(authOptions);

// Export the NextAuth handler
export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
