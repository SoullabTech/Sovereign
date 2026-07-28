/**
 * Messaging provider status — honesty guard.
 *
 * The defect: settings inferred configuration by POSTing a real message and
 * string-matching the error. Under session-derived delivery authority a
 * non-practitioner receives "Authentication required", which does NOT contain
 * "not configured" — so the UI concluded the provider WAS configured. An
 * authorization refusal was rendered as a configuration fact.
 *
 * WHAT THIS PROVES: the endpoint reports `unauthorized` distinctly from
 * `not_configured`, never sends anything, and the settings page consumes the
 * structured state rather than parsing error strings.
 * WHAT IT DOES NOT PROVE: that the provider would actually deliver.
 */
import { readFileSync } from 'fs';
import path from 'path';

jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/notifications/sendAuthority', () => ({ resolveSendAuthority: jest.fn() }));

import { GET } from '../route';
import { query } from '@/lib/db/postgres';
import { resolveSendAuthority } from '@/lib/notifications/sendAuthority';

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockAuth = resolveSendAuthority as jest.MockedFunction<typeof resolveSendAuthority>;
const req = {} as never;

const REPO = path.resolve(__dirname, '../../../../..');
const read = (rel: string) => readFileSync(path.join(REPO, rel), 'utf8');

/**
 * Comments describe history and intent; code is what ships. Every structural
 * assertion below reads stripped code — otherwise a docstring naming the thing
 * it removed reads as the thing itself.
 */
const code = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [] } as never);
});

describe('an unauthorized caller is told exactly that', () => {
  it('reports unauthorized, not a configuration claim', async () => {
    mockAuth.mockResolvedValue({ ok: false, status: 401, error: 'Authentication required' });
    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    for (const p of ['sms', 'telegram', 'whatsapp']) {
      expect(body.providers[p].state).toBe('unauthorized');
      expect(body.providers[p].state).not.toBe('configured');
      expect(body.providers[p].state).not.toBe('not_configured');
    }
  });

  it('discloses nothing about setup, even when env credentials exist', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'x';
    process.env.TWILIO_AUTH_TOKEN = 'y';
    process.env.TWILIO_FROM_NUMBER = 'z';
    mockAuth.mockResolvedValue({ ok: false, status: 403, error: 'nope' });
    const body = await (await GET(req)).json();
    expect(body.providers.sms.state).toBe('unauthorized');
  });
});

describe('an authorized caller gets a real answer', () => {
  beforeEach(() =>
    mockAuth.mockResolvedValue({ ok: true, memberId: 'm', practitionerId: 'p' }));

  it('configured when the practitioner has their own integration', async () => {
    mockQuery.mockResolvedValue({ rows: [{ config_encrypted: '{}' }] } as never);
    const body = await (await GET(req)).json();
    expect(body.providers.sms.state).toBe('configured');
  });

  it('not_configured when neither practitioner nor env credentials exist', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    mockQuery.mockResolvedValue({ rows: [] } as never);
    const body = await (await GET(req)).json();
    expect(body.providers.telegram.state).toBe('not_configured');
  });

  it('a credential lookup failure never asserts "not configured" falsely as connected', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    mockQuery.mockRejectedValue(new Error('db down'));
    const body = await (await GET(req)).json();
    expect(body.providers.telegram.state).not.toBe('configured');
  });
});

describe('structural — no send, no string-matching', () => {
  const statusRoute = read('app/api/notifications/status/route.ts');
  const settings = read('app/studio/settings/page.tsx');

  it('the status endpoint never invokes a provider send path', () => {
    expect(statusRoute).not.toMatch(/TwilioProvider|sendMessage|fetch\(/);
  });

  it('settings no longer POSTs a message to learn configuration', () => {
    expect(code(settings)).not.toMatch(/apiFetch\('\/api\/notifications\/sms'/);
    expect(code(settings)).not.toMatch(/to: 'test'/);
  });

  it('settings branches on HTTP status before reading the body', () => {
    expect(settings).toMatch(/res\.status === 401 \|\| res\.status === 403/);
  });

  it('settings does not parse error strings to decide configuration', () => {
    expect(code(settings)).not.toMatch(/error\?\.includes\(/);
  });

  it('the remedy hint is withheld unless "not configured" is what was found', () => {
    expect(settings).toMatch(/!smsStatus\?\.unauthorized/);
  });

  it('reads status through the SAME authority as the send routes', () => {
    // Not a weaker session-only gate: resolveSendAuthority requires an ACTIVE
    // PRACTITIONER (via getCurrentPractitioner), identically to the send paths.
    // A read that disclosed provider setup to a caller who cannot send would
    // leak configuration across the very boundary #784 established.
    expect(statusRoute).toMatch(/resolveSendAuthority\(request\)/);
    expect(read('app/api/notifications/sms/route.ts')).toMatch(/resolveSendAuthority\(request/);
    const authority = read('lib/notifications/sendAuthority.ts');
    expect(authority).toMatch(/getCurrentPractitioner\(request\)/);
    expect(statusRoute).not.toMatch(/getMemberIdFromRequest|getCurrentSession/);
  });

  it('declares no state it cannot determine', () => {
    // Credential presence proves CONFIGURATION, not reachability. Scope this to
    // the ProviderState union — the route legitimately queries the
    // practitioner_integrations column value `status = 'connected'`, which is a
    // database fact, not a state we report to the caller.
    const union = code(statusRoute).match(/export type ProviderState =[\s\S]*?;/)?.[0] ?? '';
    expect(union).toBeTruthy();
    expect(union).toMatch(/'unauthorized'/);
    expect(union).toMatch(/'not_configured'/);
    expect(union).toMatch(/'configured'/);
    expect(union).not.toMatch(/'connected'|'disconnected'/);
  });
});
