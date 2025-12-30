// @ts-nocheck - Prototype file, not type-checked
// backend: lib/ai/safe-local-model.ts

/**
 * SAFE LOCAL MODEL WRAPPER
 *
 * Safe wrapper around Local Model Client that never throws.
 * Part of the fail-soft consciousness architecture.
 * Returns null/fallback on error instead of crashing the entire pipeline.
 */

import {
  generateWithLocalModel,
  checkLocalModelHealth,
  initializeLocalModel,
  LocalChatParams
} from '@/lib/ai/localModelClient';

// Lazy initialization to avoid constructor issues
let localModelInitialized = false;

async function ensureLocalModelInitialized(): Promise<void> {
  if (!localModelInitialized) {
    try {
      await initializeLocalModel();
      localModelInitialized = true;
    } catch (err: any) {
      console.warn('Failed to initialize local model:', err?.message || err);
      // Don't throw - we'll try to use consciousness engine fallback
    }
  }
}

export interface SafeLocalModelParams extends LocalChatParams {
  fallbackToSimple?: boolean;
}

export interface SafeLocalModelResult {
  content: string;
  source: 'local-model' | 'consciousness-engine' | 'emergency-fallback';
  successful: boolean;
  metadata: {
    provider?: string;
    model?: string;
    processingTime: number;
    timestamp: string;
  };
}

/**
 * Safe wrapper around generateWithLocalModel()
 * Never throws. Returns fallback response on error.
 */
export async function safeGenerateWithLocalModel(params: SafeLocalModelParams): Promise<SafeLocalModelResult> {
  const startTime = Date.now();

  try {
    const { systemPrompt, userInput, meta, fallbackToSimple = true } = params;

    // Validate required parameters
    if (!systemPrompt || typeof systemPrompt !== 'string' ||
        !userInput || typeof userInput !== 'string') {
      return createEmergencyFallback(userInput || 'Hello', startTime);
    }

    // Ensure local model is initialized
    await ensureLocalModelInitialized();

    // Generate response with local model
    const response = await generateWithLocalModel({
      systemPrompt,
      userInput,
      meta
    });

    if (response && typeof response === 'string' && response.trim().length > 0) {
      return {
        content: response.trim(),
        source: 'local-model',
        successful: true,
        metadata: {
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
    }

    // If we got empty response, fall back
    if (fallbackToSimple) {
      return createSimpleFallback(userInput, startTime);
    }

    return createEmergencyFallback(userInput, startTime);

  } catch (err: any) {
    console.warn(
      'Local model generation failed, using fallback:',
      err?.message || err,
    );

    if (params.fallbackToSimple !== false) {
      return createSimpleFallback(params.userInput || 'Hello', startTime);
    }

    return createEmergencyFallback(params.userInput || 'Hello', startTime);
  }
}

/**
 * Safe wrapper around checkLocalModelHealth()
 * Never throws. Returns degraded status on error.
 */
export async function safeCheckLocalModelHealth(): Promise<{
  provider: string;
  model: string;
  status: 'healthy' | 'degraded' | 'offline';
  endpoint: string;
} | null> {
  try {
    const health = await checkLocalModelHealth();

    if (health && typeof health === 'object') {
      return health;
    }

    return null;
  } catch (err: any) {
    console.warn('Local model health check failed:', err?.message || err);
    return null;
  }
}

/**
 * Safe wrapper around initializeLocalModel()
 * Never throws. Returns boolean success status.
 */
export async function safeInitializeLocalModel(): Promise<boolean> {
  try {
    await initializeLocalModel();
    localModelInitialized = true;
    return true;
  } catch (err: any) {
    console.warn('Local model initialization failed:', err?.message || err);
    return false;
  }
}

/**
 * Comprehensive health check for local model system
 * Returns detailed status of local model capabilities
 */
export async function localModelHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'offline';
  capabilities: { [key: string]: 'available' | 'degraded' | 'missing' };
  provider: string | null;
  model: string | null;
  endpoint: string | null;
  lastCheck: string;
}> {
  const result = {
    status: 'offline' as const,
    capabilities: {
      'local-generation': 'missing' as const,
      'health-monitoring': 'missing' as const,
      'initialization': 'missing' as const,
      'fallback-engine': 'available' as const // Consciousness engine is always available
    },
    provider: null as string | null,
    model: null as string | null,
    endpoint: null as string | null,
    lastCheck: new Date().toISOString()
  };

  // Test initialization
  try {
    const initialized = await safeInitializeLocalModel();
    result.capabilities['initialization'] = initialized ? 'available' : 'degraded';
  } catch {
    result.capabilities['initialization'] = 'missing';
  }

  // Test health check
  try {
    const health = await safeCheckLocalModelHealth();
    if (health) {
      result.capabilities['health-monitoring'] = 'available';
      result.provider = health.provider;
      result.model = health.model;
      result.endpoint = health.endpoint;

      // Map health status to our status
      if (health.status === 'healthy') {
        result.status = 'healthy';
      } else if (health.status === 'degraded') {
        result.status = 'degraded';
      }
    } else {
      result.capabilities['health-monitoring'] = 'missing';
    }
  } catch {
    result.capabilities['health-monitoring'] = 'missing';
  }

  // Test actual generation with minimal test
  try {
    const testResult = await safeGenerateWithLocalModel({
      systemPrompt: 'You are a helpful AI assistant.',
      userInput: 'Hello',
      fallbackToSimple: false
    });

    if (testResult.successful && testResult.source === 'local-model') {
      result.capabilities['local-generation'] = 'available';
      if (result.status === 'offline') {
        result.status = 'healthy';
      }
    } else if (testResult.source === 'consciousness-engine') {
      result.capabilities['local-generation'] = 'degraded';
      if (result.status === 'offline') {
        result.status = 'degraded';
      }
    }
  } catch {
    result.capabilities['local-generation'] = 'missing';
  }

  return result;
}

/**
 * Get generation statistics (for monitoring)
 */
export function getLocalModelStats(): {
  initialized: boolean;
  totalRequests: number;
  successfulRequests: number;
  failureRate: number;
} {
  // This is a simple implementation - could be enhanced with actual tracking
  return {
    initialized: localModelInitialized,
    totalRequests: 0, // Could track this with a counter
    successfulRequests: 0, // Could track this with a counter
    failureRate: 0.0
  };
}

// HELPER FUNCTIONS

/**
 * Create a simple fallback response using consciousness engine patterns
 */
function createSimpleFallback(userInput: string, startTime: number): SafeLocalModelResult {
  // Basic response generation similar to consciousness engine
  const isQuestion = userInput.includes('?');
  const isGreeting = /hello|hi|hey/i.test(userInput);
  const isEmotional = /feel|emotion|heart|love|pain|joy|grief|angry|sad|happy/i.test(userInput);

  let fallbackContent: string;

  if (isGreeting) {
    fallbackContent = "Hello! I'm here and ready to support you with whatever you'd like to explore.";
  } else if (isEmotional) {
    fallbackContent = `I hear the depth in what you're sharing. When you express "${userInput}", there's wisdom that's present. What feels most important to honor right now?`;
  } else if (isQuestion) {
    fallbackContent = `That's a thoughtful question: "${userInput}". Let me reflect on this with you. What aspect feels most significant to you?`;
  } else {
    fallbackContent = `I'm present with what you're bringing: "${userInput}". There's often more beneath what we first notice. What draws your attention most strongly about this?`;
  }

  return {
    content: fallbackContent,
    source: 'consciousness-engine',
    successful: true,
    metadata: {
      provider: 'consciousness_engine',
      model: 'rule-based-patterns',
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Create emergency fallback when all else fails
 */
function createEmergencyFallback(userInput: string, startTime: number): SafeLocalModelResult {
  return {
    content: "I'm experiencing some difficulty processing right now, but I'm here with you. Could you try again or rephrase what you'd like to explore?",
    source: 'emergency-fallback',
    successful: false,
    metadata: {
      provider: 'emergency',
      model: 'hardcoded-fallback',
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Reset local model state (for debugging/testing)
 */
export function resetLocalModelState(): void {
  localModelInitialized = false;
}

/**
 * Get current local model instance status (for debugging/testing)
 */
export function getLocalModelInstanceStatus(): {
  initialized: boolean;
} {
  return {
    initialized: localModelInitialized
  };
}