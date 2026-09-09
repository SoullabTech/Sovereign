/**
 * WRITER'S STUDIO MAIA HARNESS — boundary falsifiers.
 *
 * These test the two things the harness must not get wrong:
 *   1. it must be unreachable unless BOTH gates pass, and indistinguishable
 *      from a non-existent route when either fails;
 *   2. it must not accept identity, prompt text, or anything undeclared.
 */

import {
  harnessEnabledInEnvironment,
  requireHarnessAccess,
  HARNESS_ENV_FLAG,
} from '../harnessAccess';
import { parseWriterStudioContext } from '../harnessContext';

const mockRequireFounder = jest.fn();
jest.mock('@/lib/founder/founderAuth', () => ({
  requireFounder: () => mockRequireFounder(),
}));

const ON = { [HARNESS_ENV_FLAG]: 'true' } as NodeJS.ProcessEnv;
const FOUNDER = { ok: true, memberId: 'member-abc' };

beforeEach(() => {
  mockRequireFounder.mockReset();
  mockRequireFounder.mockResolvedValue(FOUNDER);
});

describe('gate 1 — server environment', () => {
  it('is off when the flag is absent', () => {
    expect(harnessEnabledInEnvironment({} as NodeJS.ProcessEnv)).toBe(false);
  });

  it.each(['false', 'TRUE', '1', 'yes', ''])('is off for %p', async v => {
    expect(harnessEnabledInEnvironment({ [HARNESS_ENV_FLAG]: v } as NodeJS.ProcessEnv)).toBe(false);
    expect(await requireHarnessAccess({ [HARNESS_ENV_FLAG]: v } as NodeJS.ProcessEnv))
      .toEqual({ ok: false, reason: 'NOT_FOUND' });
  });

  it('does not consult identity at all when the environment refuses', async () => {
    await requireHarnessAccess({} as NodeJS.ProcessEnv);
    expect(mockRequireFounder).not.toHaveBeenCalled();
  });

  it('has no client-readable form', () => {
    expect(HARNESS_ENV_FLAG.startsWith('NEXT_PUBLIC_')).toBe(false);
  });
});

describe('gate 2 — verified member authority', () => {
  it('admits the founder on a verified session', async () => {
    expect(await requireHarnessAccess(ON)).toEqual({ ok: true, memberId: 'member-abc' });
  });

  it.each([
    ['no session', { ok: false, status: 401, error: 'Authentication required' }],
    ['not the founder', { ok: false, status: 403, error: 'Founder access required' }],
  ])('refuses when %s', async (_label, result) => {
    mockRequireFounder.mockResolvedValue(result);
    expect(await requireHarnessAccess(ON)).toEqual({ ok: false, reason: 'NOT_FOUND' });
  });

  it('gives 401 and 403 the SAME answer, so the caller cannot leak which gate refused', async () => {
    mockRequireFounder.mockResolvedValue({ ok: false, status: 401, error: 'a' });
    const unauthenticated = await requireHarnessAccess(ON);
    mockRequireFounder.mockResolvedValue({ ok: false, status: 403, error: 'b' });
    const wrongMember = await requireHarnessAccess(ON);
    const environmentOff = await requireHarnessAccess({} as NodeJS.ProcessEnv);
    expect(unauthenticated).toEqual(wrongMember);
    expect(wrongMember).toEqual(environmentOff);
  });

  it('takes the member id from the session and never from anywhere else', async () => {
    const r = await requireHarnessAccess(ON);
    expect(r).toEqual({ ok: true, memberId: 'member-abc' });
    expect(mockRequireFounder).toHaveBeenCalledTimes(1);
  });
});

describe('the Writer context refuses identity and prompt smuggling', () => {
  const base = { workId: 'ch4' };

  it.each([
    'userId', 'memberId', 'member_id', 'user_id', 'email', 'passkey', 'sessionId',
  ])('refuses identity key %p rather than ignoring it', key => {
    const r = parseWriterStudioContext({ ...base, [key]: 'someone-else' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain(key);
  });

  it.each(['meta', 'studioAddendum', 'addendum', 'systemPrompt', 'prompt', 'instructions'])(
    'refuses prompt channel %p — the defect CMT-01 exists to close', key => {
      const r = parseWriterStudioContext({ ...base, [key]: 'You are an editor.' });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toContain(key);
    });

  it('refuses an undeclared field rather than dropping it', () => {
    const r = parseWriterStudioContext({ ...base, applyRevision: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toContain('applyRevision');
  });

  it('refuses identity nested inside focus', () => {
    const r = parseWriterStudioContext({
      ...base,
      focus: { scale: 'section', label: 'x', text: 'y', sectionIds: [], userId: 'other' },
    });
    expect(r.ok).toBe(false);
  });
});

describe('the Writer context accepts the declared shape', () => {
  it('accepts a full context and normalizes absent fields', () => {
    const r = parseWriterStudioContext({
      workId: 'ch4',
      focus: { scale: 'passage', label: 'passage in section 5', text: 'Life can seem chaotic', sectionIds: ['s5'] },
      localContext: 'surrounding paragraph',
      structuralPosition: {
        sectionId: 's5', index: 5, total: 10, heading: 'Mastering the Elements',
        precedingHeading: 'The Four Paths', followingHeading: 'The Dance Between',
      },
      wholeWork: [{ sectionId: 's5', heading: 'Mastering the Elements', text: 'body' }],
      conversationThread: [
        { speaker: 'writer', text: 'Is this section effective and well placed?' },
        { speaker: 'maia', text: 'a reading' },
      ],
      pursuit: 'the turn from encounter into system',
      commission: null,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.focus?.label).toBe('passage in section 5');
      expect(r.value.conversationThread).toHaveLength(2);
      expect(r.value.commission).toBeNull();
    }
  });

  it('accepts a minimal context', () => {
    const r = parseWriterStudioContext({ workId: 'ch4' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.focus).toBeNull();
      expect(r.value.wholeWork).toEqual([]);
      expect(r.value.conversationThread).toEqual([]);
    }
  });

  it.each([
    ['a non-object', 'nope'],
    ['a missing workId', {}],
    ['an unknown focus scale', { workId: 'x', focus: { scale: 'chapter', label: '', text: '', sectionIds: [] } }],
    ['an unknown speaker', { workId: 'x', conversationThread: [{ speaker: 'editor', text: 'hi' }] }],
    ['a non-integer position', { workId: 'x', structuralPosition: { sectionId: 's', heading: 'h', index: 1.5, total: 3 } }],
  ])('refuses %s', (_label, input) => {
    expect(parseWriterStudioContext(input).ok).toBe(false);
  });

  it('refuses an oversized Work rather than truncating it silently', () => {
    const huge = Array.from({ length: 40 }, (_, i) => ({
      sectionId: `s${i}`, heading: 'h', text: 'x'.repeat(60_000),
    }));
    expect(parseWriterStudioContext({ workId: 'x', wholeWork: huge }).ok).toBe(false);
  });

  it('carries no field that could be appended to a prompt as-is', () => {
    const r = parseWriterStudioContext({ workId: 'ch4', commission: 'finish the chapter' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      // The contract is a shape. Every string on it is MATERIAL, addressed by a
      // producer; none of it is a directive channel, and there is no field whose
      // name or type invites concatenation into a system prompt.
      expect(Object.keys(r.value).sort()).toEqual([
        'commission', 'conversationThread', 'focus', 'localContext',
        'pursuit', 'structuralPosition', 'wholeWork', 'workId',
      ]);
    }
  });
});
