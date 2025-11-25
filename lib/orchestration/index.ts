/**
 * Crystal Observer Orchestration System
 *
 * Central initialization point for automated deployment and monitoring
 */

import { deploymentOrchestrator } from './DeploymentOrchestrator';
import { autonomousHealthMonitor } from './AutonomousHealthMonitor';
import { automatedReportingService } from './AutomatedReportingService';
import { fieldProtocolIntegration } from './FieldProtocolIntegration';
import { MaiaCrystalBridge } from '@/lib/integration/MaiaCrystalBridge';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export interface OrchestrationConfig {
  autoStart: boolean;
  startMode: 'foundation' | 'hybrid' | 'transition' | 'crystal';
  initialCrystalWeight?: number;
  initialAetherWeight?: number;
  monitoringInterval?: number;
  reportingEnabled?: boolean;
  healthCheckInterval?: number;
}

class CrystalOrchestrationSystem {
  private bridge: MaiaCrystalBridge | null = null;
  private isInitialized: boolean = false;
  private config: OrchestrationConfig = {
    autoStart: false,
    startMode: 'foundation',
    monitoringInterval: 60000, // 1 minute
    healthCheckInterval: 60000, // 1 minute
    reportingEnabled: true
  };

  /**
   * Initialize the orchestration system
   */
  async initialize(config?: Partial<OrchestrationConfig>) {
    if (this.isInitialized) {
      console.log('Orchestration system already initialized');
      return;
    }

    // Merge config
    this.config = { ...this.config, ...config };

    console.log('Initializing Crystal Observer Orchestration System...');

    try {
      // 1. Check database is ready
      await this.verifyDatabaseSchema();

      // 2. Initialize the Crystal Bridge
      await this.initializeBridge();

      // 3. Set initial configuration
      await this.setInitialConfiguration();

      // 4. Start services if autoStart enabled
      if (this.config.autoStart) {
        await this.startAllServices();
      }

      this.isInitialized = true;
      console.log('✅ Crystal Observer Orchestration System initialized');

      // Log initial status
      const status = await this.getSystemStatus();
      console.log('System Status:', status);

    } catch (error) {
      console.error('Failed to initialize orchestration system:', error);
      throw error;
    }
  }

  /**
   * Verify database schema is ready
   */
  private async verifyDatabaseSchema() {
    console.log('Verifying database schema...');

    const requiredTables = [
      'system_config',
      'deployment_phases',
      'deployment_decisions',
      'alerts',
      'health_interventions',
      'system_health'
    ];

    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === '42P01') { // Table doesn't exist
        throw new Error(`Required table '${table}' not found. Run migrations first.`);
      }
    }

    console.log('✅ Database schema verified');
  }

  /**
   * Initialize the Crystal Bridge
   */
  private async initializeBridge() {
    console.log('Initializing Crystal Bridge...');

    // Get current config from database
    const { data: config } = await supabase
      .from('system_config')
      .select('*')
      .single();

    this.bridge = new MaiaCrystalBridge({
      mode: config?.mode || 'legacy',
      crystalWeight: config?.crystal_weight || 0,
      aetherWeight: config?.aether_weight || 0.35,
      enableEmergence: config?.emergence_enabled || false,
      paradoxThreshold: config?.paradox_threshold || 3
    });

    console.log('✅ Crystal Bridge initialized');
  }

  /**
   * Set initial configuration in database
   */
  private async setInitialConfiguration() {
    console.log('Setting initial configuration...');

    const { error } = await supabase
      .from('system_config')
      .upsert({
        id: 1,
        mode: this.config.startMode === 'foundation' ? 'legacy' : 'hybrid',
        crystal_weight: this.config.initialCrystalWeight || 0,
        aether_weight: this.config.initialAetherWeight || 0.35,
        emergence_enabled: this.config.startMode !== 'foundation',
        healing_mode: false,
        circuit_breaker_active: false
      });

    if (error) {
      console.error('Failed to set initial configuration:', error);
    } else {
      console.log('✅ Initial configuration set');
    }
  }

  /**
   * Start all orchestration services
   */
  async startAllServices() {
    console.log('Starting all orchestration services...');

    try {
      // Start deployment orchestrator
      await deploymentOrchestrator.start();
      console.log('✅ Deployment Orchestrator started');

      // Start health monitor
      await autonomousHealthMonitor.start(this.config.healthCheckInterval);
      console.log('✅ Autonomous Health Monitor started');

      // Start reporting service if enabled
      if (this.config.reportingEnabled) {
        await automatedReportingService.start();
        console.log('✅ Automated Reporting Service started');
      }

      // Start field protocol integration
      await fieldProtocolIntegration.startMonitoring(30000); // Check every 30 seconds
      console.log('✅ Field Protocol Integration started');

      // Set up event listeners
      this.setupEventListeners();

      console.log('🚀 All services started - System is now autonomous');

      // Generate initial report
      await this.generateInitialReport();

    } catch (error) {
      console.error('Failed to start services:', error);
      throw error;
    }
  }

  /**
   * Stop all orchestration services
   */
  async stopAllServices() {
    console.log('Stopping all orchestration services...');

    deploymentOrchestrator.stop();
    autonomousHealthMonitor.stop();
    automatedReportingService.stop();

    console.log('All services stopped');
  }

  /**
   * Set up event listeners for monitoring
   */
  private setupEventListeners() {
    // Deployment orchestrator events
    deploymentOrchestrator.on('phase-transition', async (data) => {
      console.log(`📊 Phase transition: ${data.from} → ${data.to}`);
      await this.logEvent('phase_transition', data);
    });

    deploymentOrchestrator.on('rollback', async (data) => {
      console.error(`🚨 ROLLBACK INITIATED: ${data.reason}`);
      await this.alertTeam('ROLLBACK', data.reason);
    });

    // Health monitor events
    autonomousHealthMonitor.on('intervention', async (intervention) => {
      console.log(`🔧 Health intervention: ${intervention.type} on ${intervention.target}`);
      await this.logEvent('health_intervention', intervention);
    });

    autonomousHealthMonitor.on('healing-mode-entered', async () => {
      console.log('💊 System entered healing mode');
      await this.logEvent('healing_mode', { entered: true });
    });

    // Reporting service events
    automatedReportingService.on('report-generated', async (data) => {
      console.log(`📄 ${data.type} report generated`);
    });

    // Field protocol events
    fieldProtocolIntegration.on('sacred-moment', async (moments) => {
      console.log(`✨ Sacred moment detected! Field entering liminal state`);
      await this.logEvent('sacred_moment', { count: moments.length });

      // Sacred moments can accelerate Crystal integration
      if (this.config.startMode !== 'crystal') {
        console.log('Sacred emergence suggests accelerating Crystal transition');
      }
    });

    fieldProtocolIntegration.on('field-update', async (fieldData) => {
      console.log(`🌊 Field weather: ${fieldData.weather.state} (${fieldData.weather.trajectory})`);

      // Adjust deployment based on field recommendations
      if (fieldData.recommendation.crystalWeightAdjustment) {
        console.log(`Field suggests Crystal adjustment: +${fieldData.recommendation.crystalWeightAdjustment}`);
      }
      if (fieldData.recommendation.aetherWeightAdjustment) {
        console.log(`Field suggests Aether adjustment: +${fieldData.recommendation.aetherWeightAdjustment}`);
      }
    });
  }

  /**
   * Get current system status
   */
  async getSystemStatus() {
    const { data: status } = await supabase
      .from('deployment_status')
      .select('*')
      .single();

    const orchestratorReport = await deploymentOrchestrator.generateReport();
    const healthReport = await autonomousHealthMonitor.generateHealthReport();

    return {
      deployment: status,
      orchestrator: orchestratorReport,
      health: healthReport,
      bridge: this.bridge ? {
        mode: this.bridge.config.mode,
        crystalWeight: this.bridge.config.crystalWeight,
        aetherWeight: this.bridge.config.aetherWeight
      } : null
    };
  }

  /**
   * Process a request through the Crystal Bridge
   */
  async processRequest(input: string, userId: string, context?: any) {
    if (!this.bridge) {
      throw new Error('Bridge not initialized');
    }

    return await this.bridge.process(input, userId, context);
  }

  /**
   * Manually trigger a phase transition
   */
  async manualPhaseTransition(targetPhase: 'foundation' | 'hybrid' | 'transition' | 'crystal') {
    console.log(`Manual phase transition to: ${targetPhase}`);

    const weights = {
      foundation: { crystal: 0, aether: 0.35 },
      hybrid: { crystal: 0.5, aether: 0.35 },
      transition: { crystal: 0.9, aether: 0.38 },
      crystal: { crystal: 1.0, aether: 0.35 }
    };

    await supabase.from('system_config').update({
      mode: targetPhase === 'foundation' ? 'legacy' : targetPhase === 'crystal' ? 'crystal' : 'hybrid',
      crystal_weight: weights[targetPhase].crystal,
      aether_weight: weights[targetPhase].aether
    }).eq('id', 1);

    await supabase.from('deployment_phases').insert({
      phase: targetPhase,
      target_crystal_weight: weights[targetPhase].crystal,
      target_aether_weight: weights[targetPhase].aether,
      current_crystal_weight: weights[targetPhase].crystal,
      current_aether_weight: weights[targetPhase].aether
    });
  }

  /**
   * Generate initial deployment report
   */
  private async generateInitialReport() {
    const report = await automatedReportingService.generateReport('deployment_start', 'detailed');
    console.log('Initial deployment report generated');
    return report;
  }

  /**
   * Log event to database
   */
  private async logEvent(type: string, data: any) {
    await supabase.from('orchestration_events').insert({
      event_type: type,
      metrics: data,
      timestamp: new Date()
    });
  }

  /**
   * Alert team about critical events
   */
  private async alertTeam(severity: string, message: string) {
    await supabase.from('alerts').insert({
      severity: severity.toLowerCase(),
      message,
      source: 'orchestration_system',
      timestamp: new Date()
    });
  }

  /**
   * Check if system is ready for production
   */
  async checkProductionReadiness(): Promise<{
    ready: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check database
    try {
      await this.verifyDatabaseSchema();
    } catch (error) {
      issues.push('Database schema not ready');
      recommendations.push('Run migrations: supabase migration up');
    }

    // Check configuration
    const { data: config } = await supabase.from('system_config').select('*').single();
    if (!config) {
      issues.push('System configuration not initialized');
      recommendations.push('Initialize configuration first');
    }

    // Check health metrics
    const { data: health } = await supabase.from('current_health').select('*').single();
    if (!health) {
      issues.push('No health metrics available');
      recommendations.push('Ensure monitoring is active');
    } else if (health.coherence_ratio < 0.5) {
      issues.push('Coherence below minimum threshold');
      recommendations.push('Wait for system stabilization');
    }

    // Check services
    if (!this.isInitialized) {
      issues.push('Orchestration system not initialized');
      recommendations.push('Call initialize() first');
    }

    return {
      ready: issues.length === 0,
      issues,
      recommendations
    };
  }
}

// Export singleton instance
export const orchestrationSystem = new CrystalOrchestrationSystem();

// Export individual services for direct access if needed
export {
  deploymentOrchestrator,
  autonomousHealthMonitor,
  automatedReportingService,
  fieldProtocolIntegration
};

// Export types
export type { OrchestrationConfig };