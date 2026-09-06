/**
 * THE DISCLOSURE GATE — that a member-confirmed conversion cannot run against
 * a state the member was never shown.
 *
 * Founder requirement (2026-09-05): divergence is disclosed BEFORE conversion.
 * A surface can promise that; only this check keeps it when a save lands in
 * between. Both halves are asserted here — the digest that names a state, and
 * the service that refuses when the state has moved.
 */

jest.mock('@/lib/db/postgres', () => ({ transaction: jest.fn(), query: jest.fn() }));

import { transaction } from '@/lib/db/postgres';
import { draftStateDigest } from '../draftStateDigest';
import { convertDraftToSections } from '../convertDraft';
import { composeDraftSlices } from '@/lib/manuscript/draftSections';

const mockTransaction = transaction as jest.Mock;
const MEMBER = '11111111-1111-1111-1111-111111111111';
const MS = '22222222-2222-2222-2222-222222222222';
const SOURCE = [
  { id: 's1', heading: 'One', body: 'First body.' },
  { id: 's2', heading: 'Two', body: 'Second body.' },
];
/** Exactly what the current composer emits for SOURCE. */
const CONTENT = 'One\n\nFirst body.\n\nTwo\n\nSecond body.\n';

describe('draftStateDigest — naming one state', () => {
  it('is stable for the same state', () => {
    const basis = { version: 3, content: CONTENT, sourceSections: 2 };
    expect(draftStateDigest(basis)).toBe(draftStateDigest(basis));
    expect(draftStateDigest(basis)).toMatch(/^[0-9a-f]{64}$/);
  });

  it.each([
    ['the version advanced', { version: 4, content: CONTENT, sourceSections: 2 }],
    ['a character changed', { version: 3, content: `${CONTENT}!`, sourceSections: 2 }],
    ['the Source changed', { version: 3, content: CONTENT, sourceSections: 3 }],
  ])('changes when %s', (_why, other) => {
    expect(draftStateDigest(other)).not.toBe(draftStateDigest({ version: 3, content: CONTENT, sourceSections: 2 }));
  });

  /* Length-prefixed, so no field can borrow another's digits. */
  it('does not confuse adjacent fields', () => {
    expect(draftStateDigest({ version: 12, content: CONTENT, sourceSections: 3 }))
      .not.toBe(draftStateDigest({ version: 1, content: CONTENT, sourceSections: 23 }));
  });
});

/** A transaction whose client answers the service's reads by shape. */
function harness(
  draft: { content: string; version: number; addressable: boolean },
  source: { id: string; heading: string | null; body: string }[],
  /** The partition an already-converted draft holds, when it holds one. */
  existing: string[] = [],
) {
  /* Params are recorded, not only SQL: the defect this file now guards was a
     MISSING COLUMN in an INSERT that otherwise looked correct. */
  const writes: { sql: string; params: unknown[] }[] = [];
  /* The sections the conversion mints, as the read-back would return them. */
  const minted = composeDraftSlices(source).slices.map((sl, i) => ({ id: `ds${i + 1}`, text: sl.text }));
  mockTransaction.mockImplementation(async (fn: (tx: { query: (sql: string, p?: unknown[]) => Promise<{ rows: unknown[] }> }) => unknown) =>
    fn({
      query: async (sql: string, p?: unknown[]) => {
        if (/FROM manuscript_working_drafts/.test(sql) && /FOR UPDATE/.test(sql)) {
          return { rows: [{ id: 'd1', content: draft.content, version: String(draft.version), section_addressable_at: draft.addressable ? new Date() : null }] };
        }
        if (/FROM manuscript_sections/.test(sql)) return { rows: source };
        if (/SELECT text FROM manuscript_draft_sections/.test(sql)) return { rows: existing.map((text) => ({ text })) };
        if (/SELECT id, text FROM manuscript_draft_sections/.test(sql)) return { rows: minted };
        writes.push({ sql, params: p ?? [] });
        return { rows: [] };
      },
    }));
  return writes;
}

const digestOf = (version: number, content = CONTENT, sourceSections = SOURCE.length) =>
  draftStateDigest({ version, content, sourceSections });

describe('convertDraftToSections — the permission it was given', () => {
  beforeEach(() => jest.clearAllMocks());

  it('refuses a mechanical act when the draft moved after its state was told', async () => {
    const writes = harness({ content: CONTENT, version: 4, addressable: false }, SOURCE);
    const r = await convertDraftToSections(MS, MEMBER, { authority: 'mechanical', stateDigest: digestOf(3) });
    expect(r).toEqual({ status: 'refused', refusal: 'preparation_stale', detail: 'the draft changed after its state was shown' });
    expect(writes).toEqual([]);
  });

  it('refuses a member confirmation when the draft moved after the divergence was shown', async () => {
    const writes = harness({ content: CONTENT, version: 4, addressable: false }, SOURCE);
    const r = await convertDraftToSections(MS, MEMBER, { authority: 'member_confirmation', disclosureDigest: digestOf(3) });
    expect(r.refusal).toBe('disclosure_stale');
    expect(writes).toEqual([]);
  });

  /* ⛔ ORDER MATTERS. Checked BEFORE idempotency: a stale act answered with
     `already_converted` would report success for a conversion the member
     never authorised. */
  it('refuses a stale act even on an already-converted draft', async () => {
    harness({ content: CONTENT, version: 9, addressable: true }, SOURCE, [CONTENT]);
    const r = await convertDraftToSections(MS, MEMBER, { authority: 'mechanical', stateDigest: digestOf(1) });
    expect(r.refusal).toBe('preparation_stale');
  });

  /**
   * ⛔ THE CORRECTION THE FOUNDER NAMED (2026-09-06). The digest covers the
   * draft's bytes and the Source's COUNT — not the Source's text. A Source
   * edited at equal count leaves the digest matching while the draft is no
   * longer PRISTINE, and `planConversion` would still admit it as resolvable.
   * Mechanical authority must not travel onto that draft.
   */
  it('refuses mechanical authority over a draft that is not PRISTINE under the lock', async () => {
    const movedSource = [{ ...SOURCE[0], body: 'A body the member never wrote.' }, SOURCE[1]];
    const writes = harness({ content: CONTENT, version: 4, addressable: false }, movedSource);
    const r = await convertDraftToSections(MS, MEMBER, { authority: 'mechanical', stateDigest: digestOf(4) });
    expect(r.refusal).toBe('not_pristine_under_lock');
    expect(r.detail).toMatch(/requires PRISTINE/);
    expect(writes).toEqual([]);
  });

  /* The member's confirmation makes no PRISTINE claim, so none is required —
     the divergence is exactly what they were shown and agreed to. */
  it('allows a member confirmation over a draft that is not PRISTINE', async () => {
    const edited = CONTENT.replace('First body.', 'First body, rewritten.');
    harness({ content: edited, version: 4, addressable: false }, SOURCE);
    const r = await convertDraftToSections(MS, MEMBER, {
      authority: 'member_confirmation', disclosureDigest: digestOf(4, edited),
    });
    expect(r.refusal).toBeUndefined();
  });

  it('proceeds when a mechanical act names the state actually held', async () => {
    harness({ content: CONTENT, version: 4, addressable: false }, SOURCE);
    const r = await convertDraftToSections(MS, MEMBER, { authority: 'mechanical', stateDigest: digestOf(4) });
    expect(r.refusal).toBeUndefined();
    expect(r.status).toBe('converted');
  });

  /* The bare 2026-08-30 path told no state, so there is none to verify and
     the gate must not invent one. */
  it('verifies nothing when no permission was given', async () => {
    harness({ content: CONTENT, version: 4, addressable: true }, SOURCE, [CONTENT]);
    const r = await convertDraftToSections(MS, MEMBER);
    expect(r.refusal).toBeUndefined();
    expect(r.status).toBe('already_converted');
  });
});


/**
 * ⛔ THE SECOND WALL (production, 2026-09-06).
 *
 * `captureEvidence` freezes from the LATEST revision and refuses
 * `partition_not_recorded` when that revision carries no boundaries. The
 * conversion's own revision INSERT named no `section_partition`, so the newest
 * revision after EVERY conversion was partition-less: a Work would convert
 * successfully, report `ready`, offer its lenses — and still be unreadable.
 * Preparation closed reachability and left a second wall one step behind it.
 *
 * Found on book-print-kdp-final immediately after a successful preparation.
 */
describe('convertDraftToSections — the revision it leaves behind', () => {
  beforeEach(() => jest.clearAllMocks());

  const revisionWrite = (writes: { sql: string; params: unknown[] }[]) =>
    writes.find((w) => /INSERT INTO working_draft_revisions/.test(w.sql));

  it('records the partition on the revision it writes', async () => {
    const writes = harness({ content: CONTENT, version: 4, addressable: false }, SOURCE);
    const r = await convertDraftToSections(MS, MEMBER, { authority: 'mechanical', stateDigest: digestOf(4) });
    expect(r.status).toBe('converted');

    const rev = revisionWrite(writes);
    expect(rev).toBeDefined();
    expect(rev!.sql).toMatch(/section_partition/);

    /* Not merely present — a real partition over the real sections. An empty
       array satisfies the column and refuses at capture exactly as NULL does. */
    const partition = JSON.parse(rev!.params[4] as string) as { sectionId: string; start: number; end: number }[];
    expect(partition).toHaveLength(SOURCE.length);
    expect(partition[0].start).toBe(0);
    expect(partition.map((p) => p.sectionId)).toEqual(['ds1', 'ds2']);
    /* Contiguous, and covering the whole draft. */
    expect(partition[1].start).toBe(partition[0].end);
    expect(partition[partition.length - 1].end).toBe([...CONTENT].length);
  });

  /* The note names what the row is. It is written over the bytes the draft
     holds NOW, whose sections were just minted — so calling it the state
     "before" conversion while carrying that partition would be false. */
  it('names the conversion rather than claiming to precede it', async () => {
    const writes = harness({ content: CONTENT, version: 4, addressable: false }, SOURCE);
    await convertDraftToSections(MS, MEMBER, { authority: 'mechanical', stateDigest: digestOf(4) });
    expect(revisionWrite(writes)!.params[3]).toBe('Section conversion');
  });

  it('writes no revision at all when the conversion is refused', async () => {
    const writes = harness({ content: CONTENT, version: 4, addressable: false }, SOURCE);
    await convertDraftToSections(MS, MEMBER, { authority: 'mechanical', stateDigest: digestOf(3) });
    expect(revisionWrite(writes)).toBeUndefined();
  });
});
