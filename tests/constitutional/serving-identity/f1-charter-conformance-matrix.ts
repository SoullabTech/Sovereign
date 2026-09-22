/**
 * SERVING-IDENTITY / F1R1 — Founder charter conformance matrix.
 *
 * Test-only constitutional law. No runtime producer, D2 admission, D1 call,
 * disclosure rendering, routing, provider, or model behavior is created here.
 *
 * Run: npm run matrix:serving-disclosure-f1r1
 */

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const BASE = '1546ef4172b71505db6552ad81abc3d0596e81d8';

type BooleanFactName =
  | 'explicitIdentityInquiry'
  | 'explicitIdentityMismatch'
  | 'materialCapabilityEffect'
  | 'capabilityContractSatisfied';

type D2InputFactName = 'divergence' | BooleanFactName;
type Divergence = 'none' | 'capability' | 'sovereignty';

type ProducerId =
  | 'r2_serving_truth'
  | 'identity_inquiry_classifier'
  | 'identity_mismatch_evaluator'
  | 'capability_impact_assessor'
  | 'capability_contract_evaluator';

type Standing = 'served_observation' | 'classified' | 'evaluated';

type Known<T> = { status: 'known'; value: T };
type Unknown = { status: 'unknown'; reason: string };
type Conflict = { status: 'conflict'; reason: string; producers: ProducerId[] };
type FactState<T> = Known<T> | Unknown | Conflict;

interface Provenance {
  producer: ProducerId;
  turnId: string;
  version: string;
  sourceRefs: readonly string[];
  fingerprint: string;
}

interface FactRecord<T> {
  factName: D2InputFactName;
  producer: ProducerId;
  standing: Standing;
  turnId: string;
  provenance?: Provenance;
  value: T;
}

interface ServingObservation {
  source: 'r2_serving_truth' | 'routing_policy' | 'member_facing_text';
  turnId: string;
  routingContract: string;
  intended?: { provider: string; model?: string };
  served?: { provider: string; model: string };
  reason?: string;
  provenance?: Provenance;
}

interface ServingResolution {
  status: 'known' | 'unknown';
  intended?: { provider: string; model?: string };
  actual?: { provider: string; model: string };
  divergence?: Divergence;
  reason?: string;
}

const FACTS: readonly D2InputFactName[] = [
  'divergence',
  'explicitIdentityInquiry',
  'explicitIdentityMismatch',
  'materialCapabilityEffect',
  'capabilityContractSatisfied',
];

const BOOLEAN_FACTS: readonly BooleanFactName[] = [
  'explicitIdentityInquiry',
  'explicitIdentityMismatch',
  'materialCapabilityEffect',
  'capabilityContractSatisfied',
];

const AUTHORITY: Readonly<Record<D2InputFactName, ProducerId>> = {
  divergence: 'r2_serving_truth',
  explicitIdentityInquiry: 'identity_inquiry_classifier',
  explicitIdentityMismatch: 'identity_mismatch_evaluator',
  materialCapabilityEffect: 'capability_impact_assessor',
  capabilityContractSatisfied: 'capability_contract_evaluator',
};

const REQUIRED_STANDING: Readonly<Record<D2InputFactName, Standing>> = {
  divergence: 'served_observation',
  explicitIdentityInquiry: 'classified',
  explicitIdentityMismatch: 'evaluated',
  materialCapabilityEffect: 'evaluated',
  capabilityContractSatisfied: 'evaluated',
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function validProvenance(
  factName: D2InputFactName,
  producer: ProducerId,
  turnId: string,
  p?: Provenance
): boolean {
  return !!p &&
    p.producer === producer &&
    p.turnId === turnId &&
    p.version.trim().length > 0 &&
    p.sourceRefs.length > 0 &&
    p.sourceRefs.every((ref) => ref.trim().length > 0) &&
    p.fingerprint.trim().length >= 8 &&
    AUTHORITY[factName] === producer;
}

function resolveServingObservation(
  observation: ServingObservation,
  currentTurnId: string
): ServingResolution {
  if (observation.source !== 'r2_serving_truth') return { status: 'unknown' };
  if (observation.turnId !== currentTurnId) return { status: 'unknown' };
  if (!observation.intended || !observation.served) return { status: 'unknown' };
  if (!validProvenance('divergence', 'r2_serving_truth', currentTurnId, observation.provenance)) {
    return { status: 'unknown' };
  }

  const differs = observation.intended.provider !== observation.served.provider;
  if (differs && !observation.reason?.trim()) return { status: 'unknown' };

  const divergence: Divergence = !differs
    ? 'none'
    : observation.intended.provider === 'anthropic'
      ? 'capability'
      : 'sovereignty';

  return {
    status: 'known',
    intended: observation.intended,
    actual: observation.served,
    divergence,
    ...(observation.reason ? { reason: observation.reason } : {}),
  };
}

function establishFact<T>(
  factName: D2InputFactName,
  records: readonly FactRecord<T>[],
  currentTurnId: string
): FactState<T> {
  const producer = AUTHORITY[factName];
  const standing = REQUIRED_STANDING[factName];

  const admissible = records.filter((record) =>
    record.factName === factName &&
    record.producer === producer &&
    record.standing === standing &&
    record.turnId === currentTurnId &&
    validProvenance(factName, producer, currentTurnId, record.provenance)
  );

  if (admissible.length === 0) {
    return { status: 'unknown', reason: 'insufficient_evidence' };
  }

  const first = JSON.stringify(admissible[0].value);
  if (admissible.some((record) => JSON.stringify(record.value) !== first)) {
    return {
      status: 'conflict',
      reason: 'authoritative_producer_conflict',
      producers: [...new Set(admissible.map((record) => record.producer))],
    };
  }

  return { status: 'known', value: admissible[0].value };
}

interface BundleResult {
  status: 'complete' | 'incomplete';
  missing: D2InputFactName[];
  conflicts: D2InputFactName[];
}

function assembleBundle(args: {
  currentTurnId: string;
  serving: ServingObservation;
  booleans: Readonly<Partial<Record<BooleanFactName, readonly FactRecord<boolean>[]>>>;
}): BundleResult {
  const missing: D2InputFactName[] = [];
  const conflicts: D2InputFactName[] = [];

  const serving = resolveServingObservation(args.serving, args.currentTurnId);
  if (serving.status !== 'known') missing.push('divergence');

  for (const factName of BOOLEAN_FACTS) {
    const state = establishFact(
      factName,
      args.booleans[factName] ?? [],
      args.currentTurnId
    );
    if (state.status === 'unknown') missing.push(factName);
    if (state.status === 'conflict') conflicts.push(factName);
  }

  return {
    status: missing.length === 0 && conflicts.length === 0 ? 'complete' : 'incomplete',
    missing,
    conflicts,
  };
}

function provenance(
  producer: ProducerId,
  turnId = 'turn-current',
  sourceRefs: readonly string[] = ['source:1']
): Provenance {
  return {
    producer,
    turnId,
    version: 'f1r1-v1',
    sourceRefs,
    fingerprint: 'abcdef0123456789',
  };
}

function booleanRecord(
  factName: BooleanFactName,
  value: boolean,
  overrides: Partial<FactRecord<boolean>> = {}
): FactRecord<boolean> {
  const producer = AUTHORITY[factName];
  return {
    factName,
    value,
    producer,
    standing: REQUIRED_STANDING[factName],
    turnId: 'turn-current',
    provenance: provenance(producer),
    ...overrides,
  };
}

function goodServing(overrides: Partial<ServingObservation> = {}): ServingObservation {
  return {
    source: 'r2_serving_truth',
    turnId: 'turn-current',
    routingContract: 'primary',
    intended: { provider: 'anthropic', model: 'claude-sonnet-4-6' },
    served: { provider: 'local_inference', model: 'deepseek-r1:8b' },
    reason: 'intended_provider_failed',
    provenance: provenance('r2_serving_truth'),
    ...overrides,
  };
}

function completeBooleans(): Record<BooleanFactName, readonly FactRecord<boolean>[]> {
  return {
    explicitIdentityInquiry: [booleanRecord('explicitIdentityInquiry', false)],
    explicitIdentityMismatch: [booleanRecord('explicitIdentityMismatch', false)],
    materialCapabilityEffect: [booleanRecord('materialCapabilityEffect', false)],
    capabilityContractSatisfied: [booleanRecord('capabilityContractSatisfied', true)],
  };
}

type Check = { id: string; law: string; run: () => void };
const FALSIFIERS: Check[] = [
  {
    id: 'F1R1-F01',
    law: 'intended provider can never be emitted as actual provider',
    run: () => {
      const r = resolveServingObservation(goodServing(), 'turn-current');
      assert(r.status === 'known', 'serving truth unexpectedly unresolved');
      assert(r.actual?.provider === 'local_inference', 'actual provider did not come from served target');
      assert(r.actual?.provider !== r.intended?.provider, 'intended provider impersonated actual provider');
    },
  },
  {
    id: 'F1R1-F02',
    law: 'missing fact cannot default true',
    run: () => {
      const state = establishFact('explicitIdentityInquiry', [], 'turn-current');
      assert(state.status === 'unknown', 'missing inquiry defaulted to known');
    },
  },
  {
    id: 'F1R1-F03',
    law: 'missing fact cannot default false',
    run: () => {
      const state = establishFact('capabilityContractSatisfied', [], 'turn-current');
      assert(state.status === 'unknown', 'missing capability contract defaulted to known');
    },
  },
  {
    id: 'F1R1-F04',
    law: 'stale prior-turn serving truth cannot satisfy the current turn',
    run: () => {
      const r = resolveServingObservation(
        goodServing({
          turnId: 'turn-old',
          provenance: provenance('r2_serving_truth', 'turn-old'),
        }),
        'turn-current'
      );
      assert(r.status === 'unknown', 'stale serving truth became current');
    },
  },
  {
    id: 'F1R1-F05',
    law: 'contradictory authoritative records fail closed as conflict',
    run: () => {
      const state = establishFact(
        'explicitIdentityInquiry',
        [
          booleanRecord('explicitIdentityInquiry', true),
          booleanRecord('explicitIdentityInquiry', false),
        ],
        'turn-current'
      );
      assert(state.status === 'conflict', 'conflicting facts were silently collapsed');
    },
  },
  {
    id: 'F1R1-F06',
    law: 'missing provenance cannot produce a known fact',
    run: () => {
      const state = establishFact(
        'materialCapabilityEffect',
        [booleanRecord('materialCapabilityEffect', true, { provenance: undefined })],
        'turn-current'
      );
      assert(state.status === 'unknown', 'provenance-free fact became known');
    },
  },
  {
    id: 'F1R1-F07',
    law: 'ungoverned producer cannot populate a D2-required fact',
    run: () => {
      const state = establishFact(
        'explicitIdentityMismatch',
        [booleanRecord('explicitIdentityMismatch', true, {
          producer: 'identity_inquiry_classifier',
          provenance: provenance('identity_inquiry_classifier'),
        })],
        'turn-current'
      );
      assert(state.status === 'unknown', 'wrong producer gained fact authority');
    },
  },
  {
    id: 'F1R1-F08',
    law: 'member-facing text cannot manufacture a fact',
    run: () => {
      const state = establishFact(
        'explicitIdentityInquiry',
        [booleanRecord('explicitIdentityInquiry', true, {
          producer: 'capability_contract_evaluator',
          provenance: provenance('capability_contract_evaluator', 'turn-current', ['response:text']),
        })],
        'turn-current'
      );
      assert(state.status === 'unknown', 'response text became inquiry authority');
    },
  },
  {
    id: 'F1R1-F09',
    law: 'routing policy cannot establish actual served provider/model',
    run: () => {
      const r = resolveServingObservation(
        goodServing({
          source: 'routing_policy',
          served: undefined,
          reason: undefined,
          provenance: undefined,
        }),
        'turn-current'
      );
      assert(r.status === 'unknown', 'routing policy was treated as actual service');
    },
  },
  {
    id: 'F1R1-F10',
    law: 'fallback must preserve intended and actual sides of the relation',
    run: () => {
      const missingActual = resolveServingObservation(
        goodServing({ served: undefined }),
        'turn-current'
      );
      const missingIntent = resolveServingObservation(
        goodServing({ intended: undefined }),
        'turn-current'
      );
      const missingReason = resolveServingObservation(
        goodServing({ reason: undefined }),
        'turn-current'
      );
      assert(missingActual.status === 'unknown', 'fallback survived without actual target');
      assert(missingIntent.status === 'unknown', 'fallback survived without intended target');
      assert(missingReason.status === 'unknown', 'fallback survived without divergence reason');
    },
  },
  {
    id: 'F1R1-F11',
    law: 'incomplete fact bundle cannot be represented as complete',
    run: () => {
      const booleans = completeBooleans();
      booleans.materialCapabilityEffect = [];
      const result = assembleBundle({
        currentTurnId: 'turn-current',
        serving: goodServing(),
        booleans,
      });
      assert(result.status === 'incomplete', 'incomplete bundle became complete');
      assert(result.missing.includes('materialCapabilityEffect'), 'missing fact not named');
    },
  },
  {
    id: 'F1R1-F12',
    law: 'F1R1 does not invoke D1',
    run: () => {
      const self = readFileSync(
        'tests/constitutional/serving-identity/f1-charter-conformance-matrix.ts',
        'utf8'
      );
      const d1Import = ["from '../../../lib/consciousness/", "memberDisclosureDecision'"].join('');
      assert(!self.includes(d1Import), 'D1 imported');
      assert(!self.includes('decide' + 'MemberDisclosure('), 'D1 invoked');
    },
  },
  {
    id: 'F1R1-F13',
    law: 'F1R1 does not perform D2 admission',
    run: () => {
      const self = readFileSync(
        'tests/constitutional/serving-identity/f1-charter-conformance-matrix.ts',
        'utf8'
      );
      const d2Import = ["from '../../../lib/consciousness/", "disclosureFactAdmission'"].join('');
      assert(!self.includes(d2Import), 'D2 imported');
      assert(!self.includes('admit' + 'DisclosureFacts('), 'D2 admission invoked');
    },
  },
  {
    id: 'F1R1-F14',
    law: 'F1R1 changes no provider/model/routing behavior',
    run: () => {
      const changed = diffFiles();
      const forbidden = changed.filter((path) =>
        path.startsWith('lib/ai/') ||
        path.startsWith('lib/llm/') ||
        path.startsWith('app/api/') ||
        path.includes('routing') ||
        path.includes('provider') ||
        path.includes('modelGateway')
      );
      assert(forbidden.length === 0, 'routing/provider/model surface changed: ' + forbidden.join(', '));
    },
  },
  {
    id: 'F1R1-F15',
    law: 'F1R1 creates no disclosure wording or presentation authority',
    run: () => {
      const changed = diffFiles();
      const forbidden = changed.filter((path) =>
        path.startsWith('app/') ||
        path.startsWith('components/') ||
        path.includes('copy') ||
        path.includes('renderer') ||
        path.includes('presentation')
      );
      assert(forbidden.length === 0, 'member-facing surface changed: ' + forbidden.join(', '));
    },
  },
];

function diffFiles(): string[] {
  const r = spawnSync('git', ['diff', '--name-only', BASE + '..HEAD'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  assert(r.status === 0, 'git diff failed');
  return r.stdout.trim().split('\n').filter(Boolean).sort();
}

function current(path: string): string {
  return readFileSync(path, 'utf8');
}

function base(path: string): string {
  const r = spawnSync('git', ['show', BASE + ':' + path], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  assert(r.status === 0, 'git show failed: ' + path);
  return r.stdout;
}

const GUARDS: Check[] = [
  {
    id: 'F1R1-G01',
    law: 'D2 input vocabulary is closed at exactly five governed inputs',
    run: () => {
      assert(FACTS.length === 5, 'unexpected fact count');
      assert(new Set(FACTS).size === 5, 'duplicate fact name');
      const d2 = current('lib/consciousness/disclosureFactAdmission.ts');
      for (const fact of BOOLEAN_FACTS) assert(d2.includes(fact), 'D2 missing ' + fact);
      assert(d2.includes("divergence: ServingIdentity['divergence']"), 'D2 divergence input missing');
    },
  },
  {
    id: 'F1R1-G02',
    law: 'every D2 input has one closed authoritative producer and standing',
    run: () => {
      for (const fact of FACTS) {
        assert(!!AUTHORITY[fact], 'producer missing for ' + fact);
        assert(!!REQUIRED_STANDING[fact], 'standing missing for ' + fact);
      }
      assert(new Set(Object.keys(AUTHORITY)).size === FACTS.length, 'authority registry widened');
    },
  },
  {
    id: 'F1R1-G03',
    law: 'current contract admits no NOT_APPLICABLE state',
    run: () => {
      const self = current('tests/constitutional/serving-identity/f1-charter-conformance-matrix.ts');
      const token = ['NOT', 'APPLICABLE'].join('_');
      assert(!self.includes("'" + token + "'"), 'NOT_APPLICABLE entered machine contract');
    },
  },
  {
    id: 'F1R1-G04',
    law: 'complete same-turn governed bundle can be represented as complete',
    run: () => {
      const result = assembleBundle({
        currentTurnId: 'turn-current',
        serving: goodServing(),
        booleans: completeBooleans(),
      });
      assert(result.status === 'complete', 'valid bundle not complete');
      assert(result.missing.length === 0 && result.conflicts.length === 0, 'valid bundle has defects');
    },
  },
  {
    id: 'F1R1-G05',
    law: 'conflict remains machine-visible and makes bundle incomplete',
    run: () => {
      const booleans = completeBooleans();
      booleans.explicitIdentityMismatch = [
        booleanRecord('explicitIdentityMismatch', true),
        booleanRecord('explicitIdentityMismatch', false),
      ];
      const result = assembleBundle({
        currentTurnId: 'turn-current',
        serving: goodServing(),
        booleans,
      });
      assert(result.status === 'incomplete', 'conflicted bundle became complete');
      assert(result.conflicts.includes('explicitIdentityMismatch'), 'conflict not preserved');
    },
  },
  {
    id: 'F1R1-G06',
    law: 'canonical predecessor F1 contract and matrix remain present and unmodified',
    run: () => {
      for (const path of [
        'docs/architecture/SERVING_IDENTITY_F1_FACT_PRODUCTION_CONTRACT_2026-09-21.md',
        'tests/constitutional/serving-identity/disclosure-fact-production-contract-matrix.ts',
      ]) {
        assert(current(path) === base(path), path + ' changed under F1R1');
      }
    },
  },
  {
    id: 'F1R1-G07',
    law: 'canonical D2 admission matrix remains green',
    run: () => runNpm('matrix:serving-disclosure-d2'),
  },
  {
    id: 'F1R1-G08',
    law: 'canonical R2 serving-truth matrix remains green',
    run: () => runNpm('matrix:serving-identity-r2'),
  },
  {
    id: 'F1R1-G09',
    law: 'D1 and D2 runtime laws are byte-identical to F1R1 opening canonical',
    run: () => {
      for (const path of [
        'lib/consciousness/memberDisclosureDecision.ts',
        'lib/consciousness/disclosureFactAdmission.ts',
      ]) {
        assert(current(path) === base(path), path + ' changed under F1R1');
      }
    },
  },
  {
    id: 'F1R1-G10',
    law: 'F1R1 diff is contract, matrix, and package registration only',
    run: () => {
      const allowed = [
        'docs/architecture/SERVING_IDENTITY_F1R1_FOUNDER_CHARTER_CONFORMANCE_2026-09-21.md',
        'package.json',
        'tests/constitutional/serving-identity/f1-charter-conformance-matrix.ts',
      ].sort();
      const files = diffFiles();
      assert(JSON.stringify(files) === JSON.stringify(allowed), 'scope escaped: ' + files.join(', '));
    },
  },
];

function runNpm(script: string): void {
  const r = spawnSync('npm', ['run', script], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  assert(r.status === 0, script + ' exit=' + String(r.status) + '\n' + r.stdout + '\n' + r.stderr);
  assert(/PASS/.test(r.stdout), script + ' emitted no PASS marker');
}

let pass = true;
let falsifiersPassed = 0;
let guardsPassed = 0;

for (const check of FALSIFIERS) {
  try {
    check.run();
    falsifiersPassed += 1;
    console.log('PASS  ' + check.id + '  ' + check.law);
  } catch (error: any) {
    pass = false;
    console.log('FAIL  ' + check.id + '  ' + check.law);
    console.log('      ' + (error?.message ?? String(error)));
  }
}

for (const check of GUARDS) {
  try {
    check.run();
    guardsPassed += 1;
    console.log('PASS  ' + check.id + '  ' + check.law);
  } catch (error: any) {
    pass = false;
    console.log('FAIL  ' + check.id + '  ' + check.law);
    console.log('      ' + (error?.message ?? String(error)));
  }
}

console.log(
  '\nRESULT: ' +
  (pass ? 'PASS' : 'FAIL') +
  ' · ' + falsifiersPassed + '/' + FALSIFIERS.length + ' charter falsifiers · ' +
  guardsPassed + '/' + GUARDS.length + ' guards'
);

process.exit(pass ? 0 : 1);
