/** WA-F1…WA-F6 — laws of the WS2-03B amendment. null = PASS, string = FAIL reason. */
import type { CtxResolver, CtxWork } from './contract';

const W = (id: string, ...manuscripts: string[]): CtxWork => ({
  id,
  expressions: manuscripts.map((m) => ({ expressionType: 'manuscript', expressionId: m })),
});

// m-shared lives in A and B; m-solo only in A; m-orphan in none. Z declares nothing relevant.
const WORKS = [W('A', 'm-shared', 'm-solo'), W('B', 'm-shared'), W('Z', 'm-other')];

const id = (o: ReturnType<CtxResolver>) =>
  o.kind === 'work' ? `work(${o.work.id})` : o.kind === 'ambiguous' ? `ambiguous(${o.works.map((w) => w.id).join(',')})` : o.kind;

export interface AFalsifier { readonly id: string; readonly law: string; readonly check: (r: CtxResolver) => string | null }

export const A_FALSIFIERS: readonly AFalsifier[] = [
  {
    id: 'WA-F1',
    law: 'An explicit choice settles ambiguity among Works that contain the manuscript.',
    check: (r) => {
      for (const choice of ['A', 'B']) {
        const got = id(r('ready', WORKS, 'm-shared', choice));
        if (got !== `work(${choice})`) return `chose ${choice}, got ${got}`;
      }
      return null;
    },
  },
  {
    id: 'WA-F2',
    law: 'A choice of a Work that does not contain the manuscript is ignored — it never attaches the manuscript there.',
    check: (r) => {
      const got = id(r('ready', WORKS, 'm-shared', 'Z'));
      return got === 'ambiguous(A,B)' ? null : `expected ambiguous(A,B), got ${got}`;
    },
  },
  {
    id: 'WA-F3',
    law: 'A choice never manufactures a Work for a manuscript no Work declares.',
    check: (r) => {
      const got = id(r('ready', WORKS, 'm-orphan', 'A'));
      return got === 'none' ? null : `expected none, got ${got}`;
    },
  },
  {
    id: 'WA-F4',
    law: 'A choice cannot override a declaration: with one declaring Work, a different choice changes nothing.',
    check: (r) => {
      const got = id(r('ready', WORKS, 'm-solo', 'B'));
      return got === 'work(A)' ? null : `expected work(A), got ${got}`;
    },
  },
  {
    id: 'WA-F5',
    law: 'Without a choice WS2-03B is unchanged: 0 none · 1 known · 2+ ambiguous, never a guess.',
    check: (r) => {
      const cases: [string, string][] = [['m-orphan', 'none'], ['m-solo', 'work(A)'], ['m-shared', 'ambiguous(A,B)']];
      for (const [m, want] of cases) {
        for (const explicit of [null, undefined, '']) {
          const got = id(r('ready', WORKS, m, explicit as string | null | undefined));
          if (got !== want) return `${m} with choice=${JSON.stringify(explicit)}: expected ${want}, got ${got}`;
        }
      }
      return null;
    },
  },
  {
    id: 'WA-F6',
    law: 'Until declarations are read, nothing is asserted — not even the chosen Work.',
    check: (r) => {
      for (const phase of ['loading', 'error', 'unauthorized'] as const) {
        const got = id(r(phase, WORKS, 'm-shared', 'A'));
        if (got !== 'unknown') return `phase=${phase}: expected unknown, got ${got}`;
      }
      return null;
    },
  },
];
