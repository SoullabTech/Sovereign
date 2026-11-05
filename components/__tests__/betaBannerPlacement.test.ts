import fs from 'fs';
import path from 'path';

/* Founder screenshots 2026-11-05: on phones the floating BETA badge covered the Room picker
   and the House links. Phones place it at the bottom centre; wide screens keep top-right. */
const src = fs.readFileSync(path.join(process.cwd(), 'components/BetaBanner.tsx'), 'utf8');

test('phones get the badge at the bottom; only md and up place it top-right', () => {
  expect(src).toMatch(/className="pointer-events-none fixed inset-x-0 bottom-0 [^"]*md:right-0 md:top-0/);
  expect(src).not.toContain('fixed right-0 top-0');
});
