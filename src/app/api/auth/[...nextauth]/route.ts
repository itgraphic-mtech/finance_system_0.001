import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        // return minimal user object
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    // add explicit types to avoid implicit 'any' errors from TS
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        (session as any).user.id = (token as any).id;
        (session as any).user.role = (token as any).role;
      }
      return session;
    }
  
  },
  pages: {
    signIn: '/auth/login'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
