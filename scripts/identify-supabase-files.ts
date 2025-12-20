#!/usr/bin/env tsx
/**
 * Identify Supabase Files for Exclusion
 *
 * Analyzes typecheck errors to find all files with Supabase symbol usage
 * (supabase, createClient, createClientComponentClient, SupabaseClient, etc.)
 *
 * Output: List of files to add to tsconfig.json exclude
 */

import fs from 'fs';
import path from 'path';

const TYPECHECK_LOG = 'artifacts/typecheck-full.log';
const OUTPUT_FILE = 'artifacts/supabase-files-to-exclude.txt';

// Supabase-related symbols
const SUPABASE_SYMBOLS = [
  'supabase',
  'createClient',
  'createClientComponentClient',
  'createServerComponentClient',
  'createRouteHandlerClient',
  'SupabaseClient',
  'AuthError',
  'Session',
  'User'
];

interface FileErrorCount {
  file: string;
  errors: number;
  symbols: Set<string>;
}

function parseTypecheckLog(): Map<string, FileErrorCount> {
  const content = fs.readFileSync(TYPECHECK_LOG, 'utf8');
  const lines = content.split('\n');

  const fileMap = new Map<string, FileErrorCount>();

  for (const line of lines) {
    // Match: file.ts(line,col): error TS2304: Cannot find name 'symbolName'
    const match = line.match(/^(.+?)\(\d+,\d+\): error TS2304: Cannot find name '([^']+)'/);

    if (match) {
      const [, filePath, symbolName] = match;

      // Check if symbol is Supabase-related
      if (SUPABASE_SYMBOLS.includes(symbolName)) {
        if (!fileMap.has(filePath)) {
          fileMap.set(filePath, {
            file: filePath,
            errors: 0,
            symbols: new Set()
          });
        }

        const entry = fileMap.get(filePath)!;
        entry.errors++;
        entry.symbols.add(symbolName);
      }
    }
  }

  return fileMap;
}

function main() {
  console.log('🔍 Analyzing Supabase symbol usage in typecheck errors...\n');

  const fileMap = parseTypecheckLog();

  // Convert to array and sort by error count
  const files = Array.from(fileMap.values())
    .sort((a, b) => b.errors - a.errors);

  console.log(`📊 Found ${files.length} files with Supabase symbols\n`);

  // Print summary
  console.log('────────────────────────────────────────────────────────────');
  console.log('File                                           Errors  Symbols');
  console.log('────────────────────────────────────────────────────────────');

  let totalErrors = 0;

  for (const { file, errors, symbols } of files) {
    const shortFile = file.length > 45 ? '...' + file.slice(-42) : file;
    const symbolList = Array.from(symbols).join(', ');
    console.log(`${shortFile.padEnd(45)} ${errors.toString().padStart(6)}  ${symbolList}`);
    totalErrors += errors;
  }

  console.log('────────────────────────────────────────────────────────────');
  console.log(`TOTAL: ${files.length} files, ${totalErrors} errors\n`);

  // Generate exclusion list
  const exclusionList = files.map(f => f.file).join('\n');
  fs.writeFileSync(OUTPUT_FILE, exclusionList, 'utf8');

  console.log(`✅ Wrote exclusion list to: ${OUTPUT_FILE}`);
  console.log(`\n💡 Next: Add these files to tsconfig.json exclude array`);

  // Generate tsconfig snippet
  const tsconfigSnippet = files.map(f => `    "${f}",`).join('\n');
  const snippetFile = 'artifacts/tsconfig-exclude-snippet.txt';
  fs.writeFileSync(snippetFile, tsconfigSnippet, 'utf8');

  console.log(`📄 Generated tsconfig snippet: ${snippetFile}\n`);

  // Summary by symbol
  console.log('📋 Error breakdown by symbol:');
  const symbolCounts = new Map<string, number>();

  for (const { symbols } of files) {
    for (const symbol of symbols) {
      symbolCounts.set(symbol, (symbolCounts.get(symbol) || 0) + 1);
    }
  }

  const sortedSymbols = Array.from(symbolCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  for (const [symbol, count] of sortedSymbols) {
    console.log(`  ${symbol.padEnd(35)} ${count} files`);
  }

  console.log('\n✨ Analysis complete.');
}

main();
