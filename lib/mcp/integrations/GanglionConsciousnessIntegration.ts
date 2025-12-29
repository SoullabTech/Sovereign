/**
 * Ganglion Consciousness Integration for MAIA-SOVEREIGN
 *
 * Bridges EEG data with MAIA's consciousness systems:
 * - Real-time brain state awareness in Oracle
 * - Focus and meditation guidance
 * - Biometric correlation with emotional/cognitive states
 *
 * Usage in Oracle:
 *   const brainContext = await ganglionIntegration.getOracleContext(userId);
 *   // MAIA can now reference user's current brain state
 */

import { EventEmitter } from 'events';
import {
  getGanglionAdapter,
  type DeviceStatus,
  type ConsciousnessState,
  type EEGSession,
} from '../adapters/GanglionAdapter';
import { getMCPClientManager } from '../MCPClientManager';
import type { GanglionMetrics } from '../types';

export interface OracleBrainContext {
  available: boolean;
  deviceConnected?: boolean;
  consciousnessLevel?: string;
  brainStateContext?: string;
  guidanceSuggestion?: string;
  metricsSnapshot?: GanglionMetrics;
  lastUpdated?: Date;
}

export interface BrainStateEvent {
  type: 'state_shift' | 'peak_focus' | 'deep_relaxation' | 'coherence_spike';
  description: string;
  intensity: number;
  timestamp: Date;
}

export interface BiometricGuidance {
  currentState: string;
  recommendation: string;
  optimalFor: string[];
  avoidFor: string[];
}

/**
 * Ganglion Consciousness Integration
 * Connects brain state with MAIA's awareness
 */
export class GanglionConsciousnessIntegration extends EventEmitter {
  private adapter = getGanglionAdapter();
  private manager = getMCPClientManager();
  private deviceConnected = false;
  private lastState: ConsciousnessState | null = null;

  constructor() {
    super();
  }

  /**
   * Initialize the integration
   */
  async initialize(): Promise<boolean> {
    try {
      await this.manager.initialize();

      if (!this.manager.isConnected('ganglion')) {
        console.log('[GanglionIntegration] Ganglion MCP not connected');
        return false;
      }

      // Check device status
      const status = await this.adapter.getStatus();
      if (status) {
        this.deviceConnected = status.connected;
        console.log(`[GanglionIntegration] Device ${status.connected ? 'connected' : 'not connected'}`);
      }

      return true;
    } catch (error) {
      console.error('[GanglionIntegration] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Get context for Oracle conversations
   * Main method for enriching MAIA's responses with brain state
   */
  async getOracleContext(userId: string): Promise<OracleBrainContext> {
    if (!this.manager.isConnected('ganglion')) {
      return { available: false };
    }

    try {
      const status = await this.adapter.getStatus();

      if (!status?.connected || !status?.streaming) {
        return {
          available: true,
          deviceConnected: status?.connected || false,
          brainStateContext: 'EEG device not streaming - no brain state data available.',
          lastUpdated: new Date(),
        };
      }

      // Get consciousness state
      const state = await this.adapter.getConsciousnessState();
      if (!state) {
        return {
          available: true,
          deviceConnected: true,
          brainStateContext: 'Unable to read brain state.',
          lastUpdated: new Date(),
        };
      }

      this.lastState = state;

      // Build context
      const brainStateContext = this.buildBrainStateContext(state);
      const guidanceSuggestion = this.generateGuidance(state);
      const metrics = await this.adapter.getMetrics();

      return {
        available: true,
        deviceConnected: true,
        consciousnessLevel: state.level,
        brainStateContext,
        guidanceSuggestion,
        metricsSnapshot: metrics || undefined,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('[GanglionIntegration] Failed to get context:', error);
      return { available: false };
    }
  }

  /**
   * Get biometric guidance for current state
   */
  async getBiometricGuidance(): Promise<BiometricGuidance | null> {
    const state = await this.adapter.getConsciousnessState();
    if (!state) return null;

    return this.generateBiometricGuidance(state);
  }

  /**
   * Check if brain state supports specific activity
   */
  async supportsActivity(
    activity: 'deep_work' | 'meditation' | 'creative' | 'social' | 'rest'
  ): Promise<{
    supported: boolean;
    confidence: number;
    reason: string;
  }> {
    const state = await this.adapter.getConsciousnessState();
    if (!state) {
      return {
        supported: true, // Assume supported if no data
        confidence: 0,
        reason: 'No brain state data available',
      };
    }

    switch (activity) {
      case 'deep_work':
        return this.evaluateForDeepWork(state);
      case 'meditation':
        return this.evaluateForMeditation(state);
      case 'creative':
        return this.evaluateForCreative(state);
      case 'social':
        return this.evaluateForSocial(state);
      case 'rest':
        return this.evaluateForRest(state);
      default:
        return { supported: true, confidence: 50, reason: 'Unknown activity' };
    }
  }

  /**
   * Generate brain state events for consciousness tracking
   */
  async generateBrainEvents(): Promise<BrainStateEvent[]> {
    const events: BrainStateEvent[] = [];
    const state = await this.adapter.getConsciousnessState();

    if (!state) return events;

    // State shift detection
    if (this.lastState && state.level !== this.lastState.level) {
      events.push({
        type: 'state_shift',
        description: `Brain state shifted from ${this.lastState.level} to ${state.level}`,
        intensity: Math.abs(state.focusScore - this.lastState.focusScore) / 100,
        timestamp: new Date(),
      });
    }

    // Peak focus detection
    if (state.focusScore >= 80) {
      events.push({
        type: 'peak_focus',
        description: `High focus state detected (${Math.round(state.focusScore)}/100)`,
        intensity: state.focusScore / 100,
        timestamp: new Date(),
      });
    }

    // Deep relaxation detection
    if (state.meditationScore >= 80) {
      events.push({
        type: 'deep_relaxation',
        description: `Deep relaxation state (${Math.round(state.meditationScore)}/100)`,
        intensity: state.meditationScore / 100,
        timestamp: new Date(),
      });
    }

    // Coherence spike
    if (state.coherence >= 0.7) {
      events.push({
        type: 'coherence_spike',
        description: `High neural coherence detected`,
        intensity: state.coherence,
        timestamp: new Date(),
      });
    }

    this.lastState = state;
    return events;
  }

  /**
   * Get session summary for reflection
   */
  async getSessionReflection(): Promise<string | null> {
    const session = this.adapter.getSessionSummary();
    if (!session) return null;

    const duration = Math.round((Date.now() - session.startTime.getTime()) / 60000);

    return `EEG session (${duration} min): ` +
      `Peak focus: ${Math.round(session.peakFocus)}/100, ` +
      `Peak meditation: ${Math.round(session.peakMeditation)}/100, ` +
      `${session.readings} readings collected.`;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private buildBrainStateContext(state: ConsciousnessState): string {
    const parts: string[] = [];

    // Describe current level
    switch (state.level) {
      case 'flow':
        parts.push('User is in a flow state - optimal balance of focus and relaxation.');
        break;
      case 'focused':
        parts.push('User is in a focused state - good for analytical or detailed work.');
        break;
      case 'relaxed':
        parts.push('User is in a relaxed state - good for reflection or creative work.');
        break;
      case 'alert':
        parts.push('User is alert but not deeply focused.');
        break;
      case 'unfocused':
        parts.push('User appears unfocused - may benefit from a break or change of activity.');
        break;
    }

    // Add dominant wave context
    const waveContext: Record<string, string> = {
      delta: 'Delta waves dominant - deep rest or drowsy.',
      theta: 'Theta waves dominant - creative or meditative state.',
      alpha: 'Alpha waves dominant - calm, relaxed alertness.',
      beta: 'Beta waves dominant - active thinking or concentration.',
      gamma: 'Gamma waves elevated - heightened perception.',
    };
    parts.push(waveContext[state.dominantWave] || '');

    // Add scores
    parts.push(`Focus: ${Math.round(state.focusScore)}/100, Meditation: ${Math.round(state.meditationScore)}/100.`);

    return parts.join(' ');
  }

  private generateGuidance(state: ConsciousnessState): string {
    if (state.level === 'flow') {
      return 'Optimal state - maintain current activity if meaningful.';
    }

    if (state.level === 'focused' && state.focusScore >= 70) {
      return 'Good time for complex tasks requiring sustained attention.';
    }

    if (state.level === 'relaxed' && state.meditationScore >= 70) {
      return 'Good time for journaling, reflection, or gentle creative work.';
    }

    if (state.level === 'unfocused') {
      return 'Consider a brief break, walk, or breathing exercise.';
    }

    return 'Moderate brain state - suitable for varied activities.';
  }

  private generateBiometricGuidance(state: ConsciousnessState): BiometricGuidance {
    if (state.level === 'flow') {
      return {
        currentState: 'Flow state',
        recommendation: 'Protect this state - minimize interruptions',
        optimalFor: ['deep work', 'creative projects', 'problem solving'],
        avoidFor: ['administrative tasks', 'meetings'],
      };
    }

    if (state.level === 'focused') {
      return {
        currentState: 'Focused state',
        recommendation: 'Good time for concentrated work',
        optimalFor: ['analytical tasks', 'reading', 'coding', 'writing'],
        avoidFor: ['brainstorming', 'open-ended exploration'],
      };
    }

    if (state.level === 'relaxed') {
      return {
        currentState: 'Relaxed state',
        recommendation: 'Good for reflection and creativity',
        optimalFor: ['journaling', 'creative work', 'meditation', 'social connection'],
        avoidFor: ['detailed analysis', 'time-sensitive work'],
      };
    }

    if (state.level === 'alert') {
      return {
        currentState: 'Alert but scattered',
        recommendation: 'Good for routine tasks or transition activities',
        optimalFor: ['email', 'planning', 'light reading'],
        avoidFor: ['deep work', 'important decisions'],
      };
    }

    return {
      currentState: 'Unfocused state',
      recommendation: 'Take a break or change environment',
      optimalFor: ['rest', 'walking', 'light movement'],
      avoidFor: ['complex tasks', 'important work'],
    };
  }

  private evaluateForDeepWork(state: ConsciousnessState): {
    supported: boolean;
    confidence: number;
    reason: string;
  } {
    if (state.level === 'flow' || state.level === 'focused') {
      return {
        supported: true,
        confidence: state.focusScore,
        reason: `Strong ${state.level} state supports deep work`,
      };
    }

    if (state.focusScore >= 50) {
      return {
        supported: true,
        confidence: state.focusScore,
        reason: 'Moderate focus - can engage with structured tasks',
      };
    }

    return {
      supported: false,
      confidence: 100 - state.focusScore,
      reason: 'Low focus - consider building up with smaller tasks first',
    };
  }

  private evaluateForMeditation(state: ConsciousnessState): {
    supported: boolean;
    confidence: number;
    reason: string;
  } {
    if (state.meditationScore >= 60 || state.level === 'relaxed') {
      return {
        supported: true,
        confidence: state.meditationScore,
        reason: 'Already in receptive state for meditation',
      };
    }

    if (state.level === 'focused') {
      return {
        supported: true,
        confidence: 60,
        reason: 'Focused state can transition well to meditation',
      };
    }

    return {
      supported: true,
      confidence: 40,
      reason: 'Meditation could help shift current state',
    };
  }

  private evaluateForCreative(state: ConsciousnessState): {
    supported: boolean;
    confidence: number;
    reason: string;
  } {
    if (state.dominantWave === 'alpha' || state.dominantWave === 'theta') {
      return {
        supported: true,
        confidence: 80,
        reason: `${state.dominantWave} waves support creative thinking`,
      };
    }

    if (state.level === 'relaxed' || state.level === 'flow') {
      return {
        supported: true,
        confidence: 70,
        reason: 'Relaxed/flow state supports creative work',
      };
    }

    return {
      supported: true,
      confidence: 50,
      reason: 'Creativity possible but may feel more effortful',
    };
  }

  private evaluateForSocial(state: ConsciousnessState): {
    supported: boolean;
    confidence: number;
    reason: string;
  } {
    if (state.level === 'flow' || state.focusScore >= 70) {
      return {
        supported: false,
        confidence: 70,
        reason: 'Deep focus state - interruption may be disruptive',
      };
    }

    return {
      supported: true,
      confidence: 60,
      reason: 'Brain state compatible with social engagement',
    };
  }

  private evaluateForRest(state: ConsciousnessState): {
    supported: boolean;
    confidence: number;
    reason: string;
  } {
    if (state.level === 'unfocused' || state.meditationScore >= 60) {
      return {
        supported: true,
        confidence: 80,
        reason: 'Brain state indicates rest would be beneficial',
      };
    }

    if (state.level === 'focused' || state.level === 'flow') {
      return {
        supported: false,
        confidence: 60,
        reason: 'Currently in productive state - rest can wait',
      };
    }

    return {
      supported: true,
      confidence: 50,
      reason: 'Rest is always an option',
    };
  }

  /**
   * Check if brain monitoring is available
   */
  isAvailable(): boolean {
    return this.manager.isConnected('ganglion');
  }

  /**
   * Check if device is currently streaming
   */
  isStreaming(): boolean {
    return this.deviceConnected;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.removeAllListeners();
  }
}

// Singleton instance
let instance: GanglionConsciousnessIntegration | null = null;

export function getGanglionConsciousnessIntegration(): GanglionConsciousnessIntegration {
  if (!instance) {
    instance = new GanglionConsciousnessIntegration();
  }
  return instance;
}

export function resetGanglionConsciousnessIntegration(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}
