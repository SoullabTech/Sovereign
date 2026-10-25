import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  ONLINE_LISTENING_ROUTE_PREFIXES,
  isOnlineListeningRoute,
  verifiedListeningMemberKey,
} from '../../lib/listening/listeningSessionBoundary.ts';

const root = path.resolve(import.meta.dirname, '../..');
const boundarySource = fs.readFileSync(
  path.join(root, 'components/listening/AuthenticatedListeningBoundary.tsx'), 'utf8',
);
const layoutSource = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');

const fictionalMember = '11111111-2222-4333-8444-555555555555';

test('only the seven browser-first Sound Field route families are admitted', () => {
  assert.deepEqual([...ONLINE_LISTENING_ROUTE_PREFIXES], [
    '/listen', '/home', '/house', '/maia', '/writers-studio', '/journal', '/astrology',
  ]);
  for (const route of ONLINE_LISTENING_ROUTE_PREFIXES) {
    assert.equal(isOnlineListeningRoute(route), true, route);
    assert.equal(isOnlineListeningRoute(`${route}/fictional-child`), true, route);
  }
});

test('public, administrative, live-practice, Cabin and prefix-spoof routes fail closed', () => {
  for (const route of [
    '/', '/signin', '/account', '/admin', '/practitioner', '/session', '/cabin',
    '/listen-public', '/household', '/maiax', '/writers-studio-spoof',
  ]) assert.equal(isOnlineListeningRoute(route), false, route);
});

test('minimum session receipt requires authenticated true plus a UUID member id', () => {
  assert.equal(verifiedListeningMemberKey({
    authenticated: true,
    member: { id: fictionalMember, username: 'ignored', tier: 'ignored' },
  }), fictionalMember);
  for (const value of [
    null,
    { authenticated: false, member: { id: fictionalMember } },
    { authenticated: true },
    { authenticated: true, member: { id: 'bare-browser-member' } },
    { authenticated: true, member: { id: 42 } },
    { memberId: fictionalMember },
  ]) assert.equal(verifiedListeningMemberKey(value), null);
});

test('client boundary uses the canonical session seam and contains no browser identity fallback', () => {
  assert.match(boundarySource, /apiFetch\('\/api\/members\/session'/);
  assert.match(boundarySource, /cache:\s*'no-store'/);
  assert.match(boundarySource, /SOULLAB_SESSION_END_EVENT/);
  assert.match(boundarySource, /PersistentListeningProvider/);
  assert.match(boundarySource, /runtimeMode === 'online'/);
  assert.match(boundarySource, /setMemberKey\(null\)/);
  assert.doesNotMatch(boundarySource, /localStorage|sessionStorage|getValidMemberId|x-member-id/);
  assert.doesNotMatch(boundarySource, /preferredName|username|tier|roles/);
});

test('eligible-route rechecks cannot clear the current transport through an aborted stale request', () => {
  assert.match(boundarySource, /controller\.signal\.aborted/);
  assert.match(boundarySource, /requestGeneration\.current \+= 1;[\s\S]*requestController\.current\?\.abort\(\)/);
  assert.match(boundarySource, /key=\{activeMemberKey\}/);
});

test('root mounts the listening boundary outside MaiaPresence and behind review/offline gates', () => {
  const boundaryOpen = layoutSource.indexOf('<AuthenticatedListeningBoundary');
  const maiaOpen = layoutSource.indexOf('<MaiaPresence>', boundaryOpen);
  const maiaClose = layoutSource.indexOf('</MaiaPresence>', maiaOpen);
  const boundaryClose = layoutSource.indexOf('</AuthenticatedListeningBoundary>', maiaClose);
  assert.ok(boundaryOpen >= 0 && boundaryOpen < maiaOpen);
  assert.ok(maiaOpen < maiaClose && maiaClose < boundaryClose);
  assert.match(layoutSource, /SOULLAB_LISTEN_REVIEW_ENABLED === "1"/);
  assert.match(layoutSource, /MAIA_CABIN_MODE === "offline" \? "offline" : "online"/);
});
