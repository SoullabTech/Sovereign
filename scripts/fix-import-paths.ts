#!/usr/bin/env tsx
/**
 * Import Path Migration Tool (Stage 3)
 *
 * Automatically fixes broken import paths by:
 * 1. Converting relative paths to tsconfig path aliases
 * 2. Fixing incorrect module references
 * 3. Updating deprecated import patterns
 *
 * Usage:
 *   npx tsx scripts/fix-import-paths.ts --dry-run  # Preview changes
 *   npx tsx scripts/fix-import-paths.ts --write    # Apply changes
 *
 * Safety:
 * - Idempotent (safe to run multiple times)
 * - Logs all changes to artifacts/import-fixes.json
 * - Dry-run by default
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ImportFix {
  file: string;
  line: number;
  oldImport: string;
  newImport: string;
  reason: string;
}

interface FixResult {
  totalFiles: number;
  totalFixes: number;
  fixes: ImportFix[];
  errors: Array<{ file: string; error: string }>;
}

// Common broken import patterns and their fixes
const IMPORT_PATTERNS: Array<{
  pattern: RegExp;
  getReplacement: (match: string, ...groups: string[]) => string;
  reason: string;
}> = [
  // Fix deep relative paths to lib
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/lib\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/lib/${modulePath}'`,
    reason: 'Convert deep relative path to @/lib alias',
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/lib\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/lib/${modulePath}'`,
    reason: 'Convert deep relative path to @/lib alias',
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/lib/${modulePath}'`,
    reason: 'Convert deep relative path to @/lib alias',
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/lib\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/lib/${modulePath}'`,
    reason: 'Convert deep relative path to @/lib alias',
  },

  // Fix deep relative paths to app
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/app\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/app/${modulePath}'`,
    reason: 'Convert deep relative path to @/app alias',
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/app\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/app/${modulePath}'`,
    reason: 'Convert deep relative path to @/app alias',
  },

  // Fix deep relative paths to components
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/components\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/components/${modulePath}'`,
    reason: 'Convert deep relative path to @/components alias',
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/components/${modulePath}'`,
    reason: 'Convert deep relative path to @/components alias',
  },

  // Fix apps/web prefix (incorrect monorepo references)
  {
    pattern: /from ['"]\.\.\/\.\.\/apps\/web\/lib\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/lib/${modulePath}'`,
    reason: 'Fix incorrect monorepo reference (apps/web)',
  },
  {
    pattern: /from ['"]@\/apps\/web\/lib\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/lib/${modulePath}'`,
    reason: 'Fix incorrect monorepo reference (@/apps/web)',
  },

  // Fix incorrect root-relative paths
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/web\/lib\/types\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/lib/types/${modulePath}'`,
    reason: 'Fix incorrect web/lib reference',
  },

  // Fix maya module references (common typo)
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/lib\/maya\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/lib/maya/${modulePath}'`,
    reason: 'Fix maya module deep relative path',
  },

  // Fix consciousness module references
  {
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/lib\/consciousness\/(.+)['"]/g,
    getReplacement: (_, modulePath) => `from '@/lib/consciousness/${modulePath}'`,
    reason: 'Fix consciousness module relative path',
  },

  // Fix ConsciousnessAPI references (move to correct location)
  {
    pattern: /from ['"]\.\.\/\.\.\/api\/ConsciousnessAPI['"]/g,
    getReplacement: () => `from '@/app/api/ConsciousnessAPI'`,
    reason: 'Fix ConsciousnessAPI import path',
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/apps\/api\/backend\/src\/api\/ConsciousnessAPI['"]/g,
    getReplacement: () => `from '@/app/api/ConsciousnessAPI'`,
    reason: 'Fix ConsciousnessAPI monorepo reference',
  },
];

/**
 * Find all TypeScript/JavaScript files
 */
function findSourceFiles(): string[] {
  try {
    const output = execSync('git ls-files "*.ts" "*.tsx" "*.js" "*.jsx"', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });

    return output
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
      .filter((f) => !f.includes('node_modules'))
      .filter((f) => !f.includes('.next'))
      .filter((f) => !f.includes('dist'));
  } catch (error) {
    console.error('Error finding source files:', error);
    return [];
  }
}

/**
 * Fix imports in a single file
 */
function fixImportsInFile(filePath: string, dryRun: boolean): ImportFix[] {
  const fixes: ImportFix[] = [];

  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return fixes;
  }

  let modifiedContent = content;
  const lines = content.split('\n');

  for (const { pattern, getReplacement, reason } of IMPORT_PATTERNS) {
    const matches = [...content.matchAll(pattern)];

    for (const match of matches) {
      const oldImport = match[0];
      const newImport = getReplacement(match[0], ...match.slice(1));

      if (oldImport !== newImport) {
        // Find line number
        let lineNumber = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(oldImport)) {
            lineNumber = i + 1;
            break;
          }
        }

        fixes.push({
          file: filePath,
          line: lineNumber,
          oldImport,
          newImport,
          reason,
        });

        // Apply fix
        modifiedContent = modifiedContent.replace(oldImport, newImport);
      }
    }
  }

  // Write back if not dry run and changes were made
  if (!dryRun && modifiedContent !== content) {
    fs.writeFileSync(filePath, modifiedContent, 'utf-8');
  }

  return fixes;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');

  console.log('🔧 IMPORT PATH MIGRATION (Stage 3)\n');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (preview only)' : '✍️  WRITE (applying fixes)'}`);
  console.log('='.repeat(60) + '\n');

  // Find all source files
  console.log('📂 Finding source files...\n');
  const files = findSourceFiles();
  console.log(`Found ${files.length} source files\n`);

  // Process files
  const result: FixResult = {
    totalFiles: 0,
    totalFixes: 0,
    fixes: [],
    errors: [],
  };

  for (const file of files) {
    try {
      const fileFixes = fixImportsInFile(file, dryRun);

      if (fileFixes.length > 0) {
        result.totalFiles++;
        result.totalFixes += fileFixes.length;
        result.fixes.push(...fileFixes);
      }
    } catch (error: any) {
      result.errors.push({
        file,
        error: error.message,
      });
    }
  }

  // Print summary
  console.log('\n📊 RESULTS\n');
  console.log('─'.repeat(60));
  console.log(`Files modified: ${result.totalFiles}`);
  console.log(`Total fixes: ${result.totalFixes}`);
  console.log(`Errors: ${result.errors.length}`);
  console.log('─'.repeat(60) + '\n');

  // Print fixes by file
  if (result.fixes.length > 0) {
    console.log('📝 FIXES APPLIED\n');
    console.log('─'.repeat(60));

    const fixesByFile = new Map<string, ImportFix[]>();
    for (const fix of result.fixes) {
      if (!fixesByFile.has(fix.file)) {
        fixesByFile.set(fix.file, []);
      }
      fixesByFile.get(fix.file)!.push(fix);
    }

    for (const [file, fileFixes] of fixesByFile) {
      console.log(`\n${file} (${fileFixes.length} fixes):`);
      for (const fix of fileFixes) {
        console.log(`  Line ${fix.line}:`);
        console.log(`    - ${fix.oldImport}`);
        console.log(`    + ${fix.newImport}`);
        console.log(`    → ${fix.reason}`);
      }
    }
  } else {
    console.log('✨ No import path issues found!\n');
  }

  // Print errors
  if (result.errors.length > 0) {
    console.log('\n⚠️  ERRORS\n');
    console.log('─'.repeat(60));
    for (const error of result.errors) {
      console.log(`${error.file}: ${error.error}`);
    }
    console.log('');
  }

  // Save report
  const artifactsDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const reportPath = path.join(artifactsDir, 'import-fixes.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        dryRun,
        ...result,
      },
      null,
      2
    )
  );

  console.log(`📄 Full report saved to: ${reportPath}\n`);

  // Next steps
  if (dryRun && result.totalFixes > 0) {
    console.log('💡 NEXT STEPS\n');
    console.log('─'.repeat(60));
    console.log('1. Review the fixes above');
    console.log('2. Run with --write to apply changes:');
    console.log('   npx tsx scripts/fix-import-paths.ts --write');
    console.log('3. Verify with: npm run audit:typehealth');
    console.log('4. Commit: git commit -am "refactor: fix import paths (Stage 3)"');
    console.log('');
  } else if (!dryRun && result.totalFixes > 0) {
    console.log('✅ FIXES APPLIED\n');
    console.log('─'.repeat(60));
    console.log('Next: Run type health audit to verify improvements');
    console.log('  npm run audit:typehealth');
    console.log('');
  }
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
