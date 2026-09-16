/**
 * JARVIS-MAIA-INVISIBLE-STANDING-SHADOW-02
 *
 * Writer's Studio live-shadow audit of the FINAL member-facing text.
 *
 * This module has zero response authority:
 *   - it has no model/provider/database/network dependency;
 *   - it cannot author replacement prose;
 *   - unknown / incomplete evidence is observation-only;
 *   - callers must ignore its result for member-facing output.
 */

import { createHash } from 'node:crypto';
import type { AuthoredBy, CanonicalTurn, Participant } from '@/lib/maia/canonical-turn';
import { containsForbiddenAmnesia } from '@/lib/maia/prompts/memoryCanonGuard';
import { enforceIdentityPredicateConstraint } from '@/lib/sovereign/identityPredicateGuard';

export const INVISIBLE_STANDING_SHADOW_TAG = 'INVISIBLE_STANDING_SHADOW_02' as const;

export type InvisibleStandingShadowRuleId =
  | 'identity_predicate_authority'
  | 'false_memory_capability_claim'
  | 'member_attribution_nonmember_candidate'
  | 'member_attribution_unverified';

export interface InvisibleStandingShadowFinding {
  readonly ruleId: InvisibleStandingShadowRuleId;
  readonly disposition: 'observe' | 'would_refuse';
  readonly proof:
    | { readonly kind: 'pattern_ids'; readonly ids: readonly number[] }
    | {
        readonly kind: 'exact_quote_source_candidate';
        readonly quoteDigest: string;
        readonly producerIds: readonly string[];
        readonly authoredBy: readonly AuthoredBy[];
        readonly evidencePopulationComplete: false;
      }
    | {
        readonly kind: 'exact_quote_unverified';
        readonly quoteDigest: string;
        readonly evidencePopulationComplete: false;
      };
}

export interface InvisibleStandingShadowAudit {
  readonly responseDigest: string;
  readonly responseChars: number;
  readonly disposition: 'pass' | 'observe' | 'would_refuse';
  readonly findings: readonly InvisibleStandingShadowFinding[];
  readonly directAttributionCount: number;
  /** Deliberately no response / replacement field. This audit cannot speak to the member. */
}

interface EvidenceRow {
  readonly producerId: string;
  readonly authoredBy: AuthoredBy;
  readonly participationClass: Participant['participationClass'] | 'authored';
  readonly text: string;
  readonly memberQuoteEligible: boolean;
}

const digest = (text: string): string => createHash('sha256').update(text, 'utf8').digest('hex');
const normalize = (text: string): string => text.replace(/\s+/g, ' ').trim();

function directMemberQuotes(text: string): string[] {
  const out: string[] = [];
  // Narrow by design: only explicit direct-quote attributions. No inference from paraphrase.
  const pattern = /\byou\s+(?:said|wrote|told me|put it)\s*[:,]?\s*[“"]([^”"]+)[”"]/gi;
  for (const match of text.matchAll(pattern)) out.push(normalize(match[1]));
  return out;
}

function evidenceRows(turn: CanonicalTurn): readonly EvidenceRow[] {
  const rows: EvidenceRow[] = [{
    producerId: 'encounter.input',
    authoredBy: 'member',
    participationClass: 'authored',
    text: turn.encounter.input,
    memberQuoteEligible: true,
  }];

  for (const participant of turn.participation.admitted) {
    rows.push({
      producerId: participant.producerId,
      authoredBy: participant.authoredBy,
      participationClass: participant.participationClass,
      text: participant.text,
      // `placed`, `marked`, `declared`, computed and inferred blocks can contain
      // formatter/system language. They are not treated as verbatim member speech.
      memberQuoteEligible:
        participant.authoredBy === 'member' &&
        (participant.participationClass === 'authored' || participant.participationClass === 'retrieved'),
    });
  }
  return rows;
}

export function auditInvisibleStandingShadow(
  turn: CanonicalTurn,
  finalText: string,
): InvisibleStandingShadowAudit {
  if (!Object.isFrozen(turn)) throw new Error('canonical_turn_not_frozen');

  const findings: InvisibleStandingShadowFinding[] = [];

  // These two classes already have active production guards. Re-observing them here
  // provides a shadow parity witness at the exact final-emission bytes.
  const identity = enforceIdentityPredicateConstraint(finalText);
  if (identity.wasConstrained) {
    findings.push({
      ruleId: 'identity_predicate_authority',
      disposition: 'would_refuse',
      proof: { kind: 'pattern_ids', ids: identity.matchedPatternIds },
    });
  }
  if (containsForbiddenAmnesia(finalText)) {
    findings.push({
      ruleId: 'false_memory_capability_claim',
      disposition: 'would_refuse',
      proof: { kind: 'pattern_ids', ids: [] },
    });
  }

  const rows = evidenceRows(turn);
  const quotes = directMemberQuotes(finalText);
  for (const quote of quotes) {
    const memberMatches = rows.filter(
      (row) => row.memberQuoteEligible && normalize(row.text).includes(quote),
    );
    if (memberMatches.length > 0) continue;

    const nonMemberMatches = rows.filter(
      (row) => row.authoredBy !== 'member' && normalize(row.text).includes(quote),
    );
    if (nonMemberMatches.length > 0) {
      findings.push({
        ruleId: 'member_attribution_nonmember_candidate',
        disposition: 'observe',
        proof: {
          kind: 'exact_quote_source_candidate',
          quoteDigest: digest(quote),
          producerIds: nonMemberMatches.map((row) => row.producerId),
          authoredBy: nonMemberMatches.map((row) => row.authoredBy),
          // CanonicalTurn is the turn's lawful participants, not a complete lifetime corpus.
          // Therefore this can never prove the member did NOT say the quote elsewhere.
          evidencePopulationComplete: false,
        },
      });
      continue;
    }

    findings.push({
      ruleId: 'member_attribution_unverified',
      disposition: 'observe',
      proof: {
        kind: 'exact_quote_unverified',
        quoteDigest: digest(quote),
        evidencePopulationComplete: false,
      },
    });
  }

  const disposition = findings.some((finding) => finding.disposition === 'would_refuse')
    ? 'would_refuse'
    : findings.some((finding) => finding.disposition === 'observe')
      ? 'observe'
      : 'pass';

  return Object.freeze({
    responseDigest: digest(finalText),
    responseChars: finalText.length,
    disposition,
    findings: Object.freeze(findings),
    directAttributionCount: quotes.length,
  });
}

export function logInvisibleStandingShadow(
  turn: CanonicalTurn,
  audit: InvisibleStandingShadowAudit,
  opts: { sanctuary: boolean },
): void {
  // Content-free by construction. No response text, quote text, member id or raw turn id.
  const ruleIds = [...new Set(audit.findings.map((finding) => finding.ruleId))].sort();
  console.log(JSON.stringify({
    _tag: INVISIBLE_STANDING_SHADOW_TAG,
    disposition: audit.disposition,
    findingCount: audit.findings.length,
    directAttributionCount: audit.directAttributionCount,
    ruleIds,
    sanctuary: opts.sanctuary,
    turnRef: digest(turn.turnId).slice(0, 12),
  }));
}

export function runInvisibleStandingShadowSafely(args: {
  readonly turn: CanonicalTurn;
  readonly finalText: string;
  readonly sanctuary: boolean;
}): InvisibleStandingShadowAudit | null {
  try {
    const audit = auditInvisibleStandingShadow(args.turn, args.finalText);
    logInvisibleStandingShadow(args.turn, audit, { sanctuary: args.sanctuary });
    return audit;
  } catch {
    // Shadow instrumentation can never break or rewrite the member response.
    console.warn(JSON.stringify({
      _tag: INVISIBLE_STANDING_SHADOW_TAG,
      disposition: 'error',
      errorCode: 'audit_exception',
      sanctuary: args.sanctuary,
    }));
    return null;
  }
}
