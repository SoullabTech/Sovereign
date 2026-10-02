import fs from 'node:fs';
import path from 'node:path';

const migration = fs.readFileSync(
  path.resolve(process.cwd(), 'database/migrations/20260926000002_writer_studio_work_themes.sql'),
  'utf8',
);

describe('Work Theme event deletion custody', () => {
  it('keeps updates immutable', () => {
    expect(migration).toContain("IF TG_OP = 'UPDATE' THEN");
    expect(migration).toContain('is immutable; append a successor event');
  });

  it('refuses direct deletion while custody parents still exist', () => {
    expect(migration).toContain("IF TG_OP = 'DELETE'");
    expect(migration).toContain('SELECT 1 FROM writer_studio_work_themes');
    expect(migration).toContain('SELECT 1 FROM members WHERE id = OLD.member_id');
    expect(migration).toContain('may be deleted only by lawful parent custody cascade');
  });
  it('allows lawful parent cascade by returning OLD when a parent is absent', () => {
    expect(migration).toContain('RETURN OLD;');
    expect(migration).toContain(
      'BEFORE UPDATE OR DELETE ON writer_studio_work_theme_events',
    );
  });

  it('refuses TRUNCATE so row guards cannot be bypassed', () => {
    expect(migration).toContain(
      'CREATE OR REPLACE FUNCTION writer_studio_work_theme_events_refuse_truncate()',
    );
    expect(migration).toContain(
      'BEFORE TRUNCATE ON writer_studio_work_theme_events',
    );
  });
});
