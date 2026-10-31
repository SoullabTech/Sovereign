import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { chmodSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const mockQuery = jest.fn<(...args: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>>();
const mockTransaction = jest.fn<(fn: (client: { query: typeof mockQuery }) => Promise<unknown>) => Promise<unknown>>();
jest.mock('@/lib/db/postgres', () => ({ transaction: (fn: (client: { query: typeof mockQuery }) => Promise<unknown>) => mockTransaction(fn) }));

import { resolveManagedSmtpConfig } from '../protonTransport';
import { extractMailbox, senderMatchesMailbox, reserveManagedAuthSend, MANAGED_AUTH_CAPACITY } from '../senderCapacity';

const ENV = { ...process.env };
const tempDirs: string[] = [];

afterEach(() => {
  process.env = { ...ENV };
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('managed sender identity', () => {
  it('extracts and compares mailbox identities case-insensitively', () => {
    expect(extractMailbox('Soullab <NoReply@Soullab.Life>')).toBe('noreply@soullab.life');
    expect(senderMatchesMailbox('Soullab <NoReply@Soullab.Life>', 'noreply@soullab.life')).toBe(true);
    expect(senderMatchesMailbox('Kelly <kelly@soullab.life>', 'noreply@soullab.life')).toBe(false);
  });
});

describe('managed SMTP secret custody', () => {
  function baseEnv() {
    process.env.SMTP_HOST = 'smtp.protonmail.ch';
    process.env.SMTP_USER = 'noreply@soullab.life';
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_PASS;
  }

  it('reads an owner-only password file without changing it', () => {
    baseEnv();
    process.env.NODE_ENV = 'production';
    const dir = mkdtempSync(join(tmpdir(), 'auth-return-smtp-'));
    tempDirs.push(dir);
    const secret = join(dir, 'smtp.secret');
    writeFileSync(secret, 'fictional-password\n', { mode: 0o600 });
    chmodSync(secret, 0o600);
    process.env.SMTP_PASSWORD_FILE = secret;

    expect(resolveManagedSmtpConfig()).toMatchObject({
      host: 'smtp.protonmail.ch',
      user: 'noreply@soullab.life',
      password: 'fictional-password',
      managedMailbox: 'noreply@soullab.life',
    });
  });

  it('refuses group-readable credential files', () => {
    baseEnv();
    process.env.NODE_ENV = 'production';
    const dir = mkdtempSync(join(tmpdir(), 'auth-return-smtp-'));
    tempDirs.push(dir);
    const secret = join(dir, 'smtp.secret');
    writeFileSync(secret, 'fictional-password\n');
    chmodSync(secret, 0o640);
    process.env.SMTP_PASSWORD_FILE = secret;
    expect(() => resolveManagedSmtpConfig()).toThrow(/group or other/);
  });

  it('requires file-backed credentials in production and one secret source only', () => {
    baseEnv();
    process.env.NODE_ENV = 'production';
    process.env.SMTP_PASSWORD = 'ambient';
    expect(() => resolveManagedSmtpConfig()).toThrow(/require SMTP_PASSWORD_FILE/);

    process.env.NODE_ENV = 'test';
    const dir = mkdtempSync(join(tmpdir(), 'auth-return-smtp-'));
    tempDirs.push(dir);
    const secret = join(dir, 'smtp.secret');
    writeFileSync(secret, 'file-secret\n', { mode: 0o600 });
    chmodSync(secret, 0o600);
    process.env.SMTP_PASSWORD_FILE = secret;
    expect(() => resolveManagedSmtpConfig()).toThrow(/exactly one/);
  });
});


describe('managed SMTP capacity admission', () => {
  const id = 'df3eeaf5-6bc8-4fb5-b832-c00606ce4148';
  const request = {
    purpose: 'auth:email-code', from: 'Soullab <noreply@soullab.life>',
    to: 'fiction@example.invalid', correlationId: id, idempotencyKey: `AUTH_CODE:${id}`,
  };
  let minuteCount = 0;
  let dayCount = 0;
  let challengeAvailable = true;

  beforeEach(() => {
    minuteCount = 0; dayCount = 0; challengeAvailable = true;
    mockQuery.mockReset(); mockTransaction.mockReset();
    mockTransaction.mockImplementation(async (fn) => fn({ query: mockQuery }));
    mockQuery.mockImplementation(async (statement) => {
      const sql = String(statement);
      if (sql.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
      if (sql.includes('minute_count')) return { rows: [{ minute_count: String(minuteCount), day_count: String(dayCount) }], rowCount: 1 };
      if (sql.includes('SELECT id')) return { rows: challengeAvailable ? [{ id }] : [], rowCount: challengeAvailable ? 1 : 0 };
      if (sql.includes('UPDATE auth_email_challenges')) return { rows: [{ id }], rowCount: 1 };
      throw new Error('Unexpected fictional capacity query');
    });
  });

  it('reserves an eligible attempt before provider work', async () => {
    await expect(reserveManagedAuthSend(request)).resolves.toEqual({ admitted: true });
    expect(mockQuery).toHaveBeenLastCalledWith(expect.stringContaining('SET smtp_reserved_at'), [id]);
  });

  it.each([
    { purpose: 'auth:unregistered' },
    { from: 'Other <other@soullab.life>' },
    { from: 'Soullab <noreply@soullab.life>\r\nBcc:other@example.invalid' },
    { to: ['fiction@example.invalid', 'other@example.invalid'] },
    { to: 'Alias <fiction@example.invalid>' },
    { idempotencyKey: 'a-different-attempt' },
    { correlationId: 'not-a-uuid' },
  ])('refuses an out-of-scope sender/request %o without storage', async (override) => {
    await expect(reserveManagedAuthSend({ ...request, ...override })).resolves.toMatchObject({ admitted: false, code: 'smtp_scope_refused' });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('refuses a consumed reservation or another challenge recipient', async () => {
    challengeAvailable = false;
    await expect(reserveManagedAuthSend(request)).resolves.toMatchObject({ admitted: false, code: 'smtp_challenge_not_sendable' });
    expect(mockQuery.mock.calls.some(([sql]) => /^\s*UPDATE\b/i.test(String(sql)))).toBe(false);
  });

  it.each(['minute', 'day'])('enforces the %s bound without consuming a new reservation', async (window) => {
    if (window === 'minute') minuteCount = MANAGED_AUTH_CAPACITY.perMinute;
    else dayCount = MANAGED_AUTH_CAPACITY.perDay;
    await expect(reserveManagedAuthSend(request)).resolves.toMatchObject({ admitted: false, kind: 'rate_limited', code: 'smtp_sender_capacity' });
    expect(mockQuery.mock.calls.some(([sql]) => /^\s*UPDATE\b/i.test(String(sql)))).toBe(false);
  });

  it('fails closed on malformed usage or failed storage', async () => {
    minuteCount = Number.NaN;
    await expect(reserveManagedAuthSend(request)).resolves.toMatchObject({ admitted: false, code: 'smtp_capacity_unavailable' });
    mockTransaction.mockRejectedValue(new Error('Fictional PG failure'));
    await expect(reserveManagedAuthSend(request)).resolves.toMatchObject({ admitted: false, code: 'smtp_capacity_unavailable' });
  });
});

describe('managed SMTP secret path and provider bounds', () => {
  function secretFile() {
    const dir = mkdtempSync(join(tmpdir(), 'auth-return-secret-'));
    tempDirs.push(dir);
    const path = join(dir, 'secret');
    writeFileSync(path, 'fictional-only', { mode: 0o600 });
    chmodSync(path, 0o600);
    process.env.NODE_ENV = 'production';
    process.env.SMTP_HOST = 'smtp.protonmail.ch';
    process.env.SMTP_USER = 'noreply@soullab.life';
    process.env.SMTP_PASSWORD_FILE = path;
    delete process.env.SMTP_PASSWORD;
    delete process.env.SMTP_PASS;
    return { dir, path };
  }

  it('refuses a symlink credential path', () => {
    const fixture = secretFile();
    const link = join(fixture.dir, 'link');
    symlinkSync(fixture.path, link);
    process.env.SMTP_PASSWORD_FILE = link;
    expect(() => resolveManagedSmtpConfig()).toThrow();
  });

  it('refuses a different production SMTP host', () => {
    secretFile();
    process.env.SMTP_HOST = 'unapproved.example.invalid';
    expect(() => resolveManagedSmtpConfig()).toThrow(/approved Proton/);
  });

  it('rejects ambiguous or injected mailbox syntax', () => {
    for (const value of ['Soullab <noreply@soullab.life', 'noreply@soullab.life>', 'noreply@soullab.life,other@example.invalid', 'noreply@soullab.life\r\nBcc:other@example.invalid']) {
      expect(extractMailbox(value)).toBeNull();
    }
  });
});
