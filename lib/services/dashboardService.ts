/**
 * Analytics Dashboard Service
 *
 * Mock service for beta dashboard analytics
 */

export interface DashboardData {
  totalSessions: number;
  activeUsers: number;
  voiceInteractions: number;
  avgSessionDuration: number;
  voiceFunnel: VoiceFunnel;
  userPatterns: UserPatterns;
  recentActivity: ActivityItem[];
}

export interface VoiceFunnel {
  initiation: number;
  recording: number;
  processing: number;
  completion: number;
}

export interface UserPatterns {
  peakHours: number[];
  preferredModes: Array<{ mode: string; count: number }>;
  retentionRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'voice' | 'text' | 'error';
  timestamp: Date;
  user: string;
  details: string;
}

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    // Mock data for development/beta
    return {
      totalSessions: 247,
      activeUsers: 23,
      voiceInteractions: 156,
      avgSessionDuration: 8.5,
      voiceFunnel: {
        initiation: 100,
        recording: 85,
        processing: 80,
        completion: 78
      },
      userPatterns: {
        peakHours: [9, 14, 20],
        preferredModes: [
          { mode: 'voice', count: 156 },
          { mode: 'text', count: 91 }
        ],
        retentionRate: 72
      },
      recentActivity: [
        {
          id: '1',
          type: 'voice',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          user: 'User #12',
          details: 'Completed voice journal session'
        },
        {
          id: '2',
          type: 'text',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          user: 'User #7',
          details: 'Started shadow work session'
        },
        {
          id: '3',
          type: 'error',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          user: 'User #15',
          details: 'Voice recording failed'
        }
      ]
    };
  }

  async trackEvent(event: string, data: any): Promise<void> {
    console.log('Dashboard event tracked:', event, data);
    // In production, send to analytics service
  }

  async getVoiceMetrics(): Promise<VoiceFunnel> {
    const data = await this.getDashboardData();
    return data.voiceFunnel;
  }

  async getUserPatterns(): Promise<UserPatterns> {
    const data = await this.getDashboardData();
    return data.userPatterns;
  }
}

export const dashboardService = new DashboardService();