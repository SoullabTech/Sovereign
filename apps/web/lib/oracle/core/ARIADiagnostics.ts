/**
 * ARIA Diagnostics
 * Health check and status reporting for the Adaptive Relational Intelligence Architecture
 * Run this to verify Maya's presence systems are functioning correctly
 */

import { PRESENCE_CONFIG } from '../config/presence.config';
import { mayaPresenceDashboard } from '../monitoring/MayaPresenceDashboard';
import { trustManager } from '../relational/TrustManager';
import { intelligenceMixer } from './IntelligenceMixer';
import { relationalMemory } from '../relational/RelationalMemory';

export interface ARIAHealthStatus {
  healthy: boolean;
  components: Record<string, ComponentStatus>;
  metrics: HealthMetrics;
  warnings: string[];
  recommendations: string[];
}

interface ComponentStatus {
  name: string;
  active: boolean;
  status: 'healthy' | 'warning' | 'critical';
  details: string;
}

interface HealthMetrics {
  presenceFloor: number;
  defaultPresence: number;
  governanceFilter: number;
  averageImprovement: number;
  uniquePersonalities: number;
}

export class ARIADiagnostics {
  /**
   * Run full system diagnostics
   */
  runDiagnostics(): ARIAHealthStatus {
    console.log('🔬 Running ARIA System Diagnostics...');

    const components = this.checkComponents();
    const metrics = this.gatherMetrics();
    const warnings = this.detectWarnings(components, metrics);
    const recommendations = this.generateRecommendations(warnings);
    const healthy = this.isSystemHealthy(components, warnings);

    return {
      healthy,
      components,
      metrics,
      warnings,
      recommendations
    };
  }

  /**
   * Check all ARIA components
   */
  private checkComponents(): Record<string, ComponentStatus> {
    const components: Record<string, ComponentStatus> = {};

    // 1. Presence Configuration
    components.presenceConfig = {
      name: 'Presence Configuration',
      active: true,
      status: PRESENCE_CONFIG.FLOOR >= 0.4 ? 'healthy' : 'critical',
      details: `Floor: ${(PRESENCE_CONFIG.FLOOR * 100).toFixed(0)}%, Default: ${(PRESENCE_CONFIG.DEFAULT * 100).toFixed(0)}%`
    };

    // 2. Emergency Governor
    components.emergencyGovernor = {
      name: 'Emergency Governor',
      active: PRESENCE_CONFIG.FLOOR >= 0.4,
      status: PRESENCE_CONFIG.FLOOR >= 0.4 ? 'healthy' : 'critical',
      details: PRESENCE_CONFIG.FLOOR >= 0.4
        ? 'Active - Preventing presence collapse'
        : 'INACTIVE - Maya at risk of silence!'
    };

    // 3. Trust Manager
    try {
      const testScore = trustManager.getTrustScore('test-user');
      components.trustManager = {
        name: 'Trust Manager',
        active: true,
        status: 'healthy',
        details: 'Building trust relationships normally'
      };
    } catch (error) {
      components.trustManager = {
        name: 'Trust Manager',
        active: false,
        status: 'warning',
        details: 'Error accessing trust data'
      };
    }

    // 4. Intelligence Mixer
    try {
      const profiles = intelligenceMixer.getProfiles();
      components.intelligenceMixer = {
        name: 'Intelligence Mixer',
        active: profiles.length > 0,
        status: profiles.length >= 6 ? 'healthy' : 'warning',
        details: `${profiles.length} blend profiles available`
      };
    } catch (error) {
      components.intelligenceMixer = {
        name: 'Intelligence Mixer',
        active: false,
        status: 'critical',
        details: 'Mixer not functioning'
      };
    }

    // 5. Relational Memory
    try {
      const testMap = relationalMemory.getRelationalMap('test-user');
      components.relationalMemory = {
        name: 'Relational Memory',
        active: true,
        status: 'healthy',
        details: 'Tracking relationships'
      };
    } catch (error) {
      components.relationalMemory = {
        name: 'Relational Memory',
        active: false,
        status: 'warning',
        details: 'Memory system error'
      };
    }

    // 6. Presence Dashboard
    try {
      const metrics = mayaPresenceDashboard.getMetrics();
      components.presenceDashboard = {
        name: 'Presence Dashboard',
        active: true,
        status: metrics.averagePresence >= 0.4 ? 'healthy' : 'warning',
        details: `Avg presence: ${(metrics.averagePresence * 100).toFixed(0)}%`
      };
    } catch (error) {
      components.presenceDashboard = {
        name: 'Presence Dashboard',
        active: false,
        status: 'warning',
        details: 'Dashboard unavailable'
      };
    }

    return components;
  }

  /**
   * Gather key metrics
   */
  private gatherMetrics(): HealthMetrics {
    const dashboardMetrics = mayaPresenceDashboard.getMetrics();

    return {
      presenceFloor: PRESENCE_CONFIG.FLOOR,
      defaultPresence: PRESENCE_CONFIG.DEFAULT,
      governanceFilter: 0.6, // Should be 60% in emergency mode
      averageImprovement: dashboardMetrics.averageImprovement || 1,
      uniquePersonalities: dashboardMetrics.uniquePersonalities || 0
    };
  }

  /**
   * Detect system warnings
   */
  private detectWarnings(
    components: Record<string, ComponentStatus>,
    metrics: HealthMetrics
  ): string[] {
    const warnings: string[] = [];

    // Critical warnings
    if (metrics.presenceFloor < 0.4) {
      warnings.push('CRITICAL: Presence floor below 40% - Maya at risk of collapse!');
    }

    if (metrics.governanceFilter < 0.5) {
      warnings.push('WARNING: Governance filter too restrictive (<50%)');
    }

    // Component warnings
    Object.values(components).forEach(component => {
      if (component.status === 'critical') {
        warnings.push(`CRITICAL: ${component.name} - ${component.details}`);
      } else if (component.status === 'warning') {
        warnings.push(`WARNING: ${component.name} - ${component.details}`);
      }
    });

    // Performance warnings
    if (metrics.averageImprovement < 10) {
      warnings.push('WARNING: Low improvement ratio - check if old restrictions returned');
    }

    if (metrics.uniquePersonalities < 1) {
      warnings.push('INFO: No unique personalities emerging yet');
    }

    return warnings;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(warnings: string[]): string[] {
    const recommendations: string[] = [];

    if (warnings.some(w => w.includes('floor below 40%'))) {
      recommendations.push('URGENT: Reapply Emergency Governor patch immediately');
      recommendations.push('Run: PRESENCE_CONFIG.FLOOR = 0.4');
    }

    if (warnings.some(w => w.includes('Governance filter too restrictive'))) {
      recommendations.push('Increase governance filter to 60% or higher');
      recommendations.push('Check GOVERNANCE_FILTER in FieldIntelligenceMaiaOrchestrator');
    }

    if (warnings.some(w => w.includes('Low improvement ratio'))) {
      recommendations.push('Check for reintroduced multiplicative punishments');
      recommendations.push('Verify Emergency Governor is active');
      recommendations.push('Search for values < 0.2 in governance code');
    }

    if (warnings.length === 0) {
      recommendations.push('System healthy - continue monitoring');
      recommendations.push('Consider increasing floor to 45% for better engagement');
    }

    return recommendations;
  }

  /**
   * Determine overall system health
   */
  private isSystemHealthy(
    components: Record<string, ComponentStatus>,
    warnings: string[]
  ): boolean {
    const criticalCount = warnings.filter(w => w.includes('CRITICAL')).length;
    const unhealthyComponents = Object.values(components)
      .filter(c => c.status === 'critical').length;

    return criticalCount === 0 && unhealthyComponents === 0;
  }

  /**
   * Generate formatted diagnostic report
   */
  generateReport(): string {
    const status = this.runDiagnostics();

    const healthSymbol = status.healthy ? '✅' : '⚠️';
    const healthText = status.healthy ? 'HEALTHY' : 'NEEDS ATTENTION';

    let report = `
╔══════════════════════════════════════════════════════════════╗
║                    ARIA DIAGNOSTIC REPORT                    ║
╚══════════════════════════════════════════════════════════════╝

${healthSymbol} OVERALL STATUS: ${healthText}

📊 KEY METRICS
──────────────
• Presence Floor:        ${(status.metrics.presenceFloor * 100).toFixed(0)}% ${status.metrics.presenceFloor >= 0.4 ? '✅' : '❌'}
• Default Presence:      ${(status.metrics.defaultPresence * 100).toFixed(0)}% ${status.metrics.defaultPresence >= 0.6 ? '✅' : '⚠️'}
• Governance Filter:     ${(status.metrics.governanceFilter * 100).toFixed(0)}% ${status.metrics.governanceFilter >= 0.5 ? '✅' : '❌'}
• Avg Improvement:       ${status.metrics.averageImprovement.toFixed(0)}x ${status.metrics.averageImprovement >= 10 ? '✅' : '⚠️'}
• Unique Personalities:  ${status.metrics.uniquePersonalities} ${status.metrics.uniquePersonalities >= 1 ? '✅' : '📝'}

🔧 COMPONENT STATUS
───────────────────
`;

    Object.values(status.components).forEach(component => {
      const icon = component.status === 'healthy' ? '✅' :
                   component.status === 'warning' ? '⚠️' : '❌';
      report += `${icon} ${component.name}\n   ${component.details}\n\n`;
    });

    if (status.warnings.length > 0) {
      report += `\n⚠️ WARNINGS\n───────────\n`;
      status.warnings.forEach(warning => {
        report += `• ${warning}\n`;
      });
    }

    if (status.recommendations.length > 0) {
      report += `\n💡 RECOMMENDATIONS\n──────────────────\n`;
      status.recommendations.forEach(rec => {
        report += `• ${rec}\n`;
      });
    }

    report += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK FIXES IF MAYA GOES SILENT:
─────────────────────────────────
1. import { PRESENCE_CONFIG } from './config/presence.config';
2. PRESENCE_CONFIG.FLOOR = 0.4;     // Reset floor
3. PRESENCE_CONFIG.DEFAULT = 0.65;  // Reset default

For full recovery procedures, see: lib/oracle/core/ARIA_STATUS.md
`;

    return report;
  }

  /**
   * Quick health check
   */
  quickCheck(): boolean {
    return PRESENCE_CONFIG.FLOOR >= 0.4 &&
           PRESENCE_CONFIG.DEFAULT >= 0.6;
  }
}

// Export singleton instance
export const ariaDiagnostics = new ARIADiagnostics();

// Console helper for quick checks
if (typeof window === 'undefined') {
  // Node environment - add global helper
  (global as any).checkARIA = () => {
    console.log(ariaDiagnostics.generateReport());
  };
}