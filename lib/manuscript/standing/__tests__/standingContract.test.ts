/**
 * WS2-07 · BUILD-07F — the closed envelope and the resource's absent verbs.
 *
 * The parser tests are pure. The route tests read the route SOURCE with comments
 * stripped: this lane's modules discuss at length the things they must not do,
 * and a check that counted prose would pass for the wrong reason.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { isStanding, parseStandingRequest, STANDINGS } from '../contract';

const ROOT = join(__dirname, '..', '..', '..', '..');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const ROUTE = strip(readFileSync(join(ROOT,
  'app/api/sovereign/manuscripts/[id]/readings/[readingId]/standings/route.ts'), 'utf8'));
const STORE = strip(readFileSync(join(ROOT, 'lib/manuscript/standing/store.ts'), 'utf8'));
const CONTRACT = strip(readFileSync(join(ROOT, 'lib/manuscript/standing/contract.ts'), 'utf8'));

const EVENT = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const ok = { observationKey: 'o1', standing: 'keep', expectedCurrentEventId: null };

describe('the three values, and no fourth', () => {
  it('holds exactly keep, dismiss and unresolved', () => {
    expect([...STANDINGS].sort()).toEqual(['dismiss', 'keep', 'unresolved']);
  });

  it('has no UNSET value — UNSET is zero events, and a value would make it writable', () => {
    expect(isStanding('unset')).toBe(false);
    expect(CONTRACT).not.toMatch(/'unset'/);
    expect(parseStandingRequest({ ...ok, standing: 'unset' }).ok).toBe(false);
  });

  it('has no `investigate` — a different axis is not a standing', () => {
    expect(isStanding('investigate')).toBe(false);
    expect(parseStandingRequest({ ...ok, standing: 'investigate' }).ok).toBe(false);
  });
});

describe('the envelope is closed', () => {
  it('accepts exactly the three fields', () => {
    const r = parseStandingRequest({ ...ok, expectedCurrentEventId: EVENT });
    expect(r.ok).toBe(true);
    expect(r.ok && r.request.expectedCurrentEventId).toBe(EVENT);
  });

  it('refuses an ABSENT expectation — absent is not null', () => {
    /* A client that never looked must not be able to overwrite a standing it
       never saw by simply omitting the field. */
    expect(parseStandingRequest({ observationKey: 'o1', standing: 'keep' }).ok).toBe(false);
  });

  it('accepts an explicit null — the caller acting from an observed UNSET', () => {
    expect(parseStandingRequest(ok).ok).toBe(true);
  });

  it('refuses a memberId in the body — authentication supplies it', () => {
    expect(parseStandingRequest({ ...ok, memberId: 'someone' }).ok).toBe(false);
  });

  it('refuses any field this contract does not name', () => {
    for (const extra of ['readingId', 'investigate', 'anchor', 'actor', 'clear']) {
      expect(parseStandingRequest({ ...ok, [extra]: 'x' }).ok).toBe(false);
    }
  });

  it('refuses a malformed token, an empty key and a non-object body', () => {
    expect(parseStandingRequest({ ...ok, expectedCurrentEventId: 'not-a-uuid' }).ok).toBe(false);
    expect(parseStandingRequest({ ...ok, observationKey: '' }).ok).toBe(false);
    expect(parseStandingRequest([ok]).ok).toBe(false);
    expect(parseStandingRequest(null).ok).toBe(false);
  });
});

describe('the resource has no verb it was not given', () => {
  it('exports GET and POST only', () => {
    expect(ROUTE).toMatch(/export async function GET/);
    expect(ROUTE).toMatch(/export async function POST/);
    for (const verb of ['PUT', 'PATCH', 'DELETE']) {
      expect(ROUTE).not.toMatch(new RegExp(`export async function ${verb}`));
    }
  });

  it('returns the CAS token with the current standing', () => {
    expect(ROUTE).toMatch(/currentEventId: e\.id/);
  });

  it('takes the member from authentication, never from the request body', () => {
    expect(ROUTE).toMatch(/getMemberIdFromRequest\(req\)/);
    expect(ROUTE).not.toMatch(/body\.memberId|request\.memberId|\.memberId\s*\?\?/);
  });

  it('hands a refusal no fresh token', () => {
    expect(ROUTE).not.toMatch(/refusal:[\s\S]{0,120}currentEventId/);
  });
});

describe('the store writes one table and rewrites nothing', () => {
  it('has no UPDATE or DELETE statement anywhere', () => {
    expect(STORE).not.toMatch(/\bUPDATE\s+developmental/i);
    expect(STORE).not.toMatch(/\bDELETE\s+FROM\b/i);
  });

  it('inserts only into the standing event stream', () => {
    const inserts = [...STORE.matchAll(/INSERT\s+INTO\s+([a-z_]+)/gi)].map((m) => m[1]);
    expect(inserts).toEqual(['developmental_observation_standing_events']);
  });

  it('carries member_id in the predicate of every read of the stream', () => {
    const selects = [...STORE.matchAll(/FROM developmental_observation_standing_events[\s\S]{0,200}?WHERE ([^\n]+)/g)];
    expect(selects.length).toBeGreaterThan(0);
    for (const s of selects) expect(s[1]).toContain('member_id = $1');
  });

  it('tests the expected-current token before reporting a no-op', () => {
    const stale = STORE.indexOf("reason: 'stale_expectation'");
    const noop = STORE.indexOf("outcome: 'unchanged'");
    expect(stale).toBeGreaterThan(-1);
    expect(noop).toBeGreaterThan(stale);
  });
});
