/**
 * WS-DEVELOP-REFUSAL-TRUTH-OBS-01 · R-3 — falsifiers for the retention caller.
 *
 * The founder's ratified acceptance is exactly three claims: the CLI actually
 * invokes the sweep, it exits successfully on a lawful empty or missing
 * directory, and it exits NON-ZERO on a genuine sweep failure. The third is the
 * one that matters — a retention job that exits 0 while records remain is
 * indistinguishable from a retention job that works, and cron will never tell
 * anyone the difference.
 *
 * ⛔ Nothing here asserts over a model. Every input is constructed.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runSweep, type SweepSink } from '../sweepRefusalRecords';

const NOW = new Date('2026-09-08T12:00:00.000Z');

/** Older than the seven-day window, by the file's own day. */
const EXPIRED = 'refusals-2026-08-20.jsonl';
const FRESH = 'refusals-2026-09-07.jsonl';

let root: string;
let sink: SweepSink & { lines: string[]; errors: string[] };

const makeSink = () => {
  const lines: string[] = [];
  const errors: string[] = [];
  return { lines, errors, log: (l: string) => lines.push(l), error: (l: string) => errors.push(l) };
};

const payloadOf = (line: string) =>
  JSON.parse(line.slice(line.indexOf('{'))) as Record<string, unknown>;

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'sweep-cli-'));
  process.env.AUDIT_LOG_DIR = root;
  sink = makeSink();
});

afterEach(async () => {
  delete process.env.AUDIT_LOG_DIR;
  await fs.rm(root, { recursive: true, force: true });
});

describe('retention CLI', () => {
  it('actually invokes the sweep: an expired file is gone and counted', async () => {
    const dir = path.join(root, 'develop-refusals');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, EXPIRED), '{}\n', 'utf-8');
    await fs.writeFile(path.join(dir, FRESH), '{}\n', 'utf-8');

    const code = await runSweep(NOW, sink);

    expect(code).toBe(0);
    expect(await fs.readdir(dir)).toEqual([FRESH]);
    const p = payloadOf(sink.lines[0]);
    expect(p.outcome).toBe('ok');
    expect(p.removed_count).toBe(1);
    expect(p.cutoff_day).toBe('2026-09-01');
    expect(typeof p.duration_ms).toBe('number');
  });

  it('exits 0 when the directory has never been written', async () => {
    const code = await runSweep(NOW, sink);
    expect(code).toBe(0);
    expect(payloadOf(sink.lines[0])).toMatchObject({ outcome: 'ok', removed_count: 0 });
    expect(sink.errors).toEqual([]);
  });

  it('exits 0 on an empty directory', async () => {
    await fs.mkdir(path.join(root, 'develop-refusals'), { recursive: true });
    const code = await runSweep(NOW, sink);
    expect(code).toBe(0);
    expect(payloadOf(sink.lines[0]).removed_count).toBe(0);
  });

  it('⭐ exits NON-ZERO on a genuine sweep failure, and says nothing succeeded', async () => {
    /* The refusal directory exists as a FILE. readdir then fails with ENOTDIR —
       a real fault, not ENOENT — which the sweep must raise rather than report
       as an empty directory. Chosen over a permissions fault deliberately: a
       test running as root would bypass a chmod and pass while proving nothing. */
    await fs.writeFile(path.join(root, 'develop-refusals'), 'not a directory', 'utf-8');

    const code = await runSweep(NOW, sink);

    expect(code).toBe(1);
    expect(sink.lines).toEqual([]);
    const p = payloadOf(sink.errors[0]);
    expect(p.outcome).toBe('failed');
    expect(p.reason).toBe('ENOTDIR');
  });

  it('never logs a filename, a record body, or an error message', async () => {
    const dir = path.join(root, 'develop-refusals');
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, EXPIRED),
      `${JSON.stringify({ manuscriptId: 'm-secret', detailKind: 'run_not_as_read' })}\n`,
      'utf-8',
    );

    await runSweep(NOW, sink);

    const all = [...sink.lines, ...sink.errors].join('\n');
    expect(all).not.toContain(EXPIRED);
    expect(all).not.toContain('m-secret');
    expect(all).not.toContain('run_not_as_read');
    expect(all).not.toContain(root);
    /* The ratified success line carries exactly these four facts. */
    expect(Object.keys(payloadOf(sink.lines[0])).sort())
      .toEqual(['cutoff_day', 'duration_ms', 'outcome', 'removed_count']);
  });
});
