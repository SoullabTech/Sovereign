// scripts/quarantine-unused.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIRS = ['src/agents', 'src/services', 'src/api', 'src/routes', 'src/middleware'];
const DEPRECATED_DIR = path.join(__dirname, '..', 'deprecated', Date.now().toString());

console.log('🔍 Starting unused file quarantine process...');
console.log(`Creating quarantine directory: ${DEPRECATED_DIR}`);

fs.mkdirSync(DEPRECATED_DIR, { recursive: true });

let unusedFiles = [];
let checkedFiles = 0;

SRC_DIRS.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  console.log(`\n📂 Scanning directory: ${dir}`);
  
  if (fs.existsSync(dirPath)) {
    try {
      const files = execSync(`find "${dirPath}" -type f \\( -name "*.js" -o -name "*.ts" \\) ! -name "*.test.js" ! -name "*.test.ts" ! -name "*.d.ts"`)
        .toString().split('\n').filter(Boolean);

      console.log(`   Found ${files.length} source files to check`);

      files.forEach(file => {
        checkedFiles++;
        const basename = path.basename(file, path.extname(file));
        const relativePath = path.relative(process.cwd(), file);
        
        try {
          // Check for imports/requires of this file
          const grepPattern = `(import.*from.*['"].*${basename}['"]|require\\(['"].*${basename}['"]|import.*['"].*${basename}['"])`;
          const grep = execSync(`grep -r -E "${grepPattern}" src/ || true`, { encoding: 'utf8' });
          
          // Also check if it's referenced by filename
          const filenameGrep = execSync(`grep -r "${path.basename(file)}" src/ || true`, { encoding: 'utf8' });
          
          // Skip if the only reference is the file itself
          const isReferenced = (grep && grep.trim() && !grep.includes(file)) || 
                              (filenameGrep && filenameGrep.trim() && filenameGrep.split('\n').some(line => !line.includes(file)));
          
          if (!isReferenced) {
            unusedFiles.push(relativePath);
            const dest = path.join(DEPRECATED_DIR, path.basename(file));
            
            // Ensure unique filename if collision
            let counter = 1;
            let finalDest = dest;
            while (fs.existsSync(finalDest)) {
              const ext = path.extname(dest);
              const name = path.basename(dest, ext);
              finalDest = path.join(DEPRECATED_DIR, `${name}_${counter}${ext}`);
              counter++;
            }
            
            fs.renameSync(file, finalDest);
            console.log(`   ⚠️  Quarantined: ${relativePath} → ${path.relative(process.cwd(), finalDest)}`);
          } else {
            console.log(`   ✅ Referenced: ${relativePath}`);
          }
        } catch (error) {
          console.log(`   ❌ Error checking ${relativePath}: ${error.message}`);
        }
      });
    } catch (error) {
      console.log(`   ❌ Error scanning ${dir}: ${error.message}`);
    }
  } else {
    console.log(`   ⚠️  Directory not found: ${dirPath}`);
  }
});

// Write quarantine log
if (unusedFiles.length) {
  const logContent = [
    `# Unused Files Quarantine Log`,
    `Date: ${new Date().toISOString()}`,
    `Total files checked: ${checkedFiles}`,
    `Files quarantined: ${unusedFiles.length}`,
    ``,
    `## Quarantined Files:`,
    ...unusedFiles.map(file => `- ${file}`)
  ].join('\n');
  
  fs.writeFileSync(path.join(DEPRECATED_DIR, 'unused-files.log'), logContent);
  
  console.log(`\n🗂️  Quarantined ${unusedFiles.length} unused files to ${path.relative(process.cwd(), DEPRECATED_DIR)}`);
  console.log(`📝 Log written to: ${path.relative(process.cwd(), path.join(DEPRECATED_DIR, 'unused-files.log'))}`);
  console.log(`\n⚠️  Review quarantined files before permanent deletion!`);
} else {
  // Remove empty deprecated directory
  fs.rmSync(DEPRECATED_DIR, { recursive: true, force: true });
  console.log('\n✅ No unused files found. Repository is clean!');
}

console.log(`\n📊 Summary: Checked ${checkedFiles} files, quarantined ${unusedFiles.length}`);