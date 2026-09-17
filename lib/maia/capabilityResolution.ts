/**
 * MAIA-NODE-03 — intent → capability → canonical destination.
 *
 * Pure. No React, no network, no model, no state. Everything here is a lookup
 * over governed metadata, which is what makes it testable and what keeps MAIA's
 * knowledge of the house MECHANICAL rather than remembered.
 *
 * ── The three separations this module exists to preserve ──────────────────
 *
 *   intent resolution  ≠  permission  ≠  execution        (MAIA-NODE-02 §6)
 *
 * A matched phrase resolves a capability. It does NOT authorize anything.
 * `resolveDestination` is the permission step and refuses anything not
 * explicitly `executable`; the caller performs execution through the House's
 * own `dispatchHouseDestination`. Nothing here navigates.
 *
 * ── Why matching is deliberately conservative ─────────────────────────────
 *
 * MAIA-NODE-03 §6: conversation must not become a switchboard. "I'm worried
 * about Sophie" mentions a relationship and must NOT open Relationships —
 * MAIA may simply stay. So a navigation intent requires a whole authored
 * PHRASE ("open relationships", "take me to my journal"), never the bare
 * presence of a destination noun. Recognition is narrow on purpose: a missed
 * routing opportunity costs a sentence, an unwanted one interrupts a person
 * mid-thought.
 *
 * ⛔ No route literal appears in this file. Paths, native policy and the web
 * bridge belong to HOUSE_DESTINATIONS and are never restated here.
 */

import {
  CAPABILITY_REGISTRY,
  type CapabilityDefinition,
  type MaiaCapability,
} from './capabilities';
import { getDestination, type HouseDestination } from '@/lib/navigation/houseDestinations';

/** Lowercase, strip punctuation, collapse whitespace. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Capabilities that are navigational AND carry a destination. */
export function navigationCapabilities(): CapabilityDefinition[] {
  return CAPABILITY_REGISTRY.filter(
    (c) => c.operationClass === 'NAVIGATE' && Boolean(c.destinationId),
  );
}

/**
 * Is this capability executable right now?
 *
 * ⭐ Absence is NOT permission. A capability with no `availability` is treated
 * as `unknown` and refused, so a field nobody filled in can never become an
 * accidental grant.
 */
export function isExecutable(c: CapabilityDefinition): boolean {
  return c.availability?.state === 'executable';
}

/**
 * Resolve a navigation intent from what the member actually said.
 *
 * Requires a full authored phrase to appear in the utterance. Returns `null`
 * for ordinary conversation, which is the common and correct case.
 */
export function resolveNavigationIntent(utterance: string): CapabilityDefinition | null {
  const text = normalize(utterance);
  if (!text) return null;

  let best: { cap: CapabilityDefinition; len: number } | null = null;
  for (const cap of navigationCapabilities()) {
    for (const phrase of cap.voicePhrases) {
      const p = normalize(phrase);
      if (!p || !text.includes(p)) continue;
      // Longest authored phrase wins, so "take me to my journal" is not
      // decided by a shorter phrase that happens to also match.
      if (!best || p.length > best.len) best = { cap, len: p.length };
    }
  }
  return best?.cap ?? null;
}

/**
 * The permission step: the canonical destination for a capability, or `null`.
 *
 * Refuses when the capability is not executable, carries no destination, or
 * names a destination the House does not register. ⛔ It never synthesizes a
 * path — an unknown id is a refusal, not a guess.
 */
export function resolveDestination(id: MaiaCapability): HouseDestination | null {
  const cap = CAPABILITY_REGISTRY.find((c) => c.id === id);
  if (!cap || !isExecutable(cap) || !cap.destinationId) return null;
  return getDestination(cap.destinationId) ?? null;
}

/** Convenience: intent straight through to a destination, or `null`. */
export function resolveNavigationTarget(
  utterance: string,
): { capability: CapabilityDefinition; destination: HouseDestination } | null {
  const capability = resolveNavigationIntent(utterance);
  if (!capability) return null;
  const destination = resolveDestination(capability.id);
  return destination ? { capability, destination } : null;
}

// ── ORIENT ─────────────────────────────────────────────────────────────────

/**
 * Orientation questions. Matching these must NEVER navigate: answering "what is
 * Living Field for?" by moving the member somewhere is not an answer.
 */
const ORIENT_PATTERNS: RegExp[] = [
  /\bwhat (?:is|are|s)\b.*\bfor\b/,
  /\bwhat (?:is|are|s)\s+(?:my\s+|the\s+)?[a-z' ]+\??$/,
  /\bwhat can i (?:use|do with)\b/,
  /\bwhere do i\b/,
  /\bwhat does .* do\b/,
  /\bwhat is .* about\b/,
];

/**
 * Terms that name a place, derived from the capability's own governed `label`
 * — not a separate vocabulary that could drift from it.
 */
function orientTerms(cap: CapabilityDefinition): string[] {
  const terms = [normalize(cap.label)];
  // "Writer's Studio" is also said without the apostrophe.
  const noApostrophe = normalize(cap.label).replace(/'/g, '');
  if (noApostrophe !== terms[0]) terms.push(noApostrophe);
  return terms.filter(Boolean);
}

export interface Orientation {
  capability: CapabilityDefinition;
  /** Authored purpose text. ⛔ Never model-generated. */
  purpose: string;
  /** True when MAIA may also offer to take the member there. */
  canOffer: boolean;
}

/**
 * Answer "what is X for?" from governed metadata alone.
 *
 * Returns `null` when the utterance is not an orientation question, when no
 * known place is named, or when the capability has no AUTHORED purpose — in
 * that last case MAIA says nothing about it rather than inventing a description
 * of the product (MAIA-NODE-03 §5).
 */
export function resolveOrientation(utterance: string): Orientation | null {
  const text = normalize(utterance);
  if (!text) return null;
  if (!ORIENT_PATTERNS.some((re) => re.test(text))) return null;

  let best: { cap: CapabilityDefinition; len: number } | null = null;
  for (const cap of navigationCapabilities()) {
    for (const term of orientTerms(cap)) {
      if (!term || !text.includes(term)) continue;
      if (!best || term.length > best.len) best = { cap, len: term.length };
    }
  }
  if (!best?.cap.purpose) return null;

  return {
    capability: best.cap,
    purpose: best.cap.purpose,
    canOffer: isExecutable(best.cap),
  };
}

/**
 * The advisory sentence MAIA may say.
 *
 * Composed from authored metadata plus a fixed offer. Advisory by construction:
 * it describes and offers, and there is no phrasing here that tells a member
 * what they should do. The member chooses.
 */
export function orientationLine(o: Orientation): string {
  const base = `${o.capability.label} — ${o.purpose}`;
  return o.canOffer ? `${base} I can take you there if you'd like.` : base;
}
