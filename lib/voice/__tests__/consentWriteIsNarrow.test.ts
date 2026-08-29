/**
 * VOICE-SOVEREIGNTY-03 — the consent write cannot touch voice identity.
 *
 * Founder ruling 2026-08-29: voice identity and cloud-egress consent are
 * separate axes. That is a claim about DATA, not only about routing, and this is
 * where it is proved.
 *
 * ⛔ THE FAILURE THIS EXISTS TO CATCH. `upsertMemberVoicePreferences` is a
 *    full-replace upsert: every column it does not receive is written NULL.
 *    Routing the consent gesture through it — the obvious thing to do, since it
 *    already accepts a ttsProvider — would mean that answering "yes, you may use
 *    the cloud" ERASES `voice_archetype` and `voice_id_override`. The member
 *    would consent to cloud voice and lose maia_core in the same request.
 *
 *    A regression here is silent: consent still records, routing still works,
 *    and the member's chosen voice quietly reverts to a default. Only the shape
 *    of the SQL catches it.
 */

const queryMock = jest.fn().mockResolvedValue({ rows: [] });
jest.mock('@/lib/db/postgres', () => ({ query: (...args: unknown[]) => queryMock(...args) }));

import { setMemberTtsProvider } from '../voiceControlsService';

const MEMBER = '11111111-2222-3333-4444-555555555555';

/** Columns that carry the member's voice IDENTITY. Egress consent may not write them. */
const IDENTITY_COLUMNS = ['voice_archetype', 'voice_id_override'];

beforeEach(() => queryMock.mockClear());

function lastSql(): string {
  expect(queryMock).toHaveBeenCalledTimes(1);
  return String(queryMock.mock.calls[0][0]);
}

describe('setMemberTtsProvider writes one column', () => {
  it('names no identity column at all — not even to re-write it', () => {
    // Stricter than "does not null them": the statement must not MENTION them.
    // A write that helpfully preserved identity by reading and re-writing it
    // would still be a write that CAN change identity, and the ruling is that
    // the consent act must be incapable of it.
    return setMemberTtsProvider(MEMBER, 'cloud').then(() => {
      const sql = lastSql();
      for (const col of IDENTITY_COLUMNS) {
        expect(sql).not.toContain(col);
      }
    });
  });

  it('updates only tts_provider on conflict', async () => {
    await setMemberTtsProvider(MEMBER, 'cloud');
    const updateClause = lastSql().split('DO UPDATE SET')[1] ?? '';
    expect(updateClause).toContain('tts_provider');
    // Offsets appear in the INSERT (a first-time row needs defaults) but must
    // not appear in the UPDATE, or consenting would reset a member's tuning.
    for (const col of ['pace_offset', 'warmth_offset', 'poetry_offset', 'directiveness_offset', 'energy_offset']) {
      expect(updateClause).not.toContain(col);
    }
  });

  it('stores the member act verbatim', async () => {
    await setMemberTtsProvider(MEMBER, 'cloud');
    expect(queryMock.mock.calls[0][1]).toEqual(expect.arrayContaining([MEMBER, 'cloud']));
  });

  it('a decline stores local, not null', async () => {
    // ⭐ THE ANTI-ATTRITION INVARIANT, at the storage layer. Null is `auto` — the
    // absence of an answer — and would make the surface ask again next turn,
    // turning a refusal into attrition. "Not now" is an ANSWER.
    await setMemberTtsProvider(MEMBER, 'local');
    expect(queryMock.mock.calls[0][1]).toEqual(expect.arrayContaining(['local']));
    expect(queryMock.mock.calls[0][1]).not.toContain(null);
  });
});
