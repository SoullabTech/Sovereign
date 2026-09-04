/**
 * MEMORY-DIVINATION-BETWEEN-ROOM-01 — the three divination producers participate in the
 * live member room (`between`) under the same identity, Sanctuary and consent conditions
 * they already satisfy in `sovereign_chat`.
 *
 * Why this cut exists: production census 2026-09-04 found `/api/between/chat` is the live
 * member conversation surface (agent_runs), while the Pass 1 divination wiring landed on
 * `/api/sovereign/app/maia/list` only. The reading was durable and unreachable.
 *
 * Instrumentation note: `/api/between/chat` constructs no CanonicalTurn and emits no
 * `[MAIA/shadow]` line today (verified by source census at canonical 774f02e14), so no
 * zero-diff requirement is bound to that route. These tests certify what does exist:
 * the registry classification, MIPA's adjudication for the between room, and the
 * unchanged three-authorship partition.
 */

jest.mock('../../../auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));

import { getMemberIdFromRequest } from '../../../auth/getMemberFromRequest';
import { formatDivinationForPrompt, type IChingReadingSnapshot } from '../../divinationRecallLoader';
import {
  PRODUCER_REGISTRY,
  ROOM_POLICIES,
  assertManifestEntry,
  candidatesFromLegacyAddenda,
  constructCanonicalTurn,
  producersForRoom,
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
  id: 'r-55',
  createdAt: new Date('2026-09-04T13:52:25Z'),
  castMethod: 'yarrow',
  question: 'What is the shape of the working relationship now?',
  memberNotes: null,
  isFavorite: false,
  primaryHex: 55,
  primaryHexName: 'Abundance',
  lineValues: [9, 7, 8, 6, 8, 8],
  changingLines: [1, 4],
  relatingHex: 13,
  relatingHexName: 'Fellowship with Others',
  lowerTrigram: 'fire',
  upperTrigram: 'thunder',
  interpretationText: 'Abundance arrives at its fullness; the sun at midday.',
  guidanceText: 'Act while the light is high.',
};

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
    ingressId: 'between/chat',
    identity,
    surface: { modality: 'typed', client: 'web', transport: 'http', streaming: false },
    encounter: { input: 'what did the I Ching say to me just now?', sessionRef: 'sess-b', room: ROOM_POLICIES.between },
    sovereignty: { sanctuary: false, memoryMode: 'continuity', allowCrossSessionMemory: true },
    cognitionRequest: { mode: 'dialogue', requestedDepth: 'auto', includeAudio: false },
    candidates: candidatesFromLegacyAddenda(legacy),
    cognitionPath: 'shadow',
    emit: false,
    ...overrides,
  };
}

const DIV = ['member.divination_intent', 'computed.divination_cast', 'house.divination_interpretation'] as const;

describe('registry — divination is registered for both rooms, unchanged otherwise', () => {
  it('each producer lists sovereign_chat and between, and nothing else', () => {
    for (const id of DIV) {
      expect([...PRODUCER_REGISTRY[id].rooms].sort()).toEqual(['between', 'sovereign_chat']);
    }
  });

  it('the three axes are untouched by the room change', () => {
    expect(Object.fromEntries(DIV.map((id) => {
      const s = PRODUCER_REGISTRY[id];
      return [id, [s.authoredBy, s.participationClass, s.authority]];
    }))).toEqual({
      'member.divination_intent': ['member', 'authored', 'situate'],
      'computed.divination_cast': ['system', 'computed', 'compute'],
      'house.divination_interpretation': ['house', 'authored', 'situate'],
    });
  });

  it('identity, Sanctuary and consent requirements are unchanged', () => {
    for (const id of DIV) {
      const s = PRODUCER_REGISTRY[id];
      expect(s.requires.identity).toBe('verified');
      expect(s.requires.notSanctuary).toBe(true);
      expect(s.consentBasis).toBe('memory mode continuity');
      expect(s.scope).toBe('route');
      expect(s.mandatory).toBe(false);
    }
  });

  it('both rooms consider all three; the rooms not registered still exclude them', () => {
    for (const room of ['sovereign_chat', 'between'] as const) {
      for (const id of DIV) expect(producersForRoom(room)).toContain(id);
    }
    for (const room of ['now_what', 'vision_studio', 'living_field', 'relational_navigation'] as const) {
      for (const id of DIV) expect(producersForRoom(room)).not.toContain(id);
    }
  });
});

describe('MIPA in the between room', () => {
  it('a verified member in continuity gets all three ADMITTED with their text', async () => {
    const turn = constructCanonicalTurn(inputs(await verified(), legacyFromFormatter()));
    const admitted = turn.participation.admitted.filter((p) => (DIV as readonly string[]).includes(p.producerId));
    expect(admitted.map((p) => p.producerId).sort()).toEqual([...DIV].sort());
    for (const p of admitted) {
      expect(p.disposition).toBe('ADMITTED');
      expect(p.reason).toBe('eligible');
      expect(p.text.length).toBeGreaterThan(0);
    }
  });

  it('the cast reaches the between turn with the hexagram identity intact', async () => {
    const turn = constructCanonicalTurn(inputs(await verified(), legacyFromFormatter()));
    const cast = turn.participation.admitted.find((p) => p.producerId === 'computed.divination_cast')!;
    expect(cast.text).toContain('Hexagram 55 Abundance');
    expect(cast.text).toContain('relating hexagram 13 Fellowship with Others');
    expect(cast.text).toContain('changing lines 1, 4');
  });

  it('Sanctuary holds all three in the between room too', async () => {
    const turn = constructCanonicalTurn(inputs(await verified(), legacyFromFormatter(), {
      sovereignty: { sanctuary: true, memoryMode: 'ephemeral', allowCrossSessionMemory: false },
    }));
    for (const id of DIV) {
      expect(turn.participation.held).toEqual(expect.arrayContaining([
        expect.objectContaining({ producerId: id, disposition: 'HELD', reason: 'sanctuary' }),
      ]));
      expect(turn.participation.admitted.map((p) => p.producerId)).not.toContain(id);
    }
  });

  it('an anonymous between turn excludes all three', async () => {
    const turn = constructCanonicalTurn(inputs(await anonymous(), legacyFromFormatter()));
    for (const id of DIV) {
      expect(turn.participation.excluded).toEqual(expect.arrayContaining([
        expect.objectContaining({ producerId: id, disposition: 'EXCLUDED', reason: 'no_verified_member' }),
      ]));
    }
  });

  it('between manifest rows carry evidence and no bodies', async () => {
    const turn = constructCanonicalTurn(inputs(await verified(), legacyFromFormatter()));
    const rows = turn.manifest.admitted.filter((r) => (DIV as readonly string[]).includes(r.producerId));
    expect(rows).toHaveLength(3);
    for (const r of rows) {
      expect(() => assertManifestEntry(r)).not.toThrow();
      expect(r.chars).toBeGreaterThan(0);
      expect(r.blockDigest).toHaveLength(12);
    }
    expect(turn.manifest.roomKind).toBe('between');
    expect(JSON.stringify(turn.manifest)).not.toContain('Abundance');
  });
});

describe('the three authorships stay separable in the between room', () => {
  it('member text, computed cast and house corpus never bleed across blocks', () => {
    const d = formatDivinationForPrompt([READING], { sanctuary: false });
    expect(d.intent).toContain('What is the shape of the working relationship now?');
    expect(d.intent).not.toContain('sun at midday');
    expect(d.cast).not.toContain('What is the shape of the working relationship now?');
    expect(d.cast).not.toContain('sun at midday');
    expect(d.interpretation).toContain('sun at midday');
    expect(d.interpretation).toContain("Soullab corpus, not the member's words");
  });
});
