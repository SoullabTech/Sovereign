/**
 * Defeat candidates — each the smallest competent embodiment of ONE plausible
 * wrong intake. Every one is something a reasonable implementer would write.
 * A candidate that survives the suite repairs the SUITE, never the candidate.
 */
import type { IntakeResolver } from './contract';
import { referenceResolver } from './reference';

export interface DefeatCandidate {
  readonly id: string;
  readonly error: string;
  /** The falsifier this candidate must die on. */
  readonly namedFalsifier: string;
  /**
   * Collateral declared with a reason naming why narrowing the candidate
   * would destroy the model. Anything undeclared is an isolation defect.
   */
  readonly classifiedCollateral?: Readonly<Record<string, string>>;
  readonly resolve: IntakeResolver;
}

export const CANDIDATES: readonly DefeatCandidate[] = [
  {
    id: 'DC-1',
    error: 'resume fallback: with no Work requested, open the member\'s most recent manuscript',
    namedFalsifier: 'HS-F1',
    resolve: (input) =>
      input.requestedWorkId === null && input.phase === 'ready' && input.liveManuscriptIds[0]
        ? { kind: 'open', workId: '', manuscriptId: input.liveManuscriptIds[0] }
        : referenceResolver(input),
  },
  {
    id: 'DC-2',
    error: 'trust the pointer: an unknown Work id still opens the member\'s first manuscript',
    namedFalsifier: 'HS-F2',
    resolve: (input) => {
      const out = referenceResolver(input);
      const first = input.liveManuscriptIds[0];
      return out.kind === 'refused' && first
        ? { kind: 'open', workId: input.requestedWorkId ?? '', manuscriptId: first }
        : out;
    },
  },
  {
    id: 'DC-3',
    error: 'first-pick (the manuscriptIdOf shape): a Work with several manuscripts opens the first',
    namedFalsifier: 'HS-F3',
    resolve: (input) => {
      const out = referenceResolver(input);
      return out.kind === 'choose'
        ? { kind: 'open', workId: out.workId, manuscriptId: out.manuscriptIds[0] as string }
        : out;
    },
  },
  {
    id: 'DC-4',
    error: 'fill the empty Work: a Work with no writing falls back to the most recent manuscript',
    namedFalsifier: 'HS-F4',
    classifiedCollateral: {
      'HS-F5': 'A Work whose only declared manuscript is gone IS a Work with no writing; a candidate that fills every empty Work must fill that one too. Sparing it would require the candidate to tell never-declared from deleted, which is not the error it embodies.',
    },
    resolve: (input) => {
      const out = referenceResolver(input);
      const first = input.liveManuscriptIds[0];
      return out.kind === 'no-writing' && first
        ? { kind: 'open', workId: out.workId, manuscriptId: first }
        : out;
    },
  },
  {
    id: 'DC-5',
    error: 'stale declaration: a declared manuscript that no longer exists is still opened',
    namedFalsifier: 'HS-F5',
    resolve: (input) =>
      referenceResolver({ ...input, liveManuscriptIds: input.works.flatMap((w) => w.manuscriptIds) }),
  },
  {
    id: 'DC-6',
    error: 'decide early: resolve against lists that are not read yet',
    namedFalsifier: 'HS-F6',
    resolve: (input) => referenceResolver({ ...input, phase: 'ready' }),
  },
  {
    id: 'DC-7',
    error: 'over-ask: always show a chooser, even when the Work has exactly one manuscript',
    namedFalsifier: 'HS-F7',
    resolve: (input) => {
      const out = referenceResolver(input);
      return out.kind === 'open'
        ? { kind: 'choose', workId: out.workId, manuscriptIds: [out.manuscriptId] }
        : out;
    },
  },
  {
    id: 'DC-8',
    error: 'disclosing refusal: the refusal echoes back the Work id it was handed',
    namedFalsifier: 'HS-F8',
    resolve: (input) => {
      const out = referenceResolver(input);
      return out.kind === 'refused'
        ? ({ kind: 'refused', workId: input.requestedWorkId } as unknown as ReturnType<IntakeResolver>)
        : out;
    },
  },
];
