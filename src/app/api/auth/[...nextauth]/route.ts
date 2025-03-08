import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// In your [...nextauth]/route.ts file
export const authOptions: NextAuthOptions = {
  // Remove the adapter line temporarily
  // adapter: PrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  // Simplify callbacks
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};