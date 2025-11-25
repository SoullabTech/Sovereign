/**
 * Stub Authentication Integration
 * This is a placeholder for auth functionality
 */

export const authConfig = {
  providers: [],
  callbacks: {},
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
};

export async function getSession() {
  // Stub session for demo
  return {
    user: {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User'
    }
  };
}

export async function signIn(credentials: any) {
  // Stub sign in
  return { success: true };
}

export async function signOut() {
  // Stub sign out
  return { success: true };
}

export class IntegrationAuthService {
  async getCurrentUser() {
    const session = await getSession();
    return session?.user || null;
  }

  async signIn(credentials: any) {
    return signIn(credentials);
  }

  async signOut() {
    return signOut();
  }
}