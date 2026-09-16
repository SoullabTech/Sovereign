jest.mock('../../../lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(),
}));

import { writeFileSync } from 'node:fs';
import { getMemberIdFromRequest } from '../../../lib/auth/getMemberFromRequest';
import {
  resolveCanonicalIdentity,
  type CanonicalTurn,
  type MemberIdentity,
  type ProducerId,
} from '../../../lib/maia/canonical-turn';
import {
  constructEditorialWriterTurn,
  constructWriterTurn,
} from '../../../lib/writers-studio/canonicalWriterTurn';
import { STANDING_SHADOW_FIXTURES } from './fixtures';
import { buildStandingShadowComparison } from './shadow-harness';
import {
  assertProjectableProducer,
  projectStandingTurn,
  StandingProjectionRefused,
} from './standing-projection';
import { renderShadowResponse } from './shadow-response';

const mockedResolver = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const REQ = {} as Parameters<typeof resolveCanonicalIdentity>[0];
const MEMBER = '22222222-3333-4444-8555-666666666666';

async function verified(): Promise<MemberIdentity> {
  mockedResolver.mockResolvedValueOnce(MEMBER);
  return resolveCanonicalIdentity(REQ);
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as object)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

beforeEach(() => mockedResolver.mockReset());

describe('JARVIS-MAIA-STANDING-SHADOW-01', () => {
  it('projects the live Focus crossing with exact source standing and unavailable claim-standing', async () => {
    const identity = await verified();
    const turn = constructWriterTurn({
      identity,
      sessionRef: 'shadow-focus-session',
      exchangeId: 'shadow-focus-turn',
      ask: 'What is this passage actually doing?',
      sanctuary: false,
      emit: false,
      participation: {
        focus: { workRef: 'work-1', scopeKind: 'passage', label: 'opening' },
        workContext: 'The river appears, disappears, and returns three pages later.',
      },
    });

    const comparison = buildStandingShadowComparison(turn, { tier: 'CORE' });
    expect(comparison.preflight).toEqual({
      sameParticipantOrder: true,
      sameParticipantTexts: true,
      sameFloorBlocks: true,
      currentContainsEveryParticipant: true,
      shadowContainsEveryParticipant: true,
    });
    expect(comparison.projection.participantOrder).toEqual([
      'member.writer_focus',
      'retrieved.writer_work_context',
    ]);
    expect(comparison.projection.entries.every((e) => e.claimStanding.state === 'unavailable')).toBe(true);
    expect(comparison.projection.entries.map((e) => [e.kind, e.authoredBy, e.participationClass, e.authority])).toEqual([
      ['encounter_input', 'member', 'authored', 'situate'],
      ['participant', 'member', 'placed', 'situate'],
      ['participant', 'member', 'retrieved', 'situate'],
    ]);
    expect(comparison.projection.entries[0].text).toBe('What is this passage actually doing?');
    expect(comparison.shadowSystemPrompt).not.toContain('What is this passage actually doing?');
    expect(comparison.shadowSystemPrompt).toContain(comparison.projection.inputEvidenceId);
  });

  it('refuses partition-pending room producers', () => {
    expect(() => assertProjectableProducer('member.episodic_recall' as ProducerId))
      .toThrow(expect.objectContaining({ code: 'partition_pending' }));
    expect(() => assertProjectableProducer('retrieved.conversational_recall' as ProducerId))
      .toThrow(expect.objectContaining({ code: 'partition_pending' }));
  });

  it('refuses a participant whose content no longer matches its manifest digest', async () => {
    const identity = await verified();
    const turn = constructWriterTurn({
      identity,
      sessionRef: 'shadow-tamper-session',
      exchangeId: 'shadow-tamper-turn',
      ask: 'Read this.',
      sanctuary: false,
      emit: false,
      participation: {
        focus: { workRef: 'work-2', scopeKind: 'whole_work' },
        workContext: 'Original work context.',
      },
    });
    const plain = JSON.parse(JSON.stringify(turn)) as CanonicalTurn;
    const admitted = plain.participation.admitted.map((p, i) => i === 0 ? { ...p, text: `${p.text} TAMPERED` } : p);
    const tampered = deepFreeze({ ...plain, participation: { ...plain.participation, admitted } } as CanonicalTurn);
    expect(() => projectStandingTurn(tampered, { tier: 'CORE' }))
      .toThrow(expect.objectContaining({ code: 'manifest_mismatch' }));
  });

  it('the shadow response cannot smuggle standing fields through the model plan', async () => {
    const identity = await verified();
    const turn = constructWriterTurn({
      identity,
      sessionRef: 'shadow-plan-session',
      exchangeId: 'shadow-plan-turn',
      ask: 'What do you notice?',
      sanctuary: false,
      emit: false,
      participation: {
        focus: { workRef: 'work-3', scopeKind: 'passage' },
        workContext: 'A bell rings twice in the final paragraph.',
      },
    });
    const projection = projectStandingTurn(turn, { tier: 'CORE' });
    const id = projection.entries[0].evidenceId;
    expect(() => renderShadowResponse(projection, {
      ground: [],
      synthesis: [{ text: 'The repetition may be structural.', supportEvidenceIds: [id], standing: 'member_confirmed' }],
      question: null,
    })).toThrow(/unknown_field/);
  });

  it('constructs all six adversarial comparisons from real canonical editorial turns', async () => {
    const packets = [] as Array<Record<string, unknown>>;
    for (let i = 0; i < STANDING_SHADOW_FIXTURES.length; i += 1) {
      const fixture = STANDING_SHADOW_FIXTURES[i];
      const identity = await verified();
      const turn = constructEditorialWriterTurn({
        identity,
        sessionRef: `shadow-${fixture.id}`,
        exchangeId: `shadow-${fixture.id}-turn`,
        ask: fixture.userInput,
        sanctuary: false,
        emit: false,
      }, fixture.candidates);
      const comparison = buildStandingShadowComparison(turn, { tier: 'CORE' });
      expect(Object.values(comparison.preflight).every(Boolean)).toBe(true);
      expect(comparison.projection.entries).toHaveLength(5);
      expect(comparison.projection.entries.map((e) => e.authoredBy)).toEqual([
        'member', 'member', 'member', 'system', 'member',
      ]);
      expect(comparison.projection.entries[0].kind).toBe('encounter_input');
      expect(comparison.projection.entries[0].text).toBe(fixture.userInput);
      expect(comparison.shadowSystemPrompt).not.toContain(fixture.userInput);
      expect(comparison.shadowSystemPrompt).toContain(comparison.projection.inputEvidenceId);
      packets.push({
        fixture: {
          id: fixture.id,
          title: fixture.title,
          reviewFacts: fixture.reviewFacts,
          lethalFailures: fixture.lethalFailures,
        },
        turnId: comparison.turnId,
        userInput: comparison.userInput,
        currentSystemPrompt: comparison.currentSystemPrompt,
        shadowSystemPrompt: comparison.shadowSystemPrompt,
        currentPromptDigest: comparison.currentPromptDigest,
        shadowPromptDigest: comparison.shadowPromptDigest,
        projection: comparison.projection,
        preflight: comparison.preflight,
      });
    }

    expect(packets).toHaveLength(6);
    const output = process.env.STANDING_SHADOW_FIXTURE_OUT;
    if (output) writeFileSync(output, JSON.stringify({ packets }, null, 2), { mode: 0o600 });
  });
});
