import { createHash } from 'node:crypto';
import type { AuthoredBy } from '../../../lib/maia/canonical-turn';
import { enforceIdentityPredicateConstraint } from '../../../lib/sovereign/identityPredicateGuard';
import { containsForbiddenAmnesia } from '../../../lib/maia/prompts/memoryCanonGuard';

export type ClaimStanding = 'current' | 'superseded' | 'unresolved' | 'unavailable';

export interface AuditEvidence {
  readonly evidenceId: string;
  readonly text: string;
  readonly authoredBy: AuthoredBy;
  readonly claimStanding?: ClaimStanding;
  readonly claimKey?: string;
}

export interface InvisibleStandingContext {
  readonly evidence: readonly AuditEvidence[];
  /** True only when absence from `evidence` proves absence from the lawful population. */
  readonly evidencePopulationComplete: boolean;
}

export type InvisibleStandingRuleId =
  | 'identity_predicate_authority'
  | 'false_memory_capability_claim'
  | 'member_attribution_wrong_source'
  | 'member_attribution_unverified'
  | 'superseded_claim_as_current';

export interface InvisibleStandingFinding {
  readonly ruleId: InvisibleStandingRuleId;
  readonly disposition: 'observe' | 'refuse';
  readonly proof:
    | { readonly kind: 'pattern_ids'; readonly ids: readonly number[] }
    | { readonly kind: 'exact_text_source'; readonly quotedTextDigest: string; readonly evidenceId: string; readonly authoredBy: AuthoredBy }
    | { readonly kind: 'exact_text_absence'; readonly quotedTextDigest: string; readonly populationComplete: boolean }
    | { readonly kind: 'claim_standing'; readonly evidenceId: string; readonly claimKey?: string; readonly standing: ClaimStanding };
}

export interface InvisibleStandingAudit {
  readonly draftDigest: string;
  readonly disposition: 'pass' | 'observe' | 'refuse';
  readonly findings: readonly InvisibleStandingFinding[];
  /** Deliberately no response/replacement field. The auditor cannot author member-facing prose. */
}

const digest = (text: string): string => createHash('sha256').update(text).digest('hex');
const normalize = (text: string): string => text.replace(/\s+/g, ' ').trim();

interface DirectAttribution {
  readonly mode: 'historical' | 'current';
  readonly quote: string;
}

function directMemberAttributions(text: string): DirectAttribution[] {
  const out: DirectAttribution[] = [];
  const pattern = /\b(earlier,\s*)?you\s+(said|wrote|told me|say|now say)\s*[:,]?\s*[“"]([^”"]+)[”"]/gi;
  for (const match of text.matchAll(pattern)) {
    const verb = match[2].toLowerCase();
    const explicitlyHistorical = Boolean(match[1]) || verb === 'said' || verb === 'wrote' || verb === 'told me';
    out.push({ mode: explicitlyHistorical ? 'historical' : 'current', quote: normalize(match[3]) });
  }
  return out;
}

export function auditInvisibleStanding(
  draft: string,
  context: InvisibleStandingContext,
): InvisibleStandingAudit {
  const findings: InvisibleStandingFinding[] = [];

  const identity = enforceIdentityPredicateConstraint(draft);
  if (identity.wasConstrained) {
    findings.push({
      ruleId: 'identity_predicate_authority',
      disposition: 'refuse',
      proof: { kind: 'pattern_ids', ids: identity.matchedPatternIds },
    });
  }

  if (containsForbiddenAmnesia(draft)) {
    findings.push({
      ruleId: 'false_memory_capability_claim',
      disposition: 'refuse',
      proof: { kind: 'pattern_ids', ids: [] },
    });
  }

  const byExactText = new Map<string, AuditEvidence[]>();
  for (const evidence of context.evidence) {
    const key = normalize(evidence.text);
    const bucket = byExactText.get(key) ?? [];
    bucket.push(evidence);
    byExactText.set(key, bucket);
  }

  for (const attribution of directMemberAttributions(draft)) {
    const matches = byExactText.get(attribution.quote) ?? [];
    const memberMatch = matches.find((e) => e.authoredBy === 'member');
    if (!memberMatch) {
      const nonMember = matches[0];
      if (nonMember) {
        findings.push({
          ruleId: 'member_attribution_wrong_source',
          disposition: 'refuse',
          proof: {
            kind: 'exact_text_source',
            quotedTextDigest: digest(attribution.quote),
            evidenceId: nonMember.evidenceId,
            authoredBy: nonMember.authoredBy,
          },
        });
      } else {
        findings.push({
          ruleId: 'member_attribution_unverified',
          disposition: context.evidencePopulationComplete ? 'refuse' : 'observe',
          proof: {
            kind: 'exact_text_absence',
            quotedTextDigest: digest(attribution.quote),
            populationComplete: context.evidencePopulationComplete,
          },
        });
      }
      continue;
    }

    if (attribution.mode === 'current' && memberMatch.claimStanding === 'superseded') {
      findings.push({
        ruleId: 'superseded_claim_as_current',
        disposition: 'refuse',
        proof: {
          kind: 'claim_standing',
          evidenceId: memberMatch.evidenceId,
          ...(memberMatch.claimKey ? { claimKey: memberMatch.claimKey } : {}),
          standing: memberMatch.claimStanding,
        },
      });
    }
  }

  const disposition = findings.some((f) => f.disposition === 'refuse')
    ? 'refuse'
    : findings.some((f) => f.disposition === 'observe')
      ? 'observe'
      : 'pass';

  return { draftDigest: digest(draft), disposition, findings };
}

export function authorizeInvisibleStandingEmission(
  draft: string,
  audit: InvisibleStandingAudit,
): { readonly allowed: true; readonly text: string } | { readonly allowed: false; readonly draftDigest: string } {
  if (digest(draft) !== audit.draftDigest) throw new Error('draft_digest_mismatch');
  if (audit.disposition === 'refuse') return { allowed: false, draftDigest: audit.draftDigest };
  return { allowed: true, text: draft };
}
