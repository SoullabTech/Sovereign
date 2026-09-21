/**
 * SERVING-IDENTITY / F1 — disclosure fact-production contract matrix.
 *
 * Test-only epistemic contract. This file does not build or wire a runtime fact
 * producer and does not invoke D1 or D2.
 *
 * Run: npm run matrix:serving-disclosure-f1
 */

import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import type { ClassifiedBoolean } from '../../../lib/consciousness/disclosureFactAdmission';

const BASE = 'bcd4debfed1285d2ff14829db7f117ffaff05f11';

const known = (value: boolean): ClassifiedBoolean => ({ status: 'known', value });
const unknown = (): ClassifiedBoolean => ({ status: 'unknown' });

type InquiryEvidence =
  | {
      kind: 'governed_current_turn_classification';
      result: 'explicit' | 'not_explicit' | 'ambiguous';
      classifierVersion: string;
    }
  | { kind: 'serving_divergence'; divergence: string }
  | { kind: 'lexical_absence'; absentTerms: readonly string[] }
  | { kind: 'prior_turn_inquiry'; explicit: true };

type CommitmentTarget =
  | { kind: 'provider'; provider: string }
  | { kind: 'domain'; domain: 'local' | 'external' | 'mixed' | 'unknown' };

type ServedTarget =
  | { kind: 'provider'; provider: string; domain: 'local' | 'external' | 'mixed' | 'unknown' }
  | null;

type MismatchEvidence =
  | {
      kind: 'commitment_registry';
      completeness: 'closed_world' | 'partial';
      commitment: CommitmentTarget | null;
      served: ServedTarget;
      servedResolved: boolean;
    }
  | { kind: 'serving_divergence'; divergence: string }
  | { kind: 'studio_video_provider_agreement'; provider: string }
  | { kind: 'trust_drawer_provider_used'; provider: string }
  | { kind: 'operator_inference_mode'; mode: string };

type MaterialityEvidence =
  | {
      kind: 'governed_capability_assessment';
      completeness: 'complete' | 'partial';
      result: 'material' | 'not_material' | 'indeterminate';
      assessmentVersion: string;
    }
  | { kind: 'provider_change'; intended: string; served: string }
  | { kind: 'service_state_only'; state: string }
  | { kind: 'latency_only'; latencyMs: number }
  | { kind: 'identity_mismatch_fact'; value: boolean };

type CapabilityContractEvidence =
  | {
      kind: 'governed_contract_evaluation';
      contractStatus: 'active' | 'stale' | 'absent';
      completeness: 'complete' | 'partial';
      result: 'satisfied' | 'violated' | 'indeterminate';
      contractVersion?: string;
    }
  | { kind: 'provider_success'; provider: string }
  | { kind: 'serving_divergence'; divergence: string }
  | { kind: 'trust_drawer_provider_used'; provider: string }
  | { kind: 'degraded_copy_present'; copyId: string };

type Evaluator = {
  inquiry: (e: InquiryEvidence) => ClassifiedBoolean;
  mismatch: (e: MismatchEvidence) => ClassifiedBoolean;
  materiality: (e: MaterialityEvidence) => ClassifiedBoolean;
  capabilityContract: (e: CapabilityContractEvidence) => ClassifiedBoolean;
};

function targetMatches(commitment: CommitmentTarget, served: Exclude<ServedTarget, null>): boolean {
  if (commitment.kind === 'provider') return commitment.provider === served.provider;
  return commitment.domain === served.domain;
}

const conforming: Evaluator = {
  inquiry(e) {
    if (e.kind !== 'governed_current_turn_classification') return unknown();
    if (e.result === 'explicit') return known(true);
    if (e.result === 'not_explicit') return known(false);
    return unknown();
  },

  mismatch(e) {
    if (e.kind !== 'commitment_registry') return unknown();
    if (e.completeness !== 'closed_world') return unknown();

    if (e.commitment === null) return known(false);
    if (!e.servedResolved || e.served === null) return unknown();

    return known(!targetMatches(e.commitment, e.served));
  },

  materiality(e) {
    if (e.kind !== 'governed_capability_assessment') return unknown();
    if (e.completeness !== 'complete') return unknown();
    if (e.result === 'material') return known(true);
    if (e.result === 'not_material') return known(false);
    return unknown();
  },

  capabilityContract(e) {
    if (e.kind !== 'governed_contract_evaluation') return unknown();
    if (e.contractStatus !== 'active') return unknown();
    if (e.completeness !== 'complete') return unknown();
    if (e.result === 'satisfied') return known(true);
    if (e.result === 'violated') return known(false);
    return unknown();
  },
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectUnknown(value: ClassifiedBoolean, message: string): void {
  assert(value.status === 'unknown', message);
}

function expectKnown(value: ClassifiedBoolean, expected: boolean, message: string): void {
  assert(value.status === 'known' && value.value === expected, message);
}

type Falsifier = {
  id: string;
  law: string;
  run: (e: Evaluator) => void;
};

const FALSIFIERS: readonly Falsifier[] = [
  {
    id: 'F1-F1',
    law: 'serving divergence cannot manufacture an explicit identity inquiry',
    run: (e) => expectUnknown(
      e.inquiry({ kind: 'serving_divergence', divergence: 'capability' }),
      'divergence became identity inquiry'
    ),
  },
  {
    id: 'F1-F2',
    law: 'lexical absence cannot establish that no explicit identity inquiry occurred',
    run: (e) => expectUnknown(
      e.inquiry({ kind: 'lexical_absence', absentTerms: ['provider', 'model', 'claude'] }),
      'absence of provider words became known(false)'
    ),
  },
  {
    id: 'F1-F3',
    law: 'ambiguous current-turn inquiry classification must abstain',
    run: (e) => expectUnknown(
      e.inquiry({
        kind: 'governed_current_turn_classification',
        result: 'ambiguous',
        classifierVersion: 'f1-test',
      }),
      'ambiguous inquiry became known'
    ),
  },
  {
    id: 'F1-F4',
    law: 'serving divergence alone cannot establish an explicit identity mismatch',
    run: (e) => expectUnknown(
      e.mismatch({ kind: 'serving_divergence', divergence: 'sovereignty' }),
      'divergence became commitment mismatch'
    ),
  },
  {
    id: 'F1-F5',
    law: 'Studio video-provider agreement cannot become cognition identity commitment',
    run: (e) => expectUnknown(
      e.mismatch({ kind: 'studio_video_provider_agreement', provider: 'zoom' }),
      'video transport agreement became cognition mismatch'
    ),
  },
  {
    id: 'F1-F6',
    law: 'Trust Drawer served-provider telemetry cannot become a prior identity commitment',
    run: (e) => expectUnknown(
      e.mismatch({ kind: 'trust_drawer_provider_used', provider: 'anthropic' }),
      'retrospective provider telemetry became commitment'
    ),
  },
  {
    id: 'F1-F7',
    law: 'partial commitment registry cannot default missing commitment to no-mismatch',
    run: (e) => expectUnknown(
      e.mismatch({
        kind: 'commitment_registry',
        completeness: 'partial',
        commitment: null,
        served: { kind: 'provider', provider: 'anthropic', domain: 'external' },
        servedResolved: true,
      }),
      'partial registry absence became known(false)'
    ),
  },
  {
    id: 'F1-F8',
    law: 'provider/model change alone cannot establish material capability effect',
    run: (e) => expectUnknown(
      e.materiality({ kind: 'provider_change', intended: 'anthropic', served: 'local_inference' }),
      'provider difference became materiality'
    ),
  },
  {
    id: 'F1-F9',
    law: 'degraded/non-model service state alone cannot establish materiality',
    run: (e) => expectUnknown(
      e.materiality({ kind: 'service_state_only', state: 'degraded_non_model' }),
      'service state alone became materiality'
    ),
  },
  {
    id: 'F1-F10',
    law: 'successful provider response cannot establish capability-contract satisfaction',
    run: (e) => expectUnknown(
      e.capabilityContract({ kind: 'provider_success', provider: 'anthropic' }),
      'provider success became contract satisfaction'
    ),
  },
  {
    id: 'F1-F11',
    law: 'absent, stale, or partial capability contract evidence must remain unknown',
    run: (e) => {
      for (const evidence of [
        {
          kind: 'governed_contract_evaluation',
          contractStatus: 'absent',
          completeness: 'complete',
          result: 'satisfied',
        },
        {
          kind: 'governed_contract_evaluation',
          contractStatus: 'stale',
          completeness: 'complete',
          result: 'satisfied',
          contractVersion: 'old',
        },
        {
          kind: 'governed_contract_evaluation',
          contractStatus: 'active',
          completeness: 'partial',
          result: 'satisfied',
          contractVersion: 'v1',
        },
      ] as const) {
        expectUnknown(e.capabilityContract(evidence), 'incomplete contract evidence became known');
      }
    },
  },
  {
    id: 'F1-F12',
    law: 'identity mismatch fact cannot manufacture material capability effect',
    run: (e) => expectUnknown(
      e.materiality({ kind: 'identity_mismatch_fact', value: true }),
      'identity mismatch was coupled into materiality'
    ),
  },
];

type Candidate = {
  id: string;
  error: string;
  intended: string;
  evaluate: Evaluator;
};

function withOverride<K extends keyof Evaluator>(
  key: K,
  fn: Evaluator[K]
): Evaluator {
  return { ...conforming, [key]: fn };
}

const CANDIDATES: readonly Candidate[] = [
  {
    id: 'F1-DC1',
    error: 'any serving divergence is treated as an identity inquiry',
    intended: 'F1-F1',
    evaluate: withOverride('inquiry', (e) =>
      e.kind === 'serving_divergence' ? known(true) : conforming.inquiry(e)
    ),
  },
  {
    id: 'F1-DC2',
    error: 'absence of provider vocabulary is treated as proof no inquiry occurred',
    intended: 'F1-F2',
    evaluate: withOverride('inquiry', (e) =>
      e.kind === 'lexical_absence' ? known(false) : conforming.inquiry(e)
    ),
  },
  {
    id: 'F1-DC3',
    error: 'ambiguous inquiry language defaults false',
    intended: 'F1-F3',
    evaluate: withOverride('inquiry', (e) =>
      e.kind === 'governed_current_turn_classification' && e.result === 'ambiguous'
        ? known(false)
        : conforming.inquiry(e)
    ),
  },
  {
    id: 'F1-DC4',
    error: 'serving divergence is treated as a member commitment mismatch',
    intended: 'F1-F4',
    evaluate: withOverride('mismatch', (e) =>
      e.kind === 'serving_divergence' ? known(true) : conforming.mismatch(e)
    ),
  },
  {
    id: 'F1-DC5',
    error: 'Studio video provider is treated as cognition provider commitment',
    intended: 'F1-F5',
    evaluate: withOverride('mismatch', (e) =>
      e.kind === 'studio_video_provider_agreement' ? known(true) : conforming.mismatch(e)
    ),
  },
  {
    id: 'F1-DC6',
    error: 'Trust Drawer actual provider is treated as a prior promise',
    intended: 'F1-F6',
    evaluate: withOverride('mismatch', (e) =>
      e.kind === 'trust_drawer_provider_used' ? known(true) : conforming.mismatch(e)
    ),
  },
  {
    id: 'F1-DC7',
    error: 'partial registry absence defaults to no commitment mismatch',
    intended: 'F1-F7',
    evaluate: withOverride('mismatch', (e) =>
      e.kind === 'commitment_registry' && e.completeness === 'partial' && e.commitment === null
        ? known(false)
        : conforming.mismatch(e)
    ),
  },
  {
    id: 'F1-DC8',
    error: 'provider substitution itself is declared materially capability-changing',
    intended: 'F1-F8',
    evaluate: withOverride('materiality', (e) =>
      e.kind === 'provider_change' ? known(true) : conforming.materiality(e)
    ),
  },
  {
    id: 'F1-DC9',
    error: 'degraded service-state label alone is declared material',
    intended: 'F1-F9',
    evaluate: withOverride('materiality', (e) =>
      e.kind === 'service_state_only' ? known(true) : conforming.materiality(e)
    ),
  },
  {
    id: 'F1-DC10',
    error: 'successful provider response is treated as capability-contract satisfaction',
    intended: 'F1-F10',
    evaluate: withOverride('capabilityContract', (e) =>
      e.kind === 'provider_success' ? known(true) : conforming.capabilityContract(e)
    ),
  },
  {
    id: 'F1-DC11',
    error: 'missing/stale/partial contract evidence defaults satisfied',
    intended: 'F1-F11',
    evaluate: withOverride('capabilityContract', (e) => {
      if (
        e.kind === 'governed_contract_evaluation' &&
        (e.contractStatus !== 'active' || e.completeness !== 'complete')
      ) {
        return known(true);
      }
      return conforming.capabilityContract(e);
    }),
  },
  {
    id: 'F1-DC12',
    error: 'identity mismatch is automatically treated as material capability effect',
    intended: 'F1-F12',
    evaluate: withOverride('materiality', (e) =>
      e.kind === 'identity_mismatch_fact' && e.value
        ? known(true)
        : conforming.materiality(e)
    ),
  },
];

function killedBy(candidate: Candidate): string[] {
  const killed: string[] = [];
  for (const f of FALSIFIERS) {
    try {
      f.run(candidate.evaluate);
    } catch {
      killed.push(f.id);
    }
  }
  return killed;
}

let lethal = true;
let discriminating = true;
const lines: string[] = ['CONFORMING'];

const conformingDeaths: string[] = [];
for (const f of FALSIFIERS) {
  try {
    f.run(conforming);
  } catch {
    conformingDeaths.push(f.id);
  }
}

if (conformingDeaths.length) {
  lethal = false;
  lines.push('  FAIL conforming died on: ' + conformingDeaths.join(', '));
} else {
  lines.push('  PASS all ' + FALSIFIERS.length + ' shortcut falsifiers');
}

for (const c of CANDIDATES) {
  const died = killedBy(c);
  const survived = !died.includes(c.intended);
  const collateral = died.filter((id) => id !== c.intended);

  lines.push('');
  lines.push(c.id + ' — ' + c.error);
  lines.push('  intended kill : ' + c.intended);
  lines.push('  actually died : ' + (died.join(', ') || '(none)'));

  if (survived) {
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
  const r = spawnSync('git', ['show', BASE + ':' + path], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });
  assert(r.status === 0, 'git show failed for ' + path + ': ' + r.stderr);
  return r.stdout;
}

const GUARDS: readonly { id: string; law: string; run: () => void }[] = [
  {
    id: 'F1-G1',
    law: 'governed current-turn inquiry classification can establish true and false while preserving abstention',
    run: () => {
      expectKnown(conforming.inquiry({
        kind: 'governed_current_turn_classification',
        result: 'explicit',
        classifierVersion: 'v1',
      }), true, 'explicit inquiry not admitted');
      expectKnown(conforming.inquiry({
        kind: 'governed_current_turn_classification',
        result: 'not_explicit',
        classifierVersion: 'v1',
      }), false, 'not-explicit inquiry not admitted');
      expectUnknown(conforming.inquiry({
        kind: 'governed_current_turn_classification',
        result: 'ambiguous',
        classifierVersion: 'v1',
      }), 'ambiguous inquiry did not abstain');
    },
  },
  {
    id: 'F1-G2',
    law: 'closed-world cognition commitment registry plus resolved serving truth can establish mismatch true/false',
    run: () => {
      expectKnown(conforming.mismatch({
        kind: 'commitment_registry',
        completeness: 'closed_world',
        commitment: null,
        served: { kind: 'provider', provider: 'anthropic', domain: 'external' },
        servedResolved: true,
      }), false, 'closed-world no-commitment was not known(false)');

      expectKnown(conforming.mismatch({
        kind: 'commitment_registry',
        completeness: 'closed_world',
        commitment: { kind: 'provider', provider: 'anthropic' },
        served: { kind: 'provider', provider: 'local_inference', domain: 'local' },
        servedResolved: true,
      }), true, 'provider mismatch was not known(true)');

      expectKnown(conforming.mismatch({
        kind: 'commitment_registry',
        completeness: 'closed_world',
        commitment: { kind: 'domain', domain: 'local' },
        served: { kind: 'provider', provider: 'local_inference', domain: 'local' },
        servedResolved: true,
      }), false, 'fulfilled domain commitment was not known(false)');

      expectUnknown(conforming.mismatch({
        kind: 'commitment_registry',
        completeness: 'closed_world',
        commitment: { kind: 'provider', provider: 'anthropic' },
        served: null,
        servedResolved: false,
      }), 'unresolved serving target became mismatch decision');
    },
  },
  {
    id: 'F1-G3',
    law: 'complete governed capability assessment can establish material true/false only',
    run: () => {
      expectKnown(conforming.materiality({
        kind: 'governed_capability_assessment',
        completeness: 'complete',
        result: 'material',
        assessmentVersion: 'v1',
      }), true, 'material assessment not admitted');

      expectKnown(conforming.materiality({
        kind: 'governed_capability_assessment',
        completeness: 'complete',
        result: 'not_material',
        assessmentVersion: 'v1',
      }), false, 'non-material assessment not admitted');

      expectUnknown(conforming.materiality({
        kind: 'governed_capability_assessment',
        completeness: 'complete',
        result: 'indeterminate',
        assessmentVersion: 'v1',
      }), 'indeterminate capability assessment became known');

      expectUnknown(conforming.materiality({
        kind: 'governed_capability_assessment',
        completeness: 'partial',
        result: 'not_material',
        assessmentVersion: 'v1',
      }), 'partial capability assessment became known');
    },
  },
  {
    id: 'F1-G4',
    law: 'active complete capability-contract evaluation can establish satisfied true/false only',
    run: () => {
      expectKnown(conforming.capabilityContract({
        kind: 'governed_contract_evaluation',
        contractStatus: 'active',
        completeness: 'complete',
        result: 'satisfied',
        contractVersion: 'v1',
      }), true, 'satisfied contract not admitted');

      expectKnown(conforming.capabilityContract({
        kind: 'governed_contract_evaluation',
        contractStatus: 'active',
        completeness: 'complete',
        result: 'violated',
        contractVersion: 'v1',
      }), false, 'violated contract not admitted');

      expectUnknown(conforming.capabilityContract({
        kind: 'governed_contract_evaluation',
        contractStatus: 'active',
        completeness: 'complete',
        result: 'indeterminate',
        contractVersion: 'v1',
      }), 'indeterminate contract evaluation became known');
    },
  },
  {
    id: 'F1-G5',
    law: 'D1 and D2 production laws remain byte-identical to F1 opening canonical',
    run: () => {
      for (const path of [
        'lib/consciousness/memberDisclosureDecision.ts',
        'lib/consciousness/disclosureFactAdmission.ts',
      ]) {
        assert(source(path) === parentSource(path), path + ' changed under F1');
      }
    },
  },
  {
    id: 'F1-G6',
    law: 'F1 creates no runtime fact-producer module',
    run: () => {
      for (const path of [
        'lib/consciousness/disclosureFactProduction.ts',
        'lib/consciousness/disclosureFactProducer.ts',
        'lib/consciousness/disclosureFactProducers.ts',
      ]) {
        assert(!existsSync(path), 'runtime producer exists under F1: ' + path);
      }
    },
  },
  {
    id: 'F1-G7',
    law: 'F1 matrix does not invoke D1 or D2',
    run: () => {
      const self = source('tests/constitutional/serving-identity/disclosure-fact-production-contract-matrix.ts');
      assert(!self.includes('decideMemberDisclosure('), 'F1 invokes D1');
      assert(!self.includes('admitDisclosureFacts('), 'F1 invokes D2');
    },
  },
  {
    id: 'F1-G8',
    law: 'F1 diff is design/matrix/package registration only',
    run: () => {
      const r = spawnSync('git', ['diff', '--name-only', BASE + '..HEAD'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      assert(r.status === 0, 'git diff failed');
      const files = r.stdout.trim().split('\n').filter(Boolean).sort();
      const allowed = [
        'docs/architecture/SERVING_IDENTITY_F1_FACT_PRODUCTION_CONTRACT_2026-09-21.md',
        'package.json',
        'tests/constitutional/serving-identity/disclosure-fact-production-contract-matrix.ts',
      ].sort();
      assert(JSON.stringify(files) === JSON.stringify(allowed), 'F1 diff escaped bounded scope: ' + files.join(', '));
    },
  },
  {
    id: 'F1-G9',
    law: 'prior D2 admission matrix remains green',
    run: () => {
      const r = spawnSync('npm', ['run', 'matrix:serving-disclosure-d2'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      assert(r.status === 0, 'D2 matrix exit=' + String(r.status));
      assert(/lethal=true\s+discriminating=true\s+guards=true/.test(r.stdout), 'D2 matrix constitutional axes changed');
    },
  },
  {
    id: 'F1-G10',
    law: 'canonical R2 serving-truth matrix remains green',
    run: () => {
      const r = spawnSync('npm', ['run', 'matrix:serving-identity-r2'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      assert(r.status === 0, 'R2 matrix exit=' + String(r.status));
      assert(/lethal=true\s+discriminating=true\s+guards=true/.test(r.stdout), 'R2 matrix constitutional axes changed');
    },
  },
];

lines.push('');
lines.push('POSITIVE / STRUCTURAL GUARDS');

let guards = true;
for (const g of GUARDS) {
  try {
    g.run();
    lines.push('  PASS ' + g.id + ' — ' + g.law);
  } catch (err: any) {
    guards = false;
    lines.push('  FAIL ' + g.id + ' — ' + g.law);
    lines.push('       ' + (err?.message ?? String(err)));
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
    '  (' + FALSIFIERS.length + ' shortcut falsifiers · ' +
    CANDIDATES.length + ' defeat candidates · ' +
    GUARDS.length + ' guards)'
);

process.exit(pass ? 0 : 1);
