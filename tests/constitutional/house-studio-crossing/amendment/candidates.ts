/** Defeat candidates for the WS2-03B amendment — each one plausible, each one wrong. */
import type { CtxResolver } from './contract';
import { referenceCtx } from './reference';

export interface ACandidate {
  readonly id: string;
  readonly error: string;
  readonly namedFalsifier: string;
  readonly classifiedCollateral?: Readonly<Record<string, string>>;
  readonly resolve: CtxResolver;
}

export const A_CANDIDATES: readonly ACandidate[] = [
  {
    id: 'DA-1',
    error: 'option A: ignore the choice — the member who already chose is asked again',
    namedFalsifier: 'WA-F1',
    resolve: (p, w, m) => referenceCtx(p, w, m, null),
  },
  {
    id: 'DA-2',
    error: 'trust the pointer: the chosen Work wins even if it does not contain the manuscript',
    namedFalsifier: 'WA-F2',
    classifiedCollateral: {
      'WA-F4': 'A choice trusted without checking containment overrides a single declaration by the same mechanism; sparing that case would require the candidate to check containment, which is the check it omits.',
    },
    resolve: (p, w, m, e) => {
      const chosen = e ? w.find((x) => x.id === e) : undefined;
      const base = referenceCtx(p, w, m, null);
      return chosen && base.kind !== 'none' && base.kind !== 'unknown' ? { kind: 'work', work: chosen } : base;
    },
  },
  {
    id: 'DA-3',
    error: 'adopt the orphan: a manuscript no Work declares takes the chosen Work',
    namedFalsifier: 'WA-F3',
    resolve: (p, w, m, e) => {
      const base = referenceCtx(p, w, m, e);
      const chosen = e ? w.find((x) => x.id === e) : undefined;
      return base.kind === 'none' && chosen && m ? { kind: 'work', work: chosen } : base;
    },
  },
  {
    id: 'DA-4',
    error: 'choice beats declaration: any existing chosen Work wins while any Work declares the manuscript',
    namedFalsifier: 'WA-F4',
    classifiedCollateral: {
      'WA-F2': 'Letting any existing chosen Work beat a declaration also lets a non-containing Work beat an ambiguous pair — the same missing containment check, seen from the other side.',
    },
    resolve: (p, w, m, e) => {
      const base = referenceCtx(p, w, m, e);
      const chosen = e ? w.find((x) => x.id === e) : undefined;
      return base.kind === 'work' && chosen && base.work.id !== chosen.id ? { kind: 'work', work: chosen } : base.kind === 'ambiguous' && chosen ? { kind: 'work', work: chosen } : base;
    },
  },
  {
    id: 'DA-5',
    error: 'default the choice: with no choice, resolve ambiguity to the first declaring Work',
    namedFalsifier: 'WA-F5',
    resolve: (p, w, m, e) => {
      const base = referenceCtx(p, w, m, e);
      return base.kind === 'ambiguous' && !e ? { kind: 'work', work: base.works[0]! } : base;
    },
  },
  {
    id: 'DA-6',
    error: 'assert early: the chosen Work is announced before declarations are read',
    namedFalsifier: 'WA-F6',
    resolve: (p, w, m, e) => {
      const chosen = e ? w.find((x) => x.id === e) : undefined;
      return p !== 'ready' && chosen ? { kind: 'work', work: chosen } : referenceCtx(p, w, m, e);
    },
  },
];
