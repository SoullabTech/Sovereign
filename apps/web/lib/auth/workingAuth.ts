"use client";

import { createClient } from '@supabase/supabase-js';
import { User, AuthError } from "@supabase/supabase-js";

/**
 * Working Authentication Service
 * Provides actual Supabase authentication with OAuth support
 */
export class WorkingAuthService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Check environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * Magic Link Authentication
   */
  async signInWithEmail(email: string, redirectPath?: string): Promise<{ data?: any; error?: AuthError | null }> {
    try {
      const baseUrl = window.location.origin;
      const redirectTo = redirectPath
        ? `${baseUrl}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
        : `${baseUrl}/auth/callback`;

      const { data, error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        }
      });

      return { data, error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * OAuth Authentication - Google
   */
  async signInWithGoogle(redirectPath?: string): Promise<{ data?: any; error?: AuthError | null }> {
    try {
      const baseUrl = window.location.origin;
      const redirectTo = redirectPath
        ? `${baseUrl}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
        : `${baseUrl}/auth/callback`;

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      return { data, error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * OAuth Authentication - Apple
   */
  async signInWithApple(redirectPath?: string): Promise<{ data?: any; error?: AuthError | null }> {
    try {
      const baseUrl = window.location.origin;
      const redirectTo = redirectPath
        ? `${baseUrl}/auth/callback?redirect=${encodeURIComponent(redirectPath)}`
        : `${baseUrl}/auth/callback`;

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectTo,
        }
      });

      return { data, error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Handle Authentication Callback
   */
  async handleAuthCallback(): Promise<{ data?: any; error?: AuthError | null }> {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      return { data, error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Get Current User
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.warn('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get Current Session
   */
  async getSession() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session;
    } catch (error) {
      console.warn('Error getting session:', error);
      return null;
    }
  }

  /**
   * Sign Out
   */
  async signOut(): Promise<{ error?: AuthError | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Check if authentication is configured
   */
  isConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  /**
   * Get available OAuth providers based on Supabase configuration
   */
  getAvailableProviders(): string[] {
    // This would need to be configured in your Supabase dashboard
    // For now, return common providers that can be easily configured
    return ['google', 'apple'];
  }
}

export const workingAuthService = new WorkingAuthService();