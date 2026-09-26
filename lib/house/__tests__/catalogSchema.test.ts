import fs from 'node:fs';
import path from 'node:path';
import { HOUSE_PLACES } from '../catalog';

describe('House catalog persistence contract', () => {
  test('shortcut catalog migration admits every canonical place id', () => {
    const sql = fs.readFileSync(
      path.join(process.cwd(), 'database/migrations/20260925000003_house_shortcut_catalog.sql'),
      'utf8',
    );
    for (const place of HOUSE_PLACES) expect(sql).toContain(`'${place.id}'`);
    expect(sql).toContain(`cardinality(shortcut_ids) <= ${HOUSE_PLACES.length}`);
  });

  test('canonical place ids are unique', () => {
    const ids = HOUSE_PLACES.map(place => place.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('member House places never route into internal Lab Tools', () => {
    expect(HOUSE_PLACES.filter(place => place.href.startsWith('/labtools')))
      .toEqual([]);
  });

  test('Practices has a member-facing room', () => {
    expect(HOUSE_PLACES.find(place => place.id === 'practices')?.href)
      .toBe('/practices');
  });
});
