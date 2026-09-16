import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SERVING_ROOTS = [
  'app/api',
  'lib/sovereign',
  'lib/ai',
  'lib/consciousness',
];

function filesUnder(root: string): string[] {
  const absolute = path.join(ROOT, root);
  if (!fs.existsSync(absolute)) return [];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(ts|tsx|js|mjs|cjs)$/.test(entry.name)) out.push(p);
    }
  };
  walk(absolute);
  return out;
}

describe('shadow isolation', () => {
  test('serving code cannot import shadow cognition or research telemetry', () => {
    const violations: string[] = [];
    for (const root of SERVING_ROOTS) {
      for (const file of filesUnder(root)) {
        const text = fs.readFileSync(file, 'utf8');
        if (text.includes('gestaltStandingShadow') || text.includes('gestalt-standing-shadow')) {
          violations.push(path.relative(ROOT, file));
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
