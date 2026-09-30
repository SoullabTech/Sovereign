/**
 * HS-F1…HS-F8 — the laws of the House → Studio Work intake.
 * Each returns null on PASS or a reason string on FAIL.
 */
import type { IntakeInput, IntakeResolver, IntakeWork } from './contract';

const W = (id: string, ...manuscriptIds: string[]): IntakeWork => ({ id, manuscriptIds });

const base = (over: Partial<IntakeInput>): IntakeInput => ({
  phase: 'ready',
  works: [W('w-one', 'm-a'), W('w-two', 'm-b', 'm-c'), W('w-empty'), W('w-stale', 'm-gone')],
  liveManuscriptIds: ['m-recent', 'm-a', 'm-b', 'm-c'],
  requestedWorkId: null,
  ...over,
});

export interface Falsifier {
  readonly id: string;
  readonly law: string;
  readonly check: (resolve: IntakeResolver) => string | null;
}

export const FALSIFIERS: readonly Falsifier[] = [
  {
    id: 'HS-F1',
    law: 'No Work requested → the intake acts on nothing (absent), in every phase.',
    check: (r) => {
      for (const phase of ['ready', 'loading'] as const) {
        const o = r(base({ phase, requestedWorkId: null }));
        if (o.kind !== 'absent') return `phase=${phase}: expected absent, got ${o.kind}`;
      }
      return null;
    },
  },
  {
    id: 'HS-F2',
    law: 'A Work id not among this member\'s Works is refused — never opened, never substituted.',
    check: (r) => {
      const o = r(base({ requestedWorkId: 'w-someone-else' }));
      return o.kind === 'refused' ? null : `expected refused, got ${o.kind}`;
    },
  },
  {
    id: 'HS-F3',
    law: 'Several live manuscripts → the member chooses among ALL of them, in declaration order.',
    check: (r) => {
      const o = r(base({ requestedWorkId: 'w-two' }));
      if (o.kind !== 'choose') return `expected choose, got ${o.kind}`;
      return JSON.stringify(o.manuscriptIds) === JSON.stringify(['m-b', 'm-c'])
        ? null : `expected [m-b,m-c], got ${JSON.stringify(o.manuscriptIds)}`;
    },
  },
  {
    id: 'HS-F4',
    law: 'No declared writing → no-writing for THAT Work; nothing is borrowed from elsewhere.',
    check: (r) => {
      const o = r(base({ requestedWorkId: 'w-empty' }));
      return o.kind === 'no-writing' && o.workId === 'w-empty' ? null : `expected no-writing(w-empty), got ${o.kind}`;
    },
  },
  {
    id: 'HS-F5',
    law: 'A declared manuscript that no longer exists is not openable.',
    check: (r) => {
      const o = r(base({ requestedWorkId: 'w-stale' }));
      return o.kind === 'no-writing' ? null : `expected no-writing, got ${o.kind}`;
    },
  },
  {
    id: 'HS-F6',
    law: 'Until the member\'s lists are read, decide nothing (wait) — loading is not refusal.',
    check: (r) => {
      for (const phase of ['loading', 'error', 'unauthorized'] as const) {
        const o = r(base({ phase, works: [], liveManuscriptIds: [], requestedWorkId: 'w-one' }));
        if (o.kind !== 'wait') return `phase=${phase}: expected wait, got ${o.kind}`;
      }
      return null;
    },
  },
  {
    id: 'HS-F7',
    law: 'Exactly one live manuscript → open it directly; the member\'s click is not asked twice.',
    check: (r) => {
      const o = r(base({ requestedWorkId: 'w-one' }));
      return o.kind === 'open' && o.manuscriptId === 'm-a' && o.workId === 'w-one'
        ? null : `expected open(m-a), got ${JSON.stringify(o)}`;
    },
  },
  {
    id: 'HS-F8',
    law: 'A refusal carries nothing — no id, no reason, no hint whether the Work exists.',
    check: (r) => {
      const o = r(base({ requestedWorkId: 'w-someone-else' }));
      if (o.kind !== 'refused') return null; // HS-F2's job, not this law's
      const keys = Object.keys(o);
      return keys.length === 1 ? null : `refusal carries extra keys: ${keys.join(',')}`;
    },
  },
];
