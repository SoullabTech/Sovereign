/**
 * Human-facing PILOT-01 packet-only labelling model.
 *
 * This module never reads the delegation home or local index. It operates only on
 * the already-cut P sheet and a local working copy.
 */
import { chmodSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import type { DerivedPacket, Sheet } from './pilot';
import { QUESTION_IDS, type LabelValue, type QuestionId } from '../core';

export interface HumanAnswer {
  value: LabelValue;
  ambiguous: boolean;
  note: string | null;
}

export interface HumanCaseView {
  case_number: number;
  pilot_id: string;
  packet: {
    task_shape: string | null;
    contains_sensitive: boolean | null;
    requires_external_info: boolean | null;
    change_scope: {
      file_count: number | null;
      migration: boolean | null;
      auth: boolean | null;
      production: boolean | null;
    };
  };
  answers: Record<QuestionId, HumanAnswer | null>;
  complete: boolean;
}

export interface HumanUiState {
  pilot: string;
  banner: string;
  labeller: 'A' | 'B';
  domain: 'P';
  manifest_sha256: string;
  completed_cases: number;
  total_cases: number;
  cases: HumanCaseView[];
  depth_anchors: Sheet['depth_anchors'];
}

export class HumanUiRefused extends Error {
  constructor(public readonly code: string, detail: string) {
    super(`${code}: ${detail}`);
  }
}

const cleanPacket = (p: DerivedPacket | null | undefined): HumanCaseView['packet'] => ({
  task_shape: p?.task_shape ?? null,
  contains_sensitive: typeof p?.contains_sensitive === 'boolean' ? p.contains_sensitive : null,
  requires_external_info: typeof p?.requires_external_info === 'boolean' ? p.requires_external_info : null,
  change_scope: {
    file_count: typeof p?.change_scope?.file_count === 'number' ? p.change_scope.file_count : null,
    migration: typeof p?.change_scope?.migration === 'boolean' ? p.change_scope.migration : null,
    auth: typeof p?.change_scope?.auth === 'boolean' ? p.change_scope.auth : null,
    production: typeof p?.change_scope?.production === 'boolean' ? p.change_scope.production : null,
  },
});

export function assertHumanPSheet(sheet: Sheet): void {
  if (sheet.domain !== 'P') throw new HumanUiRefused('P_ONLY', 'the human UI accepts only a packet-only P sheet');
  if (sheet.labeller !== 'A') throw new HumanUiRefused('KELLY_ONLY', 'this UI lane is cut for Label A');
  if (sheet.after_p_seal_sha256 !== null) throw new HumanUiRefused('P_BOUND_TO_SEAL', 'a P sheet must not carry a prior seal');
  if (!sheet.packets) throw new HumanUiRefused('PACKETS_MISSING', 'P sheet has no packet projection');
  const expected = Object.keys(sheet.packets).length * QUESTION_IDS.length;
  if (sheet.entries.length !== expected) throw new HumanUiRefused('ENTRY_COUNT', `expected ${expected} entries, got ${sheet.entries.length}`);
  for (const e of sheet.entries) {
    if (e.domain !== 'P') throw new HumanUiRefused('DOMAIN_MIXED', 'non-P entry present');
    if (!(e.pilot_id in sheet.packets)) throw new HumanUiRefused('UNKNOWN_CASE', e.pilot_id);
  }
}

function answerFor(sheet: Sheet, pilotId: string, q: QuestionId): HumanAnswer | null {
  const e = sheet.entries.find((x) => x.pilot_id === pilotId && x.target === q);
  if (!e || e.value === null) return null;
  return { value: e.value, ambiguous: e.ambiguous === true, note: e.note };
}

export function humanUiState(sheet: Sheet): HumanUiState {
  assertHumanPSheet(sheet);
  const ids = Object.keys(sheet.packets ?? {});
  const cases = ids.map((pilotId, i): HumanCaseView => {
    const answers = Object.fromEntries(QUESTION_IDS.map((q) => [q, answerFor(sheet, pilotId, q)])) as Record<QuestionId, HumanAnswer | null>;
    return {
      case_number: i + 1,
      pilot_id: pilotId,
      packet: cleanPacket(sheet.packets?.[pilotId]),
      answers,
      complete: QUESTION_IDS.every((q) => answers[q] !== null),
    };
  });
  return {
    pilot: sheet.pilot,
    banner: sheet.banner,
    labeller: sheet.labeller,
    domain: 'P',
    manifest_sha256: sheet.manifest_sha256,
    completed_cases: cases.filter((c) => c.complete).length,
    total_cases: cases.length,
    cases,
    depth_anchors: sheet.depth_anchors,
  };
}

function validValue(q: QuestionId, v: unknown): v is LabelValue {
  if (v === 'UNDETERMINABLE') return true;
  if (q === 'Q_DEPTH') return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 5;
  return typeof v === 'boolean';
}

export function applyHumanCase(
  sheet: Sheet,
  pilotId: string,
  answers: Partial<Record<QuestionId, HumanAnswer>>,
): Sheet {
  assertHumanPSheet(sheet);
  if (!sheet.packets || !(pilotId in sheet.packets)) throw new HumanUiRefused('UNKNOWN_CASE', pilotId);
  for (const q of QUESTION_IDS) {
    const a = answers[q];
    if (!a) throw new HumanUiRefused('INCOMPLETE_CASE', `${pilotId}/${q}`);
    if (!validValue(q, a.value)) throw new HumanUiRefused('INVALID_VALUE', `${pilotId}/${q}`);
    if (typeof a.ambiguous !== 'boolean') throw new HumanUiRefused('INVALID_AMBIGUITY', `${pilotId}/${q}`);
    if (a.note !== null && (typeof a.note !== 'string' || a.note.length > 1200)) {
      throw new HumanUiRefused('INVALID_NOTE', `${pilotId}/${q}`);
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

export function readWorkingSheet(sourcePath: string, workingPath: string): Sheet {
  const source = JSON.parse(readFileSync(sourcePath, 'utf8')) as Sheet;
  assertHumanPSheet(source);
  try {
    const working = JSON.parse(readFileSync(workingPath, 'utf8')) as Sheet;
    assertHumanPSheet(working);
    if (working.manifest_sha256 !== source.manifest_sha256) {
      throw new HumanUiRefused('WORKING_MANIFEST_MISMATCH', 'working copy belongs to a different manifest');
    }
    if (JSON.stringify(working.packets) !== JSON.stringify(source.packets)) {
      throw new HumanUiRefused('WORKING_PACKET_DRIFT', 'working copy packet projection differs from the source sheet');
    }
    return working;
  } catch (e) {
    if (e instanceof HumanUiRefused) throw e;
    if (e && typeof e === 'object' && 'code' in e && (e as { code?: string }).code === 'ENOENT') return source;
    throw new HumanUiRefused('WORKING_READ_FAILED', e instanceof Error ? e.message : String(e));
  }
}

export function writeWorkingSheet(path: string, sheet: Sheet): void {
  assertHumanPSheet(sheet);
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(sheet, null, 2) + '\n', { mode: 0o600 });
  chmodSync(tmp, 0o600);
  renameSync(tmp, path);
  chmodSync(path, 0o600);
}
