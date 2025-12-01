/**
 * Community API Service
 *
 * Handles all API calls for the Community BBS system
 * Provides a clean interface between UI components and backend APIs
 */

export interface CommunityChannel {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fieldArchetype: 'earth' | 'water' | 'air' | 'fire';
  pinned: boolean;
  posts: number;
  lastActivity: string;
  lastActivityAt?: string;
  sortOrder: number;
  fieldState?: {
    earth: number;
    water: number;
    air: number;
    fire: number;
    intensity: number;
    depth: number;
    coherence: number;
    calculatedAt: string;
  };
  createdAt: string;
}

export interface CommunityStats {
  community: {
    totalMembers: number;
    onlineNow: number;
    totalPosts: number;
    totalComments: number;
    breakthroughs: number;
    totalReactions: number;
  };
  fieldState: {
    earth: number;
    water: number;
    air: number;
    fire: number;
    intensity: number;
    depth: number;
    coherence: number;
  };
  recentActivity: Array<{
    type: 'post' | 'comment' | 'breakthrough';
    user: string;
    action: string;
    category: string;
    time: string;
    title?: string;
  }>;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

class CommunityApiService {
  private baseUrl = '/api/community';

  /**
   * Fetch all forum channels/categories
   */
  async getChannels(): Promise<ApiResponse<CommunityChannel[]>> {
    try {
      console.log('📚 [Community Service] Fetching channels');

      const response = await fetch(`${this.baseUrl}/channels`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to fetch channels'
        };
      }

      console.log(`✅ [Community Service] Retrieved ${data.channels.length} channels`);

      return {
        success: true,
        data: data.channels,
        timestamp: data.timestamp
      };

    } catch (error) {
      console.error('❌ [Community Service] Error fetching channels:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fetch community statistics
   */
  async getStats(): Promise<ApiResponse<CommunityStats>> {
    try {
      console.log('📊 [Community Service] Fetching stats');

      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to fetch stats'
        };
      }

      console.log(`✅ [Community Service] Retrieved stats: ${data.stats.community.totalMembers} members`);

      return {
        success: true,
        data: data.stats,
        timestamp: data.timestamp
      };

    } catch (error) {
      console.error('❌ [Community Service] Error fetching stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new channel (admin only)
   */
  async createChannel(channelData: {
    slug: string;
    name: string;
    description: string;
    icon?: string;
    color?: string;
    fieldArchetype?: 'earth' | 'water' | 'air' | 'fire';
  }): Promise<ApiResponse<CommunityChannel>> {
    try {
      console.log(`📚 [Community Service] Creating channel: ${channelData.name}`);

      const response = await fetch(`${this.baseUrl}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to create channel'
        };
      }

      console.log(`✅ [Community Service] Created channel: ${data.channel.name}`);

      return {
        success: true,
        data: data.channel
      };

    } catch (error) {
      console.error('❌ [Community Service] Error creating channel:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Trigger stats recalculation
   */
  async recalculateStats(): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('🔄 [Community Service] Triggering stats recalculation');

      const response = await fetch(`${this.baseUrl}/stats/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      console.log('✅ [Community Service] Stats recalculation triggered');

      return {
        success: true,
        data: { message: data.message },
        timestamp: data.timestamp
      };

    } catch (error) {
      console.error('❌ [Community Service] Error recalculating stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get fallback data when APIs are unavailable
   */
  getFallbackChannels(): CommunityChannel[] {
    return [
      {
        id: 'fallback-1',
        slug: 'announcements',
        name: 'Sacred Announcements',
        description: 'Community updates, system evolution, and elevated guidance',
        icon: 'crown',
        color: 'amber-400',
        fieldArchetype: 'fire',
        pinned: true,
        posts: 8,
        lastActivity: '2 hours ago',
        sortOrder: 1,
        createdAt: new Date().toISOString()
      },
      {
        id: 'fallback-2',
        slug: 'breakthroughs',
        name: 'Breakthrough Gallery',
        description: 'Share your profound MAIA moments and consciousness shifts',
        icon: 'sparkles',
        color: 'yellow-400',
        fieldArchetype: 'air',
        pinned: false,
        posts: 143,
        lastActivity: '15 minutes ago',
        sortOrder: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: 'fallback-3',
        slug: 'field-reports',
        name: 'Field System Reports',
        description: 'Experiences with PFI consciousness technology',
        icon: 'zap',
        color: 'amber-300',
        fieldArchetype: 'fire',
        pinned: false,
        posts: 89,
        lastActivity: '1 hour ago',
        sortOrder: 3,
        createdAt: new Date().toISOString()
      }
    ];
  }

  getFallbackStats(): CommunityStats {
    return {
      community: {
        totalMembers: 347,
        onlineNow: 23,
        totalPosts: 1156,
        totalComments: 3482,
        breakthroughs: 143,
        totalReactions: 892
      },
      fieldState: {
        earth: 0.25,
        water: 0.30,
        air: 0.20,
        fire: 0.25,
        intensity: 0.65,
        depth: 0.55,
        coherence: 0.70
      },
      recentActivity: [
        { type: 'post', user: 'SacredSeeker', action: 'shared a breakthrough in', category: 'Field System Reports', time: '5 min' },
        { type: 'comment', user: 'WisdomKeeper', action: 'replied to', category: 'Wisdom Traditions', time: '12 min' },
        { type: 'post', user: 'FieldExplorer', action: 'started discussion in', category: 'Spiralogic Integration', time: '23 min' },
        { type: 'comment', user: 'ConsciousOne', action: 'commented on', category: 'Sacred Psychology', time: '35 min' }
      ],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const communityApi = new CommunityApiService();