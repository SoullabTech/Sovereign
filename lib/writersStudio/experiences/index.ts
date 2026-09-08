/**
 * Writer's Studio — Experiences, and Living Work Contributions.
 *
 * AUTHORITY. Founder ruling, Writer's Studio, 2026-09-08 §XIII–XIX.
 *
 * An Experience is a member-owned intentional container. It is **not** a Work, and nothing here may
 * make it one. Two orientations — for myself, for others — are properties of one object, never two
 * ontologies.
 *
 * ⛔ WHAT THIS MODULE DOES NOT HAVE, AND MUST NOT GROW (§X, §XIV):
 *   no member position · no current movement · no completion · no percentage · no ordinal progress.
 * A screenwriter entering at Whole Script Encounter is entering where the Work requires. The
 * architecture cannot represent "ahead", and that absence is the design rather than an omission.
 *
 * ⛔ AND NOT (§XIX): MAIA commissioning, CMT-01 changes, scoring, discovery/marketplace,
 * practitioner-client attachment, facilitator access to private participant material, form-specific
 * schemas, or pedagogy of any kind.
 *
 * Naming (§VI): `writer_*`, because `decision_experiences` / `change_experiences` mean *an
 * experience someone HAD* and `lib/experiences` means Guided Experiences. No code here may rely on
 * the naked word `experience` to determine ontology.
 */
import { query, transaction, type TransactionClient } from '@/lib/db/postgres';

type Client = Pick<TransactionClient, 'query'> | null;
const run = async <T extends Record<string, unknown>>(c: Client, sql: string, p: unknown[]) =>
  (c ? await c.query<T>(sql, p) : await query<T>(sql, p)).rows as T[];

export type Orientation = 'for_myself' | 'for_others';
export type Authorship = 'facilitator' | 'platform' | 'maia_derived';
export type AdoptionKind = 'material' | 'influence';

export interface MovementInput {
  position: number;
  kind?: string | null;
  title: string;
  body?: string | null;
  authorship?: Authorship;
}

/**
 * Create an Experience and its first, still-shapeable version.
 *
 * `title` and `intention` are the member's words and are never generated. The version is created
 * unfrozen: before anyone encounters it, revising it rewrites nothing (§XI).
 */
export async function createExperience(params: {
  ownerMemberId: string; title: string; intention?: string | null; orientation: Orientation;
}, client: Client = null): Promise<{ experienceId: string; versionId: string }> {
  const body = async (c: Client) => {
    const e = await run<{ id: string }>(c,
      `INSERT INTO writer_experiences (owner_member_id, title, intention, orientation)
       VALUES ($1,$2,$3,$4) RETURNING id`,
      [params.ownerMemberId, params.title, params.intention ?? null, params.orientation]);
    const v = await run<{ id: string }>(c,
      `INSERT INTO writer_experience_versions (experience_id, version_number) VALUES ($1, 1)
       RETURNING id`, [e[0].id]);
    return { experienceId: e[0].id, versionId: v[0].id };
  };
  return client ? body(client) : transaction((tx) => body(tx));
}

/**
 * Add movements to a version.
 *
 * Refused by the database if the version has been encountered — revision creates the next version
 * rather than rewriting what a participant moved through.
 */
export async function addMovements(
  versionId: string, movements: readonly MovementInput[],
  authoredByMemberId: string | null, client: Client = null,
): Promise<void> {
  const body = async (c: Client) => {
    for (const m of movements) {
      await run(c,
        `INSERT INTO writer_experience_movements
           (version_id, position, kind, title, body, authored_by_member_id, authorship)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [versionId, m.position, m.kind ?? null, m.title, m.body ?? null,
         authoredByMemberId, m.authorship ?? 'facilitator']);
    }
  };
  return client ? body(client) : transaction((tx) => body(tx));
}

/**
 * Revise: create the next version, carrying the current movements forward as a starting point.
 *
 * §XI — this is the ONLY way to change an encountered Experience. Earlier participants keep the
 * version they actually moved through; future participants meet the new one.
 */
export async function reviseExperience(
  experienceId: string, note: string | null = null, client: Client = null,
): Promise<string> {
  const body = async (c: Client) => {
    const prev = await run<{ id: string; version_number: number }>(c,
      `SELECT id, version_number FROM writer_experience_versions
        WHERE experience_id = $1 ORDER BY version_number DESC LIMIT 1`, [experienceId]);
    const next = await run<{ id: string }>(c,
      `INSERT INTO writer_experience_versions (experience_id, version_number, note)
       VALUES ($1,$2,$3) RETURNING id`,
      [experienceId, (prev[0]?.version_number ?? 0) + 1, note]);
    if (prev[0]) {
      await run(c,
        `INSERT INTO writer_experience_movements
           (version_id, position, kind, title, body, authored_by_member_id, authorship)
         SELECT $1, position, kind, title, body, authored_by_member_id, authorship
           FROM writer_experience_movements WHERE version_id = $2 ORDER BY position`,
        [next[0].id, prev[0].id]);
    }
    return next[0].id;
  };
  return client ? body(client) : transaction((tx) => body(tx));
}

/**
 * Begin participating — a member gesture, never created about someone.
 *
 * ⛔ This confers participation and NOTHING else (§XII). It grants no read of the participant's
 * Works, drafts, Reflections, MAIA conversations or private Studio material, and nothing anywhere
 * may key access off the row it writes.
 *
 * ⭐ THIS FUNCTION IS THE ENCOUNTER THRESHOLD (§X — semantic hold).
 *
 * Writing a participation row freezes the version, by database trigger. So whatever product event
 * calls this IS the encounter, and the schema must not be allowed to decide that by accident.
 * The binding is therefore stated here, once, and asserted by
 * `__tests__/encounterThresholdIsExplicit.test.ts`: this is the ONLY writer of
 * `writer_experience_participations`.
 *
 * **What must NOT be wired to this**, unless a founder ruling separately intends it:
 *
 *   invitation · enrollment by a facilitator · roster creation · preview ·
 *   opening an informational landing page · browsing the movements
 *
 * None of those is a member encountering the Experience, and each would freeze a version the
 * creator was still shaping — turning a look at the door into history. The threshold is the
 * member's own act of entering.
 */
export async function beginParticipation(
  experienceId: string, memberId: string, client: Client = null,
): Promise<string> {
  const rows = await run<{ id: string }>(client,
    `INSERT INTO writer_experience_participations (experience_id, version_id, member_id)
     SELECT $1, v.id, $2 FROM writer_experience_versions v
      WHERE v.experience_id = $1 ORDER BY v.version_number DESC LIMIT 1
     RETURNING id`, [experienceId, memberId]);
  return rows[0].id;
}

/** Declare that a Work arose within / relates to an Experience. Never "the Experience is material". */
export async function relateWork(params: {
  experienceId: string; livingWorkId: string; declaredBy: string; relationshipSentence?: string | null;
}, client: Client = null): Promise<string> {
  const rows = await run<{ id: string }>(client,
    `INSERT INTO writer_experience_work_relations
       (experience_id, living_work_id, relationship_sentence, declared_by)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (experience_id, living_work_id) DO UPDATE SET relationship_sentence = EXCLUDED.relationship_sentence
     RETURNING id`,
    [params.experienceId, params.livingWorkId, params.relationshipSentence ?? null, params.declaredBy]);
  return rows[0].id;
}

/**
 * Record what another human brought (§XV, §XVI).
 *
 * `contributorName` is required and human-readable; `contributorMemberId` is additive and may never
 * replace it. A contributor need not have an account — most never will.
 *
 * ⛔ Recording a Contribution does NOT put it in the Work. That is a separate act (§XVII).
 */
export async function recordContribution(params: {
  livingWorkId: string;
  recordedByMemberId: string;
  contributorName: string;
  contributorMemberId?: string | null;
  body: string;
  kind?: string | null;
  context?: string | null;
  experienceId?: string | null;
  occurredAt?: Date | null;
}, client: Client = null): Promise<string> {
  const rows = await run<{ id: string }>(client,
    `INSERT INTO living_work_contributions
       (living_work_id, experience_id, recorded_by_member_id, contributor_name,
        contributor_member_id, kind, context, body, occurred_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [params.livingWorkId, params.experienceId ?? null, params.recordedByMemberId,
     params.contributorName, params.contributorMemberId ?? null, params.kind ?? null,
     params.context ?? null, params.body, params.occurredAt ?? null]);
  return rows[0].id;
}

/**
 * Adopt — the author's decision to carry something forward (§XVII).
 *
 * `influence` is the case the suitcase witness makes canonical: the contribution changed the
 * author's understanding or a subsequent creative act, and no contributed artifact became
 * manuscript material. The author rewrote the scene themselves; the actor's discovery is why.
 * **Causation without possession** — neither is credited with the other's act.
 */
export async function adoptContribution(params: {
  contributionId: string;
  livingWorkId: string;
  adoptedByMemberId: string;
  adoptionKind: AdoptionKind;
  livingWorkMaterialId?: string | null;
  note?: string | null;
}, client: Client = null): Promise<string> {
  const rows = await run<{ id: string }>(client,
    `INSERT INTO living_work_contribution_adoptions
       (contribution_id, living_work_id, adopted_by_member_id, adoption_kind,
        living_work_material_id, note)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [params.contributionId, params.livingWorkId, params.adoptedByMemberId, params.adoptionKind,
     params.livingWorkMaterialId ?? null, params.note ?? null]);
  return rows[0].id;
}

export interface ContributionRecord {
  id: string;
  contributor_name: string;
  contributor_member_id: string | null;
  kind: string | null;
  context: string | null;
  body: string;
  experience_id: string | null;
  adopted_kinds: string[] | null;
}

/**
 * A Work's contributions, with whether each was adopted and how.
 *
 * This is the query that answers *how did this Work become itself* — and it answers it without
 * claiming that anything adopted was authored by the contributor, or that anything unadopted is
 * absent from the Work's history.
 */
export async function workContributions(
  livingWorkId: string, client: Client = null,
): Promise<ContributionRecord[]> {
  return run<ContributionRecord & Record<string, unknown>>(client,
    `SELECT c.id, c.contributor_name, c.contributor_member_id, c.kind, c.context, c.body,
            c.experience_id,
            (SELECT array_agg(a.adoption_kind ORDER BY a.adopted_at)
               FROM living_work_contribution_adoptions a WHERE a.contribution_id = c.id)
              AS adopted_kinds
       FROM living_work_contributions c
      WHERE c.living_work_id = $1
      ORDER BY COALESCE(c.occurred_at, c.created_at) ASC, c.id ASC`,
    [livingWorkId]) as Promise<ContributionRecord[]>;
}
