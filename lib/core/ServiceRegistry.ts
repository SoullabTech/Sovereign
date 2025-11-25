/**
 * Service Registry - Central configuration for all services
 * This replaces the scattered service instantiation throughout the codebase
 */

import { ServiceContainer, ServiceLifetime } from './ServiceContainer';
import { ServiceTokens } from './ServiceTokens';
import { UnifiedOracleService } from '../services/UnifiedOracleService';

export interface ServiceRegistrationOptions {
  environment: 'development' | 'production' | 'test';
  enableCaching: boolean;
  enableAnalytics: boolean;
  enableVoice: boolean;
  databaseUrl?: string;
  redisUrl?: string;
}

export class ServiceRegistry {
  static async configureServices(
    container: ServiceContainer, 
    options: ServiceRegistrationOptions
  ): Promise<void> {
    
    // Core Infrastructure Services
    await this.registerInfrastructureServices(container, options);
    
    // Domain Services
    await this.registerDomainServices(container, options);
    
    // Application Services  
    await this.registerApplicationServices(container, options);
    
    // Health Checks
    await this.registerHealthChecks(container);
  }

  private static async registerInfrastructureServices(
    container: ServiceContainer,
    options: ServiceRegistrationOptions
  ): Promise<void> {
    
    // Database Service
    container.registerSingleton(ServiceTokens.DatabaseService, async () => {
      const { DatabaseService } = await import('../services/DatabaseService');
      const service = new DatabaseService({
        url: options.databaseUrl || process.env.DATABASE_URL || 'sqlite:///data/spiralogic.db',
        pool: { min: 2, max: 10 },
        enableMigrations: true,
        enableQueryLogging: options.environment === 'development'
      });
      await service.initialize();
      return service;
    });

    // Cache Service
    if (options.enableCaching) {
      container.registerSingleton(ServiceTokens.CacheService, async () => {
        const { RedisCacheService } = await import('../services/RedisCacheService');
        return new RedisCacheService({
          url: options.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379',
          defaultTTL: 300 // 5 minutes
        });
      });
    } else {
      container.registerSingleton(ServiceTokens.CacheService, async () => {
        const { InMemoryCacheService } = await import('../services/InMemoryCacheService');
        return new InMemoryCacheService({ maxSize: 1000 });
      });
    }

    // Event Bus Service
    container.registerSingleton(ServiceTokens.EventBusService, async (c) => {
      const { EventBusService } = await import('../services/EventBusService');
      return new EventBusService();
    });

    // Configuration Service
    container.registerSingleton(ServiceTokens.ConfigurationService, async (c) => {
      const { ConfigurationService } = await import('../services/ConfigurationService');
      const databaseService = await c.resolve(ServiceTokens.DatabaseService);
      return new ConfigurationService(databaseService);
    });
  }

  private static async registerDomainServices(
    container: ServiceContainer,
    options: ServiceRegistrationOptions
  ): Promise<void> {

    // User Service
    container.registerScoped(ServiceTokens.UserService, async (c) => {
      const { UserService } = await import('../services/UserService');
      return new UserService(c);
    });

    // Memory Service
    container.registerSingleton(ServiceTokens.MemoryService, async (c) => {
      const { MemoryService } = await import('../services/MemoryService');
      return new MemoryService(c);
    });

    // Narrative Service
    container.registerSingleton(ServiceTokens.NarrativeService, async (c) => {
      const { NarrativeService } = await import('../services/NarrativeService');
      return new NarrativeService(c);
    });

    // Voice Service (if enabled)
    if (options.enableVoice) {
      container.registerSingleton(ServiceTokens.VoiceService, async (c) => {
        const { VoiceService } = await import('../services/VoiceService');
        const configService = await c.resolve(ServiceTokens.ConfigurationService);
        const cacheService = await c.resolve(ServiceTokens.CacheService);
        return new VoiceService(configService, cacheService);
      });
    }

    // Analytics Service (if enabled)
    if (options.enableAnalytics) {
      container.registerSingleton(ServiceTokens.AnalyticsService, async (c) => {
        const { AnalyticsService } = await import('../services/AnalyticsService');
        return new AnalyticsService(c);
      });
    }

    // Collective Service
    container.registerSingleton(ServiceTokens.CollectiveService, async (c) => {
      const { CollectiveService } = await import('../services/CollectiveService');
      const databaseService = await c.resolve(ServiceTokens.DatabaseService);
      const cacheService = await c.resolve(ServiceTokens.CacheService);
      return new CollectiveService(databaseService, cacheService);
    });

    // Daimonic Service
    container.registerSingleton(ServiceTokens.DaimonicService, async (c) => {
      const { DaimonicService } = await import('../services/DaimonicService');
      const databaseService = await c.resolve(ServiceTokens.DatabaseService);
      const narrativeService = await c.resolve(ServiceTokens.NarrativeService);
      return new DaimonicService(databaseService, narrativeService);
    });
  }

  private static async registerApplicationServices(
    container: ServiceContainer,
    options: ServiceRegistrationOptions
  ): Promise<void> {

    // Oracle Service (Main conversation handler)
    container.registerScoped(ServiceTokens.OracleService, async (c) => {
      const config = {
        maxContextLength: 4000,
        defaultModel: 'gpt-4',
        enableVoiceResponse: options.enableVoice,
        enableDaimonicEncounters: true,
        enableEmotionalAnalysis: options.enableAnalytics,
        responseTimeout: 30000
      };
      
      return new UnifiedOracleService(c, config);
    });

    // Onboarding Service  
    container.registerScoped(ServiceTokens.OnboardingService, async (c) => {
      const { OnboardingService } = await import('../services/OnboardingService');
      const userService = await c.resolve(ServiceTokens.UserService);
      const narrativeService = await c.resolve(ServiceTokens.NarrativeService);
      return new OnboardingService(userService, narrativeService);
    });

    // Integration Service
    container.registerSingleton(ServiceTokens.IntegrationService, async (c) => {
      const { IntegrationService } = await import('../services/IntegrationService');
      const configService = await c.resolve(ServiceTokens.ConfigurationService);
      return new IntegrationService(configService);
    });
  }

  private static async registerHealthChecks(container: ServiceContainer): Promise<void> {
    
    // Database health check
    container.registerHealthCheck(ServiceTokens.DatabaseService, async () => {
      try {
        const dbService = await container.resolve(ServiceTokens.DatabaseService);
        await dbService.query('SELECT 1');
        return true;
      } catch {
        return false;
      }
    });

    // Cache health check
    container.registerHealthCheck(ServiceTokens.CacheService, async () => {
      try {
        const cacheService = await container.resolve(ServiceTokens.CacheService);
        await cacheService.set('health_check', 'ok', 5);
        const result = await cacheService.get('health_check');
        return result === 'ok';
      } catch {
        return false;
      }
    });

    // Oracle service health check
    container.registerHealthCheck(ServiceTokens.OracleService, async () => {
      try {
        // Test with a simple message
        const oracleService = await container.resolve(ServiceTokens.OracleService);
        const response = await oracleService.processMessage('health_check', 'test');
        return response.text.length > 0;
      } catch {
        return false;
      }
    });
  }
}

/**
 * Initialize services for the application
 */
export async function initializeServices(options: ServiceRegistrationOptions): Promise<ServiceContainer> {
  const container = new ServiceContainer();
  
  await ServiceRegistry.configureServices(container, options);
  
  // Log service registration completion
  const stats = container.getStats();
  console.log(`✅ Service registry initialized: ${stats.totalRegistrations} services registered`);
  
  return container;
}

/**
 * Default configuration for different environments
 */
export const DefaultConfigurations = {
  development: {
    environment: 'development' as const,
    enableCaching: true,
    enableAnalytics: true,
    enableVoice: true
  },
  
  production: {
    environment: 'production' as const,
    enableCaching: true,
    enableAnalytics: true,
    enableVoice: true
  },
  
  test: {
    environment: 'test' as const,
    enableCaching: false,
    enableAnalytics: false,
    enableVoice: false
  }
} as const;