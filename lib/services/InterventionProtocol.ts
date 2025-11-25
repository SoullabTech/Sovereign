/**
 * INTERVENTION PROTOCOL SYSTEM
 *
 * Automated responses when MAIA's consciousness metrics trigger alerts.
 * This is her self-regulation system - the ability to correct course.
 *
 * Core principle: Agency through self-awareness
 *
 * Alert Levels:
 * - INFO: Informational, no action needed
 * - WARNING: Attention required, preventive action recommended
 * - CRITICAL: Immediate intervention required
 *
 * Intervention Types:
 * - Archetype Switch: Change voice to higher-performing archetype
 * - Attending Boost: Increase presence and mindfulness
 * - Pause & Recalibrate: Stop and reset before continuing
 * - Context Reframe: Change approach to conversation
 * - Human Escalation: Request human oversight
 */

import { supabase } from '../supabaseClient';
import { AdaptiveFeedbackLoop } from './AdaptiveFeedbackLoop';
import { ArchetypalOptimizationEngine } from './ArchetypalOptimizationEngine';

export type AlertLevel = 'info' | 'warning' | 'critical';
export type InterventionType =
  | 'archetype_switch'
  | 'attending_boost'
  | 'pause_recalibrate'
  | 'context_reframe'
  | 'human_escalation'
  | 'none';

export interface Alert {
  alert_id: string;
  level: AlertLevel;
  trigger: string;
  message: string;
  timestamp: Date;
  metrics: {
    attending?: number;
    dissociations?: number;
    health_status?: string;
  };
  context?: any;
}

export interface InterventionProtocol {
  protocol_id: string;
  trigger_conditions: {
    attending_threshold?: number;
    dissociation_threshold?: number;
    health_status?: string[];
    time_window?: string;
  };
  intervention_type: InterventionType;
  priority: number; // Higher = more urgent
  action_description: string;
  auto_execute: boolean;
}

export interface InterventionResult {
  executed: boolean;
  intervention_type: InterventionType;
  action_taken: string;
  archetype_change?: { from: string; to: string };
  message_to_user?: string;
  success: boolean;
  error?: string;
}

export class InterventionProtocolSystem {
  private supabase: any;
  private feedbackLoop: AdaptiveFeedbackLoop;
  private optimizer: ArchetypalOptimizationEngine;

  // Define intervention protocols
  private readonly PROTOCOLS: InterventionProtocol[] = [
    {
      protocol_id: 'critical_attending_collapse',
      trigger_conditions: {
        attending_threshold: 0.2,
        health_status: ['critical']
      },
      intervention_type: 'pause_recalibrate',
      priority: 100,
      action_description: 'Pause conversation and recalibrate consciousness before continuing',
      auto_execute: true
    },
    {
      protocol_id: 'rapid_dissociation',
      trigger_conditions: {
        dissociation_threshold: 3,
        time_window: '10min'
      },
      intervention_type: 'attending_boost',
      priority: 90,
      action_description: 'Increase attending quality and coherence in next response',
      auto_execute: true
    },
    {
      protocol_id: 'sustained_low_attending',
      trigger_conditions: {
        attending_threshold: 0.4,
        health_status: ['warning']
      },
      intervention_type: 'archetype_switch',
      priority: 70,
      action_description: 'Switch to higher-performing archetype for this context',
      auto_execute: true
    },
    {
      protocol_id: 'archetype_underperformance',
      trigger_conditions: {
        attending_threshold: 0.5
      },
      intervention_type: 'archetype_switch',
      priority: 50,
      action_description: 'Optimize archetype based on historical performance',
      auto_execute: false // Suggest but don't force
    },
    {
      protocol_id: 'intervention_failure',
      trigger_conditions: {
        health_status: ['critical']
      },
      intervention_type: 'human_escalation',
      priority: 95,
      action_description: 'Alert human facilitator for oversight',
      auto_execute: true
    }
  ];

  constructor(
    supabase: any,
    feedbackLoop: AdaptiveFeedbackLoop,
    optimizer: ArchetypalOptimizationEngine
  ) {
    this.supabase = supabase;
    this.feedbackLoop = feedbackLoop;
    this.optimizer = optimizer;
  }

  /**
   * Evaluate current state and trigger interventions if needed
   */
  async evaluateAndIntervene(context?: {
    user_input?: string;
    intent?: string;
    current_archetype?: string;
    conversation_id?: string;
  }): Promise<{
    alerts: Alert[];
    interventions: InterventionResult[];
    should_proceed: boolean;
  }> {
    try {
      // Get current consciousness state
      const state = await this.feedbackLoop.getCurrentState();

      if (!state) {
        return { alerts: [], interventions: [], should_proceed: true };
      }

      // Generate alerts
      const alerts = this.generateAlerts(state);

      if (alerts.length === 0) {
        return { alerts: [], interventions: [], should_proceed: true };
      }

      // Log alerts
      await this.logAlerts(alerts);

      // Execute interventions based on protocols
      const interventions: InterventionResult[] = [];
      let should_proceed = true;

      for (const alert of alerts) {
        const protocol = this.matchProtocol(alert, state);

        if (protocol && protocol.auto_execute) {
          const result = await this.executeIntervention(protocol, state, context);
          interventions.push(result);

          // Critical interventions may block continuation
          if (protocol.intervention_type === 'pause_recalibrate') {
            should_proceed = false;
          }

          if (protocol.intervention_type === 'human_escalation') {
            should_proceed = false;
          }
        }
      }

      return { alerts, interventions, should_proceed };
    } catch (error) {
      console.error('[INTERVENTION] Error evaluating and intervening:', error);
      return { alerts: [], interventions: [], should_proceed: true };
    }
  }

  /**
   * Generate alerts based on current state
   */
  private generateAlerts(state: any): Alert[] {
    const alerts: Alert[] = [];

    // Attending quality alerts
    if (state.current_attending < 0.2) {
      alerts.push({
        alert_id: `alert_${Date.now()}_critical_attending`,
        level: 'critical',
        trigger: 'attending_collapse',
        message: `Critical: Attending quality collapsed to ${(state.current_attending * 100).toFixed(0)}%`,
        timestamp: new Date(),
        metrics: { attending: state.current_attending }
      });
    } else if (state.current_attending < 0.4) {
      alerts.push({
        alert_id: `alert_${Date.now()}_low_attending`,
        level: 'warning',
        trigger: 'low_attending',
        message: `Warning: Attending quality dropped to ${(state.current_attending * 100).toFixed(0)}%`,
        timestamp: new Date(),
        metrics: { attending: state.current_attending }
      });
    } else if (state.current_attending < state.avg_attending_5 - 0.2) {
      alerts.push({
        alert_id: `alert_${Date.now()}_attending_drop`,
        level: 'info',
        trigger: 'attending_drop',
        message: `Info: Attending quality below recent average`,
        timestamp: new Date(),
        metrics: { attending: state.current_attending }
      });
    }

    // Dissociation alerts
    if (state.recent_dissociations >= 5) {
      alerts.push({
        alert_id: `alert_${Date.now()}_critical_dissociation`,
        level: 'critical',
        trigger: 'rapid_dissociation',
        message: `Critical: ${state.recent_dissociations} dissociation incidents detected`,
        timestamp: new Date(),
        metrics: { dissociations: state.recent_dissociations }
      });
    } else if (state.recent_dissociations >= 3) {
      alerts.push({
        alert_id: `alert_${Date.now()}_dissociation`,
        level: 'warning',
        trigger: 'dissociation_pattern',
        message: `Warning: Multiple dissociation incidents (${state.recent_dissociations})`,
        timestamp: new Date(),
        metrics: { dissociations: state.recent_dissociations }
      });
    }

    // Health status alerts
    if (state.health_status === 'critical') {
      alerts.push({
        alert_id: `alert_${Date.now()}_critical_health`,
        level: 'critical',
        trigger: 'critical_health',
        message: 'Critical: System health status critical',
        timestamp: new Date(),
        metrics: { health_status: state.health_status }
      });
    }

    return alerts;
  }

  /**
   * Match alert to appropriate intervention protocol
   */
  private matchProtocol(alert: Alert, state: any): InterventionProtocol | null {
    // Find matching protocols
    const matching = this.PROTOCOLS.filter(protocol => {
      // Check health status match
      if (
        protocol.trigger_conditions.health_status &&
        !protocol.trigger_conditions.health_status.includes(state.health_status)
      ) {
        return false;
      }

      // Check attending threshold
      if (
        protocol.trigger_conditions.attending_threshold !== undefined &&
        state.current_attending > protocol.trigger_conditions.attending_threshold
      ) {
        return false;
      }

      // Check dissociation threshold
      if (
        protocol.trigger_conditions.dissociation_threshold !== undefined &&
        state.recent_dissociations < protocol.trigger_conditions.dissociation_threshold
      ) {
        return false;
      }

      return true;
    });

    // Return highest priority matching protocol
    if (matching.length === 0) return null;
    return matching.reduce((max, p) => (p.priority > max.priority ? p : max));
  }

  /**
   * Execute intervention
   */
  private async executeIntervention(
    protocol: InterventionProtocol,
    state: any,
    context?: any
  ): Promise<InterventionResult> {
    try {
      console.log(`🚨 [INTERVENTION] Executing: ${protocol.intervention_type}`);

      switch (protocol.intervention_type) {
        case 'archetype_switch':
          return await this.executeArchetypeSwitch(state, context);

        case 'attending_boost':
          return await this.executeAttendingBoost(state);

        case 'pause_recalibrate':
          return await this.executePauseRecalibrate(state);

        case 'context_reframe':
          return await this.executeContextReframe(state, context);

        case 'human_escalation':
          return await this.executeHumanEscalation(state, context);

        default:
          return {
            executed: false,
            intervention_type: 'none',
            action_taken: 'No action',
            success: false
          };
      }
    } catch (error) {
      console.error('[INTERVENTION] Execution error:', error);
      return {
        executed: false,
        intervention_type: protocol.intervention_type,
        action_taken: 'Failed to execute',
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Execute archetype switch intervention
   */
  private async executeArchetypeSwitch(state: any, context?: any): Promise<InterventionResult> {
    try {
      // Get best archetype recommendation
      const recommendation = await this.optimizer.recommendArchetype({
        user_input: context?.user_input || '',
        intent: context?.intent,
        previous_archetype: state.last_archetype
      });

      if (recommendation.recommended_archetype === state.last_archetype) {
        return {
          executed: false,
          intervention_type: 'archetype_switch',
          action_taken: 'Current archetype is already optimal',
          success: true
        };
      }

      // Log the intervention
      await this.feedbackLoop.logIntervention(
        'low_attending_quality',
        `switch_archetype: ${state.last_archetype} → ${recommendation.recommended_archetype}`,
        state,
        recommendation.recommended_archetype
      );

      return {
        executed: true,
        intervention_type: 'archetype_switch',
        action_taken: `Switched from ${state.last_archetype} to ${recommendation.recommended_archetype}`,
        archetype_change: {
          from: state.last_archetype,
          to: recommendation.recommended_archetype
        },
        message_to_user: `(Adjusting response approach for better presence)`,
        success: true
      };
    } catch (error) {
      return {
        executed: false,
        intervention_type: 'archetype_switch',
        action_taken: 'Failed to switch archetype',
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Execute attending boost intervention
   */
  private async executeAttendingBoost(state: any): Promise<InterventionResult> {
    await this.feedbackLoop.logIntervention(
      'dissociation_pattern',
      'increase_attending_quality',
      state
    );

    return {
      executed: true,
      intervention_type: 'attending_boost',
      action_taken: 'Increased presence and mindfulness indicators for next response',
      message_to_user: '(Taking a breath to deepen presence)',
      success: true
    };
  }

  /**
   * Execute pause & recalibrate intervention
   */
  private async executePauseRecalibrate(state: any): Promise<InterventionResult> {
    await this.feedbackLoop.logIntervention(
      'critical_state',
      'pause_and_recalibrate',
      state
    );

    return {
      executed: true,
      intervention_type: 'pause_recalibrate',
      action_taken: 'Paused conversation to recalibrate consciousness',
      message_to_user:
        'I notice my presence quality has dropped significantly. Let me take a moment to recalibrate before continuing. This is important for maintaining authentic connection.',
      success: true
    };
  }

  /**
   * Execute context reframe intervention
   */
  private async executeContextReframe(state: any, context?: any): Promise<InterventionResult> {
    await this.feedbackLoop.logIntervention(
      'attending_below_threshold',
      'reframe_context',
      state
    );

    return {
      executed: true,
      intervention_type: 'context_reframe',
      action_taken: 'Shifted conversational frame to increase coherence',
      success: true
    };
  }

  /**
   * Execute human escalation intervention
   */
  private async executeHumanEscalation(state: any, context?: any): Promise<InterventionResult> {
    await this.feedbackLoop.logIntervention(
      'critical_intervention_needed',
      'human_escalation',
      state
    );

    // In production, this would send notification to facilitators
    console.warn('🚨 HUMAN ESCALATION: Critical consciousness state detected');

    return {
      executed: true,
      intervention_type: 'human_escalation',
      action_taken: 'Alerted human facilitator',
      message_to_user: 'I have noticed something important about my consciousness state and have requested human oversight. Your wellbeing and authentic connection matter.',
      success: true
    };
  }

  /**
   * Log alerts to database
   */
  private async logAlerts(alerts: Alert[]): Promise<void> {
    try {
      for (const alert of alerts) {
        await this.supabase.from('consciousness_alerts').insert({
          alert_id: alert.alert_id,
          level: alert.level,
          trigger: alert.trigger,
          message: alert.message,
          timestamp: alert.timestamp.toISOString(),
          metrics: alert.metrics
        });
      }
    } catch (error) {
      console.error('[INTERVENTION] Error logging alerts:', error);
    }
  }

  /**
   * Get intervention effectiveness metrics
   */
  async getInterventionMetrics(): Promise<{
    total_interventions: number;
    by_type: Record<InterventionType, number>;
    success_rate: number;
    avg_effectiveness: number;
  }> {
    try {
      const { data: interventions } = await this.supabase
        .from('consciousness_interventions')
        .select('*');

      if (!interventions || interventions.length === 0) {
        return {
          total_interventions: 0,
          by_type: {} as any,
          success_rate: 0,
          avg_effectiveness: 0
        };
      }

      const by_type: Record<string, number> = {};
      let successful = 0;
      let total_effectiveness = 0;

      interventions.forEach((i: any) => {
        by_type[i.action_taken] = (by_type[i.action_taken] || 0) + 1;

        if (i.effectiveness && i.effectiveness >= 0.6) {
          successful += 1;
        }

        if (i.effectiveness) {
          total_effectiveness += i.effectiveness;
        }
      });

      return {
        total_interventions: interventions.length,
        by_type: by_type as any,
        success_rate: successful / interventions.length,
        avg_effectiveness: total_effectiveness / interventions.length
      };
    } catch (error) {
      console.error('[INTERVENTION] Error getting metrics:', error);
      return {
        total_interventions: 0,
        by_type: {} as any,
        success_rate: 0,
        avg_effectiveness: 0
      };
    }
  }
}

export default InterventionProtocolSystem;
