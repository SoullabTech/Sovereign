// oracle-backend/src/services/authService.ts

import { supabase } from "../lib/supabaseClient";
import type { AuthRequest, AuthResponse } from "../types/auth";

/**
 * Handles user authentication and returns access and refresh tokens.
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
      email: user.email ?? "",
    },
  };
}

/**
 * Refreshes the session using a refresh token.
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
      email: session.user.email ?? "",
    },
  };
}

/**
 * Logs out the user and ends the session.
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}
