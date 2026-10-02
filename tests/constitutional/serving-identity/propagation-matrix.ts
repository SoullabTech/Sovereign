/**
 * SERVING IDENTITY R1 — route -> response propagation falsifier matrix.
 *
 * Behavioural falsifiers exercise the dependency-free production projection.
 * Structural guards prove the oracle route actually carries that projection to
 * the machine-readable response boundary. R1-F6 executes the pre-existing
 * serving-identity matrix unchanged; it is not reimplemented here.
 *
 * Run: npm run matrix:serving-identity-r1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { ServingIdentity } from '../../../lib/consciousness/servingIdentity';
import {
  propagateServingIdentity,
  servingDiverged,
  type ResponseServingIdentity,
} from '../../../lib/consciousness/servingIdentityPropagation';

type Projection = Partial<ResponseServingIdentity> & Record<string, unknown>;

interface Ops {
  project: (s: ServingIdentity) => Projection;
  fallback: (s: ServingIdentity) => boolean;
}

interface Candidate {
  id: string;
  error: string;
  ops: Ops;
  intended: readonly string[];
  declared: Readonly<Record<string, string>>;
}

const project = (s: ServingIdentity): Projection => propagateServingIdentity(s);
const CONFORMING: Candidate = {
  id: 'CONFORMING',
  error: '(none — shipped propagation)',
  ops: { project, fallback: servingDiverged },
  intended: [],
  declared: {},
};

const CANDIDATES: readonly Candidate[] = [
  {
    id: 'RP-1',
    error: 'intentional local is called fallback merely because Ollama served',
    ops: { project, fallback: (s) => s.servedProvider === 'ollama' },
    intended: ['R1-F1'],
    declared: {},
  },
  {
    id: 'RP-2',
    error: 'the degraded-to-local path drops intended identity while retaining served identity and class',
    ops: {
      project: (s) => {
        const full = propagateServingIdentity(s);
        if (s.divergence !== 'capability' || s.servedProvider !== 'ollama') return full;
        const { intendedProvider: _provider, intendedModel: _model, ...servedOnly } = full;
        return servedOnly;
      },
      fallback: servingDiverged,
    },
    intended: ['R1-F2'],
    declared: {
      'R1-F4': 'dropping intended identity necessarily violates exact downstream preservation',
    },
  },
  {
    id: 'RP-3',
    error: 'healthy cloud self-service is assigned a fabricated capability divergence',
    ops: {
      project: (s) => ({
        ...propagateServingIdentity(s),
        divergence:
          s.intendedProvider === 'anthropic' && s.servedProvider === 'anthropic'
            ? 'capability'
            : s.divergence,
      }),
      fallback: servingDiverged,
    },
    intended: ['R1-F3'],
    declared: {},
  },
  {
    id: 'RP-4',
    error: 'reason is dropped during response transformation',
    ops: {
      project: (s) => {
        const { reason: _reason, ...rest } = propagateServingIdentity(s);
        return rest;
      },
      fallback: servingDiverged,
    },
    intended: ['R1-F4'],
    declared: {},
  },
  {
    id: 'RP-5',
    error: 'propagation smuggles a disclosure decision into the boundary object',
    ops: {
      project: (s) => ({ ...propagateServingIdentity(s), shouldDisclose: s.divergence !== 'none' }),
      fallback: servingDiverged,
    },
    intended: ['R1-F5'],
    declared: {},
  },
  {
    id: 'RP-6',
    error: 'downstream layer reclassifies from provider direction instead of preserving upstream class',
    ops: {
      project: (s) => ({
        ...propagateServingIdentity(s),
        divergence:
          s.intendedProvider === s.servedProvider
            ? 'none'
            : s.intendedProvider === 'anthropic'
              ? 'capability'
              : 'sovereignty',
      }),
      fallback: servingDiverged,
    },
    intended: ['R1-F7'],
    declared: {},
  },
];

const LOCAL = 'qwen3:32b';
const CLOUD = 'claude-sonnet-4-6';

const ROUTED_LOCAL: ServingIdentity = {
  intendedProvider: 'ollama',
  intendedModel: LOCAL,
  servedProvider: 'ollama',
  servedModel: LOCAL,
  divergence: 'none',
};

const DEGRADED_LOCAL: ServingIdentity = {
  intendedProvider: 'anthropic',
  intendedModel: CLOUD,
  servedProvider: 'ollama',
  servedModel: LOCAL,
  divergence: 'capability',
  reason: 'overloaded_error',
};

const CLOUD_OK: ServingIdentity = {
  intendedProvider: 'anthropic',
  intendedModel: CLOUD,
  servedProvider: 'anthropic',
  servedModel: CLOUD,
  divergence: 'none',
};

/**
 * Deliberately inconsistent with today's classifier. That is the point: a
 * propagation layer must preserve the upstream class, not silently become a
 * second classifier whose answer merely happens to agree today.
 */
const UPSTREAM_SENTINEL: ServingIdentity = {
  intendedProvider: 'anthropic',
  intendedModel: CLOUD,
  servedProvider: 'ollama',
  servedModel: LOCAL,
  divergence: 'sovereignty',
  reason: 'sentinel_upstream_class',
};

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function sameField(
  actual: Projection,
  expected: ServingIdentity,
  key: keyof ServingIdentity
): void {
  assert(actual[key] === expected[key], `${String(key)} changed: ${String(actual[key])}`);
}

type Falsifier = { id: string; law: string; run: (ops: Ops) => void };

const FALSIFIERS: readonly Falsifier[] = [
  {
    id: 'R1-F1',
    law: 'intentional local survives as local/local/none and is not labeled fallback',
    run: (ops) => {
      const r = ops.project(ROUTED_LOCAL);
      sameField(r, ROUTED_LOCAL, 'intendedProvider');
      sameField(r, ROUTED_LOCAL, 'servedProvider');
      sameField(r, ROUTED_LOCAL, 'divergence');
      assert(ops.fallback(ROUTED_LOCAL) === false, 'intentional local reported as fallback');
    },
  },
  {
    id: 'R1-F2',
    law: 'degraded-to-local preserves intended cloud, served local, and capability divergence',
    run: (ops) => {
      const r = ops.project(DEGRADED_LOCAL);
      sameField(r, DEGRADED_LOCAL, 'intendedProvider');
      sameField(r, DEGRADED_LOCAL, 'servedProvider');
      sameField(r, DEGRADED_LOCAL, 'divergence');
      assert(ops.fallback(DEGRADED_LOCAL) === true, 'real provider substitution not reported as fallback');
    },
  },
  {
    id: 'R1-F3',
    law: 'a no-divergence cloud turn remains none',
    run: (ops) => {
      const r = ops.project(CLOUD_OK);
      sameField(r, CLOUD_OK, 'divergence');
      assert(r.reason === undefined, `healthy turn acquired reason ${String(r.reason)}`);
    },
  },
  {
    id: 'R1-F4',
    law: 'every canonical serving field survives downstream transformation unchanged',
    run: (ops) => {
      const r = ops.project(DEGRADED_LOCAL);
      for (const key of [
        'intendedProvider',
        'intendedModel',
        'servedProvider',
        'servedModel',
        'divergence',
        'reason',
      ] as const) sameField(r, DEGRADED_LOCAL, key);
    },
  },
  {
    id: 'R1-F5',
    law: 'the propagation object contains serving truth only, not a disclosure decision',
    run: (ops) => {
      const r = ops.project(DEGRADED_LOCAL);
      const allowed = new Set([
        'intendedProvider',
        'intendedModel',
        'servedProvider',
        'servedModel',
        'divergence',
        'reason',
      ]);
      const extras = Object.keys(r).filter((k) => !allowed.has(k));
      assert(extras.length === 0, `non-serving fields crossed boundary: ${extras.join(', ')}`);
    },
  },
  {
    id: 'R1-F7',
    law: 'downstream projection preserves the upstream class rather than reclassifying provider direction',
    run: (ops) => {
      const r = ops.project(UPSTREAM_SENTINEL);
      assert(
        r.divergence === UPSTREAM_SENTINEL.divergence,
        `upstream ${UPSTREAM_SENTINEL.divergence} was reclassified as ${String(r.divergence)}`
      );
    },
  },
];

function kills(c: Candidate): string[] {
  const out: string[] = [];
  for (const f of FALSIFIERS) {
    try { f.run(c.ops); } catch { out.push(f.id); }
  }
  return out;
}

let lethal = true;
let discriminating = true;
const lines: string[] = ['CONFORMING'];
const conformingKills = kills(CONFORMING);
if (conformingKills.length) {
  lethal = false;
  lines.push(`  ❌ shipped propagation fails: ${conformingKills.join(', ')}`);
} else {
  lines.push(`  ✅ passes all ${FALSIFIERS.length} behavioural falsifiers`);
}

for (const c of CANDIDATES) {
  const failed = kills(c);
  const survived = c.intended.filter((id) => !failed.includes(id));
  const undeclared = failed.filter((id) => !c.intended.includes(id) && !(id in c.declared));
  lines.push(`
${c.id} — ${c.error}`);
  lines.push(`  intended kills : ${c.intended.join(', ')}`);
  lines.push(`  actually died  : ${failed.join(', ') || '(none)'}`);
  if (survived.length) {
    lethal = false;
    lines.push(`  ❌ survived named falsifier(s): ${survived.join(', ')}`);
  }
  for (const [id, why] of Object.entries(c.declared)) {
    if (failed.includes(id)) lines.push(`  · declared collateral ${id}: ${why}`);
  }
  if (undeclared.length) {
    discriminating = false;
    lines.push(`  ⚠️ undeclared collateral: ${undeclared.join(', ')}`);
  }
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const ROUTE_SRC = stripComments(
  readFileSync(join(process.cwd(), 'app/api/oracle/conversation/route.ts'), 'utf8')
);
const PROP_SRC = stripComments(
  readFileSync(join(process.cwd(), 'lib/consciousness/servingIdentityPropagation.ts'), 'utf8')
);

const GUARDS: readonly { id: string; law: string; run: () => void }[] = [
  {
    id: 'R1-G1',
    law: 'provider serving identity is projected, carried in providerMetadata, and serialized at response context',
    run: () => {
      assert(
        ROUTE_SRC.includes('servingIdentity = propagateServingIdentity(llmResponse.serving)'),
        'provider result is not projected'
      );
      assert(ROUTE_SRC.includes('serving: servingIdentity'), 'providerMetadata drops serving identity');
      assert(
        ROUTE_SRC.includes('serving: maiaResponse.providerMetadata.serving'),
        'response context drops serving identity'
      );
    },
  },
  {
    id: 'R1-G2',
    law: 'legacy fallback boolean derives from canonical divergence, not provider nomenclature',
    run: () => {
      assert(
        ROUTE_SRC.includes('usedProviderFallback = servingDiverged(llmResponse.serving)'),
        'fallback boolean does not use canonical divergence'
      );
      assert(
        !ROUTE_SRC.includes("usedProviderFallback = llmResponse.provider !== 'anthropic'"),
        'old provider-name inference remains'
      );
    },
  },
  {
    id: 'R1-G3',
    law: 'propagation module cannot reclassify or decide disclosure',
    run: () => {
      assert(!PROP_SRC.includes('classifyDivergence'), 'propagation imports or calls classifier');
      assert(!/shouldDisclose|mustDisclose|disclosureRequired/.test(PROP_SRC), 'disclosure decision entered propagation');
    },
  },
  {
    id: 'R1-G4 / R1-F6',
    law: 'pre-existing serving-identity matrix remains lethal, discriminating, 4/4 guards, exit 0',
    run: () => {
      const tsxBin = process.env.MAIA_TSX_BIN ?? 'tsx';
      const child = spawnSync(tsxBin, ['tests/constitutional/serving-identity/matrix.ts'], {
        cwd: process.cwd(),
        encoding: 'utf8',
      });
      assert(child.status === 0, `existing matrix exit ${String(child.status)}
${child.stdout}
${child.stderr}`);
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(child.stdout),
        'existing matrix no longer reports lethal + discriminating + guards'
      );
      assert(/4 guards/.test(child.stdout), 'existing matrix no longer reports 4 guards');
    },
  },
];

lines.push('\nSTRUCTURAL / CROSS-MATRIX GUARDS');
let guardsOk = true;
for (const g of GUARDS) {
  try {
    g.run();
    lines.push(`  ✅ ${g.id} — ${g.law}`);
  } catch (e: any) {
    guardsOk = false;
    lines.push(`  ❌ ${g.id} — ${g.law}
       ${e.message}`);
  }
}

console.log(lines.join('\n'));
const ok = lethal && discriminating && guardsOk;
console.log(
  `
${ok ? '✅' : '❌'} lethal=${lethal} discriminating=${discriminating} guards=${guardsOk}` +
  `  (${FALSIFIERS.length} behavioural falsifiers · ${CANDIDATES.length} defeat candidates · ${GUARDS.length} guards; R1-F6 executed by guard)`
);
process.exit(ok ? 0 : 1);
