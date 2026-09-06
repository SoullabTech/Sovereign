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
  it('all three are member-about (retrieval keyed to the member), verified-only, not-sanctuary, sovereign_chat, route-scope, lane-recorded, no partition pending', () => {
    for (const id of DIV_PRODUCERS) {
      const s = PRODUCER_REGISTRY[id];
      expect(s.consentBasis).not.toBeNull();
      expect(s.requires.identity).toBe('verified');
      expect(s.requires.notSanctuary).toBe(true);
      expect(s.rooms).toEqual(['sovereign_chat']);
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
  it('sovereign_chat considers all three; other rooms consider none (Pass 1 scope)', () => {
    const chat = producersForRoom('sovereign_chat');
    for (const id of DIV_PRODUCERS) expect(chat).toContain(id);
    for (const room of ['between', 'now_what', 'vision_studio', 'living_field', 'relational_navigation'] as const) {
      for (const id of DIV_PRODUCERS) expect(producersForRoom(room)).not.toContain(id);
    }
  });
});

describe('(5)(7) admission — the material reaches the composed turn with evidence', () => {
  it('pp-2: a verified member in continuity gets intent + cast ADMITTED eligible; house interpretation HELD until invoked', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const admitted = turn.participation.admitted.filter((p) => (DIV_PRODUCERS as readonly string[]).includes(p.producerId));
    expect(admitted.map((p) => p.producerId).sort()).toEqual(['computed.divination_cast', 'member.divination_intent']);
    for (const p of admitted) {
      expect(p.disposition).toBe('ADMITTED');
      expect(p.reason).toBe('eligible');
      expect(p.text.length).toBeGreaterThan(0);
    }
    const held = turn.participation.held.find((h) => h.producerId === 'house.divination_interpretation');
    expect(held).toEqual(expect.objectContaining({ disposition: 'HELD', reason: 'restraint:pp2_awaiting_member_invocation' }));
  });

  it('pp-2: when the member invokes the divination context this turn, the house interpretation is ADMITTED member_invoked with house provenance', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy, {
      sovereignty: { sanctuary: false, memoryMode: 'continuity', allowCrossSessionMemory: true, memberInvocations: ['divination'] },
    }));
    const house = turn.participation.admitted.find((p) => p.producerId === 'house.divination_interpretation');
    expect(house).toEqual(expect.objectContaining({ disposition: 'ADMITTED', reason: 'member_invoked', authoredBy: 'house' }));
    expect(turn.participation.admitted.map((p) => p.producerId).sort()).toEqual(expect.arrayContaining([...DIV_PRODUCERS].sort()));
  });

  it('pp-2: an ephemeral turn HOLDs all three restraint:pp2_continuity_off — memory-mode continuity is the boundary', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy, {
      sovereignty: { sanctuary: false, memoryMode: 'ephemeral', allowCrossSessionMemory: false, memberInvocations: ['divination'] },
    }));
    for (const id of DIV_PRODUCERS) {
      expect(turn.participation.held).toEqual(expect.arrayContaining([expect.objectContaining({ producerId: id, disposition: 'HELD', reason: 'restraint:pp2_continuity_off' })]));
      expect(turn.participation.admitted.map((p) => p.producerId)).not.toContain(id);
    }
  });

  it('(5) the rendered prompt carries the cast and the member question; the corpus framing only when invoked (pp-2)', async () => {
    const legacy = legacyFromFormatter();
    const ambient = constructCanonicalTurn(inputs(await verified(), legacy));
    const ambientPrompt = renderTurnForCognition(ambient, { tier: 'FAST' }).systemPrompt;
    expect(ambientPrompt).toContain('Hexagram 61 Inner Truth');
    expect(ambientPrompt).toContain('relating hexagram 40 Deliverance');
    expect(ambientPrompt).toContain('Should I take the studio offer or stay independent?');
    expect(ambientPrompt).not.toContain('Soullab corpus');

    const invoked = constructCanonicalTurn(inputs(await verified(), legacy, {
      sovereignty: { sanctuary: false, memoryMode: 'continuity', allowCrossSessionMemory: true, memberInvocations: ['divination'] },
    }));
    expect(renderTurnForCognition(invoked, { tier: 'FAST' }).systemPrompt).toContain('Soullab corpus');
  });

  it('(7) manifest rows: provider + disposition + reason + chars + digest — and no body', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const rows = turn.manifest.admitted.filter((r) => (DIV_PRODUCERS as readonly string[]).includes(r.producerId));
    expect(rows).toHaveLength(2); // pp-2: house interpretation is HELD until invoked
    const heldRow = turn.manifest.held.find((r) => r.producerId === 'house.divination_interpretation');
    expect(heldRow).toEqual(expect.objectContaining({ disposition: 'HELD', reason: 'restraint:pp2_awaiting_member_invocation' }));
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
    expect(turn.participation.admitted.map((p) => p.producerId)).toEqual(expect.arrayContaining(['computed.divination_cast']));
    expect(turn.participation.admitted.map((p) => p.producerId)).not.toContain('house.divination_interpretation'); // pp-2 hold
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
    const turn = constructCanonicalTurn(inputs(await verified(), legacy, {
      encounter: { input: 'hi', sessionRef: 'sess-1', room: ROOM_POLICIES.between },
    }));
    for (const id of DIV_PRODUCERS) {
      expect(turn.participation.excluded).toEqual(expect.arrayContaining([expect.objectContaining({ producerId: id, reason: 'not_registered_for_room' })]));
    }
  });
});

describe('(8) legacy path and canonical candidate see the same material', () => {
  it('pp-2 policy divergence: ambient turn — legacy carries the house block, canonical holds it → missingInCanonical names it (evidence for M3, not a defect)', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy));
    const diff = compareLegacyToCanonical(legacy, turn);
    expect(diff.zeroDiff).toBe(false);
    expect(diff.missingInCanonical).toEqual(['house.divination_interpretation']);
    expect(diff.missingInLegacy).toEqual([]);
    expect(diff.legacyCount).toBe(3);
    expect(diff.canonicalCount).toBe(2);
  });

  it('zero-diff through the three new meta keys when the member invoked the divination context', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy, {
      sovereignty: { sanctuary: false, memoryMode: 'continuity', allowCrossSessionMemory: true, memberInvocations: ['divination'] },
    }));
    const diff = compareLegacyToCanonical(legacy, turn);
    expect(diff.zeroDiff).toBe(true);
    expect(diff.legacyCount).toBe(3);
    expect(diff.canonicalCount).toBe(3);
  });

  it('hostile mutation: legacy drops the house block on an invoked turn → missingInLegacy names it', async () => {
    const legacy = legacyFromFormatter();
    const turn = constructCanonicalTurn(inputs(await verified(), legacy, {
      sovereignty: { sanctuary: false, memoryMode: 'continuity', allowCrossSessionMemory: true, memberInvocations: ['divination'] },
    }));
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
