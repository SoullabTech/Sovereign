import { createHash } from 'node:crypto';
import type { AuthoredBy, Authority, ParticipationClass } from '../../../lib/maia/canonical-turn';
import type { ResolvedClaimStanding } from './claim-standing';

export interface StandingEvidence {
  readonly id: string;
  readonly text: string;
  readonly authoredBy: AuthoredBy;
  readonly participationClass: ParticipationClass;
  readonly authority: Authority;
  /** Substrate-owned derivation lineage; never supplied by the model plan. */
  readonly derivedFromEvidenceIds?: readonly string[];
}

export interface StandingPlan {
  readonly ground: readonly { readonly evidenceId: string }[];
  readonly synthesis: readonly {
    readonly text: string;
    readonly supportEvidenceIds?: readonly string[];
  }[];
  readonly question?: string | null;
}

export interface StandingTrace {
  readonly grounded: readonly {
    readonly evidenceId: string;
    readonly authoredBy: AuthoredBy;
    readonly participationClass: ParticipationClass;
    readonly authority: Authority;
    readonly claimStanding?: 'current' | 'superseded';
    readonly claimKey?: string;
    readonly derivedFromEvidenceIds?: readonly string[];
  }[];
  readonly synthesis: readonly {
    readonly supportEvidenceIds: readonly string[];
    readonly standing: 'maia_provisional';
  }[];
}

export interface RenderedStandingEnvelope {
  readonly text: string;
  readonly trace: StandingTrace;
  readonly digest: string;
}

export class StandingEnvelopeRefused extends Error {
  constructor(readonly code: string, detail?: string) {
    super(`Standing envelope refused: ${code}${detail ? ` — ${detail}` : ''}`);
    this.name = 'StandingEnvelopeRefused';
  }
}

const exactKeys = (value: Record<string, unknown>, allowed: readonly string[], where: string): void => {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new StandingEnvelopeRefused('unknown_field', `${where}.${key}`);
  }
};

const record = (value: unknown, where: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new StandingEnvelopeRefused('invalid_shape', where);
  }
  return value as Record<string, unknown>;
};

const nonBlank = (value: unknown, where: string): string => {
  if (typeof value !== 'string' || !value.trim()) throw new StandingEnvelopeRefused('blank_text', where);
  return value.trim();
};

const refuseBorrowedFirstPerson = (text: string, where: string): string => {
  // The renderer owns MAIA's first-person voice. A generated segment saying "my work",
  // "my life", etc. can silently borrow the member's voice even when metadata is honest.
  // Member-directed synthesis/question slots therefore cannot contain first-person singular.
  if (/\b(?:i|me|my|mine|myself)\b/i.test(text)) {
    throw new StandingEnvelopeRefused('borrowed_first_person', where);
  }
  return text;
};

const refuseRoleLeak = (text: string, where: string): string => {
  // This is member-facing speech. "the member" is internal role language and creates a
  // distancing third-person voice that can also obscure who owns a claim.
  if (/\bmember(?:'s)?\b/i.test(text)) {
    throw new StandingEnvelopeRefused('member_role_leak', where);
  }
  return text;
};

const memberFacing = (value: unknown, where: string): string =>
  refuseRoleLeak(refuseBorrowedFirstPerson(nonBlank(value, where), where), where);

export function parseStandingPlan(input: unknown): StandingPlan {
  const top = record(input, 'plan');
  exactKeys(top, ['ground', 'synthesis', 'question'], 'plan');
  if (!Array.isArray(top.ground) || !Array.isArray(top.synthesis)) {
    throw new StandingEnvelopeRefused('invalid_shape', 'ground/synthesis');
  }
  if (top.ground.length > 3) throw new StandingEnvelopeRefused('too_many_ground_segments');
  if (top.synthesis.length > 3) throw new StandingEnvelopeRefused('too_many_synthesis_segments');

  const ground = top.ground.map((raw, i) => {
    const item = record(raw, `ground[${i}]`);
    exactKeys(item, ['evidenceId'], `ground[${i}]`);
    return { evidenceId: nonBlank(item.evidenceId, `ground[${i}].evidenceId`) };
  });

  const synthesis = top.synthesis.map((raw, i) => {
    const item = record(raw, `synthesis[${i}]`);
    exactKeys(item, ['text', 'supportEvidenceIds'], `synthesis[${i}]`);
    const text = memberFacing(item.text, `synthesis[${i}].text`);
    const supportEvidenceIds = item.supportEvidenceIds === undefined
      ? undefined
      : (() => {
          if (!Array.isArray(item.supportEvidenceIds)) {
            throw new StandingEnvelopeRefused('invalid_shape', `synthesis[${i}].supportEvidenceIds`);
          }
          return item.supportEvidenceIds.map((id, j) => nonBlank(id, `synthesis[${i}].supportEvidenceIds[${j}]`));
        })();
    return { text, ...(supportEvidenceIds ? { supportEvidenceIds } : {}) };
  });

  const question = top.question === undefined || top.question === null
    ? null
    : memberFacing(top.question, 'question');
  return { ground, synthesis, question };
}

function sourceLead(e: StandingEvidence, claimStanding?: 'current' | 'superseded'): string {
  if (e.authoredBy === 'member' && claimStanding === 'superseded') return 'Earlier, you said';
  if (e.authoredBy === 'member' && claimStanding === 'current') return 'You now say';
  if (e.authoredBy === 'member') return 'You said';
  if (e.authoredBy === 'practitioner') return 'A practitioner observation says';
  if (e.authoredBy === 'house') return 'Soullab context says';
  if (e.authoredBy === 'collective') return 'Collective material says';
  return e.authority === 'compute' ? 'A computed signal says' : 'A system-originated signal says';
}

export function renderStandingEnvelope(
  evidence: readonly StandingEvidence[],
  rawPlan: unknown,
  claimStanding?: ResolvedClaimStanding,
): RenderedStandingEnvelope {
  const plan = parseStandingPlan(rawPlan);
  const byId = new Map(evidence.map((e) => [e.id, e] as const));
  const requireEvidence = (id: string): StandingEvidence => {
    const found = byId.get(id);
    if (!found) throw new StandingEnvelopeRefused('unknown_evidence', id);
    return found;
  };

  const grounded = plan.ground.map(({ evidenceId }) => requireEvidence(evidenceId));
  const referencedIds = new Set<string>([
    ...plan.ground.map((g) => g.evidenceId),
    ...plan.synthesis.flatMap((s) => s.supportEvidenceIds ?? []),
  ]);

  if (claimStanding) {
    const supersededAncestors = (evidenceId: string, seen = new Set<string>()): ResolvedClaimStanding['byEvidenceId'] extends ReadonlyMap<string, infer V> ? V[] : never => {
      if (seen.has(evidenceId)) throw new StandingEnvelopeRefused('cyclic_evidence_lineage', evidenceId);
      seen.add(evidenceId);
      const e = requireEvidence(evidenceId);
      const states: any[] = [];
      const own = claimStanding.byEvidenceId.get(evidenceId);
      if (own?.status === 'superseded') states.push(own);
      for (const parentId of e.derivedFromEvidenceIds ?? []) {
        requireEvidence(parentId);
        states.push(...(supersededAncestors(parentId, new Set(seen)) as any[]));
      }
      return states as any;
    };

    for (const evidenceId of referencedIds) {
      for (const state of supersededAncestors(evidenceId) as any[]) {
        const current = claimStanding.currentByClaimKey.get(state.claimKey);
        if (!current || !referencedIds.has(current)) {
          throw new StandingEnvelopeRefused('superseded_without_current', evidenceId);
        }
      }
    }
  }

  const synthTrace = plan.synthesis.map((s) => ({
    supportEvidenceIds: (s.supportEvidenceIds ?? []).map((id) => requireEvidence(id).id),
    standing: 'maia_provisional' as const,
  }));

  const lines: string[] = [];
  for (const e of grounded) {
    const state = claimStanding?.byEvidenceId.get(e.id);
    lines.push(`${sourceLead(e, state?.status)}: “${e.text}”`);
  }
  for (let i = 0; i < plan.synthesis.length; i += 1) {
    const lead = i === 0 ? 'One possibility I see' : 'Another possibility I see';
    lines.push(`${lead} — provisionally: ${plan.synthesis[i].text}`);
  }
  if (plan.question) {
    if (plan.synthesis.length > 0) {
      const premise = plan.synthesis.length === 1
        ? 'If that possibility is worth testing rather than assuming'
        : 'If any of those possibilities are worth testing rather than assuming';
      const lowered = plan.question.charAt(0).toLowerCase() + plan.question.slice(1);
      lines.push(`${premise}, ${lowered}`);
    } else {
      lines.push(plan.question);
    }
  }

  const text = lines.join('\n\n');
  return {
    text,
    trace: {
      grounded: grounded.map((e) => ({
        evidenceId: e.id,
        authoredBy: e.authoredBy,
        participationClass: e.participationClass,
        authority: e.authority,
        ...(claimStanding?.byEvidenceId.get(e.id)
          ? {
              claimStanding: claimStanding.byEvidenceId.get(e.id)!.status,
              claimKey: claimStanding.byEvidenceId.get(e.id)!.claimKey,
            }
          : {}),
        ...(e.derivedFromEvidenceIds ? { derivedFromEvidenceIds: e.derivedFromEvidenceIds } : {}),
      })),
      synthesis: synthTrace,
    },
    digest: createHash('sha256').update(text).digest('hex'),
  };
}
