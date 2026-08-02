/**
 * Capsule → Field Object declaration — service-layer contract.
 *
 * Governed by `docs/canon/MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md` Amendment 5
 * (canonical `1e15f9c71`) and
 * `docs/architecture/FIELD_OBJECT_PROMOTION_RULING_2026-08-02.md` (canonical
 * `d61872e2a`).
 *
 * WHAT THIS FILE GOVERNS: the declared body is stable, the resolver refuses
 * precisely and writes nothing, and the conflict path returns the prior
 * declaration without rewriting it.
 *
 * WHAT IT DOES NOT: reachability (the act offered on the review surface, the
 * Keep appearing on the Shelf) is walk evidence, not unit evidence. Nor does it
 * establish the concurrency contract — five simultaneous declarations yielding
 * one created and four existing is `scripts/repro/c3probe.ts`, run against the
 * deployed PostgreSQL. A green run here is not evidence for either.
 */

import { keepSource } from '../portfolio';
import {
  resolveCapsuleDeclarationSource,
  CAPSULE_NOT_FOUND,
  CAPSULE_STILL_DRAFT,
  CAPSULE_ARCHIVED,
} from '../sources/capsule';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const { query } = jest.requireMock('@/lib/db/postgres');

const MEMBER = '11111111-1111-4111-8111-111111111111';
const CAPSULE_ID = '22222222-2222-4222-8222-222222222222';

/** An eligible capsule row as the resolver reads it. */
const eligibleCapsule = (over: Record<string, unknown> = {}) => ({
  rows: [
    {
      draft: false,
      archived: false,
      owned: true,
      title: 'The thing I finally said out loud',
      summary: 'It mattered because I said it.',
      ...over,
    },
  ],
});

/** An atom row as the INSERT ... RETURNING hands it back. */
const atomRow = (over: Record<string, unknown> = {}) => ({
  rows: [
    {
      id: 'atom-1',
      member_id: MEMBER,
      source_type: 'capsule',
      source_id: CAPSULE_ID,
      title: 'The thing I finally said out loud',
      body: null,
      primary_register: null,
      registers: [],
      elemental_lenses: [],
      thread_ids: [],
      status: 'active',
      return_preference: 'contextual_doorway',
      last_surfaced_at: null,
      surface_count: 0,
      member_response_status: null,
      member_response_at: null,
      kept_at: new Date().toISOString(),
      last_touched_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      crossing_allowed: false,
      was_created: true,
      ...over,
    },
  ],
});

/**
 * Route mocked queries by what they ask for, not by call order.
 *
 * keepSource fires `indexAtomAffinities` as fire-and-forget, which issues its
 * own queries. An order-based queue silently mis-feeds whichever call happens
 * to land next, so the mock answers on SQL shape instead.
 */
function respondBySql(capsule: unknown, atom: unknown) {
  query.mockImplementation((sql: string) => {
    if (/FROM reflection_capsules/i.test(sql)) return Promise.resolve(capsule);
    if (/INSERT INTO member_memory_atoms/i.test(sql)) return Promise.resolve(atom);
    return Promise.resolve({ rows: [] });
  });
}

beforeEach(() => jest.clearAllMocks());

describe('resolveCapsuleDeclarationSource — verifies, never writes', () => {
  it('returns the member’s own words for an eligible capsule', async () => {
    query.mockResolvedValueOnce(eligibleCapsule());

    const source = await resolveCapsuleDeclarationSource(MEMBER, CAPSULE_ID);

    expect(source.title).toBe('The thing I finally said out loud');
    expect(source.summary).toBe('It mattered because I said it.');
  });

  it('never issues an INSERT — resolution is not declaration', async () => {
    query.mockResolvedValueOnce(eligibleCapsule());

    await resolveCapsuleDeclarationSource(MEMBER, CAPSULE_ID);

    expect(query).toHaveBeenCalledTimes(1);
    expect(String(query.mock.calls[0][0])).not.toMatch(/INSERT/i);
  });

  it('gives the SAME refusal for a missing capsule and one owned by someone else', async () => {
    // A member must not be able to probe another member's capsule ids by
    // reading which error comes back.
    query.mockResolvedValueOnce({ rows: [] });
    const missing = await resolveCapsuleDeclarationSource(MEMBER, CAPSULE_ID).catch(e => e.message);

    query.mockResolvedValueOnce(eligibleCapsule({ owned: false }));
    const notMine = await resolveCapsuleDeclarationSource(MEMBER, CAPSULE_ID).catch(e => e.message);

    expect(missing).toBe(CAPSULE_NOT_FOUND);
    expect(notMine).toBe(CAPSULE_NOT_FOUND);
  });

  it('refuses a draft — eligibility is not declaration', async () => {
    query.mockResolvedValueOnce(eligibleCapsule({ draft: true }));
    await expect(resolveCapsuleDeclarationSource(MEMBER, CAPSULE_ID)).rejects.toThrow(
      CAPSULE_STILL_DRAFT,
    );
  });

  it('refuses an archived capsule', async () => {
    query.mockResolvedValueOnce(eligibleCapsule({ archived: true }));
    await expect(resolveCapsuleDeclarationSource(MEMBER, CAPSULE_ID)).rejects.toThrow(
      CAPSULE_ARCHIVED,
    );
  });

  it('does not treat `pinned` as an eligibility condition', async () => {
    query.mockResolvedValueOnce(eligibleCapsule({ pinned: false }));
    await expect(resolveCapsuleDeclarationSource(MEMBER, CAPSULE_ID)).resolves.toBeTruthy();
  });
});

describe('the declared body is stable — capsule and Field Object are separate histories', () => {
  it('returns the ORIGINAL declared formulation when the capsule is edited and declared again', async () => {
    // 1. Declare the capsule.
    respondBySql(eligibleCapsule(), atomRow());
    const first = await keepSource(MEMBER, {
      memberId: MEMBER,
      sourceType: 'capsule',
      sourceId: CAPSULE_ID,
      title: 'The thing I finally said out loud',
      body: null,
    });

    expect(first.wasCreated).toBe(true);
    expect(first.title).toBe('The thing I finally said out loud');

    // 2. The member edits the capsule afterwards. 3. They declare again — the
    //    resolver now reads the NEW words, and the caller passes them in.
    //    ON CONFLICT returns the row that already exists; its title is the one
    //    declared the first time, because DO UPDATE touches member_id only.
    respondBySql(
      eligibleCapsule({ title: 'Completely rewritten later', summary: 'Different now.' }),
      atomRow({ was_created: false }),
    );
    const second = await keepSource(MEMBER, {
      memberId: MEMBER,
      sourceType: 'capsule',
      sourceId: CAPSULE_ID,
      title: 'Completely rewritten later',
      body: null,
    });

    // 4. Same atom.
    expect(second.id).toBe(first.id);
    expect(second.wasCreated).toBe(false);
    // 5. The body the member declared has NOT been rewritten by the later edit.
    expect(second.title).toBe('The thing I finally said out loud');
    expect(second.title).not.toBe('Completely rewritten later');
  });

  it('the conflict clause updates member_id ONLY — it must never rewrite title or body', async () => {
    // The behavioural test above can only prove this given a faithful mock.
    // This one pins the mechanism itself: if anyone ever adds `title` or `body`
    // to the DO UPDATE, a declared Field Object would start silently tracking
    // its source, collapsing two histories the canon keeps separate. That
    // change must fail here rather than in a member's Field.
    respondBySql(eligibleCapsule(), atomRow());

    await keepSource(MEMBER, {
      memberId: MEMBER,
      sourceType: 'capsule',
      sourceId: CAPSULE_ID,
      title: 'The thing I finally said out loud',
      body: null,
    });

    const insertSql = String(query.mock.calls[1][0]);
    const doUpdate = insertSql.slice(insertSql.indexOf('DO UPDATE'));
    expect(doUpdate).toMatch(/DO UPDATE SET member_id = EXCLUDED\.member_id/);
    expect(doUpdate).not.toMatch(/\btitle\b\s*=/);
    expect(doUpdate).not.toMatch(/\bbody\b\s*=/);
  });

  it('declaration never writes to the capsule — the source is left intact', async () => {
    respondBySql(eligibleCapsule(), atomRow());

    await keepSource(MEMBER, {
      memberId: MEMBER,
      sourceType: 'capsule',
      sourceId: CAPSULE_ID,
      title: 'The thing I finally said out loud',
      body: null,
    });

    for (const call of query.mock.calls) {
      expect(String(call[0])).not.toMatch(/UPDATE\s+reflection_capsules/i);
      expect(String(call[0])).not.toMatch(/DELETE\s+FROM\s+reflection_capsules/i);
    }
  });
});
