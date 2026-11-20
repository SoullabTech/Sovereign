/**
 * Case study F3 (founder 2026-11-16, "Yes, build it"): the Work conversation ("Talk about the whole essay", Ask) carries the
 * Work's own rules — "MAIA asks, never rewrites" and the Studio program's posture — exactly as the editorial turn does.
 * Before this, both /ask routes applied neither; MAIA declining to rewrite in the live walk was her own judgment.
 * ⛔ These prove the rules are computed, sent last and named in provenance — not that MAIA follows them (that is the walk).
 */
jest.mock('../../../ai/structured/router', () => ({ runStructured: jest.fn() }));
jest.mock('@/lib/writersStudio/workSituation', () => ({ formatWorkSituationForPrompt: () => 'THE WORK ON THE TABLE (fixture)' }));
const query = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => query(...a) }));

import { formVocabulary } from '@/lib/writersStudio/formVocabulary';
import fs from 'node:fs';
import path from 'node:path';
import { runStructured } from '../../../ai/structured/router';
import { askMaia, workAskPromptHash, type AskContext } from '../askReader';
import { UNMEASURED } from '../staleness';
import {
  conversationProgram, conversationProgramInstructions, workQuestionsOnlyInstruction, workProgramUncertainInstruction,
  CONVERSATION_PAUSE_SQL, CONVERSATION_PROGRAM_SQL,
} from '../../editorialRuntime/workRevisionPause';
import { studioPathById } from '@/lib/writersStudio/studioPaths';

const mockRun = runStructured as jest.MockedFunction<typeof runStructured>;
const ESSAY = studioPathById('college-essay')!.studioPosture;
const postureOf = (id: string) => studioPathById(id)?.studioPosture ?? null;
beforeEach(() => { query.mockReset(); jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => jest.restoreAllMocks());

function ctx(programInstructions?: string[]): AskContext {
  return {
    kind: 'work', anchor: { on: 'work' }, staleness: UNMEASURED, sanctuary: false,
    facts: {
      work: {} as never, manuscript: { id: 'ms-1', draftId: 'd-1', version: 1 },
      sections: [{ id: 'sec-a', position: 1, heading: null }],
      locus: { sectionId: 'sec-a', label: 'Your draft', body: 'He kept losing on purpose.' },
      writerUnderstanding: '', writerCorrections: '', continuity: { structure: 'unmeasured', prose: 'unmeasured' },
    },
    ...(programInstructions ? { programInstructions } : {}),
  } as AskContext;
}
async function run(c: AskContext, question = 'Can you rewrite my last two sentences so they sound better?') {
  mockRun.mockReset();
  mockRun.mockResolvedValue({ ok: true, result: { content: [{ type: 'text', text: 'A reply.' }] as never, stopReason: 'end_turn',
    usage: { inputTokens: 1, outputTokens: 1 }, provenance: { provider: 'anthropic', model: 'm', latencyMs: 1 } } } as never);
  const out = await askMaia(c, [], question);
  expect(out.ok).toBe(true);
  return { system: mockRun.mock.calls[0]![0].system as string, hash: out.ok ? out.provenance.promptHash : null };
}

describe('what the server computes for a Work', () => {
  test('a questions-only college essay: questions-only first, then the essay posture', async () => {
    query.mockResolvedValueOnce({ rows: [{ paused: true }] }).mockResolvedValueOnce({ rows: [{ studio_path: 'college-essay' }] })
      .mockResolvedValueOnce({ rows: [{ studio_stage: 'meaning' }] });
    const c = await conversationProgram('m1', 'w1', 'ms1');
    // The stage is THIS Work's own (2026-11-16, all essay stages).
    expect(c).toEqual({ questionsOnly: true, program: { kind: 'one', id: 'college-essay' }, stage: 'meaning' });
    expect(conversationProgramInstructions(c, postureOf)).toEqual([workQuestionsOnlyInstruction(), ESSAY]);
  });

  /* Superseded 2026-11-20 (founder rulings: the writer names the form; unknown is spoken of neutrally). An ordinary Work used to
     get nothing added, which left MAIA's book-shaped defaults ("this chapter") speaking to essays and poems. */
  test('an ordinary Work with no form: MAIA is told not to assume a book, and nothing else is added', async () => {
    query.mockResolvedValueOnce({ rows: [{ paused: false }] }).mockResolvedValueOnce({ rows: [{ studio_path: null }] })
      .mockResolvedValueOnce({ rows: [{ form: null }] });
    const c = await conversationProgram('m1', 'w1', 'ms1');
    expect(c).toEqual({ questionsOnly: false, program: { kind: 'none' }, stage: null, form: null });
    const out = conversationProgramInstructions(c, postureOf);
    expect(out).toEqual([formVocabulary(null).maiaFrame]);
    expect(out[0]).toMatch(/Do not assume it is a book or speak of chapters/);
  });

  test('an ordinary Work the writer called a poem: MAIA speaks of stanzas, never chapters; the form is read for THIS member', async () => {
    query.mockResolvedValueOnce({ rows: [{ paused: false }] }).mockResolvedValueOnce({ rows: [{ studio_path: null }] })
      .mockResolvedValueOnce({ rows: [{ form: 'poem' }] });
    const c = await conversationProgram('m1', 'w1', 'ms1');
    const [sql, params] = query.mock.calls[query.mock.calls.length - 1]!;
    expect(String(sql)).toMatch(/SELECT form FROM living_works WHERE id = \$2::uuid AND member_id = \$1/);
    expect(params).toEqual(['m1', 'w1']);
    const [frame] = conversationProgramInstructions(c, postureOf);
    expect(frame).toMatch(/a poem/);
    expect(frame).toMatch(/its parts are stanzas/);
    expect(frame).toMatch(/Never call it a book or its parts chapters/);
  });

  test('an unreadable form is spoken of neutrally, never as a book', async () => {
    query.mockResolvedValueOnce({ rows: [{ paused: false }] }).mockResolvedValueOnce({ rows: [{ studio_path: null }] })
      .mockRejectedValueOnce(new Error('db down'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(conversationProgramInstructions(await conversationProgram('m1', 'w1', 'ms1'), postureOf)).toEqual([formVocabulary(null).maiaFrame]);
  });

  test('a program Work never gets the form frame: its own posture outranks it', () => {
    const out = conversationProgramInstructions({ questionsOnly: false, program: { kind: 'one', id: 'college-essay' }, form: 'poem' }, postureOf);
    expect(out).toEqual([ESSAY]);
  });

  test('an unreadable setting fails CLOSED: questions-only on, conservative posture', async () => {
    query.mockRejectedValueOnce(new Error('db down')).mockRejectedValueOnce(new Error('db down'));
    const c = await conversationProgram('m1', 'w1', 'ms1');
    expect(c).toEqual({ questionsOnly: true, program: { kind: 'unknown' }, stage: null });
    expect(conversationProgramInstructions(c, postureOf)).toEqual([workQuestionsOnlyInstruction(), workProgramUncertainInstruction()]);
  });

  test('a manuscript shared by an essay Work and an ordinary Work is ambiguous: no essay posture is assumed', async () => {
    query.mockResolvedValueOnce({ rows: [{ paused: false }] }).mockResolvedValueOnce({ rows: [{ studio_path: null }, { studio_path: 'college-essay' }] });
    expect(conversationProgramInstructions(await conversationProgram('m1', 'w1', 'ms1'), postureOf)).toEqual([workProgramUncertainInstruction()]);
  });

  test('an id the registry does not know never applies an empty posture', () => {
    expect(conversationProgramInstructions({ questionsOnly: false, program: { kind: 'one', id: 'not-registered' } }, postureOf))
      .toEqual([workProgramUncertainInstruction()]);
  });

  test('member-scoped and read-only in every predicate; this Work OR the writer’s Works holding the manuscript', () => {
    for (const sql of [CONVERSATION_PAUSE_SQL, CONVERSATION_PROGRAM_SQL]) {
      expect(sql).toContain('lw.member_id = $1');
      expect(sql).toContain('lw.id = $2::uuid');
      expect(sql).toContain("e.expression_type = 'manuscript' AND e.expression_id = $3::uuid");
      expect(sql).not.toMatch(/\b(UPDATE|INSERT|DELETE)\b/);
    }
  });
});

describe('what MAIA is given', () => {
  test('a rewrite request on a questions-only essay reaches her with both rules, LAST, after every general instruction', async () => {
    const { system } = await run(ctx([workQuestionsOnlyInstruction(), ESSAY]));
    expect(system).toContain('THE WRITER HAS CHOSEN "MAIA ASKS, NEVER REWRITES" FOR THIS WHOLE WORK');
    expect(system).toContain('If the writer asks you to rewrite');
    expect(system).toContain('never a book, chapter or manuscript');
    expect(system.trimEnd().endsWith(ESSAY)).toBe(true);
    expect(system.indexOf('MAIA ASKS, NEVER REWRITES')).toBeGreaterThan(system.indexOf('THE WORK YOU ARE SPEAKING WITH'));
  });

  test('without Work rules, the prompt and its hash are byte-identical to before', async () => {
    const { system, hash } = await run(ctx());
    expect(system).not.toContain('MAIA ASKS, NEVER REWRITES');
    expect(system).not.toContain('PROGRAM: COLLEGE ESSAY');
    expect(hash).toBe(workAskPromptHash());
  });

  test('provenance names the rules that ran', async () => {
    const rules = [workQuestionsOnlyInstruction(), ESSAY];
    const { hash } = await run(ctx(rules));
    expect(hash).toBe(workAskPromptHash(undefined, undefined, false, rules));
    expect(hash).not.toBe(workAskPromptHash());
  });
});

describe('both conversation routes are wired', () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
  test.each([
    ['app/api/sovereign/manuscripts/[id]/ask/route.ts', 'conversationProgram(memberId, built.facts.work.id'],
    ['app/api/sovereign/living-works/[id]/ask/route.ts', 'conversationProgram(memberId, workId'],
  ])('%s computes the Work rules server-side and passes them to askMaia', (file, call) => {
    const src = read(file);
    expect(src).toContain(call);
    expect(src).toContain('(id) => studioPathById(id)?.studioPosture ?? null');
    expect(src).toContain('...(programInstructions.length > 0 ? { programInstructions } : {})');
    // Never from the request body.
    expect(src).not.toMatch(/body\.programInstructions|body\.studioPath|body\.posture/);
  });
});
