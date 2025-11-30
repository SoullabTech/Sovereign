/**
 * Core Integration Type Definitions
 * Types for system-wide integration and interoperability
 */

export interface IntegrationConfig {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  timeout?: number;
  retryAttempts?: number;
  fallbackEnabled?: boolean;
}

export interface ServiceIntegration {
  id: string;
  name: string;
  type: 'ai' | 'database' | 'voice' | 'analytics' | 'payment' | 'communication';
  status: 'active' | 'inactive' | 'error' | 'degraded';
  config: IntegrationConfig;
  health?: {
    lastCheck: Date;
    isHealthy: boolean;
    latency?: number;
    errorRate?: number;
  };
}

export interface WebhookEvent {
  id: string;
  type: string;
  timestamp: Date;
  payload: any;
  source: string;
  signature?: string;
  verified?: boolean;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime?: number;
  };
}

export interface BatchOperation<T> {
  items: T[];
  operation: 'create' | 'update' | 'delete';
  options?: {
    parallel?: boolean;
    batchSize?: number;
    onProgress?: (progress: number) => void;
    onError?: (error: Error, item: T) => void;
  };
}

export interface SyncState {
  lastSync: Date;
  pendingChanges: number;
  syncInProgress: boolean;
  errors: Error[];
  nextSync?: Date;
}

export interface DataMigration {
  version: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  operations: {
    type: string;
    count: number;
    success: number;
    failed: number;
  }[];
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
  storage: 'memory' | 'redis' | 'disk';
}

export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

export interface SecurityConfig {
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyRotation: boolean;
  };
  authentication: {
    type: 'jwt' | 'oauth' | 'apikey' | 'session';
    expiresIn: string;
    refreshEnabled: boolean;
  };
  authorization: {
    rbac: boolean;
    defaultRole: string;
    permissions: string[];
  };
}

export interface MonitoringConfig {
  metrics: {
    enabled: boolean;
    interval: number;
    exporters: string[];
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    destinations: string[];
  };
  tracing: {
    enabled: boolean;
    sampleRate: number;
    exporter: string;
  };
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number;
  userGroups?: string[];
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  services: Record<string, {
    status: string;
    latency?: number;
    errorRate?: number;
  }>;
  resources: {
    cpu: number;
    memory: number;
    disk: number;
  };
  timestamp: Date;
}