/**
 * BUILD-07E · Blocker A — reopening resumes from the STORE.
 *
 * The decision is tested directly because it is a pure function; the room is
 * tested structurally, because what matters about it is which calls it makes
 * and which it refuses to make. The end-to-end sequence — ask, close, reopen,
 * ask again, still one `ask_thread` — is W6 of the founder walk and is proved
 * on a deployed runtime, not here. This file makes the walk's failure modes
 * unreachable; it does not stand in for the walk.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  resumeDecision, threadChoiceLabel, type ThreadSummary,
} from '../observationDialogueResume';

const t = (id: string, openedAt: string, turnCount = 2): ThreadSummary =>
  ({ id, openedAt, turnCount });

describe('the resume decision', () => {
  it('no prior conversation → fresh', () => {
    expect(resumeDecision([])).toEqual({ kind: 'fresh' });
  });

  it('exactly one → resume it; there is nothing to choose', () => {
    expect(resumeDecision([t('th-1', '2026-09-05T10:00:00Z')]))
      .toEqual({ kind: 'resume', threadId: 'th-1' });
  });

  it('more than one → the WRITER chooses; the room never picks', () => {
    const many = [t('th-2', '2026-09-05T12:00:00Z'), t('th-1', '2026-09-05T10:00:00Z')];
    const d = resumeDecision(many);
    expect(d.kind).toBe('choose');
    if (d.kind === 'choose') expect(d.threads).toEqual(many);
  });

  it('NEVER silently resumes the newest when there are several', () => {
    /* The rule the founder forbade, asserted as its absence: with two threads
       the answer is not `resume`, however tempting `threads[0]` is. */
    const d = resumeDecision([t('newest', '2026-09-05T12:00:00Z'), t('older', '2026-09-01T09:00:00Z')]);
    expect(d.kind).not.toBe('resume');
    expect(JSON.stringify(d)).not.toContain('"threadId"');
  });

  it('drops none of them — many threads per anchor stay lawful', () => {
    const five = ['a', 'b', 'c', 'd', 'e'].map((id, i) => t(id, `2026-09-0${i + 1}T00:00:00Z`));
    const d = resumeDecision(five);
    if (d.kind === 'choose') expect(d.threads.map((x) => x.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
    else throw new Error('five threads must be a choice');
  });

  it('offers a thread by when and how long, never by its id', () => {
    const label = threadChoiceLabel(t('5bfdd360-4124-44ce-a6d3-37286bbe816b', '2026-09-05T10:00:00Z', 1),
      () => 'two hours ago');
    expect(label).toBe('two hours ago · 1 turn');
    expect(label).not.toContain('5bfdd360');
  });
});

describe('the room performs the decision rather than remembering', () => {
  const SRC = readFileSync(
    join(__dirname, '..', '..', '..', 'app', 'writers-studio', 'develop', 'ObservationDialogue.tsx'),
    'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('asks the store which threads exist on this anchor, on mount', () => {
    expect(SRC).toContain('threadsOn(manuscriptId');
    expect(SRC).toContain("on: 'observation'");
  });

  it('loads the thread it is told about — summaries alone are not resuming', () => {
    expect(SRC).toContain('loadThread(manuscriptId');
  });

  it('routes every reopen through resumeDecision, not through its own rule', () => {
    expect(SRC).toContain('resumeDecision(');
    /* No hand-rolled selection beside it: no sort, no newest-first index. */
    expect(SRC).not.toMatch(/\.sort\(/);
    expect(SRC).not.toMatch(/found\s*\[\s*0\s*\]/);
    expect(SRC).not.toMatch(/threads\s*\[\s*0\s*\]/);
  });

  it('refuses to send before the store has answered', () => {
    /* Otherwise a fast question posts an anchor and opens a SECOND thread
       beside the one the room was about to resume. */
    expect(SRC).toMatch(/decision === null \|\| decision\.kind === 'choose'/);
  });

  it('prefers an adopted threadId over the anchor when asking again', () => {
    expect(SRC).toMatch(/threadId\s*\n?\s*\?\s*\{ threadId \}/);
  });

  it('does not lift the thread into the parent — the parent holds only open/closed', () => {
    const ROOM = readFileSync(
      join(__dirname, '..', '..', '..', 'app', 'writers-studio', 'develop', 'DevelopRoom.tsx'), 'utf8');
    expect(ROOM).not.toContain('threadId');
    expect(ROOM).toContain('setTalking');
  });

  it('reads once when it opens: no timer, no refetch on focus or visibility', () => {
    expect(SRC).not.toMatch(/setInterval|setTimeout|visibilitychange|addEventListener\(\s*'focus'/);
  });
});
