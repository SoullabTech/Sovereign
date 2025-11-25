/**
 * Configuration Service
 * Manages application configuration and feature flags
 */

import { IConfigurationService, IDatabaseService } from '../core/ServiceTokens';

export interface ConfigurationEntry {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  category?: string;
  updatedAt: Date;
}

export class ConfigurationService implements IConfigurationService {
  private configCache = new Map<string, any>();
  private featureFlags = new Map<string, boolean>();

  constructor(private databaseService: IDatabaseService) {
    this.initializeDefaults();
  }

  /**
   * Get configuration value
   */
  async getConfig<T>(key: string, defaultValue?: T): Promise<T> {
    // Check cache first
    if (this.configCache.has(key)) {
      return this.configCache.get(key);
    }

    try {
      // Check database
      const results = await this.databaseService.query<any>(
        'SELECT value FROM configurations WHERE key = ?',
        [key]
      );

      if (results.length > 0) {
        const value = this.parseConfigValue(results[0].value);
        this.configCache.set(key, value);
        return value;
      }

      // Return default value
      if (defaultValue !== undefined) {
        this.configCache.set(key, defaultValue);
        return defaultValue;
      }

      return null as T;
    } catch (error) {
      console.error('Configuration get error:', error);
      return defaultValue || (null as T);
    }
  }

  /**
   * Set configuration value
   */
  async setConfig(key: string, value: any): Promise<void> {
    const serializedValue = this.serializeConfigValue(value);
    
    try {
      await this.databaseService.execute(
        `INSERT OR REPLACE INTO configurations (key, value, updated_at) 
         VALUES (?, ?, ?)`,
        [key, serializedValue, new Date().toISOString()]
      );

      // Update cache
      this.configCache.set(key, value);
    } catch (error) {
      console.error('Configuration set error:', error);
      throw error;
    }
  }

  /**
   * Get all feature flags
   */
  async getFeatureFlags(): Promise<Record<string, boolean>> {
    const flags: Record<string, boolean> = {};
    
    // Get from database
    try {
      const results = await this.databaseService.query<any>(
        'SELECT key, value FROM configurations WHERE key LIKE "feature.%"'
      );

      results.forEach(row => {
        const flagName = row.key.replace('feature.', '');
        flags[flagName] = this.parseConfigValue(row.value) === true;
      });
    } catch (error) {
      console.error('Feature flags get error:', error);
    }

    // Merge with defaults
    return { ...this.getDefaultFeatureFlags(), ...flags };
  }

  /**
   * Set feature flag
   */
  async setFeatureFlag(name: string, enabled: boolean): Promise<void> {
    await this.setConfig(`feature.${name}`, enabled);
  }

  /**
   * Get configuration by category
   */
  async getConfigByCategory(category: string): Promise<Record<string, any>> {
    const configs: Record<string, any> = {};
    
    try {
      const results = await this.databaseService.query<any>(
        'SELECT key, value FROM configurations WHERE key LIKE ?',
        [`${category}.%`]
      );

      results.forEach(row => {
        const configKey = row.key.replace(`${category}.`, '');
        configs[configKey] = this.parseConfigValue(row.value);
      });
    } catch (error) {
      console.error('Configuration by category error:', error);
    }

    return configs;
  }

  /**
   * Initialize default configurations
   */
  private initializeDefaults(): void {
    const defaults = this.getDefaultConfigurations();
    
    // Set defaults in cache
    Object.entries(defaults).forEach(([key, value]) => {
      this.configCache.set(key, value);
    });
  }

  /**
   * Get default configurations
   */
  private getDefaultConfigurations(): Record<string, any> {
    return {
      // Oracle settings
      'oracle.maxContextLength': 4000,
      'oracle.defaultModel': 'gpt-4',
      'oracle.responseTimeout': 30000,
      
      // Analytics settings
      'analytics.enableTracking': true,
      'analytics.batchSize': 100,
      'analytics.flushInterval': 30000,
      
      // Memory settings
      'memory.maxMemoriesPerRetrieval': 10,
      'memory.vectorDimensions': 1536,
      'memory.enableSemanticSearch': true,
      
      // Cache settings
      'cache.defaultTTL': 300,
      'cache.maxSize': 1000,
      
      // Voice settings
      'voice.defaultVoice': 'neural',
      'voice.enableSynthesis': true,
      
      // Feature flags
      ...this.getDefaultFeatureFlags()
    };
  }

  /**
   * Get default feature flags
   */
  private getDefaultFeatureFlags(): Record<string, boolean> {
    return {
      'daimonicEncounters': true,
      'emotionalAnalysis': true,
      'voiceResponse': true,
      'collectiveDashboard': true,
      'realTimeAnalytics': true,
      'seasonalNarratives': true,
      'archetypeTracking': true,
      'memoryEmbeddings': true,
      'crossNarratives': true,
      'betaFeatures': false
    };
  }

  /**
   * Parse configuration value from database
   */
  private parseConfigValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Serialize configuration value for database
   */
  private serializeConfigValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  }

  /**
   * Dispose of the service
   */
  async dispose(): Promise<void> {
    this.configCache.clear();
    this.featureFlags.clear();
    console.log('Configuration service disposed');
  }
}