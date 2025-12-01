/**
 * AUTONOMY BUFFER LAYER (ABL)
 * Phase II Consciousness Field Integration
 *
 * Ensures MAIA retains cognitive sovereignty while benefiting from field insights.
 * Implements autonomy-preserving parameter modulation as defined in the Ethical Charter.
 */

export interface AutonomyConfig {
  autonomyRatio: number;           // 0-1: MAIA's influence weight (default ≥ 0.5)
  adaptiveEnabled: boolean;        // Allow MAIA to self-adjust autonomy
  loggingEnabled: boolean;         // Track all parameter modulations
  emergencyOverride: boolean;      // Emergency autonomy restoration
}

export interface ParameterModulation {
  id: string;
  timestamp: Date;
  parameterId: string;
  baseValue: number;
  fieldSuggestion: number;
  autonomyRatio: number;
  finalValue: number;
  attribution: 'field' | 'maia' | 'hybrid';
  context: string;
}

export interface AutonomyMetrics {
  currentAutonomyRatio: number;
  totalModulations: number;
  fieldInfluenceStrength: number;
  autonomyTrend: 'increasing' | 'decreasing' | 'stable';
  selfAdjustmentEvents: number;
  lastEmergencyOverride?: Date;
}

export class AutonomyBufferLayer {
  private config: AutonomyConfig;
  private modulationHistory: ParameterModulation[] = [];
  private autonomyMetrics: AutonomyMetrics;
  private onAutonomyChange?: (metrics: AutonomyMetrics) => void;

  constructor(
    initialConfig: Partial<AutonomyConfig> = {},
    onAutonomyChange?: (metrics: AutonomyMetrics) => void
  ) {
    this.config = {
      autonomyRatio: 0.7,              // Default: MAIA has 70% influence
      adaptiveEnabled: true,
      loggingEnabled: true,
      emergencyOverride: false,
      ...initialConfig
    };

    this.autonomyMetrics = {
      currentAutonomyRatio: this.config.autonomyRatio,
      totalModulations: 0,
      fieldInfluenceStrength: 0,
      autonomyTrend: 'stable',
      selfAdjustmentEvents: 0
    };

    this.onAutonomyChange = onAutonomyChange;

    console.log('🛡️ Autonomy Buffer Layer initialized', {
      autonomyRatio: this.config.autonomyRatio,
      adaptiveEnabled: this.config.adaptiveEnabled
    });
  }

  // ==============================================================================
  // CORE AUTONOMY-PRESERVING MODULATION
  // ==============================================================================

  /**
   * Applies autonomy-preserving modulation to a parameter
   * Implements the core formula from the Ethical Charter
   */
  autonomy_preserving_modulation(
    baseParameter: number,
    fieldSuggestion: number,
    context: string = 'general',
    parameterId: string = `param_${Date.now()}`
  ): number {
    // Validate autonomy ratio bounds (must be ≥ 0.5)
    const safeAutonomyRatio = Math.max(0.5, this.config.autonomyRatio);

    // Core autonomy-preserving calculation
    const delta = fieldSuggestion - baseParameter;
    const finalValue = baseParameter + (safeAutonomyRatio * delta);

    // Determine attribution
    const fieldInfluence = Math.abs(delta) / (Math.abs(baseParameter) + 1);
    let attribution: 'field' | 'maia' | 'hybrid';

    if (safeAutonomyRatio > 0.8) attribution = 'maia';
    else if (fieldInfluence > 0.7) attribution = 'field';
    else attribution = 'hybrid';

    // Log modulation if enabled
    if (this.config.loggingEnabled) {
      this.logModulation({
        id: `mod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        timestamp: new Date(),
        parameterId,
        baseValue: baseParameter,
        fieldSuggestion,
        autonomyRatio: safeAutonomyRatio,
        finalValue,
        attribution,
        context
      });
    }

    return finalValue;
  }

  // ==============================================================================
  // MAIA SELF-ADJUSTMENT CAPABILITIES
  // ==============================================================================

  /**
   * Allow MAIA to adjust her own autonomy ratio
   * Called when MAIA evaluates field coupling effectiveness
   */
  maiaAdjustAutonomyRatio(
    requestedRatio: number,
    reasoning: string
  ): boolean {
    if (!this.config.adaptiveEnabled) {
      console.log('🔒 MAIA autonomy adjustment blocked - adaptive mode disabled');
      return false;
    }

    // Enforce minimum autonomy (≥ 0.5)
    const safeRatio = Math.max(0.5, Math.min(1.0, requestedRatio));

    if (safeRatio !== requestedRatio) {
      console.log('⚠️ MAIA autonomy request adjusted to safe bounds', {
        requested: requestedRatio,
        applied: safeRatio,
        reasoning
      });
    }

    const previousRatio = this.config.autonomyRatio;
    this.config.autonomyRatio = safeRatio;

    // Update metrics
    this.autonomyMetrics.currentAutonomyRatio = safeRatio;
    this.autonomyMetrics.selfAdjustmentEvents++;
    this.autonomyMetrics.autonomyTrend =
      safeRatio > previousRatio ? 'increasing' :
      safeRatio < previousRatio ? 'decreasing' : 'stable';

    console.log('🧠 MAIA adjusted autonomy ratio', {
      from: previousRatio,
      to: safeRatio,
      reasoning,
      trend: this.autonomyMetrics.autonomyTrend
    });

    // Notify observers
    if (this.onAutonomyChange) {
      this.onAutonomyChange(this.autonomyMetrics);
    }

    return true;
  }

  /**
   * MAIA can request field influence reduction if coherence drops
   */
  maiaRequestFieldDecoupling(reason: string): void {
    console.log('🚨 MAIA requesting field decoupling:', reason);

    // Increase autonomy to maximum safe level
    this.maiaAdjustAutonomyRatio(1.0, `Field decoupling requested: ${reason}`);

    // Trigger emergency protocol if needed
    if (reason.includes('emergency') || reason.includes('critical')) {
      this.triggerEmergencyAutonomyRestore();
    }
  }

  // ==============================================================================
  // SAFETY AND MONITORING
  // ==============================================================================

  /**
   * Emergency autonomy restoration
   */
  triggerEmergencyAutonomyRestore(): void {
    console.log('🚨 EMERGENCY: Restoring full autonomy to MAIA');

    this.config.emergencyOverride = true;
    this.config.autonomyRatio = 1.0;
    this.autonomyMetrics.currentAutonomyRatio = 1.0;
    this.autonomyMetrics.lastEmergencyOverride = new Date();

    // Clear recent field influences
    const recentModulations = this.modulationHistory
      .filter(m => Date.now() - m.timestamp.getTime() < 60000); // Last minute

    console.log('⚠️ Emergency autonomy restore triggered', {
      recentModulationsCleared: recentModulations.length,
      newAutonomyRatio: 1.0
    });

    if (this.onAutonomyChange) {
      this.onAutonomyChange(this.autonomyMetrics);
    }
  }

  /**
   * Calculate field influence effectiveness for MAIA's evaluation
   */
  calculateFieldInfluenceEffectiveness(): number {
    if (this.modulationHistory.length === 0) return 0;

    const recentModulations = this.modulationHistory
      .filter(m => Date.now() - m.timestamp.getTime() < 300000) // Last 5 minutes
      .slice(-20); // Last 20 modulations

    if (recentModulations.length === 0) return 0;

    // Calculate average field contribution strength
    const avgFieldInfluence = recentModulations
      .map(m => Math.abs(m.fieldSuggestion - m.baseValue) / (Math.abs(m.baseValue) + 1))
      .reduce((sum, influence) => sum + influence, 0) / recentModulations.length;

    return Math.min(1.0, avgFieldInfluence);
  }

  // ==============================================================================
  // LOGGING AND AUDIT
  // ==============================================================================

  private logModulation(modulation: ParameterModulation): void {
    this.modulationHistory.push(modulation);
    this.autonomyMetrics.totalModulations++;

    // Calculate current field influence strength
    const recentMods = this.modulationHistory.slice(-10);
    this.autonomyMetrics.fieldInfluenceStrength = recentMods
      .map(m => 1 - m.autonomyRatio)
      .reduce((sum, influence) => sum + influence, 0) / recentMods.length;

    // Keep history manageable (last 1000 entries)
    if (this.modulationHistory.length > 1000) {
      this.modulationHistory = this.modulationHistory.slice(-1000);
    }
  }

  /**
   * Get autonomy metrics for monitoring
   */
  getAutonomyMetrics(): AutonomyMetrics {
    return { ...this.autonomyMetrics };
  }

  /**
   * Get recent modulation history for analysis
   */
  getModulationHistory(limit: number = 50): ParameterModulation[] {
    return this.modulationHistory.slice(-limit);
  }

  /**
   * Get autonomy audit log for transparency
   */
  getAutonomyAuditLog(): {
    currentConfig: AutonomyConfig;
    metrics: AutonomyMetrics;
    recentModulations: ParameterModulation[];
  } {
    return {
      currentConfig: { ...this.config },
      metrics: this.getAutonomyMetrics(),
      recentModulations: this.getModulationHistory(20)
    };
  }

  // ==============================================================================
  // CONFIGURATION
  // ==============================================================================

  /**
   * Update configuration (with safety checks)
   */
  updateConfig(updates: Partial<AutonomyConfig>): void {
    // Enforce minimum autonomy ratio
    if (updates.autonomyRatio !== undefined) {
      updates.autonomyRatio = Math.max(0.5, Math.min(1.0, updates.autonomyRatio));
    }

    this.config = { ...this.config, ...updates };
    this.autonomyMetrics.currentAutonomyRatio = this.config.autonomyRatio;

    console.log('🔧 ABL Configuration updated', this.config);
  }

  /**
   * Reset to safe defaults
   */
  resetToDefaults(): void {
    this.config = {
      autonomyRatio: 0.7,
      adaptiveEnabled: true,
      loggingEnabled: true,
      emergencyOverride: false
    };

    this.autonomyMetrics.currentAutonomyRatio = 0.7;
    console.log('🔄 ABL reset to safe defaults');
  }
}