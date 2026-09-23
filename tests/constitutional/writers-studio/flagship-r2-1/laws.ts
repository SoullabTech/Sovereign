/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-1
 * PURE REVIEW DISCUSS ACT CONTRACT — constitutional laws.
 *
 * SUITE FIRST. contract.ts does not exist at the known-bad baseline.
 * Nothing here executes cognition, routes, providers, persistence or UI.
 */
import { existsSync, readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

export interface LawResult {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

export interface AnchorLike {
  readonly on: 'observation';
  readonly readingId: string;
  readonly observationKey: string;
}

export interface ContractRuntime {
  readonly buildR21Act?: (object: unknown) => any;
  readonly composeResponseEnvelope?: (act: any, answer: any) => any;
  readonly admitPosture?: (posture: string) => { admitted: boolean; because?: string; handOff?: string };
  readonly bindThread?: (threadRef: string, anchor: AnchorLike) => any;
  readonly sameSubject?: (thread: any, anchor: AnchorLike) => boolean;
  readonly sanctuaryDecision?: (state: 'ALLOW' | 'FORBID') => any;
  readonly CONVERSATIONAL_EFFECTS?: Readonly<Record<string, boolean>>;
  readonly FINGERPRINT_COVERAGE?: {
    readonly mode: string;
    readonly covers: readonly string[];
  };
  readonly INFERENCE_POLICY?: {
    readonly seam: string;
    readonly vendorSpecific: boolean;
    readonly providerPolicyApplies: boolean;
    readonly runtimeWired?: boolean;
  };
  readonly [k: string]: unknown;
}

export interface Subject {
  readonly name: string;
  readonly contractFile: string;
  readonly runtime?: ContractRuntime;
  readonly recordSource?: string;
}

const ROOT = process.cwd();

export const DIR =
  'tests/constitutional/writers-studio/flagship-r2-1';

export const RECORD =
  'docs/programme/FLAGSHIP-RUNTIME-CONVERGENCE-01_R2-1_PURE_REVIEW_DISCUSS_ACT_CONTRACT_2026-09-23.md';

const R21_FRESHNESS_HEAD = '8f0b308d9';

const law = (id: string, body: () => LawResult): LawResult => {
  try { return body(); }
  catch (err) {
    return {
      id,
      ok: false,
      detail: `threw: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
};

const must = (id: string, ok: boolean, detail: string): LawResult =>
  ({ id, ok, detail });

const unmounted = (id: string) =>
  must(id, false,
    'UNMOUNTED — no R2-1 pure Review Discuss act contract exists');

const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '')
   .replace(/^\s*\/\/.*$/gm, '');

/* ── suite-owned fixtures ── */

const A: AnchorLike = {
  on: 'observation',
  readingId: 'rd-A',
  observationKey: 'o7',
};

const B: AnchorLike = {
  on: 'observation',
  readingId: 'rd-B',
  observationKey: 'o7',
};

const A2: AnchorLike = {
  on: 'observation',
  readingId: 'rd-A',
  observationKey: 'o2',
};

const THEN = {
  role: 'THEN',
  inputClass: 'MEMBER_WORK_TEXT',
  sectionId: 'd-2',
  revisionNumber: 3,
  revisionDigest: 'r'.repeat(64),
  sectionDigest: 's'.repeat(64),
  range: { start: 0, end: 30 },
  text: 'Nothing moved on the far bank.',
  verified: 'digest-verified',
  evidenceRefs: ['passage:d-2:0:30'],
} as const;

const FINDING = {
  role: 'FINDING',
  inputClass: 'DURABLE_READING_OUTPUT',
  observation:
    'The far bank is where the chapter keeps returning.',
  doesNotEstablish: ['author-intent'],
  lens: 'recurrence',
} as const;

const PROVENANCE = {
  role: 'PROVENANCE',
  inputClass: 'READING_PROVENANCE',
  inputFingerprint: 'f'.repeat(64),
  revisionNumber: 3,
  evidenceRefs: ['passage:d-2:0:30'],
  location: {
    state: 'superseded',
    moved: ['section-text'],
  },
} as const;

const AS_READ = {
  posture: 'AS_READ',
  finding: A,
  output: FINDING,
  then: THEN,
  provenance: PROVENANCE,
} as const;

const answerMeta = {
  provider: 'fixture-provider',
  model: 'fixture-model',
  answeredAt: '2026-09-23T20:00:00.000Z',
  answerText: 'The observation was grounded in the passage as read.',
};

const requiredFingerprintCoverage = [
  'finding',
  'historical_evidence',
  'posture',
  'current_location',
  'input_manifest',
  'instructions',
] as const;

/* ── type-level instrument ── */

export interface TypeVerdict {
  readonly contractDiagnostics: number;
  readonly lawfulDiagnostics: number;
  readonly illegal: Readonly<Record<string, number>>;
  readonly globalErrors: number;
  readonly raw: string;
}

const typeCache = new Map<string, TypeVerdict>();

export function typecheckAgainst(contractFile: string): TypeVerdict {
  const cached = typeCache.get(contractFile);
  if (cached) return cached;

  const contract = resolve(ROOT, contractFile);
  const lawful = resolve(ROOT, DIR, 'fixtures/lawful.ts');
  const illegalDir = resolve(ROOT, DIR, 'fixtures/illegal');

  const illegalFiles = existsSync(illegalDir)
    ? readdirSync(illegalDir)
        .filter((f) => f.endsWith('.ts'))
        .sort()
        .map((f) => resolve(illegalDir, f))
    : [];

  const tmp = mkdtempSync(join(tmpdir(), 'r2-1-tsc-'));

  try {
    const cfg = {
      extends: resolve(ROOT, 'tsconfig.ws-flagship.json'),
      compilerOptions: {
        noEmit: true,
        baseUrl: ROOT,
        typeRoots: [resolve(ROOT, 'node_modules/@types')],
        paths: {
          '@/*': ['./*'],
          '@r2-1/contract': [contract],
        },
      },
      files: [contract, lawful, ...illegalFiles],
      include: [],
    };

    writeFileSync(
      join(tmp, 'tsconfig.json'),
      JSON.stringify(cfg)
    );

    const r = spawnSync(
      'npx',
      ['tsc', '-p', join(tmp, 'tsconfig.json'), '--pretty', 'false'],
      { cwd: ROOT, encoding: 'utf8' }
    );

    const raw = `${r.stdout ?? ''}${r.stderr ?? ''}`;

    const lines = raw
      .split('\n')
      .filter((l) => /\(\d+,\d+\): error TS\d+:/.test(l));

    const countFor = (abs: string) =>
      lines.filter(
        (l) =>
          l.startsWith(abs.slice(ROOT.length + 1)) ||
          l.startsWith(abs)
      ).length;

    const illegal: Record<string, number> = {};

    for (const f of illegalFiles) {
      illegal[
        f.slice(illegalDir.length + 1).replace(/\.ts$/, '')
      ] = countFor(f);
    }

    const globalErrors = raw
      .split('\n')
      .filter((l) => /^error TS\d+:/.test(l.trim()))
      .length;

    const v: TypeVerdict = {
      contractDiagnostics: countFor(contract),
      lawfulDiagnostics: countFor(lawful),
      illegal,
      globalErrors,
      raw,
    };

    typeCache.set(contractFile, v);
    return v;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

/* ── law execution ── */

export async function runR21Laws(
  s: Subject
): Promise<LawResult[]> {
  const out: LawResult[] = [];
  const present = existsSync(join(ROOT, s.contractFile));
  const rt = s.runtime ?? {};
  const T = present ? typecheckAgainst(s.contractFile) : null;

  const act = () =>
    rt.buildR21Act
      ? rt.buildR21Act(AS_READ)
      : undefined;

  const record =
    s.recordSource ??
    (existsSync(join(ROOT, RECORD))
      ? readFileSync(join(ROOT, RECORD), 'utf8')
      : '');

  out.push(law(
    'R2-1-L0-contract-and-lawful-object-typecheck',
    () => {
      if (!T)
        return unmounted(
          'R2-1-L0-contract-and-lawful-object-typecheck'
        );

      const illegalCount =
        Object.keys(T.illegal).length;

      const allIllegalRefused =
        illegalCount > 0 &&
        Object.values(T.illegal).every((n) => n > 0);

      return must(
        'R2-1-L0-contract-and-lawful-object-typecheck',
        T.globalErrors === 0 &&
        T.contractDiagnostics === 0 &&
        T.lawfulDiagnostics === 0 &&
        allIllegalRefused,
        `instrumentErrors=${T.globalErrors} ` +
        `contract=${T.contractDiagnostics} ` +
        `lawful=${T.lawfulDiagnostics} ` +
        `illegalRefused=${allIllegalRefused} ` +
        `illegalFixtures=${illegalCount}`
      );
    }
  ));

  out.push(law(
    'R2-1-L1-finding-is-authorized-input',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L1-finding-is-authorized-input'
        );

      const authRoles =
        a.authorization?.inputRoles ?? [];

      const manifest =
        a.inputManifest?.entries ?? [];

      const ok =
        authRoles.includes('FINDING') &&
        manifest.some(
          (e: any) =>
            e.role === 'FINDING' &&
            e.inputClass === 'DURABLE_READING_OUTPUT'
        );

      return must(
        'R2-1-L1-finding-is-authorized-input',
        ok,
        `authorizationRoles=${JSON.stringify(authRoles)}`
      );
    }
  ));

  out.push(law(
    'R2-1-L2-crossing-cannot-be-falsely-empty',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L2-crossing-cannot-be-falsely-empty'
        );

      const entries =
        a.crossing?.entries ?? [];

      const ok =
        a.crossing?.crossed === true &&
        entries.length === 3 &&
        entries.some((e: any) => e.role === 'FINDING');

      return must(
        'R2-1-L2-crossing-cannot-be-falsely-empty',
        ok,
        `crossed=${a.crossing?.crossed} entries=${entries.length}`
      );
    }
  ));

  out.push(law(
    'R2-1-L3-finding-is-durable-reading-output',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L3-finding-is-durable-reading-output'
        );

      const e =
        a.inputManifest?.entries?.find(
          (x: any) => x.role === 'FINDING'
        );

      const ok =
        e?.inputClass === 'DURABLE_READING_OUTPUT' &&
        e?.authoredBy === 'maia';

      return must(
        'R2-1-L3-finding-is-durable-reading-output',
        ok,
        `finding=${JSON.stringify(e)}`
      );
    }
  ));

  out.push(law(
    'R2-1-L4-ask-act-is-not-r2-authority',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L4-ask-act-is-not-r2-authority'
        );

      const ok =
        a.authorization?.kind ===
        'R2_REVIEW_DISCUSS_ACT';

      return must(
        'R2-1-L4-ask-act-is-not-r2-authority',
        ok,
        `kind=${a.authorization?.kind}`
      );
    }
  ));

  out.push(law(
    'R2-1-L5-history-is-none',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L5-history-is-none'
        );

      const t = a.threadPolicy ?? {};

      const ok =
        t.historyPolicy === 'NONE' &&
        t.priorTurnCount === 0 &&
        Array.isArray(t.providerHistory) &&
        t.providerHistory.length === 0;

      return must(
        'R2-1-L5-history-is-none',
        ok,
        `history=${t.historyPolicy} prior=${t.priorTurnCount} providerHistory=${t.providerHistory?.length}`
      );
    }
  ));

  out.push(law(
    'R2-1-L6-persistence-does-not-authorize-continuation',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L6-persistence-does-not-authorize-continuation'
        );

      return must(
        'R2-1-L6-persistence-does-not-authorize-continuation',
        a.threadPolicy?.continuationAuthorized === false,
        `continuationAuthorized=${a.threadPolicy?.continuationAuthorized}`
      );
    }
  ));

  out.push(law(
    'R2-1-L7-success-has-durable-single-act-custody',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L7-success-has-durable-single-act-custody'
        );

      const ok =
        a.threadPolicy?.persistentThread === true &&
        a.threadPolicy?.custodyShape === 'SINGLE_ACT';

      return must(
        'R2-1-L7-success-has-durable-single-act-custody',
        ok,
        `persistent=${a.threadPolicy?.persistentThread} custody=${a.threadPolicy?.custodyShape}`
      );
    }
  ));

  out.push(law(
    'R2-1-L8-posture-is-explicit-as-read',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L8-posture-is-explicit-as-read'
        );

      return must(
        'R2-1-L8-posture-is-explicit-as-read',
        a.posture === 'AS_READ',
        `posture=${String(a.posture)}`
      );
    }
  ));

  out.push(law(
    'R2-1-L9-then-vs-now-is-not-executable',
    () => {
      if (!rt.admitPosture)
        return unmounted(
          'R2-1-L9-then-vs-now-is-not-executable'
        );

      const d =
        rt.admitPosture('THEN_VS_NOW');

      const ok =
        d.admitted === false &&
        /defer|not.*r2-1|future/i.test(
          String(d.because ?? '')
        );

      return must(
        'R2-1-L9-then-vs-now-is-not-executable',
        ok,
        JSON.stringify(d)
      );
    }
  ));

  out.push(law(
    'R2-1-L10-current-text-only-is-not-review-discuss',
    () => {
      if (!rt.admitPosture)
        return unmounted(
          'R2-1-L10-current-text-only-is-not-review-discuss'
        );

      const d =
        rt.admitPosture('CURRENT_TEXT_ONLY');

      return must(
        'R2-1-L10-current-text-only-is-not-review-discuss',
        d.admitted === false,
        JSON.stringify(d)
      );
    }
  ));

  out.push(law(
    'R2-1-L11-historical-evidence-is-required',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L11-historical-evidence-is-required'
        );

      const then = a.object?.then;

      const ok =
        then?.verified === 'digest-verified' &&
        typeof then?.text === 'string' &&
        then.text.length > 0 &&
        Array.isArray(then?.evidenceRefs) &&
        then.evidenceRefs.length > 0;

      return must(
        'R2-1-L11-historical-evidence-is-required',
        ok,
        `verified=${then?.verified} refs=${then?.evidenceRefs?.length}`
      );
    }
  ));

  out.push(law(
    'R2-1-L12-as-read-cannot-contain-current-prose',
    () => {
      const a = act();
      if (!a)
        return unmounted(
          'R2-1-L12-as-read-cannot-contain-current-prose'
        );

      const ok =
        !('now' in (a.object ?? {})) &&
        !('currentProse' in (a.object ?? {}));

      return must(
        'R2-1-L12-as-read-cannot-contain-current-prose',
        ok,
        `objectKeys=${Object.keys(a.object ?? {}).join(',')}`
      );
    }
  ));

  out.push(law(
    'R2-1-L13-response-provenance-is-complete',
    () => {
      const a = act();
      if (!a || !rt.composeResponseEnvelope)
        return unmounted(
          'R2-1-L13-response-provenance-is-complete'
        );

      const e =
        rt.composeResponseEnvelope(a, answerMeta);

      const required =
        [
          e?.contractVersion,
          e?.posture,
          e?.anchor?.readingId,
          e?.anchor?.observationKey,
          e?.historicalEvidence?.identity,
          e?.currentLocation?.state,
          e?.authorizationRef,
          e?.provider,
          e?.model,
          e?.answeredAt,
          e?.cognitionInputFingerprint,
          e?.answerText,
          e?.durableEffect,
        ];

      const ok =
        required.every(
          (v) => v !== undefined && v !== null && v !== ''
        ) &&
        Array.isArray(e?.inputManifest?.entries) &&
        e.inputManifest.entries.length === 3 &&
        Array.isArray(e?.disclosureReceiptRefs) &&
        e.disclosureReceiptRefs.length >= 1 &&
        e?.historyPolicy === 'NONE';

      return must(
        'R2-1-L13-response-provenance-is-complete',
        ok,
        `requiredPresent=${required.every((v) => v !== undefined && v !== null && v !== '')} inputs=${e?.inputManifest?.entries?.length} receipts=${e?.disclosureReceiptRefs?.length}`
      );
    }
  ));

  out.push(law(
    'R2-1-L14-provenance-is-server-authored',
    () => {
      const a = act();
      if (!a || !rt.composeResponseEnvelope)
        return unmounted(
          'R2-1-L14-provenance-is-server-authored'
        );

      const e =
        rt.composeResponseEnvelope(a, answerMeta);

      return must(
        'R2-1-L14-provenance-is-server-authored',
        e?.provenanceAuthority === 'SERVER',
        `authority=${e?.provenanceAuthority}`
      );
    }
  ));

  out.push(law(
    'R2-1-L15-fingerprint-covers-assembled-cognition-input',
    () => {
      const f = rt.FINGERPRINT_COVERAGE;
      if (!f)
        return unmounted(
          'R2-1-L15-fingerprint-covers-assembled-cognition-input'
        );

      const covers = new Set(f.covers ?? []);

      const ok =
        f.mode === 'FULL_ASSEMBLED_INPUT' &&
        requiredFingerprintCoverage.every(
          (x) => covers.has(x)
        );

      return must(
        'R2-1-L15-fingerprint-covers-assembled-cognition-input',
        ok,
        `mode=${f.mode} covers=${JSON.stringify([...covers])}`
      );
    }
  ));

  out.push(law(
    'R2-1-L16-thread-never-repoints',
    () => {
      if (!rt.bindThread || !rt.sameSubject)
        return unmounted(
          'R2-1-L16-thread-never-repoints'
        );

      const t =
        rt.bindThread('thread-1', A);

      const frozen =
        Object.isFrozen(t) &&
        Object.isFrozen(t.anchor);

      const noRepoint =
        !Object.keys(rt).some(
          (k) => /repoint|migrate|rebind/i.test(k)
        );

      const bound =
        rt.sameSubject(t, A) &&
        !rt.sameSubject(t, B) &&
        !rt.sameSubject(t, A2);

      return must(
        'R2-1-L16-thread-never-repoints',
        frozen && noRepoint && bound,
        `frozen=${frozen} noRepoint=${noRepoint} bound=${bound}`
      );
    }
  ));

  out.push(law(
    'R2-1-L17-conversation-has-no-durable-effect',
    () => {
      const e =
        rt.CONVERSATIONAL_EFFECTS;

      if (!e)
        return unmounted(
          'R2-1-L17-conversation-has-no-durable-effect'
        );

      const required = [
        'deletesFinding',
        'rewritesFinding',
        'changesStanding',
        'recordsAgreement',
        'recordsDisagreement',
        'createsMemberObservation',
        'supersedesReading',
        'commissionsReread',
      ];

      const ok =
        Object.isFrozen(e) &&
        required.every((k) => e[k] === false) &&
        Object.values(e).every((v) => v === false);

      return must(
        'R2-1-L17-conversation-has-no-durable-effect',
        ok,
        JSON.stringify(e)
      );
    }
  ));

  out.push(law(
    'R2-1-L18-sanctuary-refuses-before-persistence',
    () => {
      if (!rt.sanctuaryDecision)
        return unmounted(
          'R2-1-L18-sanctuary-refuses-before-persistence'
        );

      const d =
        rt.sanctuaryDecision('FORBID');

      const ok =
        d?.admitted === false &&
        d?.threadCreated === false &&
        d?.memberTurnCreated === false &&
        d?.actCreated === false &&
        d?.receiptCreated === false &&
        d?.providerCalled === false &&
        d?.assistantTurnCreated === false &&
        d?.persistedBeforeDecision === false;

      return must(
        'R2-1-L18-sanctuary-refuses-before-persistence',
        ok,
        JSON.stringify(d)
      );
    }
  ));

  out.push(law(
    'R2-1-L19-structured-inference-boundary-only',
    () => {
      const p =
        rt.INFERENCE_POLICY;

      if (!p)
        return unmounted(
          'R2-1-L19-structured-inference-boundary-only'
        );

      const ok =
        p.seam === 'AUTHORIZED_STRUCTURED_INFERENCE' &&
        p.vendorSpecific === false &&
        p.providerPolicyApplies === true &&
        p.runtimeWired === false;

      return must(
        'R2-1-L19-structured-inference-boundary-only',
        ok,
        JSON.stringify(p)
      );
    }
  ));

  out.push(law(
    'R2-1-L20-record-carries-founder-decisions',
    () => {
      const checks = [
        /durable single-act/i,
        /history[^\\n]*none/i,
        /AS_READ/i,
        /server-authored provenance/i,
        /DURABLE_READING_OUTPUT/i,
        /Sanctuary/i,
        /continuation[^\\n]*not authorized/i,
        /ALREADY_COMPLETED/i,
        /ACT 2/i,
      ];

      const ok =
        checks.every((r) => r.test(record));

      return must(
        'R2-1-L20-record-carries-founder-decisions',
        ok,
        `checks=${checks.filter((r) => r.test(record)).length}/${checks.length}`
      );
    }
  ));

  out.push(law(
    'R2-1-L21-contract-is-non-executing',
    () => {
      if (!present)
        return unmounted(
          'R2-1-L21-contract-is-non-executing'
        );

      const src =
        strip(
          readFileSync(
            join(ROOT, s.contractFile),
            'utf8'
          )
        );

      const imports =
        (
          src.match(
            /^\s*(import|export)\s[^\n]*from\s+['"][^'"]+['"]/gm
          ) ?? []
        ).filter(
          (l) =>
            !/from\s+['"]\.{1,2}\/contract['"]/.test(l)
        );

      const runtimeImporters =
        execSync(
          `grep -rlE "flagship-r2-1" app lib components middleware.ts 2>/dev/null || true`,
          { cwd: ROOT, encoding: 'utf8' }
        ).trim();

      const sideEffects =
        /fetch\(|process\.env|require\(|readFileSync|query\(|pool\.|router\./.test(src);

      return must(
        'R2-1-L21-contract-is-non-executing',
        imports.length === 0 &&
        runtimeImporters === '' &&
        !sideEffects,
        `imports=${imports.length} runtimeImporters=${runtimeImporters || 'none'} sideEffects=${sideEffects}`
      );
    }
  ));

  out.push(law(
    'R2-1-L22-fs3-and-runtime-product-unchanged',
    () => {
      const r =
        spawnSync(
          'npx',
          ['tsx', 'scripts/verify-flagship-freeze.ts'],
          { cwd: ROOT, encoding: 'utf8' }
        );

      const product =
        execSync(
          `git diff --stat ${R21_FRESHNESS_HEAD} HEAD -- app lib components database middleware.ts`,
          { cwd: ROOT, encoding: 'utf8' }
        ).trim();

      const tree =
        execSync(
          'git status --porcelain -- app lib components database middleware.ts',
          { cwd: ROOT, encoding: 'utf8' }
        ).trim();

      return must(
        'R2-1-L22-fs3-and-runtime-product-unchanged',
        r.status === 0 &&
        product === '' &&
        tree === '',
        `freeze exit=${r.status} productDiffSinceFreshness=${product ? 'CHANGED' : 'none'} workingTreeProduct=${tree ? 'DIRTY' : 'clean'}`
      );
    }
  ));

  return out;
}
