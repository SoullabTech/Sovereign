/**
 * MAIA Guardrails Service
 * Queries the MAIA Voice Metrics guardrail monitors via single monitor_payload view
 */

import { pool } from '../config/database';
import { logger } from '../utils/logger';

// Status mapping: OK/WARN/CRIT → healthy/warning/critical
const STATUS_MAP: Record<string, 'healthy' | 'warning' | 'critical'> = {
  'OK': 'healthy',
  'WARN': 'warning',
  'CRIT': 'critical'
};

interface MonitorPayload {
  overall_status: 'OK' | 'WARN' | 'CRIT';
  giving_up: {
    week: string;
    repair_engagement_pct: number;
    prev_eng: number;
    correction_accuracy_pct: number;
    prev_acc: number;
    is_giving_up_week: boolean;
    status: 'OK' | 'WARN' | 'CRIT';
  };
  circuit_breaker: {
    week: string;
    circuit_breaker_pct: number;
    status: 'OK' | 'WARN' | 'CRIT';
  };
  reentry: {
    week: string;
    reentry_7_29d_pct: number | null;
    reentry_ge30d_pct: number | null;
    status: 'OK' | 'WARN' | 'CRIT';
  };
  uncertainty: {
    week: string;
    uncertainty_acceptance_pct: number;
    baseline_pct: number | null;
    status: 'OK' | 'WARN' | 'CRIT';
  };
  voicecheck: {
    week: string;
    negative_tags: number;
    total_tags: number;
    negative_share_pct: number;
    status: 'OK' | 'WARN' | 'CRIT';
  };
}

class MaiaGuardrailsService {
  /**
   * Get complete guardrail status via single monitor_payload query
   */
  async getCompleteGuardrailStatus() {
    try {
      const result = await pool.query<MonitorPayload>(`
        SELECT * FROM metrics.monitor_payload
      `);

      if (result.rows.length === 0) {
        logger.warn('No monitor_payload data returned - metrics views may not be initialized');
        return this.getEmptyPayload();
      }

      const payload = result.rows[0];

      // Map SQL status to API status
      const overallStatus = STATUS_MAP[payload.overall_status] || 'healthy';

      // Build dashboard summary from individual monitor statuses
      const dashboard = [
        {
          guardrail: 'Giving Up Warning',
          status: payload.giving_up.status,
          alert: payload.giving_up.is_giving_up_week
            ? `Engagement down ${Math.round((payload.giving_up.prev_eng || 0) - (payload.giving_up.repair_engagement_pct || 0))}pp, accuracy flat`
            : null
        },
        {
          guardrail: 'Circuit Breaker',
          status: payload.circuit_breaker.status,
          alert: payload.circuit_breaker.status !== 'OK'
            ? `${payload.circuit_breaker.circuit_breaker_pct}% of sessions have >5 corrections`
            : null
        },
        {
          guardrail: 'Re-entry Success',
          status: payload.reentry.status,
          alert: payload.reentry.status !== 'OK'
            ? 'Re-entry rates below target thresholds'
            : null
        },
        {
          guardrail: 'Uncertainty Acceptance',
          status: payload.uncertainty.status,
          alert: payload.uncertainty.status !== 'OK'
            ? 'Acceptance below baseline + target increase'
            : null
        },
        {
          guardrail: 'Voice Check',
          status: payload.voicecheck.status,
          alert: payload.voicecheck.status !== 'OK'
            ? `${payload.voicecheck.negative_share_pct}% negative feedback signals`
            : null
        }
      ].filter(g => g.alert !== null); // Only include monitors with alerts

      return {
        overallStatus,
        totalAlerts: dashboard.length,
        dashboard,
        details: {
          giving_up: payload.giving_up,
          circuit_breaker: payload.circuit_breaker,
          reentry: payload.reentry,
          uncertainty: payload.uncertainty,
          voicecheck: payload.voicecheck
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error fetching monitor_payload:', error);
      throw error;
    }
  }

  /**
   * Get tunable thresholds
   */
  async getThresholds() {
    try {
      const result = await pool.query(`
        SELECT key, value FROM metrics.thresholds ORDER BY key
      `);
      return result.rows;
    } catch (error) {
      logger.error('Error fetching thresholds:', error);
      return [];
    }
  }

  /**
   * Update a threshold (for admin tuning)
   */
  async updateThreshold(key: string, value: number) {
    try {
      await pool.query(`
        UPDATE metrics.thresholds SET value = $1 WHERE key = $2
      `, [value, key]);
      logger.info('Threshold updated', { key, value });
      return { success: true };
    } catch (error) {
      logger.error('Error updating threshold:', error);
      throw error;
    }
  }

  /**
   * Fallback payload when no data available
   */
  private getEmptyPayload() {
    return {
      overallStatus: 'healthy' as const,
      totalAlerts: 0,
      dashboard: [],
      details: {
        giving_up: null,
        circuit_breaker: null,
        reentry: null,
        uncertainty: null,
        voicecheck: null
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const maiaGuardrails = new MaiaGuardrailsService();
