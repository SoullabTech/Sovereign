/**
 * Content Guards — Post-parse quality validation for parent update drafts
 *
 * Schema catches structure. Content guards catch tone, jargon, and AI leakage.
 */

import type { ParentUpdateBlocks } from './schema';
import type { FollowupTone } from './schema';

// ---------------------------------------------------------------------------
// Forbidden patterns — AI leakage, clinical process language
// ---------------------------------------------------------------------------

const FORBIDDEN_PATTERNS: RegExp[] = [
  /\bAI\b/,
  /\btranscript\b/i,
  /\banalysis\b/i,
  /\bmodel\b/i,
  /\bprompt\b/i,
  /\bdata suggests\b/i,
  /\bappears to indicate\b/i,
  /\bSOAP\b/,
  /\bgenerat(ed|ion)\b/i,
];

// ---------------------------------------------------------------------------
// Jargon patterns — clinical language parents shouldn't see
// ---------------------------------------------------------------------------

const JARGON_PATTERNS: RegExp[] = [
  /\bdysregulat(ed|ion)\b/i,
  /\bco-regulat(e|ion)\b/i,
  /\bproprioceptive\b/i,
  /\binteroceptive\b/i,
  /\bexecutive function\b/i,
  /\baffect\b/i,
  /\bclinical\b/i,
  /\btherapeutic\b/i,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function totalWordCount(blocks: ParentUpdateBlocks): number {
  return [
    blocks.whatWeWorkedOn,
    blocks.whatINoticed,
    blocks.whatMayHelpThisWeek,
    blocks.whatToWatchFor ?? '',
  ]
    .map(wordCount)
    .reduce((a, b) => a + b, 0);
}

function toneRangeOk(tone: FollowupTone, words: number): boolean {
  if (tone === 'brief') return words >= 80 && words <= 190;
  if (tone === 'standard') return words >= 140 && words <= 300;
  return words >= 180 && words <= 380;
}

// ---------------------------------------------------------------------------
// Main validation
// ---------------------------------------------------------------------------

export interface ContentValidationResult {
  ok: boolean;
  reasons: string[];
  shouldRegenerate?: boolean;
}

export function validateFollowupContent(
  blocks: ParentUpdateBlocks,
  tone: FollowupTone,
): ContentValidationResult {
  const reasons: string[] = [];

  const allText = [
    blocks.whatWeWorkedOn,
    blocks.whatINoticed,
    blocks.whatMayHelpThisWeek,
    blocks.whatToWatchFor ?? '',
  ].join('\n');

  // Check forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(allText)) {
      reasons.push(`Forbidden phrase matched: ${pattern}`);
    }
  }

  // Check jargon
  for (const pattern of JARGON_PATTERNS) {
    if (pattern.test(allText)) {
      reasons.push(`Jargon matched: ${pattern}`);
    }
  }

  // Word count range
  const words = totalWordCount(blocks);
  if (!toneRangeOk(tone, words)) {
    reasons.push(`Word count ${words} is out of range for tone "${tone}"`);
  }

  // Voice checks — ensure it sounds practitioner-authored
  if (!/we worked on|today we|in this session|in our session/i.test(blocks.whatWeWorkedOn)) {
    reasons.push('whatWeWorkedOn should sound session-based and parent-facing');
  }

  if (!/i noticed|i saw|i observed|he responded|she responded|they responded/i.test(blocks.whatINoticed)) {
    reasons.push('whatINoticed should sound observational, not abstract');
  }

  if (!/may help|you might try|this week you could|it may help|you could try/i.test(blocks.whatMayHelpThisWeek)) {
    reasons.push('whatMayHelpThisWeek should contain practical, gentle suggestions');
  }

  // whatToWatchFor length cap
  if (blocks.whatToWatchFor && wordCount(blocks.whatToWatchFor) > 45) {
    reasons.push('whatToWatchFor is too long');
  }

  const shouldRegenerate = reasons.length > 0 &&
    reasons.some(r => r.includes('Forbidden') || r.includes('Jargon') || r.includes('out of range'));

  return reasons.length
    ? { ok: false, reasons, shouldRegenerate }
    : { ok: true, reasons: [] };
}

// ---------------------------------------------------------------------------
// Minimum content check (for the route)
// ---------------------------------------------------------------------------

export function hasMinimumFollowupContent(blocks: ParentUpdateBlocks): boolean {
  const words = totalWordCount(blocks);
  return words >= 40;
}
