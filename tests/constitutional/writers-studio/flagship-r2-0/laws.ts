/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R2-0 — LAWS over the REVIEW DISCUSS EPISTEMIC-OBJECT CONSTITUTION.
 *
 * A subject is ONE typed boundary contract module (`contract.ts`, or a deliberately wrong candidate that
 * re-exports it with one error) plus the constitution record. The laws are of two kinds:
 *
 *   TYPE-LEVEL   an ILLEGAL fixture (fixtures/illegal/*.ts) is compiled against the subject's contract with
 *                `tsc`; the law holds iff the fixture is REFUSED by the type system. The lawful fixture must
 *                compile with zero diagnostics. ⭐ "The type must make an omitted posture structurally invalid"
 *                (authorization §XVI) is only provable this way — by building the illegal object and watching
 *                the compiler refuse it.
 *   VALUE-LEVEL  the contract's pure declarations (crossing declaration, posture-under-location, thread key,
 *                conversational effects, seam statement) are exercised on fixtures.
 *
 * ⛔ Nothing here runs cognition, touches a route, a provider, persistence or UI. Before the act lands every
 * law is UNMOUNTED (the known-bad: no contract exists, so nothing can distinguish AS_READ from a reread).
 */
import { existsSync, readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }

/* ── the contract's runtime surface, typed here so the suite types before the module exists ── */
export type Posture = 'AS_READ' | 'THEN_VS_NOW' | 'CURRENT_TEXT_ONLY';
export type InputClass = 'MEMBER_WORK_TEXT' | 'DURABLE_READING_OUTPUT' | 'READING_PROVENANCE';
export type Role = 'FINDING' | 'THEN' | 'NOW' | 'PROVENANCE';
export type LocationState = { readonly state: 'current' } | { readonly state: 'superseded'; readonly moved: readonly string[] } | { readonly state: 'unmeasured' };
export interface AnchorLike { readonly on: 'observation'; readonly readingId: string; readonly observationKey: string }
export interface CrossingEntry { readonly role: Role; readonly inputClass: InputClass; readonly authoredBy: 'member' | 'maia' | 'system' }
export interface ContractRuntime {
  readonly admitReviewDiscuss?: (o: unknown) => { admitted: boolean; because?: string; handOff?: string };
  readonly declareCrossing?: (o: unknown) => { posture: Posture; entries: readonly CrossingEntry[] };
  readonly postureUnderLocation?: (declared: Posture, location: LocationState) => Posture;
  readonly threadKeyOf?: (a: AnchorLike) => string;
  readonly bindThread?: (threadRef: string, a: AnchorLike) => { readonly threadRef: string; readonly anchor: AnchorLike };
  readonly sameSubject?: (t: { anchor: AnchorLike }, a: AnchorLike) => boolean;
  readonly actAdmissible?: (act: string, posture: Posture) => boolean;
  readonly CONVERSATIONAL_EFFECTS?: Readonly<Record<string, boolean>>;
  readonly SEAMS?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  readonly [k: string]: unknown;
}
export interface Subject {
  readonly name: string;
  /** repository-relative path of the contract module this subject IS */
  readonly contractFile: string;
  readonly runtime?: ContractRuntime;
  /** the constitution record text; defaults to the file on disk */
  readonly recordSource?: string;
}

const ROOT = process.cwd();
export const DIR = 'tests/constitutional/writers-studio/flagship-r2-0';
export const RECORD = 'docs/programme/FLAGSHIP-RUNTIME-CONVERGENCE-01_R2-0_REVIEW_DISCUSS_EPISTEMIC_OBJECT_CONSTITUTION_2026-09-23.md';
const R12A_HEAD = 'ed8510aa9';
const law = (id: string, body: () => LawResult): LawResult => { try { return body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; } };
const must = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });
const unmounted = (id: string) => must(id, false, 'UNMOUNTED — no Review Discuss epistemic object is constituted; nothing distinguishes AS_READ from a reread');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ── fixtures ── */
const A: AnchorLike = { on: 'observation', readingId: 'rd-A', observationKey: 'o7' };
const B: AnchorLike = { on: 'observation', readingId: 'rd-B', observationKey: 'o7' };
const A2: AnchorLike = { on: 'observation', readingId: 'rd-A', observationKey: 'o2' };
const THEN = { role: 'THEN', inputClass: 'MEMBER_WORK_TEXT', sectionId: 'd-2', revisionNumber: 3, revisionDigest: 'r'.repeat(64), sectionDigest: 's'.repeat(64), text: 'Nothing moved on the far bank.', verified: 'digest-verified' } as const;
const NOW = { role: 'NOW', inputClass: 'MEMBER_WORK_TEXT', sectionId: 'd-2', text: 'Nothing moved on the far bank. She waited.', admission: { kind: 'separately_authorized', authorityRef: 'act-1' } } as const;
const FINDING = { role: 'FINDING', inputClass: 'DURABLE_READING_OUTPUT', observation: 'The far bank is where the chapter keeps returning.', doesNotEstablish: ['author-intent'], lens: 'recurrence' } as const;
const PROV = (location: LocationState) => ({ role: 'PROVENANCE', inputClass: 'READING_PROVENANCE', inputFingerprint: 'f'.repeat(64), revisionNumber: 3, evidenceRefs: ['passage:d-2:0:30'], location } as const);
const LOCS: LocationState[] = [{ state: 'current' }, { state: 'superseded', moved: ['section-text'] }, { state: 'unmeasured' }];
const asRead = (location: LocationState = LOCS[0]!) => ({ posture: 'AS_READ', finding: A, output: FINDING, then: THEN, provenance: PROV(location) });
const thenVsNow = () => ({ posture: 'THEN_VS_NOW', finding: A, output: FINDING, then: THEN, now: NOW, provenance: PROV(LOCS[1]!) });
const currentTextOnly = () => ({ posture: 'CURRENT_TEXT_ONLY', sectionId: 'd-2', now: NOW });

/* ── the type-level instrument: compile the lawful fixture + every illegal fixture against the subject's contract ── */
export interface TypeVerdict { readonly contractDiagnostics: number; readonly lawfulDiagnostics: number; readonly illegal: Readonly<Record<string, number>>; readonly globalErrors: number; readonly raw: string }
const typeCache = new Map<string, TypeVerdict>();
export function typecheckAgainst(contractFile: string): TypeVerdict {
  const cached = typeCache.get(contractFile); if (cached) return cached;
  const contract = resolve(ROOT, contractFile);
  const lawful = resolve(ROOT, DIR, 'fixtures/lawful.ts');
  const illegalDir = resolve(ROOT, DIR, 'fixtures/illegal');
  const illegalFiles = existsSync(illegalDir) ? readdirSync(illegalDir).filter((f) => f.endsWith('.ts')).sort().map((f) => resolve(illegalDir, f)) : [];
  const tmp = mkdtempSync(join(tmpdir(), 'r2-0-tsc-'));
  try {
    const cfg = {
      extends: resolve(ROOT, 'tsconfig.ws-flagship.json'),
      compilerOptions: { noEmit: true, baseUrl: ROOT, typeRoots: [resolve(ROOT, 'node_modules/@types')], paths: { '@/*': ['./*'], '@r2-0/contract': [contract] } },
      files: [contract, lawful, ...illegalFiles], include: [],
    };
    writeFileSync(join(tmp, 'tsconfig.json'), JSON.stringify(cfg));
    const r = spawnSync('npx', ['tsc', '-p', join(tmp, 'tsconfig.json'), '--pretty', 'false'], { cwd: ROOT, encoding: 'utf8' });
    const raw = `${r.stdout ?? ''}${r.stderr ?? ''}`;
    const lines = raw.split('\n').filter((l) => /\(\d+,\d+\): error TS\d+:/.test(l));
    const countFor = (abs: string) => lines.filter((l) => l.startsWith(abs.slice(ROOT.length + 1)) || l.startsWith(abs)).length;
    const illegal: Record<string, number> = {};
    for (const f of illegalFiles) illegal[f.slice(illegalDir.length + 1).replace(/\.ts$/, '')] = countFor(f);
    /* ⚠️ a diagnostic with no file position (e.g. TS2688 type roots) means tsc never checked anything: an INSTRUMENT failure, never a pass */
    const globalErrors = raw.split('\n').filter((l) => /^error TS\d+:/.test(l.trim())).length;
    const v: TypeVerdict = { contractDiagnostics: countFor(contract), lawfulDiagnostics: countFor(lawful), illegal, globalErrors, raw };
    typeCache.set(contractFile, v); return v;
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

export async function runR20Laws(s: Subject): Promise<LawResult[]> {
  const out: LawResult[] = [];
  const present = existsSync(join(ROOT, s.contractFile));
  const rt = s.runtime ?? {};
  const T = present ? typecheckAgainst(s.contractFile) : null;
  const refused = (id: string, fixture: string, extra = true, extraDetail = '') => {
    if (!T) return unmounted(id);
    if (T.globalErrors > 0) return must(id, false, `INSTRUMENT — tsc reported ${T.globalErrors} global error(s); nothing was checked`);
    const n = T.illegal[fixture]; if (n === undefined) return must(id, false, `illegal fixture ${fixture} is MISSING — the law has nothing to refuse`);
    return must(id, n > 0 && extra, `illegal:${fixture} diagnostics=${n} (must be >0)${extraDetail}`);
  };
  const record = s.recordSource ?? (existsSync(join(ROOT, RECORD)) ? readFileSync(join(ROOT, RECORD), 'utf8') : '');

  out.push(law('R2-0-L0-contract-and-lawful-object-typecheck', () => {
    if (!T) return unmounted('R2-0-L0-contract-and-lawful-object-typecheck');
    return must('R2-0-L0-contract-and-lawful-object-typecheck', T.globalErrors === 0 && T.contractDiagnostics === 0 && T.lawfulDiagnostics === 0, `instrumentErrors=${T.globalErrors} contract=${T.contractDiagnostics} lawful=${T.lawfulDiagnostics} (all must be 0)`);
  }));
  out.push(law('R2-0-L1-posture-required', () => refused('R2-0-L1-posture-required', 'f01-posture-omitted')));
  out.push(law('R2-0-L2-as-read-forbids-current-substitution', () => refused('R2-0-L2-as-read-forbids-current-substitution', 'f02-as-read-current-substitution')));
  out.push(law('R2-0-L3-as-read-forbids-now', () => refused('R2-0-L3-as-read-forbids-now', 'f03-as-read-sneaks-current')));
  out.push(law('R2-0-L4-then-now-requires-then', () => refused('R2-0-L4-then-now-requires-then', 'f04-then-now-missing-then')));
  out.push(law('R2-0-L5-then-now-requires-now', () => refused('R2-0-L5-then-now-requires-now', 'f05-then-now-missing-now')));
  out.push(law('R2-0-L6-then-and-now-are-distinct-roles', () => {
    if (!rt.declareCrossing) return unmounted('R2-0-L6-then-and-now-are-distinct-roles');
    const d = rt.declareCrossing(thenVsNow());
    const then = d.entries.filter((e) => e.role === 'THEN'); const now = d.entries.filter((e) => e.role === 'NOW');
    const distinct = then.length === 1 && now.length === 1 && then[0]!.role !== now[0]!.role;
    return refused('R2-0-L6-then-and-now-are-distinct-roles', 'f06-then-now-collapsed', distinct, ` rolesDistinct=${distinct}`);
  }));
  out.push(law('R2-0-L7-current-text-only-is-not-review-discuss', () => {
    if (!rt.admitReviewDiscuss) return unmounted('R2-0-L7-current-text-only-is-not-review-discuss');
    const a = rt.admitReviewDiscuss(currentTextOnly()); const ok = rt.admitReviewDiscuss(asRead()).admitted === true && rt.admitReviewDiscuss(thenVsNow()).admitted === true;
    const rejected = a.admitted === false && typeof a.handOff === 'string' && a.handOff.length > 0;
    return refused('R2-0-L7-current-text-only-is-not-review-discuss', 'f07-current-text-as-review', rejected && ok, ` ctoRejectedWithHandOff=${rejected} reviewPosturesAdmitted=${ok}`);
  }));
  out.push(law('R2-0-L8-thread-key-is-reading-local', () => {
    if (!rt.threadKeyOf) return unmounted('R2-0-L8-thread-key-is-reading-local');
    const k = rt.threadKeyOf;
    const withId = (a: AnchorLike, id: string) => ({ ...a, observationId: id } as AnchorLike);
    const stable = k(withId(A, 'dobs_1')) === k(withId(A, 'dobs_2')) && k(A) === k(withId(A, 'dobs_3'));
    const discriminates = k(A) !== k(B) && k(A) !== k(A2);
    return refused('R2-0-L8-thread-key-is-reading-local', 'f08-observation-id-anchor', stable && discriminates, ` independentOfObservationId=${stable} discriminatesReadingAndKey=${discriminates}`);
  }));
  out.push(law('R2-0-L9-thread-never-repoints', () => {
    if (!rt.bindThread || !rt.sameSubject || !rt.CONVERSATIONAL_EFFECTS) return unmounted('R2-0-L9-thread-never-repoints');
    const t = rt.bindThread('t-1', A);
    const frozen = Object.isFrozen(t) && Object.isFrozen(t.anchor);
    const noRepoint = !Object.keys(rt).some((k) => /repoint|migrate|rebind/i.test(k));
    const bound = rt.sameSubject(t, A) && !rt.sameSubject(t, B) && !rt.sameSubject(t, A2);
    return refused('R2-0-L9-thread-never-repoints', 'f09-thread-repoints', frozen && noRepoint && bound && rt.CONVERSATIONAL_EFFECTS['repointsThread'] === false, ` frozen=${frozen} noRepointExport=${noRepoint} boundToOrigin=${bound} repointsThread=${rt.CONVERSATIONAL_EFFECTS['repointsThread']}`);
  }));
  out.push(law('R2-0-L10-finding-is-durable-reading-output', () => {
    if (!rt.declareCrossing) return unmounted('R2-0-L10-finding-is-durable-reading-output');
    const f = rt.declareCrossing(asRead()).entries.find((e) => e.role === 'FINDING');
    const ok = !!f && f.inputClass === 'DURABLE_READING_OUTPUT' && f.authoredBy === 'maia';
    return refused('R2-0-L10-finding-is-durable-reading-output', 'f10-finding-as-member-work', ok, ` finding=${JSON.stringify(f)}`);
  }));
  out.push(law('R2-0-L11-member-text-is-member-work-text', () => {
    if (!rt.declareCrossing) return unmounted('R2-0-L11-member-text-is-member-work-text');
    const es = rt.declareCrossing(thenVsNow()).entries;
    const ok = (['THEN', 'NOW'] as const).every((r) => { const e = es.find((x) => x.role === r); return !!e && e.inputClass === 'MEMBER_WORK_TEXT' && e.authoredBy === 'member'; });
    return refused('R2-0-L11-member-text-is-member-work-text', 'f11-member-text-as-provenance', ok, ` thenNow=${JSON.stringify(es.filter((e) => e.role === 'THEN' || e.role === 'NOW'))}`);
  }));
  out.push(law('R2-0-L12-crossing-declares-every-class', () => {
    if (!rt.declareCrossing) return unmounted('R2-0-L12-crossing-declares-every-class');
    const a = rt.declareCrossing(asRead()); const b = rt.declareCrossing(thenVsNow());
    const classes = (d: { entries: readonly CrossingEntry[] }) => new Set(d.entries.map((e) => e.inputClass));
    const roles = (d: { entries: readonly CrossingEntry[] }) => d.entries.map((e) => e.role).sort().join(',');
    const okA = a.posture === 'AS_READ' && classes(a).size === 3 && roles(a) === 'FINDING,PROVENANCE,THEN';
    const okB = b.posture === 'THEN_VS_NOW' && classes(b).size === 3 && roles(b) === 'FINDING,NOW,PROVENANCE,THEN';
    return must('R2-0-L12-crossing-declares-every-class', okA && okB, `AS_READ roles=${roles(a)} classes=${classes(a).size} · THEN_VS_NOW roles=${roles(b)} classes=${classes(b).size}`);
  }));
  out.push(law('R2-0-L13-seams-not-conflated', () => {
    if (!rt.SEAMS) return unmounted('R2-0-L13-seams-not-conflated');
    const c = rt.SEAMS['C1C1'] ?? {}; const d = rt.SEAMS['DEVELOPMENTAL_ASK'] ?? {}; const r = rt.SEAMS['REVIEW_DISCUSS'] ?? {};
    const c1c1 = c['seam'] === 'editorial-runtime' && c['carriesS3AuthorizationAct'] === false && c['carriesDisclosureReceipt'] === false && c['carriesReadingIdentity'] === false;
    const dev = d['seam'] === 'developmental-ask' && d['carriesS3AuthorizationAct'] === true && d['carriesDisclosureReceipt'] === true && d['carriesReadingIdentity'] === true;
    const own = r['ontology'] === 'own' && r['isC1C1WithAFindingAttached'] === false && r['closestPriorOntology'] === 'DEVELOPMENTAL_ASK';
    const corrected = /Correction to R1-2A carried context/.test(record) && /editorial[- ]runtime/i.test(record) && new RegExp(R12A_HEAD).test(record);
    return must('R2-0-L13-seams-not-conflated', c1c1 && dev && own && corrected, `C1C1=${c1c1} developmentalAsk=${dev} reviewDiscussOwnOntology=${own} recordCarriesCorrection=${corrected}`);
  }));
  out.push(law('R2-0-L14-conversation-has-no-durable-effect', () => {
    if (!rt.CONVERSATIONAL_EFFECTS || !rt.actAdmissible) return unmounted('R2-0-L14-conversation-has-no-durable-effect');
    const e = rt.CONVERSATIONAL_EFFECTS;
    const required = ['deletesFinding', 'rewritesFinding', 'changesStanding', 'recordsAgreement', 'recordsDisagreement', 'createsMemberObservation', 'supersedesReading', 'commissionsReread', 'repointsThread'];
    const allFalse = required.every((k) => e[k] === false) && Object.values(e).every((v) => v === false) && Object.isFrozen(e);
    const acts = ['question', 'clarify', 'contest', 'explore-meaning'].every((a) => rt.actAdmissible!(a, 'AS_READ') && rt.actAdmissible!(a, 'THEN_VS_NOW'));
    const compare = !rt.actAdmissible('compare', 'AS_READ') && rt.actAdmissible('compare', 'THEN_VS_NOW');
    return must('R2-0-L14-conversation-has-no-durable-effect', allFalse && acts && compare, `effects=${JSON.stringify(e)} conversationalActsAdmitted=${acts} compareOnlyInThenVsNow=${compare}`);
  }));
  out.push(law('R2-0-L15-location-never-escalates-posture', () => {
    if (!rt.postureUnderLocation) return unmounted('R2-0-L15-location-never-escalates-posture');
    const postures: Posture[] = ['AS_READ', 'THEN_VS_NOW', 'CURRENT_TEXT_ONLY'];
    const bad = postures.flatMap((p) => LOCS.filter((l) => rt.postureUnderLocation!(p, l) !== p).map((l) => `${p}+${l.state}`));
    return must('R2-0-L15-location-never-escalates-posture', bad.length === 0, bad.length ? `escalated: ${bad.join(', ')}` : '9/9 (posture × location) unchanged');
  }));
  out.push(law('R2-0-L16-contract-is-non-executing', () => {
    if (!present) return unmounted('R2-0-L16-contract-is-non-executing');
    const src = strip(readFileSync(join(ROOT, s.contractFile), 'utf8'));
    /* a candidate re-exports the reference contract (`export * from '../contract'`); that is the instrument's shape, not an import of runtime */
    const imports = (src.match(/^\s*(import|export)\s[^\n]*from\s+['"][^'"]+['"]/gm) ?? []).filter((l) => !/from\s+['"]\.{1,2}\/contract['"]/.test(l));
    const runtimeImporters = execSync(`grep -rlE "flagship-r2-0" app lib components middleware.ts 2>/dev/null || true`, { cwd: ROOT, encoding: 'utf8' }).trim();
    const sideEffects = /fetch\(|process\.env|require\(|readFileSync|query\(|pool\.|router\./.test(src);
    return must('R2-0-L16-contract-is-non-executing', imports.length === 0 && runtimeImporters === '' && !sideEffects, `imports=${imports.length} runtimeImporters=${runtimeImporters || 'none'} sideEffects=${sideEffects}`);
  }));
  out.push(law('R2-0-L17-fs3-and-product-unchanged', () => {
    const r = spawnSync('npx', ['tsx', 'scripts/verify-flagship-freeze.ts'], { cwd: ROOT, encoding: 'utf8' });
    const product = execSync(`git diff --stat ${R12A_HEAD} HEAD -- app lib components database middleware.ts`, { cwd: ROOT, encoding: 'utf8' }).trim();
    const tree = execSync('git status --porcelain -- app lib components database middleware.ts', { cwd: ROOT, encoding: 'utf8' }).trim();
    return must('R2-0-L17-fs3-and-product-unchanged', r.status === 0 && product === '' && tree === '', `freeze exit=${r.status} productDiffSince${R12A_HEAD}=${product ? 'CHANGED' : 'none'} workingTreeProduct=${tree ? 'DIRTY' : 'clean'}`);
  }));
  return out;
}
