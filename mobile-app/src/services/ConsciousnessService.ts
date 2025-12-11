/**
 * ConsciousnessService.ts
 * Core consciousness computing service for mobile
 * Handles API communication with MAIA consciousness computing beta server
 *
 * Created: December 8, 2025
 * Purpose: Bridge between mobile app and consciousness computing platform
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  ConsciousnessState,
  FieldState,
  NavigatorState,
  ConsciousnessSession,
  APIResponse,
  Element,
  Archetype,
  SessionType,
  AnalyticsData,
  UserSettings,
  AppError,
} from '../types';

class ConsciousnessServiceClass {
  private baseUrls: string[] = [
    'http://127.0.0.1:3008',        // iOS Simulator compatible basic server
    'http://127.0.0.1:3001',        // iOS Simulator compatible full API server
    'http://localhost:3008',         // Basic consciousness computing server
    'http://localhost:3001',         // Full API server with beta chat
    'http://soullab.life',           // Primary universal HTTP access
  ];
  private baseUrl: string = this.baseUrls[0]; // Start with universal access
  private apiKey: string | null = null;
  private isInitialized: boolean = false;
  private connectionStatus: 'connected' | 'disconnected' | 'limited' = 'disconnected';
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor() {
    this.loadStoredCredentials();
  }

  /**
   * Initialize consciousness service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🧠 Initializing ConsciousnessService...');

      // Check network connectivity
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.warn('⚠️ No network connection - starting in offline mode');
        this.connectionStatus = 'disconnected';
        this.isInitialized = true;
        return;
      }

      // Test connection to beta server
      const healthCheck = await this.healthCheck();
      if (healthCheck.success) {
        this.connectionStatus = 'connected';
        console.log('✅ Connected to MAIA consciousness computing platform');
      } else {
        this.connectionStatus = 'limited';
        console.warn('⚠️ Limited connection to consciousness platform');
      }

      this.isInitialized = true;

    } catch (error) {
      console.error('🔴 Failed to initialize ConsciousnessService:', error);
      this.connectionStatus = 'limited';
      this.isInitialized = true; // Still allow app to function
    }
  }

  /**
   * Load stored user credentials and settings
   */
  private async loadStoredCredentials(): Promise<void> {
    try {
      const storedApiKey = await AsyncStorage.getItem('maia_api_key');
      const storedBaseUrl = await AsyncStorage.getItem('maia_base_url');

      if (storedApiKey) {
        this.apiKey = storedApiKey;
      }

      if (storedBaseUrl) {
        this.baseUrl = storedBaseUrl;
      }

    } catch (error) {
      console.warn('⚠️ Failed to load stored credentials:', error);
    }
  }

  /**
   * Health check for consciousness platform
   */
  async healthCheck(): Promise<APIResponse> {
    try {
      const response = await this.makeRequest('/api/health', 'GET');
      return response;
    } catch (error) {
      return {
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get current consciousness state
   */
  async getConsciousnessState(): Promise<ConsciousnessState> {
    try {
      const response = await this.makeRequest('/api/consciousness/current', 'GET');

      if (response.success && response.data) {
        return response.data;
      }

      // Fallback consciousness state
      return this.getDefaultConsciousnessState();

    } catch (error) {
      console.warn('⚠️ Failed to get consciousness state, using defaults');
      return this.getDefaultConsciousnessState();
    }
  }

  /**
   * Get field state for collective awareness
   */
  async getFieldState(): Promise<FieldState> {
    try {
      const response = await this.makeRequest('/api/analytics/collective-resonance', 'GET');

      if (response.success && response.data) {
        // Transform dashboard data to field state format
        return this.transformDashboardToFieldState(response.data.dashboard);
      }

      // Fallback field state
      return this.getDefaultFieldState();

    } catch (error) {
      console.warn('⚠️ Failed to get field state, using defaults');
      return this.getDefaultFieldState();
    }
  }

  /**
   * Get Navigator state for personal guidance
   */
  async getNavigatorState(): Promise<NavigatorState> {
    try {
      const response = await this.makeRequest('/api/navigator/current', 'GET');

      if (response.success && response.data) {
        return response.data;
      }

      // Fallback navigator state
      return this.getDefaultNavigatorState();

    } catch (error) {
      console.warn('⚠️ Failed to get navigator state, using defaults');
      return this.getDefaultNavigatorState();
    }
  }

  /**
   * Start consciousness session
   */
  async startSession(
    type: SessionType,
    element: Element,
    archetype: Archetype,
    duration: number = 1200 // 20 minutes default
  ): Promise<ConsciousnessSession> {
    try {
      const sessionData = {
        type,
        element,
        archetype,
        duration,
        startTime: new Date().toISOString(),
        fciBefore: await this.getCurrentFCI(),
      };

      const response = await this.makeRequest('/api/sessions/start', 'POST', sessionData);

      if (response.success && response.data) {
        // Store session locally for offline access
        await this.storeSessionLocally(response.data);
        return response.data;
      }

      // Create local session if server unavailable
      const localSession: ConsciousnessSession = {
        id: `local-${Date.now()}`,
        ...sessionData,
      };

      await this.storeSessionLocally(localSession);
      return localSession;

    } catch (error) {
      console.error('🔴 Failed to start session:', error);
      throw new Error('Failed to start consciousness session');
    }
  }

  /**
   * End consciousness session
   */
  async endSession(sessionId: string, notes?: string): Promise<ConsciousnessSession> {
    try {
      const endData = {
        endTime: new Date().toISOString(),
        fciAfter: await this.getCurrentFCI(),
        notes,
      };

      const response = await this.makeRequest(`/api/sessions/${sessionId}/end`, 'POST', endData);

      if (response.success && response.data) {
        await this.updateStoredSession(sessionId, response.data);
        return response.data;
      }

      // Update local session if server unavailable
      const storedSession = await this.getStoredSession(sessionId);
      if (storedSession) {
        const updatedSession = { ...storedSession, ...endData };
        await this.updateStoredSession(sessionId, updatedSession);
        return updatedSession;
      }

      throw new Error('Session not found');

    } catch (error) {
      console.error('🔴 Failed to end session:', error);
      throw new Error('Failed to end consciousness session');
    }
  }

  /**
   * Get session history
   */
  async getSessionHistory(limit: number = 20): Promise<ConsciousnessSession[]> {
    try {
      // First try to get from server
      if (this.connectionStatus === 'connected') {
        const response = await this.makeRequest(`/api/sessions/history?limit=${limit}`, 'GET');
        if (response.success && response.data) {
          return response.data;
        }
      }

      // Fallback to local storage
      return await this.getLocalSessionHistory(limit);

    } catch (error) {
      console.warn('⚠️ Failed to get session history from server, using local data');
      return await this.getLocalSessionHistory(limit);
    }
  }

  /**
   * Get analytics data
   */
  async getAnalyticsData(timeRange: string = '7d'): Promise<AnalyticsData> {
    try {
      const response = await this.makeRequest(`/api/analytics/dashboard?range=${timeRange}`, 'GET');

      if (response.success && response.data) {
        return response.data;
      }

      // Fallback analytics
      return this.getDefaultAnalyticsData();

    } catch (error) {
      console.warn('⚠️ Failed to get analytics, using defaults');
      return this.getDefaultAnalyticsData();
    }
  }

  /**
   * Get current FCI (Field Coherence Index)
   */
  async getCurrentFCI(): Promise<number> {
    try {
      const response = await this.makeRequest('/api/consciousness/fci', 'GET');

      if (response.success && response.data?.fci) {
        return response.data.fci;
      }

      // Simulate FCI based on time and randomness for offline mode
      const now = Date.now();
      const baselineFCI = 0.75;
      const timeVariation = Math.sin(now / 600000) * 0.1; // 10-minute cycle
      const randomVariation = (Math.random() - 0.5) * 0.1;

      return Math.max(0.3, Math.min(0.95, baselineFCI + timeVariation + randomVariation));

    } catch (error) {
      // Fallback FCI calculation
      return 0.75;
    }
  }

  /**
   * Update user settings
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      // Store locally first
      await AsyncStorage.setItem('maia_user_settings', JSON.stringify(settings));

      // Then sync with server
      if (this.connectionStatus === 'connected') {
        await this.makeRequest('/api/user/settings', 'PUT', settings);
      }

    } catch (error) {
      console.error('🔴 Failed to update settings:', error);
      throw new Error('Failed to update user settings');
    }
  }

  /**
   * Make HTTP request to consciousness platform with automatic fallback
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<APIResponse> {
    if (!this.isInitialized) {
      throw new Error('ConsciousnessService not initialized');
    }

    // Try each URL in order until one works
    for (let i = 0; i < this.baseUrls.length; i++) {
      const baseUrl = this.baseUrls[i];

      try {
        const url = `${baseUrl}${endpoint}`;
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
          },
          ...(data && { body: JSON.stringify(data) }),
          timeout: 10000, // 10 second timeout per attempt
        };

        console.log(`🌐 Attempting request to: ${baseUrl}${endpoint}`);
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        // Success! Update current base URL for future requests
        if (this.baseUrl !== baseUrl) {
          console.log(`✅ Switched to working endpoint: ${baseUrl}`);
          this.baseUrl = baseUrl;
          await AsyncStorage.setItem('maia_base_url', baseUrl);
        }

        this.retryCount = 0; // Reset retry count on success
        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        };

      } catch (error) {
        console.warn(`⚠️ Failed to reach ${baseUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`);

        // If this is the last URL to try, return the error
        if (i === this.baseUrls.length - 1) {
          this.retryCount++;

          if (this.retryCount < this.maxRetries) {
            // Exponential backoff retry with all URLs again
            console.log(`🔄 Retrying all endpoints (attempt ${this.retryCount + 1}/${this.maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, this.retryCount)));
            return this.makeRequest(endpoint, method, data);
          }

          this.retryCount = 0;
          this.connectionStatus = 'disconnected';
          return {
            success: false,
            error: error instanceof Error ? error.message : 'All endpoints failed',
            timestamp: new Date().toISOString(),
          };
        }

        // Continue to next URL
        continue;
      }
    }

    // This should never be reached, but just in case
    return {
      success: false,
      error: 'No endpoints available',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Default consciousness state for offline mode
   */
  private getDefaultConsciousnessState(): ConsciousnessState {
    return {
      currentElement: 'aether',
      currentArchetype: 'mystic',
      fci: 0.75,
      timestamp: new Date().toISOString(),
      isSessionActive: false,
      sessionDuration: 0,
    };
  }

  /**
   * Default field state for offline mode
   */
  private getDefaultFieldState(): FieldState {
    return {
      collectiveFCI: 0.75,
      activeRituals: 0,
      connectedUsers: 1,
      elementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2,
      },
      recentActivity: [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Default navigator state for offline mode
   */
  private getDefaultNavigatorState(): NavigatorState {
    return {
      currentPath: 'personal_exploration',
      culturalContext: {
        primaryTradition: 'universal',
        secondaryInfluences: [],
        languagePreference: 'en',
        symbolicFramework: 'elements_archetypes',
        guidanceStyle: 'direct',
      },
      personalGuidance: 'Begin with present moment awareness and breath consciousness.',
      availableActions: [],
      progressData: {
        totalSessions: 0,
        elementalMastery: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
        archetypeActivations: {
          healer: 0, sage: 0, warrior: 0, mystic: 0,
          builder: 0, visionary: 0, guide: 0
        },
        avgFCIImprovement: 0,
        longestStreak: 0,
        currentStreak: 0,
        insights: [],
      },
    };
  }

  /**
   * Default analytics data for offline mode
   */
  private getDefaultAnalyticsData(): AnalyticsData {
    return {
      timeRange: '7d',
      fciTrend: [],
      elementalEffectiveness: [],
      sessionSuccess: 0,
      ritualParticipation: 0,
      personalGrowth: {
        weeklyProgress: 0,
        consistencyScore: 0,
        balanceImprovement: 0,
        insightGeneration: 0,
      },
    };
  }

  /**
   * Transform dashboard data to field state
   */
  private transformDashboardToFieldState(dashboard: any): FieldState {
    return {
      collectiveFCI: dashboard.currentFCI || 0.75,
      activeRituals: dashboard.activeRituals?.length || 0,
      connectedUsers: dashboard.connectedUsers || 1,
      elementalBalance: dashboard.elementalBalance || {
        fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2
      },
      recentActivity: dashboard.recentActivity || [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Local storage helpers
   */
  private async storeSessionLocally(session: ConsciousnessSession): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem('maia_sessions');
      const sessions = existing ? JSON.parse(existing) : [];
      sessions.push(session);
      await AsyncStorage.setItem('maia_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.warn('⚠️ Failed to store session locally:', error);
    }
  }

  private async getStoredSession(sessionId: string): Promise<ConsciousnessSession | null> {
    try {
      const existing = await AsyncStorage.getItem('maia_sessions');
      if (existing) {
        const sessions: ConsciousnessSession[] = JSON.parse(existing);
        return sessions.find(s => s.id === sessionId) || null;
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Failed to get stored session:', error);
      return null;
    }
  }

  private async updateStoredSession(sessionId: string, updates: Partial<ConsciousnessSession>): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem('maia_sessions');
      if (existing) {
        const sessions: ConsciousnessSession[] = JSON.parse(existing);
        const index = sessions.findIndex(s => s.id === sessionId);
        if (index >= 0) {
          sessions[index] = { ...sessions[index], ...updates };
          await AsyncStorage.setItem('maia_sessions', JSON.stringify(sessions));
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to update stored session:', error);
    }
  }

  private async getLocalSessionHistory(limit: number): Promise<ConsciousnessSession[]> {
    try {
      const existing = await AsyncStorage.getItem('maia_sessions');
      if (existing) {
        const sessions: ConsciousnessSession[] = JSON.parse(existing);
        return sessions
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          .slice(0, limit);
      }
      return [];
    } catch (error) {
      console.warn('⚠️ Failed to get local session history:', error);
      return [];
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'limited' {
    return this.connectionStatus;
  }

  /**
   * Cleanup service
   */
  cleanup(): void {
    console.log('🧹 Cleaning up ConsciousnessService...');
    this.isInitialized = false;
    this.connectionStatus = 'disconnected';
    this.retryCount = 0;
  }
}

// Export singleton instance
export const ConsciousnessService = new ConsciousnessServiceClass();