/**
 * NW-A02 AC2 — unauthorized member/field DOES NOT COMPOSE.
 *
 * Split from the main boundary suite because `memberMayComposeField` reads the
 * database; the query layer is mocked so the RULE is tested, not Postgres.
 *
 * The defect this closes (NW-A01 F4): the room took a field slug from the
 * REQUEST and composed it with no check that the member had any relationship to
 * that field. Any authenticated member could pull any practitioner's governing
 * text into their own prompt by knowing a slug.
 */

const mockQuery = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => mockQuery(...a) }));

import { memberMayComposeField } from '@/lib/practiceField/compositionBoundary';
import { AUTHORIZED_FIELD_CONTEXTS } from '@/lib/nowWhat/invitation';

const noRows = () => ({ rows: [] });
const oneRow = () => ({ rows: [{ one: 1 }] });

const F = { field_slug: 'someone-elses-field', practitioner_member_id: 'prac-1' } as never;

beforeEach(() => mockQuery.mockReset());

describe('AC2 — unauthorized member/field DOES NOT COMPOSE', () => {
  it('REFUSES a member with no relationship to the field', async () => {
    mockQuery.mockResolvedValue(noRows());
    const auth = await memberMayComposeField('stranger', F);
    expect(auth.authorized).toBe(false);
    expect(auth.basis).toBe('no_relationship');
  });

  it('REFUSES when memberId is missing — anonymity is not authorization', async () => {
    expect((await memberMayComposeField(null, F)).authorized).toBe(false);
    expect((await memberMayComposeField(undefined, F)).authorized).toBe(false);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('REFUSES an unknown / non-existent field', async () => {
    expect((await memberMayComposeField('m1', null)).authorized).toBe(false);
    expect(
      (await memberMayComposeField('m1', { field_slug: null, practitioner_member_id: 'p' } as never))
        .authorized,
    ).toBe(false);
  });

  it('the refusal is the DEFAULT — every lookup missing still refuses', async () => {
    mockQuery.mockResolvedValue(noRows());
    const auth = await memberMayComposeField('m1', F);
    expect(auth.authorized).toBe(false);
    // Both relationship lookups were actually consulted before refusing.
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });
});

describe('AC2 — POSITIVE CONTROLS: lawful bases still compose', () => {
  it('the practitioner may compose their own field, with no query needed', async () => {
    const auth = await memberMayComposeField('prac-1', F);
    expect(auth).toEqual({ authorized: true, basis: 'practitioner' });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('an invited context authorizes a newly-invited member who has nothing yet', async () => {
    // This is what keeps Jondi from being refused at her own front door on the
    // first visit: no program position, no authored material, just an invitation.
    const slug = [...AUTHORIZED_FIELD_CONTEXTS][0];
    const auth = await memberMayComposeField('brand-new-member', {
      field_slug: slug,
      practitioner_member_id: 'prac-1',
    } as never);
    expect(auth).toEqual({ authorized: true, basis: 'invited_context' });
  });

  it('a program position authorizes', async () => {
    mockQuery.mockResolvedValueOnce(oneRow());
    const auth = await memberMayComposeField('m1', F);
    expect(auth).toEqual({ authorized: true, basis: 'program_position' });
  });

  it('previously authored material in the field authorizes', async () => {
    mockQuery.mockResolvedValueOnce(noRows()).mockResolvedValueOnce(oneRow());
    const auth = await memberMayComposeField('m1', F);
    expect(auth).toEqual({ authorized: true, basis: 'authored_material' });
  });

  it('both relationship lookups are member-scoped', async () => {
    mockQuery.mockResolvedValue(noRows());
    await memberMayComposeField('m1', F);
    for (const call of mockQuery.mock.calls) {
      expect(call[1]).toEqual(['m1', 'someone-elses-field']);
    }
  });
});
