// backend: lib/consciousness/safe-gebser.ts

/**
 * SAFE GEBSER WRAPPER
 *
 * Safe wrapper around GebserStructureDetector that never throws.
 * Part of the fail-soft consciousness architecture.
 * Returns null on error instead of crashing the entire pipeline.
 */

import { GebserStructureDetector } from '@/lib/consciousness/gebser-structure-detector';

// Lazy initialization to avoid constructor issues
let gebserDetector: GebserStructureDetector | null = null;

async function getGebserDetector(): Promise<GebserStructureDetector> {
  if (!gebserDetector) {
    try {
      gebserDetector = new GebserStructureDetector();
    } catch (err: any) {
      console.warn('Failed to initialize Gebser detector:', err?.message || err);
      throw new Error('Gebser detector initialization failed');
    }
  }
  return gebserDetector;
}

export interface SafeGebserParams {
  message: string;
  userId?: string;
  sessionId?: string;
  conversationHistory?: any[];
}

/**
 * Safe wrapper around GebserStructureDetector.analyzeMessage()
 * Never throws. Returns null on error.
 */
export async function safeGebserAnalysis(params: SafeGebserParams | string) {
  try {
    // Handle both object and string params for backward compatibility
    const message = typeof params === 'string' ? params : params.message;

    if (!message || typeof message !== 'string') {
      return null;
    }

    const detector = await getGebserDetector();

    // Use analyzeMessage method (confirmed from gebser-structure-detector.ts:151)
    const analysis = detector.analyzeMessage(message);

    if (analysis && typeof analysis === 'object') {
      return analysis;
    }

    return null;
  } catch (err: any) {
    console.warn(
      'Gebser analysis failed, continuing without it:',
      err?.message || err,
    );
    return null;
  }
}

/**
 * Get current Gebser detector instance (for debugging/testing)
 */
export function getGebserDetectorInstance() {
  return gebserDetector;
}