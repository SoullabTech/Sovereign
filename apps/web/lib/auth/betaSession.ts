/**
 * Beta Session Management
 *
 * Handles session persistence for beta users across:
 * - Page refreshes
 * - Tab switches
 * - Browser restarts
 * - Device switches (with Supabase backup)
 */

export interface BetaUser {
  id: string;
  username: string;
  name?: string;
  email?: string;
  explorerId?: string;
  explorerName?: string;
  onboarded: boolean;
  lastVisit?: string;
  createdAt: string;
  invitedBy?: string;
}

export interface SessionState {
  isAuthenticated: boolean;
  user: BetaUser | null;
  needsOnboarding: boolean;
  source: 'localStorage' | 'supabase' | 'none';
}

class BetaSessionManager {
  private static instance: BetaSessionManager;
  private currentUser: BetaUser | null = null;
  private sessionListeners: Set<(state: SessionState) => void> = new Set();

  private constructor() {
    // Initialize on construction
    this.restoreSession();

    // Listen for storage changes from other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  public static getInstance(): BetaSessionManager {
    if (!BetaSessionManager.instance) {
      BetaSessionManager.instance = new BetaSessionManager();
    }
    return BetaSessionManager.instance;
  }

  /**
   * Restore session from localStorage on app load
   */
  public restoreSession(): SessionState {
    // Guard: Only access localStorage on client side
    if (typeof window === 'undefined') {
      return {
        isAuthenticated: false,
        user: null,
        needsOnboarding: false,
        source: 'none'
      };
    }

    try {
      const betaUserStr = localStorage.getItem('beta_user');

      if (!betaUserStr) {
        return {
          isAuthenticated: false,
          user: null,
          needsOnboarding: false,
          source: 'none'
        };
      }

      const user = JSON.parse(betaUserStr) as BetaUser;
      this.currentUser = user;

      return {
        isAuthenticated: true,
        user,
        needsOnboarding: !user.onboarded,
        source: 'localStorage'
      };
    } catch (error) {
      console.error('[BetaSession] Error restoring session:', error);
      return {
        isAuthenticated: false,
        user: null,
        needsOnboarding: false,
        source: 'none'
      };
    }
  }

  /**
   * Set current user and persist to localStorage
   */
  public setUser(user: BetaUser): void {
    this.currentUser = user;

    // Guard: Only access localStorage on client side
    if (typeof window === 'undefined') return;

    localStorage.setItem('beta_user', JSON.stringify(user));

    // Update lastVisit
    user.lastVisit = new Date().toISOString();

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * Update user properties
   */
  public updateUser(updates: Partial<BetaUser>): void {
    if (!this.currentUser) {
      console.warn('[BetaSession] No current user to update');
      return;
    }

    // Guard: Only access localStorage on client side
    if (typeof window === 'undefined') return;

    this.currentUser = {
      ...this.currentUser,
      ...updates
    };

    localStorage.setItem('beta_user', JSON.stringify(this.currentUser));

    // Also update in beta_users collection
    const betaUsersStr = localStorage.getItem('beta_users');
    if (betaUsersStr) {
      try {
        const betaUsers = JSON.parse(betaUsersStr);
        if (betaUsers[this.currentUser.username]) {
          betaUsers[this.currentUser.username] = {
            ...betaUsers[this.currentUser.username],
            ...updates
          };
          localStorage.setItem('beta_users', JSON.stringify(betaUsers));
        }
      } catch (e) {
        console.error('[BetaSession] Error updating beta_users:', e);
      }
    }

    this.notifyListeners();
  }

  /**
   * Mark user as onboarded
   */
  public markOnboarded(): void {
    this.updateUser({ onboarded: true });
  }

  /**
   * Update last visit timestamp
   */
  public updateLastVisit(): void {
    this.updateUser({ lastVisit: new Date().toISOString() });
  }

  /**
   * Get current user
   */
  public getCurrentUser(): BetaUser | null {
    return this.currentUser;
  }

  /**
   * Get session state
   */
  public getSessionState(): SessionState {
    return {
      isAuthenticated: !!this.currentUser,
      user: this.currentUser,
      needsOnboarding: this.currentUser ? !this.currentUser.onboarded : false,
      source: this.currentUser ? 'localStorage' : 'none'
    };
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  /**
   * Check if user needs onboarding
   */
  public needsOnboarding(): boolean {
    return this.currentUser ? !this.currentUser.onboarded : false;
  }

  /**
   * Clear session (logout)
   */
  public clearSession(): void {
    this.currentUser = null;

    // Guard: Only access localStorage on client side
    if (typeof window === 'undefined') return;

    localStorage.removeItem('beta_user');
    localStorage.removeItem('explorerId');
    localStorage.removeItem('explorerName');
    sessionStorage.clear();
    this.notifyListeners();
  }

  /**
   * Subscribe to session changes
   */
  public subscribe(listener: (state: SessionState) => void): () => void {
    this.sessionListeners.add(listener);
    return () => {
      this.sessionListeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of session changes
   */
  private notifyListeners(): void {
    const state = this.getSessionState();
    this.sessionListeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('[BetaSession] Error in listener:', error);
      }
    });
  }

  /**
   * Handle storage changes from other tabs
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === 'beta_user') {
      if (event.newValue) {
        try {
          this.currentUser = JSON.parse(event.newValue);
          this.notifyListeners();
        } catch (error) {
          console.error('[BetaSession] Error parsing beta_user from storage event:', error);
        }
      } else {
        this.currentUser = null;
        this.notifyListeners();
      }
    }
  }

  /**
   * Sync with Supabase (for invited users with explorerId)
   */
  public async syncWithSupabase(): Promise<void> {
    if (!this.currentUser?.explorerId) {
      return; // Only sync users who came through invite codes
    }

    try {
      // TODO: Implement Supabase sync
      // This will allow cross-device continuity for invited users
      console.log('[BetaSession] Supabase sync not yet implemented');
    } catch (error) {
      console.error('[BetaSession] Error syncing with Supabase:', error);
    }
  }
}

// Export singleton instance
export const betaSession = BetaSessionManager.getInstance();

// Export hook for React components
export function useBetaSession() {
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      user: null,
      needsOnboarding: false,
      source: 'none' as const
    };
  }

  return betaSession.getSessionState();
}
