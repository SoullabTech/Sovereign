import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const page = fs.readFileSync(path.join(ROOT, 'app/admin/writers-studio/page.tsx'), 'utf8');
const migration = fs.readFileSync(
  path.join(ROOT, 'database/migrations/20260930000001_writer_studio_release_evidence.sql'),
  'utf8',
);

describe('Writer Studio stewardship dashboard boundary', () => {
  it('lives under the admin-only surface and reads the admin evidence endpoint', () => {
    expect(page).toContain("adminFetch('/api/admin/writers-studio/evidence'");
    expect(page).toContain('Writer’s Studio Stewardship');
    expect(page).toContain('Meaningful Continuation');
    expect(page).toContain('Grey means insufficient evidence, not pass.');
  });

  it('stores release evidence and metric snapshots without raw manuscript fields', () => {
    expect(migration).toContain('writer_studio_releases');
    expect(migration).toContain('writer_studio_release_evidence');
    expect(migration).toContain('writer_studio_metric_snapshots');
    expect(migration).not.toMatch(/manuscript_(text|content|body)/i);
    expect(migration).not.toMatch(/prompt_(text|body)|response_(text|body)/i);
  });
});
