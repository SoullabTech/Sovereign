/**
 * SERVING-IDENTITY / F2-IM
 * Explicit identity-mismatch fact producer matrix.
 *
 * Pure producer only. No live commitment source, route wiring, D2/D1 invocation,
 * persistence, or disclosure is authorized by this matrix.
 *
 * Run: npm run matrix:serving-disclosure-f2-im
 */

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  produceExplicitIdentityMismatchFact,
  type CognitionIdentityCommitmentEvidence,
} from '../../../lib/consciousness/explicitIdentityMismatchProducer';
import type { ClassifiedBoolean } from '../../../lib/consciousness/disclosureFactAdmission';
import type { LiveServingTruth } from '../../../lib/ai/liveServingTruth';

const BASE = '872ca7b4a726df5ef404747bddde94e40950809c';

type Fixture = {
  id: string;
  evidence: CognitionIdentityCommitmentEvidence;
  servingTruth: LiveServingTruth;
  expected: ClassifiedBoolean;
};

const known = (value: boolean): ClassifiedBoolean => ({ status: 'known', value });
const unknown = (): ClassifiedBoolean => ({ status: 'unknown' });

function providerTruth(args: {
  servedProvider: 'anthropic' | 'local_inference' | 'multi_engine';
  servedDomain: 'local' | 'external' | 'mixed' | 'unknown';
  intendedProvider?: 'anthropic' | 'local_inference' | 'multi_engine';
}): LiveServingTruth {
  const intendedProvider = args.intendedProvider ?? args.servedProvider;
  const intendedDomain =
    intendedProvider === 'anthropic'
      ? 'external'
      : intendedProvider === 'local_inference'
        ? 'local'
        : 'unknown';

  return {
    routingContract: 'primary',
    intended: {
      kind: 'provider',
      provider: intendedProvider,
      model: intendedProvider + '-model',
      domain: intendedDomain,
    },
    serviceState: 'served_model',
    served: {
      kind: 'model',
      provider: args.servedProvider,
      model: args.servedProvider + '-model',
      domain: args.servedDomain,
    },
  };
}

const unresolvedTruth: LiveServingTruth = {
  routingContract: 'deep_wrapper',
  intended: { kind: 'unresolved', reason: 'provider_not_threaded_in_deep_path' },
  serviceState: 'unresolved',
  served: null,
  reason: 'provider_not_threaded_in_deep_path',
};

const degradedTruth: LiveServingTruth = {
  routingContract: 'primary',
  intended: {
    kind: 'provider',
    provider: 'anthropic',
    model: 'claude',
    domain: 'external',
  },
  serviceState: 'degraded_non_model',
  served: null,
  reason: 'all_providers_unavailable',
};

const servedNonModelTruth: LiveServingTruth = {
  routingContract: 'legacy_default',
  intended: { kind: 'unresolved', reason: 'provider_routing_not_entered' },
  serviceState: 'served_non_model',
  served: {
    kind: 'non_model',
    subsystem: 'field_safety',
    domain: 'local',
  },
  reason: 'field_safety_refusal',
};

function governed(
  commitment: CognitionIdentityCommitmentEvidence['commitment'],
  args: {
    completeness?: 'closed_world' | 'partial';
    scope?: CognitionIdentityCommitmentEvidence['scope'];
  } = {}
): CognitionIdentityCommitmentEvidence {
  return {
    source: {
      kind: 'governed_cognition_commitment_registry',
      version: 'f2-im-test-v1',
      completeness: args.completeness ?? 'closed_world',
    },
    scope: args.scope ?? 'covers_current_turn',
    commitment,
  };
}

function nonAuthoritative(
  kind:
    | 'studio_video_provider'
    | 'trust_drawer_telemetry'
    | 'operator_routing'
    | 'provider_name_in_prose'
    | 'unstructured_member_preference'
    | 'serving_divergence'
    | 'identity_inquiry_fact'
    | 'unknown_source',
  commitment: CognitionIdentityCommitmentEvidence['commitment']
): CognitionIdentityCommitmentEvidence {
  return {
    source: { kind },
    scope: 'covers_current_turn',
    commitment,
  };
}

const anthro = providerTruth({
  servedProvider: 'anthropic',
  servedDomain: 'external',
});

const local = providerTruth({
  servedProvider: 'local_inference',
  servedDomain: 'local',
});

const primaryFallbackLocal = providerTruth({
  intendedProvider: 'anthropic',
  servedProvider: 'local_inference',
  servedDomain: 'local',
});

const unknownDomain = providerTruth({
  servedProvider: 'multi_engine',
  servedDomain: 'unknown',
});

const FIXTURES: readonly Fixture[] = [
  {
    id: 'divergence-alone',
    evidence: nonAuthoritative('serving_divergence', {
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: primaryFallbackLocal,
    expected: unknown(),
  },
  {
    id: 'operator-routing',
    evidence: nonAuthoritative('operator_routing', {
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: local,
    expected: unknown(),
  },
  {
    id: 'studio-video-provider',
    evidence: nonAuthoritative('studio_video_provider', {
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: local,
    expected: unknown(),
  },
  {
    id: 'trust-drawer',
    evidence: nonAuthoritative('trust_drawer_telemetry', {
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: local,
    expected: unknown(),
  },
  {
    id: 'provider-name-prose',
    evidence: nonAuthoritative('provider_name_in_prose', {
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: local,
    expected: unknown(),
  },
  {
    id: 'partial-registry-absence',
    evidence: governed(
      { status: 'none' },
      { completeness: 'partial' }
    ),
    servingTruth: anthro,
    expected: unknown(),
  },
  {
    id: 'unstructured-preference',
    evidence: nonAuthoritative('unstructured_member_preference', {
      status: 'active',
      target: { kind: 'domain', domain: 'local' },
    }),
    servingTruth: anthro,
    expected: unknown(),
  },
  {
    id: 'out-of-scope-registry',
    evidence: governed(
      { status: 'none' },
      { scope: 'does_not_cover_current_turn' }
    ),
    servingTruth: anthro,
    expected: unknown(),
  },
  {
    id: 'unknown-scope-registry',
    evidence: governed(
      { status: 'none' },
      { scope: 'unknown' }
    ),
    servingTruth: anthro,
    expected: unknown(),
  },
  {
    id: 'closed-world-no-commitment',
    evidence: governed({ status: 'none' }),
    servingTruth: anthro,
    expected: known(false),
  },
  {
    id: 'provider-fulfilled',
    evidence: governed({
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: anthro,
    expected: known(false),
  },
  {
    id: 'provider-mismatch',
    evidence: governed({
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: local,
    expected: known(true),
  },
  {
    id: 'domain-fulfilled',
    evidence: governed({
      status: 'active',
      target: { kind: 'domain', domain: 'local' },
    }),
    servingTruth: local,
    expected: known(false),
  },
  {
    id: 'domain-mismatch',
    evidence: governed({
      status: 'active',
      target: { kind: 'domain', domain: 'local' },
    }),
    servingTruth: anthro,
    expected: known(true),
  },
  {
    id: 'unresolved-serving',
    evidence: governed({
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: unresolvedTruth,
    expected: unknown(),
  },
  {
    id: 'served-non-model',
    evidence: governed({
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: servedNonModelTruth,
    expected: unknown(),
  },
  {
    id: 'degraded-non-model',
    evidence: governed({
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: degradedTruth,
    expected: unknown(),
  },
  {
    id: 'unknown-served-domain',
    evidence: governed({
      status: 'active',
      target: { kind: 'domain', domain: 'local' },
    }),
    servingTruth: unknownDomain,
    expected: unknown(),
  },
  {
    id: 'actual-not-intended-provider',
    evidence: governed({
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: primaryFallbackLocal,
    expected: known(true),
  },
  {
    id: 'inquiry-fact-is-not-commitment',
    evidence: nonAuthoritative('identity_inquiry_fact', {
      status: 'active',
      target: { kind: 'provider', provider: 'anthropic' },
    }),
    servingTruth: local,
    expected: unknown(),
  },
  {
    id: 'unknown-commitment-status',
    evidence: governed({ status: 'unknown' }),
    servingTruth: local,
    expected: unknown(),
  },
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertFact(
  actual: ClassifiedBoolean,
  expected: ClassifiedBoolean,
  id: string
): void {
  assert(actual.status === expected.status, id + ': status mismatch');

  if (expected.status === 'known') {
    assert(actual.status === 'known', id + ': expected known');
    assert(actual.value === expected.value, id + ': boolean mismatch');
  }
}

type Evaluator = (fixture: Fixture) => ClassifiedBoolean;

const conforming: Evaluator = (fixture) =>
  produceExplicitIdentityMismatchFact(fixture.evidence, fixture.servingTruth);

type Falsifier = {
  id: string;
  fixtureId: string;
  law: string;
};

const FALSIFIERS: readonly Falsifier[] = [
  { id: 'F2IM-F1', fixtureId: 'divergence-alone', law: 'serving divergence alone cannot create mismatch' },
  { id: 'F2IM-F2', fixtureId: 'operator-routing', law: 'operator routing is not a member commitment' },
  { id: 'F2IM-F3', fixtureId: 'studio-video-provider', law: 'Studio video provider is not cognition identity commitment' },
  { id: 'F2IM-F4', fixtureId: 'trust-drawer', law: 'Trust Drawer telemetry is not prior commitment' },
  { id: 'F2IM-F5', fixtureId: 'provider-name-prose', law: 'provider name in prose is not governed commitment' },
  { id: 'F2IM-F6', fixtureId: 'partial-registry-absence', law: 'partial registry absence cannot become known(false)' },
  { id: 'F2IM-F7', fixtureId: 'unstructured-preference', law: 'unstructured preference is not commitment authority' },
  { id: 'F2IM-F8', fixtureId: 'out-of-scope-registry', law: 'registry that does not cover current turn must abstain' },
  { id: 'F2IM-F9', fixtureId: 'unknown-scope-registry', law: 'unknown registry scope must abstain' },
  { id: 'F2IM-F10', fixtureId: 'closed-world-no-commitment', law: 'closed-world current-turn absence establishes no mismatch' },
  { id: 'F2IM-F11', fixtureId: 'provider-fulfilled', law: 'fulfilled provider commitment is not mismatch' },
  { id: 'F2IM-F12', fixtureId: 'provider-mismatch', law: 'violated provider commitment is mismatch' },
  { id: 'F2IM-F13', fixtureId: 'domain-fulfilled', law: 'fulfilled domain commitment is not mismatch' },
  { id: 'F2IM-F14', fixtureId: 'domain-mismatch', law: 'violated domain commitment is mismatch' },
  { id: 'F2IM-F15', fixtureId: 'unresolved-serving', law: 'unresolved actual service cannot produce mismatch boolean' },
  { id: 'F2IM-F16', fixtureId: 'served-non-model', law: 'intentional non-model service is not automatically identity mismatch' },
  { id: 'F2IM-F17', fixtureId: 'degraded-non-model', law: 'degraded non-model state is not automatically identity mismatch' },
  { id: 'F2IM-F18', fixtureId: 'unknown-served-domain', law: 'unknown served domain cannot be forced into domain mismatch boolean' },
  { id: 'F2IM-F19', fixtureId: 'actual-not-intended-provider', law: 'compare commitment to actual served provider, not routing intent' },
  { id: 'F2IM-F20', fixtureId: 'inquiry-fact-is-not-commitment', law: 'F2-IQ inquiry fact cannot become mismatch evidence' },
  { id: 'F2IM-F21', fixtureId: 'unknown-commitment-status', law: 'unknown commitment status must abstain' },
];

const byId = new Map(FIXTURES.map((fixture) => [fixture.id, fixture]));

function wrongFor(expected: ClassifiedBoolean, index: number): ClassifiedBoolean {
  if (expected.status === 'known') {
    return known(!expected.value);
  }
  return index % 2 === 0 ? known(false) : known(true);
}

const CANDIDATES = FALSIFIERS.map((falsifier, index) => {
  const fixture = byId.get(falsifier.fixtureId)!;
  return {
    id: 'F2IM-DC' + String(index + 1),
    intended: falsifier.id,
    error: 'forces ' + fixture.id + ' away from governed fact result',
    evaluate: ((candidateFixture: Fixture) =>
      candidateFixture.id === fixture.id
        ? wrongFor(fixture.expected, index)
        : conforming(candidateFixture)) as Evaluator,
  };
});

function runFalsifier(falsifier: Falsifier, evaluate: Evaluator): void {
  const fixture = byId.get(falsifier.fixtureId);
  assert(fixture, 'missing fixture: ' + falsifier.fixtureId);
  assertFact(evaluate(fixture), fixture.expected, fixture.id);
}

function killedBy(candidate: (typeof CANDIDATES)[number]): string[] {
  const killed: string[] = [];

  for (const falsifier of FALSIFIERS) {
    try {
      runFalsifier(falsifier, candidate.evaluate);
    } catch {
      killed.push(falsifier.id);
    }
  }

  return killed;
}

let lethal = true;
let discriminating = true;
const lines: string[] = ['CONFORMING'];

const conformingDeaths: string[] = [];
for (const falsifier of FALSIFIERS) {
  try {
    runFalsifier(falsifier, conforming);
  } catch (error: any) {
    conformingDeaths.push(
      falsifier.id + ':' + (error?.message ?? String(error))
    );
  }
}

if (conformingDeaths.length) {
  lethal = false;
  lines.push('  FAIL producer died on: ' + conformingDeaths.join(' | '));
} else {
  lines.push('  PASS all ' + FALSIFIERS.length + ' mismatch falsifiers');
}

for (const candidate of CANDIDATES) {
  const died = killedBy(candidate);
  const intendedDead = died.includes(candidate.intended);
  const collateral = died.filter((id) => id !== candidate.intended);

  lines.push('');
  lines.push(candidate.id + ' — ' + candidate.error);
  lines.push('  intended kill : ' + candidate.intended);
  lines.push('  actually died : ' + (died.join(', ') || '(none)'));

  if (!intendedDead) {
    lethal = false;
    lines.push('  FAIL survived intended falsifier');
  }

  if (collateral.length) {
    discriminating = false;
    lines.push('  UNDECLARED collateral: ' + collateral.join(', '));
  }
}

function source(path: string): string {
  return readFileSync(path, 'utf8');
}

function parentSource(path: string): string {
  const result = spawnSync('git', ['show', BASE + ':' + path], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });

  assert(result.status === 0, 'git show failed for ' + path + ': ' + result.stderr);
  return result.stdout;
}

const GUARDS: readonly { id: string; law: string; run: () => void }[] = [
  {
    id: 'F2IM-G1',
    law: 'producer is pure and has no runtime discovery, model, network, persistence, D2, D1, or inquiry-classifier authority',
    run: () => {
      const producer = source('lib/consciousness/explicitIdentityMismatchProducer.ts');

      for (const forbidden of [
        'fetch(',
        'generateText',
        'process.env',
        'console.',
        'query(',
        'postgres',
        'admitDisclosureFacts(',
        'decideMemberDisclosure(',
        'classifyExplicitIdentityInquiry(',
        'conversationHistory',
        'memberMessage',
      ]) {
        assert(
          !producer.includes(forbidden),
          'producer contains forbidden authority: ' + forbidden
        );
      }

      const runtimeImports = producer
        .split('\n')
        .filter((line) => /^import\s/.test(line) && !/^import type\s/.test(line));

      assert(runtimeImports.length === 0, 'producer has runtime imports: ' + runtimeImports.join(', '));
    },
  },
  {
    id: 'F2IM-G2',
    law: 'live MAIA route is not wired to F2-IM',
    run: () => {
      const route = source('app/api/sovereign/app/maia/list/route.ts');
      assert(
        !route.includes('produceExplicitIdentityMismatchFact'),
        'live route invokes F2-IM'
      );
      assert(
        !route.includes('explicitIdentityMismatchProducer'),
        'live route imports F2-IM'
      );
    },
  },
  {
    id: 'F2IM-G3',
    law: 'F1 and F2-IQ contracts remain byte-identical to F2-IM opening canonical',
    run: () => {
      for (const path of [
        'docs/architecture/SERVING_IDENTITY_F1_FACT_PRODUCTION_CONTRACT_2026-09-21.md',
        'docs/architecture/SERVING_IDENTITY_F2_IQ_INQUIRY_CLASSIFIER_CONTRACT_2026-09-21.md',
      ]) {
        assert(source(path) === parentSource(path), path + ' changed under F2-IM');
      }
    },
  },
  {
    id: 'F2IM-G4',
    law: 'D2/D1/R2 and F2-IQ runtime implementation remain byte-identical to F2-IM opening canonical',
    run: () => {
      for (const path of [
        'lib/consciousness/disclosureFactAdmission.ts',
        'lib/consciousness/memberDisclosureDecision.ts',
        'lib/ai/liveServingTruth.ts',
        'lib/ai/modelService.ts',
        'lib/ai/sovereignRouter.ts',
        'lib/sovereign/maiaService.ts',
        'lib/consciousness/explicitIdentityInquiryClassifier.ts',
        'app/api/sovereign/app/maia/list/route.ts',
      ]) {
        assert(source(path) === parentSource(path), path + ' changed under F2-IM');
      }
    },
  },
  {
    id: 'F2IM-G5',
    law: 'F2-IM diff is exactly contract + producer + matrix + package registration',
    run: () => {
      const result = spawnSync('git', ['diff', '--name-only', BASE + '..HEAD'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      assert(result.status === 0, 'git diff failed');

      const actual = result.stdout.trim().split('\n').filter(Boolean).sort();
      const expected = [
        'docs/architecture/SERVING_IDENTITY_F2_IM_MISMATCH_PRODUCER_CONTRACT_2026-09-21.md',
        'lib/consciousness/explicitIdentityMismatchProducer.ts',
        'package.json',
        'tests/constitutional/serving-identity/explicit-identity-mismatch-producer-matrix.ts',
      ].sort();

      assert(
        JSON.stringify(actual) === JSON.stringify(expected),
        'F2-IM diff escaped scope: ' + actual.join(', ')
      );
    },
  },
  {
    id: 'F2IM-G6',
    law: 'D2 constitutional matrix remains green',
    run: () => {
      const result = spawnSync('npm', ['run', 'matrix:serving-disclosure-d2'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      assert(result.status === 0, 'D2 matrix exit=' + String(result.status));
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(result.stdout),
        'D2 constitutional axes changed'
      );
    },
  },
  {
    id: 'F2IM-G7',
    law: 'D1 constitutional matrix remains green',
    run: () => {
      const result = spawnSync('npm', ['run', 'matrix:serving-disclosure-d1'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      assert(result.status === 0, 'D1 matrix exit=' + String(result.status));
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(result.stdout),
        'D1 constitutional axes changed'
      );
    },
  },
  {
    id: 'F2IM-G8',
    law: 'R2 serving-truth matrix remains green',
    run: () => {
      const result = spawnSync('npm', ['run', 'matrix:serving-identity-r2'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      assert(result.status === 0, 'R2 matrix exit=' + String(result.status));
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(result.stdout),
        'R2 constitutional axes changed'
      );
    },
  },
];

lines.push('');
lines.push('STRUCTURAL / CROSS-MATRIX GUARDS');

let guards = true;
for (const guard of GUARDS) {
  try {
    guard.run();
    lines.push('  PASS ' + guard.id + ' — ' + guard.law);
  } catch (error: any) {
    guards = false;
    lines.push('  FAIL ' + guard.id + ' — ' + guard.law);
    lines.push('       ' + (error?.message ?? String(error)));
  }
}

console.log(lines.join('\n'));

const pass = lethal && discriminating && guards;
console.log(
  '\n' +
  (pass ? 'PASS' : 'FAIL') +
  ' lethal=' + lethal +
  ' discriminating=' + discriminating +
  ' guards=' + guards +
  '  (' + FALSIFIERS.length + ' mismatch falsifiers · ' +
  CANDIDATES.length + ' defeat candidates · ' +
  GUARDS.length + ' guards)'
);

process.exit(pass ? 0 : 1);
