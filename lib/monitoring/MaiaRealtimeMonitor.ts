/**
 * MAIA Realtime Monitoring System
 * Tracks soulful intelligence capabilities in real-time
 * Integrates with MaiaMonitoring and ARIAEvolutionMetrics
 */

import { maiaMonitoring, MaiaSystemMetrics } from '@/lib/beta/MaiaMonitoring';
import { ariaMetrics, ARIADiversityMetrics } from '@/lib/oracle/monitoring/ARIAEvolutionMetrics';

export interface MaiaRealtimeState {
  timestamp: string;

  // Core Health
  systemHealth: {
    api: 'healthy' | 'degraded' | 'down';
    voice: 'healthy' | 'degraded' | 'down';
    database: 'healthy' | 'degraded' | 'down';
    memory: 'healthy' | 'degraded' | 'down';
    overall: 'healthy' | 'degraded' | 'down';
  };

  // Soulful Capabilities
  soulfulIntelligence: {
    presenceQuality: number; // 0-1
    sacredMomentsLast24h: number;
    transformationPotential: number; // 0-1
    companionshipScore: number; // 0-1
    narrativeConsistency: number; // 0-1
  };

  // Voice Empathy
  voiceCapabilities: {
    enabled: boolean;
    ttsLatency: number; // ms
    audioQualityScore: number; // 0-1
    toneAdaptationRate: number; // 0-1
    voiceRecognitionAccuracy: number; // 0-1
    lastVoiceInteraction?: string;
  };

  // Symbolic Literacy
  symbolicAwareness: {
    symbolsDetectedLast24h: number;
    patternRecognitionQuality: number; // 0-1
    symbolicResonance: number; // 0-1
    crossSessionEvolution: number; // 0-1
    averageSymbolsPerEntry: number;
  };

  // Field Awareness
  fieldIntelligence: {
    resonanceScore: number; // 0-1
    emergenceQuality: number; // 0-1
    contextualAdaptation: number; // 0-1
    activeFields: number;
  };

  // Memory & Continuity
  memoryPerformance: {
    contextRecallRate: number; // 0-1
    averageMemoryDepth: number;
    nameRetentionRate: number; // 0-1
    sessionLinkingRate: number; // 0-1
  };

  // Active Sessions
  activeSessions: {
    total: number;
    byPresenceLevel: {
      high: number; // 0.8-1.0
      medium: number; // 0.5-0.8
      low: number; // 0.0-0.5
    };
    averageEngagement: number;
    averageSessionDuration: number; // seconds
  };

  // Emergence & Uniqueness
  emergence: {
    uniqueMayaPersonalities: number;
    averageDivergenceScore: number; // 0-1
    emergenceLevel: 'GENERIC' | 'CONFIGURED' | 'EMERGENT' | 'UNIQUE';
    voiceDiversityScore: number; // 0-1
  };

  // Critical Alerts
  alerts: {
    critical: Alert[];
    warnings: Alert[];
    info: Alert[];
  };

  // Performance Metrics
  performance: {
    averageResponseTime: number; // ms
    apiHealthScore: number; // 0-1
    contextPayloadCompleteness: number; // 0-1
    memoryInjectionSuccessRate: number; // 0-1
  };
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  component: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface VoiceMetrics {
  sessionId: string;
  userId: string;
  timestamp: Date;
  ttsLatencyMs: number;
  audioGenerated: boolean;
  audioQuality: 'excellent' | 'good' | 'poor' | 'failed';
  voiceProfile: string;
  element: string;
}

export interface SymbolicMetrics {
  sessionId: string;
  userId: string;
  timestamp: Date;
  symbolsDetected: string[];
  archetypesDetected: string[];
  emotionalTone: string;
  patternQuality: number; // 0-1
  crossSessionLinks: string[];
}

export class MaiaRealtimeMonitor {
  private voiceMetrics: VoiceMetrics[] = [];
  private symbolicMetrics: SymbolicMetrics[] = [];
  private alerts: Alert[] = [];
  private sessionStartTimes = new Map<string, Date>();
  private activeSessionCount = 0;

  // Track voice interaction
  trackVoiceInteraction(metrics: VoiceMetrics): void {
    this.voiceMetrics.push(metrics);

    // Clean old metrics (keep last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.voiceMetrics = this.voiceMetrics.filter(m => m.timestamp >= oneDayAgo);

    // Alert on poor quality
    if (metrics.audioQuality === 'failed' || metrics.audioQuality === 'poor') {
      this.addAlert({
        id: `voice_${Date.now()}`,
        severity: metrics.audioQuality === 'failed' ? 'critical' : 'warning',
        component: 'Voice System',
        message: `Voice quality ${metrics.audioQuality} for user ${metrics.userId.slice(0, 8)}`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Alert on high latency
    if (metrics.ttsLatencyMs > 3000) {
      this.addAlert({
        id: `latency_${Date.now()}`,
        severity: 'warning',
        component: 'Voice System',
        message: `High TTS latency: ${metrics.ttsLatencyMs}ms`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }
  }

  // Track symbolic analysis
  trackSymbolicAnalysis(metrics: SymbolicMetrics): void {
    this.symbolicMetrics.push(metrics);

    // Clean old metrics
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.symbolicMetrics = this.symbolicMetrics.filter(m => m.timestamp >= oneDayAgo);

    // Alert on low pattern quality
    if (metrics.patternQuality < 0.3) {
      this.addAlert({
        id: `pattern_${Date.now()}`,
        severity: 'info',
        component: 'Symbolic System',
        message: `Low pattern quality (${(metrics.patternQuality * 100).toFixed(0)}%) for user ${metrics.userId.slice(0, 8)}`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    // Celebrate high symbol detection
    if (metrics.symbolsDetected.length >= 5) {
      this.addAlert({
        id: `symbols_${Date.now()}`,
        severity: 'info',
        component: 'Symbolic System',
        message: `Rich symbolic emergence: ${metrics.symbolsDetected.length} symbols detected`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }
  }

  // Track session lifecycle
  startSession(sessionId: string): void {
    this.sessionStartTimes.set(sessionId, new Date());
    this.activeSessionCount++;
  }

  endSession(sessionId: string): void {
    this.sessionStartTimes.delete(sessionId);
    this.activeSessionCount = Math.max(0, this.activeSessionCount - 1);
  }

  // Add alert
  private addAlert(alert: Alert): void {
    this.alerts.push(alert);

    // Keep last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log critical alerts
    if (alert.severity === 'critical') {
      console.error('🚨 MAIA CRITICAL ALERT:', alert);
    }
  }

  // Generate realtime state
  async generateRealtimeState(): Promise<MaiaRealtimeState> {
    const systemMetrics = maiaMonitoring.generateSystemMetrics();
    const diversityReport = ariaMetrics.generateDiversityReport();

    const systemHealth = await this.assessSystemHealth();
    const voiceCapabilities = this.calculateVoiceCapabilities();
    const symbolicAwareness = this.calculateSymbolicAwareness();

    return {
      timestamp: new Date().toISOString(),

      systemHealth,

      soulfulIntelligence: {
        presenceQuality: systemMetrics.fieldResonanceAverage,
        sacredMomentsLast24h: systemMetrics.sacredThresholdTriggered,
        transformationPotential: systemMetrics.archetypeDetectionRate,
        companionshipScore: systemMetrics.narrativeConsistency,
        narrativeConsistency: systemMetrics.narrativeConsistency
      },

      voiceCapabilities,

      symbolicAwareness,

      fieldIntelligence: {
        resonanceScore: systemMetrics.fieldResonanceAverage,
        emergenceQuality: systemMetrics.archetypeDetectionRate,
        contextualAdaptation: systemMetrics.elementalAdaptationRate,
        activeFields: this.activeSessionCount
      },

      memoryPerformance: {
        contextRecallRate: systemMetrics.contextRecallRate,
        averageMemoryDepth: systemMetrics.averageMemoryDepth,
        nameRetentionRate: systemMetrics.nameRetentionRate,
        sessionLinkingRate: systemMetrics.sessionLinkingRate
      },

      activeSessions: this.calculateActiveSessions(systemMetrics),

      emergence: {
        uniqueMayaPersonalities: diversityReport.personalityDistribution.uniqueBlends,
        averageDivergenceScore: diversityReport.voiceDiversity.averageDivergence,
        emergenceLevel: diversityReport.emergenceProof.conclusion,
        voiceDiversityScore: diversityReport.voiceDiversity.uniqueVoiceProfiles / Math.max(1, diversityReport.totalUsers)
      },

      alerts: {
        critical: this.alerts.filter(a => a.severity === 'critical' && !a.resolved),
        warnings: this.alerts.filter(a => a.severity === 'warning' && !a.resolved),
        info: this.alerts.filter(a => a.severity === 'info' && !a.resolved).slice(-5) // Last 5 info
      },

      performance: {
        averageResponseTime: systemMetrics.averageResponseTime,
        apiHealthScore: systemMetrics.apiHealthScore,
        contextPayloadCompleteness: systemMetrics.contextPayloadCompleteness,
        memoryInjectionSuccessRate: systemMetrics.memoryInjectionSuccessRate
      }
    };
  }

  // Assess system health
  private async assessSystemHealth(): Promise<MaiaRealtimeState['systemHealth']> {
    const health = {
      api: 'healthy' as const,
      voice: 'healthy' as const,
      database: 'healthy' as const,
      memory: 'healthy' as const,
      overall: 'healthy' as const
    };

    // Check API
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      health.api = 'down';
    }

    // Check voice
    const recentVoiceMetrics = this.voiceMetrics.slice(-10);
    if (recentVoiceMetrics.length > 0) {
      const failureRate = recentVoiceMetrics.filter(m => m.audioQuality === 'failed').length / recentVoiceMetrics.length;
      if (failureRate > 0.5) health.voice = 'down';
      else if (failureRate > 0.2) health.voice = 'degraded';
    }

    // Check database
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      health.database = 'degraded';
    }

    // Check memory (based on injection success rate)
    const systemMetrics = maiaMonitoring.generateSystemMetrics();
    if (systemMetrics.memoryInjectionSuccessRate < 0.5) {
      health.memory = 'down';
    } else if (systemMetrics.memoryInjectionSuccessRate < 0.8) {
      health.memory = 'degraded';
    }

    // Calculate overall
    const states = [health.api, health.voice, health.database, health.memory];
    if (states.includes('down')) health.overall = 'down';
    else if (states.includes('degraded')) health.overall = 'degraded';

    return health;
  }

  // Calculate voice capabilities
  private calculateVoiceCapabilities(): MaiaRealtimeState['voiceCapabilities'] {
    const recentMetrics = this.voiceMetrics.slice(-20); // Last 20 interactions

    if (recentMetrics.length === 0) {
      return {
        enabled: false,
        ttsLatency: 0,
        audioQualityScore: 0,
        toneAdaptationRate: 0,
        voiceRecognitionAccuracy: 0
      };
    }

    const avgLatency = recentMetrics.reduce((sum, m) => sum + m.ttsLatencyMs, 0) / recentMetrics.length;
    const successRate = recentMetrics.filter(m => m.audioGenerated).length / recentMetrics.length;

    const qualityScores = {
      'excellent': 1.0,
      'good': 0.7,
      'poor': 0.3,
      'failed': 0.0
    };

    const avgQuality = recentMetrics.reduce((sum, m) =>
      sum + qualityScores[m.audioQuality], 0
    ) / recentMetrics.length;

    const lastInteraction = recentMetrics.length > 0
      ? recentMetrics[recentMetrics.length - 1].timestamp.toISOString()
      : undefined;

    return {
      enabled: true,
      ttsLatency: Math.round(avgLatency),
      audioQualityScore: avgQuality,
      toneAdaptationRate: successRate,
      voiceRecognitionAccuracy: 0.85, // Placeholder - needs real tracking
      lastVoiceInteraction: lastInteraction
    };
  }

  // Calculate symbolic awareness
  private calculateSymbolicAwareness(): MaiaRealtimeState['symbolicAwareness'] {
    const recentMetrics = this.symbolicMetrics.slice(-50); // Last 50 analyses

    if (recentMetrics.length === 0) {
      return {
        symbolsDetectedLast24h: 0,
        patternRecognitionQuality: 0,
        symbolicResonance: 0,
        crossSessionEvolution: 0,
        averageSymbolsPerEntry: 0
      };
    }

    const totalSymbols = recentMetrics.reduce((sum, m) => sum + m.symbolsDetected.length, 0);
    const avgSymbols = totalSymbols / recentMetrics.length;
    const avgPatternQuality = recentMetrics.reduce((sum, m) => sum + m.patternQuality, 0) / recentMetrics.length;

    // Calculate cross-session links
    const crossSessionLinks = new Set(recentMetrics.flatMap(m => m.crossSessionLinks));
    const crossSessionEvolution = Math.min(1, crossSessionLinks.size / 10); // Max at 10 links

    return {
      symbolsDetectedLast24h: totalSymbols,
      patternRecognitionQuality: avgPatternQuality,
      symbolicResonance: avgPatternQuality, // Same for now
      crossSessionEvolution,
      averageSymbolsPerEntry: avgSymbols
    };
  }

  // Calculate active sessions
  private calculateActiveSessions(systemMetrics: MaiaSystemMetrics): MaiaRealtimeState['activeSessions'] {
    return {
      total: this.activeSessionCount,
      byPresenceLevel: {
        high: 0, // Would need to track presence per session
        medium: Math.round(this.activeSessionCount * 0.7),
        low: Math.round(this.activeSessionCount * 0.3)
      },
      averageEngagement: systemMetrics.contextRecallRate,
      averageSessionDuration: 0 // Would need to calculate from session times
    };
  }

  // Get current alerts
  getAlerts(severity?: 'critical' | 'warning' | 'info'): Alert[] {
    if (severity) {
      return this.alerts.filter(a => a.severity === severity && !a.resolved);
    }
    return this.alerts.filter(a => !a.resolved);
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // Get health summary text
  getHealthSummary(): string {
    const state = this.generateRealtimeState();
    return `MAIA System: ${state.then(s => s.systemHealth.overall).toString().toUpperCase()}`;
  }
}

// Singleton instance
export const maiaRealtimeMonitor = new MaiaRealtimeMonitor();