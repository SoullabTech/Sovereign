#!/usr/bin/env node
/**
 * Script to fix misplaced dynamic exports that ended up inside import statements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all route files with the problematic pattern
const files = execSync(
  'find app/api -name "route.ts" -type f',
  { cwd: process.cwd(), encoding: 'utf8' }
).trim().split('\n').filter(Boolean);

let fixedCount = 0;
let skippedCount = 0;

files.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if file has the problem: dynamic export inside an import block
    const problematicPattern = /import \{[^}]*\/\/ Mark route as dynamic[^}]*export const dynamic[^}]*\} from/s;

    if (problematicPattern.test(content)) {
      console.log(`🔧 Fixing ${filePath}...`);

      // Remove the misplaced dynamic export and comment from inside import
      content = content.replace(
        /(import \{)([^}]*)\/\/ Mark route as dynamic[^\n]*\nexport const dynamic = 'force-dynamic';[\n\s]*([^}]*\} from [^\n]+)/gs,
        '$1$2$3'
      );

      // Find the end of all imports
      const lines = content.split('\n');
      let lastImportIndex = -1;
      let inMultilineImport = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('import ')) {
          if (!line.includes(';') && !line.includes('} from')) {
            inMultilineImport = true;
          }
          lastImportIndex = i;
        } else if (inMultilineImport) {
          lastImportIndex = i;
          if (line.includes(';') || line.includes('} from')) {
            inMultilineImport = false;
          }
        } else if (line.startsWith('/**') || line.startsWith('*') || line.startsWith('*/')) {
          // Skip comment blocks at top
          continue;
        } else if (line.length > 0 && !line.startsWith('//')) {
          break;
        }
      }

      // Check if dynamic export already exists correctly placed
      if (!content.match(/^\s*\/\/ Mark route as dynamic/m) &&
          !content.match(/^\s*export const dynamic = ['"]force-dynamic['"]/m)) {
        // Insert after last import
        const insertIndex = lastImportIndex + 1;
        lines.splice(insertIndex, 0, '', '// Mark route as dynamic since it uses searchParams or other dynamic features', "export const dynamic = 'force-dynamic';");
        content = lines.join('\n');
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✓ Fixed ${filePath}`);
      fixedCount++;
    } else {
      skippedCount++;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✓ Fixed: ${fixedCount}`);
console.log(`   ⚠️  Skipped: ${skippedCount}`);
console.log(`   📝 Total: ${files.length}`);
