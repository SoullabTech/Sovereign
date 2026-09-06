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
import { disclosureDigest } from '../conversionDisclosure';
import { convertDraftToSections } from '../convertDraft';

const mockTransaction = transaction as jest.Mock;
const MEMBER = '11111111-1111-1111-1111-111111111111';
const MS = '22222222-2222-2222-2222-222222222222';
const CONTENT = 'One\n\nFirst body.\n\nTwo\n\nSecond body.\n';

describe('disclosureDigest — naming one state', () => {
  it('is stable for the same state', () => {
    const basis = { version: 3, content: CONTENT, sourceSections: 2 };
    expect(disclosureDigest(basis)).toBe(disclosureDigest(basis));
    expect(disclosureDigest(basis)).toMatch(/^[0-9a-f]{64}$/);
  });

  it.each([
    ['the version advanced', { version: 4, content: CONTENT, sourceSections: 2 }],
    ['a character changed', { version: 3, content: `${CONTENT}!`, sourceSections: 2 }],
    ['the Source changed', { version: 3, content: CONTENT, sourceSections: 3 }],
  ])('changes when %s', (_why, other) => {
    expect(disclosureDigest(other)).not.toBe(disclosureDigest({ version: 3, content: CONTENT, sourceSections: 2 }));
  });

  /* Length-prefixed, so no field can borrow another's digits. */
  it('does not confuse adjacent fields', () => {
    expect(disclosureDigest({ version: 12, content: CONTENT, sourceSections: 3 }))
      .not.toBe(disclosureDigest({ version: 1, content: CONTENT, sourceSections: 23 }));
  });
});

/** A transaction whose client answers the service's reads by shape. */
function harness(
  draft: { content: string; version: number; addressable: boolean },
  sourceCount: number,
  /** The partition an already-converted draft holds, when it holds one. */
  existing: string[] = [],
) {
  const writes: string[] = [];
  mockTransaction.mockImplementation(async (fn: (tx: { query: (sql: string, p?: unknown[]) => Promise<{ rows: unknown[] }> }) => unknown) =>
    fn({
      query: async (sql: string) => {
        if (/FROM manuscript_working_drafts/.test(sql) && /FOR UPDATE/.test(sql)) {
          return { rows: [{ id: 'd1', content: draft.content, version: String(draft.version), section_addressable_at: draft.addressable ? new Date() : null }] };
        }
        if (/count\(\*\)::text AS n FROM manuscript_sections/.test(sql)) return { rows: [{ n: String(sourceCount) }] };
        if (/SELECT text FROM manuscript_draft_sections/.test(sql)) return { rows: existing.map((text) => ({ text })) };
        writes.push(sql);
        return { rows: [] };
      },
    }));
  return writes;
}

describe('convertDraftToSections — the disclosure it was given', () => {
  beforeEach(() => jest.clearAllMocks());

  it('refuses when the draft moved after the disclosure, and writes nothing', async () => {
    const writes = harness({ content: CONTENT, version: 4, addressable: false }, 2);
    const stale = disclosureDigest({ version: 3, content: CONTENT, sourceSections: 2 });
    const r = await convertDraftToSections(MS, MEMBER, stale);
    expect(r).toEqual({ status: 'refused', refusal: 'disclosure_stale', detail: 'the draft changed after the divergence was shown' });
    expect(writes).toEqual([]);
  });

  /* ⛔ ORDER MATTERS. Checked BEFORE idempotency: a stale confirmation
     answered with `already_converted` would report success for a conversion
     the member never authorised. */
  it('refuses a stale disclosure even on an already-converted draft', async () => {
    harness({ content: CONTENT, version: 9, addressable: true }, 2, [CONTENT]);
    const r = await convertDraftToSections(MS, MEMBER, disclosureDigest({ version: 1, content: CONTENT, sourceSections: 2 }));
    expect(r.refusal).toBe('disclosure_stale');
  });

  it('proceeds when the disclosure names the state actually held', async () => {
    harness({ content: CONTENT, version: 4, addressable: false }, 2);
    const fresh = disclosureDigest({ version: 4, content: CONTENT, sourceSections: 2 });
    const r = await convertDraftToSections(MS, MEMBER, fresh);
    expect(r.refusal).not.toBe('disclosure_stale');
  });

  /* The 2026-08-30 tell-rather-than-ask path made no disclosure, so there is
     none to verify and the gate must not invent one. */
  it('verifies nothing when no disclosure was given', async () => {
    harness({ content: CONTENT, version: 4, addressable: true }, 2, [CONTENT]);
    const r = await convertDraftToSections(MS, MEMBER);
    expect(r.refusal).toBeUndefined();
    expect(r.status).toBe('already_converted');
  });
});
