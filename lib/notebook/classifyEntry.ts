/**
 * Heuristic Entry Classifier — Zero-latency, no LLM call.
 *
 * Classification is stored but never final — JSONB supports reclassification
 * by future LLM pass (Phase 3). This is the v1 heuristic baseline.
 */

import type { EntryType, EntryClassification } from './types';

// ═══════════════════════════════════════════════════════════════
// Marker Sets (order matters — first match with highest score wins)
// ═══════════════════════════════════════════════════════════════

interface MarkerRule {
  type: EntryType;
  markers: RegExp[];
  /** Base confidence when matched (0-1) */
  baseConfidence: number;
}

const MARKER_RULES: MarkerRule[] = [
  {
    type: 'task',
    markers: [
      /\b(todo|to-do)\b/i,
      /\bneed to\b/i,
      /\bmust\b/i,
      /\bshould\b/i,
      /\bfollow up\b/i,
      /\bfollow-up\b/i,
      /\baction\s*:/i,
      /\bremember to\b/i,
      /\bschedule\b/i,
      /\bsend\b/i,
      /\bcall\b/i,
      /\bbook\b/i,
      /\bprepare\b/i,
      /\bcheck (with|on|in)\b/i,
    ],
    baseConfidence: 0.7,
  },
  {
    type: 'decision',
    markers: [
      /\bdecided\b/i,
      /\bdecision\s*:/i,
      /\bgoing to\b/i,
      /\bcommitted to\b/i,
      /\bwe('re| are) going with\b/i,
      /\bchose\b/i,
      /\bwill (go|use|try|start|stop)\b/i,
      /\bfinal (call|answer|choice)\b/i,
    ],
    baseConfidence: 0.65,
  },
  {
    type: 'insight',
    markers: [
      /\brealized\b/i,
      /\binsight\s*:/i,
      /\bnoticed (that|how)\b/i,
      /\bpattern\s*:/i,
      /\baha\b/i,
      /\bit (hit|struck|dawned on) me\b/i,
      /\bconnection (between|here)\b/i,
      /\bwhat if\b/i,
      /\bnow I (see|understand|get)\b/i,
    ],
    baseConfidence: 0.6,
  },
  {
    type: 'reminder',
    markers: [
      /\bremind me\b/i,
      /\bdon'?t forget\b/i,
      /\bcheck back\b/i,
      /\bby (tomorrow|monday|tuesday|wednesday|thursday|friday|next week)\b/i,
      /\bdue (by|on|date)\b/i,
      /\bdeadline\b/i,
      /\bbefore (the|next)\b/i,
    ],
    baseConfidence: 0.7,
  },
  {
    type: 'pattern',
    markers: [
      /\bkeeps (happening|coming up|recurring)\b/i,
      /\bsame (thing|pattern|cycle)\b/i,
      /\bagain and again\b/i,
      /\brecurring\b/i,
      /\bevery time\b/i,
      /\bI (always|keep|tend to)\b/i,
    ],
    baseConfidence: 0.55,
  },
];

// ═══════════════════════════════════════════════════════════════
// Tag Extraction
// ═══════════════════════════════════════════════════════════════

const TAG_PATTERNS: { tag: string; pattern: RegExp }[] = [
  { tag: 'follow-up', pattern: /\bfollow[- ]?up\b/i },
  { tag: 'urgent', pattern: /\burgent\b/i },
  { tag: 'important', pattern: /\bimportant\b/i },
  { tag: 'blocked', pattern: /\bblocked\b/i },
  { tag: 'waiting', pattern: /\bwaiting (for|on)\b/i },
  { tag: 'idea', pattern: /\bidea\b/i },
  { tag: 'question', pattern: /\bquestion\b/i },
  { tag: 'personal', pattern: /\b(personal|myself|my own)\b/i },
];

function extractTags(content: string): string[] {
  const tags: string[] = [];
  for (const { tag, pattern } of TAG_PATTERNS) {
    if (pattern.test(content)) {
      tags.push(tag);
    }
  }
  return tags;
}

// ═══════════════════════════════════════════════════════════════
// Classifier
// ═══════════════════════════════════════════════════════════════

/**
 * Classify an entry based on content heuristics.
 * Returns classification metadata — never throws.
 *
 * Classification is re-runnable: call again with updated content
 * and overwrite the stored JSONB.
 */
export function classifyEntry(content: string): EntryClassification {
  const lowerContent = content.toLowerCase();

  let bestType: EntryType = 'note';
  let bestConfidence = 0;
  let matchCount = 0;

  for (const rule of MARKER_RULES) {
    let ruleMatches = 0;
    for (const marker of rule.markers) {
      if (marker.test(content)) {
        ruleMatches++;
      }
    }

    if (ruleMatches > 0) {
      // More matches = higher confidence (diminishing returns)
      const confidence = Math.min(
        rule.baseConfidence + (ruleMatches - 1) * 0.08,
        0.95,
      );

      if (confidence > bestConfidence) {
        bestType = rule.type;
        bestConfidence = confidence;
        matchCount = ruleMatches;
      }
    }
  }

  // If nothing matched, it's a note with low confidence
  if (matchCount === 0) {
    bestConfidence = 0.3;
  }

  return {
    confidence: Math.round(bestConfidence * 100) / 100,
    detected_type: bestType,
    detected_tags: extractTags(content),
    model: 'heuristic-v1',
  };
}
