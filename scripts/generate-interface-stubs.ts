#!/usr/bin/env tsx
/**
 * Interface Stub Generator for Phase 4.2C Module A
 *
 * Analyzes TS2339 errors (property does not exist) to identify
 * recurring property patterns and generate interface stubs.
 *
 * Usage:
 *   npx tsx scripts/generate-interface-stubs.ts [--min-count N] [--output-dir DIR]
 *
 * Flags:
 *   --min-count N     Minimum occurrences to generate stub (default: 3)
 *   --output-dir DIR  Output directory for stubs (default: lib/types/generated)
 *   --dry-run         Show what would be generated without creating files
 *
 * Examples:
 *   npx tsx scripts/generate-interface-stubs.ts
 *   npx tsx scripts/generate-interface-stubs.ts --min-count 5
 *   npx tsx scripts/generate-interface-stubs.ts --dry-run
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const TYPECHECK_LOG = 'artifacts/typecheck-full.log';
const DEFAULT_MIN_COUNT = 3;
const DEFAULT_OUTPUT_DIR = 'lib/types/generated';

interface PropertyError {
  property: string;
  type: string; // Inferred base type (e.g., "consciousness", "faith", "elemental")
  files: Set<string>;
  count: number;
  contexts: string[]; // Sample error contexts for analysis
}

interface InterfaceStub {
  name: string;
  outputPath: string;
  properties: Map<string, { count: number; files: Set<string> }>;
  category: string; // cognitive, spiritual, elemental, system, etc.
}

// ============================================================================
// Type Inference Heuristics
// ============================================================================

const TYPE_CATEGORIES = {
  consciousness: ['consciousness', 'cognitive', 'awareness', 'perception', 'integration'],
  spiritual: ['faith', 'christian', 'pastoral', 'sacred', 'divine', 'prayer'],
  elemental: ['elemental', 'earth', 'water', 'fire', 'air', 'alchemy'],
  wisdom: ['wisdom', 'oracle', 'spiralogic', 'spiral', 'gnosis'],
  reflection: ['reflection', 'journal', 'insight', 'contemplation'],
  retreat: ['retreat', 'sanctuary', 'circle', 'community'],
  astrology: ['astrology', 'natal', 'transit', 'aspect', 'planet'],
  system: ['config', 'metadata', 'settings', 'options', 'state']
};

function inferTypeCategory(property: string, contexts: string[]): string {
  const lowerProp = property.toLowerCase();

  // Check property name against category keywords
  for (const [category, keywords] of Object.entries(TYPE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (lowerProp.includes(keyword)) {
        return category;
      }
    }
  }

  // Check contexts for category hints
  const contextText = contexts.join(' ').toLowerCase();
  for (const [category, keywords] of Object.entries(TYPE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (contextText.includes(keyword)) {
        return category;
      }
    }
  }

  return 'system'; // Default fallback
}

function inferInterfaceName(category: string, properties: string[]): string {
  // Category-based naming
  const categoryMap: Record<string, string> = {
    consciousness: 'ConsciousnessProfile',
    spiritual: 'ChristianFaithContext',
    elemental: 'ElementalFramework',
    wisdom: 'WisdomOracleContext',
    reflection: 'ReflectionContext',
    retreat: 'RetreatContext',
    astrology: 'AstrologyContext',
    system: 'SystemContext'
  };

  const baseName = categoryMap[category] || 'GeneratedContext';

  // If properties suggest a more specific name, use it
  const propText = properties.join(' ').toLowerCase();
  if (propText.includes('profile') && !baseName.includes('Profile')) {
    return baseName.replace('Context', 'Profile');
  }
  if (propText.includes('session') && !baseName.includes('Session')) {
    return baseName.replace('Context', 'Session');
  }

  return baseName;
}

// ============================================================================
// Parse TS2339 Errors
// ============================================================================

function parseTS2339Errors(logPath: string): Map<string, PropertyError> {
  if (!fs.existsSync(logPath)) {
    console.error(`❌ Typecheck log not found: ${logPath}`);
    console.error('   Run: npm run typecheck -- --pretty false > artifacts/typecheck-full.log 2>&1');
    process.exit(1);
  }

  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');

  const propertyErrors = new Map<string, PropertyError>();

  // Match: file.ts(line,col): error TS2339: Property 'propertyName' does not exist on type 'TypeName'.
  const ts2339Regex = /^(.+?)\(\d+,\d+\): error TS2339: Property '([^']+)' does not exist on type '([^']+)'/;

  for (const line of lines) {
    const match = line.match(ts2339Regex);
    if (match) {
      const [, filePath, property, typeName] = match;

      if (!propertyErrors.has(property)) {
        propertyErrors.set(property, {
          property,
          type: typeName,
          files: new Set(),
          count: 0,
          contexts: []
        });
      }

      const error = propertyErrors.get(property)!;
      error.files.add(filePath);
      error.count++;

      // Store sample contexts (up to 3 per property)
      if (error.contexts.length < 3) {
        error.contexts.push(`${typeName} in ${path.basename(filePath)}`);
      }
    }
  }

  return propertyErrors;
}

// ============================================================================
// Cluster Properties into Interfaces
// ============================================================================

function clusterPropertiesIntoInterfaces(
  propertyErrors: Map<string, PropertyError>,
  minCount: number
): Map<string, InterfaceStub> {
  const interfaces = new Map<string, InterfaceStub>();

  // Filter properties by minimum occurrence count
  const qualifyingProperties = Array.from(propertyErrors.values()).filter(
    (prop) => prop.count >= minCount
  );

  console.log(`\n📊 Found ${qualifyingProperties.length} properties with ≥${minCount} occurrences\n`);

  // Group properties by inferred category
  const categorizedProperties = new Map<string, PropertyError[]>();

  for (const prop of qualifyingProperties) {
    const category = inferTypeCategory(prop.property, prop.contexts);

    if (!categorizedProperties.has(category)) {
      categorizedProperties.set(category, []);
    }

    categorizedProperties.get(category)!.push(prop);
  }

  // Generate interface stubs for each category
  for (const [category, props] of categorizedProperties.entries()) {
    const interfaceName = inferInterfaceName(
      category,
      props.map((p) => p.property)
    );

    // Determine output path based on category
    const categoryPath = category === 'system' ? 'core' : category;
    const outputPath = path.join(DEFAULT_OUTPUT_DIR, categoryPath, `${interfaceName}.ts`);

    const stub: InterfaceStub = {
      name: interfaceName,
      outputPath,
      properties: new Map(),
      category
    };

    for (const prop of props) {
      stub.properties.set(prop.property, {
        count: prop.count,
        files: prop.files
      });
    }

    interfaces.set(interfaceName, stub);
  }

  return interfaces;
}

// ============================================================================
// Generate Interface Files
// ============================================================================

function generateInterfaceFile(stub: InterfaceStub): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const properties = Array.from(stub.properties.entries())
    .sort((a, b) => b[1].count - a[1].count); // Sort by occurrence count

  let content = `/**
 * ${stub.name}
 *
 * Auto-generated interface stub from TS2339 error analysis.
 * Phase 4.2C Module A — Interface Expansion
 *
 * Generated: ${timestamp}
 * Category: ${stub.category}
 * Properties: ${properties.length}
 *
 * INSTRUCTIONS:
 * 1. Review and refine property types (currently all 'any')
 * 2. Add documentation for each property
 * 3. Consider splitting into sub-interfaces if >20 properties
 * 4. Add to barrel export in lib/types/index.ts
 */

export interface ${stub.name} {
`;

  for (const [propName, info] of properties) {
    const occurrences = info.count;
    const fileCount = info.files.size;
    content += `  /**\n`;
    content += `   * Property found in ${fileCount} file${fileCount === 1 ? '' : 's'} (${occurrences} occurrence${occurrences === 1 ? '' : 's'})\n`;
    content += `   * TODO: Add description and refine type\n`;
    content += `   */\n`;
    content += `  ${propName}?: any; // TODO: Replace 'any' with specific type\n\n`;
  }

  content += `}\n`;

  return content;
}

function writeInterfaceStubs(
  interfaces: Map<string, InterfaceStub>,
  dryRun: boolean
): void {
  console.log(`\n📝 ${dryRun ? 'DRY RUN - Would generate' : 'Generating'} ${interfaces.size} interface stubs...\n`);

  for (const [name, stub] of interfaces.entries()) {
    const content = generateInterfaceFile(stub);

    if (dryRun) {
      console.log(`📄 ${stub.outputPath}`);
      console.log(`   Interface: ${name}`);
      console.log(`   Category: ${stub.category}`);
      console.log(`   Properties: ${stub.properties.size}`);
      console.log(`   Top properties by count:`);

      const topProps = Array.from(stub.properties.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);

      for (const [propName, info] of topProps) {
        console.log(`     - ${propName} (${info.count} occurrences)`);
      }
      console.log('');
    } else {
      // Create directory if it doesn't exist
      const dir = path.dirname(stub.outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write file
      fs.writeFileSync(stub.outputPath, content, 'utf8');
      console.log(`✅ Created: ${stub.outputPath} (${stub.properties.size} properties)`);
    }
  }
}

// ============================================================================
// Generate Barrel Export
// ============================================================================

function generateBarrelExport(interfaces: Map<string, InterfaceStub>, dryRun: boolean): void {
  const indexPath = path.join(DEFAULT_OUTPUT_DIR, 'index.ts');

  let content = `/**
 * Generated Interface Stubs - Barrel Export
 *
 * Auto-generated by generate-interface-stubs.ts
 * Phase 4.2C Module A — Interface Expansion
 *
 * Generated: ${new Date().toISOString().split('T')[0]}
 */

`;

  // Group exports by category
  const byCategory = new Map<string, InterfaceStub[]>();
  for (const stub of interfaces.values()) {
    if (!byCategory.has(stub.category)) {
      byCategory.set(stub.category, []);
    }
    byCategory.get(stub.category)!.push(stub);
  }

  for (const [category, stubs] of byCategory.entries()) {
    content += `// ${category.charAt(0).toUpperCase() + category.slice(1)} Interfaces\n`;
    for (const stub of stubs) {
      const relativePath = `./${stub.category}/${stub.name}`;
      content += `export type { ${stub.name} } from '${relativePath}';\n`;
    }
    content += '\n';
  }

  if (dryRun) {
    console.log(`\n📄 Would create barrel export: ${indexPath}\n`);
  } else {
    const dir = path.dirname(indexPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log(`\n✅ Created barrel export: ${indexPath}\n`);
  }
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);

  let minCount = DEFAULT_MIN_COUNT;
  let dryRun = false;

  // Parse flags
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--min-count' && i + 1 < args.length) {
      minCount = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log('Usage: npx tsx scripts/generate-interface-stubs.ts [options]');
      console.log('');
      console.log('Options:');
      console.log('  --min-count N   Minimum occurrences to generate stub (default: 3)');
      console.log('  --dry-run       Show what would be generated without creating files');
      console.log('  --help, -h      Show this help message');
      console.log('');
      console.log('Examples:');
      console.log('  npx tsx scripts/generate-interface-stubs.ts');
      console.log('  npx tsx scripts/generate-interface-stubs.ts --min-count 5');
      console.log('  npx tsx scripts/generate-interface-stubs.ts --dry-run');
      process.exit(0);
    }
  }

  console.log(`🔍 Analyzing TS2339 errors from ${TYPECHECK_LOG}...\n`);
  console.log(`   Minimum occurrence threshold: ${minCount}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'WRITE FILES'}\n`);

  // Parse errors
  const propertyErrors = parseTS2339Errors(TYPECHECK_LOG);
  console.log(`📊 Total unique TS2339 properties: ${propertyErrors.size}`);

  // Cluster into interfaces
  const interfaces = clusterPropertiesIntoInterfaces(propertyErrors, minCount);

  if (interfaces.size === 0) {
    console.log('\n⚠️  No interfaces to generate with current threshold.');
    console.log('   Try lowering --min-count or check that typecheck-full.log exists.\n');
    process.exit(0);
  }

  // Generate interface files
  writeInterfaceStubs(interfaces, dryRun);

  // Generate barrel export
  generateBarrelExport(interfaces, dryRun);

  // Summary
  const totalProperties = Array.from(interfaces.values()).reduce(
    (sum, stub) => sum + stub.properties.size,
    0
  );

  console.log(`📊 Generation Summary:`);
  console.log(`   Interfaces: ${interfaces.size}`);
  console.log(`   Properties: ${totalProperties}`);
  console.log(`   Output: ${DEFAULT_OUTPUT_DIR}/`);

  if (dryRun) {
    console.log(`\n💡 Run without --dry-run to create files\n`);
  } else {
    console.log(`\n✅ Interface stubs generated successfully!\n`);
    console.log(`📝 Next steps:`);
    console.log(`   1. Review generated interfaces in ${DEFAULT_OUTPUT_DIR}/`);
    console.log(`   2. Refine property types (replace 'any' with specific types)`);
    console.log(`   3. Add documentation for each property`);
    console.log(`   4. Add exports to lib/types/index.ts`);
    console.log(`   5. Run: npx tsx scripts/add-missing-type-imports.ts`);
    console.log(`   6. Verify: npm run typecheck\n`);
  }
}

main();
