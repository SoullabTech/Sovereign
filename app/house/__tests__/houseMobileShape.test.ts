import fs from 'fs';
import path from 'path';

/* HOUSE-MOBILE-01 (founder ruling 2026-11-05): on phones and iPads the House home is a
   place of arrival, not a catalogue. All places has its own page; the sky is one line. */
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const page = read('app/house/page.tsx');
const places = read('app/house/places/page.tsx');
const prefs = read('app/house/HousePreferences.tsx');
const css = read('app/house/house.module.css');

test('the full directory and full sky panel are wide-screen only', () => {
  expect(page).toContain('<div className={styles.wideOnly}><HouseDirectory /></div>');
  expect(page).toContain('<div className={styles.wideOnly}><CurrentTransitsField variant="house" /></div>');
  expect(css).toMatch(/@media \(max-width: 1200px\) \{\s*\.wideOnly \{ display: none !important; \}/);
});

test('phones and iPads get an All places door, a Today line and a More of the House fold', () => {
  expect(page).toContain('href="/house/places"');
  expect(page).toContain('<CurrentTransitsField variant="line" />');
  expect(page).toContain('More of the House');
  expect(css).toMatch(/^\.narrowOnly \{ display: none; \}/m);
});

test('MAIA still comes before the sky line', () => {
  expect(page.indexOf('<CurrentTransitsField variant="line" />')).toBeGreaterThan(page.indexOf('aria-label="House presence"'));
});

test('All places page lists places without arrangement buttons', () => {
  expect(places).toContain('<HouseDirectory variant="list" />');
  const list = prefs.slice(prefs.indexOf("variant === 'list' ? <div"), prefs.indexOf(': <div className={styles.directoryGrid}>'));
  expect(list.length).toBeGreaterThan(0);
  expect(list).not.toContain('Show in center');
  expect(list).not.toContain('Here · Now');
});

test('/house/places is in the access matrix with the House gate', () => {
  expect(read('config/accessMatrix.ts')).toContain("{ exact: '/house/places', minTier: 'free'");
});
