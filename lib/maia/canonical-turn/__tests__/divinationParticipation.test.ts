/**
 * JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01 — participation certification for the three
 * divination producers through the ONE canonical lineage (lib/maia/canonical-turn).
 *
 * Acceptance proofs pinned here (lane record §4):
 *   (3) no Sanctuary bypass — MIPA HELDs all three under sanctuary.
 *   (4) exact provenance — the three registry axes match the write-path evidence.
 *   (5) the material reaches the composed turn — ADMITTED with its text, rendered.
 *   (7) manifest rows record provider + disposition + reason, chars + digest, no bodies.
 *   (8) legacy path and canonical candidate see the same material — zero-diff through the
 *       new meta keys; hostile mutation goes non-zero.
 *   (1)/(EXCLUDED) an unverified identity cannot be admitted to member-about divination.
 */

jest.mock('../../../auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));

import { getMemberIdFromRequest } from '../../../auth/getMemberFromRequest';
import { digest } from '../../../memory/provenance/turnMemoryProvenance';
import { formatDivinationForPrompt, type IChingReadingSnapshot } from '../../divinationRecallLoader';
import {
  LEGACY_META_KEY_TO_PRODUCER,
  PRODUCER_REGISTRY,
  ROOM_POLICIES,
  assertManifestEntry,
  candidatesFromLegacyAddenda,
  compareLegacyToCanonical,
  constructCanonicalTurn,
  producersForRoom,
  renderTurnForCognition,
  resolveCanonicalIdentity,
  type ConstructInputs,
  type LegacyAddenda,
  type MemberIdentity,
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

const READING: IChingReadingSnapshot = {
  id: 'r-1',
  createdAt: new Date('2026-09-02T15:59:00Z'),
  castMethod: 'coins',
  question: 'Should I take the studio offer or stay independent?',
  memberNotes: null,
  isFavorite: false,
  primaryHex: 61,
  primaryHexName: 'Inner Truth',
  lineValues: [7, 8, 9, 7, 8, 7],
  changingLines: [3],
  relatingHex: 40,
  relatingHexName: 'Deliverance',
  lowerTrigram: 'Lake',
  upperTrigram: 'Wind',
  interpretationText: 'Inner truth moves through the situation like wind over a lake.',
  guidanceText: 'Trust what is already known within.',
};

/** The route's legacy meta, exactly as /list builds it from the formatter. */
function legacyFromFormatter(): LegacyAddenda {
  const d = formatDivinationForPrompt([READING], { sanctuary: false });
  return {
    divinationIntentAddendum: d.intent,
    divinationCastAddendum: d.cast,
    divinationInterpretationAddendum: d.interpretation,
  };
}

function inputs(identity: MemberIdentity, legacy: LegacyAddenda, overrides: Partial<ConstructInputs> = {}): ConstructInputs {
  return {
    ingressId: 'sovereign/app/maia/list',
    identity,
    surface: { modality: 'typed', client: 'web', transport: 'http', streaming: false },
    encounter: { input: 'what did the I Ching say the other day?', sessionRef: 'sess-1', room: ROOM_POLICIES.sovereign_chat },
    sovereignty: { sanctuary: false, memoryMode: 'continuity', allowCrossSessionMemory: true },
    cognitionRequest: { mode: 'dialogue', requestedDepth: 'auto', includeAudio: false },
    candidates: candidatesFromLegacyAddenda(legacy),
    cognitionPath: 'shadow',
    emit: false,
    ...overrides,
  };
}

const DIV_PRODUCERS = ['member.divination_intent', 'computed.divination_cast', 'house.divination_interpretation'] as const;

describe('(4) registry — three axes from the write path, not one scalar', () => {
  it('member.divination_intent is member / authored / situate', () => {
    const s = PRODUCER_REGISTRY['member.divination_intent'];
    expect([s.authoredBy, s.participationClass, s.authority]).toEqual(['member', 'authored', 'situate']);
  });
  it('computed.divination_cast is system / computed / compute', () => {
    const s = PRODUCER_REGISTRY['computed.divination_cast'];
    expect([s.authoredBy, s.participationClass, s.authority]).toEqual(['system', 'computed', 'compute']);
  });
  it('house.divination_interpretation is house / authored / situate', () => {
    const s = PRODUCER_REGISTRY['house.divination_interpretation'];
    expect([s.authoredBy, s.participationClass, s.authority]).toEqual(['house', 'authored', 'situate']);
  });
  // Room scope was ['sovereign_chat'] when this lane landed; MEMORY-DIVINATION-BETWEEN-ROOM-01
  // (2026-09-04) added 'between' after the production census found it is the live member
  // surface. Everything else below is unchanged by that cut and still pinned here.
  it('all three are member-about (retrieval keyed to the member), verified-only, not-sanctuary, route-scope, lane-recorded, no partition pending', () => {
    for (const id of DIV_PRODUCERS) {
      const s = PRODUCER_REGISTRY[id];
      expect(s.consentBasis).not.toBeNull();
      expect(s.requires.identity).toBe('verified');
      expect(s.requires.notSanctuary).toBe(true);
      expect([...s.rooms].sort()).toEqual(['between', 'sovereign_chat']);
      expect(s.scope).toBe('route');
      expect(s.mandatory).toBe(false);
      expect(s.registeredBy).toBe('JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01');
      expect(s.registeredAt).toBe('2026-09-03');
      expect(s.reason.length).toBeGreaterThan(10);
      expect((s as { partitionPending?: true }).partitionPending).toBeUndefined();
    }
  });
  it('the three legacy meta keys map one-to-one onto the three producers', () => {
    expect(LEGACY_META_KEY_TO_PRODUCER.divinationIntentAddendum).toBe('member.divination_intent');
    expect(LEGACY_META_KEY_TO_PRODUCER.divinationCastAddendum).toBe('computed.divination_cast');
    expect(LEGACY_META_KEY_TO_PRODUCER.divinationInterpretationAddendum).toBe('house.divination_interpretation');
  });
  it('sovereign_chat and between consider all three; other rooms consider none', () => {
    for (const room of ['sovereign_chat', 'between'] as const) {
      for (const id of DIV_PRODUCERS) expect(producersForRoom(room)).toContain(id);
    }
    for (const room of ['now_what', 'vision_studio', 'living_field', 'relational_navigation'] as const) {
      for (const id of DIV_PRODUCERS) expect(producersForRoom(room)).not.toContain(id);
    }
  });
});

describe('(5)(7) admission — the material reaches the composed turn with evidence', () => {
  it('a verified member in continuity gets all three ADMITTED as eligible, with text', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const admitted = turn.participation.admitted.filter((p) => (DIV_PRODUCERS as readonly string[]).includes(p.producerId));
    expect(admitted.map((p) => p.producerId).sort()).toEqual([...DIV_PRODUCERS].sort());
    for (const p of admitted) {
      expect(p.disposition).toBe('ADMITTED');
      expect(p.reason).toBe('eligible');
      expect(p.text.length).toBeGreaterThan(0);
    }
    expect(turn.participation.held.map((h) => h.producerId)).not.toEqual(expect.arrayContaining([...DIV_PRODUCERS]));
  });

  it('(5) the rendered prompt carries the cast, the member question, and the corpus framing', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const prompt = renderTurnForCognition(turn, { tier: 'FAST' }).systemPrompt;
    expect(prompt).toContain('Hexagram 61 Inner Truth');
    expect(prompt).toContain('relating hexagram 40 Deliverance');
    expect(prompt).toContain('Should I take the studio offer or stay independent?');
    expect(prompt).toContain('Soullab corpus');
  });

  it('(7) manifest rows: provider + disposition + reason + chars + digest — and no body', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const rows = turn.manifest.admitted.filter((r) => (DIV_PRODUCERS as readonly string[]).includes(r.producerId));
    expect(rows).toHaveLength(3);
    for (const r of rows) {
      expect(() => assertManifestEntry(r)).not.toThrow();
      expect(r.disposition).toBe('ADMITTED');
      expect(r.reason).toBe('eligible');
      expect(r.chars).toBeGreaterThan(0);
      expect(r.blockDigest).toHaveLength(12);
      expect(Object.keys(r)).not.toContain('text');
    }
    const cast = rows.find((r) => r.producerId === 'computed.divination_cast')!;
    expect(cast.chars).toBe(legacy.divinationCastAddendum!.length);
    expect(cast.blockDigest).toBe(digest(legacy.divinationCastAddendum!));
    expect(JSON.stringify(turn.manifest)).not.toContain('Inner Truth');
    expect(JSON.stringify(turn.manifest)).not.toContain('studio offer');
  });

  it('the member block is HELD no_material when the reading carried no member text — never faked', async () => {
    const d = formatDivinationForPrompt([{ ...READING, question: null, memberNotes: null }], { sanctuary: false });
    const legacy: LegacyAddenda = { divinationIntentAddendum: d.intent, divinationCastAddendum: d.cast, divinationInterpretationAddendum: d.interpretation };
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const held = turn.participation.held.find((h) => h.producerId === 'member.divination_intent');
    expect(held).toEqual(expect.objectContaining({ disposition: 'HELD', reason: 'no_material' }));
    expect(turn.participation.admitted.map((p) => p.producerId)).toEqual(expect.arrayContaining(['computed.divination_cast', 'house.divination_interpretation']));
  });
});

describe('(3) sanctuary and (1) identity — no bypass through the canonical lineage', () => {
  it('sanctuary: all three HELD sanctuary even when the route hands text in', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy, {
      sovereignty: { sanctuary: true, memoryMode: 'ephemeral', allowCrossSessionMemory: false },
    }));
    for (const id of DIV_PRODUCERS) {
      expect(turn.participation.held).toEqual(expect.arrayContaining([expect.objectContaining({ producerId: id, disposition: 'HELD', reason: 'sanctuary' })]));
      expect(turn.participation.admitted.map((p) => p.producerId)).not.toContain(id);
    }
  });

  it('sanctuary at the formatter: nothing is rendered, so the route hands nothing in', () => {
    const d = formatDivinationForPrompt([READING], { sanctuary: true });
    expect(d.intent).toBeUndefined();
    expect(d.cast).toBeUndefined();
    expect(d.interpretation).toBeUndefined();
    expect(candidatesFromLegacyAddenda({ divinationIntentAddendum: d.intent, divinationCastAddendum: d.cast, divinationInterpretationAddendum: d.interpretation })).toEqual([]);
  });

  it('anonymous identity: all three EXCLUDED no_verified_member', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await anonymous(), legacy));
    for (const id of DIV_PRODUCERS) {
      expect(turn.participation.excluded).toEqual(expect.arrayContaining([expect.objectContaining({ producerId: id, disposition: 'EXCLUDED', reason: 'no_verified_member' })]));
    }
    expect(turn.participation.admitted.map((p) => p.producerId)).not.toEqual(expect.arrayContaining([...DIV_PRODUCERS]));
  });

  it('a room the producers are not registered for EXCLUDES them not_registered_for_room', async () => {
    const legacy = legacyFromFormatter();
    // now_what stands in for "a room divination is not registered for" — between became a
    // registered room in MEMORY-DIVINATION-BETWEEN-ROOM-01 and is covered by its own suite.
    const turn = constructCanonicalTurn(inputs(await verified(), legacy, {
      encounter: { input: 'hi', sessionRef: 'sess-1', room: ROOM_POLICIES.now_what },
    }));
    for (const id of DIV_PRODUCERS) {
      expect(turn.participation.excluded).toEqual(expect.arrayContaining([expect.objectContaining({ producerId: id, reason: 'not_registered_for_room' })]));
    }
  });
});

describe('(8) legacy path and canonical candidate see the same material', () => {
  it('zero-diff through the three new meta keys', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const diff = compareLegacyToCanonical(legacy, turn);
    expect(diff.zeroDiff).toBe(true);
    expect(diff.legacyCount).toBe(3);
    expect(diff.canonicalCount).toBe(3);
  });

  it('hostile mutation: legacy drops the house block → missingInLegacy names it', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const mutated: LegacyAddenda = { ...legacy, divinationInterpretationAddendum: undefined };
    const diff = compareLegacyToCanonical(mutated, turn);
    expect(diff.zeroDiff).toBe(false);
    expect(diff.missingInLegacy).toEqual(['house.divination_interpretation']);
  });

  it('hostile mutation: legacy text differs from what MIPA admitted → digestMismatch names it', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const mutated: LegacyAddenda = { ...legacy, divinationCastAddendum: legacy.divinationCastAddendum + ' (edited after adjudication)' };
    const diff = compareLegacyToCanonical(mutated, turn);
    expect(diff.zeroDiff).toBe(false);
    expect(diff.digestMismatch).toEqual(['computed.divination_cast']);
  });
});
