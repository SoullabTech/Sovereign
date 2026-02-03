// backend: lib/auth.ts
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token }) { return token; },
    async session({ session }) { return session; },
  },
};

export default authOptions;
