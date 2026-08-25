/**
 * ARCHITECTURAL GUARD — the abstraction must not decay back into 22 integrations.
 * =============================================================================
 *
 * Before this lane, twenty-three files imported the Resend SDK directly. Each
 * one re-implemented (or, more often, failed to implement) the same three
 * things: read the resolved error, classify it, and do not report a refusal as
 * a send. Most got it wrong, and each new sender inherited the bug by copying
 * the file next to it.
 *
 * Consolidating them once fixes today. This test is what makes it stay fixed:
 * a new direct vendor import fails CI rather than quietly becoming the
 * twenty-fourth. That is the difference between a migration and an architecture.
 *
 * ALLOWED to import a vendor SDK: the provider adapters, and nothing else.
 */
import { describe, it, expect } from '@jest/globals';
import { execFileSync } from 'child_process';
import path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../../..');

/** This test's own repo-relative path — see the filter in vendorImporters. */
const GUARD_SELF = 'lib/email/__tests__/no-direct-provider-imports.test.ts';

/**
 * The ONLY files permitted to import a vendor email SDK. Repo-relative paths.
 * Adding to this list is a deliberate architectural decision — a new provider
 * adapter — not a way to unblock a caller.
 */
const ALLOWED_VENDOR_IMPORTERS = [
  'lib/email/providers/ResendProvider.ts',
];

/**
 * KNOWN, NAMED DEBT — bypasses that exist and are NOT sanctioned architecture.
 *
 * Distinct from the allow-list on purpose. An entry here is a file this lane
 * did not migrate and a promise that it will be, not a blessing. The list is
 * asserted not to GROW, so the debt is bounded even while it is unpaid.
 *
 * lib/alerting/real-time-alerts.ts — clinical therapist alerting over SMTP.
 *   Not migrated here for two reasons. It is a distinct product surface
 *   (PHI-adjacent safety escalation with its own consent model), and migrating
 *   it would expand this unit into unrelated notification architecture.
 *   It is also NON-FUNCTIONAL as written: it calls
 *   `nodemailer.createTransporter`, which does not exist — the method is
 *   `createTransport` — and `nodemailer` is not a declared dependency (only a
 *   `declare module` stub in types/external). Constructing the service with an
 *   email config throws. So this is not a live send path competing with the
 *   subsystem; it is dead code that must be either repaired onto Soullab Mail
 *   or deleted, as its own decision.
 */
const KNOWN_UNMIGRATED = [
  'lib/alerting/real-time-alerts.ts',
];

/**
 * Vendor SDK module specifiers that must not appear in application code —
 * however they are reached: static import, require, or dynamic import.
 */
const VENDOR_MODULES = ['resend', 'postmark', '@aws-sdk/client-ses', '@sendgrid/mail', 'nodemailer'];

/**
 * Files that import an email vendor SDK, as the repository actually is.
 *
 * `git grep --untracked` is used rather than a hand-rolled walk so the search
 * inherits .gitignore — node_modules and build output are excluded by
 * construction — while still seeing a new file that has not been committed yet.
 */
function vendorImporters(): string[] {
  const pattern = VENDOR_MODULES.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  let out = '';
  try {
    out = execFileSync(
      'git',
      [
        'grep',
        // Tracked AND untracked working-tree files: a bypass added but not yet
        // committed must fail the guard now, not after it lands.
        '--untracked',
        '-lE',
        // Static import, CommonJS require, AND dynamic `await import('resend')`.
        // The dynamic form is not a hypothetical: this guard's first run found
        // `app/api/studio/session-followup/send/route.ts` reaching the vendor
        // that way, invisible to a static-import census.
        `(from|import|require)\\s*\\(?\\s*['"](${pattern})['"]`,
        '--',
        '*.ts',
        '*.tsx',
      ],
      { cwd: REPO_ROOT, encoding: 'utf8' }
    );
  } catch (err: unknown) {
    // git grep exits 1 with no output when nothing matches. That is a pass.
    const status = (err as { status?: number }).status;
    if (status === 1) return [];
    throw err;
  }
  return out
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    // This file necessarily contains the specifiers it searches for — they are
    // its search terms. Excluding it by path keeps the guard from flagging
    // itself, without weakening the pattern for anything else.
    .filter((f) => f !== GUARD_SELF);
}

describe('email provider imports are confined to the adapter layer', () => {
  it('no application code imports an email vendor SDK directly', () => {
    const offenders = vendorImporters().filter(
      (file) => !ALLOWED_VENDOR_IMPORTERS.includes(file) && !KNOWN_UNMIGRATED.includes(file)
    );

    expect(offenders).toEqual([]);
  });

  it('the named debt does not grow', () => {
    // Every file still importing a vendor SDK is either a sanctioned adapter or
    // already-named debt. A NEW unmigrated bypass fails here even if someone
    // adds it to KNOWN_UNMIGRATED, because this asserts the size of that list.
    expect(KNOWN_UNMIGRATED).toHaveLength(1);
  });

  it('the adapters that ARE allowed still exist — the guard is not vacuous', () => {
    // A guard that passes because its search found nothing at all proves
    // nothing. The allow-list must be non-empty AND actually matched.
    const importers = vendorImporters();
    expect(ALLOWED_VENDOR_IMPORTERS.length).toBeGreaterThan(0);
    for (const allowed of ALLOWED_VENDOR_IMPORTERS) {
      expect(importers).toContain(allowed);
    }
  });

  it('NEGATIVE CONTROL: the guard fails when a bypass is introduced', () => {
    // Proof that this test can fail. Simulating the offender rather than
    // writing one to disk keeps the control deterministic — but it exercises
    // the same filter the real assertion uses, so a filter that stopped
    // rejecting anything would fail here too.
    const withBypass = [...vendorImporters(), 'app/api/some/new/route.ts'];
    const offenders = withBypass.filter(
      (f) => !ALLOWED_VENDOR_IMPORTERS.includes(f) && !KNOWN_UNMIGRATED.includes(f)
    );

    expect(offenders).toContain('app/api/some/new/route.ts');
    expect(offenders).not.toEqual([]);
  });
});
