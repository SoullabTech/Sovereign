#!/usr/bin/env tsx
/**
 * Validates component type references against canonical definitions
 * Phase 4.2C Module C automation - Component Reference Validation
 *
 * Usage:
 *   npx tsx scripts/validate-component-refs.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface TypeConflict {
  componentFile: string;
  localType: string;
  canonicalType: string | null;
  conflictType: 'duplicate' | 'variation' | 'component-specific';
  lineNumber: number;
  snippet: string;
}

interface ValidationReport {
  totalComponents: number;
  componentsUsingCanonical: number;
  componentsWithLocalTypes: number;
  conflicts: TypeConflict[];
  percentCanonical: number;
  generatedAt: string;
}

// Known canonical types from Phase 4.2C Module A
const CANONICAL_TYPES = [
  'ConsciousnessProfile',
  'ChristianFaithContext',
  'ElementalFramework',
  'SystemContext',
  'WisdomOracleContext',
  'AstrologyContext',
  'ReflectionContext',
  'AttentionState',
  'WisdomPlan',
  'MemoryIntegration',
  'EmotionalResonance',
  'MaiaTurnFeedbackPayload',
  'SoulAuthenticationResult'
];

/**
 * Find all React component files
 */
function findComponentFiles(): string[] {
  try {
    const output = execSync(
      `find app components lib -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v ".next" | grep -v "test" | grep -v "spec"`,
      { encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 }
    );
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding component files:', error);
    return [];
  }
}

/**
 * Check if file defines local types that might conflict with canonical ones
 */
function analyzeComponentTypes(filePath: string): {
  usesCanonical: boolean;
  localTypes: string[];
  conflicts: TypeConflict[];
} {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const usesCanonical = CANONICAL_TYPES.some(type =>
      content.includes(`import`) && content.includes(type) && content.includes('@/lib/types')
    );

    const localTypes: string[] = [];
    const conflicts: TypeConflict[] = [];

    // Find local interface/type definitions
    const typeDefPattern = /^(export\s+)?(interface|type)\s+([A-Z][A-Za-z0-9]*)/;

    lines.forEach((line, index) => {
      const match = line.match(typeDefPattern);
      if (match) {
        const typeName = match[3];
        localTypes.push(typeName);

        // Check if this conflicts with a canonical type
        if (CANONICAL_TYPES.includes(typeName)) {
          // Check if it's imported from canonical location
          const importsCanonical = content.includes(`import type { ${typeName} }`) ||
                                   content.includes(`import { ${typeName} }`);

          if (!importsCanonical) {
            conflicts.push({
              componentFile: filePath,
              localType: typeName,
              canonicalType: typeName,
              conflictType: 'duplicate',
              lineNumber: index + 1,
              snippet: line.trim()
            });
          }
        }
      }
    });

    return {
      usesCanonical,
      localTypes,
      conflicts
    };
  } catch (error) {
    return {
      usesCanonical: false,
      localTypes: [],
      conflicts: []
    };
  }
}

async function validateComponentRefs(): Promise<void> {
  console.log('🔍 Validating component type references...\n');

  const componentFiles = findComponentFiles();
  console.log(`📊 Analyzing ${componentFiles.length} component files...\n`);

  let componentsUsingCanonical = 0;
  let componentsWithLocalTypes = 0;
  const allConflicts: TypeConflict[] = [];

  for (const file of componentFiles) {
    const analysis = analyzeComponentTypes(file);

    if (analysis.usesCanonical) {
      componentsUsingCanonical++;
    }

    if (analysis.localTypes.length > 0) {
      componentsWithLocalTypes++;
    }

    allConflicts.push(...analysis.conflicts);
  }

  const percentCanonical = componentFiles.length > 0
    ? Math.round((componentsUsingCanonical / componentFiles.length) * 100)
    : 0;

  // Build report
  const report: ValidationReport = {
    totalComponents: componentFiles.length,
    componentsUsingCanonical,
    componentsWithLocalTypes,
    conflicts: allConflicts,
    percentCanonical,
    generatedAt: new Date().toISOString()
  };

  // Save JSON report
  const reportPath = 'artifacts/component-validation-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Print summary to console
  console.log('📊 VALIDATION SUMMARY');
  console.log('════════════════════════════════════════════════════════════\n');
  console.log(`Total components analyzed: ${report.totalComponents}`);
  console.log(`Components using canonical types: ${report.componentsUsingCanonical} (${report.percentCanonical}%)`);
  console.log(`Components with local type definitions: ${report.componentsWithLocalTypes}`);
  console.log(`Type conflicts detected: ${report.conflicts.length}\n`);

  if (report.conflicts.length > 0) {
    console.log('🔧 TYPE CONFLICTS DETECTED:\n');

    // Group by conflict type
    const duplicates = report.conflicts.filter(c => c.conflictType === 'duplicate');

    if (duplicates.length > 0) {
      console.log(`  Duplicate Types (${duplicates.length}):`);
      console.log('  ────────────────────────────────────────────────────────────\n');

      duplicates.forEach(conflict => {
        console.log(`  ${conflict.componentFile}:${conflict.lineNumber}`);
        console.log(`    Local type: ${conflict.localType}`);
        console.log(`    Canonical: @/lib/types/${conflict.canonicalType}`);
        console.log(`    Code: ${conflict.snippet}`);
        console.log();
      });
    }
  } else {
    console.log('✅ No type conflicts detected!\n');
    console.log('All components either:');
    console.log('  • Import canonical types from @/lib/types');
    console.log('  • Define legitimate component-specific types');
    console.log('  • Use only primitive/React types\n');
  }

  console.log(`📁 Full report saved to: ${reportPath}\n`);

  if (report.conflicts.length > 0) {
    console.log('⚠️  RECOMMENDED ACTIONS:\n');
    console.log('  For each conflict:');
    console.log('  1. Remove the local type definition');
    console.log('  2. Import the canonical type from @/lib/types');
    console.log('  3. Verify the component compiles without errors\n');
  }

  console.log('✅ Component reference validation complete.\n');
}

validateComponentRefs().catch(console.error);
