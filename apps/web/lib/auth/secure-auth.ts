'use client'

/**
 * Secure Authentication System for MAIA
 * Implements JWT-based auth with encryption key management
 */

import { useState, useEffect } from 'react';
import { getBrowserSupabaseClient } from '@/lib/supabaseBrowserClient';
import { MAIAEncryption, UserEncryptionContext, PasswordValidator } from '@/lib/security/encryption';
// import { secureJournalStorage } from '@/lib/storage/secure-journal-storage'; // DISABLED

export interface SecureUser {
  id: string;
  email: string;
  encryptionSalt: string;
  profile?: {
    name?: string;
    preferences?: any;
    privacySettings?: any;
  };
  createdAt: Date;
  lastActive: Date;
}

export interface AuthState {
  user: SecureUser | null;
  encryptionContext: UserEncryptionContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class SecureAuthManager {
  private supabase = getBrowserSupabaseClient();
  private authState: AuthState = {
    user: null,
    encryptionContext: null,
    isAuthenticated: false,
    isLoading: false
  };

  private authStateListeners: Array<(state: AuthState) => void> = [];

  constructor() {
    // Listen for Supabase auth changes
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        await this.handleSignIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        await this.handleSignOut();
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Update last active time
        await this.updateLastActive(session.user.id);
      }
    });

    // Initialize from existing session
    this.initializeFromSession();
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(listener: (state: AuthState) => void): () => void {
    this.authStateListeners.push(listener);

    // Immediately call with current state
    listener(this.authState);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current auth state
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Sign up with email and password, generating encryption keys
   */
  async signUp(
    email: string,
    password: string,
    profile?: { name?: string; preferences?: any }
  ): Promise<{
    success: boolean;
    error?: string;
    user?: SecureUser;
  }> {
    try {
      this.updateAuthState({ isLoading: true });

      // Validate password strength
      const passwordValidation = PasswordValidator.validate(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.feedback.join('. ')
        };
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profile?.name
          }
        }
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message || 'Failed to create account'
        };
      }

      // Generate encryption context
      const encryptionContext = await MAIAEncryption.generateUserEncryption(
        authData.user.id,
        password
      );

      // Create user record with encrypted profile
      const userRecord = await this.createUserRecord(
        authData.user.id,
        email,
        encryptionContext.salt,
        profile
      );

      if (!userRecord) {
        // Clean up auth user if database creation failed
        await this.supabase.auth.admin.deleteUser(authData.user.id);
        return {
          success: false,
          error: 'Failed to create user profile'
        };
      }

      // Initialize secure storage
      // await secureJournalStorage.initialize(encryptionContext); // DISABLED

      // Update auth state
      this.updateAuthState({
        user: userRecord,
        encryptionContext,
        isAuthenticated: true,
        isLoading: false
      });

      return {
        success: true,
        user: userRecord
      };

    } catch (error) {
      console.error('Sign up error:', error);
      this.updateAuthState({ isLoading: false });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Sign in with email and password, recreating encryption context
   */
  async signIn(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: string;
    user?: SecureUser;
  }> {
    try {
      this.updateAuthState({ isLoading: true });

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        this.updateAuthState({ isLoading: false });
        return {
          success: false,
          error: authError?.message || 'Failed to sign in'
        };
      }

      // Get user record and recreate encryption context
      const result = await this.loadUserAndEncryption(authData.user.id, password);

      if (!result.success) {
        await this.supabase.auth.signOut();
        this.updateAuthState({ isLoading: false });
        return result;
      }

      return {
        success: true,
        user: result.user
      };

    } catch (error) {
      console.error('Sign in error:', error);
      this.updateAuthState({ isLoading: false });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Sign out and clear all secure data
   */
  async signOut(): Promise<void> {
    try {
      this.updateAuthState({ isLoading: true });

      // Clear secure storage
      if (this.authState.encryptionContext) {
        // Clear encrypted localStorage
        const { SecureLocalStorage } = await import('@/lib/security/encryption');
        SecureLocalStorage.clear();
      }

      // Sign out from Supabase
      await this.supabase.auth.signOut();

      // The auth state change listener will handle updating the state

    } catch (error) {
      console.error('Sign out error:', error);
      this.updateAuthState({ isLoading: false });
    }
  }

  /**
   * Change password and update encryption keys
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.authState.user || !this.authState.encryptionContext) {
        return { success: false, error: 'Not authenticated' };
      }

      // Validate new password
      const passwordValidation = PasswordValidator.validate(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.feedback.join('. ')
        };
      }

      // Verify current password by trying to recreate encryption context
      try {
        await MAIAEncryption.recreateUserEncryption(
          this.authState.user.id,
          currentPassword,
          this.authState.user.encryptionSalt
        );
      } catch {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password in Supabase Auth
      const { error: updateError } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Generate new encryption context
      const newEncryptionContext = await MAIAEncryption.generateUserEncryption(
        this.authState.user.id,
        newPassword
      );

      // Re-encrypt all user data with new key
      await this.reencryptUserData(
        this.authState.encryptionContext,
        newEncryptionContext
      );

      // Update user record with new salt
      await this.supabase
        .from('users')
        .update({
          encryption_key_salt: newEncryptionContext.salt,
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', this.authState.user.id);

      // Update auth state
      this.updateAuthState({
        user: {
          ...this.authState.user,
          encryptionSalt: newEncryptionContext.salt
        },
        encryptionContext: newEncryptionContext
      });

      // Reinitialize secure storage with new context
      // await secureJournalStorage.initialize(newEncryptionContext); // DISABLED

      return { success: true };

    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change password'
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profile: {
    name?: string;
    preferences?: any;
    privacySettings?: any;
  }): Promise<boolean> {
    try {
      if (!this.authState.user || !this.authState.encryptionContext) {
        return false;
      }

      // Encrypt profile data
      const encryptedProfile = MAIAEncryption.encrypt(profile, this.authState.encryptionContext);

      // Update in database
      const { error } = await this.supabase
        .from('users')
        .update({
          encrypted_profile: JSON.stringify(encryptedProfile),
          updated_at: new Date().toISOString()
        })
        .eq('auth_user_id', this.authState.user.id);

      if (error) {
        console.error('Failed to update profile:', error);
        return false;
      }

      // Update local state
      this.updateAuthState({
        user: {
          ...this.authState.user,
          profile
        }
      });

      return true;

    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }

  /**
   * Delete user account and all data
   */
  async deleteAccount(password: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.authState.user || !this.authState.encryptionContext) {
        return { success: false, error: 'Not authenticated' };
      }

      // Verify password
      try {
        await MAIAEncryption.recreateUserEncryption(
          this.authState.user.id,
          password,
          this.authState.user.encryptionSalt
        );
      } catch {
        return { success: false, error: 'Password is incorrect' };
      }

      // Delete all user data (cascading deletes will handle related tables)
      await this.supabase
        .from('users')
        .delete()
        .eq('auth_user_id', this.authState.user.id);

      // Delete auth user
      await this.supabase.auth.admin.deleteUser(this.authState.user.id);

      // Clear local state
      await this.handleSignOut();

      return { success: true };

    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account'
      };
    }
  }

  // Private methods

  private async initializeFromSession(): Promise<void> {
    try {
      this.updateAuthState({ isLoading: true });

      const { data: { session } } = await this.supabase.auth.getSession();

      if (session?.user) {
        // We have a session but no password to recreate encryption
        // User will need to re-authenticate to access encrypted data
        await this.handlePartialSignIn(session.user.id);
      } else {
        this.updateAuthState({ isLoading: false });
      }

    } catch (error) {
      console.error('Failed to initialize from session:', error);
      this.updateAuthState({ isLoading: false });
    }
  }

  private async handleSignIn(authUser: any): Promise<void> {
    // This is called when user signs in - encryption context
    // will be set up in the signIn method
  }

  private async handlePartialSignIn(userId: string): Promise<void> {
    try {
      // Load user data without encryption context
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error || !data) {
        throw new Error('User record not found');
      }

      const user: SecureUser = {
        id: data.id,
        email: data.email,
        encryptionSalt: data.encryption_key_salt,
        createdAt: new Date(data.created_at),
        lastActive: new Date(data.last_active || data.created_at)
      };

      this.updateAuthState({
        user,
        encryptionContext: null, // No encryption context without password
        isAuthenticated: false, // Not fully authenticated without encryption
        isLoading: false
      });

    } catch (error) {
      console.error('Failed to handle partial sign in:', error);
      this.updateAuthState({ isLoading: false });
    }
  }

  private async handleSignOut(): Promise<void> {
    // Clear secure storage
    if (this.authState.encryptionContext) {
      const { SecureLocalStorage } = await import('@/lib/security/encryption');
      SecureLocalStorage.clear();
    }

    this.updateAuthState({
      user: null,
      encryptionContext: null,
      isAuthenticated: false,
      isLoading: false
    });
  }

  private async loadUserAndEncryption(
    authUserId: string,
    password: string
  ): Promise<{
    success: boolean;
    error?: string;
    user?: SecureUser;
  }> {
    try {
      // Get user record
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error || !data) {
        return {
          success: false,
          error: 'User record not found'
        };
      }

      // Recreate encryption context
      const encryptionContext = await MAIAEncryption.recreateUserEncryption(
        data.id,
        password,
        data.encryption_key_salt
      );

      // Decrypt profile if exists
      let profile = undefined;
      if (data.encrypted_profile) {
        try {
          const encryptedProfile = JSON.parse(data.encrypted_profile);
          profile = MAIAEncryption.decrypt(encryptedProfile, encryptionContext);
        } catch {
          // Profile decryption failed - maybe corrupted data
          console.warn('Failed to decrypt user profile');
        }
      }

      const user: SecureUser = {
        id: data.id,
        email: data.email,
        encryptionSalt: data.encryption_key_salt,
        profile,
        createdAt: new Date(data.created_at),
        lastActive: new Date(data.last_active || data.created_at)
      };

      // Initialize secure storage
      // await secureJournalStorage.initialize(encryptionContext); // DISABLED

      // Update last active time
      await this.updateLastActive(authUserId);

      // Update auth state
      this.updateAuthState({
        user,
        encryptionContext,
        isAuthenticated: true,
        isLoading: false
      });

      return {
        success: true,
        user
      };

    } catch (error) {
      console.error('Failed to load user and encryption:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load user data'
      };
    }
  }

  private async createUserRecord(
    authUserId: string,
    email: string,
    encryptionSalt: string,
    profile?: any
  ): Promise<SecureUser | null> {
    try {
      // Hash email for lookups
      const emailHash = this.hashEmail(email);

      // Prepare user data
      const userData: any = {
        email,
        email_hash: emailHash,
        auth_user_id: authUserId,
        encryption_key_salt: encryptionSalt
      };

      // Encrypt profile if provided
      if (profile) {
        const tempContext: UserEncryptionContext = {
          userId: authUserId,
          masterKey: 'temp', // Will be replaced when properly initialized
          salt: encryptionSalt
        };
        const encryptedProfile = MAIAEncryption.encrypt(profile, tempContext);
        userData.encrypted_profile = JSON.stringify(encryptedProfile);
      }

      // Insert user record
      const { data, error } = await this.supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to create user record:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        encryptionSalt: data.encryption_key_salt,
        profile,
        createdAt: new Date(data.created_at),
        lastActive: new Date(data.created_at)
      };

    } catch (error) {
      console.error('Failed to create user record:', error);
      return null;
    }
  }

  private async updateLastActive(authUserId: string): Promise<void> {
    try {
      await this.supabase
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('auth_user_id', authUserId);
    } catch (error) {
      console.error('Failed to update last active:', error);
    }
  }

  private async reencryptUserData(
    oldContext: UserEncryptionContext,
    newContext: UserEncryptionContext
  ): Promise<void> {
    // This would decrypt all user data with old key and re-encrypt with new key
    // Implementation would depend on data volume and could be done in batches
    console.log('Re-encrypting user data with new key...');
    // TODO: Implement data re-encryption
  }

  private hashEmail(email: string): string {
    // Simple hash for email lookups
    return btoa(email.toLowerCase().trim());
  }

  private updateAuthState(updates: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...updates };

    // Notify all listeners
    this.authStateListeners.forEach(listener => {
      try {
        listener(this.authState);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }
}

// Export singleton instance
export const secureAuth = new SecureAuthManager();

// Hook for React components
export function useSecureAuth(): AuthState & {
  signUp: typeof secureAuth.signUp;
  signIn: typeof secureAuth.signIn;
  signOut: typeof secureAuth.signOut;
  changePassword: typeof secureAuth.changePassword;
  updateProfile: typeof secureAuth.updateProfile;
  deleteAccount: typeof secureAuth.deleteAccount;
} {
  // Initialize with default state to avoid SSR issues, will be set properly in useEffect
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Only call getAuthState during client-side rendering
    if (typeof window !== 'undefined') {
      return secureAuth.getAuthState();
    }
    // Return default state for SSR
    return {
      isAuthenticated: false,
      user: null,
      loading: true
    };
  });

  useEffect(() => {
    // Set the initial auth state on the client-side
    setAuthState(secureAuth.getAuthState());

    // Subscribe to auth state changes
    const unsubscribe = secureAuth.onAuthStateChange(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    signUp: secureAuth.signUp.bind(secureAuth),
    signIn: secureAuth.signIn.bind(secureAuth),
    signOut: secureAuth.signOut.bind(secureAuth),
    changePassword: secureAuth.changePassword.bind(secureAuth),
    updateProfile: secureAuth.updateProfile.bind(secureAuth),
    deleteAccount: secureAuth.deleteAccount.bind(secureAuth)
  };
}