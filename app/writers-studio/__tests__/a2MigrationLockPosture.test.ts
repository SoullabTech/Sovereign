import fs from 'node:fs';
import path from 'node:path';

const migrationPath = path.join(
  process.cwd(),
  'database/migrations/20260925000005_writer_editorial_relationship_custody.sql',
);

describe('A2 relationship custody migration lock posture', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8');

  it('builds both composite unique indexes before attaching constraints', () => {
    for (const table of ['living_works', 'member_manuscripts']) {
      const name = `${table}_id_member_a2_key`;
      const create = sql.indexOf(`CREATE UNIQUE INDEX IF NOT EXISTS ${name}`);
      const attach = sql.indexOf(`ADD CONSTRAINT ${name}\n      UNIQUE USING INDEX ${name}`);
      expect(create).toBeGreaterThan(-1);
      expect(attach).toBeGreaterThan(create);
    }
  });

  it('does not rebuild either composite index inside ADD CONSTRAINT UNIQUE', () => {
    expect(sql).not.toMatch(/ADD CONSTRAINT living_works_id_member_a2_key UNIQUE\s*\(id, member_id\)/);
    expect(sql).not.toMatch(/ADD CONSTRAINT member_manuscripts_id_member_a2_key UNIQUE\s*\(id, member_id\)/);
  });
});
