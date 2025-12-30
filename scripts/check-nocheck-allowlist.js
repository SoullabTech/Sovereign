#!/usr/bin/env node
/**
 * @ts-nocheck Allowlist Guardrail
 *
 * Ensures @ts-nocheck only exists in approved legacy files within
 * the main Next.js app codebase (excludes separate backend apps).
 *
 * Run: node scripts/check-nocheck-allowlist.js
 *
 * Exit codes:
 *   0 = All @ts-nocheck directives are in allowlist
 *   1 = Found @ts-nocheck in unapproved files
 */

const { execSync } = require('child_process');
const path = require('path');

// Allowlist: Legacy Supabase files pending PostgreSQL migration
// See docs/LEGACY_SUPABASE.md for migration plan
const ALLOWLIST = new Set([
  'lib/consciousness/RelationshipAnamnesis_Direct.ts',
  'lib/field-protocol/FieldRecordsService.ts',
]);

// Directories excluded from checking (separate codebases with their own configs)
const EXCLUDED_DIRS = [
  'app/api/_backend/',      // Separate backend app
  'app/api/backend/',       // Legacy backend path
  'app/maia/labtools/',     // Lab tools with pre-existing @ts-nocheck
];

function main() {
  const rootDir = path.resolve(__dirname, '..');
  process.chdir(rootDir);

  // Find all files with @ts-nocheck using grep
  let grepOutput;
  try {
    grepOutput = execSync(
      'grep -rl "// @ts-nocheck" lib components hooks app 2>/dev/null',
      { encoding: 'utf8', cwd: rootDir, shell: '/bin/bash' }
    ).trim();
  } catch (e) {
    // grep returns exit 1 when no matches found
    grepOutput = '';
  }

  if (!grepOutput) {
    console.log('No @ts-nocheck directives found.');
    process.exit(0);
  }

  // Filter out excluded directories
  const allFiles = grepOutput.split('\n').filter(Boolean);
  const files = allFiles.filter(file =>
    !EXCLUDED_DIRS.some(dir => file.startsWith(dir))
  );

  console.log(`Scanning ${files.length} files (${allFiles.length - files.length} in excluded dirs)`);

  const violations = [];
  for (const file of files) {
    if (!ALLOWLIST.has(file)) {
      violations.push(file);
    }
  }

  console.log(`\nFound ${files.length} file(s) with @ts-nocheck in main codebase:`);
  for (const file of files) {
    const status = ALLOWLIST.has(file) ? '  [allowlist]' : '  [VIOLATION]';
    console.log(`${status} ${file}`);
  }

  if (violations.length > 0) {
    console.log(`\n@ts-nocheck violations found in ${violations.length} file(s):`);
    for (const v of violations) {
      console.log(`  - ${v}`);
    }
    console.log('\nTo fix:');
    console.log('  1. Remove @ts-nocheck and fix the type errors, OR');
    console.log('  2. If truly legacy, add to ALLOWLIST in scripts/check-nocheck-allowlist.js');
    console.log('     and document in docs/LEGACY_SUPABASE.md');
    process.exit(1);
  }

  console.log(`\nAll ${files.length} @ts-nocheck files are in allowlist.`);
  process.exit(0);
}

main();
