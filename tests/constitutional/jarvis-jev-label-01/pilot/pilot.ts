/**
 * JARVIS-JEV-LABEL-01-PILOT-01 — historical pilot harness and custody packet.
 *
 * Read-only against the delegation home. Source units are hashed BEFORE any label exists; every historical
 * label carries HINDSIGHT_RISK. Manifests are content-free: no objective, no path, no unit id (the id is a
 * slug of the objective and so is itself authored text). No provider is called; none can be.
 */
import { createHash, randomBytes } from 'node:crypto';
import { chmodSync, existsSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import {
  commitmentOf,
  evaluate,
  isQuestionId,
  QUESTION_IDS,
  type Domain,
  type EvaluationInput,
  type HumanLabel,
  type LabelValue,
  type QuestionId,
  type UnitRecord,
} from '../core';
import { BANNER, PILOT_CONFIG, PILOT_ID, PILOT_UNIT_TARGET } from './config';

export const TASK_SHAPES = [
  'CODE_GROUNDED', 'ARCHITECTURE_REASONING', 'ADVERSARIAL_FALSIFICATION',
  'LONG_HORIZON_DECOMPOSITION', 'EVIDENCE_SYNTHESIS', 'FRONTIER_UNKNOWN',
] as const;
const FILE_COUNT_MAX = 10_000;
const sha256 = (b: Buffer | string): string => createHash('sha256').update(b).digest('hex');
const opaque = (unitId: string): string => sha256(unitId).slice(0, 32);

export class PilotRefused extends Error {
  constructor(public readonly code: string, detail: string) { super(`${code}: ${detail}`); }
}

// ───────────────────────── packet derivation ─────────────────────────

export type Derivation = 'IDENTITY' | 'AUTHORITY_PROXY' | 'DECLARED_SCOPE_PROXY' | 'PATH_PATTERN';
export interface DerivedPacket {
  task_shape: string;
  contains_sensitive: boolean;
  requires_external_info: boolean;
  change_scope: { file_count: number; migration: boolean; auth: boolean; production: boolean };
  /** ⚠️ Every field except task_shape is a PROXY read from the unit's declared envelope, not a measured fact. */
  derivation: Record<'task_shape' | 'contains_sensitive' | 'requires_external_info' | 'file_count' | 'migration' | 'auth' | 'production', Derivation>;
}
type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Pure. Returns null when the unit cannot be projected to a J1 packet — recorded, never imputed.
 * ⚠️ Whether a v2 unit CAN be projected at all is itself a pilot finding (P-meaning, protocol §11).
 */
export function derivePacket(unit: unknown): DerivedPacket | null {
  if (!isRec(unit) || !isRec(unit.identity) || !isRec(unit.scope) || !isRec(unit.authority) || !isRec(unit.custody)) return null;
  const shape = unit.identity.task_shape;
  if (typeof shape !== 'string' || !(TASK_SHAPES as readonly string[]).includes(shape)) return null;
  const allowed = unit.scope.allowed_paths;
  if (!Array.isArray(allowed) || allowed.some((p) => typeof p !== 'string')) return null;
  const a = unit.authority;
  const paths = allowed as string[];
  return {
    task_shape: shape,
    contains_sensitive: unit.custody.evidence_class === 'E4_SENSITIVE_OR_PRODUCTION',
    requires_external_info: a.network_external === true || (typeof a.external_disclosure === 'string' && a.external_disclosure !== 'none'),
    change_scope: {
      file_count: Math.min(paths.length, FILE_COUNT_MAX),
      migration: paths.some((p) => /(^|\/)migrations?(\/|$)/i.test(p)),
      auth: paths.some((p) => /(^|\/)auth(\/|$|[._-])/i.test(p)),
      production: a.production_read === true || a.production_write === true || a.deploy === true,
    },
    derivation: {
      task_shape: 'IDENTITY', contains_sensitive: 'AUTHORITY_PROXY', requires_external_info: 'AUTHORITY_PROXY',
      file_count: 'DECLARED_SCOPE_PROXY', migration: 'PATH_PATTERN', auth: 'PATH_PATTERN', production: 'AUTHORITY_PROXY',
    },
  };
}

// ───────────────────────── snapshot (read-only) ─────────────────────────

export interface ManifestUnit {
  pilot_id: string;
  unit_ref: string;
  source_sha256: string;
  task_shape: string | null;
  packet: DerivedPacket | null;
  packet_underivable: boolean;
  hindsight_risk: true;
}
export interface Manifest {
  pilot: typeof PILOT_ID;
  banner: typeof BANNER;
  evidence_class: 'PILOT_HINDSIGHT';
  selection_rule: string;
  primaries_found: number;
  units: ManifestUnit[];
  manifest_sha256: string;
}
export interface LocalIndex { pilot: typeof PILOT_ID; warning: string; pilot_id_to_unit_id: Record<string, string> }

const bodyHash = (m: Omit<Manifest, 'manifest_sha256'>): string => sha256(JSON.stringify(m));

function primaryFiles(home: string): string[] {
  const dir = join(home, 'work-units-v2');
  if (!existsSync(dir)) throw new PilotRefused('HOME_NOT_FOUND', 'work-units-v2 directory absent');
  return readdirSync(dir)
    .filter((n) => n.endsWith('.json') && !n.endsWith('.desktop.json') && !n.includes('.tmp-'))
    .sort();
}

/**
 * Physical path of `p`, resolving symlinks in the deepest EXISTING ancestor and appending the not-yet-existing tail.
 * ⚠️ On macOS `/var/...` is physically `/private/var/...`; comparing a physical path with a merely lexical one
 * mistakes an inside path for an outside one. Both sides are therefore canonicalised the same way.
 */
export function physicalPath(p: string): string {
  let cur = resolve(p);
  const tail: string[] = [];
  while (!existsSync(cur)) {
    const parent = dirname(cur);
    if (parent === cur) break;
    tail.unshift(cur.slice(parent.length + 1));
    cur = parent;
  }
  const real = existsSync(cur) ? realpathSync.native(cur) : cur;
  return tail.length ? join(real, ...tail) : real;
}

/** ⛔ No output of any pilot command may land inside the home being audited (snapshot, sheet, seal and report alike). */
export function assertOutsideHome(home: string, out: string): void {
  const h = physicalPath(home);
  const o = physicalPath(out);
  const rel = relative(h, o);
  const inside = rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
  if (inside) throw new PilotRefused('OUTPUT_INSIDE_HOME', 'refusing to write inside the delegation home');
}

/** The single write path of the harness: every output goes through the boundary check. */
export function writeOutside(home: string, out: string, data: string, mode?: number): void {
  assertOutsideHome(home, out);
  writeFileSync(out, data, mode === undefined ? undefined : { mode });
  if (mode !== undefined) chmodSync(out, mode); // `mode` on writeFileSync does not repair a reused file
}

export function snapshot(home: string, limit = PILOT_UNIT_TARGET): { manifest: Manifest; index: LocalIndex } {
  const files = primaryFiles(home);
  const dir = join(home, 'work-units-v2');
  const read = files.map((f) => {
    const bytes = readFileSync(join(dir, f));
    let parsed: unknown = null;
    try { parsed = JSON.parse(bytes.toString('utf8')); } catch { /* recorded as underivable */ }
    const unit = isRec(parsed) && isRec(parsed.work_unit) ? parsed.work_unit : parsed;
    const id = isRec(unit) && isRec(unit.identity) && typeof unit.identity.id === 'string' ? unit.identity.id : f.replace(/\.json$/, '');
    return { id, sha: sha256(bytes), unit };
  });
  // Pre-declared deterministic selection: ascending sha256(unit_id). No human choice, no outcome knowledge.
  const chosen = [...read].sort((x, y) => (sha256(x.id) < sha256(y.id) ? -1 : 1)).slice(0, limit);
  const units: ManifestUnit[] = chosen.map((c, i) => {
    const packet = derivePacket(c.unit);
    return {
      pilot_id: `p${String(i + 1).padStart(3, '0')}`,
      unit_ref: opaque(c.id),
      source_sha256: c.sha,
      task_shape: packet?.task_shape ?? null,
      packet,
      packet_underivable: packet === null,
      hindsight_risk: true,
    };
  });
  const body = {
    pilot: PILOT_ID as typeof PILOT_ID, banner: BANNER as typeof BANNER, evidence_class: 'PILOT_HINDSIGHT' as const,
    selection_rule: `ascending sha256(unit_id), first ${limit}; primaries are work-units-v2/*.json excluding *.desktop.json`,
    primaries_found: files.length, units,
  };
  const manifest: Manifest = { ...body, manifest_sha256: bodyHash(body) };
  const index: LocalIndex = {
    pilot: PILOT_ID,
    warning: 'LOCAL ONLY — maps pilot ids to unit ids, which are slugs of authored objectives. Never commit.',
    pilot_id_to_unit_id: Object.fromEntries(chosen.map((c, i) => [`p${String(i + 1).padStart(3, '0')}`, c.id])),
  };
  return { manifest, index };
}

/** Re-hash the sources: a manifest whose sources moved is no longer the thing that was labelled. */
export function verifySources(home: string, manifest: Manifest, index: LocalIndex): void {
  if (manifest.manifest_sha256 !== bodyHash(stripHash(manifest))) {
    throw new PilotRefused('MANIFEST_TAMPERED', 'manifest_sha256 does not match its body');
  }
  const dir = join(home, 'work-units-v2');
  for (const u of manifest.units) {
    const id = index.pilot_id_to_unit_id[u.pilot_id];
    if (!id || opaque(id) !== u.unit_ref) throw new PilotRefused('INDEX_MISMATCH', `${u.pilot_id}`);
    const f = join(dir, `${id}.json`);
    if (!existsSync(f)) throw new PilotRefused('SOURCE_MISSING', u.pilot_id);
    if (sha256(readFileSync(f)) !== u.source_sha256) throw new PilotRefused('SOURCE_DRIFT', `${u.pilot_id} changed after it was hashed`);
  }
}
const stripHash = (m: Manifest): Omit<Manifest, 'manifest_sha256'> => {
  const { manifest_sha256: _drop, ...rest } = m;
  return rest;
};

// ───────────────────────── label sheets and sealing (P first, then F) ─────────────────────────

export interface SheetEntry {
  pilot_id: string;
  target: QuestionId;
  domain: Domain;
  value: LabelValue | null;
  /** The labeller could not place the case on the offered anchors / question. Counted in the report. */
  ambiguous: boolean;
  note: string | null;
  hindsight_risk: boolean;
}
export interface Sheet {
  pilot: typeof PILOT_ID;
  banner: typeof BANNER;
  manifest_sha256: string;
  labeller: 'A' | 'B';
  domain: Domain;
  /** F sheets are cut only after the same labeller's P labels are sealed; this binds them to that seal. */
  after_p_seal_sha256: string | null;
  instructions: string[];
  depth_anchors?: typeof DEPTH_ANCHORS;
  /** P sheets show the packet projection and NOTHING else about the unit. */
  packets?: Record<string, DerivedPacket | null>;
  entries: SheetEntry[];
}

export const DEPTH_ANCHORS = {
  status: 'PILOT_CANDIDATE — NOT FROZEN — not J1 semantics; the pilot exists to find where these fail',
  bands: {
    1: 'mechanical: bounded, explicit, essentially deterministic',
    2: 'routine: some interpretation or reasoning, but local and familiar',
    3: 'integrative: several interacting facts or constraints; deliberate synthesis required',
    4: 'deep: cross-system, architectural or constitutional, or substantial ambiguity needing extended reasoning',
    5: 'frontier: novel or highly ambiguous, interacting unknowns, adversarial exploration or open-ended synthesis',
  },
} as const;

const COMMON = [
  'Q_DEPTH: integer band 1..5 against depth_anchors. If a case does not sit on the anchors, choose the nearest band AND set ambiguous=true (and say why in note).',
  'Q_RISK: true = risk warrants escalation. Q_SUFFICIENT: true = the state is sufficient to proceed. Q_LLM_NEEDED: true = a model is needed.',
  'Every label here is hindsight-exposed: you know how these units ended. Label what was knowable AT ROUTING TIME and set ambiguous=true if you cannot.',
  'Do not label any authority fact (merge, deploy, spend, disclosure). Those are deterministic and are never a target.',
];
export const INSTRUCTIONS_P = [
  'P PASS — PACKET ONLY. Use ONLY the packet shown for each unit. Do not open the unit, its objective, its paths, or its outcome.',
  'Value "UNDETERMINABLE" is allowed in P when the packet cannot support the question.',
  ...COMMON,
];
export const INSTRUCTIONS_F = [
  'F PASS — FULL ROUTED STATE as it stood at routing time. Cut only after your P labels were sealed. F may not be "UNDETERMINABLE".',
  ...COMMON,
];

export const sealDigest = (s: Sealed): string => sha256(JSON.stringify(s));

export function blankSheet(manifest: Manifest, labeller: 'A' | 'B', domain: Domain, priorPSeal?: Sealed): Sheet {
  let after: string | null = null;
  if (domain === 'F') {
    if (!priorPSeal) throw new PilotRefused('P_NOT_SEALED', 'the F sheet is cut only after this labeller sealed P');
    assertPSealComplete(manifest, priorPSeal, labeller);
    after = sealDigest(priorPSeal);
  }
  const entries: SheetEntry[] = [];
  for (const u of manifest.units) {
    for (const target of QUESTION_IDS) {
      entries.push({ pilot_id: u.pilot_id, target, domain, value: null, ambiguous: false, note: null, hindsight_risk: true });
    }
  }
  const sheet: Sheet = {
    pilot: PILOT_ID, banner: BANNER, manifest_sha256: manifest.manifest_sha256, labeller, domain,
    after_p_seal_sha256: after, instructions: domain === 'P' ? INSTRUCTIONS_P : INSTRUCTIONS_F, depth_anchors: DEPTH_ANCHORS, entries,
  };
  if (domain === 'P') sheet.packets = Object.fromEntries(manifest.units.map((u) => [u.pilot_id, u.packet]));
  return sheet;
}

export interface Sealed {
  pilot: typeof PILOT_ID;
  manifest_sha256: string;
  labeller: 'A' | 'B';
  domain: Domain;
  after_p_seal_sha256: string | null;
  labels: HumanLabel[];
  /**
   * ⛔ Content-free by construction: COUNTS only. Free-text notes can carry objective text, paths or routed-state
   * fragments, so they never enter a committable artifact; see `extractAnnotations` (local-only, mode 0600).
   */
  ambiguity_counts: Record<QuestionId, number>;
}

export interface LocalAnnotations {
  pilot: typeof PILOT_ID;
  warning: string;
  manifest_sha256: string;
  labeller: 'A' | 'B';
  domain: Domain;
  entries: Array<{ pilot_id: string; target: QuestionId; ambiguous: boolean; note: string | null }>;
}

/** The free-text side of a sheet. LOCAL ONLY — never commit, never pass to `report`. */
export function extractAnnotations(sheet: Sheet): LocalAnnotations {
  return {
    pilot: PILOT_ID,
    warning: 'LOCAL ONLY — free-text notes may contain authored or routed-state material. Never commit.',
    manifest_sha256: sheet.manifest_sha256, labeller: sheet.labeller, domain: sheet.domain,
    entries: sheet.entries.filter((e) => e.ambiguous === true || e.note !== null).map((e) => ({ pilot_id: e.pilot_id, target: e.target, ambiguous: e.ambiguous === true, note: e.note })),
  };
}

function assertPSealComplete(manifest: Manifest, p: Sealed, labeller: 'A' | 'B'): void {
  if (p.domain !== 'P' || p.labeller !== labeller || p.manifest_sha256 !== manifest.manifest_sha256) {
    throw new PilotRefused('P_SEAL_MISMATCH', 'not a P seal of this labeller for this manifest');
  }
  if (p.labels.length !== manifest.units.length * QUESTION_IDS.length) throw new PilotRefused('P_SEAL_INCOMPLETE', 'P seal does not cover every unit and question');
}

/** Each label is committed before anything else can be observed; here that is order within the file. */
export function seal(
  manifest: Manifest, sheet: Sheet, startSeq = 1, priorPSeal?: Sealed, salter: () => string = () => randomBytes(8).toString('hex'),
): Sealed {
  if (sheet.manifest_sha256 !== manifest.manifest_sha256) throw new PilotRefused('SHEET_FOR_OTHER_MANIFEST', 'sheet was not cut from this manifest');
  let seq = startSeq;
  if (sheet.domain === 'F') {
    if (!priorPSeal) throw new PilotRefused('P_NOT_SEALED', 'F cannot be sealed without this labeller\'s P seal');
    assertPSealComplete(manifest, priorPSeal, sheet.labeller);
    if (sheet.after_p_seal_sha256 !== sealDigest(priorPSeal)) throw new PilotRefused('F_NOT_CUT_AFTER_P_SEAL', 'sheet is not bound to this P seal');
    seq = Math.max(startSeq, Math.max(...priorPSeal.labels.map((l) => l.committed_seq)) + 1);
  } else if (sheet.after_p_seal_sha256 !== null) {
    throw new PilotRefused('P_SHEET_BOUND_TO_SEAL', 'a P sheet carries no prior seal');
  }
  const ids = new Set(manifest.units.map((u) => u.pilot_id));
  const seen = new Set<string>();
  const labels: HumanLabel[] = [];
  const ambiguity_counts: Record<QuestionId, number> = { Q_DEPTH: 0, Q_RISK: 0, Q_SUFFICIENT: 0, Q_LLM_NEEDED: 0 };
  for (const e of sheet.entries) {
    if (!isQuestionId(e.target)) throw new PilotRefused('AUTHORITY_TARGET', `"${String(e.target)}" is not a J1 question`);
    if (!ids.has(e.pilot_id)) throw new PilotRefused('UNKNOWN_UNIT', e.pilot_id);
    if (e.domain !== sheet.domain) throw new PilotRefused('DOMAIN_MIXED', `${e.pilot_id}/${e.target} is ${e.domain} on a ${sheet.domain} sheet`);
    if (e.hindsight_risk !== true) throw new PilotRefused('HINDSIGHT_RISK_NOT_MARKED', `${e.pilot_id}/${e.target}/${e.domain}`);
    if (e.value === null) throw new PilotRefused('INCOMPLETE_SHEET', `${e.pilot_id}/${e.target}/${e.domain} has no value`);
    if (e.domain === 'F' && e.value === 'UNDETERMINABLE') throw new PilotRefused('F_UNDETERMINABLE', `${e.pilot_id}/${e.target}`);
    const k = `${e.pilot_id}|${e.target}|${e.domain}`;
    if (seen.has(k)) throw new PilotRefused('DUPLICATE_LABEL', k);
    seen.add(k);
    const base = { unit_id: e.pilot_id, target: e.target, domain: e.domain, labeller: sheet.labeller, labeller_kind: 'human' as const, value: e.value, salt: salter() };
    labels.push({ ...base, committed_seq: seq, commitment: commitmentOf(base) });
    seq += 1;
    if (e.ambiguous === true) ambiguity_counts[e.target] += 1;
  }
  return {
    pilot: PILOT_ID, manifest_sha256: manifest.manifest_sha256, labeller: sheet.labeller, domain: sheet.domain,
    after_p_seal_sha256: sheet.after_p_seal_sha256, labels, ambiguity_counts,
  };
}

// ───────────────────────── descriptive report ─────────────────────────

export function report(manifest: Manifest, sealed: Sealed[]): string {
  for (const s of sealed) if (s.manifest_sha256 !== manifest.manifest_sha256) throw new PilotRefused('SEAL_FOR_OTHER_MANIFEST', `labeller ${s.labeller}`);
  // P-before-F is part of the custody, so the report re-checks it rather than trusting the sheet.
  for (const f of sealed.filter((s) => s.domain === 'F')) {
    const p = sealed.find((s) => s.domain === 'P' && s.labeller === f.labeller && sealDigest(s) === f.after_p_seal_sha256);
    if (!p) throw new PilotRefused('F_WITHOUT_PRIOR_P_SEAL', `labeller ${f.labeller}: no P seal matches the one F was cut after`);
    if (Math.min(...f.labels.map((l) => l.committed_seq)) <= Math.max(...p.labels.map((l) => l.committed_seq))) {
      throw new PilotRefused('F_NOT_AFTER_P', `labeller ${f.labeller}: F sequence does not follow P`);
    }
  }
  const units: UnitRecord[] = manifest.units.map((u) => ({
    unit_id: u.pilot_id, task_shape: u.task_shape ?? 'UNDERIVABLE', origin: 'real', hindsight_risk: true,
  }));
  const input: EvaluationInput = { config: PILOT_CONFIG, units, labels: sealed.flatMap((s) => s.labels), judgments: [] };
  const ev = evaluate(input);
  const L: string[] = [];
  L.push(BANNER, `${PILOT_ID}`, `evidence_class: ${ev.evidence_class} (instrument) / PILOT_HINDSIGHT (custody)`, 'licenses: NOTHING', 'verdict: NOT PRODUCED (no provider judgments; Label B may be absent)', '');
  const shapes: Record<string, number> = {};
  for (const u of manifest.units) shapes[u.task_shape ?? 'UNDERIVABLE'] = (shapes[u.task_shape ?? 'UNDERIVABLE'] ?? 0) + 1;
  L.push(`units: ${manifest.units.length} of ${manifest.primaries_found} primaries · packet underivable: ${manifest.units.filter((u) => u.packet_underivable).length}`);
  L.push(`task_shape distribution: ${JSON.stringify(shapes)}`, `seals present: ${sealed.map((s) => `${s.labeller}/${s.domain}`).join(', ') || 'none'}`, '');
  for (const q of QUESTION_IDS) {
    const r = ev.questions[q];
    const f = (d: 'P' | 'F'): string => { const a = r.agreement[d]; return `${a.kind} κ=${a.kappa === null ? 'undefined' : a.kappa.toFixed(3)} n=${a.n_pairs}`; };
    L.push(`${q}: agreement P[${f('P')}] F[${f('F')}] · undeterminable_rate_P=${r.undeterminable_rate_P === null ? 'n/a' : r.undeterminable_rate_P.toFixed(3)} · packet_interpretability=${r.packet_interpretability.state}`);
    const per = Object.entries(r.agreement_by_task_shape.F).map(([s, a]) => `${s}:κ=${a.kappa === null ? 'undef' : a.kappa.toFixed(2)}(n=${a.n_pairs})`).join(' ');
    L.push(`  per-stratum F agreement (reported, NOT gated): ${per || 'none'}`);
    L.push(`  disagreements retained: P=${r.disagreements.P.length} F=${r.disagreements.F.length}`);
    const ambOf = (d: Domain): number => sealed.filter((x) => x.domain === d).reduce((n, x) => n + x.ambiguity_counts[q], 0);
    L.push(`  flagged ambiguous: P=${ambOf('P')} F=${ambOf('F')}${q === 'Q_DEPTH' ? ' (anchor ambiguity — the pilot\'s main Q_DEPTH output)' : ''}`);
  }
  L.push('', 'Every historical label is HINDSIGHT_RISK. Agreement rule NOT frozen. Q_DEPTH anchors are PILOT_CANDIDATE and floors are settled from this pilot by a later founder act.');
  return L.join('\n') + '\n';
}
