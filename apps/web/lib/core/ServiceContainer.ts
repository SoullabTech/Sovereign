/**
 * Enhanced Dependency Injection Container
 * Replaces the simple 11-line container with proper service lifecycle management
 */

export enum ServiceLifetime {
  Singleton = 'singleton',
  Scoped = 'scoped', 
  Transient = 'transient'
}

export interface ServiceToken<T = any> {
  readonly key: string;
  readonly type?: new (...args: any[]) => T;
}

export type ServiceFactory<T = any> = (container: ServiceContainer) => T | Promise<T>;

export interface ServiceRegistration<T = any> {
  factory: ServiceFactory<T>;
  lifetime: ServiceLifetime;
  instance?: T;
  disposing?: boolean;
}

export interface ScopedContainer extends ServiceContainer {
  dispose(): Promise<void>;
}

export interface ServiceHealth {
  healthy: boolean;
  lastCheck: Date;
  error?: string;
}

export class ServiceContainer {
  private registrations = new Map<string, ServiceRegistration>();
  private singletonInstances = new Map<string, any>();
  private healthChecks = new Map<string, () => Promise<boolean>>();
  private disposed = false;

  /**
   * Register a transient service (new instance each time)
   */
  register<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    this.throwIfDisposed();
    this.registrations.set(token.key, {
      factory,
      lifetime: ServiceLifetime.Transient
    });
    return this;
  }

  /**
   * Register a singleton service (same instance every time)
   */
  registerSingleton<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    this.throwIfDisposed();
    this.registrations.set(token.key, {
      factory,
      lifetime: ServiceLifetime.Singleton
    });
    return this;
  }

  /**
   * Register a scoped service (one instance per scope)
   */
  registerScoped<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    this.throwIfDisposed();
    this.registrations.set(token.key, {
      factory,
      lifetime: ServiceLifetime.Scoped
    });
    return this;
  }

  /**
   * Register a health check for a service
   */
  registerHealthCheck<T>(token: ServiceToken<T>, healthCheck: () => Promise<boolean>): this {
    this.healthChecks.set(token.key, healthCheck);
    return this;
  }

  /**
   * Resolve a service instance
   */
  async resolve<T>(token: ServiceToken<T>): Promise<T> {
    this.throwIfDisposed();
    
    const registration = this.registrations.get(token.key);
    if (!registration) {
      throw new Error(`Service not registered: ${token.key}`);
    }

    switch (registration.lifetime) {
      case ServiceLifetime.Singleton:
        return this.resolveSingleton(token.key, registration);
      
      case ServiceLifetime.Transient:
        return this.resolveTransient(registration);
      
      case ServiceLifetime.Scoped:
        throw new Error(`Scoped services must be resolved within a scope. Use createScope() first.`);
      
      default:
        throw new Error(`Unknown service lifetime: ${registration.lifetime}`);
    }
  }

  /**
   * Resolve a service synchronously (for already-instantiated singletons)
   */
  get<T>(token: ServiceToken<T>): T {
    this.throwIfDisposed();
    
    const registration = this.registrations.get(token.key);
    if (!registration) {
      throw new Error(`Service not registered: ${token.key}`);
    }

    if (registration.lifetime === ServiceLifetime.Singleton && this.singletonInstances.has(token.key)) {
      return this.singletonInstances.get(token.key);
    }

    throw new Error(`Service ${token.key} is not available synchronously. Use resolve() instead.`);
  }

  /**
   * Create a scoped container for request-bound services
   */
  createScope(): ScopedContainer {
    this.throwIfDisposed();
    return new ScopedServiceContainer(this);
  }

  /**
   * Check if a service is registered
   */
  isRegistered(token: ServiceToken): boolean {
    return this.registrations.has(token.key);
  }

  /**
   * Get service health status
   */
  async getHealth(token: ServiceToken): Promise<ServiceHealth> {
    const healthCheck = this.healthChecks.get(token.key);
    if (!healthCheck) {
      return { healthy: true, lastCheck: new Date() }; // No health check = assume healthy
    }

    try {
      const healthy = await healthCheck();
      return { healthy, lastCheck: new Date() };
    } catch (error) {
      return { 
        healthy: false, 
        lastCheck: new Date(), 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get health status for all services
   */
  async getAllHealth(): Promise<Map<string, ServiceHealth>> {
    const healthResults = new Map<string, ServiceHealth>();
    
    for (const [key] of this.registrations) {
      const health = await this.getHealth({ key });
      healthResults.set(key, health);
    }
    
    return healthResults;
  }

  /**
   * Get container statistics
   */
  getStats() {
    return {
      totalRegistrations: this.registrations.size,
      singletonInstances: this.singletonInstances.size,
      healthChecks: this.healthChecks.size,
      disposed: this.disposed
    };
  }

  /**
   * Dispose of the container and all singleton instances
   */
  async dispose(): Promise<void> {
    if (this.disposed) return;

    // Dispose singleton instances that have disposal methods
    const disposalPromises: Promise<void>[] = [];
    
    for (const [key, instance] of this.singletonInstances) {
      if (instance && typeof instance.dispose === 'function') {
        console.log(`Disposing singleton service: ${key}`);
        disposalPromises.push(instance.dispose());
      }
    }

    await Promise.allSettled(disposalPromises);
    
    this.singletonInstances.clear();
    this.registrations.clear();
    this.healthChecks.clear();
    this.disposed = true;
  }

  private async resolveSingleton<T>(key: string, registration: ServiceRegistration<T>): Promise<T> {
    if (this.singletonInstances.has(key)) {
      return this.singletonInstances.get(key);
    }

    if (registration.disposing) {
      throw new Error(`Circular dependency detected while resolving singleton: ${key}`);
    }

    try {
      registration.disposing = true;
      const instance = await registration.factory(this);
      this.singletonInstances.set(key, instance);
      return instance;
    } finally {
      registration.disposing = false;
    }
  }

  private async resolveTransient<T>(registration: ServiceRegistration<T>): Promise<T> {
    return await registration.factory(this);
  }

  private throwIfDisposed() {
    if (this.disposed) {
      throw new Error('ServiceContainer has been disposed');
    }
  }
}

/**
 * Scoped container for request-bound service lifetimes
 */
export class ScopedServiceContainer implements ScopedContainer {
  private scopedInstances = new Map<string, any>();
  private disposed = false;

  constructor(private parent: ServiceContainer) {}

  register<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    return this.parent.register(token, factory) as any;
  }

  registerSingleton<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    return this.parent.registerSingleton(token, factory) as any;
  }

  registerScoped<T>(token: ServiceToken<T>, factory: ServiceFactory<T>): this {
    return this.parent.registerScoped(token, factory) as any;
  }

  registerHealthCheck<T>(token: ServiceToken<T>, healthCheck: () => Promise<boolean>): this {
    return this.parent.registerHealthCheck(token, healthCheck) as any;
  }

  async resolve<T>(token: ServiceToken<T>): Promise<T> {
    this.throwIfDisposed();

    const registration = this.parent['registrations'].get(token.key);
    if (!registration) {
      throw new Error(`Service not registered: ${token.key}`);
    }

    switch (registration.lifetime) {
      case ServiceLifetime.Singleton:
        return this.parent.resolve(token);
      
      case ServiceLifetime.Transient:
        return await registration.factory(this);
      
      case ServiceLifetime.Scoped:
        if (this.scopedInstances.has(token.key)) {
          return this.scopedInstances.get(token.key);
        }
        const instance = await registration.factory(this);
        this.scopedInstances.set(token.key, instance);
        return instance;
      
      default:
        throw new Error(`Unknown service lifetime: ${registration.lifetime}`);
    }
  }

  get<T>(token: ServiceToken<T>): T {
    return this.parent.get(token);
  }

  createScope(): ScopedContainer {
    return this.parent.createScope();
  }

  isRegistered(token: ServiceToken): boolean {
    return this.parent.isRegistered(token);
  }

  async getHealth(token: ServiceToken): Promise<ServiceHealth> {
    return this.parent.getHealth(token);
  }

  async getAllHealth(): Promise<Map<string, ServiceHealth>> {
    return this.parent.getAllHealth();
  }

  getStats() {
    return {
      ...this.parent.getStats(),
      scopedInstances: this.scopedInstances.size
    };
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;

    // Dispose scoped instances
    const disposalPromises: Promise<void>[] = [];
    
    for (const [key, instance] of this.scopedInstances) {
      if (instance && typeof instance.dispose === 'function') {
        console.log(`Disposing scoped service: ${key}`);
        disposalPromises.push(instance.dispose());
      }
    }

    await Promise.allSettled(disposalPromises);
    
    this.scopedInstances.clear();
    this.disposed = true;
  }

  private throwIfDisposed() {
    if (this.disposed) {
      throw new Error('ScopedServiceContainer has been disposed');
    }
  }
}

/**
 * Service token factory for type-safe service registration
 */
export function createServiceToken<T>(key: string, type?: new (...args: any[]) => T): ServiceToken<T> {
  return { key, type };
}

/**
 * Global service container instance
 */
export const container = new ServiceContainer();

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('Disposing service container...');
    await container.dispose();
  });
  
  process.on('SIGINT', async () => {
    console.log('Disposing service container...');
    await container.dispose();
  });
}