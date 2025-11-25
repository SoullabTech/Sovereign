// lib/voice/guardrails.ts
// Privacy guardrails and safety checks for collective listening

import { SymbolicSignal, CollectiveSnapshot, PersonalUtterance } from './types';

/**
 * Assert that a symbolic signal contains no PII
 * Throws if any personal information is detected
 */
export function assertSymbolSafe(sig: SymbolicSignal) {
  const json = JSON.stringify(sig).toLowerCase();

  // PII detection patterns
  const piiPatterns = [
    /(\+?\d[\d\-\s]{7,}\d)/,              // Phone numbers
    /\b(ssn|social|passport|license)\b/,   // ID keywords
    /@/,                                    // Email addresses
    /\b\d{3}-?\d{2}-?\d{4}\b/,            // SSN format
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/,        // Potential names (careful with this)
    /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|drive|dr|lane|ln)\b/i, // Addresses
    /\b(visa|mastercard|amex|\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/i, // Credit cards
  ];

  for (const pattern of piiPatterns) {
    if (pattern.test(json)) {
      console.error(`PII-like content detected in SymbolicSignal: ${pattern}`);
      throw new Error("PII-like content in SymbolicSignal - privacy boundary violated");
    }
  }

  // Check for raw text leakage
  if (sig.motifs.some(m => m.length > 20)) {
    throw new Error("Motif too long - possible raw text leakage");
  }

  // Ensure controlled vocabulary
  const allowedMotifs = [
    'threshold', 'release', 'grief', 'initiate', 'anchor',
    'flow', 'clarify', 'ground', 'integrate', 'transform',
    'question', 'witness', 'hold', 'explore', 'celebrate',
    'return', 'spiral', 'emerge', 'dissolve', 'create'
  ];

  for (const motif of sig.motifs) {
    if (!allowedMotifs.includes(motif)) {
      console.warn(`Unknown motif "${motif}" - should be in controlled vocabulary`);
    }
  }

  return true; // Safe
}

/**
 * Floor collective insights to prevent low-confidence emissions
 */
export function floorCollective(
  snapshot: CollectiveSnapshot,
  options: { minSessions?: number; minConfidence?: number } = {}
) {
  const { minSessions = 5, minConfidence = 0.6 } = options;

  // Extract session count from metadata (would be added to snapshot)
  const sessions = (snapshot as any)._meta?.sessionCount ??
                   snapshot.topMotifs.reduce((sum, m) => sum + m.count, 0);

  // Calculate peak element intensity
  const peak = Math.max(...snapshot.elements.map(e => e.avg), 0);

  // Check thresholds
  if (sessions < minSessions) {
    console.log(`Collective insight suppressed: only ${sessions}/${minSessions} sessions`);
    return null;
  }

  if (peak < minConfidence) {
    console.log(`Collective insight suppressed: confidence ${peak.toFixed(2)} < ${minConfidence}`);
    return null;
  }

  // Check for meaningful coherence
  if (snapshot.resonanceField.coherence < 0.4) {
    console.log(`Collective insight suppressed: coherence too low (${snapshot.resonanceField.coherence.toFixed(2)})`);
    return null;
  }

  return snapshot;
}

/**
 * Sanitize utterance before any processing
 * Removes obvious PII patterns
 */
export function sanitizeUtterance(text: string): string {
  // Replace phone numbers
  let sanitized = text.replace(/(\+?\d[\d\-\s]{7,}\d)/g, '[PHONE]');

  // Replace email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');

  // Replace SSN-like patterns
  sanitized = sanitized.replace(/\b\d{3}-?\d{2}-?\d{4}\b/g, '[ID]');

  // Replace credit card numbers
  sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');

  // Replace explicit personal references
  sanitized = sanitized.replace(/\b(my name is|i am|call me)\s+\S+/gi, '[NAME]');

  // Replace addresses
  sanitized = sanitized.replace(/\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|drive|dr|lane|ln)\b/gi, '[ADDRESS]');

  return sanitized;
}

/**
 * Validate wake word detection to reduce false positives
 */
export function validateWakeWord(
  confidence: number,
  contextualHints: { hasTV?: boolean; hasMusic?: boolean; crowded?: boolean } = {}
): { valid: boolean; needsConfirmation: boolean } {
  // Adjust threshold based on environment
  let threshold = 0.5;

  if (contextualHints.hasTV || contextualHints.hasMusic) {
    threshold = 0.7; // Higher threshold in noisy environments
  }

  if (contextualHints.crowded) {
    threshold = 0.8; // Even higher in crowds
  }

  const valid = confidence >= threshold;
  const needsConfirmation = valid && confidence < threshold + 0.15; // Soft confirm zone

  return { valid, needsConfirmation };
}

/**
 * Battery-aware session management
 */
export function getBatteryAwareConfig(batteryLevel: number): {
  vadSensitivity: number;
  alwaysOn: boolean;
  maxSessionMinutes: number;
} {
  if (batteryLevel < 0.2) {
    // Low battery: conservative mode
    return {
      vadSensitivity: 0.7, // Less sensitive, fewer wakeups
      alwaysOn: false,     // Push-to-talk only
      maxSessionMinutes: 5
    };
  }

  if (batteryLevel < 0.5) {
    // Medium battery: balanced
    return {
      vadSensitivity: 0.5,
      alwaysOn: true,
      maxSessionMinutes: 15
    };
  }

  // Good battery: full features
  return {
    vadSensitivity: 0.3,
    alwaysOn: true,
    maxSessionMinutes: 30
  };
}

/**
 * Latency tracking for E2E timing
 */
export class LatencyTracker {
  private marks = new Map<string, number>();

  mark(event: string) {
    this.marks.set(event, Date.now());
  }

  measure(from: string, to: string): number {
    const start = this.marks.get(from);
    const end = this.marks.get(to);

    if (!start || !end) return -1;
    return end - start;
  }

  getE2ELatency(): number {
    return this.measure('speech-end', 'tts-start');
  }

  logTimings() {
    console.log('Voice Latency Breakdown:');
    console.log(`  STT: ${this.measure('speech-end', 'transcript-ready')}ms`);
    console.log(`  Processing: ${this.measure('transcript-ready', 'llm-start')}ms`);
    console.log(`  LLM: ${this.measure('llm-start', 'llm-complete')}ms`);
    console.log(`  TTS: ${this.measure('llm-complete', 'tts-start')}ms`);
    console.log(`  Total E2E: ${this.getE2ELatency()}ms`);

    // Alert if over budget
    const e2e = this.getE2ELatency();
    if (e2e > 800) {
      console.warn(`⚠️ E2E latency ${e2e}ms exceeds 800ms target`);
    }
  }

  reset() {
    this.marks.clear();
  }
}

/**
 * Privacy audit logger
 */
export function logPrivacyAudit(action: string, details: any) {
  const audit = {
    timestamp: Date.now(),
    action,
    details,
    checksums: {
      symbolExtractorVersion: '1.0.0',
      controlledVocabHash: 'abc123', // Would be real hash
    }
  };

  // In production, send to audit service
  console.log('[PRIVACY AUDIT]', audit);

  // Also could write to local encrypted log
  if (typeof window !== 'undefined') {
    const audits = JSON.parse(localStorage.getItem('privacyAudits') || '[]');
    audits.push(audit);

    // Keep last 100 audits
    if (audits.length > 100) {
      audits.splice(0, audits.length - 100);
    }

    localStorage.setItem('privacyAudits', JSON.stringify(audits));
  }

  return audit;
}

/**
 * Chaos testing helper - simulate failures
 */
export class ChaosMonkey {
  constructor(private enabled = false) {}

  maybeKill(component: string, probability = 0.1): boolean {
    if (!this.enabled) return false;

    if (Math.random() < probability) {
      console.warn(`🐒 CHAOS: Killing ${component}`);
      return true;
    }
    return false;
  }

  maybeDelay(ms: number, probability = 0.1): Promise<void> {
    if (!this.enabled) return Promise.resolve();

    if (Math.random() < probability) {
      console.warn(`🐒 CHAOS: Delaying ${ms}ms`);
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    return Promise.resolve();
  }

  maybeCorrupt<T>(data: T, probability = 0.05): T {
    if (!this.enabled) return data;

    if (Math.random() < probability) {
      console.warn(`🐒 CHAOS: Corrupting data`);

      // Corrupt in various ways
      if (typeof data === 'string') {
        return (data.substring(0, data.length / 2) + '...corrupted') as T;
      }
      if (Array.isArray(data)) {
        return data.slice(0, 1) as T;
      }
      if (typeof data === 'object' && data !== null) {
        return { ...data, corrupted: true } as T;
      }
    }

    return data;
  }

  enable() {
    this.enabled = true;
    console.warn('🐒 CHAOS MONKEY ENABLED');
  }

  disable() {
    this.enabled = false;
  }
}

// Export singleton for chaos testing
export const chaos = new ChaosMonkey(process.env.CHAOS_MODE === 'true');