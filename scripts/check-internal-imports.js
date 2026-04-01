#!/usr/bin/env node

/**
 * Pre-build guard: verify all @/ alias imports resolve to real files.
 * Prevents deploy failures from partial merges or missing dependencies.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIRS = ['app', 'components', 'lib', 'hooks', 'types', 'config'];
const EXTS = ['.ts', '.tsx', '.js', '.jsx'];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(entry.name)) continue;
      walk(full, out);
    } else if (EXTS.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function resolveAliasImport(specifier) {
  if (!specifier.startsWith('@/')) return null;
  const rel = specifier.slice(2);
  const absBase = path.join(ROOT, rel);
  const candidates = [
    absBase,
    ...EXTS.map(ext => absBase + ext),
    ...EXTS.map(ext => path.join(absBase, `index${ext}`)),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function extractImports(content) {
  const patterns = [
    /import\s+[^'"]*from\s+['"]([^'"]+)['"]/g,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /export\s+[^'"]*from\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  const found = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      found.push(match[1]);
    }
  }
  return found;
}

const files = SRC_DIRS.flatMap(dir => walk(path.join(ROOT, dir)));
const failures = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const imports = extractImports(content);
  for (const specifier of imports) {
    if (!specifier.startsWith('@/')) continue;
    const resolved = resolveAliasImport(specifier);
    if (!resolved) {
      failures.push({ file: path.relative(ROOT, file), specifier });
    }
  }
}

if (failures.length) {
  console.error('\n\u274C Missing internal alias imports:\n');
  for (const f of failures) {
    console.error(`  ${f.file} \u2192 ${f.specifier}`);
  }
  console.error(`\n${failures.length} unresolved import(s). Fix before building.\n`);
  process.exit(1);
}

console.log('\u2705 Internal alias imports resolved');
