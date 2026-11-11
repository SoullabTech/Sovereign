// LISTEN-01 · media tickets for the iOS gated audio path. A ticket is opaque, bound to one file, expiring,
// and never authority on its own: the route re-checks flag, beta membership and release on every request.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MEDIA_TICKET_TTL_SECONDS, issueMediaTicket, verifyMediaTicket } from '../../lib/listening/mediaTicket.ts';
import { checkAccess, matchRule } from '../../config/accessMatrix.ts';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const code = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const read = f => code(fs.readFileSync(path.join(root, f), 'utf8'));
const SECRET = 'fictional-test-secret-0123456789-abcdefghij';
const A = '/media/sound-studio/open-ground/Open_Ground_Drone01_6min_v1.m4a';
const B = '/media/sound-studio/night-ground/Night_Ground_01_Guided_Arrival_12min_v0.1.m4a';
const MEMBER = '5b4c7c1e-1d2f-4a3b-9c8d-7e6f5a4b3c2d';
const NOW = 1_800_000_000_000;

test('a ticket opens exactly its own file, for its own member, until it expires', () => {
  const { ticket, expiresAt } = issueMediaTicket(MEMBER, A, NOW, SECRET);
  assert.equal(expiresAt, NOW / 1000 + MEDIA_TICKET_TTL_SECONDS);
  assert.equal(verifyMediaTicket(ticket, A, NOW, SECRET), MEMBER);
  assert.equal(verifyMediaTicket(ticket, B, NOW, SECRET), null, 'bound to one file');
  assert.equal(verifyMediaTicket(ticket, A, expiresAt * 1000, SECRET), null, 'expired at its expiry');
  assert.equal(verifyMediaTicket(ticket, A, NOW, `${SECRET}-other`), null, 'other secret');
});

test('tampering with any byte, or malformed input, is refused', () => {
  const { ticket } = issueMediaTicket(MEMBER, A, NOW, SECRET);
  // The final base64url character carries padding bits: swapping A<->B there can decode to the identical bytes
  // (not a forgery, just the same ticket), which made this test fail ~1 run in 4. Tamper only significant chars.
  for (let i = 0; i < ticket.length - 1; i += 7) {
    const c = ticket[i] === 'A' ? 'B' : 'A';
    assert.equal(verifyMediaTicket(ticket.slice(0, i) + c + ticket.slice(i + 1), A, NOW, SECRET), null, `byte ${i}`);
  }
  for (const bad of ['', 'x', '!!!!', 'a'.repeat(700), null, undefined]) assert.equal(verifyMediaTicket(bad, A, NOW, SECRET), null);
});

test('no usable secret means no tickets issued and none accepted', () => {
  assert.equal(issueMediaTicket(MEMBER, A, NOW, undefined), null);
  assert.equal(issueMediaTicket(MEMBER, A, NOW, 'too-short'), null);
  const { ticket } = issueMediaTicket(MEMBER, A, NOW, SECRET);
  assert.equal(verifyMediaTicket(ticket, A, NOW, undefined), null);
});

test('the ticket is opaque: no member id or path is readable in it', () => {
  const { ticket } = issueMediaTicket(MEMBER, A, NOW, SECRET);
  const decoded = Buffer.from(ticket.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('latin1');
  assert.doesNotMatch(ticket + decoded, /5b4c7c1e|Open_Ground|sound-studio/);
  assert.notEqual(issueMediaTicket(MEMBER, A, NOW, SECRET).ticket, ticket, 'fresh IV each time');
});

test('the media route: flag first; a present-but-invalid ticket is refused, never falls back to the session; beta and release re-checked', () => {
  const r = read('app/media/sound-studio/[...path]/route.ts');
  const flag = r.indexOf('if (!soundStudioMediaEnabled(process.env)) return refuse(404)');
  const ticket = r.indexOf("searchParams.get('t')");
  const verify = r.indexOf('verifyMediaTicket(');
  const refuseBad = r.indexOf('if (!fromTicket) return refuse(404)');
  const session = r.indexOf('await requireMemberId()');
  const cohort = r.indexOf('if (!hasListenBetaAccess(memberId)) return refuse(404)');
  const release = r.indexOf('mediaAllowedFor(segments, isListenFounder(memberId))');
  assert.ok(flag > 0 && ticket > flag && verify > ticket && refuseBad > verify && session > refuseBad, 'flag → ticket → refuse bad ticket → else session');
  assert.ok(cohort > session && release > cohort, 'beta membership and release re-checked for ticket and session alike');
  assert.match(r, /verifyMediaTicket\(ticket, SOUND_STUDIO_MEDIA_URL_PREFIX \+ segments\.join\('\/'\)/, 'ticket checked against the path actually requested');
});

test('issuing tickets requires flag, session and beta, and only for files this member may hear', () => {
  const r = read('app/api/listen/media-ticket/route.ts');
  const flag = r.indexOf('soundStudioMediaEnabled(process.env)');
  const session = r.indexOf('await requireMemberId()');
  const cohort = r.indexOf('hasListenBetaAccess(memberId)');
  const issue = r.indexOf('issueMediaTicket(');
  assert.ok(flag > 0 && session > flag && cohort > session && issue > cohort);
  assert.ok(r.indexOf('mediaAllowedFor(segments, founder)') < issue, 'release check before issuing');
  assert.match(r, /paths\.length > 4/);
});

test('proxy: media is public only so the route can decide; the ticket endpoint needs a member', () => {
  assert.equal(matchRule(A).public, true);
  assert.equal(checkAccess('/api/listen/media-ticket', 'free', [], false).allowed, false);
});
