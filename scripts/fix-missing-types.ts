#!/usr/bin/env tsx
// scripts/fix-missing-types.ts
// Automated type error fixer - handles TS2307 (missing modules) and TS2304 (missing names)
// Analyzes typecheck output and applies targeted fixes

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TypeCheckError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  moduleName?: string;
  symbolName?: string;
}

interface FixAction {
  type: 'install_types' | 'create_stub' | 'add_import';
  description: string;
  command?: string;
  file?: string;
  content?: string;
}

// Common missing type packages mapping
const TYPE_PACKAGES: Record<string, string> = {
  'node': '@types/node',
  'react': '@types/react',
  'react-dom': '@types/react-dom',
  'jest': '@types/jest',
  'pg': '@types/pg',
  'uuid': '@types/uuid',
  'bcrypt': '@types/bcrypt',
  'jsonwebtoken': '@types/jsonwebtoken',
  'express': '@types/express',
  'cors': '@types/cors',
  'morgan': '@types/morgan'
};

// Common global types and their imports
const GLOBAL_IMPORTS: Record<string, { module: string; named?: boolean }> = {
  'Request': { module: 'express', named: true },
  'Response': { module: 'express', named: true },
  'NextRequest': { module: 'next/server', named: true },
  'NextResponse': { module: 'next/server', named: true },
  'useEffect': { module: 'react', named: true },
  'useState': { module: 'react', named: true },
  'useCallback': { module: 'react', named: true },
  'useMemo': { module: 'react', named: true },
  'useRef': { module: 'react', named: true },
  'FC': { module: 'react', named: true },
  'ReactNode': { module: 'react', named: true },
  'MouseEvent': { module: 'react', named: true },
  'ChangeEvent': { module: 'react', named: true }
};

const fixes: FixAction[] = [];
let totalErrors = 0;

/**
 * Run TypeScript compiler and capture errors
 */
function runTypeCheck(): TypeCheckError[] {
  console.log('🔍 Running TypeScript compiler...\n');

  try {
    execSync('npx tsc --noEmit --pretty false', {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log('✅ No type errors found!\n');
    return [];
  } catch (error: any) {
    const output = error.stdout || '';
    return parseTypeScriptErrors(output);
  }
}

/**
 * Parse tsc output into structured errors
 */
function parseTypeScriptErrors(output: string): TypeCheckError[] {
  const errors: TypeCheckError[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Match: path/to/file.ts(123,45): error TS2307: Cannot find module 'foo'.
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/);
    if (match) {
      const [, file, lineStr, colStr, code, message] = match;
      
      const error: TypeCheckError = {
        file: file.trim(),
        line: parseInt(lineStr, 10),
        column: parseInt(colStr, 10),
        code,
        message: message.trim()
      };

      // Extract module name for TS2307
      if (code === 'TS2307') {
        const moduleMatch = message.match(/Cannot find module ['"]([^'"]+)['"]/);
        if (moduleMatch) {
          error.moduleName = moduleMatch[1];
        }
      }

      // Extract symbol name for TS2304
      if (code === 'TS2304') {
        const symbolMatch = message.match(/Cannot find name ['"]?([^'".\s]+)['"]?/);
        if (symbolMatch) {
          error.symbolName = symbolMatch[1];
        }
      }

      errors.push(error);
    }
  }

  return errors;
}

/**
 * Analyze TS2307 errors and create fix actions
 */
function analyzeModuleErrors(errors: TypeCheckError[]): void {
  const moduleErrors = errors.filter(e => e.code === 'TS2307' && e.moduleName);
  
  // Count occurrences of each missing module
  const moduleCounts = new Map<string, number>();
  for (const error of moduleErrors) {
    const mod = error.moduleName!;
    moduleCounts.set(mod, (moduleCounts.get(mod) || 0) + 1);
  }

  console.log(`📦 Found ${moduleErrors.length} missing module errors\n`);

  // Categorize modules
  const typePackagesToInstall = new Set<string>();
  const stubModules = new Set<string>();

  for (const [moduleName, count] of moduleCounts.entries()) {
    // Check if it's a known type package
    const typePackage = TYPE_PACKAGES[moduleName];
    if (typePackage) {
      typePackagesToInstall.add(typePackage);
      fixes.push({
        type: 'install_types',
        description: `Install ${typePackage} for ${moduleName} (${count} errors)`,
        command: `npm install -D ${typePackage}`
      });
    } else if (moduleName.startsWith('.') || moduleName.startsWith('/')) {
      // Local module - skip (manual fix needed)
      continue;
    } else if (!moduleName.startsWith('@types/')) {
      // External module without types - create stub
      stubModules.add(moduleName);
      fixes.push({
        type: 'create_stub',
        description: `Create stub for ${moduleName} (${count} errors)`,
        file: `types/external/${moduleName.replace(/[^a-zA-Z0-9]/g, '_')}.d.ts`,
        content: `// Auto-generated stub for ${moduleName}\ndeclare module '${moduleName}';\n`
      });
    }
  }
}

/**
 * Analyze TS2304 errors and create fix actions
 */
function analyzeNameErrors(errors: TypeCheckError[]): void {
  const nameErrors = errors.filter(e => e.code === 'TS2304' && e.symbolName);
  
  // Count occurrences of each missing name
  const nameCounts = new Map<string, number>();
  for (const error of nameErrors) {
    const name = error.symbolName!;
    nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
  }

  console.log(`🔤 Found ${nameErrors.length} missing name errors\n`);

  // Check for known global imports
  for (const [symbolName, count] of nameCounts.entries()) {
    const importInfo = GLOBAL_IMPORTS[symbolName];
    if (importInfo) {
      fixes.push({
        type: 'add_import',
        description: `Add import for ${symbolName} from ${importInfo.module} (${count} errors)`,
        command: `# Manual: Add "import { ${symbolName} } from '${importInfo.module}';" where needed`
      });
    }
  }
}

/**
 * Apply automated fixes
 */
async function applyFixes(): Promise<void> {
  console.log('\n🔧 APPLYING FIXES\n');
  console.log('='.repeat(60));

  const typesToInstall: string[] = [];
  const stubsToCreate: Array<{ file: string; content: string }> = [];

  for (const fix of fixes) {
    console.log(`\n${fix.type}: ${fix.description}`);

    switch (fix.type) {
      case 'install_types':
        if (fix.command) {
          const pkg = fix.command.split(' ').pop()!;
          typesToInstall.push(pkg);
        }
        break;

      case 'create_stub':
        if (fix.file && fix.content) {
          stubsToCreate.push({ file: fix.file, content: fix.content });
        }
        break;

      case 'add_import':
        console.log(`  ${fix.command}`);
        break;
    }
  }

  // Install all type packages in one command
  if (typesToInstall.length > 0) {
    console.log('\n📦 Installing type packages...');
    const installCmd = `npm install -D ${typesToInstall.join(' ')}`;
    console.log(`  $ ${installCmd}`);
    
    try {
      execSync(installCmd, {
        cwd: process.cwd(),
        encoding: 'utf-8',
        stdio: 'inherit'
      });
      console.log('  ✅ Type packages installed');
    } catch (error) {
      console.error('  ❌ Failed to install type packages');
    }
  }

  // Create all stub files
  if (stubsToCreate.length > 0) {
    console.log('\n📝 Creating type stubs...');
    const typesDir = path.join(process.cwd(), 'types', 'external');
    
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    for (const { file, content } of stubsToCreate) {
      const fullPath = path.join(process.cwd(), file);
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log(`  ✅ Created ${file}`);
    }
  }
}

/**
 * Generate fix report
 */
function generateReport(errors: TypeCheckError[]): void {
  console.log('\n📊 FIX ANALYSIS REPORT');
  console.log('='.repeat(60));

  const moduleErrors = errors.filter(e => e.code === 'TS2307');
  const nameErrors = errors.filter(e => e.code === 'TS2304');

  console.log(`\nTotal TS2307 (Module) errors: ${moduleErrors.length}`);
  console.log(`Total TS2304 (Name) errors: ${nameErrors.length}`);
  console.log(`Total fixes generated: ${fixes.length}`);

  // Breakdown by fix type
  const fixTypes = fixes.reduce((acc, fix) => {
    acc[fix.type] = (acc[fix.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nFix types:');
  for (const [type, count] of Object.entries(fixTypes)) {
    console.log(`  ${type}: ${count}`);
  }

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'artifacts', 'type-fix-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalErrors: errors.length,
    moduleErrors: moduleErrors.length,
    nameErrors: nameErrors.length,
    fixes: fixes,
    errorBreakdown: {
      TS2307: moduleErrors.length,
      TS2304: nameErrors.length
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🔧 MAIA TYPE FIXER');
  console.log('='.repeat(60));
  console.log('Analyzing TypeScript errors and generating fixes...\n');

  // Run typecheck
  const errors = runTypeCheck();
  
  if (errors.length === 0) {
    console.log('🎉 No type errors found! Nothing to fix.\n');
    process.exit(0);
  }

  totalErrors = errors.length;
  console.log(`Found ${totalErrors} total type errors\n`);

  // Analyze errors
  analyzeModuleErrors(errors);
  analyzeNameErrors(errors);

  // Generate report
  generateReport(errors);

  // Apply fixes
  await applyFixes();

  console.log('\n✅ Type fixing complete!');
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Review changes: git diff');
  console.log('2. Run typecheck again: npm run typecheck');
  console.log('3. Check type health: npx tsx scripts/audit-typehealth.ts');
  console.log('4. Commit fixes: git add . && git commit -m "fix(types): auto-fix missing modules and types"');
  console.log('');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Type fixer failed:', err);
  process.exit(1);
});
