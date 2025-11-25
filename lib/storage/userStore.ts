/**
 * In-Memory User Storage
 * Stores user onboarding data and preferences server-side
 * Note: Data persists only during server uptime. For production, migrate to database.
 */

interface UserData {
  userId: string;
  explorerId?: string;
  explorerName?: string;
  name: string;
  email?: string;
  age?: string;
  pronouns?: string;
  location?: string;
  biography?: string;
  greetingStyle?: 'warm' | 'gentle' | 'direct' | 'playful';
  communicationPreference?: 'voice' | 'chat' | 'either';
  explorationLens?: 'conditions' | 'meaning' | 'both';
  wisdomFacets?: string[];
  focusAreas?: string[];
  researchConsent?: {
    analytics?: boolean;
    interviews?: boolean;
    transcripts?: boolean;
  };
  onboardingCompleted: boolean;
  createdAt: string;
  lastSeenAt: string;
}

class UserStore {
  private users: Map<string, UserData> = new Map();
  private explorerNameIndex: Map<string, string> = new Map();
  private emailIndex: Map<string, string> = new Map();

  saveUser(data: Partial<UserData>): UserData {
    const userId = data.userId || data.explorerId || `user_${Date.now()}`;

    const existingUser = this.users.get(userId);
    const now = new Date().toISOString();

    const userData: UserData = {
      ...existingUser,
      ...data,
      userId,
      onboardingCompleted: true,
      createdAt: existingUser?.createdAt || now,
      lastSeenAt: now,
      name: data.name || existingUser?.name || 'Explorer',
    };

    this.users.set(userId, userData);

    if (userData.explorerName) {
      this.explorerNameIndex.set(userData.explorerName, userId);
    }
    if (userData.email) {
      this.emailIndex.set(userData.email, userId);
    }

    console.log('[USER STORE] Saved user:', {
      userId,
      name: userData.name,
      explorerName: userData.explorerName,
      hasPreferences: !!(userData.greetingStyle || userData.communicationPreference),
      hasFocusAreas: !!userData.focusAreas?.length
    });

    return userData;
  }

  getUser(userId: string): UserData | null {
    const user = this.users.get(userId);
    if (user) {
      user.lastSeenAt = new Date().toISOString();
      console.log('[USER STORE] Retrieved user:', userId, user.name);
    }
    return user || null;
  }

  getUserByExplorerName(explorerName: string): UserData | null {
    const userId = this.explorerNameIndex.get(explorerName);
    return userId ? this.getUser(userId) : null;
  }

  getUserByEmail(email: string): UserData | null {
    const userId = this.emailIndex.get(email);
    return userId ? this.getUser(userId) : null;
  }

  updateUser(userId: string, updates: Partial<UserData>): UserData | null {
    const existingUser = this.users.get(userId);
    if (!existingUser) {
      console.warn('[USER STORE] User not found for update:', userId);
      return null;
    }

    const updatedUser = {
      ...existingUser,
      ...updates,
      userId,
      lastSeenAt: new Date().toISOString(),
    };

    this.users.set(userId, updatedUser);
    console.log('[USER STORE] Updated user:', userId);
    return updatedUser;
  }

  hasUser(userId: string): boolean {
    return this.users.has(userId);
  }

  listUsers(): UserData[] {
    return Array.from(this.users.values());
  }

  getUserCount(): number {
    return this.users.size;
  }

  deleteUser(userId: string): boolean {
    const user = this.users.get(userId);
    if (user) {
      if (user.explorerName) {
        this.explorerNameIndex.delete(user.explorerName);
      }
      if (user.email) {
        this.emailIndex.delete(user.email);
      }
      this.users.delete(userId);
      console.log('[USER STORE] Deleted user:', userId);
      return true;
    }
    return false;
  }

  clear(): void {
    this.users.clear();
    this.explorerNameIndex.clear();
    this.emailIndex.clear();
    console.log('[USER STORE] Cleared all data');
  }
}

export const userStore = new UserStore();
export type { UserData };