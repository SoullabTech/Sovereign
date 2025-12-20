#!/usr/bin/env tsx
/**
 * Add Missing Type Imports
 *
 * Automatically adds import statements for newly defined types
 * (ConsciousnessProfile, ChristianFaithContext, ElementalFramework)
 * to files that reference them.
 */

import fs from 'fs';

const FILES = [
  'lib/cognitive-engines/actr-memory.ts',
  'lib/cognitive-engines/lida-workspace.ts',
  'lib/cognitive-engines/micropsi-core.ts',
  'lib/cognitive-engines/soar-planner.ts',
  'lib/faith-integration/christian-pastoral-care-system.ts',
  'lib/faith-integration/christian-universal-wisdom-bridge.ts',
  'lib/faith-integration/expanded-christian-wisdom-repository.ts',
  'lib/spiritual-guidance/interfaith-prompting-system.ts',
  'lib/spiritual-guidance/ritual-language-model.ts',
];

const IMPORT_STATEMENT = `import { ConsciousnessProfile, ChristianFaithContext, ElementalFramework } from '@/lib/types';\n`;

let filesModified = 0;

FILES.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  SKIP (not found): ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Check if import already exists
  if (content.includes('@/lib/types') || content.includes('./types')) {
    console.log(`⏭️  SKIP (has import): ${filePath}`);
    return;
  }

  // Find the position to insert (after existing imports, before first non-import line)
  const lines = content.split('\n');
  let insertIndex = 0;
  let inMultiLineComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track multi-line comment state
    if (line.startsWith('/**') || line.startsWith('/*')) {
      inMultiLineComment = true;
    }
    if (inMultiLineComment) {
      if (line.includes('*/')) {
        inMultiLineComment = false;
      }
      insertIndex = i + 1;
      continue;
    }

    // Skip single-line comments and empty lines at the start
    if (line.startsWith('//') || line === '') {
      insertIndex = i + 1;
      continue;
    }

    // If it's an import statement, continue
    if (line.startsWith('import ')) {
      insertIndex = i + 1;
      continue;
    }

    // If it's an export statement that's NOT an interface/type/const declaration, continue
    if (line.startsWith('export {') || line.startsWith('export *') || line.startsWith('export default')) {
      insertIndex = i + 1;
      continue;
    }

    // Found first non-import line (including export interface/type/const), insert before it
    break;
  }

  // Insert the import statement
  lines.splice(insertIndex, 0, IMPORT_STATEMENT);

  // Write back
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  filesModified++;
  console.log(`✅  ADDED: ${filePath}`);
});

console.log(`\n📊  Summary:`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Import added: ConsciousnessProfile, ChristianFaithContext, ElementalFramework`);
console.log(`\n🔍  Next: npm run audit:typehealth to verify impact`);
