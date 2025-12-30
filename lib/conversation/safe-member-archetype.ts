// @ts-nocheck
// backend: lib/conversation/safe-member-archetype.ts

/**
 * SAFE MEMBER ARCHETYPE WRAPPER
 *
 * Safe wrapper around the Member Archetype System that never throws.
 * Part of the fail-soft consciousness architecture.
 * Returns null on error instead of crashing the entire pipeline.
 */

// Lazy initialization to avoid constructor issues
let archetypeSystem: any = null;

async function getArchetypeSystem() {
  if (!archetypeSystem) {
    try {
      // Dynamic import to avoid initialization issues
      archetypeSystem = await import('@/lib/consciousness/member-archetype-system');
    } catch (err: any) {
      console.warn('Failed to initialize member archetype system:', err?.message || err);
      throw new Error('Member archetype system initialization failed');
    }
  }
  return archetypeSystem;
}

export interface ArchetypeDetectionParams {
  input: string;
  response: string;
  sessionId: string;
}

export interface ArchetypeAdaptationParams {
  archetype: string;
  baseText: string;
}

/**
 * Safe wrapper around detectMemberArchetype()
 * Never throws. Returns null on error.
 */
export async function safeDetectMemberArchetype(params: ArchetypeDetectionParams): Promise<string | null> {
  try {
    const { input, response, sessionId } = params;

    // Validate required parameters
    if (!input || typeof input !== 'string' || !response || typeof response !== 'string' || !sessionId) {
      return null;
    }

    const archetypeSystem = await getArchetypeSystem();

    // Check if the function exists and is callable
    if (typeof archetypeSystem.detectMemberArchetype !== 'function') {
      console.warn('detectMemberArchetype function not found or not callable');
      return null;
    }

    const archetype = await archetypeSystem.detectMemberArchetype({
      input,
      response,
      sessionId,
    });

    // Validate result
    if (archetype && typeof archetype === 'string' && archetype.trim().length > 0) {
      return archetype;
    }

    return null;
  } catch (err: any) {
    console.warn(
      'Member archetype detection failed, continuing without it:',
      err?.message || err,
    );
    return null;
  }
}

/**
 * Safe wrapper around adaptForArchetype()
 * Never throws. Returns null on error.
 */
export async function safeAdaptForArchetype(params: ArchetypeAdaptationParams): Promise<string | null> {
  try {
    const { archetype, baseText } = params;

    // Validate required parameters
    if (!archetype || typeof archetype !== 'string' || !baseText || typeof baseText !== 'string') {
      return null;
    }

    const archetypeSystem = await getArchetypeSystem();

    // Check if the function exists and is callable
    if (typeof archetypeSystem.adaptForArchetype !== 'function') {
      console.warn('adaptForArchetype function not found or not callable');
      return null;
    }

    const adaptedText = await archetypeSystem.adaptForArchetype({
      archetype,
      baseText,
    });

    // Validate result - must be different from base text and meaningful
    if (adaptedText &&
        typeof adaptedText === 'string' &&
        adaptedText.trim().length > 0 &&
        adaptedText !== baseText) {
      return adaptedText;
    }

    return null;
  } catch (err: any) {
    console.warn(
      'Member archetype adaptation failed, continuing without it:',
      err?.message || err,
    );
    return null;
  }
}

/**
 * Safe combined archetype detection and adaptation
 * Returns both original and adapted text, with archetype info
 */
export async function safeFullArchetypeProcessing(
  input: string,
  baseResponse: string,
  sessionId: string
): Promise<{
  archetype: string | null;
  originalText: string;
  adaptedText: string | null;
  adapted: boolean;
}> {
  const result = {
    archetype: null as string | null,
    originalText: baseResponse,
    adaptedText: null as string | null,
    adapted: false
  };

  try {
    // Step 1: Detect archetype
    const archetype = await safeDetectMemberArchetype({
      input,
      response: baseResponse,
      sessionId
    });

    result.archetype = archetype;

    // Step 2: If archetype detected, attempt adaptation
    if (archetype) {
      const adaptedText = await safeAdaptForArchetype({
        archetype,
        baseText: baseResponse
      });

      if (adaptedText) {
        result.adaptedText = adaptedText;
        result.adapted = true;
      }
    }
  } catch (err: any) {
    console.warn('Full archetype processing failed:', err?.message || err);
    // Result already initialized with safe defaults
  }

  return result;
}

/**
 * Get current archetype system instance (for debugging/testing)
 */
export function getArchetypeSystemInstance() {
  return archetypeSystem;
}

/**
 * Health check for archetype system
 */
export async function archetypeSystemHealthCheck(): Promise<{
  status: 'ok' | 'error';
  functions: { [key: string]: 'available' | 'missing' };
}> {
  try {
    const system = await getArchetypeSystem();

    const functions = {
      detectMemberArchetype: typeof system.detectMemberArchetype === 'function' ? 'available' : 'missing',
      adaptForArchetype: typeof system.adaptForArchetype === 'function' ? 'available' : 'missing'
    };

    const allAvailable = Object.values(functions).every(status => status === 'available');

    return {
      status: allAvailable ? 'ok' : 'error',
      functions
    };
  } catch (err: any) {
    console.warn('Archetype system health check failed:', err?.message || err);
    return {
      status: 'error',
      functions: {
        detectMemberArchetype: 'missing',
        adaptForArchetype: 'missing'
      }
    };
  }
}