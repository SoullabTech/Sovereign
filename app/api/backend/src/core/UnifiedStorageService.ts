/**
 * UnifiedStorageService - Abstraction Layer for All Data Access
 * Consolidates storage patterns and eliminates data duplication
 * Foundation component for architectural simplification
 */

import { 
  StorageEntity, 
  StorageQuery, 
  StorageResult, 
  BaseEntity, 
  SystemError,
  UserProfile,
  SessionContext,
  DaimonicEncounter,
  CollectivePattern
} from './TypeRegistry.js';
import { EventBus, daimonicEventBus } from './EventBus.js';

export interface StorageAdapter {
  name: string;
  priority: number; // Higher numbers tried first
  canHandle(operation: StorageOperation): boolean;
  
  create<T extends BaseEntity>(entity: T): Promise<T>;
  read<T extends BaseEntity>(id: string, entityType: string): Promise<T | null>;
  update<T extends BaseEntity>(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string, entityType: string): Promise<boolean>;
  query<T extends BaseEntity>(query: StorageQuery): Promise<StorageResult<T>>;
  
  // Batch operations
  createMany<T extends BaseEntity>(entities: T[]): Promise<T[]>;
  readMany<T extends BaseEntity>(ids: string[], entityType: string): Promise<T[]>;
  deleteMany(ids: string[], entityType: string): Promise<number>;
}

export interface CacheAdapter {
  name: string;
  ttl: number; // Default TTL in seconds
  
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(pattern?: string): Promise<number>;
  exists(key: string): Promise<boolean>;
}

export interface StorageOperation {
  type: 'create' | 'read' | 'update' | 'delete' | 'query';
  entityType: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  consistency?: 'eventual' | 'strong';
  userId?: string;
  sessionId?: string;
}

export interface StorageMetrics {
  operationsCount: Record<string, number>;
  averageResponseTime: Record<string, number>;
  errorCount: Record<string, number>;
  cacheHitRate: number;
  totalQueries: number;
  activeConnections: number;
  storageSize: Record<string, number>; // Size by entity type
}

export class UnifiedStorageService {
  private adapters: Map<string, StorageAdapter> = new Map();
  private cache: CacheAdapter | null = null;
  private eventBus: EventBus;
  
  private metrics: StorageMetrics = {
    operationsCount: {},
    averageResponseTime: {},
    errorCount: {},
    cacheHitRate: 0,
    totalQueries: 0,
    activeConnections: 0,
    storageSize: {}
  };

  private responseTimes: Record<string, number[]> = {};
  private maxResponseTimes = 100; // Keep last 100 times per operation

  constructor(
    eventBus: EventBus = daimonicEventBus,
    private options: {
      enableCache?: boolean;
      enableMetrics?: boolean;
      enableEventEmission?: boolean;
      defaultTTL?: number;
      maxRetries?: number;
      retryDelay?: number;
    } = {}
  ) {
    this.eventBus = eventBus;
    this.options = {
      enableCache: true,
      enableMetrics: true,
      enableEventEmission: true,
      defaultTTL: 3600, // 1 hour
      maxRetries: 3,
      retryDelay: 1000,
      ...options
    };

    this.setupEventHandlers();
  }

  /**
   * Register storage adapter
   */
  registerAdapter(adapter: StorageAdapter): void {
    this.adapters.set(adapter.name, adapter);
    
    // Sort adapters by priority for operation routing
    const sortedAdapters = Array.from(this.adapters.values())
      .sort((a, b) => b.priority - a.priority);
    
    this.adapters.clear();
    sortedAdapters.forEach(adapter => {
      this.adapters.set(adapter.name, adapter);
    });

    if (this.options.enableEventEmission) {
      this.eventBus.emit('storage:adapter_registered', {
        adapterName: adapter.name,
        priority: adapter.priority
      });
    }
  }

  /**
   * Register cache adapter
   */
  registerCache(cache: CacheAdapter): void {
    this.cache = cache;
    
    if (this.options.enableEventEmission) {
      this.eventBus.emit('storage:cache_registered', {
        cacheName: cache.name,
        ttl: cache.ttl
      });
    }
  }

  /**
   * Create entity
   */
  async create<T extends BaseEntity>(
    entity: T,
    options: Partial<StorageOperation> = {}
  ): Promise<T> {
    const operation: StorageOperation = {
      type: 'create',
      entityType: this.getEntityType(entity),
      priority: options.priority || 'normal',
      consistency: options.consistency || 'strong',
      userId: options.userId,
      sessionId: options.sessionId
    };

    const startTime = Date.now();
    
    try {
      const adapter = this.selectAdapter(operation);
      if (!adapter) {
        throw new Error(`No suitable adapter found for ${operation.entityType} creation`);
      }

      // Set creation metadata
      const now = new Date();
      entity.createdAt = entity.createdAt || now;
      entity.updatedAt = now;
      entity.version = entity.version || 1;

      const result = await adapter.create(entity);

      // Update cache if enabled
      if (this.options.enableCache && this.cache) {
        const cacheKey = this.buildCacheKey(result.id, operation.entityType);
        await this.cache.set(cacheKey, result, this.options.defaultTTL);
      }

      // Emit event
      if (this.options.enableEventEmission) {
        await this.eventBus.emit('storage:entity_created', {
          entityType: operation.entityType,
          entityId: result.id,
          userId: options.userId,
          sessionId: options.sessionId
        });
      }

      this.updateMetrics('create', operation.entityType, Date.now() - startTime);
      return result;

    } catch (error) {
      this.handleError(error as Error, operation);
      throw error;
    }
  }

  /**
   * Read entity by ID
   */
  async read<T extends BaseEntity>(
    id: string,
    entityType: string,
    options: Partial<StorageOperation> = {}
  ): Promise<T | null> {
    const operation: StorageOperation = {
      type: 'read',
      entityType,
      priority: options.priority || 'normal',
      consistency: options.consistency || 'eventual',
      userId: options.userId,
      sessionId: options.sessionId
    };

    const startTime = Date.now();
    let cacheHit = false;

    try {
      // Try cache first
      if (this.options.enableCache && this.cache) {
        const cacheKey = this.buildCacheKey(id, entityType);
        const cached = await this.cache.get<T>(cacheKey);
        
        if (cached) {
          cacheHit = true;
          this.updateCacheHitRate(true);
          return cached;
        }
      }

      this.updateCacheHitRate(false);

      const adapter = this.selectAdapter(operation);
      if (!adapter) {
        throw new Error(`No suitable adapter found for ${entityType} read`);
      }

      const result = await adapter.read<T>(id, entityType);

      // Cache the result
      if (result && this.options.enableCache && this.cache) {
        const cacheKey = this.buildCacheKey(id, entityType);
        await this.cache.set(cacheKey, result, this.options.defaultTTL);
      }

      this.updateMetrics('read', entityType, Date.now() - startTime, cacheHit);
      return result;

    } catch (error) {
      this.handleError(error as Error, operation);
      throw error;
    }
  }

  /**
   * Update entity
   */
  async update<T extends BaseEntity>(
    id: string,
    updates: Partial<T>,
    options: Partial<StorageOperation> = {}
  ): Promise<T> {
    const operation: StorageOperation = {
      type: 'update',
      entityType: options.entityType || this.getEntityType(updates as any),
      priority: options.priority || 'normal',
      consistency: options.consistency || 'strong',
      userId: options.userId,
      sessionId: options.sessionId
    };

    const startTime = Date.now();

    try {
      const adapter = this.selectAdapter(operation);
      if (!adapter) {
        throw new Error(`No suitable adapter found for ${operation.entityType} update`);
      }

      // Set update metadata
      updates.updatedAt = new Date();
      if ('version' in updates) {
        updates.version = ((updates.version as number) || 0) + 1;
      }

      const result = await adapter.update(id, updates);

      // Invalidate cache
      if (this.options.enableCache && this.cache) {
        const cacheKey = this.buildCacheKey(id, operation.entityType);
        await this.cache.delete(cacheKey);
        
        // Re-cache the updated entity
        await this.cache.set(cacheKey, result, this.options.defaultTTL);
      }

      // Emit event
      if (this.options.enableEventEmission) {
        await this.eventBus.emit('storage:entity_updated', {
          entityType: operation.entityType,
          entityId: id,
          userId: options.userId,
          sessionId: options.sessionId,
          changes: Object.keys(updates)
        });
      }

      this.updateMetrics('update', operation.entityType, Date.now() - startTime);
      return result;

    } catch (error) {
      this.handleError(error as Error, operation);
      throw error;
    }
  }

  /**
   * Delete entity
   */
  async delete(
    id: string,
    entityType: string,
    options: Partial<StorageOperation> = {}
  ): Promise<boolean> {
    const operation: StorageOperation = {
      type: 'delete',
      entityType,
      priority: options.priority || 'normal',
      consistency: options.consistency || 'strong',
      userId: options.userId,
      sessionId: options.sessionId
    };

    const startTime = Date.now();

    try {
      const adapter = this.selectAdapter(operation);
      if (!adapter) {
        throw new Error(`No suitable adapter found for ${entityType} deletion`);
      }

      const result = await adapter.delete(id, entityType);

      // Remove from cache
      if (this.options.enableCache && this.cache) {
        const cacheKey = this.buildCacheKey(id, entityType);
        await this.cache.delete(cacheKey);
      }

      // Emit event
      if (this.options.enableEventEmission && result) {
        await this.eventBus.emit('storage:entity_deleted', {
          entityType,
          entityId: id,
          userId: options.userId,
          sessionId: options.sessionId
        });
      }

      this.updateMetrics('delete', entityType, Date.now() - startTime);
      return result;

    } catch (error) {
      this.handleError(error as Error, operation);
      throw error;
    }
  }

  /**
   * Query entities
   */
  async query<T extends BaseEntity>(
    query: StorageQuery,
    options: Partial<StorageOperation> = {}
  ): Promise<StorageResult<T>> {
    const operation: StorageOperation = {
      type: 'query',
      entityType: query.entityType || 'unknown',
      priority: options.priority || 'normal',
      consistency: options.consistency || 'eventual',
      userId: options.userId || query.userId,
      sessionId: options.sessionId || query.sessionId
    };

    const startTime = Date.now();

    try {
      // Check cache for complex queries (optional optimization)
      const cacheKey = this.buildQueryCacheKey(query);
      let cacheHit = false;

      if (this.options.enableCache && this.cache && this.shouldCacheQuery(query)) {
        const cached = await this.cache.get<StorageResult<T>>(cacheKey);
        if (cached) {
          cacheHit = true;
          this.updateCacheHitRate(true);
          return cached;
        }
      }

      this.updateCacheHitRate(false);

      const adapter = this.selectAdapter(operation);
      if (!adapter) {
        throw new Error(`No suitable adapter found for ${operation.entityType} query`);
      }

      const result = await adapter.query<T>(query);

      // Cache query results (if appropriate)
      if (this.options.enableCache && this.cache && this.shouldCacheQuery(query)) {
        await this.cache.set(cacheKey, result, Math.floor(this.options.defaultTTL! / 4)); // Shorter TTL for queries
      }

      // Emit event
      if (this.options.enableEventEmission) {
        await this.eventBus.emit('storage:query_executed', {
          entityType: operation.entityType,
          resultCount: result.data.length,
          totalMatched: result.total,
          queryHash: this.hashQuery(query),
          userId: operation.userId,
          sessionId: operation.sessionId
        });
      }

      this.updateMetrics('query', operation.entityType, Date.now() - startTime, cacheHit);
      return result;

    } catch (error) {
      this.handleError(error as Error, operation);
      throw error;
    }
  }

  /**
   * High-level entity-specific methods
   */

  // User management
  async createUser(userProfile: UserProfile): Promise<UserProfile> {
    return this.create(userProfile, { entityType: 'UserProfile' });
  }

  async getUser(userId: string): Promise<UserProfile | null> {
    return this.read<UserProfile>(userId, 'UserProfile');
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.update(userId, updates, { entityType: 'UserProfile' });
  }

  // Session management
  async createSession(session: SessionContext): Promise<SessionContext> {
    return this.create(session, { entityType: 'SessionContext', userId: session.userId });
  }

  async getSession(sessionId: string): Promise<SessionContext | null> {
    return this.read<SessionContext>(sessionId, 'SessionContext');
  }

  async getUserSessions(userId: string, limit: number = 10): Promise<SessionContext[]> {
    const result = await this.query<SessionContext>({
      entityType: 'SessionContext',
      userId,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    return result.data;
  }

  // Daimonic encounters
  async createEncounter(encounter: DaimonicEncounter): Promise<DaimonicEncounter> {
    return this.create(encounter, { 
      entityType: 'DaimonicEncounter', 
      userId: encounter.userId,
      sessionId: encounter.sessionId
    });
  }

  async getEncounter(encounterId: string): Promise<DaimonicEncounter | null> {
    return this.read<DaimonicEncounter>(encounterId, 'DaimonicEncounter');
  }

  async getSessionEncounters(sessionId: string): Promise<DaimonicEncounter[]> {
    const result = await this.query<DaimonicEncounter>({
      entityType: 'DaimonicEncounter',
      sessionId,
      sortBy: 'createdAt',
      sortOrder: 'asc'
    });
    return result.data;
  }

  // Collective patterns
  async createCollectivePattern(pattern: CollectivePattern): Promise<CollectivePattern> {
    return this.create(pattern, { entityType: 'CollectivePattern' });
  }

  async getActivePatterns(limit: number = 20): Promise<CollectivePattern[]> {
    const result = await this.query<CollectivePattern>({
      entityType: 'CollectivePattern',
      limit,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
    return result.data;
  }

  /**
   * Utility methods
   */

  private selectAdapter(operation: StorageOperation): StorageAdapter | null {
    for (const adapter of this.adapters.values()) {
      if (adapter.canHandle(operation)) {
        return adapter;
      }
    }
    return null;
  }

  private getEntityType(entity: any): string {
    return entity.constructor?.name || entity.entityType || 'Unknown';
  }

  private buildCacheKey(id: string, entityType: string): string {
    return `entity:${entityType}:${id}`;
  }

  private buildQueryCacheKey(query: StorageQuery): string {
    const hash = this.hashQuery(query);
    return `query:${query.entityType}:${hash}`;
  }

  private hashQuery(query: StorageQuery): string {
    return btoa(JSON.stringify(query)).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
  }

  private shouldCacheQuery(query: StorageQuery): boolean {
    // Don't cache very specific or user-specific queries
    return !query.userId && !query.sessionId && (query.limit || 0) <= 50;
  }

  private updateMetrics(
    operation: string, 
    entityType: string, 
    responseTime: number, 
    cacheHit = false
  ): void {
    if (!this.options.enableMetrics) return;

    const key = `${operation}:${entityType}`;
    
    this.metrics.operationsCount[key] = (this.metrics.operationsCount[key] || 0) + 1;
    this.metrics.totalQueries++;

    // Update response times
    if (!this.responseTimes[key]) {
      this.responseTimes[key] = [];
    }
    
    this.responseTimes[key].push(responseTime);
    if (this.responseTimes[key].length > this.maxResponseTimes) {
      this.responseTimes[key].shift();
    }

    // Calculate average response time
    const times = this.responseTimes[key];
    this.metrics.averageResponseTime[key] = 
      times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  private updateCacheHitRate(hit: boolean): void {
    if (!this.options.enableCache) return;
    
    // Simple moving average for cache hit rate
    const currentRate = this.metrics.cacheHitRate;
    const newRate = hit ? 1 : 0;
    this.metrics.cacheHitRate = (currentRate * 0.9) + (newRate * 0.1);
  }

  private handleError(error: Error, operation: StorageOperation): void {
    const key = `${operation.type}:${operation.entityType}`;
    this.metrics.errorCount[key] = (this.metrics.errorCount[key] || 0) + 1;

    if (this.options.enableEventEmission) {
      this.eventBus.emit('storage:error', {
        operation,
        error: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date()
        }
      } as SystemError);
    }
  }

  private setupEventHandlers(): void {
    if (!this.options.enableEventEmission) return;

    // Handle cleanup events
    this.eventBus.subscribe('storage:cleanup_request', async (event) => {
      await this.cleanup(event.data);
    });

    // Handle metrics requests
    this.eventBus.subscribe('storage:metrics_request', async () => {
      await this.eventBus.emit('storage:metrics_response', this.getMetrics());
    });
  }

  /**
   * Maintenance operations
   */

  async cleanup(options: {
    entityType?: string;
    olderThan?: Date;
    privacy?: string;
    dryRun?: boolean;
  } = {}): Promise<{ deleted: number; errors: number }> {
    // Implementation would depend on specific adapters
    // This is a framework for cleanup operations
    return { deleted: 0, errors: 0 };
  }

  getMetrics(): StorageMetrics {
    return { ...this.metrics };
  }

  getAdapterInfo(): Array<{ name: string; priority: number; active: boolean }> {
    return Array.from(this.adapters.values()).map(adapter => ({
      name: adapter.name,
      priority: adapter.priority,
      active: true
    }));
  }

  getCacheInfo(): { name: string; ttl: number; hitRate: number } | null {
    return this.cache ? {
      name: this.cache.name,
      ttl: this.cache.ttl,
      hitRate: this.metrics.cacheHitRate
    } : null;
  }
}

// Storage adapter implementations would be created separately
// This provides the foundation for the unified storage architecture