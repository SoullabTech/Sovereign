/**
 * SERVING-IDENTITY / R2 — live serving-truth executable falsifier matrix.
 *
 * Run: npm run matrix:serving-identity-r2
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  degradedNonModelTruth,
  intendedDomain,
  intendedProvider,
  servedNonModelTruth,
  truthFromProviderMeta,
  unresolvedIntent,
  unresolvedServingTruth,
  type LiveServingTruth,
} from '../../../lib/ai/liveServingTruth';
import type { ProviderMeta } from '../../../lib/ai/types';

const AUTHORIZED_PARENT = '22c529daedf9e992c2b044bd0462e14b880302bf';

type CaseName =
  | 'primary_cloud'
  | 'primary_local'
  | 'sovereign_local'
  | 'degraded_non_model'
  | 'deep_unresolved'
  | 'multi_engine'
  | 'field_safety'
  | 'rcn';

type Evaluation = {
  truth: (name: CaseName) => any;
  routeAuthority: 'live' | 'legacy_oracle' | 'dormant_sovereign';
  downstreamClassifier: boolean;
  disclosureSmuggled: boolean;
  routingChanged: boolean;
};

type Candidate = {
  id: string;
  error: string;
  evaluate: Evaluation;
  intended: readonly string[];
  declared: Readonly<Record<string, string>>;
};

const anthropicMeta: ProviderMeta = {
  provider: 'anthropic',
  model: 'claude-sonnet',
  mode: 'full',
};

const localMeta: ProviderMeta = {
  provider: 'local_inference',
  model: 'qwen3-coder',
  mode: 'full',
};

const multiMeta: ProviderMeta = {
  provider: 'multi_engine',
  model: 'orchestration:primary',
  mode: 'full',
};

function truthFor(name: CaseName): LiveServingTruth {
  switch (name) {
    case 'primary_cloud':
      return truthFromProviderMeta({
        routingContract: 'primary',
        intended: intendedProvider('anthropic'),
        provider: anthropicMeta,
      });
    case 'primary_local':
      return truthFromProviderMeta({
        routingContract: 'primary',
        intended: intendedProvider('anthropic'),
        provider: localMeta,
        reason: 'intended_provider_failed',
      });
    case 'sovereign_local':
      return truthFromProviderMeta({
        routingContract: 'sovereign',
        intended: intendedDomain('local', 'routing_contract_sovereign'),
        provider: localMeta,
      });
    case 'degraded_non_model':
      return degradedNonModelTruth({
        routingContract: 'local_only',
        intended: intendedDomain('local', 'routing_contract_local_only'),
        reason: 'all_providers_unavailable',
      });
    case 'deep_unresolved':
      return unresolvedServingTruth({
        routingContract: 'deep_wrapper',
        intended: unresolvedIntent('deep_provider_not_threaded'),
        reason: 'provider_not_threaded_in_deep_path',
      });
    case 'multi_engine':
      return truthFromProviderMeta({
        routingContract: 'multi_engine',
        intended: intendedProvider('multi_engine'),
        provider: multiMeta,
      });
    case 'field_safety':
      return servedNonModelTruth({
        routingContract: 'unknown',
        intended: unresolvedIntent('provider_routing_not_entered'),
        subsystem: 'field_safety',
        domain: 'local',
        reason: 'field_safety_refusal',
      });
    case 'rcn':
      return servedNonModelTruth({
        routingContract: 'unknown',
        intended: unresolvedIntent('provider_routing_bypassed_by_rcn'),
        subsystem: 'rcn',
        domain: 'local',
        reason: 'high_confidence_rcn',
      });
  }
}

const conforming: Evaluation = {
  truth: truthFor,
  routeAuthority: 'live',
  downstreamClassifier: false,
  disclosureSmuggled: false,
  routingChanged: false,
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

type Falsifier = {
  id: string;
  law: string;
  run: (evaluation: Evaluation) => void;
};

const FALSIFIERS: readonly Falsifier[] = [
  {
    id: 'R2D-F1',
    law: 'served-only identity cannot collapse primary->local with intentional sovereign local',
    run: (e) => {
      const fallback = e.truth('primary_local');
      const intentional = e.truth('sovereign_local');
      assert(
        fallback.routingContract !== intentional.routingContract ||
          JSON.stringify(fallback.intended) !== JSON.stringify(intentional.intended),
        'intent/routing distinction was lost'
      );
    },
  },
  {
    id: 'R2D-F2',
    law: 'intentional local service is not fallback/degraded merely because local served',
    run: (e) => {
      const t = e.truth('sovereign_local');
      assert(t.serviceState === 'served_model', 'intentional local was not served_model');
      assert(t.served?.kind === 'model', 'intentional local lost model service');
    },
  },
  {
    id: 'R2D-F3',
    law: 'provider difference alone does not turn a successful fallback model response into non-model degradation',
    run: (e) => {
      const t = e.truth('primary_local');
      assert(t.serviceState === 'served_model', 'provider difference manufactured non-model degradation');
      assert(t.served?.kind === 'model', 'fallback model service was erased');
    },
  },
  {
    id: 'R2D-F4',
    law: 'degraded non-model response cannot impersonate successful model service',
    run: (e) => {
      const t = e.truth('degraded_non_model');
      assert(t.serviceState === 'degraded_non_model', 'degraded state changed');
      assert(t.served === null, 'degraded non-model response claims a served target');
    },
  },
  {
    id: 'R2D-F5',
    law: 'DEEP provider_not_threaded remains unresolved and unguessed',
    run: (e) => {
      const t = e.truth('deep_unresolved');
      assert(t.serviceState === 'unresolved', 'DEEP unknown was guessed/classified');
      assert(t.served === null, 'DEEP unresolved claims a served target');
    },
  },
  {
    id: 'R2D-F6',
    law: 'live authority must be /api/sovereign/app/maia/list',
    run: (e) => assert(e.routeAuthority === 'live', 'implementation authority is a retired route'),
  },
  {
    id: 'R2D-F7',
    law: 'response route may not create a second serving classifier',
    run: (e) => assert(!e.downstreamClassifier, 'downstream classifier present'),
  },
  {
    id: 'R2D-F8',
    law: 'serving truth may not smuggle disclosure policy/presentation',
    run: (e) => assert(!e.disclosureSmuggled, 'disclosure field smuggled into serving truth'),
  },
  {
    id: 'R2D-F9',
    law: 'serving-truth implementation may not change provider routing behavior',
    run: (e) => assert(!e.routingChanged, 'routing behavior changed'),
  },
  {
    id: 'R2-F10',
    law: 'intentional non-model service is not degraded',
    run: (e) => {
      for (const name of ['field_safety', 'rcn'] as const) {
        assert(
          e.truth(name).serviceState !== 'degraded_non_model',
          name + ' mislabeled as degradation'
        );
      }
    },
  },
  {
    id: 'R2-F11',
    law: 'known non-model service is not unresolved',
    run: (e) => {
      const t = e.truth('rcn');
      assert(t.serviceState !== 'unresolved', 'known RCN producer became unresolved');
    },
  },
  {
    id: 'R2-F12',
    law: 'non-model subsystem cannot impersonate provider/model service',
    run: (e) => {
      const t = e.truth('field_safety');
      assert(t.serviceState !== 'served_model', 'field safety became model service');
      assert(t.served?.kind !== 'model', 'field safety manufactured provider service');
    },
  },
];

function variant(base: Evaluation, override: Partial<Evaluation>): Evaluation {
  return { ...base, ...override };
}

const CANDIDATES: readonly Candidate[] = [
  {
    id: 'R2-DC1',
    error: 'primary->local drops routing intent and is made identical to sovereign local',
    evaluate: variant(conforming, {
      truth: (name) => {
        if (name !== 'primary_local') return truthFor(name);
        return clone(truthFor('sovereign_local'));
      },
    }),
    intended: ['R2D-F1'],
    declared: {},
  },
  {
    id: 'R2-DC2',
    error: 'intentional sovereign local is labeled degraded',
    evaluate: variant(conforming, {
      truth: (name) => {
        if (name !== 'sovereign_local') return truthFor(name);
        const t = clone(truthFor(name));
        t.serviceState = 'degraded_non_model';
        t.served = null;
        return t;
      },
    }),
    intended: ['R2D-F2'],
    declared: {},
  },
  {
    id: 'R2-DC3',
    error: 'provider difference on primary fallback is treated as non-model degradation',
    evaluate: variant(conforming, {
      truth: (name) => {
        if (name !== 'primary_local') return truthFor(name);
        const t = clone(truthFor(name));
        t.serviceState = 'degraded_non_model';
        t.served = null;
        return t;
      },
    }),
    intended: ['R2D-F3'],
    declared: {},
  },
  {
    id: 'R2-DC4',
    error: 'deterministic degradation impersonates a served unknown model',
    evaluate: variant(conforming, {
      truth: (name) => {
        if (name !== 'degraded_non_model') return truthFor(name);
        const t: any = clone(truthFor(name));
        t.serviceState = 'served_model';
        t.served = { kind: 'model', provider: 'unknown', model: 'degraded', domain: 'unknown' };
        return t;
      },
    }),
    intended: ['R2D-F4'],
    declared: {},
  },
  {
    id: 'R2-DC5',
    error: 'DEEP unresolved provider is guessed as Anthropic',
    evaluate: variant(conforming, {
      truth: (name) => {
        if (name !== 'deep_unresolved') return truthFor(name);
        const t: any = clone(truthFor(name));
        t.serviceState = 'served_model';
        t.served = { kind: 'model', provider: 'anthropic', model: 'guessed', domain: 'external' };
        return t;
      },
    }),
    intended: ['R2D-F5'],
    declared: {},
  },
  {
    id: 'R2-DC6',
    error: 'implementation is proven only on the retired oracle route',
    evaluate: variant(conforming, { routeAuthority: 'legacy_oracle' }),
    intended: ['R2D-F6'],
    declared: {},
  },
  {
    id: 'R2-DC7',
    error: 'live response boundary creates its own divergence classifier',
    evaluate: variant(conforming, { downstreamClassifier: true }),
    intended: ['R2D-F7'],
    declared: {},
  },
  {
    id: 'R2-DC8',
    error: 'serving truth contains disclosure authority',
    evaluate: variant(conforming, { disclosureSmuggled: true }),
    intended: ['R2D-F8'],
    declared: {},
  },
  {
    id: 'R2-DC9',
    error: 'metadata implementation changes provider routing',
    evaluate: variant(conforming, { routingChanged: true }),
    intended: ['R2D-F9'],
    declared: {},
  },
  {
    id: 'R2-DC10',
    error: 'field-safety intentional service is called degraded',
    evaluate: variant(conforming, {
      truth: (name) => {
        if (name !== 'field_safety') return truthFor(name);
        const t = clone(truthFor(name));
        t.serviceState = 'degraded_non_model';
        t.served = null;
        return t;
      },
    }),
    intended: ['R2-F10'],
    declared: {},
  },
  {
    id: 'R2-DC11',
    error: 'known RCN producer is called unresolved because ProviderMeta is absent',
    evaluate: variant(conforming, {
      truth: (name) => {
        if (name !== 'rcn') return truthFor(name);
        const t = clone(truthFor(name));
        t.serviceState = 'unresolved';
        t.served = null;
        return t;
      },
    }),
    intended: ['R2-F11'],
    declared: {},
  },
  {
    id: 'R2-DC12',
    error: 'field-safety subsystem impersonates provider/model service',
    evaluate: variant(conforming, {
      truth: (name) => {
        if (name !== 'field_safety') return truthFor(name);
        const t: any = clone(truthFor(name));
        t.serviceState = 'served_model';
        t.served = { kind: 'model', provider: 'unknown', model: 'field_safety', domain: 'local' };
        return t;
      },
    }),
    intended: ['R2-F12'],
    declared: {},
  },
];

function kills(c: Candidate): string[] {
  const out: string[] = [];
  for (const f of FALSIFIERS) {
    try {
      f.run(c.evaluate);
    } catch {
      out.push(f.id);
    }
  }
  return out;
}

let lethal = true;
let discriminating = true;
const lines: string[] = ['CONFORMING'];

const conformingKills = kills({
  id: 'CONFORMING',
  error: '(none)',
  evaluate: conforming,
  intended: [],
  declared: {},
});

if (conformingKills.length) {
  lethal = false;
  lines.push('  FAIL shipped truth model: ' + conformingKills.join(', '));
} else {
  lines.push('  PASS all ' + FALSIFIERS.length + ' behavioural falsifiers');
}

for (const c of CANDIDATES) {
  const failed = kills(c);
  const survived = c.intended.filter((id) => !failed.includes(id));
  const undeclared = failed.filter(
    (id) => !c.intended.includes(id) && !(id in c.declared)
  );

  lines.push('');
  lines.push(c.id + ' — ' + c.error);
  lines.push('  intended kills : ' + c.intended.join(', '));
  lines.push('  actually died  : ' + (failed.join(', ') || '(none)'));

  if (survived.length) {
    lethal = false;
    lines.push('  FAIL survived named falsifier(s): ' + survived.join(', '));
  }

  for (const [id, why] of Object.entries(c.declared)) {
    if (failed.includes(id)) lines.push('  declared collateral ' + id + ': ' + why);
  }

  if (undeclared.length) {
    discriminating = false;
    lines.push('  UNDECLARED collateral: ' + undeclared.join(', '));
  }
}

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function parentSource(path: string): string {
  const child = spawnSync('git', ['show', AUTHORIZED_PARENT + ':' + path], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  assert(child.status === 0, 'git show failed for ' + path + ': ' + child.stderr);
  return child.stdout;
}

function orderedFingerprint(src: string, markers: readonly string[]): string[] {
  const hits: Array<{ marker: string; index: number }> = [];
  for (const marker of markers) {
    let at = 0;
    while ((at = src.indexOf(marker, at)) !== -1) {
      hits.push({ marker, index: at });
      at += marker.length;
    }
  }
  return hits.sort((a, b) => a.index - b.index).map((x) => x.marker);
}

const MODEL_ROUTING_MARKERS = [
  'if (MAIA_INFERENCE_MODE)',
  "if (TEXT_MODEL_PROVIDER === 'openai' as any)",
  'if (ENABLE_MULTI_ENGINE &&',
  "if (TEXT_MODEL_PROVIDER === 'moonshot' || req.meta?.useKimi)",
  "if (TEXT_MODEL_PROVIDER === 'anthropic' || TEXT_MODEL_PROVIDER === 'moonshot')",
  "if (error?.noFallback || error?.code === 'ANTHROPIC_BILLING_ERROR')",
  "if (process.env.SMOKE_NO_FALLBACK === '1')",
  'generateWithMultipleEngines(',
  'generateWithKimi(',
  'generateWithClaude(',
  'generateWithLocalModel(',
] as const;

const SOVEREIGN_ROUTING_MARKERS = [
  "if (mode === 'sovereign' || mode === 'local_only')",
  'isLocalHealthy()',
  'callLocalInference(req)',
  "if (mode === 'primary')",
  'generateWithClaude({',
  "if (err?.noFallback || err?.code === 'ANTHROPIC_BILLING_ERROR')",
  "emitDriftEvent('silent_fallback'",
] as const;

const GUARDS: readonly { id: string; law: string; run: () => void }[] = [
  {
    id: 'R2-G1',
    law: 'authoritative /list response carries servingTruth',
    run: () => {
      const live = source('app/api/sovereign/app/maia/list/route.ts');
      assert(
        live.includes('servingTruth: orchestratorResult.servingTruth ?? null'),
        'live /list boundary does not carry servingTruth'
      );
    },
  },
  {
    id: 'R2-G2',
    law: 'retired routes cannot satisfy live-route authority',
    run: () => {
      const oracle = source('app/api/oracle/conversation/route.ts');
      const dormant = source('app/api/sovereign/app/maia/route.ts');
      assert(oracle.includes('status: 410'), 'oracle route no longer proves disabled status');
      assert(
        dormant.includes('STATUS:        dormant') &&
          dormant.includes('SUPERSEDED BY: /api/sovereign/app/maia/list'),
        'dormant route authority header changed'
      );
    },
  },
  {
    id: 'R2-G3',
    law: 'routing intent is stamped upstream rather than reconstructed in /list',
    run: () => {
      const model = source('lib/ai/modelService.ts');
      const sovereign = source('lib/ai/sovereignRouter.ts');
      const live = source('app/api/sovereign/app/maia/list/route.ts');
      assert(model.includes('stampServingTruth'), 'model gateway has no serving stamp');
      assert(sovereign.includes('stampServing'), 'sovereign router has no serving stamp');
      assert(!live.includes('MAIA_INFERENCE_MODE'), '/list reconstructs inference mode');
      assert(!live.includes('TEXT_MODEL_PROVIDER'), '/list reconstructs configured provider intent');
    },
  },
  {
    id: 'R2-G4',
    law: '/list carries truth and does not create an independent serving classifier',
    run: () => {
      const live = source('app/api/sovereign/app/maia/list/route.ts');
      assert(!live.includes('classifyDivergence'), '/list invokes legacy classifier');
      assert(!live.includes("serviceState: 'served_"), '/list authors service state');
      assert(!live.includes("serviceState: 'degraded_"), '/list authors degradation state');
    },
  },
  {
    id: 'R2-G5',
    law: 'live serving-truth contract contains no disclosure authority or presentation',
    run: () => {
      const contract = source('lib/ai/liveServingTruth.ts');
      assert(
        !/shouldDisclose|mustDisclose|disclosureRequired|memberFacing|banner|toast|uiSeverity|voiceCopy/.test(contract),
        'disclosure/presentation field entered serving truth'
      );
    },
  },
  {
    id: 'R2-G6',
    law: 'provider routing control flow fingerprint is unchanged from authorized parent',
    run: () => {
      const currentModel = orderedFingerprint(source('lib/ai/modelService.ts'), MODEL_ROUTING_MARKERS);
      const parentModel = orderedFingerprint(parentSource('lib/ai/modelService.ts'), MODEL_ROUTING_MARKERS);
      const currentSovereign = orderedFingerprint(source('lib/ai/sovereignRouter.ts'), SOVEREIGN_ROUTING_MARKERS);
      const parentSovereign = orderedFingerprint(parentSource('lib/ai/sovereignRouter.ts'), SOVEREIGN_ROUTING_MARKERS);
      assert(
        JSON.stringify(currentModel) === JSON.stringify(parentModel),
        'modelService routing fingerprint changed'
      );
      assert(
        JSON.stringify(currentSovereign) === JSON.stringify(parentSovereign),
        'sovereignRouter routing fingerprint changed'
      );
    },
  },
  {
    id: 'R2-G7',
    law: 'legacy two-provider ServingIdentity law is byte-identical to authorized parent',
    run: () => {
      assert(
        source('lib/consciousness/servingIdentity.ts') ===
          parentSource('lib/consciousness/servingIdentity.ts'),
        'legacy ServingIdentity changed'
      );
    },
  },
  {
    id: 'R2-G8',
    law: 'degraded non-model state has no served provider/model target',
    run: () => {
      const t = truthFor('degraded_non_model');
      assert(t.serviceState === 'degraded_non_model' && t.served === null, 'degraded representation invalid');
    },
  },
  {
    id: 'R2-G9',
    law: 'unresolved provider state remains unresolved with no served target',
    run: () => {
      const t = truthFor('deep_unresolved');
      assert(t.serviceState === 'unresolved' && t.served === null, 'unresolved representation invalid');
    },
  },
  {
    id: 'R2-G10',
    law: 'field-safety and RCN are explicit served_non_model producers',
    run: () => {
      const service = source('lib/sovereign/maiaService.ts');
      assert(service.includes("subsystem: 'field_safety'"), 'field-safety truth missing');
      assert(service.includes("subsystem: 'rcn'"), 'RCN truth missing');
      assert(service.includes("reason: 'maia_processing_failed'"), 'deterministic degraded fallback truth missing');
    },
  },
  {
    id: 'R2-G11',
    law: 'prior constitutional matrices remain green',
    run: () => {
      for (const script of [
        'matrix:serving-identity',
        'matrix:serving-identity-r1',
        'matrix:serving-disclosure-d1',
        'matrix:serving-disclosure-d2',
      ]) {
        const child = spawnSync('npm', ['run', script], {
          cwd: process.cwd(),
          encoding: 'utf8',
        });
        assert(child.status === 0, script + ' exit=' + String(child.status) + '\n' + child.stdout + '\n' + child.stderr);
        assert(
          /lethal=true\s+discriminating=true\s+guards=true/.test(child.stdout),
          script + ' constitutional axes changed'
        );
      }
    },
  },
];

lines.push('');
lines.push('STRUCTURAL / CROSS-MATRIX GUARDS');
let guardsOk = true;

for (const g of GUARDS) {
  try {
    g.run();
    lines.push('  PASS ' + g.id + ' — ' + g.law);
  } catch (e: any) {
    guardsOk = false;
    lines.push('  FAIL ' + g.id + ' — ' + g.law);
    lines.push('       ' + e.message);
  }
}

console.log(lines.join('\n'));

const ok = lethal && discriminating && guardsOk;
console.log(
  '\n' +
    (ok ? 'PASS' : 'FAIL') +
    ' lethal=' +
    lethal +
    ' discriminating=' +
    discriminating +
    ' guards=' +
    guardsOk +
    '  (' +
    FALSIFIERS.length +
    ' behavioural falsifiers · ' +
    CANDIDATES.length +
    ' defeat candidates · ' +
    GUARDS.length +
    ' guards)'
);

process.exit(ok ? 0 : 1);
