// oracle-backend/src/types/auth.ts

import { AuthRequest, AuthResponse } from "./index"; // Shared types
import { supabase } from "../lib/supabaseClient"; // Use your existing supabase client path

/**
 * Handles user login and returns session tokens.
 */
export async function login(authRequest: AuthRequest): Promise<AuthResponse> {
  const { email, password } = authRequest;

  const {
    data: { user, session },
    error,
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !user || !session) {
    throw new Error(error?.message || "Authentication failed");
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

/**
 * Refreshes a user session using a refresh token.
 */
export async function refreshSession(
  refreshToken: string,
): Promise<AuthResponse> {
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !session || !session.user) {
    throw new Error(error?.message || "Invalid refresh token");
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: {
      id: session.user.id,
      email: session.user.email || "",
    },
  };
}

/**
 * Signs out the current user.
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
