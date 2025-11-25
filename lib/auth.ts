/**
 * NextAuth configuration
 * TODO: Move from apps/web/lib/auth.ts or configure properly
 */

import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    // TODO: Add providers
  ],
  callbacks: {
    session: async ({ session, token }) => {
      return session;
    },
    jwt: async ({ token, user }) => {
      return token;
    },
  },
};