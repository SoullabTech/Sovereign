/**
 * AUTH-AUDIT-01 — the audit write must be real, and its failure must be loud
 * without becoming an auth failure.
 *
 * Two invariants pull in opposite directions and both must hold:
 *
 *   DURABILITY   a successful write reaches the table, with honest columns
 *   AVAILABILITY a failed write never breaks authentication
 *
 * The defect being repaired sat exactly between them: the write always failed
 * (no table), the catch swallowed it, and the resolved promise was
 * indistinguishable from success. Resilience was intact; observability was not.
 * The cases below prove we repaired the silence, not the resilience.
 */
import { NextRequest } from 'next/server';

const queryMock = jest.fn();
jest.mock('@/lib/db/postgres', () => ({ query: (...a: unknown[]) => queryMock(...(a as [string, unknown[]])) }));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  logAuthEvent,
  getAuditPersistFailureCount,
  __resetAuditPersistFailureCount,
  AUDIT_PERSIST_FAILED_MARKER,
} = require('../authAudit');

const ACTOR = 'aaaaaaaa-0000-4000-8000-000000000001';
const SUBJECT = 'bbbbbbbb-0000-4000-8000-000000000002';

function request(): NextRequest {
  return new NextRequest('https://soullab.life/api/members/signin', {
    method: 'POST',
    headers: { host: 'soullab.life', 'x-forwarded-for': '203.0.113.7', 'user-agent': 'Mozilla/5.0' },
  });
}

/** The INSERT's positional parameters, by the order authAudit builds them. */
const P = { action: 0, resourceType: 1, resourceId: 2, ip: 3, ua: 4, result: 5, error: 6, metadata: 7, actor: 8, consent: 9 };
const params = () => queryMock.mock.calls[0][1] as unknown[];

let errSpy: jest.SpyInstance;

beforeEach(() => {
  queryMock.mockReset();
  queryMock.mockResolvedValue({ rows: [] });
  __resetAuditPersistFailureCount();
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe('durability', () => {
  it('writes the event and reports it persisted', async () => {
    const r = await logAuthEvent({ action: 'signin_success', memberId: SUBJECT, result: 'success' }, request());
    expect(r).toEqual({ persisted: true });
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(params()[P.action]).toBe('signin_success');
    expect(params()[P.resourceId]).toBe(SUBJECT);
  });
});

describe('consent_verified is tri-state, never fabricated', () => {
  it('stores NULL when the path did not establish consent status', async () => {
    // THE FABRICATION: every row previously hardcoded `true`, asserting a check
    // nothing had performed — inside the record meant to be ground truth.
    await logAuthEvent({ action: 'signin_success', memberId: SUBJECT, result: 'success' }, request());
    expect(params()[P.consent]).toBeNull();
  });

  it('stores true only when told a check passed', async () => {
    await logAuthEvent({ action: 'signin_success', result: 'success', consentVerified: true }, request());
    expect(params()[P.consent]).toBe(true);
  });

  it('stores false when told a check failed — unknown does not collapse to false either', async () => {
    await logAuthEvent({ action: 'signin_failed', result: 'failure', consentVerified: false }, request());
    expect(params()[P.consent]).toBe(false);
  });
});

describe('user_id is evidence, not synthesis', () => {
  it('is NULL when the caller did not establish an actor', async () => {
    // A sign-in ATTEMPT names the account being attempted; nobody is
    // established yet. NULL means "not established", never "nobody".
    await logAuthEvent({ action: 'signin_failed', memberId: SUBJECT, result: 'failure' }, request());
    expect(params()[P.actor]).toBeNull();
    expect(params()[P.resourceId]).toBe(SUBJECT);
  });

  it('is populated when the caller established one', async () => {
    await logAuthEvent(
      { action: 'webauthn_register', actorId: ACTOR, memberId: SUBJECT, result: 'success' },
      request()
    );
    expect(params()[P.actor]).toBe(ACTOR);
    expect(params()[P.resourceId]).toBe(SUBJECT);
  });

  it('is never backfilled from the resource', async () => {
    // Replacing a hardcoded NULL with a synthesized attribution would be worse
    // than the gap: a false actor is harder to detect than a missing one.
    await logAuthEvent({ action: 'signin_success', memberId: SUBJECT, result: 'success' }, request());
    expect(params()[P.actor]).not.toBe(SUBJECT);
    expect(params()[P.actor]).toBeNull();
  });

  it('rejects a non-UUID actor rather than storing it', async () => {
    await logAuthEvent({ action: 'signin_success', actorId: 'explorer-local-9f3a', result: 'success' }, request());
    expect(params()[P.actor]).toBeNull();
  });
});

describe('THE FALSIFICATION: audit unavailable, auth unaffected', () => {
  /** The exact production condition: relation "audit_logs" does not exist. */
  function undefinedTable() {
    const e = new Error('relation "audit_logs" does not exist') as Error & { code: string };
    e.code = '42P01';
    return e;
  }

  it('resolves persisted:false instead of a success-shaped promise', async () => {
    // Pre-repair this resolved to undefined — indistinguishable from a write
    // that succeeded. That indistinguishability IS the defect.
    queryMock.mockRejectedValue(undefinedTable());
    const r = await logAuthEvent({ action: 'signin_success', memberId: SUBJECT, result: 'success' }, request());
    expect(r).toEqual({ persisted: false });
  });

  it('never lets a throw cross the auth boundary', async () => {
    queryMock.mockRejectedValue(undefinedTable());
    await expect(
      logAuthEvent({ action: 'webauthn_authenticate', memberId: SUBJECT, result: 'success' }, request())
    ).resolves.toBeDefined();
  });

  it('counts the failure in-process, where a database outage cannot erase it', async () => {
    queryMock.mockRejectedValue(undefinedTable());
    await logAuthEvent({ action: 'signin_success', result: 'success' }, request());
    await logAuthEvent({ action: 'signout', result: 'success' }, request());
    expect(getAuditPersistFailureCount()).toBe(2);
  });

  it('emits a stable marker with a sanitized category and no raw error text', async () => {
    queryMock.mockRejectedValue(undefinedTable());
    await logAuthEvent({ action: 'signin_success', memberId: SUBJECT, result: 'success' }, request());
    const line = errSpy.mock.calls[0].join(' ');
    expect(line).toContain(AUDIT_PERSIST_FAILED_MARKER);
    expect(line).toContain('category=undefined_table');
    // A line describing a failure to record an auth event must not itself leak
    // SQL text, parameters or member identifiers.
    expect(line).not.toContain('relation "audit_logs"');
    expect(line).not.toContain(SUBJECT);
  });

  it('survives the hard case: audit gone AND the failure channel unusable', async () => {
    // Both the table and any database-backed observability are unreachable.
    // Auth must still complete, and logAuthEvent must still answer honestly.
    queryMock.mockRejectedValue(Object.assign(new Error('ECONNREFUSED'), { code: '08006' }));
    errSpy.mockImplementation(() => { /* console itself yields nothing */ });
    const r = await logAuthEvent({ action: 'signin_success', result: 'success' }, request());
    expect(r).toEqual({ persisted: false });
    expect(getAuditPersistFailureCount()).toBe(1);
  });
});

/**
 * ACTIVATION SAFETY.
 *
 * Before AUTH-AUDIT-01 the insert always threw, so whatever callers put in
 * `metadata` was discarded. Creating `audit_logs` turns those payloads into
 * durable storage — the same code becomes a different security question. This
 * scans the call sites rather than any one route, so a new caller cannot
 * quietly reintroduce raw credential material.
 *
 * Static by necessity: the payloads live in route modules that need a database,
 * a session and a WebAuthn ceremony to exercise. A source guard is weaker than
 * an execution test, and it is what actually covers all nine call sites.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.ts') && !full.includes('__tests__')) out.push(full);
  }
  return out;
}

describe('activation safety: no raw credential material reaches audit metadata', () => {
  const root = join(__dirname, '..', '..', '..');
  const callers = [join(root, 'app', 'api'), join(root, 'lib')]
    .flatMap((d) => walk(d))
    .filter((f) => readFileSync(f, 'utf8').includes('logAuthEvent('))
    .filter((f) => !f.endsWith('authAudit.ts'));

  it('finds the call sites at all (guards against a vacuous pass)', () => {
    // A scan that matches nothing passes trivially. This is the discrimination.
    expect(callers.length).toBeGreaterThanOrEqual(8);
  });

  it.each([
    ['credentialId', /credentialId\s*[,}]|credentialId\s*:\s*(?!.*hashCredential)[A-Za-z_$]/],
    ['sessionToken', /sessionToken\s*[,}:]/],
    ['password', /\bpassword\s*[,}:]/],
    ['challenge', /\bchallenge\s*[,}:]/],
    ['publicKey', /publicKey\s*[,}:]/],
  ])('no raw %s inside a metadata object', (_label, pattern) => {
    const offenders: string[] = [];
    for (const file of callers) {
      const src = readFileSync(file, 'utf8');
      // Each `metadata: { ... }` object passed to logAuthEvent.
      for (const m of src.matchAll(/metadata:\s*\{([^}]*)\}/g)) {
        if (pattern.test(m[1])) offenders.push(`${file.replace(root + '/', '')} → ${m[1].trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('revocation is recorded as revocation, not as registration', () => {
    // Reachable via /account/security and biometricAuth.revokeCredential.
    // It logged `webauthn_register` with a metadata step — latent while the
    // insert failed, a durable falsehood once the table exists.
    const revoke = readFileSync(join(root, 'app/api/auth/passkeys/revoke/route.ts'), 'utf8');
    expect(revoke).toContain("action: 'webauthn_revoke'");
    expect(revoke).not.toContain("action: 'webauthn_register'");
  });
});
