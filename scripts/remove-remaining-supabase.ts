#!/usr/bin/env tsx
/**
 * Final Supabase Removal Script
 * Removes all remaining Supabase violations detected by check-no-supabase.ts
 */

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

// Simple recursive file finder
function findFiles(dir: string, pattern: RegExp, ignore: RegExp[]): string[] {
  const results: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Check if path should be ignored
      if (ignore.some(re => re.test(fullPath))) {
        continue;
      }

      if (entry.isDirectory()) {
        results.push(...findFiles(fullPath, pattern, ignore));
      } else if (entry.isFile() && pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }

  return results;
}

interface FileEdit {
  file: string;
  original: string;
  modified: string;
  changes: string[];
}

const edits: FileEdit[] = [];

async function removeSupabaseFromFile(filePath: string): Promise<void> {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = content;
  const changes: string[] = [];

  // Remove direct @supabase imports
  const supabaseImportPattern = /import\s+\{[^}]*\}\s+from\s+['"]@supabase\/[^'"]+['"];?\s*\n?/g;
  const supabaseImportMatches = content.match(supabaseImportPattern);
  if (supabaseImportMatches) {
    modified = modified.replace(supabaseImportPattern, '');
    changes.push(`Removed ${supabaseImportMatches.length} @supabase imports`);
  }

  // Remove local supabase wrapper imports (from lib/db/legacy/supabase)
  const localSupabasePattern = /import\s+\{[^}]*\}\s+from\s+['"][^'"]*\/db\/legacy\/supabase[^'"]*['"];?\s*\n?/g;
  const localMatches = content.match(localSupabasePattern);
  if (localMatches) {
    modified = modified.replace(localSupabasePattern, '');
    changes.push(`Removed ${localMatches.length} local supabase wrapper imports`);
  }

  // Remove SUPABASE_* env var references
  const envVarPatterns = [
    /\s*DATABASE_URL:\s*z\.string\(\)\.url\(\),?\s*\n?/g,
    /\s*DATABASE_ANON_KEY:\s*z\.string\(\),?\s*\n?/g,
    /\s*DATABASE_SERVICE_KEY:\s*z\.string\(\)\.optional\(\),?\s*\n?/g,
    /\s*DATABASE_URL:\s*process\.env\.DATABASE_URL,?\s*\n?/g,
    /\s*DATABASE_ANON_KEY:\s*process\.env\.DATABASE_ANON_KEY,?\s*\n?/g,
    /\s*DATABASE_SERVICE_KEY:\s*process\.env\.DATABASE_SERVICE_KEY,?\s*\n?/g,
  ];

  for (const pattern of envVarPatterns) {
    const matches = modified.match(pattern);
    if (matches) {
      modified = modified.replace(pattern, '');
      changes.push(`Removed ${matches.length} SUPABASE_* env var references`);
    }
  }

  // Remove export re-exports of supabase
  const reexportPattern = /export\s+\{\s*supabase\s*\}\s+from\s+['"][^'"]*['"];?\s*\n?/g;
  const reexportMatches = modified.match(reexportPattern);
  if (reexportMatches) {
    modified = modified.replace(reexportPattern, '');
    changes.push(`Removed ${reexportMatches.length} supabase re-exports`);
  }

  if (changes.length > 0) {
    edits.push({
      file: filePath,
      original: content,
      modified,
      changes,
    });

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, modified, 'utf-8');
    }
  }
}

async function main() {
  console.log('🧹 Final Supabase Removal Script');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`);

  // Get all TypeScript files
  const ignorePatterns = [
    /node_modules/,
    /\.next/,
    /dist/,
    /build/,
    /coverage/,
    /artifacts/,
    /backups/,
    /ios/,
    /android/,
    /Community-Commons/,
    /\.md$/,
    /\.mdx$/,
  ];

  const files = findFiles('.', /\.(ts|tsx)$/, ignorePatterns);

  console.log(`Found ${files.length} files to check\n`);

  for (const file of files) {
    await removeSupabaseFromFile(file);
  }

  // Report results
  console.log('\n📊 Results:');
  console.log(`Files modified: ${edits.length}`);

  if (edits.length > 0) {
    console.log('\n📝 Changes:');
    for (const edit of edits) {
      console.log(`\n  ${edit.file}`);
      for (const change of edit.changes) {
        console.log(`    - ${change}`);
      }
    }
  }

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN - No files were modified');
    console.log('Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Changes applied');
  }

  console.log(`\n🔍 Run 'npm run check:no-supabase' to verify`);
}

main().catch(console.error);
