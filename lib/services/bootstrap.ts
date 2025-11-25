/**
 * Service Bootstrap
 * Initialize and configure the unified service architecture
 */

import { ServiceContainer } from '../core/ServiceContainer';
import { ServiceRegistry, DefaultConfigurations, ServiceRegistrationOptions } from '../core/ServiceRegistry';

export interface BootstrapOptions {
  environment?: 'development' | 'production' | 'test';
  enableCaching?: boolean;
  enableAnalytics?: boolean;
  enableVoice?: boolean;
  databaseUrl?: string;
  redisUrl?: string;
}

export class ServiceBootstrap {
  private container: ServiceContainer | null = null;
  private initialized = false;

  /**
   * Initialize the service container with all services
   */
  async initialize(options: BootstrapOptions = {}): Promise<ServiceContainer> {
    if (this.initialized && this.container) {
      return this.container;
    }

    const environment = options.environment || (process.env.NODE_ENV as any) || 'development';
    const config: ServiceRegistrationOptions = {
      ...DefaultConfigurations[environment],
      ...options
    };

    console.log(`🚀 Bootstrapping SpiralogicOracleSystem services (${environment})`);

    // Create container
    this.container = new ServiceContainer();
    
    // Register all services
    await ServiceRegistry.configureServices(this.container, config);
    
    // Verify critical services are healthy
    await this.performHealthChecks();
    
    this.initialized = true;
    
    console.log('✅ SpiralogicOracleSystem services initialized successfully');
    
    return this.container;
  }

  /**
   * Get the initialized container
   */
  getContainer(): ServiceContainer {
    if (!this.container || !this.initialized) {
      throw new Error('Services not initialized. Call initialize() first.');
    }
    return this.container;
  }

  /**
   * Perform health checks on critical services
   */
  private async performHealthChecks(): Promise<void> {
    if (!this.container) return;

    const healthResults = await this.container.getAllHealth();
    let healthyCount = 0;
    let totalCount = 0;

    console.log('🔍 Running service health checks...');

    for (const [serviceName, health] of healthResults) {
      totalCount++;
      if (health.healthy) {
        healthyCount++;
        console.log(`  ✅ ${serviceName}: healthy`);
      } else {
        console.log(`  ❌ ${serviceName}: ${health.error || 'unhealthy'}`);
      }
    }

    console.log(`📊 Health check results: ${healthyCount}/${totalCount} services healthy`);

    if (healthyCount < totalCount * 0.8) { // Less than 80% healthy
      console.warn('⚠️  Some services are unhealthy but continuing with startup');
    }
  }

  /**
   * Gracefully shutdown all services
   */
  async shutdown(): Promise<void> {
    if (this.container) {
      console.log('🔄 Shutting down SpiralogicOracleSystem services...');
      await this.container.dispose();
      this.container = null;
      this.initialized = false;
      console.log('✅ Services shutdown complete');
    }
  }
}

// Global bootstrap instance
export const bootstrap = new ServiceBootstrap();

/**
 * Quick initialization helper
 */
export async function initializeServices(options?: BootstrapOptions): Promise<ServiceContainer> {
  return bootstrap.initialize(options);
}

/**
 * Quick container access helper
 */
export function getServiceContainer(): ServiceContainer {
  return bootstrap.getContainer();
}

/**
 * Quick shutdown helper
 */
export async function shutdownServices(): Promise<void> {
  return bootstrap.shutdown();
}

// Auto-shutdown on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    await shutdownServices();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    await shutdownServices();
    process.exit(0);
  });
  
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception:', error);
    await shutdownServices();
    process.exit(1);
  });
}