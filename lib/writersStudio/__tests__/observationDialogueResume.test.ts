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
  resumeDecision, sendMode, threadChoiceLabel,
  type ResumeDecision, type ThreadSummary,
} from '../observationDialogueResume';

const t = (id: string, openedAt: string, turnCount = 2): ThreadSummary =>
  ({ id, openedAt, turnCount });
const found = (...threads: ThreadSummary[]) => ({ kind: 'threads' as const, threads });

describe('the resume decision', () => {
  it('discovery SUCCEEDED and found none → fresh', () => {
    expect(resumeDecision(found())).toEqual({ kind: 'fresh' });
  });

  it('exactly one → resume it; there is nothing to choose', () => {
    expect(resumeDecision(found(t('th-1', '2026-09-05T10:00:00Z'))))
      .toEqual({ kind: 'resume', threadId: 'th-1' });
  });

  it('more than one → the WRITER chooses; the room never picks', () => {
    const many = [t('th-2', '2026-09-05T12:00:00Z'), t('th-1', '2026-09-05T10:00:00Z')];
    const d = resumeDecision(found(...many));
    expect(d.kind).toBe('choose');
    if (d.kind === 'choose') expect(d.threads).toEqual(many);
  });

  it('NEVER silently resumes the newest when there are several', () => {
    /* The rule the founder forbade, asserted as its absence: with two threads
       the answer is not `resume`, however tempting `threads[0]` is. */
    const d = resumeDecision(found(t('newest', '2026-09-05T12:00:00Z'), t('older', '2026-09-01T09:00:00Z')));
    expect(d.kind).not.toBe('resume');
    expect(JSON.stringify(d)).not.toContain('"threadId"');
  });

  it('drops none of them — many threads per anchor stay lawful', () => {
    const five = ['a', 'b', 'c', 'd', 'e'].map((id, i) => t(id, `2026-09-0${i + 1}T00:00:00Z`));
    const d = resumeDecision(found(...five));
    if (d.kind === 'choose') expect(d.threads.map((x) => x.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
    else throw new Error('five threads must be a choice');
  });

  it('DISCOVERY FAILURE IS NOT "none" — it never rounds to fresh', () => {
    /* The race the founder found: a transient GET failure that reads as "no
       earlier conversations" lets the next question OPEN one beside an existing
       thread. Unknown is its own state, all the way through. */
    for (const reason of ['http_500', 'http_401', 'unreachable', 'malformed']) {
      const d = resumeDecision({ kind: 'unavailable', reason });
      expect(d).toEqual({ kind: 'unavailable', reason });
      expect(d.kind).not.toBe('fresh');
    }
  });
});

describe('sendability — the permission and the payload are one answer', () => {
  const resume = (id: string): ResumeDecision => ({ kind: 'resume', threadId: id });

  it('THE ADOPTION WINDOW: decided to resume, not yet loaded → BLOCKED', () => {
    /* The exact race: `decision` flips to resume, `adopt()` has not returned, so
       `threadId` is still null. Falling through to the anchor path here opens a
       second thread. This is the case the whole function exists for. */
    expect(sendMode(resume('th-1'), null)).toEqual({ kind: 'blocked', why: 'adopting' });
  });

  it('and the same window after the writer picks one of several', () => {
    expect(sendMode(resume('th-picked'), null)).toEqual({ kind: 'blocked', why: 'adopting' });
  });

  it('resume with the thread adopted → send by threadId', () => {
    expect(sendMode(resume('th-1'), 'th-1')).toEqual({ kind: 'resume', threadId: 'th-1' });
  });

  it('fresh and nothing adopted → opening by anchor is lawful', () => {
    expect(sendMode({ kind: 'fresh' }, null)).toEqual({ kind: 'open' });
  });

  it('fresh but a thread has since been opened → continue it, never open again', () => {
    expect(sendMode({ kind: 'fresh' }, 'th-new')).toEqual({ kind: 'resume', threadId: 'th-new' });
  });

  it('still discovering → BLOCKED', () => {
    expect(sendMode(null, null)).toEqual({ kind: 'blocked', why: 'discovering' });
  });

  it('discovery unavailable → BLOCKED, even with nothing adopted', () => {
    expect(sendMode({ kind: 'unavailable', reason: 'http_500' }, null))
      .toEqual({ kind: 'blocked', why: 'unavailable' });
  });

  it('a choice open → BLOCKED', () => {
    expect(sendMode({ kind: 'choose', threads: [t('a', 'x'), t('b', 'y')] }, null))
      .toEqual({ kind: 'blocked', why: 'choosing' });
  });

  it('the SHIPPED rule at 982ff9fce would have opened by anchor in that window', () => {
    /* DEFECT WITNESS, pinned rather than left in a transcript.
       `982ff9fce` guarded with `decision === null || decision.kind === 'choose'`
       and then chose its payload with `threadId ? { threadId } : { anchor }`.
       Reconstructed here EXACTLY, it permits the send and picks the anchor in
       the adopting window — which is the duplicate thread. Keeping the two rules
       side by side is what makes the repair a difference and not an assertion. */
    const shipped = (decision: ResumeDecision | null, threadId: string | null) => {
      if (decision === null || decision.kind === 'choose') return 'blocked';
      return threadId ? 'resume' : 'open';
    };
    expect(shipped(resume('th-1'), null)).toBe('open');
    expect(sendMode(resume('th-1'), null)).toEqual({ kind: 'blocked', why: 'adopting' });

    /* And the discovery-failure path, which at 982ff9fce could not even be
       represented: `threadsOn` returned [] and `resumeDecision([])` was `fresh`. */
    const shippedAfterFailedDiscovery = shipped({ kind: 'fresh' }, null);
    expect(shippedAfterFailedDiscovery).toBe('open');
    expect(sendMode({ kind: 'unavailable', reason: 'http_500' }, null))
      .toEqual({ kind: 'blocked', why: 'unavailable' });
  });

  it('NO state opens by anchor except a successful, empty discovery', () => {
    /* Exhaustive over the decision space: `open` is reachable from exactly one
       combination, so no future state can quietly acquire the ability to write
       a new thread. */
    const states: [ResumeDecision | null, string | null][] = [
      [null, null], [null, 'th'],
      [{ kind: 'unavailable', reason: 'r' }, null], [{ kind: 'unavailable', reason: 'r' }, 'th'],
      [{ kind: 'choose', threads: [t('a', 'x'), t('b', 'y')] }, null],
      [{ kind: 'choose', threads: [t('a', 'x'), t('b', 'y')] }, 'th'],
      [resume('th-1'), null], [resume('th-1'), 'th-1'],
      [{ kind: 'fresh' }, 'th-new'],
    ];
    for (const [d, id] of states) {
      expect(`${JSON.stringify(d)}/${id}: ${sendMode(d, id).kind}`)
        .not.toBe(`${JSON.stringify(d)}/${id}: open`);
    }
    expect(sendMode({ kind: 'fresh' }, null).kind).toBe('open');
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

  it('takes BOTH the permission and the payload from one sendMode call', () => {
    /* Two rules would be two chances to disagree, and the disagreement writes a
       row. The guard and the anchor/threadId choice must read the same answer. */
    expect(SRC).toContain('const mode = sendMode(decision, threadId)');
    expect(SRC).toMatch(/if \(!q \|\| busy \|\| mode\.kind === 'blocked'\) return;/);
    expect(SRC).toMatch(/mode\.kind === 'resume'\s*\n?\s*\?\s*\{ threadId: mode\.threadId \}/);
  });

  it('never re-derives sendability beside sendMode', () => {
    /* The old inline guard and the old inline ternary, forbidden by name so a
       revert cannot reintroduce them quietly. */
    expect(SRC).not.toMatch(/decision === null \|\| decision\.kind === 'choose'/);
    expect(SRC).not.toMatch(/\.\.\.\(threadId\s*\n?\s*\?\s*\{ threadId \}/);
  });

  it('routes discovery failure through the decision, never through an empty list', () => {
    expect(SRC).toContain('resumeDecision(discovery)');
    expect(SRC).toContain('data-dialogue-unavailable');
  });

  it('adds no act that creates a second thread on one observation', () => {
    /* Several threads on one observation are lawful HISTORY. 07E was not
       authorised to add the act that makes them, and a chooser offering "start
       another" would be exactly that act. */
    expect(SRC).not.toContain('data-dialogue-choose-new');
    expect(SRC).not.toMatch(/start a new conversation/i);
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
