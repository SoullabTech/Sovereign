/**
 * AIN System Status Resource
 *
 * Provides health and capability information for the AIN system.
 * Used by clients to understand available features and current state.
 */

export interface ToolCapability {
  name: string;
  available: boolean;
  description: string;
  rateLimit?: number; // requests per minute
}

export interface ResourceCapability {
  uri: string;
  available: boolean;
  updateFrequency: string;
}

export interface SystemStatusResource {
  version: string;
  status: 'healthy' | 'degraded' | 'maintenance' | 'offline';
  uptime: number; // seconds
  lastHealthCheck: string;
  tools: ToolCapability[];
  resources: ResourceCapability[];
  features: {
    knowledgeGate: boolean;
    collectiveField: boolean;
    evolutionTracking: boolean;
    awarenessDetection: boolean;
    personalGuidance: boolean;
  };
  limits: {
    maxRequestsPerMinute: number;
    maxConcurrentConnections: number;
    maxMessageLength: number;
  };
  backend: {
    ollama: boolean;
    postgresql: boolean;
    memoryLattice: boolean;
  };
}

// Server start time for uptime calculation
const SERVER_START_TIME = Date.now();

// Simulated health check interval
let lastHealthCheck = new Date().toISOString();

function checkBackendStatus(): SystemStatusResource['backend'] {
  // In production, would actually ping services
  // Simulating backend availability
  return {
    ollama: true, // Local LLM
    postgresql: true, // Local database
    memoryLattice: true, // Memory system
  };
}

function determineOverallStatus(
  backend: SystemStatusResource['backend']
): SystemStatusResource['status'] {
  const allHealthy = backend.ollama && backend.postgresql && backend.memoryLattice;
  const partiallyHealthy = backend.ollama || backend.postgresql;

  if (allHealthy) return 'healthy';
  if (partiallyHealthy) return 'degraded';
  return 'offline';
}

export async function getSystemStatus(): Promise<SystemStatusResource> {
  const backend = checkBackendStatus();
  const status = determineOverallStatus(backend);
  const uptime = Math.floor((Date.now() - SERVER_START_TIME) / 1000);

  // Update last health check
  lastHealthCheck = new Date().toISOString();

  return {
    version: '1.0.0',
    status,
    uptime,
    lastHealthCheck,
    tools: [
      {
        name: 'ain_query',
        available: backend.ollama,
        description: 'Knowledge-gated response with source mixing',
        rateLimit: 60,
      },
      {
        name: 'ain_awareness',
        available: true, // No external dependency
        description: 'Detect consciousness/awareness level from text',
        rateLimit: 120,
      },
      {
        name: 'ain_insight',
        available: true,
        description: 'Get collective wisdom insight on a topic',
        rateLimit: 30,
      },
      {
        name: 'ain_guidance',
        available: backend.postgresql,
        description: 'Get personalized evolution guidance',
        rateLimit: 20,
      },
      {
        name: 'ain_field_state',
        available: backend.memoryLattice,
        description: 'Get current collective field coherence',
        rateLimit: 60,
      },
    ],
    resources: [
      {
        uri: 'ain://field/coherence',
        available: backend.memoryLattice,
        updateFrequency: '30 seconds',
      },
      {
        uri: 'ain://system/status',
        available: true,
        updateFrequency: 'On request',
      },
      {
        uri: 'ain://evolution/phase',
        available: backend.postgresql,
        updateFrequency: 'On phase change',
      },
    ],
    features: {
      knowledgeGate: backend.ollama,
      collectiveField: backend.memoryLattice,
      evolutionTracking: backend.postgresql,
      awarenessDetection: true,
      personalGuidance: backend.postgresql,
    },
    limits: {
      maxRequestsPerMinute: 60,
      maxConcurrentConnections: 10,
      maxMessageLength: 10000,
    },
    backend,
  };
}
