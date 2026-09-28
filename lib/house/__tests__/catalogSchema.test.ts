import fs from 'node:fs';
import path from 'node:path';
import { HOUSE_PLACES } from '../catalog';

describe('House catalog persistence contract', () => {
  const migration = (name: string) => fs.readFileSync(
    path.join(process.cwd(), 'database/migrations', name),
    'utf8',
  );

  test('every durable House preference prefix admits the live canonical catalog', () => {
    const files = [
      '20260925000001_house_member_preferences.sql',
      '20260925000002_house_center_preferences.sql',
      '20260925000003_house_shortcut_catalog.sql',
      '20260927000001_house_dream_catalog.sql',
    ];
    for (const file of files) {
      const sql = migration(file);
      for (const place of HOUSE_PLACES) expect(sql).toContain(`'${place.id}'`);
    }
  });

  test('prefix 1 creates the columns and bounds the live reader immediately needs', () => {
    const sql = migration('20260925000001_house_member_preferences.sql');
    expect(sql).toContain('center_ids text[]');
    expect(sql).toContain(`cardinality(shortcut_ids) <= ${HOUSE_PLACES.length}`);
    expect(sql).toContain('cardinality(center_ids) <= 5');
  });

  test('later House catalog migrations are idempotent full-catalog reassertions', () => {
    const center = migration('20260925000002_house_center_preferences.sql');
    const shortcuts = migration('20260925000003_house_shortcut_catalog.sql');
    const dream = migration('20260927000001_house_dream_catalog.sql');
    expect(center).toContain('ADD COLUMN IF NOT EXISTS center_ids text[]');
    expect(shortcuts).toContain(`cardinality(shortcut_ids) <= ${HOUSE_PLACES.length}`);
    expect(dream).toContain(`cardinality(shortcut_ids) <= ${HOUSE_PLACES.length}`);
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
