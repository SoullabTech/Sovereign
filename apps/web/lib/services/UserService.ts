/**
 * Unified User Service
 * Consolidates all user management, authentication, and profile operations
 * Replaces scattered user-related services throughout the codebase
 */

import { 
  IUserService, 
  IDatabaseService, 
  ICacheService,
  User, 
  UserProfile, 
  UserPreferences,
  ServiceTokens 
} from '../core/ServiceTokens';
import { ServiceContainer } from '../core/ServiceContainer';

export interface UserServiceConfig {
  cacheUserProfilesTTL: number;
  defaultOnboardingFlow: string;
  enableUserAnalytics: boolean;
}

export interface AuthenticationResult {
  user: User;
  token?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface UserQuery {
  id?: string;
  email?: string;
  limit?: number;
  offset?: number;
}

export class UserService implements IUserService {
  private config: UserServiceConfig;
  
  constructor(
    private container: ServiceContainer,
    config?: Partial<UserServiceConfig>
  ) {
    this.config = {
      cacheUserProfilesTTL: 300, // 5 minutes
      defaultOnboardingFlow: 'standard',
      enableUserAnalytics: true,
      ...config
    };
  }

  /**
   * Get current user by ID or from session context
   */
  async getCurrentUser(userId?: string): Promise<User | null> {
    if (!userId) {
      return null;
    }

    // Try cache first
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    const cached = await cacheService.get<User>(`user:${userId}`);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    const users = await databaseService.query<User>(
      `SELECT * FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return null;
    }

    const user = this.hydrateUser(users[0]);
    
    // Cache the result
    await cacheService.set(`user:${userId}`, user, this.config.cacheUserProfilesTTL);
    
    return user;
  }

  /**
   * Create a new user account
   */
  async createUser(userData: Partial<User>): Promise<User> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const defaultUser: User = {
      id: userId,
      email: userData.email,
      profile: {
        displayName: userData.profile?.displayName || 'New Seeker',
        oracle: {
          integrationLevel: 0,
          archetypeFocus: [],
          conversationStyle: 'exploratory',
          preferredVoice: 'default'
        },
        collective: {
          participationLevel: 'observer',
          anonymityPreference: true,
          contributionScore: 0
        },
        daimonic: {
          encounterHistory: [],
          integrationScore: 0,
          activeThemes: []
        },
        ...userData.profile
      },
      preferences: {
        notifications: {
          email: true,
          push: false,
          daimonic: true
        },
        privacy: {
          collectiveParticipation: true,
          dataSharing: false,
          analytics: this.config.enableUserAnalytics
        },
        ui: {
          theme: 'auto',
          language: 'en',
          accessibility: {}
        },
        ...userData.preferences
      },
      journey: {
        onboardingCompleted: false,
        currentPhase: 'discovery',
        milestones: [],
        ...userData.journey
      },
      createdAt: now,
      updatedAt: now
    };

    await databaseService.execute(
      `INSERT INTO users (id, email, profile, preferences, journey, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        defaultUser.id,
        defaultUser.email,
        JSON.stringify(defaultUser.profile),
        JSON.stringify(defaultUser.preferences),
        JSON.stringify(defaultUser.journey),
        defaultUser.createdAt.toISOString(),
        defaultUser.updatedAt.toISOString()
      ]
    );

    // Invalidate cache and store new user
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    await cacheService.set(`user:${userId}`, defaultUser, this.config.cacheUserProfilesTTL);

    // Track user creation event
    if (this.config.enableUserAnalytics) {
      const analyticsService = await this.container.resolve(ServiceTokens.AnalyticsService);
      await analyticsService.trackEvent(defaultUser.id, {
        type: 'user.created',
        userId: defaultUser.id,
        data: {
          onboardingFlow: this.config.defaultOnboardingFlow,
          registrationSource: 'web'
        },
        timestamp: now
      });
    }

    return defaultUser;
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<void> {
    const user = await this.getCurrentUser(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedProfile = {
      ...user.profile,
      ...profileUpdates
    };

    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    await databaseService.execute(
      `UPDATE users SET profile = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(updatedProfile), new Date().toISOString(), userId]
    );

    // Update cache
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    const updatedUser = { ...user, profile: updatedProfile, updatedAt: new Date() };
    await cacheService.set(`user:${userId}`, updatedUser, this.config.cacheUserProfilesTTL);

    // Track profile update
    if (this.config.enableUserAnalytics) {
      const analyticsService = await this.container.resolve(ServiceTokens.AnalyticsService);
      await analyticsService.trackEvent(userId, {
        type: 'user.profile.updated',
        userId,
        data: {
          fieldsUpdated: Object.keys(profileUpdates),
          updateCount: Object.keys(profileUpdates).length
        },
        timestamp: new Date()
      });
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const user = await this.getCurrentUser(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    return user.preferences;
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferenceUpdates: Partial<UserPreferences>): Promise<void> {
    const user = await this.getCurrentUser(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedPreferences = this.deepMerge(user.preferences, preferenceUpdates);

    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    await databaseService.execute(
      `UPDATE users SET preferences = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(updatedPreferences), new Date().toISOString(), userId]
    );

    // Update cache
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    const updatedUser = { ...user, preferences: updatedPreferences, updatedAt: new Date() };
    await cacheService.set(`user:${userId}`, updatedUser, this.config.cacheUserProfilesTTL);
  }

  /**
   * Authenticate user with various methods
   */
  async authenticateUser(method: 'email' | 'token' | 'apiKey', credentials: any): Promise<AuthenticationResult | null> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    let user: User | null = null;

    switch (method) {
      case 'email':
        const emailUsers = await databaseService.query<User>(
          'SELECT * FROM users WHERE email = ?',
          [credentials.email]
        );
        user = emailUsers.length > 0 ? this.hydrateUser(emailUsers[0]) : null;
        break;

      case 'token':
        // In a real implementation, validate JWT token
        if (credentials.token === 'demo-token') {
          user = await this.getCurrentUser('demo-user');
        }
        break;

      case 'apiKey':
        // Validate API key against user_api_keys table
        const apiKeyUsers = await databaseService.query<any>(
          'SELECT user_id FROM user_api_keys WHERE api_key = ? AND active = 1',
          [credentials.apiKey]
        );
        if (apiKeyUsers.length > 0) {
          user = await this.getCurrentUser(apiKeyUsers[0].user_id);
        }
        break;
    }

    if (!user) {
      return null;
    }

    return {
      user,
      token: method === 'token' ? credentials.token : undefined
    };
  }

  /**
   * Search users with pagination
   */
  async searchUsers(query: UserQuery): Promise<{ users: User[]; total: number }> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    let whereClause = '';
    let params: any[] = [];
    
    if (query.id) {
      whereClause += 'id = ?';
      params.push(query.id);
    }
    
    if (query.email) {
      whereClause += (whereClause ? ' OR ' : '') + 'email = ?';
      params.push(query.email);
    }

    const users = await databaseService.query<User>(
      `SELECT * FROM users ${whereClause ? `WHERE ${whereClause}` : ''} 
       LIMIT ? OFFSET ?`,
      [...params, query.limit || 10, query.offset || 0]
    );

    const total = await databaseService.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM users ${whereClause ? `WHERE ${whereClause}` : ''}`,
      params
    );

    return {
      users: users.map(u => this.hydrateUser(u)),
      total: total[0].count
    };
  }

  /**
   * Update user&apos;s journey progress
   */
  async updateUserJourney(userId: string, journeyUpdates: Partial<any>): Promise<void> {
    const user = await this.getCurrentUser(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const updatedJourney = {
      ...user.journey,
      ...journeyUpdates,
      updatedAt: new Date()
    };

    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    await databaseService.execute(
      `UPDATE users SET journey = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(updatedJourney), new Date().toISOString(), userId]
    );

    // Update cache
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    const updatedUser = { ...user, journey: updatedJourney, updatedAt: new Date() };
    await cacheService.set(`user:${userId}`, updatedUser, this.config.cacheUserProfilesTTL);
  }

  /**
   * Delete user and all associated data
   */
  async deleteUser(userId: string): Promise<void> {
    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    await databaseService.transaction(async (tx) => {
      // Delete from related tables first
      await tx.execute('DELETE FROM memories WHERE user_id = ?', [userId]);
      await tx.execute('DELETE FROM analytics_events WHERE user_id = ?', [userId]);
      await tx.execute('DELETE FROM daimonic_encounters WHERE user_id = ?', [userId]);
      await tx.execute('DELETE FROM user_api_keys WHERE user_id = ?', [userId]);
      
      // Delete user record
      await tx.execute('DELETE FROM users WHERE id = ?', [userId]);
    });

    // Remove from cache
    const cacheService = await this.container.resolve(ServiceTokens.CacheService);
    await cacheService.invalidate(`user:${userId}*`);
  }

  /**
   * Get user statistics for analytics
   */
  async getUserStats(userId: string): Promise<any> {
    const user = await this.getCurrentUser(userId);
    if (!user) {
      return null;
    }

    const databaseService = await this.container.resolve(ServiceTokens.DatabaseService);
    
    const stats = await Promise.all([
      databaseService.query('SELECT COUNT(*) as count FROM memories WHERE user_id = ?', [userId]),
      databaseService.query('SELECT COUNT(*) as count FROM daimonic_encounters WHERE user_id = ?', [userId]),
      databaseService.query('SELECT COUNT(*) as count FROM analytics_events WHERE user_id = ? AND type LIKE "conversation.%"', [userId])
    ]);

    return {
      totalMemories: stats[0][0].count,
      totalEncounters: stats[1][0].count,
      totalConversations: stats[2][0].count,
      memberSince: user.createdAt,
      lastActive: user.updatedAt,
      integrationLevel: user.profile.oracle.integrationLevel,
      contributionScore: user.profile.collective.contributionScore
    };
  }

  /**
   * Dispose of the service and cleanup resources
   */
  async dispose(): Promise<void> {
    // Clean up any intervals, connections, etc.
    console.log('UserService disposed');
  }

  /**
   * Hydrate user object from database row (handle JSON parsing)
   */
  private hydrateUser(row: any): User {
    return {
      ...row,
      profile: typeof row.profile === 'string' ? JSON.parse(row.profile) : row.profile,
      preferences: typeof row.preferences === 'string' ? JSON.parse(row.preferences) : row.preferences,
      journey: typeof row.journey === 'string' ? JSON.parse(row.journey) : row.journey,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  /**
   * Deep merge utility for preferences
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
}

// Extend interface for internal journey management
interface JourneyState {
  onboardingCompleted: boolean;
  currentPhase: 'discovery' | 'integration' | 'mastery';
  milestones: string[];
  lastMilestone?: Date;
  updatedAt?: Date;
}