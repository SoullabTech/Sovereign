/** Isolated fictional-data regression for member recall opt-out safety. */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { query } from '@/lib/db/postgres';
import { loadConversationalRecallPref, loadEpisodicRecallPref } from '@/lib/maia/memoryLoaders';
import { formatPriorExchangesForPrompt } from '@/lib/maia/conversationalRecallBlock';
import { formatMarkedEpisodesForPrompt } from '@/lib/maia/episodicRecallBlock';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const mockedQuery = query as jest.MockedFunction<typeof query>;
const FICTIONAL_MEMBER = '11111111-1111-4111-8111-111111111111';

beforeEach(() => { mockedQuery.mockReset(); });

const gates = [
  { title: 'conversation', column: 'conversational_recall_enabled', load: loadConversationalRecallPref },
  { title: 'remembered moments', column: 'episodic_recall_enabled', load: loadEpisodicRecallPref },
];

for (const { title, column, load } of gates) {
  describe(`${title} consent retrieval`, () => {
    it('permits only explicitly true', async () => {
      mockedQuery.mockResolvedValue({ rows: [{ [column]: true }] } as never);
      expect(await load(FICTIONAL_MEMBER)).toBe(true);
      expect(mockedQuery).toHaveBeenCalledTimes(1);
    });
    it('suppresses explicit opt-out', async () => {
      mockedQuery.mockResolvedValue({ rows: [{ [column]: false }] } as never);
      expect(await load(FICTIONAL_MEMBER)).toBe(false);
    });
    it('suppresses null consent', async () => {
      mockedQuery.mockResolvedValue({ rows: [{ [column]: null }] } as never);
      expect(await load(FICTIONAL_MEMBER)).toBe(false);
    });
    it('suppresses if the member row is missing', async () => {
      mockedQuery.mockResolvedValue({ rows: [] } as never);
      expect(await load(FICTIONAL_MEMBER)).toBe(false);
    });
    it('suppresses if preference lookup fails', async () => {
      mockedQuery.mockRejectedValue(new Error('FICTIONAL_DB_UNAVAILABLE') as never);
      const log = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try { expect(await load(FICTIONAL_MEMBER)).toBe(false); }
      finally { log.mockRestore(); }
    });
    it('suppresses with no member ID and makes no database request', async () => {
      expect(await load('')).toBe(false);
      expect(mockedQuery).not.toHaveBeenCalled();
    });
  });
}

describe('synthetic prompt assembly', () => {
  it('does not include an exchange even when one is present if conversational recall is disabled', async () => {
    mockedQuery.mockResolvedValue({ rows: [{ conversational_recall_enabled: false }] } as never);
    const result = formatPriorExchangesForPrompt(
      [{ content: 'FICTIONAL_PRIVATE_EXCHANGE_SENTINEL' }] as never,
      { recallEnabled: await loadConversationalRecallPref(FICTIONAL_MEMBER), mode: 'Talk',
        currentSessionTurnCount: 10, lastPriorSessionMinutesAgo: null },
    );
    expect(result).toMatchObject({ emitted: false, surfacedCount: 0, suppressedReason: 'opt-out', block: '' });
    expect(result.block).not.toContain('FICTIONAL_PRIVATE_EXCHANGE_SENTINEL');
  });
  it('does not include a marked moment when episodic recall is disabled', async () => {
    mockedQuery.mockResolvedValue({ rows: [{ episodic_recall_enabled: false }] } as never);
    const result = formatMarkedEpisodesForPrompt(
      [{ episode_id: 'fictional', verbatim_text: 'FICTIONAL_MARKED_EPISODE_SENTINEL',
         source_turn_id: null, source_session_id: null, created_at: new Date() }],
      { recallEnabled: await loadEpisodicRecallPref(FICTIONAL_MEMBER), mode: 'Talk' },
    );
    expect(result).toMatchObject({ emitted: false, surfacedCount: 0, suppressedReason: 'opt-out', block: '' });
    expect(result.block).not.toContain('FICTIONAL_MARKED_EPISODE_SENTINEL');
  });
  it('does not include an exchange when the conversational preference query fails', async () => {
    mockedQuery.mockRejectedValue(new Error('FICTIONAL_CONSENT_LOOKUP_FAILURE') as never);
    const log = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const permitted = await loadConversationalRecallPref(FICTIONAL_MEMBER);
      const result = formatPriorExchangesForPrompt(
        [{ content: 'FICTIONAL_CROSS_SESSION_SENTINEL' }] as never,
        { recallEnabled: permitted, mode: 'Talk', currentSessionTurnCount: 10,
          lastPriorSessionMinutesAgo: null },
      );
      expect(result).toMatchObject({ emitted: false, surfacedCount: 0, suppressedReason: 'opt-out', block: '' });
    } finally { log.mockRestore(); }
  });
  it('does not include a marked moment when the episodic preference query fails', async () => {
    mockedQuery.mockRejectedValue(new Error('FICTIONAL_CONSENT_LOOKUP_FAILURE') as never);
    const log = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const permitted = await loadEpisodicRecallPref(FICTIONAL_MEMBER);
      const result = formatMarkedEpisodesForPrompt(
        [{ episode_id: 'fictional', verbatim_text: 'FICTIONAL_EPISODE_SENTINEL',
           source_turn_id: null, source_session_id: null, created_at: new Date() }],
        { recallEnabled: permitted, mode: 'Talk' },
      );
      expect(result).toMatchObject({ emitted: false, surfacedCount: 0, suppressedReason: 'opt-out', block: '' });
    } finally { log.mockRestore(); }
  });

});
