#!/usr/bin/env node
/**
 * Validates that critical files exist before build
 */

const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'app/globals.css',
  'lib/types/conversation-style.ts',
  'lib/preferences/conversation-style-preference.ts',
  'styles/sacred-animations.css',
  'styles/consciousness-animations.css',
  'styles/benegesserit-theme.css',
];

let allFilesExist = true;

console.log('🔍 Validating critical files...\n');

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);

  if (exists) {
    console.log(`✓ ${file}`);
  } else {
    console.error(`✗ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✅ All critical files present\n');
  process.exit(0);
} else {
  console.error('\n❌ Some critical files are missing\n');
  process.exit(1);
}
