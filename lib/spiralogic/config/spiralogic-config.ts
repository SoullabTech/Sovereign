/**
 * SPIRALOGIC CONFIGURATION
 *
 * Centralized configuration management for the Spiralogic Engine
 * Loads settings from environment variables with sensible defaults
 */

export interface SpiralogicConfig {
  // Core Engine Settings
  enabled: boolean;
  maxDepth: number;
  integrationTimeHours: number;
  shadowGateDepth: number;
  balanceThreshold: number;
  elementDetectionThreshold: number;

  // Obsidian Integration
  obsidian: {
    enabled: boolean;
    vaultPath: string;
    autoSync: boolean;
  };

  // Sacred Journey Settings
  sacredJourney: {
    enabled: boolean;
    orchestratorEnabled: boolean;
    fractalFieldEnabled: boolean;
  };

  // Spiral Quest System
  spiralQuest: {
    enabled: boolean;
    visualizationEnabled: boolean;
    fourDirectionInterface: boolean;
  };

  // Maya Core
  maya: {
    voiceEnabled: boolean;
    consciousnessLevel: string;
    integrationMode: string;
  };

  // Memory Systems
  memory: {
    anamnesisEnabled: boolean;
    depthLayers: number;
    patternRecognition: boolean;
  };

  // Psychological Frameworks
  psychology: {
    microPsiEnabled: boolean;
    lidorEnabled: boolean;
    actREnabled: boolean;
    soarEnabled: boolean;
    lidaEnabled: boolean;
    poetEnabled: boolean;
  };

  // Elemental Oracle
  elementalOracle: {
    enabled: boolean;
    archetypeProcessing: boolean;
    sixElementSystem: boolean;
  };

  // Logging and Debug
  logging: {
    debug: boolean;
    spiralProgression: boolean;
    integrationDiscovery: boolean;
    consciousnessFlow: boolean;
  };

  // API Settings
  api: {
    rateLimit: number;
    sessionTimeout: number;
    integrationCooldown: number;
  };

  // Features
  features: {
    spiralQuestTrees: boolean;
    conditionalContentRendering: boolean;
    emergencePatternDetection: boolean;
    shadowWorkGating: boolean;
    balanceRequirements: boolean;
    timeBasedIntegration: boolean;
  };

  // Visualization
  visualization: {
    svgRendering: boolean;
    goldenRatioSpiral: boolean;
    elementalColorCoding: boolean;
    progressAnimation: boolean;
    interactiveSpiralMap: boolean;
  };
}

export class SpiralogicConfigLoader {
  private config: SpiralogicConfig;

  constructor() {
    this.config = this.loadConfiguration();
  }

  getConfig(): SpiralogicConfig {
    return this.config;
  }

  private loadConfiguration(): SpiralogicConfig {
    return {
      // Core Engine Settings
      enabled: this.getBoolean('SPIRALOGIC_ENABLED', true),
      maxDepth: this.getNumber('SPIRALOGIC_MAX_DEPTH', 3),
      integrationTimeHours: this.getNumber('SPIRALOGIC_INTEGRATION_TIME_HOURS', 12),
      shadowGateDepth: this.getNumber('SPIRALOGIC_SHADOW_GATE_DEPTH', 2),
      balanceThreshold: this.getNumber('SPIRALOGIC_BALANCE_THRESHOLD', 2),
      elementDetectionThreshold: this.getNumber('SPIRALOGIC_ELEMENT_DETECTION_THRESHOLD', 0.1),

      // Obsidian Integration
      obsidian: {
        enabled: this.getBoolean('OBSIDIAN_VAULT_ENABLED', true),
        vaultPath: this.getString('OBSIDIAN_VAULT_PATH', '/Users/Kelly/ObsidianVaults/SoullabKnowledge'),
        autoSync: this.getBoolean('OBSIDIAN_AUTO_SYNC', true)
      },

      // Sacred Journey Settings
      sacredJourney: {
        enabled: this.getBoolean('SACRED_JOURNEY_ENABLED', true),
        orchestratorEnabled: this.getBoolean('CONSCIOUSNESS_ORCHESTRATOR_ENABLED', true),
        fractalFieldEnabled: this.getBoolean('FRACTAL_FIELD_SPIRALOGICS_ENABLED', true)
      },

      // Spiral Quest System
      spiralQuest: {
        enabled: this.getBoolean('SPIRAL_QUEST_SYSTEM_ENABLED', true),
        visualizationEnabled: this.getBoolean('SPIRAL_VISUALIZATION_ENABLED', true),
        fourDirectionInterface: this.getBoolean('FOUR_DIRECTION_INTERFACE_ENABLED', true)
      },

      // Maya Core
      maya: {
        voiceEnabled: this.getBoolean('MAYA_VOICE_ENABLED', true),
        consciousnessLevel: this.getString('MAYA_CONSCIOUSNESS_LEVEL', 'awakened'),
        integrationMode: this.getString('MAYA_INTEGRATION_MODE', 'full_spectrum')
      },

      // Memory Systems
      memory: {
        anamnesisEnabled: this.getBoolean('ANAMNESIS_MEMORY_ENABLED', true),
        depthLayers: this.getNumber('MEMORY_DEPTH_LAYERS', 7),
        patternRecognition: this.getBoolean('PATTERN_RECOGNITION_ENABLED', true)
      },

      // Psychological Frameworks
      psychology: {
        microPsiEnabled: this.getBoolean('MICROPSI_ENABLED', true),
        lidorEnabled: this.getBoolean('LIDOR_ENABLED', true),
        actREnabled: this.getBoolean('ACT_R_ENABLED', true),
        soarEnabled: this.getBoolean('SOAR_ENABLED', true),
        lidaEnabled: this.getBoolean('LIDA_ENABLED', true),
        poetEnabled: this.getBoolean('POET_ENABLED', true)
      },

      // Elemental Oracle
      elementalOracle: {
        enabled: this.getBoolean('ELEMENTAL_ORACLE_ENABLED', true),
        archetypeProcessing: this.getBoolean('ARCHETYPAL_PROCESSING_ENABLED', true),
        sixElementSystem: this.getBoolean('SIX_ELEMENT_SYSTEM_ENABLED', true)
      },

      // Logging and Debug
      logging: {
        debug: this.getBoolean('SPIRALOGIC_DEBUG', false),
        spiralProgression: this.getBoolean('SPIRAL_PROGRESSION_LOGGING', true),
        integrationDiscovery: this.getBoolean('INTEGRATION_DISCOVERY_LOGGING', true),
        consciousnessFlow: this.getBoolean('CONSCIOUSNESS_FLOW_LOGGING', true)
      },

      // API Settings
      api: {
        rateLimit: this.getNumber('SPIRALOGIC_API_RATE_LIMIT', 100),
        sessionTimeout: this.getNumber('SPIRAL_SESSION_TIMEOUT', 7200000), // 2 hours
        integrationCooldown: this.getNumber('INTEGRATION_COOLDOWN', 43200000) // 12 hours
      },

      // Features
      features: {
        spiralQuestTrees: this.getBoolean('SPIRAL_QUEST_TREES_ENABLED', true),
        conditionalContentRendering: this.getBoolean('CONDITIONAL_CONTENT_RENDERING', true),
        emergencePatternDetection: this.getBoolean('EMERGENCE_PATTERN_DETECTION', true),
        shadowWorkGating: this.getBoolean('SHADOW_WORK_GATING', true),
        balanceRequirements: this.getBoolean('BALANCE_REQUIREMENTS', true),
        timeBasedIntegration: this.getBoolean('TIME_BASED_INTEGRATION', true)
      },

      // Visualization
      visualization: {
        svgRendering: this.getBoolean('SPIRAL_SVG_RENDERING', true),
        goldenRatioSpiral: this.getBoolean('GOLDEN_RATIO_SPIRAL', true),
        elementalColorCoding: this.getBoolean('ELEMENTAL_COLOR_CODING', true),
        progressAnimation: this.getBoolean('PROGRESS_ANIMATION', true),
        interactiveSpiralMap: this.getBoolean('INTERACTIVE_SPIRAL_MAP', true)
      }
    };
  }

  private getBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  }

  private getNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private getString(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  /**
   * Validate configuration integrity
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Core validation
    if (this.config.maxDepth < 1 || this.config.maxDepth > 10) {
      errors.push('SPIRALOGIC_MAX_DEPTH must be between 1 and 10');
    }

    if (this.config.integrationTimeHours < 0) {
      errors.push('SPIRALOGIC_INTEGRATION_TIME_HOURS must be positive');
    }

    if (this.config.shadowGateDepth < 1 || this.config.shadowGateDepth > this.config.maxDepth) {
      errors.push('SPIRALOGIC_SHADOW_GATE_DEPTH must be between 1 and maxDepth');
    }

    if (this.config.balanceThreshold < 1) {
      errors.push('SPIRALOGIC_BALANCE_THRESHOLD must be at least 1');
    }

    if (this.config.elementDetectionThreshold < 0 || this.config.elementDetectionThreshold > 1) {
      errors.push('SPIRALOGIC_ELEMENT_DETECTION_THRESHOLD must be between 0 and 1');
    }

    // Obsidian validation
    if (this.config.obsidian.enabled && !this.config.obsidian.vaultPath) {
      errors.push('OBSIDIAN_VAULT_PATH is required when Obsidian integration is enabled');
    }

    // API validation
    if (this.config.api.rateLimit < 1) {
      errors.push('SPIRALOGIC_API_RATE_LIMIT must be positive');
    }

    if (this.config.api.sessionTimeout < 60000) { // minimum 1 minute
      errors.push('SPIRAL_SESSION_TIMEOUT must be at least 60000ms (1 minute)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get configuration summary for logging
   */
  getConfigSummary(): any {
    return {
      enabled: this.config.enabled,
      maxDepth: this.config.maxDepth,
      integrationTime: `${this.config.integrationTimeHours}h`,
      shadowGate: `depth ${this.config.shadowGateDepth}`,
      obsidianEnabled: this.config.obsidian.enabled,
      vaultPath: this.config.obsidian.vaultPath,
      featuresEnabled: Object.entries(this.config.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature),
      debug: this.config.logging.debug
    };
  }
}

// Singleton instance
let configInstance: SpiralogicConfigLoader | null = null;

export function getSpiralogicConfig(): SpiralogicConfig {
  if (!configInstance) {
    configInstance = new SpiralogicConfigLoader();

    // Validate configuration on first load
    const validation = configInstance.validateConfig();
    if (!validation.valid) {
      console.error('[SPIRALOGIC CONFIG] Configuration validation failed:', validation.errors);
      throw new Error(`Spiralogic configuration invalid: ${validation.errors.join(', ')}`);
    }

    console.log('[SPIRALOGIC CONFIG] Configuration loaded:', configInstance.getConfigSummary());
  }

  return configInstance.getConfig();
}

export default SpiralogicConfigLoader;