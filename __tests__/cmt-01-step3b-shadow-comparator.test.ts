/**
 * CMT-01 — STEP 3b CERTIFICATION (PART 1): THE SHADOW COMPARATOR
 *
 * Authority: docs/architecture/MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md §4.1
 *
 * A zero-diff that has not first been shown capable of becoming nonzero is not
 * evidence. This suite certifies the measuring instrument before any real
 * reading is taken with it, and it does so END-TO-END: the canonical side is
 * produced by the REAL constructor over mocked providers, and the legacy side
 * by the legacy digest over the same material composed by the same formatters
 * — so a zero reading here is a statement about construction, not about a
 * fixture that was written to agree with itself.
 *
 *     equal structures            → ZERO diff
 *     withhold one provider       → NONZERO
 *     alter one disposition       → NONZERO
 *     alter a composed body       → block / floor / field digests change
 *     observation-only change     → still ZERO semantic diff
 *     restore                     → ZERO again
 *     provider FAILURE            → never compares equal to "returned nothing"
 */

jest.mock('@/lib/maia/consentGates', () => ({ readConsentGate: jest.fn(async () => true) }));
jest.mock('@/lib/maia/memoryAtomsLoader', () => ({
  ...jest.requireActual('@/lib/maia/memoryAtomsLoader'),
  loadMemberMemoryAtomsForPrompt: jest.fn(async () => ATOMS),
}));
jest.mock('@/lib/maia/memoryLoaders', () => ({
  loadPriorCrossSessionExchanges: jest.fn(async () => EXCHANGES),
  loadRecentMarkedEpisodes: jest.fn(async () => EPISODES),
  loadRecentDevelopmentalMemories: jest.fn(async () => DEV),
  loadRecentThemeSignals: jest.fn(async () => DEV),
}));
jest.mock('@/lib/memory/MemberLiveContext', () => ({
  ...jest.requireActual('@/lib/memory/MemberLiveContext'),
  buildMemberLiveContext: jest.fn(async () => ({})),
  certifyMemberWeb: jest.fn(() => WEB),
}));
jest.mock('@/lib/memory/RelationshipMemoryService', () => ({
  ...jest.requireActual('@/lib/memory/RelationshipMemoryService'),
  loadRelationshipMemory: jest.fn(async () => ({ essence: {}, summary: 'RECURRENCE', themes: [], breakthroughs: [], emergingPatterns: [] })),
  certifyRelationshipMemory: jest.fn(() => ({ summary: 'RECURRENCE', hasEssence: true, excluded: { themes: 0, breakthroughs: 0, patterns: 0 } })),
}));
jest.mock('@/lib/memory/MemoryOrchestrator', () => ({
  memoryOrchestrator: { getSessionRecallContext: jest.fn(async () => ({ recentTurns: [{ role: 'user', content: 'r', createdAt: '' }], recentBreakthroughs: [] })) },
}));
jest.mock('@/lib/memory/breakthroughParticipation', () => ({ admittedBreakthroughs: jest.fn(() => []) }));
jest.mock('@/lib/consciousness/RelationshipAnamnesis', () => ({ loadRelationshipEssence: jest.fn(async () => null) }));
jest.mock('@/lib/anchor/loadRecentAnchors', () => ({ loadRecentAnchors: jest.fn(async () => []) }));
jest.mock('@/lib/memory/SignificantMomentsService', () => ({ loadSignificantMoments: jest.fn(async () => ({ captures: [], journals: [], breakthroughs: [], summary: {} })) }));
jest.mock('@/lib/memory/MemoryBundle', () => ({ MemoryBundleService: { build: jest.fn(async () => ({ memoryBullets: [], recentContinuity: '' })) } }));
jest.mock('@/lib/memory/selflet/SelfletIntegration', () => ({ loadSelfletContext: jest.fn(async () => ({ promptInjection: '' })) }));
jest.mock('@/lib/ain/knowledge/RetrievalService', () => ({ retrieveForMode: jest.fn(async () => []) }));

const ATOMS = [
  { id: 'a1', sourceType: 'journal', title: 'Kept one', body: 'kept body', primaryRegister: null, registers: [], elementalLenses: [], status: 'active', keptAt: new Date(0), returnPreference: 'contextual_doorway', isBreakthrough: false, markedBreakthroughAt: null, epistemologicalStatus: null },
  { id: 'a2', sourceType: 'practitioner_observation', title: 'Observed', body: 'observed body', primaryRegister: 'witnessed', registers: ['witnessed'], elementalLenses: [], status: 'active', keptAt: new Date(0), returnPreference: 'member_pulled', isBreakthrough: false, markedBreakthroughAt: null, epistemologicalStatus: 'observed' },
];
const NOW = Date.now();
const EXCHANGES = [
  { session_id: 's-old', role: 'user', created_at: new Date(NOW - 3 * 86400_000), content: 'my prior words' },
  { session_id: 's-old', role: 'assistant', created_at: new Date(NOW - 3 * 86400_000), content: 'maia prior words' },
];
const EPISODES = [{ episode_id: 'e1', verbatim_text: 'marked words', source_turn_id: null, source_session_id: null, created_at: new Date(NOW - 86400_000) }];
const DEV = [{ participation: 'excluded', exclusionReason: 'uncertified_provenance' }];
const WEB = { journal: [{ createdAt: new Date(0), content: 'journal words' }], excluded: { patterns: 1, sessions: 1, themes: 1, fieldState: true } };

import { loadMemberMemoryAtomsForPrompt, formatAtomsForPrompt } from '@/lib/maia/memoryAtomsLoader';
import { loadRecentMarkedEpisodes } from '@/lib/maia/memoryLoaders';
import { formatPriorExchangesForPrompt, computeLastPriorSessionMinutesAgo } from '@/lib/maia/conversationalRecallBlock';
import { formatMarkedEpisodesForPrompt } from '@/lib/maia/episodicRecallBlock';
import { formatMemberWebForPrompt } from '@/lib/memory/MemberLiveContext';
import { buildMemoryInfluencePlan } from '@/lib/maia/memoryOrchestrator';
import { constructCanonicalTurn } from '@/lib/maia/turn/constructCanonicalTurn';
import { compareDigests, digestFromCanonicalTurn, bodyDigest, EXPECTED_DIVERGENCES } from '@/lib/maia/turn/shadowCompare';
import { legacyDigestFromListAssembly, type LegacyListAssembly } from '@/lib/maia/turn/legacyDigest';
import type { TurnFrame } from '@/lib/maia/turn/providers';

beforeEach(() => jest.clearAllMocks());

const frame = (over: Partial<TurnFrame['encounter']> = {}): TurnFrame => ({
  identity: { memberId: '11111111-1111-1111-1111-111111111111', credentialPath: 'session_cookie' },
  encounter: { sessionId: 'sess-current', input: 'what do you remember', mode: 'talk', modality: 'text', sanctuary: false, sessionTurnCount: 4, ...over },
  surface: { surface: 'desktop' },
  profile: 'legacy:A',
});

/** What /list would hold for the same turn, composed by the same formatters. */
function legacy(over: Partial<LegacyListAssembly> = {}) {
  const conv = formatPriorExchangesForPrompt(EXCHANGES as never, { recallEnabled: true, mode: null, currentSessionTurnCount: 4, lastPriorSessionMinutesAgo: computeLastPriorSessionMinutesAgo(EXCHANGES as never) });
  const epi = formatMarkedEpisodesForPrompt(EPISODES as never, { recallEnabled: true, mode: null });
  const plan = buildMemoryInfluencePlan({ message: 'what do you remember', userId: 'm', conversationHistory: [], recentDevelopmentalMemories: [], recentThemeSignals: [], hasMemberLiveContext: false, hasRelationshipAnamnesis: false });
  return legacyDigestFromListAssembly({
    isSanctuary: false, isRecognizedUser: true, allowCrossSessionMemory: true,
    certifiedWeb: WEB as never,
    developmental: DEV as never, themes: DEV as never,
    atoms: ATOMS as never,
    conversation: { enabled: true, rows: EXCHANGES as never, emitted: conv.emitted, suppressedReason: conv.suppressedReason },
    episodes: { enabled: true, rows: EPISODES as never, emitted: epi.emitted, suppressedReason: epi.suppressedReason },
    composed: {
      member_web: formatMemberWebForPrompt(WEB as never),
      developmental: plan.promptBlock || undefined,
      atoms: formatAtomsForPrompt(ATOMS as never),
      conversation: conv.block || undefined,
      episodes: epi.block || undefined,
    },
    observation: { turnId: 'legacy-1', builtAt: '2026-09-03T10:00:00Z' },
    ...over,
  });
}

// ── §0 — META-INVARIANT ──────────────────────────────────────────────────────

describe('CMT-01 step 3b §0 — the instrument found its subject', () => {
  it('both sides are non-trivial and compose real blocks', async () => {
    const L = legacy();
    const C = digestFromCanonicalTurn(await constructCanonicalTurn(frame()));
    expect(Object.keys(L.providers).length).toBe(14);
    expect(Object.keys(C.providers).length).toBe(14);
    expect(L.sectionOrder.length).toBeGreaterThanOrEqual(3);
    expect(C.sectionOrder.length).toBeGreaterThanOrEqual(3);
    expect(L.sections.atoms?.digest).toHaveLength(16);
  });
});

// ── §1 — ZERO DIFF ON EQUAL STRUCTURE, END TO END ────────────────────────────

describe('CMT-01 step 3b §1 — the real constructor agrees with the legacy digest', () => {
  it('zero-diff, with ONLY the documented below-seam rows reported as expected', async () => {
    const L = legacy();
    const C = digestFromCanonicalTurn(await constructCanonicalTurn(frame()));
    const r = compareDigests(L, C);
    expect(r.unexpected).toEqual([]);
    expect(r.zeroDiff).toBe(true);
    expect(r.unobservable.sort()).toEqual(['relationship', 'session_recall']);
    expect(r.expected.length).toBeGreaterThan(0);
    for (const d of r.expected) expect(d.path).toMatch(/^(providers|sections)\.(relationship|session_recall)(\.|$)/);
  });

  it('block digests agree because both sides ran the same certified formatter', async () => {
    const L = legacy();
    const C = digestFromCanonicalTurn(await constructCanonicalTurn(frame()));
    for (const id of ['atoms', 'conversation', 'episodes', 'member_web'] as const) {
      expect({ id, l: L.sections[id]?.digest, c: C.sections[id]?.digest, eq: L.sections[id]?.digest === C.sections[id]?.digest })
        .toEqual({ id, l: L.sections[id]?.digest, c: C.sections[id]?.digest, eq: true });
    }
    // Each side's own floor covers its full order (canonical's includes the two
    // below-seam sections); the COMPARABLE floor is over what both can see.
    const r = compareDigests(L, C);
    expect(r.floorDigests.legacy).toBe(r.floorDigests.canonical);
    expect(L.floorDigest).not.toBe(C.floorDigest);
  });

  it('expected divergences are STILL REPORTED — zero-diff does not mean nothing to say', async () => {
    const r = compareDigests(legacy(), digestFromCanonicalTurn(await constructCanonicalTurn(frame())));
    expect(r.zeroDiff).toBe(true);
    expect(r.expected.length).toBeGreaterThan(0);
  });
});

// ── §2 — NONZERO WHEN IT SHOULD BE ───────────────────────────────────────────

describe('CMT-01 step 3b §2 — the instrument can read nonzero', () => {
  it('withholding one provider on the canonical side is NONZERO', async () => {
    (loadMemberMemoryAtomsForPrompt as jest.Mock).mockImplementationOnce(async () => []);
    const r = compareDigests(legacy(), digestFromCanonicalTurn(await constructCanonicalTurn(frame())));
    expect(r.zeroDiff).toBe(false);
    expect(r.unexpected.map((d) => d.path)).toEqual(expect.arrayContaining(['providers.atoms.returned', 'providers.atoms.admitted', 'sections.atoms.digest']));
    expect(r.floorDigests.legacy).not.toBe(r.floorDigests.canonical);
  });

  it('altering one disposition (an admitted row becomes excluded) is NONZERO', async () => {
    (loadRecentMarkedEpisodes as jest.Mock).mockImplementationOnce(async () => []);
    const L = legacy({ episodes: { enabled: true, rows: EPISODES as never, emitted: true } });
    const r = compareDigests(L, digestFromCanonicalTurn(await constructCanonicalTurn(frame())));
    expect(r.zeroDiff).toBe(false);
    expect(r.unexpected.some((d) => d.path === 'providers.episodes.admitted')).toBe(true);
  });

  it('altering a composed BODY changes the block, floor and field digests', async () => {
    const L = legacy({ composed: { member_web: formatMemberWebForPrompt(WEB as never), atoms: formatAtomsForPrompt(ATOMS as never) + '\nAND ONE MORE LINE', conversation: 'x', episodes: 'y' } });
    const C = digestFromCanonicalTurn(await constructCanonicalTurn(frame()));
    const r = compareDigests(L, C);
    expect(r.zeroDiff).toBe(false);
    expect(r.unexpected.some((d) => d.path === 'sections.atoms.digest')).toBe(true);
    expect(r.floorDigests.legacy).not.toBe(r.floorDigests.canonical);
    expect(r.fieldDigests.legacy).not.toBe(r.fieldDigests.canonical);
  });

  it('a changed gate is NONZERO', async () => {
    const L = legacy({ conversation: { enabled: false, rows: EXCHANGES as never, emitted: false, suppressedReason: 'opt-out' } });
    const r = compareDigests(L, digestFromCanonicalTurn(await constructCanonicalTurn(frame())));
    expect(r.zeroDiff).toBe(false);
    expect(r.unexpected.some((d) => d.path === 'gates.consent.conversational_recall_enabled')).toBe(true);
    expect(r.unexpected.some((d) => d.path === 'providers.conversation.held')).toBe(true);
  });

  it('a provider FAILURE never compares equal to "returned nothing"', async () => {
    (loadMemberMemoryAtomsForPrompt as jest.Mock).mockImplementationOnce(async () => { throw new Error('db down'); });
    const L = legacy({ atoms: [], composed: { member_web: formatMemberWebForPrompt(WEB as never), conversation: 'c', episodes: 'e' } });
    const r = compareDigests(L, digestFromCanonicalTurn(await constructCanonicalTurn(frame())));
    expect(r.zeroDiff).toBe(false);
    expect(r.unexpected.some((d) => d.path === 'providers.atoms.error')).toBe(true);
  });
});

// ── §3 — OBSERVATION METADATA IS NOT STRUCTURE ───────────────────────────────

describe('CMT-01 step 3b §3 — observation-only differences are not semantic', () => {
  it('changing only turnId / builtAt / constructedAt leaves the semantic diff at zero', async () => {
    const L1 = legacy({ observation: { turnId: 'A', builtAt: 't1' } });
    const L2 = legacy({ observation: { turnId: 'B', builtAt: 't2' } });
    expect(L1.fieldDigest).toBe(L2.fieldDigest);
    const C1 = digestFromCanonicalTurn(await constructCanonicalTurn(frame()));
    const C2 = digestFromCanonicalTurn(await constructCanonicalTurn(frame()));
    expect(C1.observation.constructedAt).toBeDefined();
    expect(C1.fieldDigest).toBe(C2.fieldDigest);
    expect(compareDigests(L1, C1).zeroDiff).toBe(true);
    expect(compareDigests(L2, C2).zeroDiff).toBe(true);
  });

  it('formatting-only body differences do not change a block digest', () => {
    expect(bodyDigest('a  b\n\nc')).toBe(bodyDigest('a b c'));
    expect(bodyDigest('a b c')).not.toBe(bodyDigest('a b d'));
  });
});

// ── §4 — RESTORATION ─────────────────────────────────────────────────────────

describe('CMT-01 step 3b §4 — restoration returns to zero', () => {
  it('after a nonzero reading, the restored pair reads zero again', async () => {
    (loadMemberMemoryAtomsForPrompt as jest.Mock).mockImplementationOnce(async () => [ATOMS[0]]);
    expect(compareDigests(legacy(), digestFromCanonicalTurn(await constructCanonicalTurn(frame()))).zeroDiff).toBe(false);
    expect(compareDigests(legacy(), digestFromCanonicalTurn(await constructCanonicalTurn(frame()))).zeroDiff).toBe(true);
  });
});

// ── §5 — THE LEGACY DIGEST TELLS THE TRUTH ABOUT WHAT IT CANNOT SEE ──────────

describe('CMT-01 step 3b §5 — below-seam and formatter rules are surfaced, not mapped away', () => {
  it('relationship and session_recall are reported as unobserved below the seam', () => {
    const L = legacy();
    expect(L.providers.relationship?.held).toBe('unobserved:below_seam');
    expect(L.providers.session_recall?.held).toBe('unobserved:below_seam');
  });

  it('the session-resumption rule is SHARED: both sides run the same formatter and agree', async () => {
    // A fresh session (turn 0) with a prior session minutes ago triggers the
    // formatter's session-resumption suppression on BOTH sides.
    const recent = EXCHANGES.map((e) => ({ ...e, created_at: new Date(NOW - 2 * 60_000) }));
    const conv = formatPriorExchangesForPrompt(recent as never, { recallEnabled: true, mode: null, currentSessionTurnCount: 0, lastPriorSessionMinutesAgo: computeLastPriorSessionMinutesAgo(recent as never) });
    const { loadPriorCrossSessionExchanges } = jest.requireMock('@/lib/maia/memoryLoaders');
    (loadPriorCrossSessionExchanges as jest.Mock).mockImplementationOnce(async () => recent);
    const L = legacy({ conversation: { enabled: true, rows: recent as never, emitted: conv.emitted, suppressedReason: conv.suppressedReason }, composed: { member_web: formatMemberWebForPrompt(WEB as never), atoms: formatAtomsForPrompt(ATOMS as never), conversation: conv.block || undefined, episodes: formatMarkedEpisodesForPrompt(EPISODES as never, { recallEnabled: true, mode: null }).block } });
    const C = digestFromCanonicalTurn(await constructCanonicalTurn(frame({ sessionTurnCount: 0 })));
    expect(L.providers.conversation?.suppressed).toBe(C.providers.conversation?.suppressed);
    expect(compareDigests(L, C).zeroDiff).toBe(true);
  });

  it('"empty" is not a hold — the provider ran and found nothing', () => {
    const L = legacy({ conversation: { enabled: true, rows: [], emitted: false, suppressedReason: 'empty' } });
    expect(L.providers.conversation?.invoked).toBe(true);
    expect(L.providers.conversation?.held).toBeUndefined();
    expect(L.providers.conversation?.suppressed).toBeUndefined();
  });

  it('every EXPECTED_DIVERGENCES rule states its reason and cites source', () => {
    expect(EXPECTED_DIVERGENCES.length).toBeGreaterThan(0);
    for (const rule of EXPECTED_DIVERGENCES) {
      expect(rule.reason.length).toBeGreaterThan(60);
      expect(rule.reason).toMatch(/maiaService\.ts/);
    }
  });
});

// ── §6 — BOUNDARY CONTROLS ───────────────────────────────────────────────────

describe('CMT-01 step 3b §6 — boundary controls', () => {
  it('section ORDER is structure', async () => {
    const C = digestFromCanonicalTurn(await constructCanonicalTurn(frame()));
    const L = legacy();
    const swapped = { ...L, sectionOrder: [...L.sectionOrder].reverse() };
    expect(compareDigests(swapped, C).zeroDiff).toBe(false);
    expect(compareDigests(swapped, C).unexpected.some((d) => d.path.startsWith('sectionOrder'))).toBe(true);
  });

  it('the derived digests are never reported as separate paths', async () => {
    const L = legacy({ composed: { member_web: 'w', atoms: 'a', conversation: 'c', episodes: 'e' } });
    const r = compareDigests(L, digestFromCanonicalTurn(await constructCanonicalTurn(frame())));
    expect(r.unexpected.some((d) => d.path === 'fieldDigest' || d.path === 'floorDigest')).toBe(false);
    expect(r.fieldDigests.legacy).not.toBe(r.fieldDigests.canonical);
  });

  it('a digest never carries a body', async () => {
    for (const d of [legacy(), digestFromCanonicalTurn(await constructCanonicalTurn(frame()))]) {
      const json = JSON.stringify(d);
      for (const body of ['kept body', 'observed body', 'my prior words', 'maia prior words', 'marked words', 'journal words', 'RECURRENCE']) {
        expect({ side: d.side, body, leaked: json.includes(body) }).toEqual({ side: d.side, body, leaked: false });
      }
    }
  });
});
