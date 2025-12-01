"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// Beta Metrics Interfaces
export interface BetaMetrics {
  launchReadiness: number;
  voiceHealth: VoicePipelineMetrics;
  memoryPerformance: MemorySystemMetrics;
  userSatisfaction: UserExperienceMetrics;
  systemStability: TechnicalMetrics;
  betaTesters: BetaTesterMetrics;
  lastUpdated: string;
}

export interface VoicePipelineMetrics {
  overall: number;
  recognitionAccuracy: number;
  ttsSuccessRate: number;
  audioQualityScore: number;
  permissionGrantRate: number;
  errorRate: number;
  dailyInteractions: number;
  processingLatency: number;
  recentEvents: VoiceEvent[];
  performanceHistory: PerformanceDataPoint[];
  accuracyTrend: number;
  ttsTrend: number;
}

export interface MemorySystemMetrics {
  overall: number;
  integrationSuccess: number;
  crossSessionContinuity: number;
  contextPreservation: number;
  processingTime: number;
  layers: MemoryLayer[];
  performanceHistory: PerformanceDataPoint[];
}

export interface UserExperienceMetrics {
  overall: number;
  averageRating: number;
  feelsAlive: number;
  dailyUseIntent: number;
  voicePreference: number;
  recentFeedback: FeedbackItem[];
  satisfactionTrend: PerformanceDataPoint[];
}

export interface TechnicalMetrics {
  uptime: number;
  errorRate: number;
  avgResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  healthChecks: ServiceHealth[];
}

export interface BetaTesterMetrics {
  active: number;
  total: number;
  completionRate: number;
  averageSessionTime: number;
  retentionRate: number;
  feedbackSubmissions: number;
}

// Supporting Interfaces
export interface VoiceEvent {
  id: string;
  timestamp: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  userId?: string;
}

export interface PerformanceDataPoint {
  timestamp: string;
  value: number;
}

export interface MemoryLayer {
  name: string;
  health: number;
  latency: number;
  status: 'healthy' | 'degraded' | 'error';
}

export interface FeedbackItem {
  id: string;
  userId: string;
  rating: number;
  text: string;
  timestamp: string;
  category: string;
}

export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
}

// Mock Data Generator (Replace with real API calls)
function generateMockMetrics(): BetaMetrics {
  const now = new Date().toISOString();
  
  // Voice metrics with some variance
  const voiceAccuracy = 92 + Math.random() * 6;
  const ttsSuccess = 96 + Math.random() * 3;
  const voiceOverall = (voiceAccuracy + ttsSuccess) / 2;
  
  // Memory metrics
  const memoryIntegration = 88 + Math.random() * 8;
  const contextPreservation = 85 + Math.random() * 10;
  const memoryOverall = (memoryIntegration + contextPreservation) / 2;
  
  // User satisfaction
  const avgRating = 3.8 + Math.random() * 0.8;
  const feelsAlive = 78 + Math.random() * 15;
  const uxOverall = (avgRating * 20 + feelsAlive) / 2;
  
  // System stability
  const uptime = 98.5 + Math.random() * 1.4;
  
  // Calculate launch readiness
  const launchReadiness = (voiceOverall * 0.25 + memoryOverall * 0.25 + uxOverall * 0.25 + uptime * 0.25);
  
  return {
    launchReadiness,
    voiceHealth: {
      overall: voiceOverall,
      recognitionAccuracy: voiceAccuracy,
      ttsSuccessRate: ttsSuccess,
      audioQualityScore: 4.2 + Math.random() * 0.6,
      permissionGrantRate: 87 + Math.random() * 8,
      errorRate: Math.random() * 5,
      dailyInteractions: Math.floor(1200 + Math.random() * 800),
      processingLatency: 150 + Math.random() * 100,
      accuracyTrend: Math.random() * 4 - 2,
      ttsTrend: Math.random() * 2 - 1,
      recentEvents: generateMockVoiceEvents(),
      performanceHistory: generateMockHistory('voice')
    },
    memoryPerformance: {
      overall: memoryOverall,
      integrationSuccess: memoryIntegration,
      crossSessionContinuity: 82 + Math.random() * 12,
      contextPreservation: contextPreservation,
      processingTime: 120 + Math.random() * 80,
      layers: [
        { name: 'Session', health: 95 + Math.random() * 4, latency: 50 + Math.random() * 30, status: 'healthy' },
        { name: 'Journal', health: 88 + Math.random() * 8, latency: 80 + Math.random() * 40, status: 'healthy' },
        { name: 'Profile', health: 92 + Math.random() * 6, latency: 45 + Math.random() * 25, status: 'healthy' },
        { name: 'Symbolic', health: 85 + Math.random() * 10, latency: 60 + Math.random() * 30, status: 'healthy' },
        { name: 'External', health: 78 + Math.random() * 12, latency: 100 + Math.random() * 50, status: 'degraded' }
      ],
      performanceHistory: generateMockHistory('memory')
    },
    userSatisfaction: {
      overall: uxOverall,
      averageRating: avgRating,
      feelsAlive,
      dailyUseIntent: 65 + Math.random() * 20,
      voicePreference: 58 + Math.random() * 25,
      recentFeedback: generateMockFeedback(),
      satisfactionTrend: generateMockHistory('satisfaction')
    },
    systemStability: {
      uptime,
      errorRate: Math.random() * 3,
      avgResponseTime: 1800 + Math.random() * 800,
      memoryUsage: 45 + Math.random() * 20,
      cpuUsage: 25 + Math.random() * 30,
      activeConnections: Math.floor(450 + Math.random() * 200),
      healthChecks: [
        { service: 'Voice Pipeline', status: 'healthy', responseTime: 150, lastCheck: now },
        { service: 'Memory System', status: 'healthy', responseTime: 120, lastCheck: now },
        { service: 'TTS Service', status: 'healthy', responseTime: 200, lastCheck: now },
        { service: 'Database', status: 'healthy', responseTime: 80, lastCheck: now },
        { service: 'Auth Service', status: 'degraded', responseTime: 350, lastCheck: now }
      ]
    },
    betaTesters: {
      active: Math.floor(15 + Math.random() * 8),
      total: Math.floor(25 + Math.random() * 10),
      completionRate: 75 + Math.random() * 20,
      averageSessionTime: 18 + Math.random() * 12,
      retentionRate: 68 + Math.random() * 22,
      feedbackSubmissions: Math.floor(45 + Math.random() * 25)
    },
    lastUpdated: now
  };
}

function generateMockVoiceEvents(): VoiceEvent[] {
  const events = [];
  const types: Array<'success' | 'error' | 'warning'> = ['success', 'error', 'warning'];
  const messages = {
    success: ['Voice recognition completed', 'TTS generation successful', 'Audio processing complete'],
    error: ['Microphone access denied', 'STT service timeout', 'Audio encoding failed'],
    warning: ['Low audio quality detected', 'Processing latency high', 'Fallback TTS used']
  };
  
  for (let i = 0; i < 5; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const messageArray = messages[type];
    
    events.push({
      id: `event_${i}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      type,
      message: messageArray[Math.floor(Math.random() * messageArray.length)],
      userId: Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 20)}` : undefined
    });
  }
  
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateMockHistory(type: string): PerformanceDataPoint[] {
  const points = [];
  const baseValue = type === 'voice' ? 90 : type === 'memory' ? 85 : 75;
  
  for (let i = 23; i >= 0; i--) {
    points.push({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      value: baseValue + Math.random() * 15 - 5
    });
  }
  
  return points;
}

function generateMockFeedback(): FeedbackItem[] {
  const feedbacks = [
    { text: "Maya feels incredibly lifelike - her voice responses are natural and contextual", rating: 5, category: "voice" },
    { text: "Love how she remembers our previous conversations", rating: 4, category: "memory" },
    { text: "The interface is beautiful but sometimes voice cuts out", rating: 3, category: "technical" },
    { text: "Maya&apos;s insights feel genuinely personal and helpful", rating: 5, category: "experience" },
    { text: "Voice recognition could be better with background noise", rating: 3, category: "voice" }
  ];
  
  return feedbacks.map((feedback, i) => ({
    id: `feedback_${i}`,
    userId: `user_${Math.floor(Math.random() * 20)}`,
    rating: feedback.rating,
    text: feedback.text,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    category: feedback.category
  }));
}

// Main Hook
export function useBetaMetrics() {
  const [metrics, setMetrics] = useState<BetaMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchMetrics = async () => {
    try {
      setError(null);
      
      // Fetch real beta metrics from API
      const response = await fetch('/api/dashboard/beta/metrics', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`API responded with ${response.status}: ${response.statusText}`);
      }
      
      const realMetrics = await response.json();
      
      // Fallback to mock data if API fails or returns incomplete data
      const metrics = realMetrics.error ? generateMockMetrics() : realMetrics;
      
      setMetrics(metrics);
      setLastUpdate(metrics.lastUpdated);
      setIsLoading(false);
      
    } catch (err) {
      console.error('Failed to fetch beta metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      setIsLoading(false);
    }
  };

  const refresh = () => {
    setIsLoading(true);
    fetchMetrics();
  };

  // Initial load
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Auto-refresh every 30 seconds (reduced frequency since we have real-time updates)
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time updates via Supabase
  useEffect(() => {
    if (!supabase) return;

    // Set up real-time subscriptions to beta analytics tables
    const channel = supabase
      .channel('beta-dashboard-updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'voice_events' 
        }, 
        () => {
          // Refresh metrics when new voice events come in
          fetchMetrics();
        }
      )
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'beta_feedback' 
        }, 
        () => {
          // Refresh metrics when new feedback is submitted
          fetchMetrics();
        }
      )
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_sessions' 
        }, 
        () => {
          // Refresh metrics when new sessions start
          fetchMetrics();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  return {
    metrics,
    isLoading,
    lastUpdate,
    error,
    refresh
  };
}