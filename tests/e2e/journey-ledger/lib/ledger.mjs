/**
 * THE JOURNEY LEDGER
 *
 * A scripted persona walks the real product in a browser. Every step of that walk ends in exactly one of three states:
 *
 *   PASS      it was exercised, and what it led to was rendered, with evidence.
 *   DEAD END  it was exercised, and it led nowhere (blank page, 4xx/5xx, dead link, nothing happened).
 *   NOT RUN   it was NOT exercised, or could not be decided (the script stopped, a model was needed, the browser failed).
 *
 * THE RULE (enforced in `decide`, the single place the word "works" can come from):
 *
 *   A journey "works" (exit code 0) only if it has at least one row, every row is PASS, AND the walk did not stop on a harness error.
 *   Any DEAD END or NOT RUN row, an empty ledger, or a walk that crashed means it does NOT work and the exit code is non-zero.
 *
 * Unobservable is not pass: a row the script never reached, or could not decide, stays NOT RUN. It is never defaulted
 * to PASS, and a crash in the middle of a walk cannot produce a green report because every planned row starts NOT RUN.
 * A crash AFTER the last planned row went PASS leaves no NOT RUN row to say so, which is why the crash is its own signal to
 * `decide`: the rows of a walk that stopped are not the whole walk, whatever they say.
 *
 * No browser, no product code in this file: it is the bookkeeping, so the rule can be tested on its own
 * (ledger.test.mjs, including deliberately wrong rules that the tests must catch).
 */

export const PASS = 'PASS';
export const DEAD_END = 'DEAD END';
export const NOT_RUN = 'NOT RUN';
export const STATUSES = Object.freeze([PASS, DEAD_END, NOT_RUN]);

/**
 * The ONE decision. Pure. Nothing else in the harness may decide that a journey works.
 * `signals.harnessError` is a string (possibly empty: some things are thrown without a message) when the walk stopped on a
 * harness error, and absent otherwise. Any string at all means the rows are not the whole walk.
 */
export function decide(rows, signals = {}) {
  const counts = { PASS: 0, 'DEAD END': 0, 'NOT RUN': 0 };
  for (const r of rows) counts[r.status] += 1;
  const crash = typeof signals.harnessError === 'string' ? 'the walk stopped on a harness error, so its rows are not the whole walk' : '';
  if (rows.length === 0) return { works: false, counts, reason: [crash, 'the ledger has no rows, so nothing was exercised'].filter(Boolean).join(' and ') };
  if (!crash && counts['DEAD END'] === 0 && counts['NOT RUN'] === 0) {
    return { works: true, counts, reason: `all ${rows.length} rows are PASS` };
  }
  const parts = [];
  if (crash) parts.push(crash);
  if (counts['DEAD END']) parts.push(`${counts['DEAD END']} DEAD END`);
  if (counts['NOT RUN']) parts.push(`${counts['NOT RUN']} NOT RUN`);
  return { works: false, counts, reason: parts.join(' and ') };
}

const cell = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().replace(/\|/g, '\\|');

export class Ledger {
  constructor({ journey, persona, meta = {}, decide: decideFn = decide } = {}) {
    this.journey = journey;
    this.persona = persona;
    this.meta = meta;
    this.rows = [];
    this._decide = decideFn;
    this.notes = [];
    this.harnessError = null;
  }

  /**
   * The walk itself stopped on a harness error (not a finding about the product). decide() reads it: a crash after the last
   * planned row went PASS leaves no NOT RUN row behind, and must still not read as "works". Whatever was thrown, even nothing, counts.
   */
  fail(e) {
    const m = e && e.message ? e.message : e;
    this.harnessError = String(m ?? 'unknown error').split('\n')[0].slice(0, 300);
    return this;
  }

  /** Declare a row BEFORE it runs. It starts NOT RUN, so a script that never reaches it cannot go green. */
  plan(id, title) {
    if (this.rows.some(r => r.id === id)) throw new Error(`duplicate row id ${id}`);
    this.rows.push({ id, title, status: NOT_RUN, evidence: 'planned, not exercised' });
    return this;
  }

  /** Insert a row directly after `afterId` (per-control rows discovered while the walk runs). */
  addAfter(afterId, id, title) {
    if (this.rows.some(r => r.id === id)) throw new Error(`duplicate row id ${id}`);
    const i = this.rows.findIndex(r => r.id === afterId);
    if (i < 0) throw new Error(`unknown row ${afterId}`);
    this.rows.splice(i + 1, 0, { id, title, status: NOT_RUN, evidence: 'planned, not exercised' });
    return this;
  }

  /** A row ends exactly once, in one of three states, with evidence. */
  settle(id, status, evidence) {
    const row = this.rows.find(r => r.id === id);
    if (!row) throw new Error(`unknown row ${id}`);
    if (!STATUSES.includes(status)) throw new Error(`unknown status ${JSON.stringify(status)} for row ${id}`);
    if (row.settled) throw new Error(`row ${id} already ended as ${row.status}`);
    if (typeof evidence !== 'string' || evidence.trim() === '') {
      throw new Error(`row ${id}: ${status} needs evidence (what was seen, or why it could not be decided)`);
    }
    row.status = status;
    row.evidence = evidence;
    row.settled = true;
    return this;
  }

  /**
   * Run one planned row. `fn` returns { status, evidence }. If it THROWS, the row could not be decided: it stays NOT RUN
   * with the error as its reason (an infrastructure failure is not a finding about the product), and the error is rethrown
   * so the walk stops and every later planned row stays NOT RUN.
   */
  async step(id, fn) {
    try {
      const out = await fn();
      this.settle(id, out.status, out.evidence);
      return out;
    } catch (e) {
      const row = this.rows.find(r => r.id === id);
      if (row && !row.settled) {
        row.evidence = `could not be decided: ${String(e && e.message ? e.message : e).split('\n')[0].slice(0, 300)}`;
        row.settled = true;
      }
      throw e;
    }
  }

  note(text) { this.notes.push(String(text)); }

  /** works/reason come from the one rule; the counts are plain bookkeeping taken from the rows themselves. */
  verdict() {
    const counts = { PASS: 0, 'DEAD END': 0, 'NOT RUN': 0 };
    for (const r of this.rows) counts[r.status] += 1;
    const d = this._decide(this.rows, { harnessError: this.harnessError });
    return { works: d.works === true, reason: d.reason, counts };
  }
  exitCode() { return this.verdict().works ? 0 : 1; }

  /** The report derives its verdict from verdict() and from nothing else. */
  renderMarkdown() {
    const v = this.verdict();
    const { counts } = v;
    const lines = [];
    lines.push(`# Journey ledger: ${this.journey} / ${this.persona}`);
    lines.push('');
    lines.push(v.works ? 'VERDICT: works' : `VERDICT: does NOT work (${v.reason})`);
    lines.push('');
    lines.push(`Rows: ${this.rows.length} (PASS ${counts.PASS}, DEAD END ${counts['DEAD END']}, NOT RUN ${counts['NOT RUN']})`);
    for (const [k, val] of Object.entries(this.meta)) lines.push(`${k}: ${val}`);
    lines.push('');
    lines.push('| Row | Step | Status | Evidence |');
    lines.push('| --- | --- | --- | --- |');
    for (const r of this.rows) lines.push(`| ${cell(r.id)} | ${cell(r.title)} | ${r.status} | ${cell(r.evidence)} |`);
    if (this.notes.length) {
      lines.push('');
      lines.push('## Notes');
      for (const n of this.notes) lines.push(`- ${cell(n)}`);
    }
    lines.push('');
    return lines.join('\n');
  }
}

/**
 * Run a persona script against a ledger and ALWAYS write the report. The exit code comes only from the ledger.
 * A throw from the script is recorded as a harness error (ledger.fail, which decide() reads) and as a note; rows it never reached
 * stay NOT RUN, and even if it had reached them all, the verdict is not "works".
 */
export async function runPersona(ledger, script, { writeReport }) {
  try {
    await script(ledger);
  } catch (e) {
    ledger.fail(e);
    ledger.note(`the walk stopped on a harness error: ${String(e && e.stack ? e.stack : e).split('\n').slice(0, 3).join(' / ')}`);
  }
  writeReport(ledger.renderMarkdown());
  return ledger.exitCode();
}
