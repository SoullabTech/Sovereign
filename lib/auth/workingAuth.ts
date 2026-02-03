"use client";

/**
 * Working Authentication Service - STUB
 *
 * This file previously used Supabase authentication.
 * Now using postgres-only architecture.
 *
 * @deprecated Use lib/auth/authService.ts or direct postgres auth instead
 */

export interface WorkingUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResult {
  data?: any;
  error?: Error | null;
}

export class WorkingAuthService {
  constructor() {
    console.warn('[WorkingAuthService] DEPRECATED - Supabase auth removed');
  }

  async signInWithEmail(_email: string, _redirectPath?: string): Promise<AuthResult> {
    return { error: new Error('Supabase auth deprecated - use postgres auth') };
  }

  async signInWithGoogle(_redirectPath?: string): Promise<AuthResult> {
    return { error: new Error('OAuth deprecated - use postgres auth') };
  }

  async signInWithApple(_redirectPath?: string): Promise<AuthResult> {
    return { error: new Error('OAuth deprecated - use postgres auth') };
  }

  async handleAuthCallback(): Promise<AuthResult> {
    return { data: null };
  }

  async getCurrentUser(): Promise<WorkingUser | null> {
    return null;
  }

  async getSession(): Promise<any> {
    return null;
  }

  async signOut(): Promise<AuthResult> {
    return { error: null };
  }

  isConfigured(): boolean {
    return false;
  }

  getAvailableProviders(): string[] {
    return [];
  }
}

export const workingAuthService = new WorkingAuthService();
