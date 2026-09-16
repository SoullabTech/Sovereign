import { assembleRelationalField } from './standingResolver';
import { projectGestalt } from './projector';
import type { EvidenceObject, ResolveContext, StandingRelation } from './types';

export interface TranscriptTurn {
  readonly id: string;
  readonly role: 'user' | 'assistant' | 'member' | 'maia';
  readonly content: string;
  readonly createdAt: string;
}

export interface AmbiguousStandingAct {
  readonly subjectId: string;
  readonly predicateCandidate: 'CONFIRMS' | 'CONTESTS';
  readonly targetId: string;
  readonly reason: 'multi-unit-target';
}

function claimUnitCount(text: string): number {
  return text.split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter(Boolean).length;
}

const CONFIRM_RE = /\b(that is exactly it|that's exactly it|yes, exactly|exactly\.?$|that's it\.?$|correct\.?$)/i;
const CONTEST_RE = /\b(i already told you|that's not|that is not|no,?\s+that|you missed|we keep starting)/i;

function memberRole(role: TranscriptTurn['role']): boolean {
  return role === 'user' || role === 'member';
}

function evidenceId(turn: TranscriptTurn): string {
  return `turn:${turn.id}`;
}

export function adaptTranscript(turns: readonly TranscriptTurn[], processScope: string): {
  evidence: EvidenceObject[];
  relations: StandingRelation[];
  ambiguousStandingActs: AmbiguousStandingAct[];
} {
  const evidence: EvidenceObject[] = [];
  const relations: StandingRelation[] = [];
  const ambiguousStandingActs: AmbiguousStandingAct[] = [];
  let previousMember: EvidenceObject | null = null;
  let previousMaia: EvidenceObject | null = null;

  for (const turn of turns) {
    const isMember = memberRole(turn.role);
    const item: EvidenceObject = {
      id: evidenceId(turn),
      text: turn.content,
      kind: isMember ? (CONFIRM_RE.test(turn.content) || CONTEST_RE.test(turn.content) ? 'member_act' : 'member_statement') : 'maia_interpretation',
      authoredBy: isMember ? 'member' : 'maia',
      createdAt: turn.createdAt,
      processScope,
    };
    evidence.push(item);
    if (!isMember && previousMember) {
      relations.push({
        id: `ground:${item.id}`,
        subjectId: item.id,
        predicate: 'INTERPRETS',
        objectId: previousMember.id,
        basisIds: [previousMember.id],
        actor: 'maia',
        createdAt: turn.createdAt,
        processScope,
      });
      previousMaia = item;
      continue;
    }

    if (isMember && previousMaia) {
      const predicateCandidate = CONFIRM_RE.test(turn.content)
        ? 'CONFIRMS' as const
        : CONTEST_RE.test(turn.content)
          ? 'CONTESTS' as const
          : null;
      if (predicateCandidate) {
        if (claimUnitCount(previousMaia.text) !== 1) {
          ambiguousStandingActs.push({
            subjectId: item.id,
            predicateCandidate,
            targetId: previousMaia.id,
            reason: 'multi-unit-target',
          });
        } else {
          relations.push({
            id: `${predicateCandidate.toLowerCase()}:${item.id}`,
            subjectId: item.id,
            predicate: predicateCandidate,
            objectId: previousMaia.id,
            basisIds: [item.id],
            actor: 'member',
            createdAt: turn.createdAt,
            processScope,
          });
        }
      }
    }

    if (isMember) previousMember = item;
  }

  return { evidence, relations, ambiguousStandingActs };
}
export function computeTranscriptShadow(
  turns: readonly TranscriptTurn[],
  processScope: string,
  context: Omit<ResolveContext, 'processScope'> = {},
) {
  const adapted = adaptTranscript(turns, processScope);
  const field = assembleRelationalField(adapted.evidence, adapted.relations, {
    ...context,
    processScope,
  });
  return {
    field,
    projection: projectGestalt(field),
    ambiguousStandingActs: adapted.ambiguousStandingActs,
  };
}
