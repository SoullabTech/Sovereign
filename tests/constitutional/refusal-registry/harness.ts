/**
 * Refusal Registry — falsification harness (shared runtime)
 *
 * Companion to docs/architecture/REFUSAL_REGISTRY.md.
 *
 * A refusal in the Registry is a claim: "the runtime is structurally prevented
 * from taking action X." A test here is a PROOF ATTEMPT against that claim — it
 * tries to demonstrate the refusal is real, or surfaces that it is not.
 *
 * These are SOURCE-LEVEL structural assertions (absence of a construct across a
 * module), not behavioural tests — because the claims are of the form "no code
 * path exists," which behaviour on exercised paths can never prove. This mirrors
 * the project's established idiom (scripts/verify-colab-boundaries.ts,
 * scripts/check-*.ts, scripts/guards/*.ts): structurally enforced, not assumed.
 *
 * Each check carries its jurisdiction discipline explicitly:
 *   - refusal                    what is refused
 *   - enforcedBy                 the file/path that enforces it
 *   - violationAttempted         what this proof attempt tries to find
 *   - passingAuthorizes          what a PASS lets you claim
 *   - passingDoesNotAuthorize    what a PASS does NOT let you claim
 *   - hostileForkMustChange      the diff a fork would need to defeat it
 *
 * Usage:
 *   npx tsx tests/constitutional/refusal-registry/index.ts
 *
 * Exit code is non-zero if any refusal is falsified (FAIL). WARN does not fail
 * the suite but is surfaced. States: PASS / FAIL / WARN / NOTE — current
 * structural assessments, not declarations. Canon: docs/canon/VERIFICATION_STATES.md
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

export const REPO_ROOT = process.cwd();

export interface CheckIO {
  pass(label: string, detail?: string): void;
  fail(label: string, detail?: string): void;
  warn(label: string, detail?: string): void;
  note(label: string, detail?: string): void;
  /** Read a repo-relative file. Throws (→ FAIL for the check) if missing. */
  read(relPath: string): string;
  /** Return matching `path:line:text` lines for an extended-regex across paths. */
  grep(pattern: string, paths: string[]): string[];
  exists(relPath: string): boolean;
}

/**
 * A check could not locate its own anchor, so it can prove NOTHING either way.
 *
 * This is a TOOLING failure, never a demonstrated breach. It exists because the
 * opposite — a detector that silently degrades and then reports a red that reads
 * like a constitutional violation — is worse than no detector at all: it spends
 * the registry's credibility on noise, and it hides real breaches inside a
 * failure everyone learns to ignore.
 *
 * Provenance: on 2026-09-04 five assertions across R19 and R21 reported red with
 * `@NaN` line numbers while every guard they police was intact and correctly
 * ordered. Cause: `lineOf()` parsed field [1] of a `path:line:text` grep line,
 * but GNU grep OMITS the filename when `-r` is given exactly one non-directory
 * operand (BSD grep and ugrep include it). Field [1] was therefore the source
 * text, and `parseInt('      await …')` → NaN; every `NaN < NaN` comparison is
 * false, so each ordering assertion failed closed and looked like a breach.
 * Whether the registry was red depended on which grep was first on PATH.
 */
export class DetectorDefect extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DetectorDefect';
  }
}

/** The format every `grep()` result line is contractually required to have. */
const GREP_LINE = /^(.*?):(\d+):/;

/**
 * Line number of the first match.
 *
 * Returns -1 for NO MATCHES — an absent anchor is a substantive result the
 * caller must interpret (a missing guard is a breach; a missing INSERT is not).
 * It never returns NaN: an unparseable match is a DetectorDefect, not a verdict.
 */
export function lineOf(matches: string[]): number {
  if (matches.length === 0) return -1;
  const m = GREP_LINE.exec(matches[0]);
  if (!m) {
    throw new DetectorDefect(
      `grep output did not match the required "path:line:text" contract, so no line ` +
        `number could be located. Offending line: ${JSON.stringify(matches[0])}`
    );
  }
  return parseInt(m[2], 10);
}

/**
 * Line number of the first match, where ABSENCE means the detector has lost its
 * anchor rather than that a guard is missing. Use for structural landmarks
 * (a handler signature, the INSERT an assertion orders a guard against) whose
 * disappearance invalidates the assertion instead of proving a violation.
 */
export function requireLine(matches: string[], anchor: string): number {
  if (matches.length === 0) {
    throw new DetectorDefect(
      `anchor not found: ${anchor}. This assertion orders other code against this ` +
        `landmark; without it the assertion proves nothing either way. Re-point the ` +
        `detector at where the construct moved — do not relax the assertion.`
    );
  }
  return lineOf(matches);
}

export interface RefusalCheck {
  id: string;
  refusal: string;
  grade: 'A' | 'A-minus' | 'B' | 'C' | 'Proposed';
  enforcedBy: string;
  evidence: string;
  violationAttempted: string;
  passingAuthorizes: string;
  passingDoesNotAuthorize: string;
  hostileForkMustChange: string;
  run(io: CheckIO): void;
}

export interface Tally {
  passed: number;
  failed: number;
  warned: number;
}

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

export function grep(pattern: string, paths: string[]): string[] {
  const quotedPaths = paths.map((p) => JSON.stringify(p)).join(' ');
  let out: string;
  try {
    // -H is REQUIRED, not decorative: GNU grep omits the filename when -r is
    // given exactly one non-directory operand, while BSD grep and ugrep include
    // it. Without -H the "path:line:text" contract that every ordering
    // assertion parses is implementation-dependent (see DetectorDefect).
    out = execSync(`grep -rHInE ${JSON.stringify(pattern)} ${quotedPaths}`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
  } catch (e: unknown) {
    // grep exits 1 when there are no matches — that is a valid empty result.
    if (typeof e === 'object' && e !== null && (e as { status?: number }).status === 1) {
      return [];
    }
    throw e;
  }

  const lines = out.trim().split('\n').filter(Boolean);
  // Tripwire: enforce the format contract at the single place it is produced,
  // so a future grep-behaviour drift surfaces as a named tooling failure rather
  // than silently corrupting the line arithmetic of every downstream assertion.
  const malformed = lines.find((l) => !GREP_LINE.test(l));
  if (malformed !== undefined) {
    throw new DetectorDefect(
      `grep(${JSON.stringify(pattern)}) over [${paths.join(', ')}] returned a line ` +
        `that is not "path:line:text": ${JSON.stringify(malformed)}. The registry ` +
        `cannot locate source positions and therefore cannot adjudicate this refusal.`
    );
  }
  return lines;
}

export function read(relPath: string): string {
  return readFileSync(join(REPO_ROOT, relPath), 'utf8');
}

/** Run one refusal check, printing its jurisdiction card + results. */
export function runCheck(check: RefusalCheck, tally: Tally): void {
  console.log(`\n${BOLD}── [${check.id}] ${check.refusal}${RESET}`);
  console.log(`${DIM}   grade: ${check.grade}  ·  enforced by: ${check.enforcedBy}${RESET}`);
  console.log(`${DIM}   attempts to violate: ${check.violationAttempted}${RESET}`);

  const io: CheckIO = {
    pass: (label, detail) => {
      console.log(`   ${GREEN}✅ PASS${RESET}  ${label}${detail ? `  ${DIM}(${detail})${RESET}` : ''}`);
      tally.passed++;
    },
    fail: (label, detail) => {
      console.log(`   ${RED}❌ FAIL${RESET}  ${label}${detail ? `  ${RED}→ ${detail}${RESET}` : ''}`);
      tally.failed++;
    },
    warn: (label, detail) => {
      console.log(`   ${YELLOW}⚠️  WARN${RESET}  ${label}${detail ? `  ${DIM}(${detail})${RESET}` : ''}`);
      tally.warned++;
    },
    note: (label, detail) => {
      console.log(`   ${DIM}·  NOTE  ${label}${detail ? `  — ${detail}` : ''}${RESET}`);
    },
    read,
    grep,
    exists: (relPath) => existsSync(join(REPO_ROOT, relPath)),
  };

  try {
    check.run(io);
  } catch (e: unknown) {
    if (e instanceof DetectorDefect) {
      // Distinguished from a breach on purpose: this red says the instrument is
      // broken, NOT that the refusal was violated. Repair the detector; do not
      // relax the assertion, and do not read this as a demonstrated violation.
      io.fail(
        'DETECTOR DEFECT — this check could not locate its own anchor and proves NOTHING either way (tooling failure, not a demonstrated breach)',
        e.message
      );
    } else {
      io.fail('check threw', e instanceof Error ? e.message : String(e));
    }
  }

  console.log(`${DIM}   ✔ a PASS authorizes: ${check.passingAuthorizes}${RESET}`);
  console.log(`${DIM}   ✘ a PASS does NOT authorize: ${check.passingDoesNotAuthorize}${RESET}`);
  console.log(`${DIM}   ↯ hostile fork must change: ${check.hostileForkMustChange}${RESET}`);
}
