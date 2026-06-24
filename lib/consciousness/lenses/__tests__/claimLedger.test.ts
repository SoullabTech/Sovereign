import { readFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * Status-cannot-exceed-receipt — the first Earth-turn enforcement for the Air-inquiry Claim Ledger
 * (docs/lenses/CLAIM_LEDGER_2026-06-07.md).
 *
 * A ledger remembers status; it cannot change it. This test is the *room*: it judges the STATUS
 * ASSIGNMENT, not the claim. A row may say "narrated" while pointing only at the transcript — that is
 * honest. A row may NOT claim a settled status (falsified / tested-scoped / enforced / frozen-spec)
 * while pointing only at the transcript, or at nothing. That is narrated-becoming-established by
 * atmosphere — and here it is a build failure, not a discussion.
 *
 * It is built to be able to FAIL: `findDrift` is exercised on a synthetic drifted row, not only on the
 * real ledger — because a constraint that cannot say no is the warm room with extra steps.
 */
export interface LedgerRow {
  claim: string;
  status: string;
  receipt: string;
  refutedIf: string;
}

const SETTLED = /\b(falsified|tested-scoped|enforced|frozen-spec)\b/i;
const RECEIPTLESS = /^\s*(none|n\/?a|—|-|)\s*$/i;
const TRANSCRIPT_ONLY = /transcript only|^\s*transcript\s*$/i;

/** Pure: rows whose status claims more than "narrated" while the receipt is the transcript or nothing. */
export function findDrift(rows: LedgerRow[]): LedgerRow[] {
  return rows.filter(
    (r) => SETTLED.test(r.status) && (RECEIPTLESS.test(r.receipt) || TRANSCRIPT_ONLY.test(r.receipt)),
  );
}

const NAMES_NO_REFUSAL = /^\s*(none|n\/?a|—|-|tbd|)\s*$/i;

/** Pure: rows that name no possible refusal — poetry/vision, not yet inquiry, whatever their status. */
export function findUnfalsifiable(rows: LedgerRow[]): LedgerRow[] {
  return rows.filter((r) => NAMES_NO_REFUSAL.test(r.refutedIf));
}

function parseLedger(md: string): LedgerRow[] {
  const rows: LedgerRow[] = [];
  let iClaim = -1;
  let iStatus = -1;
  let iReceipt = -1;
  let iRefuted = -1;
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('|')) continue;
    if (/^\|[\s|:\-]+\|?$/.test(line)) continue; // table separator row
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (iStatus === -1) {
      iClaim = cells.findIndex((c) => /claim/i.test(c));
      iStatus = cells.findIndex((c) => /status/i.test(c));
      iReceipt = cells.findIndex((c) => /receipt/i.test(c));
      iRefuted = cells.findIndex((c) => /refuted/i.test(c));
      continue; // header row
    }
    rows.push({
      claim: cells[iClaim] ?? '',
      status: cells[iStatus] ?? '',
      receipt: cells[iReceipt] ?? '',
      refutedIf: cells[iRefuted] ?? '',
    });
  }
  return rows;
}

function resolveLedger(): string {
  const candidates = [
    path.join(process.cwd(), 'docs/lenses/CLAIM_LEDGER_2026-06-07.md'),
    path.join(__dirname, '../../../../docs/lenses/CLAIM_LEDGER_2026-06-07.md'),
  ];
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

const LEDGER = resolveLedger();

describe('status-cannot-exceed-receipt — the room that fails the build on narrated→settled drift', () => {
  it('the ledger exists and parses (cannot be silently deleted or emptied)', () => {
    expect(existsSync(LEDGER)).toBe(true);
    expect(parseLedger(readFileSync(LEDGER, 'utf8')).length).toBeGreaterThanOrEqual(8);
  });

  it('PASS: the real ledger has no settled row pointing only at the transcript', () => {
    const drift = findDrift(parseLedger(readFileSync(LEDGER, 'utf8')));
    // If this is non-empty, a row was granted more standing than its receipt earns.
    expect(drift.map((r) => `${r.claim} [${r.status}] → "${r.receipt}"`)).toEqual([]);
  });

  it('CAN FAIL: a settled status with no receipt is caught (proves the room can say no)', () => {
    const drifted: LedgerRow[] = [
      { claim: 'Air catches silent mis-crossings', status: '**enforced**', receipt: 'none', refutedIf: 'dialogue audits show no catch' },
      { claim: 'honest narrated row', status: '**narrated**', receipt: 'transcript only', refutedIf: 'a counterexample' },
    ];
    const drift = findDrift(drifted);
    expect(drift.length).toBe(1);
    expect(drift[0].claim).toBe('Air catches silent mis-crossings');
  });

  // Second mechanism: a claim that names no possible refusal is poetry, not inquiry — whatever its status.
  it('PASS: every row in the real ledger names a possible refusal', () => {
    const poetry = findUnfalsifiable(parseLedger(readFileSync(LEDGER, 'utf8')));
    expect(poetry.map((r) => `${r.claim} [${r.status}]`)).toEqual([]);
  });

  it('CAN FAIL: a claim naming no refutation is caught (poetry is not inquiry)', () => {
    const rows: LedgerRow[] = [
      { claim: 'The field holds the plurality', status: '**candidate**', receipt: 'a beautiful sentence', refutedIf: '' },
      { claim: 'honest row', status: '**narrated**', receipt: 'transcript only', refutedIf: 'a dyad-vs-solos null' },
    ];
    const caught = findUnfalsifiable(rows);
    expect(caught.length).toBe(1);
    expect(caught[0].claim).toBe('The field holds the plurality');
  });
});
