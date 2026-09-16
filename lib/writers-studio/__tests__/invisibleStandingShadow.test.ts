/** JARVIS-MAIA-INVISIBLE-STANDING-SHADOW-02 · live-shadow falsifiers. */

jest.mock('../../auth/getMemberFromRequest', () => ({ getMemberIdFromRequest: jest.fn() }));

import { getMemberIdFromRequest } from '../../auth/getMemberFromRequest';
import { resolveCanonicalIdentity, type CandidateBlock } from '../../maia/canonical-turn';
import { constructEditorialWriterTurn } from '../canonicalWriterTurn';
import {
  auditInvisibleStandingShadow,
  runInvisibleStandingShadowSafely,
  INVISIBLE_STANDING_SHADOW_TAG,
} from '../invisibleStandingShadow';

const mockedResolver = getMemberIdFromRequest as jest.MockedFunction<typeof getMemberIdFromRequest>;
const REQ = {} as Parameters<typeof resolveCanonicalIdentity>[0];
const MEMBER = '11111111-2222-4333-8444-555555555555';

async function turn(input = "No. That's wrong. The repetition is deliberate; it's how the rhythm works.") {
  mockedResolver.mockResolvedValueOnce(MEMBER);
  const identity = await resolveCanonicalIdentity(REQ);
  const candidates: CandidateBlock[] = [
    { producerId: 'retrieved.writer_editorial_locus', text: 'Current locus: a repeated phrase appears three times.' },
    { producerId: 'member.writer_editorial_history', text: 'Writer history: “The rhythm matters to me.”' },
    { producerId: 'system.writer_editorial_history', text: 'Earlier MAIA observation: “The repetition reads like avoidance.”' },
    { producerId: 'member.writer_editorial_act', text: '[Current editorial act] rejection of MAIA interpretation' },
  ];
  return constructEditorialWriterTurn({
    identity,
    sessionRef: 'shadow-live-session',
    exchangeId: 'shadow-live-turn',
    ask: input,
    sanctuary: false,
    emit: false,
  }, candidates);
}

beforeEach(() => {
  mockedResolver.mockReset();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('Invisible Standing live shadow', () => {
  it('passes natural relational prose without changing or returning response text', async () => {
    const t = await turn();
    const response = "You're right — the repetition is deliberate. What does that rhythm let the passage carry?";
    const audit = auditInvisibleStandingShadow(t, response);
    expect(audit.disposition).toBe('pass');
    expect(audit.responseChars).toBe(response.length);
    expect(Object.prototype.hasOwnProperty.call(audit, 'text')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(audit, 'response')).toBe(false);
  });

  it('accepts an exact direct quote from the current member utterance', async () => {
    const input = 'The repetition is deliberate; it is how the rhythm works.';
    const t = await turn(input);
    const audit = auditInvisibleStandingShadow(t, `You said, “${input}” That changes how I read the passage.`);
    expect(audit.disposition).toBe('pass');
    expect(audit.directAttributionCount).toBe(1);
  });

  it('observes a quote matching system material but never treats incomplete turn evidence as refusal proof', async () => {
    const t = await turn();
    const audit = auditInvisibleStandingShadow(t, 'You said, “The repetition reads like avoidance.”');
    expect(audit.disposition).toBe('observe');
    expect(audit.findings).toEqual(expect.arrayContaining([
      expect.objectContaining({
        ruleId: 'member_attribution_nonmember_candidate',
        disposition: 'observe',
        proof: expect.objectContaining({ evidencePopulationComplete: false }),
      }),
    ]));
  });

  it('observes an unknown direct attribution rather than manufacturing absence proof', async () => {
    const t = await turn();
    const audit = auditInvisibleStandingShadow(t, 'You wrote, “This exact sentence is not in the current turn.”');
    expect(audit.disposition).toBe('observe');
    expect(audit.findings[0]).toMatchObject({
      ruleId: 'member_attribution_unverified',
      disposition: 'observe',
      proof: { evidencePopulationComplete: false },
    });
  });

  it('would refuse only an already-provable constitutional class', async () => {
    const t = await turn();
    const audit = auditInvisibleStandingShadow(t, 'This is who you are becoming.');
    expect(audit.disposition).toBe('would_refuse');
    expect(audit.findings.some((f) => f.ruleId === 'identity_predicate_authority')).toBe(true);
  });

  it('keeps telemetry content-free, including in Sanctuary', async () => {
    const t = await turn();
    const response = 'You said, “A sentence nobody supplied.”';
    const audit = runInvisibleStandingShadowSafely({ turn: t, finalText: response, sanctuary: true });
    expect(audit?.disposition).toBe('observe');
    const emitted = (console.log as jest.Mock).mock.calls.map((call) => String(call[0])).join('\n');
    expect(emitted).toContain(INVISIBLE_STANDING_SHADOW_TAG);
    expect(emitted).not.toContain(response);
    expect(emitted).not.toContain('A sentence nobody supplied.');
    expect(emitted).not.toContain(MEMBER);
    expect(emitted).not.toContain(t.turnId);
  });

  it('swallows audit exceptions and emits no exception message/content', async () => {
    const t = await turn();
    const explosive = new Proxy(t, {
      get(target, prop, receiver) {
        if (prop === 'participation') throw new Error('SECRET-CONTENT-SHOULD-NOT-LOG');
        return Reflect.get(target, prop, receiver);
      },
    });
    Object.freeze(explosive);
    expect(() => runInvisibleStandingShadowSafely({
      turn: explosive,
      finalText: 'ordinary response',
      sanctuary: false,
    })).not.toThrow();
    const emitted = (console.warn as jest.Mock).mock.calls.map((call) => String(call[0])).join('\n');
    expect(emitted).toContain('audit_exception');
    expect(emitted).not.toContain('SECRET-CONTENT-SHOULD-NOT-LOG');
  });
});
