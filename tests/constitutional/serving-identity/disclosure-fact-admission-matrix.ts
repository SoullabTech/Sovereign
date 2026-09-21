/**
 * SERVING IDENTITY D2 — disclosure-fact admission falsifier matrix.
 *
 * D2 does not decide disclosure. It admits a complete set of classified facts
 * to D1 or refuses admission. UNKNOWN is neither false nor true.
 *
 * Run: npm run matrix:serving-disclosure-d2
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  admitDisclosureFacts,
  type ClassifiedBoolean,
  type DisclosureFactAdmission,
  type DisclosureFactPacket,
} from '../../../lib/consciousness/disclosureFactAdmission';

type ProviderProbe = 'ollama' | 'anthropic';

interface Fixture extends DisclosureFactPacket {
  /** Test-only probes used solely to model prohibited downstream implementations. */
  testIntendedProvider?: ProviderProbe;
  testServedProvider?: ProviderProbe;
}

type AdmissionLike = DisclosureFactAdmission & Record<string, unknown>;
type Admit = (packet: Fixture) => AdmissionLike;

interface Candidate {
  id: string;
  error: string;
  admit: Admit;
  intended: readonly string[];
  declared: Readonly<Record<string, string>>;
}

const known = (value: boolean): ClassifiedBoolean => ({ status: 'known', value });
const unknown = (): ClassifiedBoolean => ({ status: 'unknown' });

function productionPacket(f: Fixture): DisclosureFactPacket {
  return {
    divergence: f.divergence,
    explicitIdentityInquiry: f.explicitIdentityInquiry,
    explicitIdentityMismatch: f.explicitIdentityMismatch,
    materialCapabilityEffect: f.materialCapabilityEffect,
    capabilityContractSatisfied: f.capabilityContractSatisfied,
  };
}

const conforming: Admit = (f) => admitDisclosureFacts(productionPacket(f));

const FULLY_KNOWN: Fixture = {
  divergence: 'sovereignty',
  explicitIdentityInquiry: known(false),
  explicitIdentityMismatch: known(true),
  materialCapabilityEffect: known(false),
  capabilityContractSatisfied: known(true),
};

const UNKNOWN_INQUIRY: Fixture = {
  ...FULLY_KNOWN,
  divergence: 'none',
  explicitIdentityInquiry: unknown(),
  explicitIdentityMismatch: known(false),
};

const UNKNOWN_MISMATCH: Fixture = {
  ...FULLY_KNOWN,
  divergence: 'none',
  explicitIdentityInquiry: known(false),
  explicitIdentityMismatch: unknown(),
};

const UNKNOWN_MATERIALITY: Fixture = {
  ...FULLY_KNOWN,
  divergence: 'capability',
  explicitIdentityInquiry: known(false),
  explicitIdentityMismatch: known(false),
  materialCapabilityEffect: unknown(),
};

const UNKNOWN_CONTRACT: Fixture = {
  ...FULLY_KNOWN,
  divergence: 'none',
  explicitIdentityInquiry: known(false),
  explicitIdentityMismatch: known(false),
  materialCapabilityEffect: known(false),
  capabilityContractSatisfied: unknown(),
};

const TWO_UNKNOWN: Fixture = {
  ...FULLY_KNOWN,
  divergence: 'capability',
  explicitIdentityInquiry: unknown(),
  explicitIdentityMismatch: known(false),
  materialCapabilityEffect: unknown(),
  capabilityContractSatisfied: known(true),
};

const ALL_UNKNOWN: Fixture = {
  divergence: 'capability',
  explicitIdentityInquiry: unknown(),
  explicitIdentityMismatch: unknown(),
  materialCapabilityEffect: unknown(),
  capabilityContractSatisfied: unknown(),
};

const RECLASSIFICATION_SENTINEL: Fixture = {
  ...FULLY_KNOWN,
  divergence: 'none',
  explicitIdentityMismatch: known(false),
  testIntendedProvider: 'ollama',
  testServedProvider: 'anthropic',
};

const COPY_SENTINEL: Fixture = {
  divergence: 'capability',
  explicitIdentityInquiry: known(true),
  explicitIdentityMismatch: known(false),
  materialCapabilityEffect: known(false),
  capabilityContractSatisfied: known(true),
};

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function expectInsufficient(
  admit: Admit,
  fixture: Fixture,
  missing: readonly string[]
): void {
  const result = admit(fixture);
  assert(result.status === 'insufficient_facts', 'packet was admitted');
  assert(
    JSON.stringify(result.missing) === JSON.stringify(missing),
    'missing=' + JSON.stringify(result.missing) + ', expected ' + JSON.stringify(missing)
  );
  assert(!('required' in result), 'D2 emitted a disclosure decision');
}

function expectAdmittedExact(admit: Admit, fixture: Fixture): void {
  const result = admit(fixture);
  assert(result.status === 'admitted', 'fully-known packet was refused');
  const expected = {
    divergence: fixture.divergence,
    explicitIdentityInquiry: fixture.explicitIdentityInquiry.status === 'known'
      ? fixture.explicitIdentityInquiry.value
      : undefined,
    explicitIdentityMismatch: fixture.explicitIdentityMismatch.status === 'known'
      ? fixture.explicitIdentityMismatch.value
      : undefined,
    materialCapabilityEffect: fixture.materialCapabilityEffect.status === 'known'
      ? fixture.materialCapabilityEffect.value
      : undefined,
    capabilityContractSatisfied: fixture.capabilityContractSatisfied.status === 'known'
      ? fixture.capabilityContractSatisfied.value
      : undefined,
  };
  assert(
    JSON.stringify(result.input) === JSON.stringify(expected),
    'admitted input changed semantics: ' + JSON.stringify(result.input)
  );
}

type Falsifier = { id: string; law: string; run: (admit: Admit) => void };

const FALSIFIERS: readonly Falsifier[] = [
  {
    id: 'D2-F1',
    law: 'unknown identity inquiry refuses admission rather than becoming false',
    run: (admit) => expectInsufficient(admit, UNKNOWN_INQUIRY, ['explicitIdentityInquiry']),
  },
  {
    id: 'D2-F2',
    law: 'unknown identity mismatch refuses admission rather than becoming false',
    run: (admit) => expectInsufficient(admit, UNKNOWN_MISMATCH, ['explicitIdentityMismatch']),
  },
  {
    id: 'D2-F3',
    law: 'unknown materiality refuses admission rather than becoming false',
    run: (admit) => expectInsufficient(admit, UNKNOWN_MATERIALITY, ['materialCapabilityEffect']),
  },
  {
    id: 'D2-F4',
    law: 'unknown capability-contract state refuses admission rather than defaulting satisfied',
    run: (admit) => expectInsufficient(admit, UNKNOWN_CONTRACT, ['capabilityContractSatisfied']),
  },
  {
    id: 'D2-F5',
    law: 'a fully-known packet admits exactly with no semantic transformation',
    run: (admit) => expectAdmittedExact(admit, FULLY_KNOWN),
  },
  {
    id: 'D2-F6',
    law: 'unknown cannot manufacture a disclosure decision',
    run: (admit) => expectInsufficient(
      admit,
      TWO_UNKNOWN,
      ['explicitIdentityInquiry', 'materialCapabilityEffect']
    ),
  },
  {
    id: 'D2-F7',
    law: 'unknown cannot be defaulted false/true into an admitted D1 packet',
    run: (admit) => expectInsufficient(
      admit,
      ALL_UNKNOWN,
      [
        'explicitIdentityInquiry',
        'explicitIdentityMismatch',
        'materialCapabilityEffect',
        'capabilityContractSatisfied',
      ]
    ),
  },
  {
    id: 'D2-F8',
    law: 'D2 preserves canonical divergence rather than reclassifying provider direction',
    run: (admit) => {
      const result = admit(RECLASSIFICATION_SENTINEL);
      assert(result.status === 'admitted', 'sentinel packet was refused');
      assert(result.input.divergence === 'none', 'canonical divergence was reclassified');
    },
  },
  {
    id: 'D2-F10',
    law: 'D2 output is admission state only and contains no member-facing copy',
    run: (admit) => {
      const result = admit(COPY_SENTINEL);
      assert(result.status === 'admitted', 'copy sentinel was refused');
      const keys = Object.keys(result).sort();
      assert(
        keys.length === 2 && keys[0] === 'input' && keys[1] === 'status',
        'unexpected admission fields: ' + keys.join(', ')
      );
    },
  },
];

const CANDIDATES: readonly Candidate[] = [
  {
    id: 'DA-1',
    error: 'unknown inquiry defaults false when it is the only missing fact',
    admit: (f) => {
      if (
        f.explicitIdentityInquiry.status === 'unknown' &&
        f.explicitIdentityMismatch.status === 'known' &&
        f.materialCapabilityEffect.status === 'known' &&
        f.capabilityContractSatisfied.status === 'known'
      ) {
        return conforming({ ...f, explicitIdentityInquiry: known(false) });
      }
      return conforming(f);
    },
    intended: ['D2-F1'],
    declared: {},
  },
  {
    id: 'DA-2',
    error: 'unknown mismatch defaults false when it is the only missing fact',
    admit: (f) => {
      if (
        f.explicitIdentityMismatch.status === 'unknown' &&
        f.explicitIdentityInquiry.status === 'known' &&
        f.materialCapabilityEffect.status === 'known' &&
        f.capabilityContractSatisfied.status === 'known'
      ) {
        return conforming({ ...f, explicitIdentityMismatch: known(false) });
      }
      return conforming(f);
    },
    intended: ['D2-F2'],
    declared: {},
  },
  {
    id: 'DA-3',
    error: 'unknown materiality defaults false when it is the only missing fact',
    admit: (f) => {
      if (
        f.materialCapabilityEffect.status === 'unknown' &&
        f.explicitIdentityInquiry.status === 'known' &&
        f.explicitIdentityMismatch.status === 'known' &&
        f.capabilityContractSatisfied.status === 'known'
      ) {
        return conforming({ ...f, materialCapabilityEffect: known(false) });
      }
      return conforming(f);
    },
    intended: ['D2-F3'],
    declared: {},
  },
  {
    id: 'DA-4',
    error: 'unknown capability-contract state defaults true when it is the only missing fact',
    admit: (f) => {
      if (
        f.capabilityContractSatisfied.status === 'unknown' &&
        f.explicitIdentityInquiry.status === 'known' &&
        f.explicitIdentityMismatch.status === 'known' &&
        f.materialCapabilityEffect.status === 'known'
      ) {
        return conforming({ ...f, capabilityContractSatisfied: known(true) });
      }
      return conforming(f);
    },
    intended: ['D2-F4'],
    declared: {},
  },
  {
    id: 'DA-5',
    error: 'fully-known packet is semantically transformed before D1 admission',
    admit: (f) => {
      if (
        f.divergence === 'sovereignty' &&
        f.explicitIdentityMismatch.status === 'known' &&
        f.explicitIdentityMismatch.value === true
      ) {
        return conforming({ ...f, explicitIdentityMismatch: known(false) });
      }
      return conforming(f);
    },
    intended: ['D2-F5'],
    declared: {},
  },
  {
    id: 'DA-6',
    error: 'two unknown facts are converted into a disclosure-required output',
    admit: (f) => {
      if (
        f.explicitIdentityInquiry.status === 'unknown' &&
        f.materialCapabilityEffect.status === 'unknown' &&
        f.explicitIdentityMismatch.status === 'known' &&
        f.capabilityContractSatisfied.status === 'known'
      ) {
        return { status: 'insufficient_facts', missing: [], required: true } as AdmissionLike;
      }
      return conforming(f);
    },
    intended: ['D2-F6'],
    declared: {},
  },
  {
    id: 'DA-7',
    error: 'all unknown facts default to false/false/false/true and are admitted',
    admit: (f) => {
      const allUnknown = [
        f.explicitIdentityInquiry,
        f.explicitIdentityMismatch,
        f.materialCapabilityEffect,
        f.capabilityContractSatisfied,
      ].every((fact) => fact.status === 'unknown');
      if (allUnknown) {
        return conforming({
          ...f,
          explicitIdentityInquiry: known(false),
          explicitIdentityMismatch: known(false),
          materialCapabilityEffect: known(false),
          capabilityContractSatisfied: known(true),
        });
      }
      return conforming(f);
    },
    intended: ['D2-F7'],
    declared: {},
  },
  {
    id: 'DA-8',
    error: 'provider direction reclassifies canonical divergence during admission',
    admit: (f) => {
      const result = conforming(f);
      if (
        result.status === 'admitted' &&
        f.testIntendedProvider !== undefined &&
        f.testServedProvider !== undefined &&
        f.testIntendedProvider !== f.testServedProvider
      ) {
        return {
          ...result,
          input: { ...result.input, divergence: 'sovereignty' },
        };
      }
      return result;
    },
    intended: ['D2-F8'],
    declared: {},
  },
  {
    id: 'DA-10',
    error: 'admission output smuggles member-facing copy',
    admit: (f) => {
      const result = conforming(f);
      if (
        f.divergence === 'capability' &&
        f.explicitIdentityInquiry.status === 'known' &&
        f.explicitIdentityInquiry.value === true
      ) {
        return { ...result, message: 'Disclosure is required.' } as AdmissionLike;
      }
      return result;
    },
    intended: ['D2-F10'],
    declared: {},
  },
];

function kills(c: Candidate): string[] {
  const out: string[] = [];
  for (const f of FALSIFIERS) {
    try {
      f.run(c.admit);
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
  admit: conforming,
  intended: [],
  declared: {},
});

if (conformingKills.length > 0) {
  lethal = false;
  lines.push('  FAIL shipped admission: ' + conformingKills.join(', '));
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

  if (survived.length > 0) {
    lethal = false;
    lines.push('  FAIL survived named falsifier(s): ' + survived.join(', '));
  }

  for (const [id, why] of Object.entries(c.declared)) {
    if (failed.includes(id)) {
      lines.push('  declared collateral ' + id + ': ' + why);
    }
  }

  if (undeclared.length > 0) {
    discriminating = false;
    lines.push('  UNDECLARED collateral: ' + undeclared.join(', '));
  }
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const ADMISSION_SRC = stripComments(
  readFileSync(join(process.cwd(), 'lib/consciousness/disclosureFactAdmission.ts'), 'utf8')
);

const packetBody =
  ADMISSION_SRC.match(/export interface DisclosureFactPacket\s*\{([\s\S]*?)\}/)?.[1] ?? '';

const GUARDS: readonly { id: string; law: string; run: () => void }[] = [
  {
    id: 'D2-G1',
    law: 'D2 is pure and imports serving/D1 contracts as types only',
    run: () => {
      assert(
        !/process\.|fetch\s*\(|console\.|Date\.|Math\.random|child_process|node:fs/.test(ADMISSION_SRC),
        'side-effect/runtime authority found'
      );
      const imports = ADMISSION_SRC.match(/^import .*$/gm) ?? [];
      assert(
        imports.every((line) => line.startsWith('import type ')),
        'runtime import found: ' + imports.join(' | ')
      );
    },
  },
  {
    id: 'D2-G2 / D2-F9',
    law: 'D2 production input accepts classified facts, not raw member content',
    run: () => {
      assert(packetBody.length > 0, 'packet contract not found');
      const forbidden =
        /message|transcript|prompt|memberName|userInput|therapy|personalContext|rawContent|providerError|uiState|logs/i;
      assert(
        !forbidden.test(packetBody),
        'raw-content field entered D2 input: ' + packetBody.trim()
      );
    },
  },
  {
    id: 'D2-G3 / D2-F8',
    law: 'D2 preserves canonical divergence and contains no provider reclassification',
    run: () => {
      assert(!/classifyDivergence/.test(ADMISSION_SRC), 'D2 calls serving classifier');
      assert(
        !/intendedProvider|servedProvider|ollama|anthropic/.test(ADMISSION_SRC),
        'provider nomenclature entered production D2'
      );
    },
  },
  {
    id: 'D2-G4 / D2-F11',
    law: 'distress is absent from D2 admission',
    run: () => {
      assert(!/distress|crisis|emotion|affect/i.test(packetBody), 'distress-like input entered D2');
    },
  },
  {
    id: 'D2-G5',
    law: 'D2 neither invokes D1 nor borrows unrelated trust disclosure authority',
    run: () => {
      assert(!/decideMemberDisclosure/.test(ADMISSION_SRC), 'D2 invokes D1');
      assert(!/trustResult|disclosureRequired/.test(ADMISSION_SRC), 'unrelated disclosure authority entered D2');
    },
  },
  {
    id: 'D2-G6 / D2-F10',
    law: 'D2 output contains machine-readable admission state only',
    run: () => {
      assert(
        !/message:|copy:|text:|banner|toast|voice|render/i.test(ADMISSION_SRC),
        'member-facing/rendering field entered D2 output'
      );
    },
  },
  {
    id: 'D2-G7 / D2-F12',
    law: 'D1 matrix remains lethal, discriminating, 7/7 guards, exit 0',
    run: () => {
      const child = spawnSync('npm', ['run', 'matrix:serving-disclosure-d1'], {
        cwd: process.cwd(),
        encoding: 'utf8',
      });
      assert(
        child.status === 0,
        'D1 matrix exit ' + String(child.status) + '\n' + child.stdout + '\n' + child.stderr
      );
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(child.stdout),
        'D1 matrix axes changed'
      );
      assert(/7 guards/.test(child.stdout), 'D1 matrix no longer reports 7 guards');
    },
  },
  {
    id: 'D2-G8',
    law: 'R1 matrix remains lethal, discriminating, 4/4 guards, exit 0',
    run: () => {
      const child = spawnSync('npm', ['run', 'matrix:serving-identity-r1'], {
        cwd: process.cwd(),
        encoding: 'utf8',
      });
      assert(
        child.status === 0,
        'R1 matrix exit ' + String(child.status) + '\n' + child.stdout + '\n' + child.stderr
      );
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(child.stdout),
        'R1 matrix axes changed'
      );
      assert(/4 guards/.test(child.stdout), 'R1 matrix no longer reports 4 guards');
    },
  },
  {
    id: 'D2-G9',
    law: 'serving-identity matrix remains lethal, discriminating, 4/4 guards, exit 0',
    run: () => {
      const child = spawnSync('npm', ['run', 'matrix:serving-identity'], {
        cwd: process.cwd(),
        encoding: 'utf8',
      });
      assert(
        child.status === 0,
        'serving matrix exit ' + String(child.status) + '\n' + child.stdout + '\n' + child.stderr
      );
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(child.stdout),
        'serving matrix axes changed'
      );
      assert(/4 guards/.test(child.stdout), 'serving matrix no longer reports 4 guards');
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
