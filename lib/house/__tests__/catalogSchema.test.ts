import fs from 'node:fs';
import path from 'node:path';
import { HOUSE_PLACES } from '../catalog';

// Places admitted by a LATER forward migration. Earlier migrations are historical and
// legitimately predate them; only the migration that admits a place must contain it.
const ADMITTED_LATER = ['pro-studio'];
const PLACES_THROUGH_DREAM = HOUSE_PLACES.filter(p => !ADMITTED_LATER.includes(p.id));

describe('House catalog persistence contract', () => {
  const migration = (name: string) => fs.readFileSync(
    path.join(process.cwd(), 'database/migrations', name),
    'utf8',
  );

  test('every durable House preference prefix admits the live canonical catalog', () => {
    const historical = [
      '20260925000001_house_member_preferences.sql',
      '20260925000002_house_center_preferences.sql',
      '20260925000003_house_shortcut_catalog.sql',
      '20260927000001_house_dream_catalog.sql',
    ];
    for (const file of historical) {
      const sql = migration(file);
      for (const place of PLACES_THROUGH_DREAM) expect(sql).toContain(`'${place.id}'`);
    }
    const latest = migration('20261030000001_house_pro_studio_catalog.sql');
    for (const place of HOUSE_PLACES) expect(latest).toContain(`'${place.id}'`);
  });

  test('prefix 1 creates the columns and bounds the live reader immediately needs', () => {
    const sql = migration('20260925000001_house_member_preferences.sql');
    expect(sql).toContain('center_ids text[]');
    expect(sql).toContain(`cardinality(shortcut_ids) <= ${PLACES_THROUGH_DREAM.length}`);
    expect(sql).toContain('cardinality(center_ids) <= 5');
  });

  test('later House catalog migrations are idempotent full-catalog reassertions', () => {
    const center = migration('20260925000002_house_center_preferences.sql');
    const shortcuts = migration('20260925000003_house_shortcut_catalog.sql');
    const dream = migration('20260927000001_house_dream_catalog.sql');
    expect(center).toContain('ADD COLUMN IF NOT EXISTS center_ids text[]');
    expect(shortcuts).toContain(`cardinality(shortcut_ids) <= ${PLACES_THROUGH_DREAM.length}`);
    expect(dream).toContain('<= 18');
    const proStudio = migration('20261030000001_house_pro_studio_catalog.sql');
    expect(proStudio).toContain(`cardinality(shortcut_ids) <= ${HOUSE_PLACES.length}`);
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
