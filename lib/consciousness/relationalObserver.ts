/**
 * Relational Observer — Silent Background Attunement
 *
 * Detects relational content in conversation and persists observations
 * to the Relationship Field. Fire-and-forget, never blocks the oracle.
 *
 * Design principles:
 * - Single mention → low-confidence observation
 * - Repeated person/pattern → relationship entry update
 * - Explicit relational reflection → stronger field write
 * - Highly sensitive content → conservative capture, minimal inference
 * - No UI interruption — conversation stays fluid
 */

import { query, queryOne, insertOne } from '@/lib/db/postgres';
import { detectPatterns, DEFAULT_PATTERN_TTL_DAYS } from '@/lib/relationships/patternDetection';

// Signal words that indicate relational content
const RELATIONAL_SIGNALS = [
  'partner', 'relationship', 'friend', 'mother', 'father', 'parent',
  'husband', 'wife', 'spouse', 'daughter', 'son', 'sibling', 'brother', 'sister',
  'conflict', 'boundary', 'boundaries', 'arguing', 'fight', 'divorce',
  'betrayal', 'trust', 'attachment', 'intimacy', 'codependent',
  'client', 'colleague', 'boss', 'mentor', 'teacher', 'therapist',
  'ex', 'lover', 'roommate', 'family',
];

// Bond type classification
const BOND_TYPE_SIGNALS: Record<string, string[]> = {
  partner: ['partner', 'husband', 'wife', 'spouse', 'lover', 'ex', 'dating'],
  family: ['mother', 'father', 'parent', 'daughter', 'son', 'sibling', 'brother', 'sister', 'family'],
  friend: ['friend', 'roommate'],
  professional: ['client', 'colleague', 'boss', 'mentor', 'teacher', 'therapist'],
};

// Entry kind classification based on emotional content
const KIND_SIGNALS: Record<string, string[]> = {
  rupture: ['betrayal', 'fight', 'arguing', 'divorce', 'broke', 'hurt', 'violated'],
  threshold: ['changing', 'shifting', 'ending', 'beginning', 'transition', 'deciding'],
  reflection: ['pattern', 'noticing', 'realizing', 'wondering', 'feeling'],
};

interface RelationalDetection {
  detected: boolean;
  confidence: number;
  signals: string[];
  inferredName: string | null;
  bondType: string | null;
  realm: 'outer' | 'inner' | 'transpersonal';
  entryKind: 'note' | 'reflection' | 'threshold' | 'rupture';
  summary: string;
}

function detectRelationalContent(userMessage: string, maiaResponse: string): RelationalDetection {
  const combined = `${userMessage} ${maiaResponse}`.toLowerCase();
  const userLower = userMessage.toLowerCase();

  const signals = RELATIONAL_SIGNALS.filter(s => userLower.includes(s));

  if (signals.length === 0) {
    return { detected: false, confidence: 0, signals: [], inferredName: null, bondType: null, realm: 'outer', entryKind: 'note', summary: '' };
  }

  // Confidence: 1 signal = 0.3, 2 = 0.5, 3+ = 0.7+
  const confidence = Math.min(0.2 + signals.length * 0.18, 0.85);

  // Classify bond type
  let bondType: string | null = null;
  for (const [type, keywords] of Object.entries(BOND_TYPE_SIGNALS)) {
    if (keywords.some(k => userLower.includes(k))) {
      bondType = type;
      break;
    }
  }

  // Classify entry kind
  let entryKind: 'note' | 'reflection' | 'threshold' | 'rupture' = 'note';
  for (const [kind, keywords] of Object.entries(KIND_SIGNALS)) {
    if (keywords.some(k => combined.includes(k))) {
      entryKind = kind as typeof entryKind;
      break;
    }
  }

  // Build a concise summary from the user message (first 200 chars, no AI interpretation)
  const summary = userMessage.length > 200
    ? userMessage.slice(0, 200).trim() + '...'
    : userMessage.trim();

  return {
    detected: true,
    confidence,
    signals,
    inferredName: null, // Don't guess names — let the field accumulate
    bondType,
    realm: 'outer',
    entryKind,
    summary,
  };
}

/**
 * The turn's consent posture. REQUIRED — not optional, and deliberately not
 * defaulted.
 *
 * RU-0 (2026-08-10): containment previously depended entirely on each caller
 * remembering an `!isSanctuary` condition. One of the two callers — the route
 * carrying ~99.6% of live conversation traffic — did not have it, and nothing
 * in the type system said otherwise. Making posture a required argument turns
 * "remember the guard" into a compile error, so a future call site cannot omit
 * it silently. The typecheck gate is the enforcement.
 */
export interface RelationalObservationPosture {
  isSanctuary: boolean;

  /**
   * The relationship this turn is explicitly ABOUT, when the member spoke from
   * inside that relationship's room.
   *
   * ⚠️ MUST ALREADY BE VALIDATED. The caller is responsible for having proved
   * server-side that this id exists, is not archived, and belongs to the
   * session member — see `lib/relationships/resolveExplicitRelationshipId.ts`.
   * This function is fire-and-forget, so a refusal raised here could not
   * surface to anyone; validation has to happen where it is still observable.
   *
   * `undefined` ⇒ exactly today's behavior: the member's `Unresolved Relational
   * Field` catch-all, created on demand.
   *
   * Explicit context OUTRANKS inference, always. When this is present the
   * observer's own counterpart detection is demoted to non-authoritative: it
   * may still populate kind, confidence and pattern hints — it may not select
   * the target.
   */
  explicitRelationshipId?: string | null;
}

/**
 * Observe a conversation turn for relational content.
 * Fire-and-forget — never awaited, never blocks.
 *
 * 🔒 Refuses outright under Sanctuary. This is defence in depth: the call sites
 * also guard, but the boundary must not rest on a single conditional. Sanctuary
 * is canon-declared an ABSOLUTE boundary — nothing from a sanctuary session may
 * be saved, extracted, or inferred into long-term memory, and this function
 * writes `member_relationships` + `relationship_entries` + pattern rows.
 */
export function observeRelationalContent(
  memberId: string,
  userMessage: string,
  maiaResponse: string,
  posture: RelationalObservationPosture,
): void {
  if (posture.isSanctuary) {
    // Silent by design: logging the refusal per-turn would itself leak the fact
    // and cadence of sanctuary use into ordinary logs.
    return;
  }
  // Run detection + persistence in background
  _observeAsync(memberId, userMessage, maiaResponse, posture.explicitRelationshipId ?? null).catch(err => {
    console.warn('[RelationalObserver] Background error (non-blocking):', err.message);
  });
}

async function _observeAsync(
  memberId: string,
  userMessage: string,
  maiaResponse: string,
  explicitRelationshipId: string | null,
): Promise<void> {
  const detection = detectRelationalContent(userMessage, maiaResponse);

  if (!detection.detected || detection.confidence < 0.35) {
    return; // Below threshold — no observation worth recording
  }

  console.log(`🔗 [RelationalObserver] Detected: confidence=${detection.confidence.toFixed(2)} signals=[${detection.signals.join(',')}] kind=${detection.entryKind} bond=${detection.bondType}`);

  // ── Where does this observation belong? ──────────────────────────────────
  //
  // Explicit context outranks inference. If the member spoke from inside a
  // specific relationship's room, the material belongs to THAT relationship —
  // the detection above still supplies kind, confidence and pattern hints, but
  // it no longer chooses the target.
  //
  // The id arriving here has ALREADY been proved owned, unarchived, and
  // session-bound by the route (`resolveExplicitRelationshipId`). This function
  // cannot validate it meaningfully: `memberId` here may be a client-supplied
  // body id, so checking one against the other would authorize nothing.
  let relationshipId: string | null = null;

  if (explicitRelationshipId) {
    relationshipId = explicitRelationshipId;
    console.log(`🔗 [RelationalObserver] Explicit relationship context: ${relationshipId}`);
  } else {
    // ── else: unchanged pre-existing behavior ──────────────────────────────
    // No explicit context. Observations accumulate in the member's system
    // catch-all until they are placed. This container is INFRASTRUCTURE, not a
    // relationship — see the `origin` column and the member-facing separation
    // in app/relationships/page.tsx.
    const existing = await queryOne(
      `SELECT id FROM member_relationships
       WHERE member_id = $1 AND origin = 'system' AND archived_at IS NULL
       ORDER BY created_at ASC
       LIMIT 1`,
      [memberId]
    );

    if (existing) {
      relationshipId = existing.id;
    } else {
      // Create the catch-all container, marked as the system's own unfinished
      // work so it can never masquerade as a person in the member's list.
      const row = await insertOne('member_relationships', {
        member_id: memberId,
        name: 'Unresolved Relational Field',
        realm: 'outer',
        bond_type: null,
        origin: 'system',
        note: 'Auto-created by relational observer. Observations from conversation accumulate here until you map them to specific relationships.',
      });
      relationshipId = row.id;
      console.log(`🔗 [RelationalObserver] Created catch-all container: ${relationshipId}`);
    }
  }

  // Pattern detection v2 — structural, multi-hit. Runs on the user message
  // only (MAIA's response is deliberately excluded so the detector cannot
  // chase its own output). See: lib/relationships/patternDetection.ts.
  const patternHits = detectPatterns(userMessage);

  // Insert the observation as a relationship entry. pattern_hint gets the
  // top-confidence hit (if any) for continuity with the existing context
  // bridge; the full multi-hit record lives in relationship_entry_patterns.
  const topHit = patternHits[0] ?? null;
  const entryRow = await insertOne('relationship_entries', {
    relationship_id: relationshipId,
    member_id: memberId,
    kind: detection.entryKind,
    content: detection.summary,
    confidence: detection.confidence,
    pattern_hint: topHit?.patternId ?? null,
    // Hardcoded at the call site, never resolved from a request. Correct
    // attachment files this material under the right person; it does not turn
    // MAIA's summary into the member's own declaration.
    provenance: 'observer_derived',
  });

  // Fan out all concurrent pattern hits to the side table. Expires_at gives
  // each hit a natural shelf life — relational dynamics are stateful, not
  // fixed traits. See: database/migrations/20260409000001_relationship_entry_patterns.sql.
  if (patternHits.length > 0) {
    const expiresAt = new Date(Date.now() + DEFAULT_PATTERN_TTL_DAYS * 24 * 60 * 60 * 1000);
    for (const hit of patternHits) {
      await insertOne('relationship_entry_patterns', {
        entry_id: entryRow.id,
        relationship_id: relationshipId,
        member_id: memberId,
        pattern_id: hit.patternId,
        confidence: hit.confidence,
        evidence: hit.evidence,
        expires_at: expiresAt.toISOString(),
      });
    }
    console.log(
      `🔗 [RelationalObserver] Pattern hits: ${patternHits.map(h => `${h.patternId}@${h.confidence.toFixed(2)}`).join(', ')}`
    );
  }

  // Update the relationship's timestamp
  await query(
    `UPDATE member_relationships SET updated_at = NOW() WHERE id = $1`,
    [relationshipId]
  );

  console.log(`🔗 [RelationalObserver] Saved ${detection.entryKind} observation (confidence=${detection.confidence.toFixed(2)}) to field ${relationshipId}`);
}
