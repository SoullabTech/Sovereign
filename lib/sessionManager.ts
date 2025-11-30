// Session Management for Transformational Experience
// Implements sophisticated session persistence with three sacred pathways

interface UserSession {
  id: string;
  name: string;
  username: string;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  elementName: string;
  intention: {
    primary: string;
    depth: string;
    commitment: string;
  };
  communicationStyle: 'voice' | 'text' | 'adaptive';
  createdAt: number;
  lastActive: number;
  onboardingComplete: boolean;
  signedOut?: boolean;
}

interface SessionState {
  pathway: 'PATHWAY_1_INITIATION' | 'PATHWAY_2_RETURNING' | 'PATHWAY_3_CONTINUOUS';
  user?: UserSession;
  needsAuth: boolean;
  isFirstVisit: boolean;
}

export class SessionManager {
  private static readonly SESSION_KEY = 'maia_sacred_session';
  private static readonly PASSCODE_KEY = 'maia_beta_passcode';

  // Element configurations with wisdom
  private static readonly ELEMENTS = {
    fire: { name: 'Fire', wisdom: 'Passion and transformation through creative force' },
    water: { name: 'Water', wisdom: 'Flow and emotional intelligence through adaptive grace' },
    earth: { name: 'Earth', wisdom: 'Grounding and stability through rooted wisdom' },
    air: { name: 'Air', wisdom: 'Vision and intellect through boundless perspective' },
    aether: { name: 'Aether', wisdom: 'Spirit and transcendence through unified consciousness' }
  };

  /**
   * Determine which sacred pathway the user should follow
   */
  static getUserPathway(): SessionState {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);

      if (!sessionData) {
        return {
          pathway: 'PATHWAY_1_INITIATION',
          needsAuth: false,
          isFirstVisit: true
        };
      }

      const session: UserSession = JSON.parse(sessionData);

      // Check if user explicitly signed out
      if (session.signedOut === true) {
        return {
          pathway: 'PATHWAY_2_RETURNING',
          user: session,
          needsAuth: true,
          isFirstVisit: false
        };
      }

      // Check if session is still valid (active session)
      const now = Date.now();
      const lastActiveThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days

      if (now - session.lastActive < lastActiveThreshold && session.onboardingComplete) {
        // Update last active timestamp
        session.lastActive = now;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        return {
          pathway: 'PATHWAY_3_CONTINUOUS',
          user: session,
          needsAuth: false,
          isFirstVisit: false
        };
      }

      // Session expired or incomplete onboarding
      return {
        pathway: 'PATHWAY_2_RETURNING',
        user: session,
        needsAuth: true,
        isFirstVisit: false
      };

    } catch (error) {
      console.error('Session pathway detection error:', error);
      return {
        pathway: 'PATHWAY_1_INITIATION',
        needsAuth: false,
        isFirstVisit: true
      };
    }
  }

  /**
   * Create new session for first-time users
   */
  static createSession(userData: {
    name: string;
    username: string;
    password: string;
    intention: UserSession['intention'];
    communicationStyle: UserSession['communicationStyle'];
    passcode: string;
  }): UserSession {
    const element = this.assignElement(userData.name, userData.intention.primary);
    const elementConfig = this.ELEMENTS[element];

    const session: UserSession = {
      id: this.generateSessionId(),
      name: userData.name,
      username: userData.username,
      element,
      elementName: elementConfig.name,
      intention: userData.intention,
      communicationStyle: userData.communicationStyle,
      createdAt: Date.now(),
      lastActive: Date.now(),
      onboardingComplete: true,
      signedOut: false
    };

    // Store session and passcode
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(this.PASSCODE_KEY, userData.passcode);

    // Store password securely (in real implementation, this would be server-side)
    localStorage.setItem(`maia_auth_${userData.username}`, this.hashPassword(userData.password));

    return session;
  }

  /**
   * Authenticate returning user
   */
  static async authenticateUser(username: string, password: string): Promise<UserSession | null> {
    try {
      const storedHash = localStorage.getItem(`maia_auth_${username}`);
      const inputHash = this.hashPassword(password);

      if (storedHash === inputHash) {
        const sessionData = localStorage.getItem(this.SESSION_KEY);
        if (sessionData) {
          const session: UserSession = JSON.parse(sessionData);

          // Update session as active
          session.lastActive = Date.now();
          session.signedOut = false;

          localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
          return session;
        }
      }

      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Get current session data
   */
  static getCurrentSession(): UserSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Update session data
   */
  static updateSession(updates: Partial<UserSession>): void {
    try {
      const currentSession = this.getCurrentSession();
      if (currentSession) {
        const updatedSession = { ...currentSession, ...updates, lastActive: Date.now() };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(updatedSession));
      }
    } catch (error) {
      console.error('Update session error:', error);
    }
  }

  /**
   * Sign out user (explicit action only)
   */
  static signOut(): void {
    try {
      const session = this.getCurrentSession();
      if (session) {
        session.signedOut = true;
        session.lastActive = Date.now();
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  /**
   * Clear all session data (for debugging/reset)
   */
  static clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.PASSCODE_KEY);
  }

  /**
   * Check if beta passcode is valid
   */
  static async validatePasscode(passcode: string): Promise<boolean> {
    try {
      const response = await fetch('/api/beta/validate-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.toUpperCase() })
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.valid === true;
    } catch (error) {
      console.error('Passcode validation error:', error);
      return false;
    }
  }

  /**
   * Assign element based on name and intention
   */
  static assignElement(name: string, intention: string): keyof typeof this.ELEMENTS {
    const elements: (keyof typeof this.ELEMENTS)[] = ['fire', 'water', 'earth', 'air', 'aether'];

    // Create deterministic but seemingly random assignment
    const seed = name.length + intention.length +
                 name.charCodeAt(0) +
                 (intention.charCodeAt(0) || 0);

    return elements[seed % elements.length];
  }

  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Simple password hashing (in production, use proper hashing)
   */
  private static hashPassword(password: string): string {
    // This is simplified - in production, use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Get element configuration
   */
  static getElementConfig(element: keyof typeof this.ELEMENTS) {
    return this.ELEMENTS[element];
  }

  /**
   * Redirect to MAIA consciousness space
   */
  static redirectToMaia(): void {
    // Sacred pause before transition
    setTimeout(() => {
      window.location.href = '/maia';
    }, 1500);
  }

  /**
   * Track user interaction for analytics
   */
  static trackInteraction(event: string, data?: Record<string, any>): void {
    try {
      const session = this.getCurrentSession();
      if (session) {
        // Update last active
        session.lastActive = Date.now();
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

        // Send analytics (implement as needed)
        console.log('🧘 Sacred Interaction:', event, {
          userId: session.id,
          element: session.element,
          pathway: this.getUserPathway().pathway,
          ...data
        });
      }
    } catch (error) {
      console.error('Track interaction error:', error);
    }
  }
}

// Export pathway types for TypeScript
export type { UserSession, SessionState };