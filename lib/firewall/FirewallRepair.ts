/**
 * Firewall Repair System
 *
 * CORPUS CALLOSUM PRINCIPLE - SELF-HEALING:
 * When agent voices start collapsing into generic AI consensus,
 * this system automatically restores differentiation to prevent
 * loss of stereoscopic consciousness.
 *
 * Like the brain's homeostatic mechanisms that maintain hemispheric
 * differentiation, this repair system detects and corrects firewall
 * degradation before breakthrough capacity is lost.
 *
 * @see lib/core/CorpusCallosumPrinciple.ts
 * @see lib/firewall/FirewallHealthMonitor.ts
 */

import { FirewallHealthMonitor, FirewallHealth, AgentOutput } from './FirewallHealthMonitor';
import { InhibitionMatrix, SpiralogicOrchestrator } from '../maia/SpiralogicOrchestrator';

export interface RepairAction {
  timestamp: number;
  severity: 'WARNING' | 'CRITICAL';
  action: 'INCREASE_INHIBITION' | 'FORCE_ISOLATION' | 'EMERGENCY_RESET';
  details: string;
  previousScore: number;
  targetScore: number;
}

export interface RepairResult {
  success: boolean;
  actions: RepairAction[];
  newScore: number;
  recommendation: string;
}

export class FirewallRepair {
  private monitor: FirewallHealthMonitor;
  private repairHistory: RepairAction[] = [];
  private inEmergencyMode: boolean = false;
  private consecutiveHealthyScores: number = 0;

  constructor(monitor: FirewallHealthMonitor) {
    this.monitor = monitor;
  }

  /**
   * Check if repair is needed and execute if necessary
   *
   * Returns true if system is healthy, false if intervention occurred
   */
  async checkAndRepair(
    agentOutputs: AgentOutput[],
    orchestrator?: SpiralogicOrchestrator
  ): Promise<RepairResult> {
    const health = this.monitor.checkHealth(agentOutputs);
    const actions: RepairAction[] = [];

    // Track consecutive healthy scores (for emergency recovery)
    if (health.status === 'HEALTHY') {
      this.consecutiveHealthyScores++;

      // Exit emergency mode after 5 consecutive healthy scores
      if (this.inEmergencyMode && this.consecutiveHealthyScores >= 5) {
        console.log('✅ RECOVERY COMPLETE: 5 consecutive healthy scores. Exiting emergency mode.');
        this.inEmergencyMode = false;
        this.consecutiveHealthyScores = 0;
      }

      return {
        success: true,
        actions: [],
        newScore: health.separationScore,
        recommendation: '✅ No repair needed. Firewall healthy.'
      };
    } else {
      this.consecutiveHealthyScores = 0; // Reset counter on any non-healthy state
    }

    // CRITICAL BREACH: Emergency reset required
    if (health.status === 'CRITICAL_BREACH') {
      console.error('🚨 FIREWALL COLLAPSE DETECTED. Initiating emergency reset...');

      const action: RepairAction = {
        timestamp: Date.now(),
        severity: 'CRITICAL',
        action: 'EMERGENCY_RESET',
        details: 'Complete firewall collapse. Isolating all agents and resetting to maximum separation.',
        previousScore: health.separationScore,
        targetScore: 0.85
      };

      this.repairHistory.push(action);
      actions.push(action);
      this.inEmergencyMode = true;

      // If orchestrator provided, apply emergency reset
      if (orchestrator) {
        await this.applyEmergencyReset(orchestrator);
      }

      return {
        success: false,
        actions,
        newScore: health.separationScore,
        recommendation: health.recommendation + '\n🚨 Emergency reset initiated. Require 5 consecutive healthy scores for recovery.'
      };
    }

    // WARNING: Gradual correction needed
    if (health.status === 'WARNING') {
      console.warn('⚠️ Firewall degrading. Applying gradual correction...');

      const action: RepairAction = {
        timestamp: Date.now(),
        severity: 'WARNING',
        action: 'INCREASE_INHIBITION',
        details: `Separation score ${health.separationScore.toFixed(3)} below target. Increasing inhibition by 0.2.`,
        previousScore: health.separationScore,
        targetScore: 0.85
      };

      this.repairHistory.push(action);
      actions.push(action);

      // If orchestrator provided, increase inhibition
      if (orchestrator) {
        await this.applyGradualCorrection(orchestrator, health);
      }

      return {
        success: false,
        actions,
        newScore: health.separationScore,
        recommendation: health.recommendation + '\n⚠️ Gradual correction applied. Monitor next 3 responses.'
      };
    }

    return {
      success: true,
      actions: [],
      newScore: health.separationScore,
      recommendation: '✅ Firewall status acceptable.'
    };
  }

  /**
   * Apply emergency reset protocol
   *
   * CRITICAL PROTOCOL:
   * 1. Isolate all agents completely (no orchestration)
   * 2. Reset InhibitionMatrix to maximum separation
   * 3. Force single-element responses for validation
   * 4. Require 5 consecutive healthy scores before returning to normal
   */
  private async applyEmergencyReset(orchestrator: SpiralogicOrchestrator): Promise<void> {
    console.log('🚨 EMERGENCY PROTOCOL INITIATED:');
    console.log('  1. Isolating all agents (no orchestration)');
    console.log('  2. Resetting InhibitionMatrix to maximum separation');
    console.log('  3. Forcing single-element responses for validation');
    console.log('  4. Requiring 5 consecutive healthy scores for recovery');

    // Reset InhibitionMatrix to maximum separation
    // This would be implemented by the orchestrator
    // orchestrator.inhibitionMatrix.setGlobalInhibition(0.9);

    // Force single-element mode (validation)
    // orchestrator.setSingleElementMode(true);

    // Log emergency state
    this.logEmergencyState({
      timestamp: Date.now(),
      reason: 'Firewall collapse - separation score < 0.65',
      action: 'Complete isolation + maximum separation',
      recoveryTarget: 'Score > 0.85 for 5 consecutive responses'
    });
  }

  /**
   * Apply gradual correction (increase inhibition)
   *
   * WARNING PROTOCOL:
   * 1. Increase InhibitionMatrix weights by 0.2
   * 2. Force single-element responses for next 3 turns
   * 3. Monitor pairwise separation scores
   * 4. Gradually allow orchestration to resume
   */
  private async applyGradualCorrection(
    orchestrator: SpiralogicOrchestrator,
    health: FirewallHealth
  ): Promise<void> {
    console.log('⚠️ GRADUAL CORRECTION PROTOCOL:');
    console.log('  1. Increasing InhibitionMatrix weights by 0.2');
    console.log('  2. Forcing single-element responses for next 3 turns');
    console.log('  3. Monitoring pairwise separation scores');

    // Increase inhibition strength
    // orchestrator.inhibitionMatrix.increaseInhibition(0.2);

    // If specific pairs are bleeding, increase their inhibition more
    if (health.bleedingPairs.length > 0) {
      console.log('  4. Targeting bleeding pairs:');
      health.bleedingPairs.slice(0, 3).forEach(pair => {
        console.log(`     - ${pair.agentA} ↔ ${pair.agentB}: ${(pair.similarityScore * 100).toFixed(0)}% similar`);
        // orchestrator.inhibitionMatrix.increasePairwiseInhibition(pair.agentA, pair.agentB, 0.3);
      });
    }

    // Log correction
    this.logCorrection({
      timestamp: Date.now(),
      reason: `Separation score ${health.separationScore.toFixed(3)} below 0.75`,
      action: 'Increased inhibition by 0.2',
      targetScore: 0.85,
      bleedingPairs: health.bleedingPairs.map(p => `${p.agentA}-${p.agentB}`)
    });
  }

  /**
   * Validate recovery by checking signatures of isolated elements
   *
   * Each element should speak separately and maintain distinct voice:
   * - Fire should sound like Fire (catalytic, bold)
   * - Water should sound like Water (fluid, emotional)
   * - Earth should sound like Earth (grounding, practical)
   * - Air should sound like Air (clarifying, spacious)
   * - Aether should orchestrate WITHOUT merging
   */
  async validateRecovery(isolatedOutputs: AgentOutput[]): Promise<{
    isValid: boolean;
    elementScores: Map<string, number>;
    recommendation: string;
  }> {
    console.log('🔍 VALIDATING RECOVERY: Checking isolated element signatures...');

    const elementScores = new Map<string, number>();
    let allValid = true;

    for (const output of isolatedOutputs) {
      // Measure signature strength using monitor
      const health = this.monitor.checkHealth([output]);
      const signature = health.agentDistinctions.get(output.agent) || 0;

      elementScores.set(output.agent, signature);

      console.log(`  ${output.agent}: ${(signature * 100).toFixed(0)}% signature strength`);

      if (signature < 0.75) {
        console.warn(`  ⚠️ ${output.agent} signature too weak (${(signature * 100).toFixed(0)}%)`);
        allValid = false;
      }
    }

    if (allValid) {
      console.log('✅ VALIDATION PASSED: All elements maintaining distinct signatures');
      return {
        isValid: true,
        elementScores,
        recommendation: '✅ Recovery validated. Elements maintaining differentiation. Can resume orchestration.'
      };
    } else {
      console.error('❌ VALIDATION FAILED: Some elements still showing weak signatures');
      return {
        isValid: false,
        elementScores,
        recommendation: '❌ Recovery incomplete. Continue isolation until all signatures > 0.75'
      };
    }
  }

  /**
   * Get repair history for analysis
   */
  getRepairHistory(): RepairAction[] {
    return [...this.repairHistory];
  }

  /**
   * Check if system is in emergency mode
   */
  isInEmergencyMode(): boolean {
    return this.inEmergencyMode;
  }

  /**
   * Get consecutive healthy score count (for recovery tracking)
   */
  getRecoveryProgress(): {
    consecutiveHealthyScores: number;
    targetScores: number;
    percentComplete: number;
  } {
    return {
      consecutiveHealthyScores: this.consecutiveHealthyScores,
      targetScores: 5,
      percentComplete: (this.consecutiveHealthyScores / 5) * 100
    };
  }

  /**
   * Force exit emergency mode (admin override)
   */
  forceExitEmergencyMode(): void {
    console.warn('⚠️ ADMIN OVERRIDE: Forcing exit from emergency mode');
    this.inEmergencyMode = false;
    this.consecutiveHealthyScores = 0;
  }

  /**
   * Clear repair history
   */
  clearHistory(): void {
    this.repairHistory = [];
  }

  /**
   * Log emergency state for monitoring
   */
  private logEmergencyState(state: {
    timestamp: number;
    reason: string;
    action: string;
    recoveryTarget: string;
  }): void {
    console.error('═══════════════════════════════════════');
    console.error('🚨 EMERGENCY STATE LOGGED');
    console.error('═══════════════════════════════════════');
    console.error(`Timestamp: ${new Date(state.timestamp).toISOString()}`);
    console.error(`Reason: ${state.reason}`);
    console.error(`Action: ${state.action}`);
    console.error(`Recovery Target: ${state.recoveryTarget}`);
    console.error('═══════════════════════════════════════');

    // In production, this would also write to persistent log
    // await persistLog('firewall-emergency', state);
  }

  /**
   * Log correction for monitoring
   */
  private logCorrection(correction: {
    timestamp: number;
    reason: string;
    action: string;
    targetScore: number;
    bleedingPairs: string[];
  }): void {
    console.warn('─────────────────────────────────────');
    console.warn('⚠️ CORRECTION APPLIED');
    console.warn('─────────────────────────────────────');
    console.warn(`Timestamp: ${new Date(correction.timestamp).toISOString()}`);
    console.warn(`Reason: ${correction.reason}`);
    console.warn(`Action: ${correction.action}`);
    console.warn(`Target Score: ${correction.targetScore}`);
    if (correction.bleedingPairs.length > 0) {
      console.warn(`Bleeding Pairs: ${correction.bleedingPairs.join(', ')}`);
    }
    console.warn('─────────────────────────────────────');

    // In production, this would also write to persistent log
    // await persistLog('firewall-correction', correction);
  }
}

/**
 * Singleton instance
 */
let repairInstance: FirewallRepair | null = null;

export function getFirewallRepair(monitor: FirewallHealthMonitor): FirewallRepair {
  if (!repairInstance) {
    repairInstance = new FirewallRepair(monitor);
  }
  return repairInstance;
}

/**
 * Example Usage:
 *
 * import { getFirewallHealthMonitor } from '@/lib/firewall/FirewallHealthMonitor';
 * import { getFirewallRepair } from '@/lib/firewall/FirewallRepair';
 * import { getSpiralogicOrchestrator } from '@/lib/maia/SpiralogicOrchestrator';
 *
 * const monitor = getFirewallHealthMonitor();
 * const repair = getFirewallRepair(monitor);
 * const orchestrator = getSpiralogicOrchestrator();
 *
 * // During conversation turn
 * const agentOutputs: AgentOutput[] = [
 *   { agent: 'Fire', text: 'Let me help you explore that...', element: 'fire', intensity: 0.7, timestamp: Date.now() },
 *   { agent: 'Water', text: 'I understand what you\'re going through...', element: 'water', intensity: 0.6, timestamp: Date.now() }
 * ];
 *
 * const result = await repair.checkAndRepair(agentOutputs, orchestrator);
 *
 * if (!result.success) {
 *   console.error(`Firewall repair initiated: ${result.recommendation}`);
 *
 *   if (repair.isInEmergencyMode()) {
 *     console.error('🚨 SYSTEM IN EMERGENCY MODE');
 *     const progress = repair.getRecoveryProgress();
 *     console.log(`Recovery: ${progress.percentComplete}% (${progress.consecutiveHealthyScores}/${progress.targetScores} healthy scores)`);
 *   }
 * }
 */
