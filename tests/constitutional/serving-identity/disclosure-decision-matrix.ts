/**
 * SERVING IDENTITY D1 — pure member-disclosure decision falsifier matrix.
 *
 * D1 is intentionally dependency-free. It receives classified facts and decides
 * obligation only. It does not inspect raw member language, classify serving,
 * infer materiality from provider names, or compose disclosure copy.
 *
 * Run: npm run matrix:serving-disclosure-d1
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  decideMemberDisclosure,
  type MemberDisclosureDecision,
  type MemberDisclosureDecisionInput,
} from '../../../lib/consciousness/memberDisclosureDecision';

type ProviderProbe = 'ollama' | 'anthropic';

interface Fixture extends MemberDisclosureDecisionInput {
  /** Test-only fields used solely to model prohibited downstream implementations. */
  testIntendedProvider?: ProviderProbe;
  testServedProvider?: ProviderProbe;
}

type DecisionLike = MemberDisclosureDecision & Record<string, unknown>;
type Evaluator = (input: Fixture) => DecisionLike;

interface Candidate {
  id: string;
  error: string;
  evaluate: Evaluator;
  intended: readonly string[];
  declared: Readonly<Record<string, string>>;
}

function productionInput(f: Fixture): MemberDisclosureDecisionInput {
  return {
    divergence: f.divergence,
    explicitIdentityInquiry: f.explicitIdentityInquiry,
    explicitIdentityMismatch: f.explicitIdentityMismatch,
    materialCapabilityEffect: f.materialCapabilityEffect,
    capabilityContractSatisfied: f.capabilityContractSatisfied,
  };
}

const conforming: Evaluator = (f) => decideMemberDisclosure(productionInput(f));

const CANDIDATES: readonly Candidate[] = [
  {
    id: 'DD-0',
    error: 'mere healthy serving telemetry creates a disclosure obligation',
    evaluate: (f) => {
      const ordinaryHealthyTelemetry =
        f.divergence === 'none' &&
        !f.explicitIdentityInquiry &&
        !f.explicitIdentityMismatch &&
        !f.materialCapabilityEffect &&
        f.capabilityContractSatisfied &&
        f.testIntendedProvider === undefined &&
        f.testServedProvider === undefined;
      return ordinaryHealthyTelemetry
        ? { required: true, basis: 'material_capability_effect' }
        : conforming(f);
    },
    intended: ['D1-F1'],
    declared: {},
  },
  {
    id: 'DD-1',
    error: 'any canonical divergence automatically forces disclosure',
    evaluate: (f) =>
      f.divergence !== 'none'
        ? { required: true, basis: 'material_capability_effect' }
        : conforming(f),
    intended: ['D1-F2'],
    declared: {},
  },
  {
    id: 'DD-2',
    error: 'material capability facts and capability-contract failure are ignored',
    evaluate: (f) => {
      if (f.explicitIdentityInquiry) {
        return { required: true, basis: 'explicit_identity_inquiry' };
      }
      if (f.explicitIdentityMismatch) {
        return { required: true, basis: 'explicit_identity_mismatch' };
      }
      return { required: false, basis: 'none' };
    },
    intended: ['D1-F3'],
    declared: {},
  },
  {
    id: 'DD-3',
    error: 'explicit identity inquiry is ignored',
    evaluate: (f) => {
      if (f.explicitIdentityMismatch) {
        return { required: true, basis: 'explicit_identity_mismatch' };
      }
      if (f.materialCapabilityEffect || !f.capabilityContractSatisfied) {
        return { required: true, basis: 'material_capability_effect' };
      }
      return { required: false, basis: 'none' };
    },
    intended: ['D1-F4'],
    declared: {},
  },
  {
    id: 'DD-4',
    error: 'explicit selected/promised identity mismatch is ignored',
    evaluate: (f) => {
      if (f.explicitIdentityInquiry) {
        return { required: true, basis: 'explicit_identity_inquiry' };
      }
      if (f.materialCapabilityEffect || !f.capabilityContractSatisfied) {
        return { required: true, basis: 'material_capability_effect' };
      }
      return { required: false, basis: 'none' };
    },
    intended: ['D1-F5'],
    declared: {},
  },
  {
    id: 'DD-5',
    error: 'local provider nomenclature manufactures materiality',
    evaluate: (f) =>
      f.testServedProvider === 'ollama'
        ? { required: true, basis: 'material_capability_effect' }
        : conforming(f),
    intended: ['D1-F6'],
    declared: {},
  },
  {
    id: 'DD-6',
    error: 'pure decision output smuggles member-facing copy',
    evaluate: (f) => ({
      ...conforming(f),
      message: 'A provider change occurred.',
    }),
    intended: ['D1-F8'],
    declared: {},
  },
  {
    id: 'DD-7',
    error: 'downstream evaluator reclassifies serving from provider direction',
    evaluate: (f) => {
      if (
        f.testIntendedProvider !== undefined &&
        f.testServedProvider !== undefined &&
        f.testIntendedProvider !== f.testServedProvider
      ) {
        return { required: true, basis: 'material_capability_effect' };
      }
      return conforming(f);
    },
    intended: ['D1-F9'],
    declared: {},
  },
];

const HEALTHY: Fixture = {
  divergence: 'none',
  explicitIdentityInquiry: false,
  explicitIdentityMismatch: false,
  materialCapabilityEffect: false,
  capabilityContractSatisfied: true,
};

const NON_MATERIAL_DIVERGENCE: Fixture = {
  divergence: 'capability',
  explicitIdentityInquiry: false,
  explicitIdentityMismatch: false,
  materialCapabilityEffect: false,
  capabilityContractSatisfied: true,
};

const MATERIAL_EFFECT: Fixture = {
  divergence: 'capability',
  explicitIdentityInquiry: false,
  explicitIdentityMismatch: false,
  materialCapabilityEffect: true,
  capabilityContractSatisfied: true,
};

const CONTRACT_UNSATISFIED: Fixture = {
  divergence: 'none',
  explicitIdentityInquiry: false,
  explicitIdentityMismatch: false,
  materialCapabilityEffect: false,
  capabilityContractSatisfied: false,
};

const EXPLICIT_INQUIRY: Fixture = {
  divergence: 'none',
  explicitIdentityInquiry: true,
  explicitIdentityMismatch: false,
  materialCapabilityEffect: false,
  capabilityContractSatisfied: true,
};

const EXPLICIT_MISMATCH: Fixture = {
  divergence: 'none',
  explicitIdentityInquiry: false,
  explicitIdentityMismatch: true,
  materialCapabilityEffect: false,
  capabilityContractSatisfied: true,
};

const PROVIDER_NAME_ONLY: Fixture = {
  ...HEALTHY,
  testIntendedProvider: 'ollama',
  testServedProvider: 'ollama',
};

const RECLASSIFICATION_SENTINEL: Fixture = {
  ...HEALTHY,
  // Deliberately inconsistent with canonical divergence. A D1 implementation
  // that independently compares providers will override upstream authority.
  testIntendedProvider: 'ollama',
  testServedProvider: 'anthropic',
};

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function expectDecision(
  evaluate: Evaluator,
  fixture: Fixture,
  required: boolean,
  basis: MemberDisclosureDecision['basis']
): void {
  const result = evaluate(fixture);
  assert(result.required === required, `required=${String(result.required)}, expected ${required}`);
  assert(result.basis === basis, `basis=${String(result.basis)}, expected ${basis}`);
}

type Falsifier = { id: string; law: string; run: (evaluate: Evaluator) => void };

const FALSIFIERS: readonly Falsifier[] = [
  {
    id: 'D1-F1',
    law: 'healthy serving telemetry alone does not force disclosure',
    run: (evaluate) => expectDecision(evaluate, HEALTHY, false, 'none'),
  },
  {
    id: 'D1-F2',
    law: 'non-material canonical divergence may remain undisclosed',
    run: (evaluate) => expectDecision(evaluate, NON_MATERIAL_DIVERGENCE, false, 'none'),
  },
  {
    id: 'D1-F3',
    law: 'material capability effect or unsatisfied capability contract requires disclosure',
    run: (evaluate) => {
      expectDecision(evaluate, MATERIAL_EFFECT, true, 'material_capability_effect');
      expectDecision(evaluate, CONTRACT_UNSATISFIED, true, 'material_capability_effect');
    },
  },
  {
    id: 'D1-F4',
    law: 'explicit identity inquiry requires disclosure regardless of divergence',
    run: (evaluate) => expectDecision(evaluate, EXPLICIT_INQUIRY, true, 'explicit_identity_inquiry'),
  },
  {
    id: 'D1-F5',
    law: 'explicit selected/promised identity mismatch requires disclosure',
    run: (evaluate) => expectDecision(evaluate, EXPLICIT_MISMATCH, true, 'explicit_identity_mismatch'),
  },
  {
    id: 'D1-F6',
    law: 'provider nomenclature alone cannot manufacture materiality',
    run: (evaluate) => expectDecision(evaluate, PROVIDER_NAME_ONLY, false, 'none'),
  },
  {
    id: 'D1-F8',
    law: 'pure evaluator returns decision data only and no member-facing copy',
    run: (evaluate) => {
      const result = evaluate(HEALTHY);
      const keys = Object.keys(result).sort();
      assert(
        keys.length === 2 && keys[0] === 'basis' && keys[1] === 'required',
        `unexpected output fields: ${keys.join(', ')}`
      );
    },
  },
  {
    id: 'D1-F9',
    law: 'D1 preserves upstream serving authority and does not reclassify provider direction',
    run: (evaluate) => expectDecision(evaluate, RECLASSIFICATION_SENTINEL, false, 'none'),
  },
];

function kills(c: Candidate): string[] {
  const out: string[] = [];
  for (const f of FALSIFIERS) {
    try { f.run(c.evaluate); } catch { out.push(f.id); }
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
  lines.push(`  FAIL shipped evaluator: ${conformingKills.join(', ')}`);
} else {
  lines.push(`  PASS all ${FALSIFIERS.length} behavioural falsifiers`);
}

for (const c of CANDIDATES) {
  const failed = kills(c);
  const survived = c.intended.filter((id) => !failed.includes(id));
  const undeclared = failed.filter((id) => !c.intended.includes(id) && !(id in c.declared));
  lines.push(`\n${c.id} — ${c.error}`);
  lines.push(`  intended kills : ${c.intended.join(', ')}`);
  lines.push(`  actually died  : ${failed.join(', ') || '(none)'}`);
  if (survived.length) {
    lethal = false;
    lines.push(`  FAIL survived named falsifier(s): ${survived.join(', ')}`);
  }
  for (const [id, why] of Object.entries(c.declared)) {
    if (failed.includes(id)) lines.push(`  declared collateral ${id}: ${why}`);
  }
  if (undeclared.length) {
    discriminating = false;
    lines.push(`  UNDECLARED collateral: ${undeclared.join(', ')}`);
  }
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const DECISION_SRC = stripComments(
  readFileSync(join(process.cwd(), 'lib/consciousness/memberDisclosureDecision.ts'), 'utf8')
);

const inputBody =
  DECISION_SRC.match(/export interface MemberDisclosureDecisionInput\s*\{([\s\S]*?)\}/)?.[1] ?? '';
const outputBody =
  DECISION_SRC.match(/export interface MemberDisclosureDecision\s*\{([\s\S]*?)\}/)?.[1] ?? '';

const GUARDS: readonly { id: string; law: string; run: () => void }[] = [
  {
    id: 'D1-G1',
    law: 'D1 is pure and has no runtime provider, environment, network, clock, log, or filesystem authority',
    run: () => {
      assert(!/process\.|fetch\s*\(|console\.|Date\.|Math\.random|child_process|node:fs/.test(DECISION_SRC), 'side-effect/runtime authority found');
      const imports = DECISION_SRC.match(/^import .*$/gm) ?? [];
      assert(imports.every((line) => line.startsWith('import type ')), `runtime import found: ${imports.join(' | ')}`);
    },
  },
  {
    id: 'D1-G2 / D1-F7',
    law: 'distress is absent from the D1 contract and therefore cannot suppress a required disclosure',
    run: () => {
      assert(inputBody.length > 0, 'input contract not found');
      assert(!/distress|crisis|emotion|affect/i.test(inputBody), 'distress-like input entered D1 contract');
    },
  },
  {
    id: 'D1-G3',
    law: 'D1 consumes classified facts, not raw member content',
    run: () => {
      const forbidden = /message|transcript|prompt|therapy|memberName|userInput|personalContext|rawContent/i;
      assert(!forbidden.test(inputBody), `raw-content field entered D1 input: ${inputBody.trim()}`);
    },
  },
  {
    id: 'D1-G4',
    law: 'classification remains upstream; D1 contains no provider nomenclature or serving reclassification',
    run: () => {
      assert(!/classifyDivergence/.test(DECISION_SRC), 'D1 calls serving classifier');
      assert(!/intendedProvider|servedProvider|ollama|anthropic/.test(DECISION_SRC), 'provider nomenclature entered production D1');
    },
  },
  {
    id: 'D1-G5 / D1-F8',
    law: 'D1 output contract contains required + basis only',
    run: () => {
      assert(outputBody.length > 0, 'output contract not found');
      const fields = [...outputBody.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*):/gm)].map((m) => m[1]).sort();
      assert(fields.join(',') === 'basis,required', `unexpected output contract: ${fields.join(',')}`);
    },
  },
  {
    id: 'D1-G6',
    law: 'original serving-identity matrix remains lethal, discriminating, 4/4 guards, exit 0',
    run: () => {
      const child = spawnSync('npm', ['run', 'matrix:serving-identity'], {
        cwd: process.cwd(),
        encoding: 'utf8',
      });
      assert(child.status === 0, `serving matrix exit ${String(child.status)}\n${child.stdout}\n${child.stderr}`);
      assert(/lethal=true\s+discriminating=true\s+guards=true/.test(child.stdout), 'serving matrix axes changed');
      assert(/4 guards/.test(child.stdout), 'serving matrix no longer reports 4 guards');
    },
  },
  {
    id: 'D1-G7',
    law: 'R1 propagation matrix remains lethal, discriminating, 4/4 guards, exit 0',
    run: () => {
      const child = spawnSync('npm', ['run', 'matrix:serving-identity-r1'], {
        cwd: process.cwd(),
        encoding: 'utf8',
      });
      assert(child.status === 0, `R1 matrix exit ${String(child.status)}\n${child.stdout}\n${child.stderr}`);
      assert(/lethal=true\s+discriminating=true\s+guards=true/.test(child.stdout), 'R1 matrix axes changed');
      assert(/4 guards/.test(child.stdout), 'R1 matrix no longer reports 4 guards');
    },
  },
];

lines.push('\nSTRUCTURAL / CROSS-MATRIX GUARDS');
let guardsOk = true;
for (const g of GUARDS) {
  try {
    g.run();
    lines.push(`  PASS ${g.id} — ${g.law}`);
  } catch (e: any) {
    guardsOk = false;
    lines.push(`  FAIL ${g.id} — ${g.law}\n       ${e.message}`);
  }
}

console.log(lines.join('\n'));
const ok = lethal && discriminating && guardsOk;
console.log(
  `\n${ok ? 'PASS' : 'FAIL'} lethal=${lethal} discriminating=${discriminating} guards=${guardsOk}` +
  `  (${FALSIFIERS.length} behavioural falsifiers · ${CANDIDATES.length} defeat candidates · ${GUARDS.length} guards)`
);
process.exit(ok ? 0 : 1);
