/**
 * BUILD-07A · SEAM B — capturing and recovering the authored structure.
 *
 * ⛔ THE CAPTURE IS SERIALIZED, AND THAT IS NOT A PERFORMANCE CHOICE. A series
 * of unlocked selects while another structural gesture is moving the tree would
 * freeze a state that never existed: units from before a move, memberships from
 * after it. A snapshot must be a coherent canonical POST-IMAGE of one moment.
 * The structure service already serializes concurrent structural gestures; this
 * follows that precedent rather than inventing a weaker one.
 *
 * ⛔ ONLY CANONICAL AUTHORED UNITS ENTER, and the gate is at capture. A proposal
 * id is a uuid exactly like a unit id — indistinguishable by shape — so nothing
 * downstream could tell them apart afterwards. The falsifier-4 witness proves
 * that distinction against real rows; this is where it is enforced.
 *
 * ⛔ NO PROSE. Units and memberships by reference. A section is named, never
 * copied.
 */
import { query, transaction } from '@/lib/db/postgres';
import { createHash } from 'crypto';

/** One authored division, exactly as the member declared it. */
export interface SnapshotUnit {
  id: string;
  parentId: string | null;
  position: number;
  kind: string | null;
  title: string | null;
}

/** A section's direct placement. The lowest authored unit containing it. */
export interface SnapshotMembership {
  unitId: string;
  draftSectionId: string;
}

/**
 * The authored structure, frozen.
 *
 * ⛔ THIS IS DELIBERATELY NOT "every column of the units table". What is frozen
 * is the structural SEMANTICS a developmental reader may reason from. Freezing
 * implementation detail would make the snapshot's meaning drift with the schema
 * rather than with the Work.
 */
export interface StructureSnapshot {
  units: SnapshotUnit[];
  members: SnapshotMembership[];
}

/**
 * The digest of a frozen snapshot.
 *
 * Computed over the SNAPSHOT, so what is compared later is the same object that
 * can be recovered. A fingerprint taken over live rows and stored beside a
 * snapshot built from a different read would let the two disagree silently.
 */
export function fingerprintSnapshot(snapshot: StructureSnapshot): string {
  return createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
}

/**
 * Freeze the manuscript's authored structure as it stands, and return the
 * durable address of that frozen state.
 *
 * ⛔ THE ORDER OF OPERATIONS IS PART OF THE RULING. Prose exactness is proven
 * FIRST, by the caller; a structure snapshot taken before that could be left
 * orphaned by a failed prose capture — a frozen structure belonging to no
 * reading, indistinguishable later from one that mattered.
 */
export async function captureStructureSnapshot(
  manuscriptId: string,
  memberId: string,
): Promise<{ snapshotId: string; snapshot: StructureSnapshot; fingerprint: string }> {
  return transaction(async (tx) => {
    /* One coherent post-image. The manuscript row is locked first so a
       concurrent structural gesture cannot interleave between the two reads
       below and hand us units from one moment and memberships from another. */
    const owned = await tx.query(
      `SELECT id FROM member_manuscripts WHERE id = $1 AND member_id = $2 FOR UPDATE`,
      [manuscriptId, memberId]);
    if (owned.rows.length === 0) {
      /* Not found, never forbidden — the same no-existence-leak discipline as
         every other member-scoped surface. */
      throw new Error('manuscript not found');
    }

    const units = await tx.query(
      `SELECT id, parent_id, position, kind, title
         FROM manuscript_structure_units
        WHERE manuscript_id = $1 AND origin <> 'proposed'
        ORDER BY id`, [manuscriptId]);

    /* Joined THROUGH units, so a membership can only name a unit that passed
       the same canonical gate, and ordered by both columns so two identical
       structures freeze identically whatever order rows came back in. */
    const members = await tx.query(
      `SELECT m.unit_id, m.draft_section_id
         FROM manuscript_structure_members m
         JOIN manuscript_structure_units u ON u.id = m.unit_id
        WHERE u.manuscript_id = $1 AND u.origin <> 'proposed'
        ORDER BY m.unit_id, m.draft_section_id`, [manuscriptId]);

    const snapshot: StructureSnapshot = {
      units: units.rows.map((u) => ({
        id: u.id as string,
        parentId: (u.parent_id ?? null) as string | null,
        position: Number(u.position),
        kind: (u.kind ?? null) as string | null,
        title: (u.title ?? null) as string | null,
      })),
      members: members.rows.map((m) => ({
        unitId: m.unit_id as string,
        draftSectionId: m.draft_section_id as string,
      })),
    };
    const fingerprint = fingerprintSnapshot(snapshot);

    const row = await tx.query(
      `INSERT INTO manuscript_structure_snapshots
         (manuscript_id, captured_by, fingerprint, snapshot)
       VALUES ($1, $2, $3, $4::jsonb) RETURNING id`,
      [manuscriptId, memberId, fingerprint, JSON.stringify(snapshot)]);

    return { snapshotId: row.rows[0].id as string, snapshot, fingerprint };
  });
}

/**
 * HISTORICAL DISPLAY for structure — recover the exact authored structure a
 * reading reasoned from.
 *
 * This is what makes structural INV-7b true rather than merely stated: the
 * fingerprint said THAT the structure moved; this says WHAT it was.
 */
export async function loadStructureSnapshot(
  snapshotId: string,
  memberId: string,
): Promise<{ ok: true; snapshot: StructureSnapshot; fingerprint: string }
         | { ok: false; failure: 'snapshot_not_found'; detail: string }> {
  const r = await query<{ snapshot: unknown; fingerprint: string }>(
    `SELECT s.snapshot, s.fingerprint
       FROM manuscript_structure_snapshots s
       JOIN member_manuscripts m ON m.id = s.manuscript_id
      WHERE s.id = $1 AND m.member_id = $2`,
    [snapshotId, memberId]);
  if (r.rows.length === 0) {
    return { ok: false, failure: 'snapshot_not_found', detail: `no snapshot ${snapshotId}` };
  }
  return {
    ok: true,
    snapshot: r.rows[0].snapshot as StructureSnapshot,
    fingerprint: r.rows[0].fingerprint,
  };
}

/** Per-unit digests, so supersession stays scoped to what actually moved. */
export function unitFingerprints(snapshot: StructureSnapshot): Record<string, string> {
  const byUnit: Record<string, string> = {};
  for (const u of snapshot.units) {
    /* A unit's digest covers its own declaration AND the sections placed
       directly in it: moving a section between divisions changes both, and an
       observation about either is about something that moved. */
    const placed = snapshot.members
      .filter((m) => m.unitId === u.id)
      .map((m) => m.draftSectionId)
      .sort();
    byUnit[u.id] = createHash('sha256')
      .update(JSON.stringify({ unit: u, placed }))
      .digest('hex');
  }
  return byUnit;
}
