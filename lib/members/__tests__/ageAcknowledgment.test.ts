import { readFileSync } from 'fs';
import { join } from 'path';
import { hasAgeConfirmation, withAgeAcknowledgment, AGE_ACK_COPY_VERSION } from '../ageAcknowledgment';

const W = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

describe('MEMBER-ACK-01 age acknowledgment', () => {
  it('accepts only an explicit true flag or the current-version cookie', () => {
    expect(hasAgeConfirmation({ ageConfirmed: true }, undefined)).toBe(true);
    expect(hasAgeConfirmation(null, AGE_ACK_COPY_VERSION)).toBe(true);
    for (const flag of [false, 'true', 1, 'yes', undefined, null]) {
      expect(hasAgeConfirmation({ ageConfirmed: flag }, undefined)).toBe(false);
    }
    expect(hasAgeConfirmation({}, 'some-old-version')).toBe(false);
    expect(hasAgeConfirmation(null, null)).toBe(false);
  });

  it('wraps the member insert so the acknowledgment lands in the same statement', () => {
    const { sql, params } = withAgeAcknowledgment('INSERT INTO members (a) VALUES ($1) RETURNING id', ['x'], 'register-email');
    expect(sql).toMatch(/^WITH m AS \(INSERT INTO members/);
    expect(sql).toContain('INSERT INTO member_acknowledgments (member_id, kind, copy_version, source)');
    expect(sql).toContain('SELECT id, $2, $3, $4 FROM m');
    expect(sql.trim().endsWith('SELECT * FROM m')).toBe(true);
    expect(params).toEqual(['x', 'age_18_plus', AGE_ACK_COPY_VERSION, 'register-email']);
  });

  it('every route that creates a member requires the confirmation and records it atomically', () => {
    const creators = [
      'app/api/members/register/route.ts',
      'app/api/members/register-email/route.ts',
      'app/api/auth/signin/google/callback/route.ts',
      'app/api/auth/google/native-callback/route.ts',
      'app/api/auth/signin/apple/callback/route.ts',
      'app/api/auth/apple/native-callback/route.ts',
      'app/api/team/invite/[token]/register/route.ts',
      'app/api/now-what/register/route.ts',
      'app/api/members/register-local/route.ts',
    ];
    for (const p of creators) {
      const src = W(p);
      expect({ p, gated: src.includes('hasAgeConfirmation(') }).toEqual({ p, gated: true });
      expect({ p, atomic: src.includes('withAgeAcknowledgment(') }).toEqual({ p, atomic: true });
      // No bare member INSERT left outside the wrapper.
      const bare = src.split('withAgeAcknowledgment(').length - 1;
      const inserts = (src.match(/INSERT INTO members/g) || []).length;
      expect({ p, unwrappedInserts: inserts - bare }).toEqual({ p, unwrappedInserts: 0 });
    }
  });

  it('the migration creates the table additively under the lock-timeout law', () => {
    const sql = W('database/migrations/20261001200000_member_acknowledgments.sql');
    expect(sql).toMatch(/BEGIN;\s*\nSET LOCAL lock_timeout = '5s';/);
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS member_acknowledgments');
    expect(sql).toContain("CHECK (kind IN ('age_18_plus'))");
    const code = sql.replace(/--[^\n]*/g, '');
    expect(code).not.toMatch(/\bALTER\s+TABLE|\bDROP\s+\w+|\bUPDATE\s+\w+\s+SET|\bDELETE\s+FROM|\bTRUNCATE\b/i);
  });
});

describe('MEMBER-ACK-01 census', () => {
  it('no other route creates a member without going through this law', () => {
    const { execSync } = require('child_process');
    const files: string[] = execSync("git grep -l 'INSERT INTO members' -- 'app/api/**/*.ts' ':!**/__tests__/**'", { encoding: 'utf8' })
      .trim().split('\n').filter(Boolean);
    const ungated = files.filter((f) => !W(f).includes('withAgeAcknowledgment('));
    expect(ungated).toEqual([]);
  });

  it('every registration form sends the confirmation', () => {
    for (const p of ['components/auth/UnifiedAuth.tsx', 'app/now-what/arrive/page.tsx', 'components/team/InviteAcceptClient.tsx', 'components/auth/SyncAccountPrompt.tsx']) {
      expect({ p, sends: /ageConfirmed/.test(W(p)) }).toEqual({ p, sends: true });
    }
  });
});

