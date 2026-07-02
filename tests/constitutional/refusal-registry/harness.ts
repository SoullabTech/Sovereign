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
  try {
    const out = execSync(`grep -rInE ${JSON.stringify(pattern)} ${quotedPaths}`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    return out.trim().split('\n').filter(Boolean);
  } catch (e: unknown) {
    // grep exits 1 when there are no matches — that is a valid empty result.
    if (typeof e === 'object' && e !== null && (e as { status?: number }).status === 1) {
      return [];
    }
    throw e;
  }
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
    io.fail('check threw', e instanceof Error ? e.message : String(e));
  }

  console.log(`${DIM}   ✔ a PASS authorizes: ${check.passingAuthorizes}${RESET}`);
  console.log(`${DIM}   ✘ a PASS does NOT authorize: ${check.passingDoesNotAuthorize}${RESET}`);
  console.log(`${DIM}   ↯ hostile fork must change: ${check.hostileForkMustChange}${RESET}`);
}
