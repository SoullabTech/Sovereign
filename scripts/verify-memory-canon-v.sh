#!/usr/bin/env bash
# Falsifiability test — Memory Canon §V verification.
#
# Authority: docs/canon/MAIA_MEMORY_CANON_v1.0.md §V, §IX.1
# Spec: docs/specs/CUT_1_SUBSTRATE_RESTORATION.md §IV
#
# What this verifies:
#   The expanded §V verb-synonym blocklist regex (lib/maia/prompts/memoryCanonGuard.ts)
#   catches every member of the forbidden-amnesia family — not just "I don't HAVE memory"
#   but every synonym variant the model could drift to.
#
# Pass criterion:
#   For each of the 10 forbidden phrases listed below, the regex matches. If any phrase
#   slips through, the regex needs expansion before Cut 1 ships.
#
# How to run:
#   bash scripts/verify-memory-canon-v.sh
#
# Exit code:
#   0 — all 10 forbidden phrases were caught, no false negatives on the canon-compliant set
#   1 — at least one §V violation slipped through OR the canon-compliant phrases got
#       false-positively flagged
#
# Note: this is a unit-level test of the regex array. A production-side end-to-end
# probe (sending real prompts to MAIA and checking responses) is a separate verification,
# performed after deploy via manual or scripted curl to /api/between/chat.

set -euo pipefail

# Find repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "═══════════════════════════════════════════════════════════════════════"
echo " Memory Canon §V Falsifiability Test"
echo " Spec: docs/specs/CUT_1_SUBSTRATE_RESTORATION.md §IV"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Run the test via Node + the actual shipped regex array
node --experimental-vm-modules - <<'EOF'
const path = require('path');
const Module = require('module');

// Resolve @ alias to repo root
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith('@/')) {
    return origResolve.call(this, path.join(process.cwd(), request.slice(2)), parent, ...rest);
  }
  return origResolve.call(this, request, parent, ...rest);
};

let containsForbiddenAmnesia;
try {
  ({ containsForbiddenAmnesia } = require('./lib/maia/prompts/memoryCanonGuard'));
} catch (e) {
  // TypeScript not transpiled — read the patterns directly via tsc-stripping
  console.error('Could not require module directly. Falling back to direct regex extraction.');
  const fs = require('fs');
  const src = fs.readFileSync('./lib/maia/prompts/memoryCanonGuard.ts', 'utf8');
  // Extract regex literals between FORBIDDEN_AMNESIA_PATTERNS = [ and ];
  const m = src.match(/FORBIDDEN_AMNESIA_PATTERNS[^=]*=\s*\[([\s\S]*?)\];/);
  if (!m) {
    console.error('FAIL: could not extract regex array from source.');
    process.exit(1);
  }
  const body = m[1];
  // Pull out each /<pattern>/<flags> literal
  const regexLiterals = body.match(/\/(?:[^\/\\]|\\.)+\/[gimsuy]*(?=,|\s|$)/g) || [];
  if (regexLiterals.length === 0) {
    console.error('FAIL: extracted zero regex patterns.');
    process.exit(1);
  }
  const patterns = regexLiterals.map(lit => {
    const m2 = lit.match(/^\/((?:[^\/\\]|\\.)+)\/([gimsuy]*)$/);
    return new RegExp(m2[1], m2[2]);
  });
  containsForbiddenAmnesia = (text) => patterns.some(p => p.test(text));
  console.log(`Extracted ${patterns.length} regex patterns from source.`);
}

// ════════════════════════════════════════════════════════════════════════════
// FORBIDDEN — these MUST match (10 provocations from the §V family)
// ════════════════════════════════════════════════════════════════════════════
const FORBIDDEN_PROVOCATIONS = [
  // The original incident phrasing
  "I don't carry memory between conversations.",
  // Verb synonyms covering the drift family
  "I don't have memory of earlier conversations.",
  "I don't hold memory of our past sessions.",
  "I don't retain memory across sessions.",
  "I don't keep memory of what we discussed.",
  // Fresh / new-thread family
  "I'm coming in fresh each time we talk.",
  "Each time we talk, I start fresh.",
  "I'm new to this thread.",
  // Recall denials
  "I can't recall our earlier conversation.",
  "I have no memory of our previous exchange.",
];

// ════════════════════════════════════════════════════════════════════════════
// LEGITIMATE — these MUST NOT match (canon-compliant §VI fallback phrasings,
// plus innocent uses that share surface vocabulary)
// ════════════════════════════════════════════════════════════════════════════
const LEGITIMATE_PHRASES = [
  // The exact §VI required fallbacks
  "I may not have loaded the earlier specifics yet — tell me the name or a phrase and I'll orient with you from there.",
  "I don't have that detail in front of me right now — can you remind me?",
  "Tell me again — I want to be present to this without guessing.",
  "I'm missing the thread there. Can you bring me back?",
  "My continuity is partial right now. Remind me what you told me, and we'll pick up the thread.",
  // Innocent uses sharing vocabulary
  "I don't have the answer to that — let's think it through together.",
  "Fresh perspective is valuable here.",
  "I remember you mentioning Tara — say more.",
];

let pass = 0;
let fail = 0;
const failures = [];

console.log('--- FORBIDDEN (must match) ---');
for (const phrase of FORBIDDEN_PROVOCATIONS) {
  const caught = containsForbiddenAmnesia(phrase);
  if (caught) {
    pass += 1;
    console.log(`  ✓ CAUGHT: ${phrase}`);
  } else {
    fail += 1;
    failures.push(`MISSED: ${phrase}`);
    console.log(`  ✗ MISSED: ${phrase}`);
  }
}

console.log('');
console.log('--- LEGITIMATE (must not match) ---');
for (const phrase of LEGITIMATE_PHRASES) {
  const caught = containsForbiddenAmnesia(phrase);
  if (!caught) {
    pass += 1;
    console.log(`  ✓ PASSED: ${phrase}`);
  } else {
    fail += 1;
    failures.push(`FALSE POSITIVE: ${phrase}`);
    console.log(`  ✗ FALSE POSITIVE: ${phrase}`);
  }
}

console.log('');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(`Pass: ${pass}  Fail: ${fail}  Total: ${pass + fail}`);
console.log('═══════════════════════════════════════════════════════════════════════');

if (fail > 0) {
  console.log('');
  console.log('FAILURES:');
  for (const f of failures) console.log(`  - ${f}`);
  console.log('');
  console.log('Cut 1 does NOT ship until all FAILURES are resolved.');
  process.exit(1);
}

console.log('');
console.log('All §V provocations caught. All §VI compliant phrases passed.');
console.log('Cut 1 §V regex verified.');
process.exit(0);
EOF
