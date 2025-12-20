#!/usr/bin/env tsx
// scripts/rename-supabase-identifiers.ts
// Safe bulk rename of Supabase identifiers to generic database terms
// Idempotent, traceable, excludes quarantine zones and build artifacts

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Replacement {
  pattern: RegExp;
  replacement: string;
  description: string;
}

interface FileChange {
  file: string;
  replacements: Array<{
    line: number;
    old: string;
    new: string;
  }>;
}

// Patterns to rename (order matters - most specific first)
const REPLACEMENTS: Replacement[] = [
  {
    pattern: /\bsupabaseClient\b/g,
    replacement: 'dbClient',
    description: 'dbClient → dbClient'
  },
  {
    pattern: /\bsupabaseUrl\b/g,
    replacement: 'dbUrl',
    description: 'dbUrl → dbUrl'
  },
  {
    pattern: /\bsupabaseKey\b/g,
    replacement: 'dbKey',
    description: 'dbKey → dbKey'
  },
  {
    pattern: /\bsupabaseServiceKey\b/g,
    replacement: 'dbServiceKey',
    description: 'dbServiceKey → dbServiceKey'
  },
  {
    pattern: /\bSUPABASE_URL\b/g,
    replacement: 'DATABASE_URL',
    description: 'DATABASE_URL → DATABASE_URL'
  },
  {
    pattern: /\bSUPABASE_ANON_KEY\b/g,
    replacement: 'DATABASE_ANON_KEY',
    description: 'DATABASE_ANON_KEY → DATABASE_ANON_KEY'
  },
  {
    pattern: /\bSUPABASE_SERVICE_ROLE_KEY\b/g,
    replacement: 'DATABASE_SERVICE_KEY',
    description: 'DATABASE_SERVICE_KEY → DATABASE_SERVICE_KEY'
  },
  {
    pattern: /\bSUPABASE_KEY\b/g,
    replacement: 'DATABASE_KEY',
    description: 'DATABASE_KEY → DATABASE_KEY'
  },
  {
    pattern: /\bNEXT_PUBLIC_SUPABASE_URL\b/g,
    replacement: 'NEXT_PUBLIC_DATABASE_URL',
    description: 'NEXT_PUBLIC_DATABASE_URL → NEXT_PUBLIC_DATABASE_URL'
  },
  {
    pattern: /\bNEXT_PUBLIC_SUPABASE_ANON_KEY\b/g,
    replacement: 'NEXT_PUBLIC_DATABASE_ANON_KEY',
    description: 'NEXT_PUBLIC_DATABASE_ANON_KEY → NEXT_PUBLIC_DATABASE_ANON_KEY'
  },
  // Property/variable names with supabase prefix/suffix
  {
    pattern: /\bsupabase_failures\b/g,
    replacement: 'db_failures',
    description: 'db_failures → db_failures'
  },
  {
    pattern: /\bsupabase_errors\b/g,
    replacement: 'db_errors',
    description: 'db_errors → db_errors'
  }
];

// Directories to exclude (quarantine zones, build artifacts, docs)
const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /dist-minimal/,
  /build/,
  /\.git/,
  /lib\/db\/legacy/,
  /utils\/supabase/,
  /app\/api\/backend\/dist/,
  /Community-Commons/,
  /docs\//,
  /\.md$/,
  /\.json$/,
  /\.lock$/
];

// File extensions to process
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.env'];

const changes: FileChange[] = [];
let totalReplacements = 0;

/**
 * Check if file should be excluded
 */
function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Check if file extension is allowed
 */
function hasAllowedExtension(filePath: string): boolean {
  return INCLUDE_EXTENSIONS.some(ext => filePath.endsWith(ext));
}

/**
 * Find all files to process
 */
function findFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    if (shouldExclude(currentDir)) return;

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && hasAllowedExtension(fullPath)) {
          if (!shouldExclude(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (err) {
      // Skip directories we can't read
    }
  }

  walk(dir);
  return files;
}

/**
 * Process a single file
 */
function processFile(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let modified = false;
    const fileChanges: FileChange = {
      file: filePath,
      replacements: []
    };

    let newContent = content;

    // Apply each replacement pattern
    for (const { pattern, replacement, description } of REPLACEMENTS) {
      const matches = content.match(pattern);
      if (matches) {
        // Track which lines changed
        for (let i = 0; i < lines.length; i++) {
          const oldLine = lines[i];
          const newLine = oldLine.replace(pattern, replacement);
          if (oldLine !== newLine) {
            fileChanges.replacements.push({
              line: i + 1,
              old: oldLine.trim(),
              new: newLine.trim()
            });
          }
        }

        newContent = newContent.replace(pattern, replacement);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      changes.push(fileChanges);
      totalReplacements += fileChanges.replacements.length;
      return true;
    }

    return false;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
    return false;
  }
}

/**
 * Print summary report
 */
function printReport() {
  console.log('\n📊 IDENTIFIER RENAME REPORT');
  console.log('='.repeat(60));
  console.log(`Files modified: ${changes.length}`);
  console.log(`Total replacements: ${totalReplacements}\n`);

  if (changes.length === 0) {
    console.log('✅ No Supabase identifiers found (already clean!)\n');
    return;
  }

  console.log('📝 CHANGES BY FILE\n');
  console.log('─'.repeat(60));

  for (const fileChange of changes) {
    console.log(`\n${fileChange.file} (${fileChange.replacements.length} changes)`);
    for (const rep of fileChange.replacements.slice(0, 3)) {
      console.log(`  Line ${rep.line}:`);
      console.log(`    - ${rep.old}`);
      console.log(`    + ${rep.new}`);
    }
    if (fileChange.replacements.length > 3) {
      console.log(`  ... and ${fileChange.replacements.length - 3} more`);
    }
  }

  console.log('\n─'.repeat(60));
  console.log('\n💡 NEXT STEPS:\n');
  console.log('1. Review changes: git diff');
  console.log('2. Run sovereignty check: npm run check:no-supabase');
  console.log('3. Run audit: npx tsx scripts/audit-sovereignty.ts');
  console.log('4. Commit: git add . && git commit -m "refactor: rename supabase identifiers"');
  console.log('');
}

/**
 * Save detailed change log
 */
function saveChangeLog() {
  if (changes.length === 0) return;

  const artifactsDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const logPath = path.join(artifactsDir, 'identifier-rename-log.json');
  const log = {
    timestamp: new Date().toISOString(),
    filesModified: changes.length,
    totalReplacements,
    changes: changes.map(c => ({
      file: c.file,
      changeCount: c.replacements.length,
      replacements: c.replacements
    }))
  };

  fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf-8');
  console.log(`📄 Detailed log saved to: ${logPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🔄 SUPABASE IDENTIFIER RENAME');
  console.log('='.repeat(60));
  console.log('Scanning for identifiers to rename...\n');

  // Find all eligible files
  const allFiles = findFiles(process.cwd());
  console.log(`Found ${allFiles.length} files to check\n`);

  // Process each file
  let filesModified = 0;
  for (const file of allFiles) {
    const relativePath = path.relative(process.cwd(), file);
    if (processFile(file)) {
      filesModified++;
      process.stdout.write(`\r✓ Modified: ${filesModified} files`);
    }
  }

  console.log('\n');

  // Generate reports
  printReport();
  saveChangeLog();

  console.log('✅ Identifier rename complete.\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Rename failed:', err);
  process.exit(1);
});
