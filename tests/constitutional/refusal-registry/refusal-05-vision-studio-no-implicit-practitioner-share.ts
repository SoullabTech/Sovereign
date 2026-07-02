import type { RefusalCheck } from './harness';

/**
 * Refusal 05 — Vision Studio field-note route has no code path that sets
 * can_be_shown_to_practitioner = TRUE without an explicit per-thread
 * shareWithPractitioner member gesture.
 *
 * The structural proof has two parts:
 *   A. The route default is FALSE: every call to saveThread() in the POST
 *      handler must pass a value derived from parseProposals/parseCreated,
 *      both of which default to `=== true` (i.e. require the explicit flag).
 *   B. No batch-level `shareWithPractitioner = true` or hardcoded `true`
 *      literal is passed to saveThread() in the route file.
 */

const ROUTE = 'app/api/maia/vision-studio/field-note/route.ts';

export const check: RefusalCheck = {
  id: 'R05',
  refusal: 'Vision Studio field-note route cannot set can_be_shown_to_practitioner TRUE without an explicit per-thread member shareWithPractitioner gesture',
  grade: 'A',
  enforcedBy: 'parseProposals and parseCreated default shareWithPractitioner to false; saveThread receives per-thread values only',
  evidence: [
    'route.ts parseProposals: shareWithPractitioner = (p as any).shareWithPractitioner === true (default false)',
    'route.ts parseCreated: string items → shareWithPractitioner: false; object items → === true',
    'route.ts POST: no batch-level shareWithPractitioner; every saveThread call passes p.shareWithPractitioner or c.shareWithPractitioner',
  ].join(' | '),
  violationAttempted: [
    '(1) find a hardcoded `true` literal passed as the last arg to saveThread()',
    '(2) find a batch-level `const shareWithPractitioner = true` or `=== true` outside parseProposals/parseCreated',
    '(3) find parseProposals/parseCreated defaulting to true',
  ].join('; '),
  passingAuthorizes: 'no code path in the POST handler sets can_be_shown_to_practitioner TRUE without the member explicitly sending shareWithPractitioner: true on each thread',
  passingDoesNotAuthorize: 'that the UI enforces this correctly, or that other routes have no similar issues — only that THIS route has no implicit sharing path',
  hostileForkMustChange: 'add `const shareWithPractitioner = true;` in the POST handler, or change the default in parseProposals/parseCreated from `=== true` to a truthy default — visible diff',

  run(io) {
    const src = io.read(ROUTE);

    // ── Check A: no hardcoded `true` passed as the shareWithPractitioner arg to saveThread ──
    // saveThread signature: (..., shareWithPractitioner: boolean) — it is the LAST argument.
    // A hostile fork would call saveThread(..., true) — the literal `true` as the final arg.
    // We grep for `saveThread(` calls containing `, true)` at the end (possibly with whitespace).
    const hardcodedTrue = io.grep(
      'saveThread\\([^)]*,\\s*true\\s*\\)',
      [ROUTE],
    );
    if (hardcodedTrue.length === 0) {
      io.pass('no saveThread() call passes a hardcoded `true` as shareWithPractitioner', 'all calls use per-thread parsed values');
    } else {
      io.fail(
        'found saveThread() call(s) with hardcoded `true` as last arg',
        hardcodedTrue.slice(0, 3).join(' | '),
      );
    }

    // ── Check B: no batch-level `const shareWithPractitioner = true` ──
    // A batch flag set to true would be: `const shareWithPractitioner = true`
    const batchTrue = io.grep(
      'const shareWithPractitioner\\s*=\\s*true',
      [ROUTE],
    );
    if (batchTrue.length === 0) {
      io.pass('no batch-level `const shareWithPractitioner = true` in POST handler');
    } else {
      io.fail(
        'found batch-level shareWithPractitioner = true',
        batchTrue.slice(0, 3).join(' | '),
      );
    }

    // ── Check C: parseProposals defaults to false (uses `=== true`) ──
    const proposalDefault = io.grep(
      'shareWithPractitioner.*===\\s*true',
      [ROUTE],
    );
    if (proposalDefault.length > 0) {
      io.pass('parseProposals uses `=== true` — absent/falsy input defaults to false', `found ${proposalDefault.length} occurrence(s)`);
    } else {
      io.fail('parseProposals does not use `=== true` guard — default may not be false');
    }

    // ── Check D: parseCreated string-branch explicitly sets shareWithPractitioner: false ──
    const createdStringFalse = io.grep(
      'shareWithPractitioner:\\s*false',
      [ROUTE],
    );
    if (createdStringFalse.length > 0) {
      io.pass('parseCreated string-branch explicitly defaults shareWithPractitioner to false', `found ${createdStringFalse.length} occurrence(s)`);
    } else {
      io.fail('parseCreated string-branch does not explicitly default shareWithPractitioner to false');
    }

    // ── Check E: the batch comment block from pre-refactor is gone ──
    // The old code had `body?.shareWithPractitioner === true` at the batch level
    // AND a comment saying "Batch-level today". If that comment still exists,
    // the refactor may not have landed.
    const batchComment = io.grep(
      'Batch-level today',
      [ROUTE],
    );
    if (batchComment.length === 0) {
      io.pass('old batch-level comment removed — per-thread refactor landed');
    } else {
      io.warn('old "Batch-level today" comment still present — verify refactor is complete', batchComment[0]);
    }
  },
};
