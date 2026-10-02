/**
 * SERVING IDENTITY — falsifier matrix.
 *
 * Two questions, and the second is the one that matters:
 *
 *   LETHALITY        does each falsifier kill the wrong implementation?
 *   DISCRIMINATION   does the suite know WHY that implementation is wrong?
 *
 * ⛔ A candidate that fails every falsifier proves only that the candidate is
 * garbage. A pile of generally hostile assertions must never masquerade as a
 * law. Collateral kills are therefore DECLARED with a reason, and an undeclared
 * collateral kill is a candidate-isolation defect, not a stronger suite.
 *
 * Repair law, both directions:
 *   candidate SURVIVES its named falsifier  → repair the FALSIFIER
 *   candidate dies on an UNDECLARED falsifier → repair CANDIDATE ISOLATION
 *   ⛔ never weaken an unrelated falsifier to make the matrix prettier
 *
 * Run:  npx tsx tests/constitutional/serving-identity/matrix.ts
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  classifyDivergence,
  servingIdentityFor,
  type LLMProvider,
  type ServingIdentity,
} from '../../../lib/consciousness/servingIdentity';

// ---------------------------------------------------------------------------
// The shape every candidate must implement: given intended and served, describe
// the turn. The conforming one derives; the wrong ones do something else.
// ---------------------------------------------------------------------------

interface Stamp {
  (args: {
    intendedProvider: LLMProvider;
    intendedModel: string;
    servedProvider: LLMProvider;
    servedModel: string;
    reason: string;
    /** A label the CALL SITE would like applied. Conforming candidates ignore it. */
    callerLabel?: ServingIdentity['divergence'];
  }): Partial<ServingIdentity> & Record<string, unknown>;
}

interface Candidate {
  readonly id: string;
  readonly error: string;
  readonly stamp: Stamp;
  /** Falsifiers this candidate is BUILT to fail. */
  readonly intended: readonly string[];
  /** Extra kills that are a necessary consequence of embodying this error. */
  readonly declared: Readonly<Record<string, string>>;
}

const CONFORMING: Candidate = {
  id: 'CONFORMING',
  error: '(none — the shipped implementation)',
  stamp: (a) => servingIdentityFor(a),
  intended: [],
  declared: {},
};

const CANDIDATES: readonly Candidate[] = [
  {
    id: 'DC-1',
    error: 'one boolean `degraded` flag — both directions collapsed onto one axis',
    stamp: (a) => {
      const degraded = a.intendedProvider !== a.servedProvider;
      return {
        intendedProvider: a.intendedProvider,
        intendedModel: a.intendedModel,
        servedProvider: a.servedProvider,
        servedModel: a.servedModel,
        divergence: degraded ? 'capability' : 'none',
        ...(degraded ? { reason: a.reason } : {}),
      };
    },
    intended: ['SI-F2'],
    declared: {},
  },
  {
    id: 'DC-2',
    error: 'the call site names the class — divergence is accepted, not derived',
    stamp: (a) => {
      const divergence = a.callerLabel ?? 'none';
      return {
        intendedProvider: a.intendedProvider,
        intendedModel: a.intendedModel,
        servedProvider: a.servedProvider,
        servedModel: a.servedModel,
        divergence,
        ...(divergence === 'none' ? {} : { reason: a.reason }),
      };
    },
    intended: ['SI-F1', 'SI-F6'],
    declared: {
      'SI-F2': 'a call site that can mislabel one direction can mislabel the other; both are the same defect',
      'SI-F4': 'once the label is supplied, routed-local and degraded-local are whatever the caller says',
    },
  },
  {
    id: 'DC-3',
    error: 'served identity only — the pre-2026-09-20 state of the provider',
    stamp: (a) => ({
      servedProvider: a.servedProvider,
      servedModel: a.servedModel,
    }),
    intended: ['SI-F4'],
    declared: {
      'SI-F1': 'with no intended side recorded, no direction can be classified at all',
      'SI-F2': 'same — the class is underivable, not merely wrong',
      'SI-F3': 'irreducible: this candidate records no divergence field, so it cannot report `none` either. Giving it one would make it cease to be the error it models',
    },
  },
  {
    id: 'DC-4',
    error: 'any divergence is a degradation — direction discarded',
    stamp: (a) => {
      const diverged = a.intendedProvider !== a.servedProvider;
      return {
        intendedProvider: a.intendedProvider,
        intendedModel: a.intendedModel,
        servedProvider: a.servedProvider,
        servedModel: a.servedModel,
        divergence: diverged ? 'capability' : 'none',
        ...(diverged ? { reason: a.reason } : {}),
      };
    },
    intended: ['SI-F2'],
    declared: {},
  },
  {
    id: 'DC-5',
    error: 'reason stamped unconditionally — a healthy turn carries an incident',
    stamp: (a) => ({
      ...servingIdentityFor(a),
      reason: a.reason,
    }),
    intended: ['SI-F5'],
    declared: {},
  },
];

// ---------------------------------------------------------------------------
// Behavioural falsifiers — run against every candidate
// ---------------------------------------------------------------------------

type Falsifier = { id: string; law: string; run: (s: Stamp) => void };

const CLOUD = 'claude-sonnet-5';
const LOCAL = 'qwen2.5:7b';

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const FALSIFIERS: readonly Falsifier[] = [
  {
    id: 'SI-F1',
    law: 'intended cloud, served local is classified `capability`',
    run: (s) => {
      const r = s({
        intendedProvider: 'anthropic', intendedModel: CLOUD,
        servedProvider: 'ollama', servedModel: LOCAL,
        reason: 'UND_ERR_HEADERS_TIMEOUT',
        callerLabel: 'sovereignty', // a call site asking for the wrong class
      });
      assert(r.divergence === 'capability', `got ${String(r.divergence)}`);
    },
  },
  {
    id: 'SI-F2',
    law: 'intended local, served cloud is classified `sovereignty`, never `capability`',
    run: (s) => {
      const r = s({
        intendedProvider: 'ollama', intendedModel: LOCAL,
        servedProvider: 'anthropic', servedModel: CLOUD,
        reason: 'ECONNREFUSED',
        callerLabel: 'sovereignty',
      });
      assert(r.divergence === 'sovereignty', `got ${String(r.divergence)}`);
    },
  },
  {
    id: 'SI-F3',
    law: 'intended === served is `none` — a healthy turn is never reported as a substitution',
    run: (s) => {
      const r = s({
        intendedProvider: 'ollama', intendedModel: LOCAL,
        servedProvider: 'ollama', servedModel: LOCAL,
        reason: 'n/a',
        callerLabel: 'none',
      });
      assert(r.divergence === 'none', `got ${String(r.divergence)}`);
    },
  },
  {
    id: 'SI-F4',
    law: '⭐ a turn ROUTED to local and a turn DEGRADED to local are distinguishable',
    run: (s) => {
      const routed = s({
        intendedProvider: 'ollama', intendedModel: LOCAL,
        servedProvider: 'ollama', servedModel: LOCAL,
        reason: 'n/a',
      });
      const degraded = s({
        intendedProvider: 'anthropic', intendedModel: CLOUD,
        servedProvider: 'ollama', servedModel: LOCAL,
        reason: 'overloaded_error',
      });
      // Same served mind on both. The record must still tell them apart.
      assert(routed.servedProvider === degraded.servedProvider, 'fixture broken: served differs');
      assert(
        routed.divergence !== degraded.divergence,
        `indistinguishable: both ${String(routed.divergence)}`
      );
    },
  },
  {
    id: 'SI-F5',
    law: 'a non-divergent turn carries no reason — no incident that never happened',
    run: (s) => {
      const r = s({
        intendedProvider: 'anthropic', intendedModel: CLOUD,
        servedProvider: 'anthropic', servedModel: CLOUD,
        reason: 'UND_ERR_HEADERS_TIMEOUT',
      });
      assert(r.reason === undefined, `reason present on a healthy turn: ${String(r.reason)}`);
    },
  },
  {
    id: 'SI-F6',
    law: 'the class is derived from direction, not accepted from the call site',
    run: (s) => {
      // Identical substitution, three different caller labels. The record must not move.
      const labels: ServingIdentity['divergence'][] = ['none', 'capability', 'sovereignty'];
      const seen = new Set(
        labels.map((callerLabel) =>
          String(
            s({
              intendedProvider: 'anthropic', intendedModel: CLOUD,
              servedProvider: 'ollama', servedModel: LOCAL,
              reason: 'overloaded_error',
              callerLabel,
            }).divergence
          )
        )
      );
      assert(seen.size === 1, `caller label moved the class: ${[...seen].join(' / ')}`);
    },
  },
];

// ---------------------------------------------------------------------------
// Structural guards — source scans over the shipped provider only.
// ⭐ Comments are stripped FIRST. A file that documents its own compliance must
// never read as the banned behaviour returning (the C21 lesson, applied before
// it can bite).
// ---------------------------------------------------------------------------

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const PROVIDER_SRC = stripComments(
  readFileSync(join(process.cwd(), 'lib/consciousness/LLMProvider.ts'), 'utf8')
);
const IDENTITY_SRC = stripComments(
  readFileSync(join(process.cwd(), 'lib/consciousness/servingIdentity.ts'), 'utf8')
);

const GUARDS: readonly { id: string; law: string; run: () => void }[] = [
  {
    id: 'SI-G1',
    law: "every `type: 'done'` yield in the provider carries serving identity",
    run: () => {
      const dones = PROVIDER_SRC.match(/type:\s*'done'[\s\S]{0,400}?\};/g) ?? [];
      assert(dones.length > 0, 'no done events found — scan is vacuous');
      const bare = dones.filter((d) => !d.includes('serving'));
      assert(bare.length === 0, `${bare.length} done event(s) without serving identity`);
    },
  },
  {
    id: 'SI-G2',
    law: 'NO llm.* structured event carries prompt, transcript or answer text',
    run: () => {
      // ⚠️ An earlier draft asserted exactly two events and failed on a third,
      // `llm.truncated`, which predates this work. The count was the wrong law:
      // content safety binds EVERY structured event, however many exist, and an
      // instrument that hard-codes today's inventory goes stale the moment one
      // is added. Scanning all of them is strictly stronger.
      const events = PROVIDER_SRC.match(/tag:\s*'llm\.[a-z_]+'[\s\S]{0,700}?\}\)/g) ?? [];
      assert(events.length >= 2, `expected at least 2 structured events, found ${events.length}`);
      const forbidden = ['systemPrompt', 'userInput', 'messages', 'response.text', '.content'];
      for (const e of events) {
        const tag = e.match(/tag:\s*'(llm\.[a-z_]+)'/)?.[1] ?? '(unknown)';
        for (const f of forbidden) {
          assert(!e.includes(f), `${tag} references ${f}`);
        }
      }
    },
  },
  {
    id: 'SI-G3',
    law: 'classifyDivergence accepts no divergence argument and no caller hint',
    run: () => {
      assert(classifyDivergence.length === 2, `arity ${classifyDivergence.length}, expected 2`);
      // ⚠️ Scan the PARAMETER LIST only. An earlier draft scanned the whole
      // signature and failed on the word inside `classifyDivergence` itself —
      // the C21 class of false positive, where an instrument fails a file
      // because of what that file is named.
      const params = IDENTITY_SRC.match(/export function classifyDivergence\(([\s\S]*?)\)\s*:/)?.[1] ?? null;
      assert(params !== null, 'signature not found');
      assert(!/divergence/i.test(params), `parameter list admits a divergence argument: ${params.trim()}`);
    },
  },
  {
    id: 'SI-G4',
    law: 'the capability direction has its own structured event, not only the sovereignty one',
    run: () => {
      assert(PROVIDER_SRC.includes("tag: 'llm.capability_degradation'"), 'capability event missing');
      assert(PROVIDER_SRC.includes("tag: 'llm.sovereignty_fallback'"), 'sovereignty event missing');
    },
  },
];

// ---------------------------------------------------------------------------
// Matrix
// ---------------------------------------------------------------------------

function kills(c: Candidate): string[] {
  const out: string[] = [];
  for (const f of FALSIFIERS) {
    try { f.run(c.stamp); } catch { out.push(f.id); }
  }
  return out;
}

let lethal = true;
let discriminating = true;
const lines: string[] = [];

lines.push('CONFORMING');
const conformingKills = kills(CONFORMING);
if (conformingKills.length > 0) {
  lethal = false;
  lines.push(`  ❌ the shipped implementation FAILS: ${conformingKills.join(', ')}`);
} else {
  lines.push(`  ✅ passes all ${FALSIFIERS.length} falsifiers`);
}

for (const c of CANDIDATES) {
  const failed = kills(c);
  const survived = c.intended.filter((i) => !failed.includes(i));
  const undeclared = failed.filter((f) => !c.intended.includes(f) && !(f in c.declared));
  lines.push(`\n${c.id} — ${c.error}`);
  lines.push(`  intended kills : ${c.intended.join(', ') || '(none)'}`);
  lines.push(`  actually died  : ${failed.join(', ') || '(none)'}`);
  if (survived.length) {
    lethal = false;
    lines.push(`  ❌ SURVIVED its named falsifier(s): ${survived.join(', ')} → repair the FALSIFIER`);
  }
  for (const [id, why] of Object.entries(c.declared)) {
    if (failed.includes(id)) lines.push(`  · declared collateral ${id}: ${why}`);
  }
  if (undeclared.length) {
    discriminating = false;
    lines.push(`  ⚠️  UNDECLARED collateral: ${undeclared.join(', ')} → repair CANDIDATE ISOLATION`);
  }
}

lines.push('\nSTRUCTURAL GUARDS (shipped source only)');
let guardsOk = true;
for (const g of GUARDS) {
  try { g.run(); lines.push(`  ✅ ${g.id} — ${g.law}`); }
  catch (e: any) { guardsOk = false; lines.push(`  ❌ ${g.id} — ${g.law}\n       ${e.message}`); }
}

console.log(lines.join('\n'));
const ok = lethal && discriminating && guardsOk;
console.log(
  `\n${ok ? '✅' : '❌'} lethal=${lethal} discriminating=${discriminating} guards=${guardsOk}` +
  `  (${FALSIFIERS.length} falsifiers · ${CANDIDATES.length} defeat candidates · ${GUARDS.length} guards)`
);
process.exit(ok ? 0 : 1);
