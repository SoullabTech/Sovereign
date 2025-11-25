/**
 * Session Management
 * Handles user sessions, tokens, and authentication state
 */

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  sessionToken: string;
  deviceId: string;
  createdAt: string;
  expiresAt: string;
  lastActive: string;
  biometricEnabled: boolean;
}

export interface SessionStatus {
  authenticated: boolean;
  user?: UserSession;
  needsReauth?: boolean;
  reason?: string;
}

class SessionManager {
  private session: UserSession | null = null;
  private refreshInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize session from storage
   */
  async initSession(): Promise<SessionStatus> {
    const token = localStorage.getItem('session_token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      return { authenticated: false };
    }

    try {
      // Verify session with server
      const response = await fetch('/api/auth/session/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        this.clearSession();
        return {
          authenticated: false,
          needsReauth: true,
          reason: 'Session expired'
        };
      }

      const { session } = await response.json();
      this.session = session;

      // Start session refresh
      this.startSessionRefresh();

      return {
        authenticated: true,
        user: session
      };
    } catch (error) {
      console.error('Session initialization error:', error);
      this.clearSession();
      return { authenticated: false };
    }
  }

  /**
   * Create new session
   */
  async createSession(userId: string, sessionToken: string, deviceId: string): Promise<boolean> {
    try {
      // Get user details
      const response = await fetch(`/api/auth/user?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user details');
      }

      const { user } = await response.json();

      this.session = {
        userId: user.id,
        email: user.email,
        name: user.name,
        sessionToken,
        deviceId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        lastActive: new Date().toISOString(),
        biometricEnabled: user.biometricEnabled || false
      };

      // Store in localStorage
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem('user_id', userId);
      localStorage.setItem('device_id', deviceId);

      // Start session refresh
      this.startSessionRefresh();

      return true;
    } catch (error) {
      console.error('Session creation error:', error);
      return false;
    }
  }

  /**
   * Get current session
   */
  getSession(): UserSession | null {
    return this.session;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.session !== null;
  }

  /**
   * Update last active timestamp
   */
  async updateActivity(): Promise<void> {
    if (!this.session) return;

    try {
      await fetch('/api/auth/session/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.session.sessionToken}`
        },
        body: JSON.stringify({
          userId: this.session.userId,
          deviceId: this.session.deviceId
        })
      });

      this.session.lastActive = new Date().toISOString();
    } catch (error) {
      console.error('Activity update error:', error);
    }
  }

  /**
   * Refresh session token
   */
  private async refreshSession(): Promise<void> {
    if (!this.session) return;

    try {
      const response = await fetch('/api/auth/session/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.session.sessionToken}`
        },
        body: JSON.stringify({
          userId: this.session.userId,
          deviceId: this.session.deviceId
        })
      });

      if (response.ok) {
        const { sessionToken } = await response.json();
        this.session.sessionToken = sessionToken;
        localStorage.setItem('session_token', sessionToken);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  }

  /**
   * Start automatic session refresh
   */
  private startSessionRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refresh every 24 hours
    this.refreshInterval = setInterval(() => {
      this.refreshSession();
    }, 24 * 60 * 60 * 1000);

    // Update activity every 5 minutes
    setInterval(() => {
      this.updateActivity();
    }, 5 * 60 * 1000);
  }

  /**
   * Clear session and logout
   */
  async clearSession(): Promise<void> {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    if (this.session) {
      try {
        // Notify server of logout
        await fetch('/api/auth/session/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.session.sessionToken}`
          },
          body: JSON.stringify({
            userId: this.session.userId,
            deviceId: this.session.deviceId
          })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    this.session = null;
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_id');
  }

  /**
   * Get session expiry info
   */
  getExpiryInfo(): { daysUntilExpiry: number; expired: boolean } | null {
    if (!this.session) return null;

    const now = new Date().getTime();
    const expiresAt = new Date(this.session.expiresAt).getTime();
    const daysUntilExpiry = Math.floor((expiresAt - now) / (24 * 60 * 60 * 1000));

    return {
      daysUntilExpiry,
      expired: daysUntilExpiry <= 0
    };
  }
}

export const sessionManager = new SessionManager();