#!/usr/bin/env npx ts-node
/**
 * GUARDRAIL: Prevent scripted MAIA responses from creeping back in
 *
 * This script fails CI/pre-push if any of these known bad patterns
 * appear in runtime code (not docs, not tests).
 *
 * Uses `git ls-files` for fast, predictable file enumeration.
 *
 * Run: npm run guard:no-scripted-maia
 */

import * as fs from 'fs';
import { execSync } from 'child_process';

// ============================================================================
// BAD PATTERNS - semantic + specific to avoid false positives
// ============================================================================

const BAD_PATTERNS = [
  // Core sovereignty speak (the Hallmark bot phrases)
  'You are the author of your reality',
  'You are sovereign over your path',
  'Your sovereignty is sacred',
  'Your authentic self is the ultimate authority',
  'Trust your inner wisdom above any external',
  'Your unique expression of consciousness is sacred',
  'You are the artist of your own consciousness evolution',
  'Your inner authority supersedes',
  'You are the sovereign creator of your own',
  'Your authenticity is the highest teaching',
  'Your sovereignty is divinely protected',
  'Your evolution is self-directed and self-validating',
  // Emoji-prefixed sovereignty affirmations (specific, not generic emoji patterns)
  '🌟 You are sovereign',
  '✨ You are the author',
  '💫 Your sovereignty',
  '🕊️ Your inner authority',
];

// ============================================================================
// FILE FILTERS - fast regex-based filtering on git ls-files output
// ============================================================================

// Only scan runtime-ish source roots
const INCLUDE_PATH_RE =
  /^(app|lib|src|components|pages|server|packages)\/.*\.(ts|tsx|js|jsx)$/;

// Exclude build artifacts and tooling
const EXCLUDE_PATH_RE =
  /(^|\/)(node_modules|\.next|dist|build|out|coverage|\.turbo|\.cache|\.git)\//;

// Exclude non-runtime content (tests, docs, dev tooling)
const EXCLUDE_NONRUNTIME_RE =
  /(^|\/)(__tests__|__mocks__|tests?|test|spec|fixtures?|stubs?|benchmarks?|examples?|playground|stories?|storybook|scripts\/dev-only|scripts\/debug|scripts\/guards|tools|docs?|Community-Commons|database\/migrations)(\/|$)/;

// Exclude generated/type files
const EXCLUDE_GENERATED_RE =
  /(^|\/)(generated|gen|types\/generated|__generated__)(\/|$)|\.d\.ts$/;

// Optional: narrow to MAIA-relevant files for faster scans
const MAIA_TARGET_RE =
  /(maia|sovereign|oracle|chat|prompt|fallback|presence|consciousness|voice)/i;

// ============================================================================
// IMPLEMENTATION
// ============================================================================

function gitLsFiles(): string[] {
  try {
    const output = execSync('git ls-files', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    console.error('Failed to run git ls-files. Are you in a git repository?');
    process.exit(1);
  }
}

function getFilesToScan(narrowToMaia = false): string[] {
  return gitLsFiles()
    .filter((p) => INCLUDE_PATH_RE.test(p))
    .filter((p) => !EXCLUDE_PATH_RE.test(p))
    .filter((p) => !EXCLUDE_NONRUNTIME_RE.test(p))
    .filter((p) => !EXCLUDE_GENERATED_RE.test(p))
    .filter((p) => !narrowToMaia || MAIA_TARGET_RE.test(p));
}

function main(): void {
  const narrowToMaia = process.argv.includes('--maia-only');
  const verbose = process.argv.includes('--verbose');

  console.log(`Scanning for scripted MAIA responses...`);
  if (narrowToMaia) {
    console.log('  (narrowed to MAIA-relevant files with --maia-only)');
  }

  const files = getFilesToScan(narrowToMaia);
  if (verbose) {
    console.log(`  Found ${files.length} files to scan`);
  }

  let violations = 0;
  const violationDetails: Array<{ file: string; pattern: string }> = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of BAD_PATTERNS) {
        if (content.includes(pattern)) {
          violationDetails.push({ file, pattern });
          violations++;
        }
      }
    } catch {
      // Skip files we can't read
    }
  }

  if (violations > 0) {
    for (const { file, pattern } of violationDetails) {
      console.error(`[VIOLATION] "${pattern}" found in ${file}`);
    }
    console.error(`\nFailed: ${violations} scripted MAIA response(s) found in runtime code.`);
    console.error('Fix: Remove canned affirmations. Let the model speak naturally.');
    process.exit(1);
  }

  console.log(`Passed: No scripted MAIA responses found in ${files.length} files.`);
  process.exit(0);
}

main();
