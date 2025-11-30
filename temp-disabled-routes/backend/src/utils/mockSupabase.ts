import type { AuthResponse } from "../types";

export const supabase = {
  auth: {
    signInWithPassword: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<AuthResponse> => {
      console.log(`[Mock Supabase] signIn called with: ${email}, ${password}`);
      return {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: {
          id: "mock-user-id",
          email,
        },
      };
    },
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async (payload: any) => ({ data: [payload], error: null }),
    update: async (changes: any) => ({ data: [changes], error: null }),
    delete: async () => ({ data: [], error: null }),
  }),
};
