/**
 * Real User Activity Tracker
 * Records actual user sessions for the beta monitor
 */

import { createClient } from '@/lib/supabase';

// In-memory store for quick access (fallback when DB is unavailable)
const activeUsers = new Map<string, {
  userId: string;
  name: string;
  email?: string;
  sessionStart: Date;
  lastActivity: Date;
  messageCount: number;
  mode: 'voice' | 'text';
  engagement: number;
}>();

export class UserActivityTracker {
  private static instance: UserActivityTracker;
  private supabase: any;

  private constructor() {
    // Initialize Supabase client if available
    try {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    } catch (error) {
      console.log('UserActivityTracker: Running without database, using in-memory storage');
    }
  }

  static getInstance(): UserActivityTracker {
    if (!this.instance) {
      this.instance = new UserActivityTracker();
    }
    return this.instance;
  }

  /**
   * Track user registration/login
   */
  async trackUserRegistration(userId: string, name: string, email?: string) {
    console.log(`📝 Tracking user registration: ${name} (${userId})`);

    // Store in memory
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, {
        userId,
        name,
        email,
        sessionStart: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        mode: 'text',
        engagement: 50
      });
    }

    // Try to store in database
    if (this.supabase) {
      try {
        // Validate UUID format or user_ prefix format before database insert
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const userIdRegex = /^user_\d+$/;
        if (uuidRegex.test(userId) || userIdRegex.test(userId)) {
          // Use users table instead of beta_users (correct schema)
          await this.supabase
            .from('users')
            .upsert({
              id: userId,
              name,
              email,
              last_login: new Date().toISOString(),
            });
        } else {
          console.log(`[userActivityTracker] Skipping DB write for non-UUID user: ${userId}`);
        }
      } catch (error) {
        console.log('Database write failed, continuing with in-memory storage');
      }
    }

    return true;
  }

  /**
   * Track user activity (message sent)
   */
  async trackActivity(userId: string, mode: 'voice' | 'text' = 'text') {
    const user = activeUsers.get(userId);

    if (user) {
      user.lastActivity = new Date();
      user.messageCount++;
      user.mode = mode;
      user.engagement = Math.min(100, user.engagement + 2); // Increase engagement

      console.log(`📊 Activity tracked for ${user.name}: ${user.messageCount} messages`);

      // Update database if available (only for valid UUIDs)
      if (this.supabase) {
        try {
          // Validate UUID format or user_ prefix format before database update
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const userIdRegex = /^user_\d+$/;
          if (uuidRegex.test(userId) || userIdRegex.test(userId)) {
            await this.supabase
              .from('users')
              .update({
                last_login: new Date().toISOString(),
              })
              .eq('id', userId);
          }
        } catch (error) {
          // Silent fail, in-memory is the fallback
        }
      }
    }
  }

  /**
   * Mark user as active (for real-time monitoring)
   */
  markUserActive(userId: string, name: string) {
    if (!activeUsers.has(userId)) {
      activeUsers.set(userId, {
        userId,
        name,
        sessionStart: new Date(),
        lastActivity: new Date(),
        messageCount: 0,
        mode: 'text',
        engagement: 50
      });
    } else {
      const user = activeUsers.get(userId)!;
      user.lastActivity = new Date();
    }
  }

  /**
   * Get currently active users (active in last 5 minutes)
   */
  getActiveUsers() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const active = Array.from(activeUsers.values()).filter(
      user => user.lastActivity > fiveMinutesAgo
    );

    return active;
  }

  /**
   * Get all registered users with their status
   */
  async getAllUsers() {
    // First get from database if available
    if (this.supabase) {
      try {
        const { data } = await this.supabase
          .from('users')
          .select('*')
          .order('last_login', { ascending: false });

        if (data && data.length > 0) {
          return data;
        }
      } catch (error) {
        console.log('Database read failed, using in-memory data');
      }
    }

    // Fallback to in-memory data
    return Array.from(activeUsers.values()).map(user => ({
      id: user.userId,
      name: user.name,
      email: user.email,
      last_login: user.lastActivity.toISOString(),
      status: this.getUserStatus(user.lastActivity)
    }));
  }

  /**
   * Get user status based on last activity
   */
  private getUserStatus(lastActivity: Date): 'online' | 'idle' | 'offline' {
    const now = new Date();
    const timeDiff = now.getTime() - lastActivity.getTime();

    if (timeDiff < 5 * 60 * 1000) return 'online'; // Active in last 5 min
    if (timeDiff < 30 * 60 * 1000) return 'idle';   // Active in last 30 min
    return 'offline';
  }

  /**
   * Get activity summary for monitor
   */
  getActivitySummary() {
    const users = Array.from(activeUsers.values());
    const activeCount = this.getActiveUsers().length;

    return {
      totalUsers: users.length,
      activeUsers: activeCount,
      registeredUsers: users.length,
      avgEngagement: users.length > 0
        ? Math.round(users.reduce((sum, u) => sum + u.engagement, 0) / users.length)
        : 0,
      recentActivities: users
        .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
        .slice(0, 5)
        .map(u => ({
          user: u.name,
          time: this.getTimeAgo(u.lastActivity),
          action: `${u.messageCount} messages`,
          type: u.mode
        }))
    };
  }

  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  /**
   * Clear inactive users (cleanup)
   */
  cleanupInactiveUsers() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const [userId, user] of activeUsers) {
      if (user.lastActivity < oneHourAgo) {
        activeUsers.delete(userId);
      }
    }
  }
}

// Export singleton instance
export const userTracker = UserActivityTracker.getInstance();

// Cleanup inactive users every 30 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    userTracker.cleanupInactiveUsers();
  }, 30 * 60 * 1000);
}