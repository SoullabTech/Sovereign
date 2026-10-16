import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { R16_REAL_MEMBER_PAIRED_STORAGE_ENABLED } from '../heldPairedStoreR16';
import { R17_REAL_WRITER_SERVICE_ENABLED } from '../heldWriterSessionReviewR17';
import { R19_REAL_MEMBER_WRITES_ENABLED } from '../schemaCustodyR19';

const ROOT = process.cwd();
const REVIEW = join(ROOT, 'docs/ops/WS_R20_RESTRICTED_ROLE_REVIEW_ONLY.sql');
const ROLE = 'ws_beta_r20_held_restricted';

describe('R20 actual writer storage: review-only NOLOGIN PG16 role fence', () => {
  it('keeps all real writer storage activations disabled by source', () => {
    expect(R16_REAL_MEMBER_PAIRED_STORAGE_ENABLED).toBe(false);
    expect(R17_REAL_WRITER_SERVICE_ENABLED).toBe(false);
    expect(R19_REAL_MEMBER_WRITES_ENABLED).toBe(false);
  });
  it('never installs R20 role definition in production migrations', () => {
    expect(existsSync(REVIEW)).toBe(true);
    expect(existsSync(join(ROOT, 'database/migrations/WS_R20_RESTRICTED_ROLE_REVIEW_ONLY.sql'))).toBe(false);
    const sql = readFileSync(REVIEW, 'utf8');
    expect(sql).toMatch(/CREATE ROLE ws_beta_r20_held_restricted\s+NOLOGIN NOSUPERUSER/);
    expect(sql).toMatch(/REVOKE ALL PRIVILEGES ON TABLE/);
  });
  it('has zero review-only role permission-grants or public reconfiguration', () => {
    const sql = readFileSync(REVIEW, 'utf8');
    const statements = sql.replace(/--[^\n]*/g, '');
    expect(statements).not.toMatch(/\bGRANT\b/i);
    expect(statements).not.toMatch(/\bALTER\s+DEFAULT\s+PRIVILEGES\b/i);
    expect(statements).not.toMatch(/\bALTER\s+ROLE\s+.*LOGIN\b/i);
    expect(statements).not.toMatch(/\bCREATE\s+USER\b/i);
    expect(statements).not.toMatch(/\bREVOKE\s+ALL\s+ON\s+SCHEMA\s+public\s+FROM\s+PUBLIC\b/i);
  });
  it('limits the physical driver to fictional-only, no network and targeted cleanup', () => {
    const script=readFileSync(join(ROOT,'scripts/ops/wsBetaR20PG16RestrictedRole.py'),'utf8');
    expect(script).toContain('R20_ROLE_FIXTURE');
    expect(script).toContain('fictional-only');
    expect(script).toContain('"--network", "none"');
    expect(script).toContain('"rm", "-f", "-v", NAME');
    expect(script).not.toContain('100.119.');
  });
});
