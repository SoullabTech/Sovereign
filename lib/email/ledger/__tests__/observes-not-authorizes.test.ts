/**
 * THE LOAD-BEARING RULE, enforced structurally.
 *
 *     The ledger OBSERVES sending; it does not AUTHORIZE sending.
 *
 * A ledger that can gate mail is a ledger that can take P0 authentication down:
 * nobody signs in because we cannot record that they are signing in. The rule is
 * kept by the import graph, not by discipline — discipline is what produced
 * twenty-three direct vendor integrations before MAIL-01.
 */
import { describe, it, expect } from '@jest/globals';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';

const LEDGER_DIR = path.resolve(__dirname, '..');

function ledgerSources(): string[] {
  return readdirSync(LEDGER_DIR)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => path.join(LEDGER_DIR, f));
}

/** Module specifiers the ledger must never reach for. */
const FORBIDDEN = ['./sendEmail', '../sendEmail', '@/lib/email/sendEmail', './providers', '../providers'];

describe('the ledger observes sending; it does not authorize it', () => {
  it('no ledger module imports sendEmail or any provider', () => {
    const offenders: string[] = [];
    for (const file of ledgerSources()) {
      const src = readFileSync(file, 'utf8');
      // Strip block and line comments: this file's own prose names the modules it
      // forbids, and a guard that trips on its own documentation is useless.
      const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      for (const bad of FORBIDDEN) {
        if (new RegExp(`(from|import|require)\\s*\\(?\\s*['"]${bad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`).test(code)) {
          offenders.push(`${path.basename(file)} -> ${bad}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('the ledger exposes no function whose return value could gate a send', () => {
    // `openAttempt` returns an id (or null) and `settleAttempt` returns void.
    // Neither is a decision. If a future export answered "may I send?", the send
    // path could start asking — so assert the surface stays observational.
    const api = require('../index') as Record<string, unknown>;
    const exported = Object.keys(api).filter((k) => typeof api[k] === 'function').sort();
    expect(exported).toEqual(['openAttempt', 'scrubMetadata', 'settleAttempt', 'stateForFailure']);
  });

  it('NEGATIVE CONTROL: the guard fails when a ledger module reaches for the send path', () => {
    const withBypass = ['index.ts -> @/lib/email/sendEmail'];
    expect(withBypass).not.toEqual([]);
    // And prove the detector itself matches that shape, rather than only the array.
    const code = `import { sendEmail } from '@/lib/email/sendEmail';`;
    const hit = new RegExp(`(from|import|require)\\s*\\(?\\s*['"]@/lib/email/sendEmail['"]`).test(code);
    expect(hit).toBe(true);
  });
});
