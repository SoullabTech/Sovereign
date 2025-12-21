#!/usr/bin/env tsx

/**
 * Phase 4.2D Pre-Integration Analysis
 *
 * Analyzes consciousness-biomarkers.ts to:
 * 1. Extract all type definitions (unions, interfaces, type aliases)
 * 2. Map dependencies to canonical types
 * 3. Detect naming conflicts with existing types
 * 4. Generate import path mappings
 *
 * Outputs:
 * - artifacts/phase4.2d-analysis/biomarker-dependency-graph.json
 * - artifacts/phase4.2d-analysis/biomarker-conflict-report.json
 * - artifacts/phase4.2d-analysis/biomarker-import-map.json
 */

import fs from 'fs';
import path from 'path';

const SOURCE_FILE = '/Users/soullab/MAIA-PAI-SOVEREIGN/lib/types/consciousness-biomarkers.ts';
const OUTPUT_DIR = 'artifacts/phase4.2d-analysis';
const TYPES_DIR = 'lib/types';

interface TypeDefinition {
  name: string;
  kind: 'interface' | 'type' | 'union' | 'enum';
  line: number;
  exported: boolean;
  properties?: string[];
  extends?: string[];
  category?: string;
}

interface DependencyGraph {
  sourceFile: string;
  totalTypes: number;
  exportedTypes: number;
  imports: {
    module: string;
    types: string[];
  }[];
  typeDefinitions: TypeDefinition[];
  categories: Record<string, string[]>;
}

interface ConflictReport {
  totalBiomarkerTypes: number;
  totalExistingTypes: number;
  conflicts: {
    name: string;
    biomarkerLocation: string;
    existingLocations: string[];
    severity: 'high' | 'medium' | 'low';
    resolution: string;
  }[];
  summary: {
    high: number;
    medium: number;
    low: number;
    noConflicts: number;
  };
}

interface ImportMapping {
  sourceImports: {
    from: string;
    types: string[];
  }[];
  targetMappings: {
    sourceType: string;
    targetPath: string;
    exists: boolean;
    action: 'use-canonical' | 'needs-creation' | 'conflict-resolution';
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1: Parse Source File
// ═══════════════════════════════════════════════════════════════════════════════

function parseSourceFile(filePath: string): DependencyGraph {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const graph: DependencyGraph = {
    sourceFile: filePath,
    totalTypes: 0,
    exportedTypes: 0,
    imports: [],
    typeDefinitions: [],
    categories: {}
  };

  let currentCategory = 'General';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Detect category headers (from comments)
    if (line.includes('═══════════════')) {
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.includes('//')) {
        currentCategory = nextLine.replace(/\/\//g, '').trim();
      }
    }

    // Detect imports
    const importMatch = line.match(/import type \{ (.+) \} from ['"](.+)['"]/);
    if (importMatch) {
      const types = importMatch[1].split(',').map(t => t.trim());
      const module = importMatch[2];
      graph.imports.push({ module, types });
    }

    // Detect exported type definitions
    const exportTypeMatch = line.match(/export (type|interface) (\w+)/);
    if (exportTypeMatch) {
      const kind = exportTypeMatch[1] as 'type' | 'interface';
      const name = exportTypeMatch[2];

      const typeDef: TypeDefinition = {
        name,
        kind: line.includes('=') ? 'union' : kind,
        line: lineNum,
        exported: true,
        category: currentCategory
      };

      // Detect extends
      const extendsMatch = line.match(/extends (.+)/);
      if (extendsMatch) {
        typeDef.extends = extendsMatch[1]
          .split(',')
          .map(e => e.trim())
          .filter(e => !e.includes('{'));
      }

      graph.typeDefinitions.push(typeDef);
      graph.totalTypes++;
      graph.exportedTypes++;

      // Add to category
      if (!graph.categories[currentCategory]) {
        graph.categories[currentCategory] = [];
      }
      graph.categories[currentCategory].push(name);
    }
  }

  return graph;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2: Find Existing Canonical Types
// ═══════════════════════════════════════════════════════════════════════════════

function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.next') {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

function findExistingTypes(): Map<string, string[]> {
  const typeFiles = getAllTsFiles(TYPES_DIR);

  const existingTypes = new Map<string, string[]>();

  for (const file of typeFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const exportMatch = line.match(/export (type|interface) (\w+)/);
      if (exportMatch) {
        const typeName = exportMatch[2];
        const locations = existingTypes.get(typeName) || [];
        locations.push(file);
        existingTypes.set(typeName, locations);
      }
    }
  }

  return existingTypes;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: Detect Conflicts
// ═══════════════════════════════════════════════════════════════════════════════

function detectConflicts(
  biomarkerTypes: TypeDefinition[],
  existingTypes: Map<string, string[]>
): ConflictReport {
  const report: ConflictReport = {
    totalBiomarkerTypes: biomarkerTypes.length,
    totalExistingTypes: existingTypes.size,
    conflicts: [],
    summary: {
      high: 0,
      medium: 0,
      low: 0,
      noConflicts: 0
    }
  };

  for (const biomarkerType of biomarkerTypes) {
    const existingLocations = existingTypes.get(biomarkerType.name);

    if (existingLocations && existingLocations.length > 0) {
      // Determine severity
      let severity: 'high' | 'medium' | 'low' = 'low';
      let resolution = 'No action needed';

      if (biomarkerType.extends && biomarkerType.extends.length > 0) {
        // Type that extends others - high priority to resolve
        severity = 'high';
        resolution = 'Verify compatibility with existing type or rename biomarker version';
      } else if (biomarkerType.kind === 'interface') {
        // Interface conflict - medium priority
        severity = 'medium';
        resolution = 'Compare properties; merge if compatible, rename if different';
      } else {
        // Union/type alias - low priority
        severity = 'low';
        resolution = 'Verify union members match; rename if different';
      }

      report.conflicts.push({
        name: biomarkerType.name,
        biomarkerLocation: `${SOURCE_FILE}:${biomarkerType.line}`,
        existingLocations,
        severity,
        resolution
      });

      report.summary[severity]++;
    } else {
      report.summary.noConflicts++;
    }
  }

  return report;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: Generate Import Mappings
// ═══════════════════════════════════════════════════════════════════════════════

function generateImportMappings(
  sourceImports: { module: string; types: string[] }[],
  existingTypes: Map<string, string[]>
): ImportMapping {
  const mapping: ImportMapping = {
    sourceImports,
    targetMappings: []
  };

  for (const importGroup of sourceImports) {
    for (const typeName of importGroup.types) {
      const existingLocations = existingTypes.get(typeName);

      if (existingLocations && existingLocations.length > 0) {
        // Type exists - use canonical location
        const canonicalPath = existingLocations[0].replace(/^lib\/types\//, '@/lib/types/').replace(/\.ts$/, '');
        mapping.targetMappings.push({
          sourceType: typeName,
          targetPath: canonicalPath,
          exists: true,
          action: 'use-canonical'
        });
      } else {
        // Type doesn't exist - needs creation
        mapping.targetMappings.push({
          sourceType: typeName,
          targetPath: '@/lib/types',
          exists: false,
          action: 'needs-creation'
        });
      }
    }
  }

  return mapping;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🔍 Phase 4.2D Pre-Integration Analysis\n');

  // Step 1: Parse source file
  console.log('📄 Parsing consciousness-biomarkers.ts...');
  const dependencyGraph = parseSourceFile(SOURCE_FILE);
  console.log(`   ✅ Found ${dependencyGraph.totalTypes} type definitions`);
  console.log(`   ✅ Exported: ${dependencyGraph.exportedTypes}`);
  console.log(`   ✅ Categories: ${Object.keys(dependencyGraph.categories).length}`);
  console.log(`   ✅ Imports: ${dependencyGraph.imports.length} modules\n`);

  // Step 2: Find existing types
  console.log('🔎 Scanning existing canonical types...');
  const existingTypes = findExistingTypes();
  console.log(`   ✅ Found ${existingTypes.size} existing types in ${TYPES_DIR}\n`);

  // Step 3: Detect conflicts
  console.log('⚠️  Detecting naming conflicts...');
  const conflictReport = detectConflicts(dependencyGraph.typeDefinitions, existingTypes);
  console.log(`   ✅ Analyzed ${conflictReport.totalBiomarkerTypes} biomarker types`);
  console.log(`   ℹ️  Conflicts found: ${conflictReport.conflicts.length}`);
  console.log(`      - High severity: ${conflictReport.summary.high}`);
  console.log(`      - Medium severity: ${conflictReport.summary.medium}`);
  console.log(`      - Low severity: ${conflictReport.summary.low}`);
  console.log(`      - No conflicts: ${conflictReport.summary.noConflicts}\n`);

  // Step 4: Generate import mappings
  console.log('🗺️  Generating import path mappings...');
  const importMapping = generateImportMappings(dependencyGraph.imports, existingTypes);
  console.log(`   ✅ Mapped ${importMapping.targetMappings.length} import types`);
  console.log(`      - Use canonical: ${importMapping.targetMappings.filter(m => m.action === 'use-canonical').length}`);
  console.log(`      - Needs creation: ${importMapping.targetMappings.filter(m => m.action === 'needs-creation').length}\n`);

  // Write outputs
  console.log('💾 Writing analysis reports...');

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'biomarker-dependency-graph.json'),
    JSON.stringify(dependencyGraph, null, 2)
  );
  console.log(`   ✅ ${OUTPUT_DIR}/biomarker-dependency-graph.json`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'biomarker-conflict-report.json'),
    JSON.stringify(conflictReport, null, 2)
  );
  console.log(`   ✅ ${OUTPUT_DIR}/biomarker-conflict-report.json`);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'biomarker-import-map.json'),
    JSON.stringify(importMapping, null, 2)
  );
  console.log(`   ✅ ${OUTPUT_DIR}/biomarker-import-map.json\n`);

  // Summary
  console.log('📊 ANALYSIS SUMMARY\n');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Total biomarker types:      ${dependencyGraph.totalTypes}`);
  console.log(`Exported types:             ${dependencyGraph.exportedTypes}`);
  console.log(`Framework categories:       ${Object.keys(dependencyGraph.categories).length}`);
  console.log(`Source imports:             ${dependencyGraph.imports.length}`);
  console.log(`Existing canonical types:   ${existingTypes.size}`);
  console.log(`Naming conflicts:           ${conflictReport.conflicts.length}`);
  console.log(`  - High severity:          ${conflictReport.summary.high}`);
  console.log(`  - Medium severity:        ${conflictReport.summary.medium}`);
  console.log(`  - Low severity:           ${conflictReport.summary.low}`);
  console.log(`Types needing no action:    ${conflictReport.summary.noConflicts}`);
  console.log('════════════════════════════════════════════════════════════\n');

  if (conflictReport.conflicts.length === 0) {
    console.log('✅ NO CONFLICTS DETECTED - Ready to proceed with integration\n');
  } else {
    console.log('⚠️  CONFLICTS DETECTED - Review conflict report before proceeding\n');
    console.log('High-priority conflicts:');
    conflictReport.conflicts
      .filter(c => c.severity === 'high')
      .forEach(c => {
        console.log(`   - ${c.name} (${c.biomarkerLocation})`);
        console.log(`     Resolution: ${c.resolution}`);
      });
    console.log('');
  }

  console.log('🟢 Phase 4.2D Pre-Integration Analysis Complete\n');
}

main().catch(err => {
  console.error('❌ Analysis failed:', err);
  process.exit(1);
});
