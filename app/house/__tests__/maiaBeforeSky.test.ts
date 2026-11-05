import fs from 'fs';
import path from 'path';

/* Founder direction 2026-11-05: MAIA comes before the sky (astrology) wherever the House
   stacks — phones, tablets, the iPhone app. On wide screens MAIA keeps her own column. */
const page = fs.readFileSync(path.join(process.cwd(), 'app/house/page.tsx'), 'utf8');

test('MAIA’s presence comes before the current-sky panel in the page order', () => {
  const maia = page.indexOf('aria-label="House presence"');
  const sky = page.indexOf('<CurrentTransitsField variant="house" />');
  expect(maia).toBeGreaterThan(-1);
  expect(sky).toBeGreaterThan(maia);
});
