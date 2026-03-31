/**
 * CM Layer Detector — Hybrid Intent Detection & Signal Storage
 *
 * Detects which perceptual layer the practitioner is invoking, using:
 *   1. Explicit invocation keywords ("show me the energy pattern")
 *   2. Semantic cues (somatic language, dream imagery, etc.)
 *
 * Auto-decay: detection applies to the current response only.
 * The oracle route does NOT persist the detected layer — it reverts
 * to weave next turn unless the practitioner reinforces.
 *
 * Fire-and-forget signal storage follows participatoryRealityHelper pattern.
 */

import { query } from '@/lib/db/postgres';
import type { CMPerceptualLayer } from './cmPractitionerEnvironment';

// ─────────────────────────────────────────────────────────────────────────────
// Language Markers (hybrid: explicit invocations + semantic cues)
// ─────────────────────────────────────────────────────────────────────────────

interface LayerMarkers {
  /** Direct invocations — high confidence */
  explicit: string[];
  /** Semantic cues — lower confidence, needs multiple matches */
  semantic: string[];
}

const LAYER_MARKERS: Record<CMPerceptualLayer, LayerMarkers> = {
  energy: {
    explicit: [
      'energy pattern', 'energy layer', 'show me the qi',
      'what\'s the energy', 'energetic', 'from an energy perspective',
      'five element', 'wu xing', 'organ spirit',
    ],
    semantic: [
      'qi', 'chi', 'stagnation', 'stagnant', 'meridian', 'deficient', 'excess',
      'yin', 'yang', 'liver qi', 'heart fire', 'kidney water',
      'wood element', 'metal element', 'dampness', 'dryness',
      'shen', 'hun', 'po', 'yi ', 'zhi',
      'flow', 'blocked energy', 'depleted', 'overactive',
      'jing', 'wei qi', 'blood stasis', 'phlegm',
    ],
  },
  symbolic: {
    explicit: [
      'archetypal', 'archetype', 'symbolic layer', 'mythic',
      'what\'s the symbol', 'show me the shadow', 'depth layer',
      'shamanic', 'underworld', 'upperworld',
    ],
    semantic: [
      'dream', 'dreaming', 'dreamt', 'image', 'vision',
      'shadow', 'projection', 'disowned', 'unconscious',
      'myth', 'story', 'narrative', 'descent',
      'transformation', 'death and rebirth', 'initiation',
      'ancestor', 'spirit', 'soul loss', 'soul retrieval',
      'nigredo', 'albedo', 'rubedo', 'alchemy',
    ],
  },
  embodiment: {
    explicit: [
      'somatic', 'body layer', 'embodiment', 'felt sense',
      'what does the body say', 'body wisdom', 'nervous system',
    ],
    semantic: [
      'chest', 'throat', 'belly', 'gut', 'tension',
      'tightness', 'heaviness', 'lightness', 'numbness',
      'tingling', 'warmth', 'cold', 'shaking', 'trembling',
      'bracing', 'holding', 'armored', 'collapsed',
      'fight or flight', 'freeze', 'shutdown', 'dysregulated',
      'grounded', 'ungrounded', 'dizzy', 'spacey',
      'breath', 'breathing', 'heart racing', 'clenching',
    ],
  },
  integration: {
    explicit: [
      'integration', 'meaning', 'wu wei', 'what does this mean',
      'how do i integrate', 'action pathway', 'what to do with this',
      'alignment', 'non-forcing',
    ],
    semantic: [
      'making sense', 'putting together', 'connecting',
      'forcing', 'pushing', 'letting go', 'surrender',
      'next step', 'action', 'practical', 'apply',
      'timing', 'readiness', 'patience', 'yielding',
      'purpose', 'direction', 'path', 'way forward',
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Detection
// ─────────────────────────────────────────────────────────────────────────────

interface LayerDetection {
  layer: CMPerceptualLayer | null;
  confidence: number;
  source: 'explicit' | 'semantic' | 'none';
}

/**
 * Detect which perceptual layer the practitioner is invoking.
 * Returns null layer if no clear signal detected.
 *
 * Scoring:
 *   - Explicit match: confidence 0.85+ (one match is enough)
 *   - Semantic match: needs 2+ cues, confidence scales with count
 *   - Threshold for activation: 0.5
 */
export function detectLayerIntent(message: string): LayerDetection {
  const lower = message.toLowerCase();

  const scores: Record<CMPerceptualLayer, { explicit: number; semantic: number }> = {
    energy: { explicit: 0, semantic: 0 },
    symbolic: { explicit: 0, semantic: 0 },
    embodiment: { explicit: 0, semantic: 0 },
    integration: { explicit: 0, semantic: 0 },
  };

  const layers: CMPerceptualLayer[] = ['energy', 'symbolic', 'embodiment', 'integration'];

  for (const layer of layers) {
    const markers = LAYER_MARKERS[layer];

    // Explicit matches — high confidence
    for (const phrase of markers.explicit) {
      if (lower.includes(phrase)) {
        scores[layer].explicit += 1;
      }
    }

    // Semantic cues — accumulate
    for (const cue of markers.semantic) {
      if (lower.includes(cue)) {
        scores[layer].semantic += 1;
      }
    }
  }

  // Find strongest explicit signal
  let bestExplicit: CMPerceptualLayer | null = null;
  let bestExplicitCount = 0;

  for (const layer of layers) {
    if (scores[layer].explicit > bestExplicitCount) {
      bestExplicitCount = scores[layer].explicit;
      bestExplicit = layer;
    }
  }

  if (bestExplicit && bestExplicitCount > 0) {
    return {
      layer: bestExplicit,
      confidence: Math.min(0.85 + bestExplicitCount * 0.05, 0.98),
      source: 'explicit',
    };
  }

  // Find strongest semantic signal (needs 2+ cues)
  let bestSemantic: CMPerceptualLayer | null = null;
  let bestSemanticCount = 0;

  for (const layer of layers) {
    if (scores[layer].semantic > bestSemanticCount && scores[layer].semantic >= 2) {
      bestSemanticCount = scores[layer].semantic;
      bestSemantic = layer;
    }
  }

  if (bestSemantic) {
    const confidence = Math.min(0.4 + bestSemanticCount * 0.12, 0.82);
    if (confidence >= 0.5) {
      return {
        layer: bestSemantic,
        confidence,
        source: 'semantic',
      };
    }
  }

  return { layer: null, confidence: 0, source: 'none' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Fire-and-Forget Signal Storage
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Store a CM layer signal. Fire-and-forget — returns void, never blocks oracle.
 * Follows the same pattern as participatoryRealityHelper.storeThemeSignal().
 */
export function storeCMLayerSignal(
  memberId: string,
  layer: CMPerceptualLayer,
  opts: {
    signalType?: string;
    resonanceStrength?: number;
    context?: string;
  } = {}
): void {
  const sql = `
    INSERT INTO member_cm_layer_signals (
      member_id, layer, signal_type, resonance_strength, context
    ) VALUES ($1, $2, $3, $4, $5)
  `;

  query(sql, [
    memberId,
    layer,
    opts.signalType ?? 'active',
    opts.resonanceStrength ?? 0.5,
    opts.context ?? null,
  ]).catch((error) => {
    // Swallow — layer signal storage must never break oracle response
    console.warn('[cm-environment] Failed to store layer signal:', {
      memberId,
      layer,
      error: error instanceof Error ? error.message : String(error),
    });
  });
}
