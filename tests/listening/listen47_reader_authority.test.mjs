import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');

const page = read('app/maia/community/elemental-alchemy/reader/page.tsx');
const session = read('components/reader/useVerifiedReaderSession.ts');
const reader = read('components/reader/AudiobookReader.tsx');
const reflection = read('components/reader/ReflectionDrawer.tsx');
const controls = read('components/reader/AudioControls.tsx');
const output = read('lib/listening/audioOutputLock.ts');
const focus = read('lib/listening/audioFocus.ts');
const music = read('components/listening/PersistentListeningProvider.tsx');
const access = read('config/accessMatrix.ts');
const sessionFetch = read('lib/http/verifiedSessionFetch.ts');
const elementalHub = read('app/maia/community/elemental-alchemy/page.tsx');
const listenRoom = read('app/listen/ListenRoom.tsx');
const boundary = read('components/listening/AuthenticatedListeningBoundary.tsx');
const identityHealing = read('lib/identity/healIdentity.ts');
const provider = read('components/listening/PersistentListeningProvider.tsx');


test('root Listening Room refuses standalone fallback while session verification is pending', () => {
  assert.match(provider, /ListeningBoundaryStatusProvider/);
  assert.match(boundary, /sessionStatus/);
  assert.match(boundary, /status=\{boundaryStatus\}/);
  assert.match(listenRoom, /useListeningBoundaryStatus/);
  assert.match(listenRoom, /disabled=\{!transportReady\}/);
  assert.match(listenRoom, /!persistent && standalone &&/);
  assert.match(listenRoom, /transportReady && <LocalAudioDesk/);
  assert.match(listenRoom, /Listening transport is verifying your session/);
});

test('Reader has one deliberate entry from the existing Elemental Alchemy hub', () => {
  assert.match(elementalHub, /router\.push\('\/maia\/community\/elemental-alchemy\/reader'\)/);
  assert.match(elementalHub, /Read &amp; Listen/);
});

test('global identity healing trusts the credential and repairs stale cache keys', () => {
  assert.match(identityHealing, /verifiedSessionFetch\('\/api\/members\/me'/);
  assert.match(identityHealing, /localStorage\.setItem\('memberId', member\.id\)/);
  assert.match(identityHealing, /'maia_session_token'/);
  assert.doesNotMatch(identityHealing, /headers:\s*\{[\s\S]*'x-member-id'/);
  assert.doesNotMatch(identityHealing, /return \{ status: 'reauth_required', reason: 'No local identity found' \}/);
});

test('Reader identity comes from the canonical verified session receipt', () => {
  assert.match(page, /useVerifiedReaderSession/);
  assert.match(session, /verifiedSessionFetch\('\/api\/members\/session'/);
  assert.match(session, /verifiedListeningMemberKey/);
  assert.match(session, /cache:\s*'no-store'/);
  assert.match(session, /SOULLAB_SESSION_END_EVENT/);
  assert.doesNotMatch(page, /localStorage|beta_user|local-dev-user|getValidMemberId|x-member-id/);
  assert.doesNotMatch(session, /localStorage|sessionStorage|getValidMemberId/);
  assert.match(sessionFetch, /x-session-token/);
  assert.match(sessionFetch, /headers\.delete\('x-member-id'\)/);
  assert.doesNotMatch(sessionFetch, /getValidMemberId|beta_user|explorerId/);
});

test('Reader private reads and writes use credentialed APIs without a supplied member id', () => {
  assert.match(access, /exact: '\/api\/reader\/moments', minTier: 'free'/);
  assert.match(access, /exact: '\/api\/reader\/ask', minTier: 'free'/);
  assert.match(reader, /verifiedSessionFetch\(`\/api\/reader\/moments/);
  assert.match(reflection, /verifiedSessionFetch\('\/api\/reader\/moments'/);
  assert.match(reflection, /verifiedSessionFetch\('\/api\/reader\/ask'/);
  assert.doesNotMatch(reader, /x-member-id|memberId/);
  assert.doesNotMatch(reflection, /x-member-id|memberId/);
  assert.match(reflection, /response\.status === 401/);
  assert.match(reflection, /SOULLAB_SESSION_END_EVENT/);
});

test('Reader narration owns an explicit exclusive output lease', () => {
  assert.match(output, /'reader-narration'/);
  assert.match(output, /'reader-narration-preflight'/);
  assert.match(output, /requestAudioFocus\('reader-narration'\)/);
  assert.match(focus, /\| 'reader-narration'/);
  assert.match(reader, /acquireAudioOutput\('reader-narration'\)/);
  assert.match(reader, /outputLease\.current\?\.release\(\)/);
  assert.match(reader, /addEventListener\('ended'/);
  assert.match(reader, /addEventListener\('error'/);
  assert.match(reader, /SOULLAB_SESSION_END_EVENT/);
});

test('MAIA and competing narration may preempt Reader; music may not', () => {
  assert.match(reader, /message\.type === 'maia-speech-preflight'/);
  assert.match(reader, /message\.type === 'reader-narration-preflight'/);
  assert.match(reader, /A music preflight never preempts active narration/);
  assert.match(reader, /source === 'maia-voice'/);
  assert.match(music, /message\.type === 'reader-narration-preflight'/);
});

test('Reader supplies explicit stop and no automatic music-resume path', () => {
  assert.match(controls, /aria-label="Stop narration"/);
  assert.match(reader, /Music will not restart automatically/);
  assert.match(reader, /No other audio was restarted/);
  assert.doesNotMatch(reader, /resume.*music|playSketch|playLocalFile/i);
});
