/**
 * WS-DEVELOP-REFUSAL-TRUTH-OBS-01 — the falsifiers for O-1…O-6.
 *
 * The lane exists because on 2026-09-07 a member was told MAIA had failed to
 * keep to her own rules, at a moment when the system could not have known
 * whether that was true: `stopReason` was discarded one line before the
 * sentence was chosen, and nothing on the path wrote anything down.
 *
 * Nothing here asserts over a model. Every input is constructed.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  CAUSE_UNKNOWN, attributionOf, completionOf, refused,
  type DevelopmentalReaderResult,
} from '../../developmentalReader/contract';
import {
  REFUSAL_RECORD_RETENTION_DAYS, digestOf, normalizeDetail, readRecords,
  recordRefusal, sweepExpired, type RefusalRecord,
} from '../refusalRecord';
import {
  CAUSE_CONTRACT_VIOLATION, CAUSE_TRUNCATED, CAUSE_UNKNOWN_LINE,
  OUTCOME_SENTENCE, causeLine,
} from '../../../writersStudio/developRefusalCopy';

const refusalOf = (r: DevelopmentalReaderResult) =>
  r.outcome === 'refused' ? r : (() => { throw new Error('expected a refusal'); })();

/* ── O-1 · the seam's facts survive far enough to classify ───────────────── */

describe('O-1 · a truncated response and a malformed one stop being the same event', () => {
  it('reads completion from the stop reason, and refuses to guess at an unfamiliar one', () => {
    expect(completionOf('max_tokens')).toBe('truncated');
    expect(completionOf('end_turn')).toBe('complete');
    expect(completionOf('tool_use')).toBe('complete');
    expect(completionOf(null)).toBe('unknown');
    /* The one that matters for O-3: a provider may add a stop reason tomorrow.
       An unrecognised token is NOT evidence the response was whole. */
    expect(completionOf('refusal')).toBe('unknown');
    expect(completionOf('some_future_reason')).toBe('unknown');
  });

  it('distinguishes the same malformed blocks by how the response ended', () => {
    const truncated = refusalOf(refused('malformed_output', 'tool input is not an object', null, {
      ...CAUSE_UNKNOWN, completion: completionOf('max_tokens'), stopReason: 'max_tokens',
    }));
    const whole = refusalOf(refused('malformed_output', 'tool input is not an object', null, {
      ...CAUSE_UNKNOWN, completion: completionOf('tool_use'), stopReason: 'tool_use',
    }));
    /* Identical refusal, identical detail, opposite attribution. Before this
       lane these two were indistinguishable, and both were blamed on MAIA. */
    expect(truncated.refusal).toBe(whole.refusal);
    expect(truncated.cause.attribution).toBe('system');
    expect(whole.cause.attribution).toBe('contract_violation');
  });
});

describe('R-1 · the two axes are independent', () => {
  it('a proven violation stays the model\'s even when the response was cut off', () => {
    /* The case a single enum cannot express, and the reason two exist. A
       truncated response can still contain a reference that is affirmatively
       wrong — truncation removes text, it does not reorder a run\'s ids. */
    const r = refusalOf(refused('claim_unbindable', 'claims[26] run_not_as_read: refs[3] …', 26, {
      ...CAUSE_UNKNOWN, completion: 'truncated', stopReason: 'max_tokens',
    }));
    expect(r.cause.completion).toBe('truncated');
    expect(r.cause.attribution).toBe('contract_violation');
  });

  it('absence-shaped failures follow the completion; affirmative ones do not', () => {
    for (const affirmative of ['claim_unbindable', 'foreign_field', 'non_conclusion_unknown', 'read_request_attempted']) {
      expect(`${affirmative} truncated: ${attributionOf(affirmative, 'truncated')}`)
        .toBe(`${affirmative} truncated: contract_violation`);
    }
    for (const absence of ['malformed_output', 'empty_claim_text', 'non_conclusion_missing']) {
      expect(`${absence} truncated: ${attributionOf(absence, 'truncated')}`)
        .toBe(`${absence} truncated: system`);
      expect(`${absence} complete: ${attributionOf(absence, 'complete')}`)
        .toBe(`${absence} complete: contract_violation`);
    }
  });

  it('infrastructure refusals are ours by vocabulary, never by inference', () => {
    for (const sys of ['structured_inference_unavailable', 'provider_unavailable', 'not_configured', 'invalid_inference_mode', 'ceiling_exceeded']) {
      expect(`${sys}: ${attributionOf(sys, 'unknown')}`).toBe(`${sys}: system`);
    }
  });

  it('a refusal raised before the seam is honestly unknown, never complete', () => {
    /* Nothing was sent, so nothing is known. Defaulting to `complete` here
       would have manufactured a contract_violation out of an empty request. */
    const r = refusalOf(refused('recovered_integrity_failure', 'coverage records a section…'));
    expect(r.cause.completion).toBe('unknown');
    expect(r.cause.stopReason).toBeNull();
  });
});

describe('attribution has exactly one authority', () => {
  it('a caller cannot assert whose failure it was', () => {
    /* The FR-18 discipline: the guard lives in the mutation, not in a
       precheck. A cause handed in claiming `contract_violation` is overwritten
       by what the refusal and completion actually imply. */
    const r = refusalOf(refused('malformed_output', 'x', null, {
      ...CAUSE_UNKNOWN, completion: 'truncated', attribution: 'contract_violation',
    }));
    expect(r.cause.attribution).toBe('system');
  });
});

/* ── O-2, O-3 · what the member is told ──────────────────────────────────── */

describe('O-2 · the member is never told MAIA broke a rule', () => {
  it('the outcome sentence names no culprit at all', () => {
    expect(OUTCOME_SENTENCE).toBe(
      'This reading could not be completed, so nothing was kept. Your work has not changed.');
    for (const word of ['MAIA', 'her ', 'she ']) {
      expect(`outcome names ${word.trim()}: ${OUTCOME_SENTENCE.includes(word)}`)
        .toBe(`outcome names ${word.trim()}: false`);
    }
  });

  it('no pair of axes produces copy that attributes fault to MAIA', () => {
    const completions = [undefined, 'complete', 'truncated', 'unknown'] as const;
    const attributions = [undefined, 'contract_violation', 'system', 'unknown'] as const;
    for (const completion of completions) {
      for (const attribution of attributions) {
        const line = causeLine({ completion, attribution });
        const text = `${OUTCOME_SENTENCE} ${line ?? ''}`;
        expect(`${completion}/${attribution} blames MAIA: ${/MAIA|\bshe\b|\bher\b/i.test(text)}`)
          .toBe(`${completion}/${attribution} blames MAIA: false`);
      }
    }
  });
});

describe('O-3 · an unknown cause is named as unknown', () => {
  it('says so rather than choosing a side', () => {
    expect(causeLine({ completion: 'unknown', attribution: 'unknown' })).toBe(CAUSE_UNKNOWN_LINE);
    /* The inverse defect: never claim truncation on a guess. */
    expect(causeLine({ completion: 'unknown', attribution: 'unknown' })).not.toBe(CAUSE_TRUNCATED);
  });

  it('says nothing at all when there are no axes — silence over invention', () => {
    expect(causeLine({})).toBeNull();
  });

  it('names the two causes it can prove', () => {
    expect(causeLine({ attribution: 'contract_violation', completion: 'complete' }))
      .toBe(CAUSE_CONTRACT_VIOLATION);
    expect(causeLine({ attribution: 'system', completion: 'truncated' })).toBe(CAUSE_TRUNCATED);
    /* Proven violation outranks the token boundary — R-1 again, in the copy. */
    expect(causeLine({ attribution: 'contract_violation', completion: 'truncated' }))
      .toBe(CAUSE_CONTRACT_VIOLATION);
  });
});

/* ── O-5 · no model-supplied value is persisted ──────────────────────────── */

describe('O-5 · the record carries diagnostics, never content', () => {
  it('keeps the machine-shaped facts out of a detail sentence', () => {
    expect(normalizeDetail('claims[26] run_not_as_read: refs[3] is not a contiguous run of the topology as read'))
      .toEqual({ detailKind: 'run_not_as_read', claimIndex: 26, refIndex: 3 });
  });

  it('carries NOTHING across from a detail that embeds prose', () => {
    /* The corrected O-5. An earlier draft would have persisted this detail
       length-bounded; a hundred characters of a member's book is still a
       member's book. Truncation is not redaction. */
    const prose = 'claims[4] carries "the lantern returns, at last, and the thread is whole" which is not in the vocabulary';
    const n = normalizeDetail(prose);
    expect(n.claimIndex).toBe(4);
    expect(n.detailKind).toBeNull();
    expect(JSON.stringify(n)).not.toContain('lantern');
    expect(JSON.stringify(n)).not.toContain('thread');
  });

  it('cannot mistake a sentence fragment for a vocabulary code', () => {
    expect(normalizeDetail('claims[1] the model said something entirely else: here').detailKind).toBeNull();
  });

  it('digests an untrusted value instead of storing it', () => {
    const d = digestOf('a section id the model invented');
    expect(d).toMatch(/^[0-9a-f]{16}$/);
    expect(d).not.toContain('section');
  });
});

/* ── O-4, R-3 · the operator record ──────────────────────────────────────── */

describe('O-4 · a refusal is reconstructable after every browser is closed', () => {
  const dir = path.join(os.tmpdir(), `refusal-record-${process.pid}-${Math.random().toString(16).slice(2)}`);
  const original = process.env.AUDIT_LOG_DIR;
  beforeAll(() => { process.env.AUDIT_LOG_DIR = dir; });
  afterAll(async () => {
    if (original === undefined) delete process.env.AUDIT_LOG_DIR;
    else process.env.AUDIT_LOG_DIR = original;
    await fs.rm(dir, { recursive: true, force: true });
  });

  const record = (over: Partial<RefusalRecord> = {}): RefusalRecord => ({
    timestamp: '2026-09-08T01:00:00.000Z',
    manuscriptId: 'm-1', lens: 'development', stage: 'read', refusal: 'claim_unbindable',
    detailKind: 'run_not_as_read', claimIndex: 26, refIndex: 3,
    completion: 'complete', attribution: 'contract_violation', stopReason: 'tool_use',
    inputTokens: 96_000, outputTokens: 4_200,
    readerVersion: 'DEVELOPMENTAL-READER-05', promptHash: 'abc', ...over,
  });

  it('writes the production shape and reads it back', async () => {
    await recordRefusal(record());
    const back = await readRecords('2026-09-08');
    expect(back).toHaveLength(1);
    /* The whole point: the claim index and the inner code — the two facts it
       took three attempts and a Network tab to recover on 2026-09-07. */
    expect(back[0].claimIndex).toBe(26);
    expect(back[0].detailKind).toBe('run_not_as_read');
    expect(back[0].attribution).toBe('contract_violation');
  });

  it('never throws, whatever the filesystem does', async () => {
    const saved = process.env.AUDIT_LOG_DIR;
    /* A directory path that cannot exist: a regular FILE stands where a parent
       directory would have to be, so mkdir fails ENOTDIR immediately. Portable
       and instant — unlike an unwritable system path, whose behaviour differs
       per kernel and sandbox.

       An operator log that can take a member's refusal down with it has
       inverted the priority it exists to serve. */
    const blocker = path.join(dir, 'blocker');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(blocker, 'a file, not a directory');
    process.env.AUDIT_LOG_DIR = path.join(blocker, 'nested');
    await expect(recordRefusal(record())).resolves.toBeUndefined();
    process.env.AUDIT_LOG_DIR = saved;
  });

  it('R-3 · an expired day is removed even though no later refusal ever occurs', async () => {
    const old = '2026-08-01';
    await fs.mkdir(path.join(dir, 'develop-refusals'), { recursive: true });
    const oldFile = path.join(dir, 'develop-refusals', `refusals-${old}.jsonl`);
    await fs.writeFile(oldFile, `${JSON.stringify(record({ timestamp: `${old}T00:00:00.000Z` }))}\n`);

    /* ⛔ THE POINT OF THIS TEST. Nothing is written before the sweep. Retention
       that only runs when the next failure happens is not retention — a quiet
       month would keep its records forever precisely because nothing broke. */
    const { removed } = await sweepExpired(new Date('2026-09-08T00:00:00.000Z'));
    expect(removed).toContain(`refusals-${old}.jsonl`);
    await expect(fs.access(oldFile)).rejects.toBeTruthy();
    expect(await readRecords(old)).toEqual([]);
  });

  it('keeps a day inside the window, including the boundary day itself', async () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    const boundary = new Date(now.getTime() - REFUSAL_RECORD_RETENTION_DAYS * 86_400_000)
      .toISOString().slice(0, 10);
    const file = path.join(dir, 'develop-refusals', `refusals-${boundary}.jsonl`);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${JSON.stringify(record({ timestamp: `${boundary}T00:00:00.000Z` }))}\n`);
    const { removed } = await sweepExpired(now);
    expect(removed).not.toContain(`refusals-${boundary}.jsonl`);
    await fs.rm(file, { force: true });
  });

  it('ignores files it did not write, and a missing directory is not an error', async () => {
    const stray = path.join(dir, 'develop-refusals', 'notes.txt');
    await fs.writeFile(stray, 'not ours');
    expect((await sweepExpired(new Date('2030-01-01T00:00:00.000Z'))).removed).not.toContain('notes.txt');
    await fs.rm(stray, { force: true });

    const saved = process.env.AUDIT_LOG_DIR;
    process.env.AUDIT_LOG_DIR = path.join(os.tmpdir(), `refusal-none-${process.pid}-${Math.random().toString(16).slice(2)}`);
    expect((await sweepExpired()).removed).toEqual([]);
    process.env.AUDIT_LOG_DIR = saved;
  });
});
