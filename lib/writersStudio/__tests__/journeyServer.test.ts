/** @jest-environment node */
import { query, queryWithExpectedRefusal } from '@/lib/db/postgres';
import { deleteMessage, sendMessage } from '@/lib/team/ChannelService';
import { isTeamMember } from '@/lib/team/teamMembership';
import {
  addJourneyAnswer,
  colabShareAvailability,
  listCurrentForFounder,
  listOwnJourney,
  shareJourneyAnswer,
  withdrawJourneyAnswer,
} from '../journeyServer';
import { JOURNEY_PROMPTS, colabMessageBody, validateAnswerInput } from '../journey';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn(), queryWithExpectedRefusal: jest.fn() }));
jest.mock('@/lib/team/ChannelService', () => ({ sendMessage: jest.fn(), deleteMessage: jest.fn() }));
jest.mock('@/lib/team/teamMembership', () => ({ isTeamMember: jest.fn() }));

const q = query as jest.Mock;
const qRefusal = queryWithExpectedRefusal as jest.Mock;
const send = sendMessage as jest.Mock;
const del = deleteMessage as jest.Mock;
const member = isTeamMember as jest.Mock;

const ME = '11111111-1111-4111-8111-111111111111';
const ANSWER = '22222222-2222-4222-8222-222222222222';
const CHANNEL = '33333333-3333-4333-8333-333333333333';
const TEAM = '44444444-4444-4444-8444-444444444444';

const row = (over: Record<string, unknown> = {}) => ({
  id: ANSWER, member_id: ME, prompt_key: 'edit_felt_like_mine', choice: null, answer: 'It sounded like me.',
  supersedes: null, withdrawn_at: null, colab_message_id: null, colab_kind: null, colab_shared_at: null,
  colab_live: false, created_at: '2026-11-01T12:00:00Z', ...over,
});

beforeEach(() => {
  jest.clearAllMocks();
  q.mockReset();
  qRefusal.mockReset();
  delete process.env.WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID;
});

describe('questions are the founder-ruled first wave', () => {
  it('has exactly the five experience questions of the design note', () => {
    expect(JOURNEY_PROMPTS.filter((p) => p.wave === 1).map((p) => p.key)).toEqual([
      'edit_felt_like_mine', 'navigation_asked', 'learning_understood', 'studio_method_asked', 'stuck_learning_machine',
    ]);
  });

  it('requires the writer’s own words; a choice alone is not an answer', () => {
    expect(validateAnswerInput({ promptKey: 'edit_felt_like_mine', choice: 'yes', answer: '   ' }))
      .toEqual({ ok: false, refusal: 'empty' });
    expect(validateAnswerInput({ promptKey: 'not_a_prompt', answer: 'x' })).toEqual({ ok: false, refusal: 'unknown_prompt' });
    expect(validateAnswerInput({ promptKey: 'edit_felt_like_mine', choice: 'maybe', answer: 'x' }))
      .toEqual({ ok: false, refusal: 'bad_choice' });
    expect(validateAnswerInput({ promptKey: 'stuck_learning_machine', answer: 'x'.repeat(2001) }))
      .toEqual({ ok: false, refusal: 'too_long' });
  });
});

describe('the writer sees only their own answers', () => {
  it('scopes the list to the caller', async () => {
    q.mockResolvedValueOnce({ rows: [row()] });
    const answers = await listOwnJourney(ME);
    expect(q.mock.calls[0][1]).toEqual([ME]);
    expect(q.mock.calls[0][0]).toContain('WHERE a.member_id = $1');
    expect(answers[0]).toMatchObject({ id: ANSWER, colabStillShared: false });
  });

  it('refuses to revise an answer that is not theirs', async () => {
    q.mockResolvedValueOnce({ rows: [] });
    const result = await addJourneyAnswer(ME, { promptKey: 'edit_felt_like_mine', answer: 'new', supersedes: ANSWER });
    expect(result).toEqual({ ok: false, refusal: 'not_found' });
    expect(q).toHaveBeenCalledTimes(1);
  });

  it('refuses to revise a version that is already superseded or withdrawn', async () => {
    q.mockResolvedValueOnce({ rows: [{ prompt_key: 'edit_felt_like_mine', withdrawn_at: null, superseded: true }] });
    expect(await addJourneyAnswer(ME, { promptKey: 'edit_felt_like_mine', answer: 'new', supersedes: ANSWER }))
      .toEqual({ ok: false, refusal: 'not_current' });
  });

  it('turns a concurrent revision of the same version into not_current, not a server error', async () => {
    q.mockResolvedValueOnce({ rows: [{ prompt_key: 'edit_felt_like_mine', withdrawn_at: null, superseded: false }] });
    qRefusal.mockResolvedValueOnce({ refused: true });
    expect(await addJourneyAnswer(ME, { promptKey: 'edit_felt_like_mine', answer: 'new', supersedes: ANSWER }))
      .toEqual({ ok: false, refusal: 'not_current' });
    expect(qRefusal.mock.calls[0][2]).toMatchObject({ fragment: 'writer_studio_journey_answers_supersedes_once' });
  });
});

describe('the founder view leaves withdrawn and superseded answers out', () => {
  it('filters both in SQL and attributes each answer', async () => {
    q.mockResolvedValueOnce({ rows: [{ ...row(), member_name: 'Andrea' }] });
    const answers = await listCurrentForFounder();
    const sql = q.mock.calls[0][0] as string;
    expect(sql).toContain('a.withdrawn_at IS NULL');
    expect(sql).toContain('NOT EXISTS (SELECT 1 FROM writer_studio_journey_answers s WHERE s.supersedes = a.id)');
    expect(answers[0]!.memberName).toBe('Andrea');
  });
});

describe('sharing to the Beta Co-Lab happens only by the writer’s explicit act, and fails closed', () => {
  it('refuses when no Beta Co-Lab channel is configured, and posts nothing', async () => {
    expect(await shareJourneyAnswer(ME, ANSWER, 'problem')).toEqual({ ok: false, refusal: 'colab_not_open' });
    expect(await colabShareAvailability(ME)).toBe('colab_not_open');
    expect(send).not.toHaveBeenCalled();
    expect(q).not.toHaveBeenCalled();
  });

  it('refuses a configured channel that belongs to no Co-Lab', async () => {
    process.env.WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID = CHANNEL;
    q.mockResolvedValueOnce({ rows: [{ team_id: null, archived_at: null }] });
    expect(await shareJourneyAnswer(ME, ANSWER, 'problem')).toEqual({ ok: false, refusal: 'colab_not_open' });
    expect(send).not.toHaveBeenCalled();
  });

  it('refuses a writer who is not a member of that Co-Lab', async () => {
    process.env.WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID = CHANNEL;
    q.mockResolvedValueOnce({ rows: [{ team_id: TEAM, archived_at: null }] });
    member.mockResolvedValueOnce(false);
    expect(await shareJourneyAnswer(ME, ANSWER, 'question')).toEqual({ ok: false, refusal: 'not_a_member' });
    expect(member).toHaveBeenCalledWith(TEAM, ME);
    expect(send).not.toHaveBeenCalled();
  });

  it('refuses to share twice, or to share a withdrawn answer', async () => {
    process.env.WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID = CHANNEL;
    q.mockResolvedValueOnce({ rows: [{ team_id: TEAM, archived_at: null }] })
      .mockResolvedValueOnce({ rows: [{ prompt_key: 'edit_felt_like_mine', answer: 'x', withdrawn_at: null, colab_message_id: 'm1', superseded: false }] });
    member.mockResolvedValueOnce(true);
    expect(await shareJourneyAnswer(ME, ANSWER, 'problem')).toEqual({ ok: false, refusal: 'already_shared' });

    q.mockResolvedValueOnce({ rows: [{ team_id: TEAM, archived_at: null }] })
      .mockResolvedValueOnce({ rows: [{ prompt_key: 'edit_felt_like_mine', answer: 'x', withdrawn_at: '2026-11-01', colab_message_id: null, superseded: false }] });
    member.mockResolvedValueOnce(true);
    expect(await shareJourneyAnswer(ME, ANSWER, 'problem')).toEqual({ ok: false, refusal: 'not_current' });
    expect(send).not.toHaveBeenCalled();
  });

  it('posts the writer’s exact words, under their own id, as the kind they chose', async () => {
    process.env.WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID = CHANNEL;
    q.mockResolvedValueOnce({ rows: [{ team_id: TEAM, archived_at: null }] })
      .mockResolvedValueOnce({ rows: [{ prompt_key: 'stuck_learning_machine', answer: 'The relationship button was hidden.', withdrawn_at: null, colab_message_id: null, superseded: false }] })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [row({ prompt_key: 'stuck_learning_machine', colab_message_id: 'm9', colab_kind: 'problem', colab_shared_at: 'now', colab_live: true })] });
    member.mockResolvedValueOnce(true);
    send.mockResolvedValueOnce({ id: 'm9' });

    const result = await shareJourneyAnswer(ME, ANSWER, 'problem');
    expect(send).toHaveBeenCalledWith(
      CHANNEL, ME, colabMessageBody('problem', 'stuck_learning_machine', 'The relationship button was hidden.'), undefined, 'build');
    expect(q.mock.calls[2][0]).toContain('colab_message_id IS NULL AND withdrawn_at IS NULL');
    expect(result).toMatchObject({ ok: true, answer: { colabKind: 'problem', colabStillShared: true } });
    expect(del).not.toHaveBeenCalled();
  });

  it('removes the copy it just posted when a double submit finds the answer already shared', async () => {
    process.env.WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID = CHANNEL;
    q.mockResolvedValueOnce({ rows: [{ team_id: TEAM, archived_at: null }] })
      .mockResolvedValueOnce({ rows: [{ prompt_key: 'stuck_learning_machine', answer: 'x', withdrawn_at: null, colab_message_id: null, superseded: false }] })
      .mockResolvedValueOnce({ rows: [], rowCount: 0 });
    member.mockResolvedValueOnce(true);
    send.mockResolvedValueOnce({ id: 'm10' });

    expect(await shareJourneyAnswer(ME, ANSWER, 'problem')).toEqual({ ok: false, refusal: 'already_shared' });
    expect(del).toHaveBeenCalledWith(CHANNEL, 'm10', ME, expect.any(String));
  });

  it('removes the copy it just posted when recording the share fails', async () => {
    process.env.WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID = CHANNEL;
    q.mockResolvedValueOnce({ rows: [{ team_id: TEAM, archived_at: null }] })
      .mockResolvedValueOnce({ rows: [{ prompt_key: 'stuck_learning_machine', answer: 'x', withdrawn_at: null, colab_message_id: null, superseded: false }] })
      .mockRejectedValueOnce(new Error('a journey answer is shared to Co-Lab at most once'));
    member.mockResolvedValueOnce(true);
    send.mockResolvedValueOnce({ id: 'm11' });

    await expect(shareJourneyAnswer(ME, ANSWER, 'problem')).rejects.toThrow('at most once');
    expect(del).toHaveBeenCalledWith(CHANNEL, 'm11', ME, expect.any(String));
  });
});

describe('withdrawing removes the answer everywhere', () => {
  it('soft-deletes any live Co-Lab copy as the author and withdraws every version of that answer', async () => {
    q.mockResolvedValueOnce({ rows: [{ prompt_key: 'edit_felt_like_mine' }] })
      .mockResolvedValueOnce({ rows: [{ channel_id: CHANNEL, message_id: 'm9' }] })
      .mockResolvedValueOnce({ rowCount: 2, rows: [] });
    del.mockResolvedValueOnce({ ok: true });

    expect(await withdrawJourneyAnswer(ME, ANSWER)).toEqual({ ok: true, withdrawn: 2 });
    expect(del).toHaveBeenCalledWith(CHANNEL, 'm9', ME, expect.stringContaining('withdrawn'));
    const update = q.mock.calls[2];
    expect(update[0]).toContain('WHERE member_id = $1 AND prompt_key = $2 AND withdrawn_at IS NULL');
    expect(update[1]).toEqual([ME, 'edit_felt_like_mine']);
  });

  it('refuses to withdraw someone else’s answer and touches nothing', async () => {
    q.mockResolvedValueOnce({ rows: [] });
    expect(await withdrawJourneyAnswer(ME, ANSWER)).toEqual({ ok: false, refusal: 'not_found' });
    expect(del).not.toHaveBeenCalled();
    expect(q).toHaveBeenCalledTimes(1);
  });
});
