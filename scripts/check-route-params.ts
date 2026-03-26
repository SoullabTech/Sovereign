/**
 * Route Parameter Invariant Guard
 *
 * Prevents the class of bug where mixed dynamic segment names at the
 * same routing depth cause Next.js to reject ALL route resolution.
 *
 * The rule: within any given parent directory, there can be at most ONE
 * dynamic segment name. Two siblings like [slug] and [field] are fatal.
 *
 * Run: npm run check:routes
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('app');

interface Violation {
  parent: string;
  segments: { name: string; path: string }[];
}

function scan(dir: string, violations: Violation[]): void {
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return;
  }

  // Collect all dynamic segments that are direct children of this dir
  const dynamicChildren: { name: string; path: string }[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry);
    if (!fs.statSync(full).isDirectory()) continue;

    const match = entry.match(/^\[([^\]]+)\]$/);
    if (match) {
      dynamicChildren.push({ name: match[1], path: full });
    }

    // Recurse into all subdirectories
    scan(full, violations);
  }

  // Check: are there multiple DIFFERENT dynamic segment names as siblings?
  if (dynamicChildren.length > 1) {
    const uniqueNames = new Set(dynamicChildren.map(d => d.name));
    if (uniqueNames.size > 1) {
      violations.push({ parent: dir, segments: dynamicChildren });
    }
  }
}

const violations: Violation[] = [];
scan(ROOT, violations);

if (violations.length) {
  console.error('❌ Conflicting dynamic route params found:\n');
  for (const v of violations) {
    const rel = path.relative(process.cwd(), v.parent);
    console.error(`  In ${rel}/:`);
    for (const seg of v.segments) {
      console.error(`    [${seg.name}]  →  ${path.relative(process.cwd(), seg.path)}`);
    }
    console.error(
      '    ^ These siblings use different param names — Next.js will fail to resolve routes.\n',
    );
  }
  console.error('Fix: rename all sibling dynamic segments to use the same param name.');
  process.exit(1);
} else {
  console.log('✅ Route params clean — no sibling dynamic segment conflicts');
}
