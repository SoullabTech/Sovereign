/**
 * Kelly-facing F-pass model: full routing-time state, after P is sealed.
 *
 * Never exposes execution attempts, outcomes, verifier results, resulting commits,
 * or later lifecycle state. Reads only the already-frozen source units through the
 * local-only index after verifySources has proven byte identity.
 */
import { chmodSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LocalIndex, Manifest, Sheet } from './pilot';
import { verifySources } from './pilot';
import { HumanUiRefused, type HumanAnswer } from './human-ui-model';
import { QUESTION_IDS, type QuestionId } from '../core';

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => v !== null && typeof v === 'object' && !Array.isArray(v);
const clone = <T>(v: T): T => structuredClone(v);

export interface FullRoutingState {
  identity: unknown;
  custody: unknown;
  routing_request: unknown;
  context: unknown;
  scope: unknown;
  authority: unknown;
  evaluation: {
    acceptance_conditions: unknown;
    falsification_conditions: unknown;
    stop_conditions: unknown;
  };
  routing: {
    router_version: unknown;
    route_version: unknown;
    route_source: unknown;
    bound_at_sha: unknown;
    primary: unknown;
    challengers: unknown;
    transport_bindings: unknown;
    route_record: unknown;
  };
}

export interface HumanFCaseView {
  case_number: number;
  pilot_id: string;
  full_state: FullRoutingState;
  answers: Record<QuestionId, HumanAnswer | null>;
  complete: boolean;
}

export interface HumanFUiState {
  pilot: string;
  banner: string;
  labeller: 'A' | 'B';
  domain: 'F';
  manifest_sha256: string;
  after_p_seal_sha256: string;
  completed_cases: number;
  total_cases: number;
  cases: HumanFCaseView[];
  depth_anchors: Sheet['depth_anchors'];
}

export function assertHumanFSheet(sheet: Sheet): void {
  if (sheet.domain !== 'F') throw new HumanUiRefused('F_ONLY', 'the F UI accepts only an F sheet');
  if (sheet.labeller !== 'A') throw new HumanUiRefused('KELLY_ONLY', 'this UI lane is cut for Label A');
  if (!sheet.after_p_seal_sha256) throw new HumanUiRefused('P_NOT_SEALED', 'F must be bound to Kelly\'s sealed P pass');
  if (sheet.packets !== undefined) throw new HumanUiRefused('F_PACKET_COPY', 'F sheet must not embed packet projections');
  if (sheet.entries.length % QUESTION_IDS.length !== 0) throw new HumanUiRefused('ENTRY_COUNT', 'F entry count is not case-aligned');
  for (const e of sheet.entries) {
    if (e.domain !== 'F') throw new HumanUiRefused('DOMAIN_MIXED', 'non-F entry present');
  }
}

export function routingTimeView(raw: unknown): FullRoutingState {
  const root = isRec(raw) && isRec(raw.work_unit) ? raw.work_unit : raw;
  if (!isRec(root)) throw new HumanUiRefused('SOURCE_SHAPE', 'work unit is not structured');
  const evaluation = isRec(root.evaluation) ? root.evaluation : {};
  const routing = isRec(root.routing) ? root.routing : {};
  return {
    identity: clone(root.identity ?? null),
    custody: clone(root.custody ?? null),
    routing_request: clone(root.routing_request ?? null),
    context: clone(root.context ?? null),
    scope: clone(root.scope ?? null),
    authority: clone(root.authority ?? null),
    evaluation: {
      acceptance_conditions: clone(evaluation.acceptance_conditions ?? []),
      falsification_conditions: clone(evaluation.falsification_conditions ?? []),
      stop_conditions: clone(evaluation.stop_conditions ?? []),
    },
    routing: {
      router_version: clone(routing.router_version ?? null),
      route_version: clone(routing.route_version ?? null),
      route_source: clone(routing.route_source ?? null),
      bound_at_sha: clone(routing.bound_at_sha ?? null),
      primary: clone(routing.primary ?? null),
      challengers: clone(routing.challengers ?? []),
      transport_bindings: clone(routing.transport_bindings ?? []),
      route_record: clone(routing.route_record ?? null),
    },
  };
}

export function loadRoutingStates(home: string, manifest: Manifest, index: LocalIndex): Record<string, FullRoutingState> {
  verifySources(home, manifest, index);
  const out: Record<string, FullRoutingState> = {};
  for (const u of manifest.units) {
    const id = index.pilot_id_to_unit_id[u.pilot_id];
    if (!id) throw new HumanUiRefused('INDEX_MISMATCH', u.pilot_id);
    const path = join(home, 'work-units-v2', id + '.json');
    out[u.pilot_id] = routingTimeView(JSON.parse(readFileSync(path, 'utf8')));
  }
  return out;
}

function answerFor(sheet: Sheet, pilotId: string, q: QuestionId): HumanAnswer | null {
  const e = sheet.entries.find((x) => x.pilot_id === pilotId && x.target === q);
  if (!e || e.value === null) return null;
  return { value: e.value, ambiguous: e.ambiguous === true, note: e.note };
}

export function humanFUiState(sheet: Sheet, states: Record<string, FullRoutingState>): HumanFUiState {
  assertHumanFSheet(sheet);
  const ids = [...new Set(sheet.entries.map((e) => e.pilot_id))];
  const cases = ids.map((pilotId, i): HumanFCaseView => {
    const full_state = states[pilotId];
    if (!full_state) throw new HumanUiRefused('FULL_STATE_MISSING', pilotId);
    const answers = Object.fromEntries(QUESTION_IDS.map((q) => [q, answerFor(sheet, pilotId, q)])) as Record<QuestionId, HumanAnswer | null>;
    return {
      case_number: i + 1,
      pilot_id: pilotId,
      full_state,
      answers,
      complete: QUESTION_IDS.every((q) => answers[q] !== null),
    };
  });
  return {
    pilot: sheet.pilot,
    banner: sheet.banner,
    labeller: sheet.labeller,
    domain: 'F',
    manifest_sha256: sheet.manifest_sha256,
    after_p_seal_sha256: sheet.after_p_seal_sha256 as string,
    completed_cases: cases.filter((c) => c.complete).length,
    total_cases: cases.length,
    cases,
    depth_anchors: sheet.depth_anchors,
  };
}

function validFValue(q: QuestionId, v: unknown): boolean {
  if (v === 'UNDETERMINABLE') return false;
  if (q === 'Q_DEPTH') return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5;
  return typeof v === 'boolean';
}

export function applyHumanFCase(
  sheet: Sheet,
  pilotId: string,
  answers: Partial<Record<QuestionId, HumanAnswer>>,
): Sheet {
  assertHumanFSheet(sheet);
  if (!sheet.entries.some((e) => e.pilot_id === pilotId)) throw new HumanUiRefused('UNKNOWN_CASE', pilotId);
  for (const q of QUESTION_IDS) {
    const a = answers[q];
    if (!a) throw new HumanUiRefused('INCOMPLETE_CASE', pilotId + '/' + q);
    if (!validFValue(q, a.value)) throw new HumanUiRefused('INVALID_F_VALUE', pilotId + '/' + q);
    if (typeof a.ambiguous !== 'boolean') throw new HumanUiRefused('INVALID_AMBIGUITY', pilotId + '/' + q);
    if (a.note !== null && (typeof a.note !== 'string' || a.note.length > 1200)) {
      throw new HumanUiRefused('INVALID_NOTE', pilotId + '/' + q);
    }
  }
  const next = structuredClone(sheet);
  for (const e of next.entries) {
    if (e.pilot_id !== pilotId) continue;
    const a = answers[e.target];
    if (!a) continue;
    e.value = a.value;
    e.ambiguous = a.ambiguous;
    e.note = a.note?.trim() ? a.note.trim() : null;
  }
  return next;
}

export function readWorkingFSheet(sourcePath: string, workingPath: string): Sheet {
  const source = JSON.parse(readFileSync(sourcePath, 'utf8')) as Sheet;
  assertHumanFSheet(source);
  try {
    const working = JSON.parse(readFileSync(workingPath, 'utf8')) as Sheet;
    assertHumanFSheet(working);
    if (working.manifest_sha256 !== source.manifest_sha256) {
      throw new HumanUiRefused('WORKING_MANIFEST_MISMATCH', 'working copy belongs to a different manifest');
    }
    if (working.after_p_seal_sha256 !== source.after_p_seal_sha256) {
      throw new HumanUiRefused('WORKING_P_SEAL_MISMATCH', 'working copy is bound to a different P seal');
    }
    return working;
  } catch (e) {
    if (e instanceof HumanUiRefused) throw e;
    if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === 'ENOENT') return source;
    throw new HumanUiRefused('WORKING_READ_FAILED', e instanceof Error ? e.message : String(e));
  }
}

export function writeWorkingFSheet(path: string, sheet: Sheet): void {
  assertHumanFSheet(sheet);
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(sheet, null, 2) + '\n', { mode: 0o600 });
  chmodSync(tmp, 0o600);
  renameSync(tmp, path);
  chmodSync(path, 0o600);
}

export function writeAndVerifyWorkingFSheet(sourcePath: string, workingPath: string, sheet: Sheet): Sheet {
  writeWorkingFSheet(workingPath, sheet);
  const persisted = readWorkingFSheet(sourcePath, workingPath);
  if (JSON.stringify(persisted) !== JSON.stringify(sheet)) {
    throw new HumanUiRefused('WORKING_VERIFY_FAILED', 'F working sheet did not read back exactly after save');
  }
  return persisted;
}
