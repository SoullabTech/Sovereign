/**
 * Oracle Bridge - Connects frontend API routes to backend orchestration
 * This is the missing link that makes the system flow efficiently
 */

import { OracleOrchestrator, createOracleOrchestrator } from '../../apps/api/backend/src/orchestration/OracleOrchestrator';
import { ElementalArchetype } from '../types/elemental';

// Singleton orchestrator instances per user
const orchestrators = new Map<string, OracleOrchestrator>();

export interface OracleRequest {
  input: string;
  userId: string;
  sessionId: string;
  agentName?: string;
  context?: any;
}

export interface OracleResponse {
  message: string;
  element: string;
  confidence: number;
  metadata: {
    sessionId: string;
    leadingSystem?: string;
    processingTime?: number;
    orchestrated: boolean;
  };
}

/**
 * Get or create user-specific orchestrator
 */
function getOrchestrator(userId: string, agentName: string = 'Maya'): OracleOrchestrator {
  const key = `${userId}-${agentName}`;

  if (!orchestrators.has(key)) {
    const orchestrator = createOracleOrchestrator(agentName, {
      monitoringEnabled: true,
      confidenceThreshold: 0.4,
      maxHistoryLength: 100
    });
    orchestrators.set(key, orchestrator);
  }

  return orchestrators.get(key)!;
}

/**
 * Process request through orchestration system
 */
export async function processOracleRequest(request: OracleRequest): Promise<OracleResponse> {
  try {
    // Get user's orchestrator
    const orchestrator = getOrchestrator(request.userId, request.agentName || 'Maya');

    // Process through orchestration system
    const orchestratorResponse = await orchestrator.handleInput(
      request.userId,
      request.input,
      request.sessionId
    );

    // Convert to API response format
    return {
      message: orchestratorResponse.response,
      element: mapElementToString(orchestratorResponse.metadata.element),
      confidence: orchestratorResponse.metadata.confidence,
      metadata: {
        sessionId: orchestratorResponse.metadata.sessionId,
        leadingSystem: orchestratorResponse.metadata.leadingSystem,
        processingTime: orchestratorResponse.metadata.processingTime,
        orchestrated: true
      }
    };
  } catch (error) {
    console.error('Orchestration error:', error);

    // Fallback response if orchestration fails
    return {
      message: "I'm here with you. Please continue.",
      element: 'water',
      confidence: 0.5,
      metadata: {
        sessionId: request.sessionId,
        orchestrated: false
      }
    };
  }
}

/**
 * Map ElementalArchetype enum to string
 */
function mapElementToString(element: ElementalArchetype): string {
  const mapping: Record<ElementalArchetype, string> = {
    [ElementalArchetype.FIRE]: 'fire',
    [ElementalArchetype.WATER]: 'water',
    [ElementalArchetype.EARTH]: 'earth',
    [ElementalArchetype.AIR]: 'air',
    [ElementalArchetype.AETHER]: 'aether'
  };
  return mapping[element] || 'water';
}

/**
 * Clean up inactive orchestrators
 */
export function cleanupOrchestrators(maxAge: number = 3600000): void {
  const now = Date.now();
  const toRemove: string[] = [];

  orchestrators.forEach((orchestrator, key) => {
    const sessions = orchestrator.getActiveSessions();
    if (sessions.length === 0) {
      toRemove.push(key);
    }
  });

  toRemove.forEach(key => {
    orchestrators.delete(key);
  });
}

// Cleanup every 30 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cleanupOrchestrators(), 1800000);
}