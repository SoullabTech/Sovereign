#!/usr/bin/env tsx
/**
 * Add Missing Imports (React + Components)
 *
 * Analyzes TS2304 errors and automatically adds missing imports for:
 * - React hooks (useState, useEffect, etc.)
 * - UI components (StatCard, Description, Tab, etc.)
 *
 * Phase 4.2B Step 6.2
 */

import fs from 'fs';
import path from 'path';

const TYPECHECK_LOG = 'artifacts/typecheck-full.log';

// React hooks to detect
const REACT_HOOKS = [
  'useState',
  'useEffect',
  'useCallback',
  'useMemo',
  'useRef',
  'useContext',
  'useReducer',
  'useLayoutEffect',
  'useImperativeHandle',
  'useDebugValue'
];

// Component mapping (component name → import path)
const COMPONENT_MAP: Record<string, string> = {
  // Stat components
  'StatCard': '@/components/ui/stat-card',
  'StatValue': '@/components/ui/stat-card',
  'StatLabel': '@/components/ui/stat-card',
  'StatIcon': '@/components/ui/stat-card',

  // UI primitives
  'Tab': '@/components/ui/tabs',
  'Description': '@/components/ui/description',
  'ScrollView': '@/components/ui/scroll-view',
  'Title': '@/components/ui/title',
};

interface FileImportNeeds {
  file: string;
  reactHooks: Set<string>;
  components: Map<string, string>; // component name → import path
}

function parseTypecheckLog(): Map<string, FileImportNeeds> {
  const content = fs.readFileSync(TYPECHECK_LOG, 'utf8');
  const lines = content.split('\n');

  const fileMap = new Map<string, FileImportNeeds>();

  for (const line of lines) {
    // Match: file.ts(line,col): error TS2304: Cannot find name 'symbolName'
    const match = line.match(/^(.+?)\(\d+,\d+\): error TS2304: Cannot find name '([^']+)'/);

    if (match) {
      const [, filePath, symbolName] = match;

      // Skip if file doesn't exist or is not .ts/.tsx
      if (!fs.existsSync(filePath) || (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx'))) {
        continue;
      }

      if (!fileMap.has(filePath)) {
        fileMap.set(filePath, {
          file: filePath,
          reactHooks: new Set(),
          components: new Map()
        });
      }

      const entry = fileMap.get(filePath)!;

      // Check if it's a React hook
      if (REACT_HOOKS.includes(symbolName)) {
        entry.reactHooks.add(symbolName);
      }

      // Check if it's a known component
      if (COMPONENT_MAP[symbolName]) {
        entry.components.set(symbolName, COMPONENT_MAP[symbolName]);
      }
    }
  }

  // Filter out files that don't need any imports
  const filtered = new Map<string, FileImportNeeds>();
  for (const [file, needs] of fileMap) {
    if (needs.reactHooks.size > 0 || needs.components.size > 0) {
      filtered.set(file, needs);
    }
  }

  return filtered;
}

function addImportsToFile(filePath: string, needs: FileImportNeeds): boolean {
  const content = fs.readFileSync(filePath, 'utf8');

  // Check if imports already exist
  const hasReactImport = content.includes("from 'react'") || content.includes('from "react"');
  const existingComponentImports = new Set<string>();

  for (const [component, importPath] of needs.components) {
    if (content.includes(`from '${importPath}'`) || content.includes(`from "${importPath}"`)) {
      existingComponentImports.add(component);
    }
  }

  // Remove components that already have imports
  for (const component of existingComponentImports) {
    needs.components.delete(component);
  }

  // Skip if nothing to add
  if ((hasReactImport || needs.reactHooks.size === 0) && needs.components.size === 0) {
    return false;
  }

  const lines = content.split('\n');
  let insertIndex = findImportInsertionPoint(lines);

  // Build import statements
  const importsToAdd: string[] = [];

  // React import
  if (!hasReactImport && needs.reactHooks.size > 0) {
    const hooks = Array.from(needs.reactHooks).sort();
    importsToAdd.push(`import { ${hooks.join(', ')} } from 'react';`);
  }

  // Component imports (grouped by import path)
  const componentsByPath = new Map<string, string[]>();
  for (const [component, importPath] of needs.components) {
    if (!componentsByPath.has(importPath)) {
      componentsByPath.set(importPath, []);
    }
    componentsByPath.get(importPath)!.push(component);
  }

  for (const [importPath, components] of componentsByPath) {
    const sortedComponents = components.sort();
    importsToAdd.push(`import { ${sortedComponents.join(', ')} } from '${importPath}';`);
  }

  // Insert imports
  for (let i = importsToAdd.length - 1; i >= 0; i--) {
    lines.splice(insertIndex, 0, importsToAdd[i]);
  }

  // Write back
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  return true;
}

function findImportInsertionPoint(lines: string[]): number {
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

  return insertIndex;
}

function main() {
  console.log('🔍 Analyzing missing imports...\n');

  const fileMap = parseTypecheckLog();

  console.log(`📊 Found ${fileMap.size} files needing imports\n`);

  let filesModified = 0;
  let reactImportsAdded = 0;
  let componentImportsAdded = 0;

  for (const [file, needs] of fileMap) {
    const modified = addImportsToFile(file, needs);

    if (modified) {
      filesModified++;

      if (needs.reactHooks.size > 0) {
        reactImportsAdded++;
        console.log(`✅ REACT: ${file}`);
        console.log(`   Added: ${Array.from(needs.reactHooks).join(', ')}`);
      }

      if (needs.components.size > 0) {
        componentImportsAdded++;
        console.log(`✅ COMPONENTS: ${file}`);
        for (const [component, importPath] of needs.components) {
          console.log(`   ${component} from ${importPath}`);
        }
      }
    } else {
      console.log(`⏭️  SKIP: ${file} (imports already exist)`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   React imports added: ${reactImportsAdded}`);
  console.log(`   Component imports added: ${componentImportsAdded}`);
  console.log(`\n🔍 Next: npm run audit:typehealth to verify impact`);
}

main();
