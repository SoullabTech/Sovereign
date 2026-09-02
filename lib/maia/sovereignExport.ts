/**
 * Ledger-driven sovereign export — MIPA Phase 0, P1c.
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P1c
 *
 * The export is BUILT FROM `SOVEREIGN_DISPOSITION`, not written alongside it.
 * That is the whole point: an owed representation cannot quietly stop being
 * exported, because there is no second list to fall out of sync with the first.
 *
 * ── WHAT A LOGICAL OBJECT CARRIES ───────────────────────────────────────────
 *
 * Not a table dump. Each object states what it is, who authored it, what
 * epistemic weight it has, and — where provenance is unresolved — says so in
 * the member's own copy rather than presenting an unknown as a fact.
 *
 * ── THE TWO FAILURES THIS REFUSES ───────────────────────────────────────────
 *
 *   1. A read failure rendered as absence. `records: null` plus an `error` is
 *      the only representation of a failed read. `[]` means the member has
 *      none. P1a established this; here it is structural for every object.
 *   2. A silent truncation. The row cap is declared, and an object that hits it
 *      says `truncatedAt`, because an export that quietly stops is a false
 *      statement about the member's record.
 */

import { query } from '@/lib/db/postgres';
import {
  SOVEREIGN_DISPOSITION,
  OWED_LOGICAL_EXPORTS,
  FORBIDDEN_EXPORT_COLUMNS,
  EXPORT_ROW_CAP,
  type LogicalExportSpec,
} from './sovereignDisposition';
import { SOVEREIGN_CORPUS, type CorpusKey } from './sovereignCorpus';

export interface LogicalExportObject {
  representation: string;
  logicalType: string;
  corpusClass: string;
  authorship: LogicalExportSpec['authorship'];
  authorityClass: LogicalExportSpec['authorityClass'];
  /** Write-path evidence recorded in the P1b census. */
  provenance: string;
  /** Which sovereignty dispositions this representation carries. */
  dispositions: readonly string[];
  fieldAuthorship?: Readonly<Record<string, 'member' | 'system'>>;
  uncertainty?: string;
  temporalField: string;
  /** `null` means the read FAILED. `[]` means you have none. */
  records: Record<string, unknown>[] | null;
  error?: string;
  truncatedAt?: number;
}

/** Build the SELECT for one logical object. Column names come from the ledger. */
export function buildSelect(spec: LogicalExportSpec): string {
  const cols = [...spec.select];
  for (const c of cols) {
    if (FORBIDDEN_EXPORT_COLUMNS.includes(c)) {
      // Not a warning. A credential in an autobiographical export is a
      // different kind of object than the export claims to contain.
      throw new Error(`[SovereignExport] forbidden column in export spec: ${spec.table}.${c}`);
    }
  }
  const computed = (spec.computed ?? []).map((c) => `${c.expr} AS ${c.as}`);
  const projection = [...cols, ...computed].join(', ');
  return `SELECT ${projection}
          FROM ${spec.table}
          WHERE ${spec.memberKey} = $1
          ORDER BY ${spec.temporalField} DESC
          LIMIT ${EXPORT_ROW_CAP}`;
}

async function buildOne(key: CorpusKey, memberId: string): Promise<LogicalExportObject> {
  const entry = SOVEREIGN_DISPOSITION[key];
  const spec = entry.export!;
  const base: LogicalExportObject = {
    representation: key,
    logicalType: spec.logicalType,
    corpusClass: SOVEREIGN_CORPUS[key].class,
    authorship: spec.authorship,
    authorityClass: spec.authorityClass,
    provenance: SOVEREIGN_CORPUS[key].evidence,
    dispositions: entry.dispositions,
    ...(spec.fieldAuthorship ? { fieldAuthorship: spec.fieldAuthorship } : {}),
    ...(spec.uncertainty ? { uncertainty: spec.uncertainty } : {}),
    temporalField: spec.temporalField,
    records: null,
  };

  try {
    const result = await query(buildSelect(spec), [memberId]);
    const rows = (result.rows ?? []) as Record<string, unknown>[];
    return {
      ...base,
      records: rows,
      ...(rows.length >= EXPORT_ROW_CAP ? { truncatedAt: EXPORT_ROW_CAP } : {}),
    };
  } catch (err) {
    console.error(`[SovereignExport] ${key} read failed:`, err);
    return {
      ...base,
      records: null,
      error:
        'This section could not be read and is INCOMPLETE. It is NOT empty because you have none — the export failed to retrieve it. Please report this.',
    };
  }
}

/**
 * Every logical representation owed to the member, read in parallel.
 *
 * One failing read never fails the export: it returns as `records: null` with
 * an error, so the member gets everything else plus an honest account of what
 * is missing.
 */
export async function buildSovereignExport(memberId: string): Promise<LogicalExportObject[]> {
  return Promise.all(OWED_LOGICAL_EXPORTS.map((k) => buildOne(k, memberId)));
}
