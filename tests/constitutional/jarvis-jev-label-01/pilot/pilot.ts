/**
 * JARVIS-JEV-LABEL-01-PILOT-01 — historical pilot harness and custody packet.
 *
 * Read-only against the delegation home. Source units are hashed BEFORE any label exists; every historical
 * label carries HINDSIGHT_RISK. Manifests are content-free: no objective, no path, no unit id (the id is a
 * slug of the objective and so is itself authored text). No provider is called; none can be.
 */
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
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

/** ⛔ The output may never land inside the home being read: the pilot must not write to what it audits. */
export function assertOutsideHome(home: string, out: string): void {
  const h = realpathSync(resolve(home));
  const o = resolve(out);
  const rel = relative(h, o);
  if (rel === '' || (!rel.startsWith('..') && !rel.startsWith(sep) && !/^[a-zA-Z]:/.test(rel))) {
    throw new PilotRefused('OUTPUT_INSIDE_HOME', 'refusing to write inside the delegation home');
  }
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

// ───────────────────────── label sheet and sealing ─────────────────────────

export interface SheetEntry {
  pilot_id: string;
  target: QuestionId;
  domain: Domain;
  value: LabelValue | null;
  hindsight_risk: boolean;
}
export interface Sheet {
  pilot: typeof PILOT_ID;
  banner: typeof BANNER;
  manifest_sha256: string;
  labeller: 'A' | 'B';
  instructions: string[];
  entries: SheetEntry[];
}
export const INSTRUCTIONS = [
  'F = the full routed state of the unit as it stood at routing time. P = the packet fields only (what Jev could see).',
  'Q_DEPTH: integer band 1..5 (the pilot is where the five band ANCHORS are settled; record anything ambiguous in notes, not in the value).',
  'Q_RISK: true = risk warrants escalation. Q_SUFFICIENT: true = state is sufficient to proceed. Q_LLM_NEEDED: true = a model is needed.',
  'P may be the string "UNDETERMINABLE" when the packet cannot support the question. F may not.',
  'Every label here is hindsight-exposed: you know how these units ended. Label what was knowable AT ROUTING TIME and say so if you cannot.',
  'Do not label any authority fact (merge, deploy, spend, disclosure). Those are deterministic and are never a target.',
];

export function blankSheet(manifest: Manifest, labeller: 'A' | 'B'): Sheet {
  const entries: SheetEntry[] = [];
  for (const u of manifest.units) {
    for (const target of QUESTION_IDS) for (const domain of ['P', 'F'] as const) {
      entries.push({ pilot_id: u.pilot_id, target, domain, value: null, hindsight_risk: true });
    }
  }
  return { pilot: PILOT_ID, banner: BANNER, manifest_sha256: manifest.manifest_sha256, labeller, instructions: INSTRUCTIONS, entries };
}

export interface Sealed { pilot: typeof PILOT_ID; manifest_sha256: string; labeller: 'A' | 'B'; labels: HumanLabel[] }

/** Each label is committed before anything else can be observed; here that is order within the file. */
export function seal(manifest: Manifest, sheet: Sheet, startSeq = 1, salter: () => string = () => randomBytes(8).toString('hex')): Sealed {
  if (sheet.manifest_sha256 !== manifest.manifest_sha256) throw new PilotRefused('SHEET_FOR_OTHER_MANIFEST', 'sheet was not cut from this manifest');
  const ids = new Set(manifest.units.map((u) => u.pilot_id));
  const seen = new Set<string>();
  const labels: HumanLabel[] = [];
  sheet.entries.forEach((e, i) => {
    if (!isQuestionId(e.target)) throw new PilotRefused('AUTHORITY_TARGET', `"${String(e.target)}" is not a J1 question`);
    if (!ids.has(e.pilot_id)) throw new PilotRefused('UNKNOWN_UNIT', e.pilot_id);
    if (e.hindsight_risk !== true) throw new PilotRefused('HINDSIGHT_RISK_NOT_MARKED', `${e.pilot_id}/${e.target}/${e.domain}`);
    if (e.value === null) throw new PilotRefused('INCOMPLETE_SHEET', `${e.pilot_id}/${e.target}/${e.domain} has no value`);
    const k = `${e.pilot_id}|${e.target}|${e.domain}`;
    if (seen.has(k)) throw new PilotRefused('DUPLICATE_LABEL', k);
    seen.add(k);
    const base = { unit_id: e.pilot_id, target: e.target, domain: e.domain, labeller: sheet.labeller, labeller_kind: 'human' as const, value: e.value, salt: salter() };
    labels.push({ ...base, committed_seq: startSeq + i, commitment: commitmentOf(base) });
  });
  return { pilot: PILOT_ID, manifest_sha256: manifest.manifest_sha256, labeller: sheet.labeller, labels };
}

// ───────────────────────── descriptive report ─────────────────────────

export function report(manifest: Manifest, sealed: Sealed[]): string {
  for (const s of sealed) if (s.manifest_sha256 !== manifest.manifest_sha256) throw new PilotRefused('SEAL_FOR_OTHER_MANIFEST', `labeller ${s.labeller}`);
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
  L.push(`task_shape distribution: ${JSON.stringify(shapes)}`, `labellers present: ${sealed.map((s) => s.labeller).join(',') || 'none'}`, '');
  for (const q of QUESTION_IDS) {
    const r = ev.questions[q];
    const f = (d: 'P' | 'F'): string => { const a = r.agreement[d]; return `${a.kind} κ=${a.kappa === null ? 'undefined' : a.kappa.toFixed(3)} n=${a.n_pairs}`; };
    L.push(`${q}: agreement P[${f('P')}] F[${f('F')}] · undeterminable_rate_P=${r.undeterminable_rate_P === null ? 'n/a' : r.undeterminable_rate_P.toFixed(3)} · packet_interpretability=${r.packet_interpretability.state}`);
    const per = Object.entries(r.agreement_by_task_shape.F).map(([s, a]) => `${s}:κ=${a.kappa === null ? 'undef' : a.kappa.toFixed(2)}(n=${a.n_pairs})`).join(' ');
    L.push(`  per-stratum F agreement (reported, NOT gated): ${per || 'none'}`);
    L.push(`  disagreements retained: P=${r.disagreements.P.length} F=${r.disagreements.F.length}`);
  }
  L.push('', 'Every historical label is HINDSIGHT_RISK. Agreement rule NOT frozen. Q_DEPTH anchors and floors are settled from this pilot by a later founder act.');
  return L.join('\n') + '\n';
}
