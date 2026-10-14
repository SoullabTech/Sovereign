/** @jest-environment node */
/** Fictional records only. Every source/provider module is mocked before import. */
jest.mock('@/lib/consciousness/spiralStatePersistence', () => ({ loadSpiralState: jest.fn() }));
jest.mock('@/lib/scribe/sovereignSummarizer', () => ({ getRecentSummaries: jest.fn() }));
jest.mock('@/lib/patterns/PatternOfferingService', () => ({ getActivePatternContext: jest.fn() }));
jest.mock('@/lib/memory/SignificantMomentsService', () => ({ loadJournals: jest.fn() }));
jest.mock('@/lib/consciousness/RelationshipAnamnesisPostgres', () => ({ loadRelationshipEssence: jest.fn() }));
jest.mock('@/lib/consciousness/participatoryRealityHelper', () => ({
  getRecentThemes: jest.fn(), findRecurringThemes: jest.fn(),
}));

import { loadSpiralState } from '@/lib/consciousness/spiralStatePersistence';
import { getRecentSummaries } from '@/lib/scribe/sovereignSummarizer';
import { getActivePatternContext } from '@/lib/patterns/PatternOfferingService';
import { loadJournals, type JournalEntry as LoadedJournalEntry } from '@/lib/memory/SignificantMomentsService';
import { loadRelationshipEssence } from '@/lib/consciousness/RelationshipAnamnesisPostgres';
import { getRecentThemes, findRecurringThemes } from '@/lib/consciousness/participatoryRealityHelper';
import { buildMemberLiveContext, formatMemberWebForPrompt, describeLiveContext, type MemberLiveContext } from '../MemberLiveContext';

const FICTIONAL_A = 'fictional-member-A';
const FICTIONAL_B = 'fictional-member-B';
const now = Date.parse('2026-10-14T12:00:00.000Z');
const sources = [loadSpiralState, getRecentSummaries, getActivePatternContext,
  loadJournals, loadRelationshipEssence, getRecentThemes];
const entry = (): LoadedJournalEntry => ({
  id: 'fictional-entry', content: '  A naïve line.\n\n  A second line — unchanged.  ',
  themes: ['hope', 'creative'], mood: 'quiet', createdAt: new Date(now),
});
function emptyContext(): MemberLiveContext {
  return { identity: { userId: FICTIONAL_A }, recentSessions: [], activePatterns: [],
    recentJournal: [], assembledAt: new Date(now).toISOString() };
}
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(now);
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.mocked(loadSpiralState).mockResolvedValue(null);
  jest.mocked(getRecentSummaries).mockResolvedValue([]);
  jest.mocked(getActivePatternContext).mockResolvedValue([]);
  jest.mocked(loadJournals).mockResolvedValue([]);
  jest.mocked(loadRelationshipEssence).mockResolvedValue(null);
  jest.mocked(getRecentThemes).mockResolvedValue([]);
  jest.mocked(findRecurringThemes).mockReturnValue([]);
});
afterEach(() => { jest.restoreAllMocks(); });

test.each([
  ['explicit skip', FICTIONAL_A, { skip: true }],
  ['no member', '', {}],
] as const)('%s still skips every source read', async (_label, member, options) => {
  const ctx = await buildMemberLiveContext(member, options);
  for (const source of sources) expect(source).not.toHaveBeenCalled();
  expect(findRecurringThemes).not.toHaveBeenCalled();
  expect(ctx.recentJournal).toEqual([]);
  expect(ctx.astrology).toBeNull();
  expect(formatMemberWebForPrompt(ctx)).toBe('');
});

test('assembled journal carries the requested member identity required by the contract', async () => {
  jest.mocked(loadJournals).mockResolvedValue([entry()]);
  const ctx = await buildMemberLiveContext(FICTIONAL_A);
  expect(ctx.recentJournal[0].userId).toBe(FICTIONAL_A);
  expect(loadJournals).toHaveBeenCalledWith(FICTIONAL_A, 5);
});

test('preserves exact source text, metadata and Date without mutating the loaded row', async () => {
  const original = entry();
  const snapshot = { ...original, themes: [...original.themes!] };
  Object.freeze(original);
  jest.mocked(loadJournals).mockResolvedValue([original]);
  const ctx = await buildMemberLiveContext(FICTIONAL_A);
  expect(ctx.recentJournal[0].content).toBe(snapshot.content);
  expect(ctx.recentJournal[0].themes).toEqual(snapshot.themes);
  expect(ctx.recentJournal[0].createdAt).toBe(original.createdAt);
  expect(original).toEqual(snapshot);
  expect(original).not.toHaveProperty('userId');
});

test('parallel fictional members retain their independently scoped journal results', async () => {
  jest.mocked(loadJournals).mockImplementation(async member => [{
    ...entry(), id: 'entry-for-' + member, content: 'FICTIONAL TEXT ' + member,
  }]);
  const [a, b] = await Promise.all([buildMemberLiveContext(FICTIONAL_A), buildMemberLiveContext(FICTIONAL_B)]);
  expect(a.recentJournal[0]).toMatchObject({ userId: FICTIONAL_A, content: 'FICTIONAL TEXT ' + FICTIONAL_A });
  expect(b.recentJournal[0]).toMatchObject({ userId: FICTIONAL_B, content: 'FICTIONAL TEXT ' + FICTIONAL_B });
  expect(a.recentJournal).not.toBe(b.recentJournal);
});

test('journal-source failure still degrades to an empty journal without extra reads', async () => {
  jest.mocked(loadJournals).mockRejectedValue(new Error('fictional unavailable source'));
  const ctx = await buildMemberLiveContext(FICTIONAL_A);
  expect(ctx.recentJournal).toEqual([]);
  for (const source of sources) expect(source).toHaveBeenCalledTimes(1);
  expect(ctx.astrology).toBeNull();
});

test('keeps the caller journal limit and existing source membership argument', async () => {
  await buildMemberLiveContext(FICTIONAL_A, { maxJournal: 2, maxSessions: 1, maxPatterns: 3 });
  expect(loadJournals).toHaveBeenCalledWith(FICTIONAL_A, 2);
  expect(getRecentSummaries).toHaveBeenCalledWith(FICTIONAL_A, 1);
  expect(getActivePatternContext).toHaveBeenCalledWith(FICTIONAL_A, 3);
});

test('formats Date-backed loader entries with the existing preview and theme semantics', async () => {
  jest.mocked(loadJournals).mockResolvedValue([entry()]);
  const ctx = await buildMemberLiveContext(FICTIONAL_A);
  expect(formatMemberWebForPrompt(ctx)).toContain(
    '[2026-10-14] (hope, creative) — A naïve line. A second line — unchanged.',
  );
  expect(ctx.fieldState?.dominantTone).toBe('hope');
  expect(ctx.fieldState?.recency).toBe('high');
});

test('retains string-timestamp consumers without reinterpreting dates or adding themes', () => {
  const ctx = emptyContext();
  ctx.recentJournal = [{ id: 'legacy-fictional', userId: FICTIONAL_A,
    content: 'FICTIONAL legacy note', createdAt: '2026-10-13T23:30:00-05:00' }];
  expect(formatMemberWebForPrompt(ctx)).toContain('[2026-10-13] — FICTIONAL legacy note');
  expect(formatMemberWebForPrompt(ctx)).not.toContain('(hope');
});

test('optional journal themes are not synthesized from prose', async () => {
  jest.mocked(loadJournals).mockResolvedValue([{ id: 'bare-fictional',
    content: 'The fictional word grief is not a theme assignment.', createdAt: new Date(now) }]);
  const ctx = await buildMemberLiveContext(FICTIONAL_A);
  expect(ctx.fieldState?.dominantTone).toBeUndefined();
  expect(ctx.recentJournal[0].themes).toBeUndefined();
});

test('existing prompt cap still excludes the sixth journal without changing stored text', async () => {
  jest.mocked(loadJournals).mockResolvedValue(Array.from({ length: 6 }, (_, i) => ({
    ...entry(), id: 'fictional-' + i, content: 'FICTIONAL_JOURNAL_' + i,
  })));
  const ctx = await buildMemberLiveContext(FICTIONAL_A, { maxJournal: 6 });
  const prompt = formatMemberWebForPrompt(ctx);
  expect(ctx.recentJournal).toHaveLength(6);
  expect(prompt).toContain('FICTIONAL_JOURNAL_4');
  expect(prompt).not.toContain('FICTIONAL_JOURNAL_5');
  expect(describeLiveContext(ctx).journal).toBe(6);
});
