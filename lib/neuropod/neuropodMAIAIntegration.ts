// @ts-nocheck
/**
 * Neuropod ↔ MAIA Consciousness Integration
 *
 * Connects Neuropod state navigation to MAIA's consciousness architecture:
 * - Bloom's cognitive levels
 * - Spiral phases
 * - Elemental work
 * - Cognitive profile + stability
 * - Session history
 *
 * Enables intelligent state selection based on developmental readiness
 */

import type { Database } from '@/lib/types/dbPlaceholders';

// ============================================================================
// Types (matching Python neuropod_state_navigator.py)
// ============================================================================

export enum ConsciousnessState {
  BASELINE = 'baseline',
  CALM = 'calm',
  FOCUS = 'focus',
  DEPTH = 'depth',
  BREAKTHROUGH = 'breakthrough',
  SAFETY = 'safety',
  INTEGRATION = 'integration',
}

export enum BloomsLevel {
  REMEMBER = 1,
  UNDERSTAND = 2,
  APPLY = 3,
  ANALYZE = 4,
  EVALUATE = 5,
  CREATE = 6,
}

export enum SpiralPhase {
  BEIGE = 'survival',
  PURPLE = 'tribal',
  RED = 'power',
  BLUE = 'order',
  ORANGE = 'achievement',
  GREEN = 'communitarian',
  YELLOW = 'integrative',
  TURQUOISE = 'holistic',
}

export enum Element {
  WATER = 'water',
  FIRE = 'fire',
  EARTH = 'earth',
  AIR = 'air',
  ETHER = 'ether',
}

export interface MAIAConsciousnessProfile {
  userId: string;
  currentBloomLevel: BloomsLevel;
  avgBloomLevel: number;
  bloomStability: number;
  spiralPhase: SpiralPhase;
  spiralTrajectory: SpiralPhase[];
  primaryElement: Element;
  elementalBalance: Record<Element, number>;
  cognitiveBypassing: {
    spiritual: number;
    intellectual: number;
  };
  fieldWorkSafe: boolean;
  sessionHistory: NeuropodSessionSummary[];
}

export interface NeuropodSessionSummary {
  sessionId: string;
  state: ConsciousnessState;
  duration: number;
  overwhelmDetected: boolean;
  timestamp: string;
}

export interface StateRecommendation {
  state: ConsciousnessState;
  confidence: number;
  reasoning: string;
  prerequisites: string[];
  warnings: string[];
  durationRecommendation: number;
  intensityRecommendation: number;
}

export interface SessionPlan {
  userId: string;
  timestamp: string;
  intention: ConsciousnessState;
  pathway: ConsciousnessState[];
  durationMinutes: number;
  intensity: number;
  phases: SessionPhase[];
  safety: SafetyProtocols;
  maiaIntegration: MAIAIntegrationData;
}

export interface SessionPhase {
  state: ConsciousnessState;
  durationMinutes: number;
  purpose: string;
}

export interface SafetyProtocols {
  prerequisites: string[];
  warnings: string[];
  emergencyProtocols: {
    overwhelmDetected: EmergencyProtocol;
    userStop: EmergencyProtocol;
  };
}

export interface EmergencyProtocol {
  action: string;
  message: string;
  sound?: string;
  light?: string;
  haptic?: string;
  fadeDuration?: number;
}

export interface MAIAIntegrationData {
  bloomLevel: number;
  spiralPhase: string;
  element: string;
  reflectionPrompts: string[];
}

export interface CurrentBiometrics {
  alpha: number;
  beta: number;
  theta: number;
  gamma: number;
  hrvCoherence: number;
  edaArousal: number;
  movementVariance: number;
}

// ============================================================================
// MAIA Consciousness Profile Fetcher
// ============================================================================

export class MAIAProfileService {
  private supabase = createClient();

  /**
   * Fetch complete consciousness profile for Neuropod planning
   */
  async getConsciousnessProfile(userId: string): Promise<MAIAConsciousnessProfile> {
    // Get cognitive profile (Bloom's levels)
    const cognitiveProfile = await this.getCognitiveProfile(userId);

    // Get spiral phase (developmental trajectory)
    const spiralData = await this.getSpiralPhase(userId);

    // Get elemental work
    const elementalData = await this.getElementalWork(userId);

    // Get field safety status
    const fieldSafety = await this.getFieldSafety(userId);

    // Get recent Neuropod sessions
    const sessionHistory = await this.getNeuropodSessionHistory(userId);

    return {
      userId,
      currentBloomLevel: cognitiveProfile.currentLevel,
      avgBloomLevel: cognitiveProfile.avgLevel,
      bloomStability: cognitiveProfile.stability,
      spiralPhase: spiralData.currentPhase,
      spiralTrajectory: spiralData.trajectory,
      primaryElement: elementalData.primary,
      elementalBalance: elementalData.balance,
      cognitiveBypassing: cognitiveProfile.bypassing,
      fieldWorkSafe: fieldSafety,
      sessionHistory,
    };
  }

  /**
   * Get Bloom's cognitive levels + stability
   */
  private async getCognitiveProfile(userId: string) {
    const { data: turns, error } = await this.supabase
      .from('maia_turns')
      .select('bloom_level, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const bloomLevels = turns?.map((t) => t.bloom_level || 1) || [1];
    const currentLevel = bloomLevels[0] as BloomsLevel;
    const avgLevel = bloomLevels.reduce((a, b) => a + b, 0) / bloomLevels.length;

    // Stability = inverse of variance
    const variance =
      bloomLevels.reduce((sum, level) => sum + Math.pow(level - avgLevel, 2), 0) /
      bloomLevels.length;
    const stability = Math.max(0, 1 - variance / 4); // Normalize to 0-1

    // Bypassing detection (from existing MAIA router)
    const { data: metadata } = await this.supabase
      .from('maia_user_metadata')
      .select('cognitive_bypassing')
      .eq('user_id', userId)
      .single();

    const bypassing = metadata?.cognitive_bypassing || {
      spiritual: 0.0,
      intellectual: 0.0,
    };

    return {
      currentLevel,
      avgLevel,
      stability,
      bypassing,
    };
  }

  /**
   * Get Spiral Dynamics phase
   */
  private async getSpiralPhase(userId: string) {
    // This is a simplified version - you may have more sophisticated tracking
    // For now, infer from Bloom's level + elemental balance

    const { data: turns } = await this.supabase
      .from('maia_turns')
      .select('bloom_level')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const avgBloom = turns?.reduce((sum, t) => sum + (t.bloom_level || 1), 0) / (turns?.length || 1);

    // Map Bloom's to Spiral (rough approximation)
    let currentPhase: SpiralPhase;
    if (avgBloom < 2) currentPhase = SpiralPhase.PURPLE;
    else if (avgBloom < 3) currentPhase = SpiralPhase.RED;
    else if (avgBloom < 4) currentPhase = SpiralPhase.BLUE;
    else if (avgBloom < 5) currentPhase = SpiralPhase.ORANGE;
    else if (avgBloom < 6) currentPhase = SpiralPhase.GREEN;
    else currentPhase = SpiralPhase.YELLOW;

    // Trajectory (simplified - just track current)
    const trajectory = [currentPhase];

    return {
      currentPhase,
      trajectory,
    };
  }

  /**
   * Get elemental work data
   */
  private async getElementalWork(userId: string) {
    const { data: elementData } = await this.supabase
      .from('maia_user_metadata')
      .select('primary_element, elemental_balance')
      .eq('user_id', userId)
      .single();

    const primary = (elementData?.primary_element as Element) || Element.WATER;
    const balance = elementData?.elemental_balance || {
      [Element.WATER]: 0.5,
      [Element.FIRE]: 0.5,
      [Element.EARTH]: 0.5,
      [Element.AIR]: 0.5,
      [Element.ETHER]: 0.3,
    };

    return {
      primary,
      balance,
    };
  }

  /**
   * Get field safety status (from panconscious field router)
   */
  private async getFieldSafety(userId: string): Promise<boolean> {
    const { data: profile } = await this.supabase
      .from('maia_cognitive_profiles')
      .select('field_work_safe')
      .eq('user_id', userId)
      .single();

    return profile?.field_work_safe || false;
  }

  /**
   * Get recent Neuropod session history
   */
  private async getNeuropodSessionHistory(userId: string): Promise<NeuropodSessionSummary[]> {
    const { data: sessions } = await this.supabase
      .from('neuropod_sessions')
      .select('session_id, target_state, duration_minutes, overwhelm_detected, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return (
      sessions?.map((s) => ({
        sessionId: s.session_id,
        state: s.target_state as ConsciousnessState,
        duration: s.duration_minutes,
        overwhelmDetected: s.overwhelm_detected || false,
        timestamp: s.created_at,
      })) || []
    );
  }
}

// ============================================================================
// Neuropod State Navigation Service
// ============================================================================

export class NeuropodNavigationService {
  private profileService = new MAIAProfileService();
  private pythonBackendUrl = process.env.NEXT_PUBLIC_NEUROPOD_BACKEND_URL || 'http://localhost:8001';

  /**
   * Plan a Neuropod session based on user intention + current state
   */
  async planSession(
    userId: string,
    intention: ConsciousnessState,
    currentBiometrics?: CurrentBiometrics
  ): Promise<{
    targetState: ConsciousnessState;
    pathway: ConsciousnessState[];
    recommendation: StateRecommendation;
    sessionPlan: SessionPlan;
  }> {
    // Fetch MAIA consciousness profile
    const maiaProfile = await this.profileService.getConsciousnessProfile(userId);

    // Get current biometrics (or use defaults)
    const biometrics = currentBiometrics || this.getDefaultBiometrics();

    // Call Python backend State Navigator
    const response = await fetch(`${this.pythonBackendUrl}/neuropod/plan_session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_intention: intention,
        current_biometrics: biometrics,
        maia_profile: this.serializeProfile(maiaProfile),
      }),
    });

    if (!response.ok) {
      throw new Error(`State Navigator backend failed: ${response.statusText}`);
    }

    const plan = await response.json();
    return plan;
  }

  /**
   * Get default biometrics (when sensors not connected)
   */
  private getDefaultBiometrics(): CurrentBiometrics {
    return {
      alpha: 0.4,
      beta: 0.3,
      theta: 0.2,
      gamma: 0.1,
      hrvCoherence: 0.5,
      edaArousal: 0.4,
      movementVariance: 0.3,
    };
  }

  /**
   * Serialize MAIA profile for Python backend
   */
  private serializeProfile(profile: MAIAConsciousnessProfile) {
    return {
      user_id: profile.userId,
      current_bloom_level: profile.currentBloomLevel,
      avg_bloom_level: profile.avgBloomLevel,
      bloom_stability: profile.bloomStability,
      spiral_phase: profile.spiralPhase,
      spiral_trajectory: profile.spiralTrajectory,
      primary_element: profile.primaryElement,
      elemental_balance: profile.elementalBalance,
      cognitive_bypassing: profile.cognitiveBypassing,
      field_work_safe: profile.fieldWorkSafe,
      session_history: profile.sessionHistory.map((s) => ({
        state: s.state,
        duration: s.duration,
        overwhelm_detected: s.overwhelmDetected,
      })),
    };
  }

  /**
   * Save session plan to database
   */
  async saveSessionPlan(userId: string, plan: SessionPlan) {
    const supabase = createClient();

    const { data, error } = await supabase.from('neuropod_session_plans').insert({
      user_id: userId,
      intention: plan.intention,
      pathway: plan.pathway,
      duration_minutes: plan.durationMinutes,
      intensity: plan.intensity,
      phases: plan.phases,
      safety_protocols: plan.safety,
      maia_integration: plan.maiaIntegration,
      created_at: new Date().toISOString(),
    });

    if (error) throw error;
    return data;
  }

  /**
   * Start a Neuropod session (WebSocket connection to Python backend)
   */
  async startSession(sessionPlan: SessionPlan): Promise<WebSocket> {
    const ws = new WebSocket(`ws://localhost:8001/neuropod/session`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'START_SESSION',
          payload: sessionPlan,
        })
      );
    };

    return ws;
  }
}

// ============================================================================
// Export
// ============================================================================

export const neuropodNavigationService = new NeuropodNavigationService();
export const maiaProfileService = new MAIAProfileService();
