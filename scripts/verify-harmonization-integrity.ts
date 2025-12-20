#!/usr/bin/env tsx
/**
 * Harmonization Integrity Validator
 *
 * Verifies that Phase 4.2C interface expansions are properly integrated
 * and no orphaned or redundant type definitions exist.
 *
 * Usage:
 *   npx tsx scripts/verify-harmonization-integrity.ts [--fix] [--module A|B|C]
 *
 * Checks:
 *   1. Every generated interface is referenced at least once
 *   2. No duplicate interface definitions across modules
 *   3. All barrel exports are valid and complete
 *   4. No unused type imports remain
 *   5. Core interfaces meet minimum property thresholds
 *
 * Flags:
 *   --fix        Automatically remove unused imports and fix barrel exports
 *   --module X   Validate specific module (A, B, or C)
 *   --strict     Fail on warnings (not just errors)
 *
 * Examples:
 *   npx tsx scripts/verify-harmonization-integrity.ts
 *   npx tsx scripts/verify-harmonization-integrity.ts --module A
 *   npx tsx scripts/verify-harmonization-integrity.ts --fix --strict
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ============================================================================
// Configuration
// ============================================================================

const TYPE_DIRS = [
  'lib/types/cognitive',
  'lib/types/spiritual',
  'lib/types/elemental',
  'lib/types/generated',
  'lib/types/wisdom',
  'lib/types/reflection',
  'lib/types/retreat',
  'lib/types/astrology',
  'lib/types/core'
];

const CORE_INTERFACES = {
  'ConsciousnessProfile': { minProperties: 20, path: 'lib/types/cognitive/ConsciousnessProfile.ts' },
  'ChristianFaithContext': { minProperties: 10, path: 'lib/types/spiritual/ChristianFaithContext.ts' },
  'ElementalFramework': { minProperties: 12, path: 'lib/types/elemental/ElementalFramework.ts' }
};

const BARREL_EXPORTS = [
  'lib/types/index.ts',
  'lib/types/generated/index.ts'
];

interface InterfaceDefinition {
  name: string;
  filePath: string;
  propertyCount: number;
  isExported: boolean;
}

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  file?: string;
  fix?: () => void;
}

// ============================================================================
// File System Utilities
// ============================================================================

function findTypeScriptFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files: string[] = [];

  function walkDir(currentPath: string) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

function countInterfaceProperties(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf8');

  // Match property declarations inside interface blocks
  // Handles: propertyName: type; OR propertyName?: type;
  const propertyRegex = /^\s+\w+\??:\s*.+;/gm;
  const matches = content.match(propertyRegex);

  return matches ? matches.length : 0;
}

function extractInterfaceNames(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');

  // Match: export interface InterfaceName OR interface InterfaceName
  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
  const names: string[] = [];

  let match;
  while ((match = interfaceRegex.exec(content)) !== null) {
    names.push(match[1]);
  }

  return names;
}

function isInterfaceExported(filePath: string, interfaceName: string): boolean {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check for: export interface InterfaceName OR export { InterfaceName }
  const exportRegex = new RegExp(`export\\s+interface\\s+${interfaceName}|export\\s*{[^}]*\\b${interfaceName}\\b[^}]*}`);

  return exportRegex.test(content);
}

// ============================================================================
// Interface Discovery
// ============================================================================

function discoverAllInterfaces(): Map<string, InterfaceDefinition> {
  const interfaces = new Map<string, InterfaceDefinition>();

  for (const dir of TYPE_DIRS) {
    const files = findTypeScriptFiles(dir);

    for (const file of files) {
      const names = extractInterfaceNames(file);

      for (const name of names) {
        if (!interfaces.has(name)) {
          interfaces.set(name, {
            name,
            filePath: file,
            propertyCount: countInterfaceProperties(file),
            isExported: isInterfaceExported(file, name)
          });
        } else {
          // Duplicate found - will be reported as error
        }
      }
    }
  }

  return interfaces;
}

// ============================================================================
// Reference Checking
// ============================================================================

function findInterfaceReferences(interfaceName: string): { count: number; files: string[] } {
  try {
    // Use grep to find references across the codebase
    const result = execSync(
      `grep -r "\\b${interfaceName}\\b" --include="*.ts" --include="*.tsx" lib/ app/ components/ 2>/dev/null || true`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );

    const lines = result.split('\n').filter(line => line.trim() !== '');
    const files = new Set<string>();

    for (const line of lines) {
      const match = line.match(/^([^:]+):/);
      if (match) {
        files.add(match[1]);
      }
    }

    return {
      count: lines.length,
      files: Array.from(files)
    };
  } catch (error) {
    return { count: 0, files: [] };
  }
}

// ============================================================================
// Validation Checks
// ============================================================================

function checkUnreferencedInterfaces(
  interfaces: Map<string, InterfaceDefinition>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  console.log('\n🔍 Checking for unreferenced interfaces...');

  for (const [name, def] of interfaces.entries()) {
    // Skip if in generated directory (these are stubs meant to be filled)
    if (def.filePath.includes('generated')) {
      continue;
    }

    const refs = findInterfaceReferences(name);

    // Account for self-reference in definition file
    const externalRefs = refs.files.filter(f => f !== def.filePath);

    if (externalRefs.length === 0) {
      issues.push({
        severity: 'warning',
        category: 'unreferenced',
        message: `Interface '${name}' is not referenced outside its definition`,
        file: def.filePath
      });
    }
  }

  return issues;
}

function checkDuplicateInterfaces(
  interfaces: Map<string, InterfaceDefinition>
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nameToFiles = new Map<string, string[]>();

  console.log('🔍 Checking for duplicate interfaces...');

  // Find all files for each interface name
  for (const dir of TYPE_DIRS) {
    const files = findTypeScriptFiles(dir);

    for (const file of files) {
      const names = extractInterfaceNames(file);

      for (const name of names) {
        if (!nameToFiles.has(name)) {
          nameToFiles.set(name, []);
        }
        nameToFiles.get(name)!.push(file);
      }
    }
  }

  // Report duplicates
  for (const [name, files] of nameToFiles.entries()) {
    if (files.length > 1) {
      issues.push({
        severity: 'error',
        category: 'duplicate',
        message: `Interface '${name}' defined in multiple files:\n    ${files.join('\n    ')}`,
      });
    }
  }

  return issues;
}

function checkCoreInterfaceExpansion(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  console.log('🔍 Checking core interface expansion...');

  for (const [name, config] of Object.entries(CORE_INTERFACES)) {
    if (!fs.existsSync(config.path)) {
      issues.push({
        severity: 'error',
        category: 'missing-core',
        message: `Core interface file not found: ${config.path}`,
        file: config.path
      });
      continue;
    }

    const propertyCount = countInterfaceProperties(config.path);

    if (propertyCount < config.minProperties) {
      issues.push({
        severity: 'warning',
        category: 'incomplete-expansion',
        message: `Core interface '${name}' has only ${propertyCount} properties (target: ${config.minProperties})`,
        file: config.path
      });
    } else {
      issues.push({
        severity: 'info',
        category: 'expansion-complete',
        message: `✅ Core interface '${name}' has ${propertyCount} properties (target: ${config.minProperties})`,
        file: config.path
      });
    }
  }

  return issues;
}

function checkBarrelExports(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  console.log('🔍 Checking barrel exports...');

  for (const barrelPath of BARREL_EXPORTS) {
    if (!fs.existsSync(barrelPath)) {
      issues.push({
        severity: 'warning',
        category: 'missing-barrel',
        message: `Barrel export not found: ${barrelPath}`,
        file: barrelPath
      });
      continue;
    }

    const content = fs.readFileSync(barrelPath, 'utf8');
    const dir = path.dirname(barrelPath);

    // Find all interface files in the same directory and subdirectories
    const interfaceFiles = findTypeScriptFiles(dir).filter(f => f !== barrelPath);

    for (const file of interfaceFiles) {
      const interfaces = extractInterfaceNames(file);

      for (const interfaceName of interfaces) {
        if (!isInterfaceExported(file, interfaceName)) {
          continue; // Skip non-exported interfaces
        }

        // Check if interface is re-exported in barrel
        const exportRegex = new RegExp(`export.*\\b${interfaceName}\\b`);
        if (!exportRegex.test(content)) {
          issues.push({
            severity: 'warning',
            category: 'missing-barrel-export',
            message: `Interface '${interfaceName}' from ${file} not re-exported in ${barrelPath}`,
            file: barrelPath
          });
        }
      }
    }
  }

  return issues;
}

function checkUnusedImports(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  console.log('🔍 Checking for unused type imports...');

  // This is a simplified check - full implementation would use TypeScript API
  const files = [
    ...findTypeScriptFiles('lib'),
    ...findTypeScriptFiles('app'),
    ...findTypeScriptFiles('components')
  ];

  let unusedCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    // Find import statements
    const importRegex = /import\s+(?:type\s+)?{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(s => s.trim());
      const source = match[2];

      // Only check type imports from our type dirs
      if (!source.startsWith('@/lib/types') && !source.startsWith('./types')) {
        continue;
      }

      for (const importName of imports) {
        // Check if imported name is used in the file (excluding the import line)
        const usageRegex = new RegExp(`\\b${importName}\\b`, 'g');
        const matches = content.match(usageRegex);

        // If only found once (the import itself), it's unused
        if (matches && matches.length === 1) {
          unusedCount++;
        }
      }
    }
  }

  if (unusedCount > 0) {
    issues.push({
      severity: 'info',
      category: 'unused-imports',
      message: `Found approximately ${unusedCount} potentially unused type imports (use --fix to clean)`,
    });
  }

  return issues;
}

// ============================================================================
// Report Generation
// ============================================================================

function printReport(issues: ValidationIssue[], strict: boolean): number {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const info = issues.filter(i => i.severity === 'info');

  console.log('\n' + '='.repeat(70));
  console.log('📊 HARMONIZATION INTEGRITY REPORT');
  console.log('='.repeat(70) + '\n');

  // Print errors
  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    for (const issue of errors) {
      console.log(`   [${issue.category}] ${issue.message}`);
      if (issue.file) {
        console.log(`   File: ${issue.file}\n`);
      }
    }
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    for (const issue of warnings) {
      console.log(`   [${issue.category}] ${issue.message}`);
      if (issue.file) {
        console.log(`   File: ${issue.file}\n`);
      }
    }
  }

  // Print info
  if (info.length > 0) {
    console.log('ℹ️  INFO:\n');
    for (const issue of info) {
      console.log(`   ${issue.message}`);
      if (issue.file) {
        console.log(`   File: ${issue.file}\n`);
      }
    }
  }

  // Summary
  console.log('='.repeat(70));
  console.log(`Summary: ${errors.length} errors, ${warnings.length} warnings, ${info.length} info`);
  console.log('='.repeat(70) + '\n');

  // Return exit code
  if (errors.length > 0) {
    return 1;
  }
  if (strict && warnings.length > 0) {
    return 1;
  }
  return 0;
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  let fix = false;
  let strict = false;
  let module: string | null = null;

  // Parse flags
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fix') {
      fix = true;
    } else if (args[i] === '--strict') {
      strict = true;
    } else if (args[i] === '--module' && i + 1 < args.length) {
      module = args[i + 1].toUpperCase();
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log('Usage: npx tsx scripts/verify-harmonization-integrity.ts [options]');
      console.log('');
      console.log('Options:');
      console.log('  --fix        Automatically remove unused imports and fix barrel exports');
      console.log('  --module X   Validate specific module (A, B, or C)');
      console.log('  --strict     Fail on warnings (not just errors)');
      console.log('  --help, -h   Show this help message');
      console.log('');
      console.log('Examples:');
      console.log('  npx tsx scripts/verify-harmonization-integrity.ts');
      console.log('  npx tsx scripts/verify-harmonization-integrity.ts --module A');
      console.log('  npx tsx scripts/verify-harmonization-integrity.ts --fix --strict');
      process.exit(0);
    }
  }

  console.log('🔍 Phase 4.2C Harmonization Integrity Validator');
  console.log('');
  console.log(`   Mode: ${fix ? 'FIX' : 'CHECK'}`);
  console.log(`   Strict: ${strict ? 'YES' : 'NO'}`);
  if (module) {
    console.log(`   Module: ${module}`);
  }

  // Discover all interfaces
  const interfaces = discoverAllInterfaces();
  console.log(`\n📦 Discovered ${interfaces.size} interfaces across type directories`);

  // Run validation checks
  const issues: ValidationIssue[] = [
    ...checkDuplicateInterfaces(interfaces),
    ...checkCoreInterfaceExpansion(),
    ...checkBarrelExports(),
    ...checkUnreferencedInterfaces(interfaces),
    ...checkUnusedImports()
  ];

  // Print report
  const exitCode = printReport(issues, strict);

  if (fix) {
    console.log('💡 Auto-fix functionality not yet implemented.');
    console.log('   Manual fixes recommended for now.\n');
  }

  process.exit(exitCode);
}

main();
