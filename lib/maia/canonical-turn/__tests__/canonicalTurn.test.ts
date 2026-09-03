/**
 * CMT-01 — runtime falsifiers for the canonical turn (spec §8: G1 renderer-level, G2, G4,
 * G6, G7, G8-shadow) and the M2 acceptance witness at fixture level:
 *   paired legacy/canonical structural zero-diff, plus the hostile mutation proving the
 *   comparison becomes non-zero when one side loses a provider.
 */

jest.mock('../../../auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));

import { getMemberIdFromRequest } from '../../../auth/getMemberFromRequest';
import { MAIA_RUNTIME_PROMPT } from '../../../consciousness/MAIA_RUNTIME_PROMPT';
import {
  INTERFACE_HUMILITY_GUARDRAIL,
  MEMORY_SPEECH_ACT_BOUNDARY,
  PLATFORM_KNOWLEDGE_BOUNDARY,
} from '../../../sovereign/maiaVoice';
import { digest } from '../../../memory/provenance/turnMemoryProvenance';
import {
  CanonicalTurnRefused,
  ROOM_POLICIES,
  assertManifestEntry,
  candidatesFromLegacyAddenda,
  compareLegacyToCanonical,
  constructCanonicalTurn,
  producersForRoom,
  renderTurnForCognition,
  resolveCanonicalIdentity,
  type CandidateBlock,
  type CanonicalTurn,
  type ConstructInputs,
  type LegacyAddenda,
  type MemberIdentity,
  type SurfaceDescriptor,
} from '../index';

const mockedResolver = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const REQ = {} as Parameters<typeof resolveCanonicalIdentity>[0];
const MEMBER = '11111111-2222-4333-8444-555555555555';

async function verified(): Promise<MemberIdentity> {
  mockedResolver.mockResolvedValueOnce(MEMBER);
  return resolveCanonicalIdentity(REQ);
}
async function anonymous(): Promise<MemberIdentity> {
  mockedResolver.mockResolvedValueOnce(null);
  return resolveCanonicalIdentity(REQ, { anonRef: 'anon:test' });
}

const SURFACE: SurfaceDescriptor = { modality: 'typed', client: 'web', transport: 'http', streaming: false };

const LEGACY: LegacyAddenda = {
  memoryInfluenceAddendum: 'MEMORY INFLUENCE — a returning thread about the stalled project.',
  forwardReadinessAddendum: 'FORWARD READINESS — readiness signal detected.',
  atomsAddendum: 'ATOMS — 3 member-placed atoms.',
  conversationalRecallAddendum: 'PRIOR EXCHANGES — two sessions ago.',
  episodicRecallAddendum: undefined,
  relationalContextAddendum: undefined,
  placeAddendum: 'PLACE — you are in the main conversation room.',
  wuxingSnapshotAddendum: 'WU XING — Wood rising.',
  studioAddendum: undefined,
  practiceFieldAddendum: undefined,
  knowledgeGateAddendum: 'KNOWLEDGE GATE — draw from these wells.',
  memberWebAddendum: 'MEMBER WEB — patterns + summaries.',
  astrologyAddendum: 'ASTROLOGY — natal chart on file.',
};

function baseInputs(identity: MemberIdentity, candidates: readonly CandidateBlock[], overrides: Partial<ConstructInputs> = {}): ConstructInputs {
  return {
    ingressId: 'sovereign/app/maia/list',
    identity,
    surface: SURFACE,
    encounter: { input: 'hello', sessionRef: 'sess-1', room: ROOM_POLICIES.sovereign_chat },
    sovereignty: { sanctuary: false, memoryMode: 'continuity', allowCrossSessionMemory: true },
    cognitionRequest: { mode: 'dialogue', requestedDepth: 'auto', includeAudio: false },
    candidates,
    cognitionPath: 'shadow',
    emit: false,
    ...overrides,
  };
}

beforeEach(() => mockedResolver.mockReset());

describe('G4 — identity provenance', () => {
  it('refuses an identity that was not minted by resolveCanonicalIdentity', () => {
    const forged = { status: 'verified', memberId: MEMBER, memberRef: 'x' } as unknown as MemberIdentity;
    expect(() => constructCanonicalTurn(baseInputs(forged, []))).toThrow(CanonicalTurnRefused);
    try { constructCanonicalTurn(baseInputs(forged, [])); } catch (e) { expect((e as CanonicalTurnRefused).code).toBe('identity_unverifiable'); }
  });
  it('mints verified / anonymous identities from the one resolver only', async () => {
    const v = await verified();
    expect(v.status).toBe('verified');
    const a = await anonymous();
    expect(a.status).toBe('anonymous');
    expect(mockedResolver).toHaveBeenCalledTimes(2);
  });
});

describe('G2 — producer-set closure', () => {
  it('refuses the whole turn on an unregistered producer', async () => {
    const id = await verified();
    const rogue = [{ producerId: 'foo.not_registered', text: 'x' }] as unknown as CandidateBlock[];
    expect(() => constructCanonicalTurn(baseInputs(id, rogue))).toThrow(/unregistered_producer/);
  });
  it('refuses an unknown input key (the open channel trying to return)', async () => {
    const id = await verified();
    const inputs = { ...baseInputs(id, []), meta: { x: 1 } } as unknown as ConstructInputs;
    expect(() => constructCanonicalTurn(inputs)).toThrow(/unknown_input/);
  });
});

describe('MIPA — eligibility and restraint', () => {
  it('excludes member-about producers for an anonymous identity', async () => {
    const id = await anonymous();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY)));
    expect(turn.participation.admitted.map((p) => p.producerId)).not.toContain('member.atoms');
    expect(turn.participation.excluded).toContainEqual(expect.objectContaining({ producerId: 'member.atoms', disposition: 'EXCLUDED', reason: 'no_verified_member', authoredBy: 'member' }));
    // house/collective material still participates
    expect(turn.participation.admitted.map((p) => p.producerId)).toContain('house.place');
  });
  it('holds member-about producers under sanctuary even when a block was supplied', async () => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY), {
      sovereignty: { sanctuary: true, memoryMode: 'ephemeral', allowCrossSessionMemory: false },
    }));
    expect(turn.participation.held).toContainEqual(expect.objectContaining({ producerId: 'member.atoms', disposition: 'HELD', reason: 'sanctuary' }));
    expect(turn.participation.admitted.map((p) => p.producerId)).not.toContain('member.atoms');
  });
  it('records eligible-but-absent producers as held:no_material (not silently absent)', async () => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY)));
    expect(turn.participation.held).toContainEqual(expect.objectContaining({ producerId: 'member.relational_context', disposition: 'HELD', reason: 'no_material' }));
  });
  it('pp-1: between does not admit atoms; sovereign_chat does (no levelling-up)', () => {
    expect(producersForRoom('between')).not.toContain('member.atoms');
    expect(producersForRoom('sovereign_chat')).toContain('member.atoms');
  });
  it('a member gesture does not rewrite authorship (Decision 2)', async () => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY)));
    const mi = turn.participation.admitted.find((p) => p.producerId === 'inferred.memory_influence');
    expect(mi).toMatchObject({ authoredBy: 'system', participationClass: 'inferred', authority: 'infer', disposition: 'ADMITTED', reason: 'eligible' });
    const atoms = turn.participation.admitted.find((p) => p.producerId === 'member.atoms');
    expect(atoms).toMatchObject({ authoredBy: 'member', participationClass: 'placed', authority: 'situate', disposition: 'ADMITTED', reason: 'member_placed' });
    expect(turn.participation.offered).toEqual([]);
  });
});

describe('G6 — manifest completeness, content-free', () => {
  it('has one row per admitted participant, digests only, fieldDigest reproducible', async () => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY)));
    const m = turn.manifest;
    // pdc-1: manifest.admitted = floor rows (mandatory_floor) + field rows; every row a contract entry.
    expect(m.admitted.length).toBe(turn.participation.admitted.length + turn.floor.blocks.length);
    expect(m.admitted.filter((r) => r.reason === 'mandatory_floor').length).toBe(turn.floor.blocks.length);
    for (const r of [...m.admitted, ...m.held, ...m.excluded]) expect(() => assertManifestEntry(r)).not.toThrow();
    expect(m.counts.offered).toBe(0);
    const recomputed = digest(turn.participation.admitted.map((p) => `${p.producerId}:${digest(p.text)}`).join('|'));
    expect(m.fieldDigest).toBe(recomputed);
    const json = JSON.stringify(m);
    for (const p of turn.participation.admitted) expect(json).not.toContain(p.text);
    expect(json).not.toContain(MEMBER);
    expect(m.memberRef).toBeDefined();
  });
});

describe('G7 — surface parity', () => {
  it('web / ios / desktop produce identical participation and fieldDigest', async () => {
    const turns: CanonicalTurn[] = [];
    for (const client of ['web', 'ios', 'desktop'] as const) {
      const id = await verified();
      turns.push(constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY), {
        surface: { ...SURFACE, client, transport: client === 'ios' ? 'sse' : 'http', streaming: client === 'ios' },
      })));
    }
    const [a, b, c] = turns;
    expect(b.manifest.fieldDigest).toBe(a.manifest.fieldDigest);
    expect(c.manifest.fieldDigest).toBe(a.manifest.fieldDigest);
    expect(b.participation).toEqual(a.participation);
    expect(c.participation).toEqual(a.participation);
  });
});

describe('G1 (renderer) — floor invariance across tiers', () => {
  it.each(['FAST', 'CORE', 'DEEP'] as const)('%s prompt opens with the runtime prompt and closes with the three guardrails', async (tier) => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY)));
    const out = renderTurnForCognition(turn, { tier, scaffold: `[${tier} scaffold]` });
    expect(out.systemPrompt.startsWith(MAIA_RUNTIME_PROMPT)).toBe(true);
    expect(out.systemPrompt.endsWith(INTERFACE_HUMILITY_GUARDRAIL)).toBe(true);
    expect(out.systemPrompt).toContain(MEMORY_SPEECH_ACT_BOUNDARY);
    expect(out.systemPrompt).toContain(PLATFORM_KNOWLEDGE_BOUNDARY);
    const humilityAt = out.systemPrompt.lastIndexOf(INTERFACE_HUMILITY_GUARDRAIL);
    for (const p of turn.participation.admitted) expect(out.systemPrompt.indexOf(p.text)).toBeLessThan(humilityAt);
  });
  it('the turn is deeply frozen — a tier cannot extend it', async () => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY)));
    expect(Object.isFrozen(turn)).toBe(true);
    expect(Object.isFrozen(turn.participation)).toBe(true);
    expect(Object.isFrozen(turn.participation.admitted)).toBe(true);
    expect(() => { (turn.participation.admitted as unknown as unknown[]).push({}); }).toThrow();
  });
});

describe('M2 acceptance — paired legacy/canonical structural zero-diff (G8 shadow)', () => {
  it('the canonical object faithfully shadows the legacy addenda: zero diff', async () => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY)));
    const diff = compareLegacyToCanonical(LEGACY, turn);
    expect(diff).toMatchObject({ zeroDiff: true, missingInCanonical: [], missingInLegacy: [], digestMismatch: [] });
    expect(diff.legacyCount).toBe(9);
    expect(diff.canonicalCount).toBe(9);
  });
  it('HOSTILE: legacy loses a provider → comparison is non-zero (missingInLegacy)', async () => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY)));
    const mutated: LegacyAddenda = { ...LEGACY, atomsAddendum: undefined };
    const diff = compareLegacyToCanonical(mutated, turn);
    expect(diff.zeroDiff).toBe(false);
    expect(diff.missingInLegacy).toEqual(['member.atoms']);
  });
  it('HOSTILE: canonical loses a provider → comparison is non-zero (missingInCanonical)', async () => {
    const id = await verified();
    const fewer = candidatesFromLegacyAddenda(LEGACY).filter((c) => c.producerId !== 'retrieved.member_web');
    const turn = constructCanonicalTurn(baseInputs(id, fewer));
    const diff = compareLegacyToCanonical(LEGACY, turn);
    expect(diff.zeroDiff).toBe(false);
    expect(diff.missingInCanonical).toEqual(['retrieved.member_web']);
  });
  it('HOSTILE: a provider changes text → digestMismatch', async () => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, candidatesFromLegacyAddenda(LEGACY)));
    const diff = compareLegacyToCanonical({ ...LEGACY, placeAddendum: 'PLACE — a different room.' }, turn);
    expect(diff.zeroDiff).toBe(false);
    expect(diff.digestMismatch).toEqual(['house.place']);
  });
  it('INNOCENT: a floor/tier producer is outside the shadow domain and does not perturb the diff', async () => {
    const id = await verified();
    const turn = constructCanonicalTurn(baseInputs(id, [
      ...candidatesFromLegacyAddenda(LEGACY),
      { producerId: 'declared.maia_mode', text: 'MODE — talk' },
    ]));
    expect(compareLegacyToCanonical(LEGACY, turn).zeroDiff).toBe(true);
  });
});
