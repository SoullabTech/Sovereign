import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  AUDIO_OUTPUT_TAB_NONCE,
  SOULLAB_AUDIO_PREFLIGHT_VERSION,
} from '../../lib/listening/audioOutputLock.ts';
import {
  shouldPauseReaderForFocus,
  shouldPauseReaderForTabMessage,
} from '../../lib/listening/readerNarrationAuthority.ts';
import { checkAccess, matchRule } from '../../config/accessMatrix.ts';
import {
  presentReadingMoment,
  readerMomentType,
  readerRitualMode,
  readerText,
  readerUuid,
} from '../../lib/reader/readerValidation.ts';

const root = path.resolve(import.meta.dirname, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const reader = read('components/reader/AudiobookReader.tsx');
const readerPage = read('app/maia/community/elemental-alchemy/reader/page.tsx');
const drawer = read('components/reader/ReflectionDrawer.tsx');
const boundary = read('components/listening/AuthenticatedListeningBoundary.tsx');
const provider = read('components/listening/PersistentListeningProvider.tsx');
const lock = read('lib/listening/audioOutputLock.ts');
const controls = read('components/reader/AudioControls.tsx');
const listeningRoom = read('app/listen/ListenRoom.tsx');
const momentsRoute = read('app/api/reader/moments/route.ts');
const askRoute = read('app/api/reader/ask/route.ts');

const priorMode = process.env.ACCESS_CONTROL_MODE;
process.env.ACCESS_CONTROL_MODE = 'strict';
test.after(() => {
  if (priorMode === undefined) delete process.env.ACCESS_CONTROL_MODE;
  else process.env.ACCESS_CONTROL_MODE = priorMode;
});

test('Reader narration yields to MAIA/protected speech but not lower-priority music', () => {
  assert.equal(shouldPauseReaderForFocus('maia-voice'), true);
  assert.equal(shouldPauseReaderForFocus('writers-listen'), true);
  assert.equal(shouldPauseReaderForFocus('external'), true);
  assert.equal(shouldPauseReaderForFocus('listening-room'), false);
  assert.equal(shouldPauseReaderForFocus('sound-sanctuary'), false);
  assert.equal(shouldPauseReaderForFocus('reader-narration'), false);
  assert.equal(shouldPauseReaderForFocus(null), false);
});

test('Reader cross-tab preemption is narrow and ignores its own preflight', () => {
  const remote = 'fictional-other-tab';
  assert.equal(shouldPauseReaderForTabMessage({
    type: 'maia-speech-preflight', version: SOULLAB_AUDIO_PREFLIGHT_VERSION, tab: remote,
  }), true);
  assert.equal(shouldPauseReaderForTabMessage({
    type: 'reader-narration-preflight', version: SOULLAB_AUDIO_PREFLIGHT_VERSION, tab: remote,
  }), true);
  assert.equal(shouldPauseReaderForTabMessage({
    type: 'music-preflight', version: SOULLAB_AUDIO_PREFLIGHT_VERSION, tab: remote,
  }), false);
  assert.equal(shouldPauseReaderForTabMessage({
    type: 'reader-narration-preflight', version: SOULLAB_AUDIO_PREFLIGHT_VERSION, tab: AUDIO_OUTPUT_TAB_NONCE,
  }), false);
  assert.equal(shouldPauseReaderForTabMessage({
    type: 'reader-narration-preflight', version: 999, tab: remote,
  }), false);
  assert.equal(shouldPauseReaderForTabMessage(null), false);
});

test('shared output lock names Reader without creating a second coordinator', () => {
  assert.match(lock, /'reader-narration'/);
  assert.match(lock, /'reader-narration-preflight'/);
  assert.match(lock, /requestAudioFocus\('reader-narration'\)/);
  assert.match(lock, /setTimeout\(\(\) => controller\.abort\(\), 2500\)/);
  assert.doesNotMatch(lock, /useAudioCoordinator|registerPlayer|localStorage|sessionStorage/);
});

test('Reader client consumes verified context and never manufactures browser identity', () => {
  assert.match(reader, /useVerifiedAudioMemberKey/);
  assert.match(reader, /acquireAudioOutput\('reader-narration'\)/);
  assert.match(reader, /SOULLAB_SESSION_END_EVENT/);
  assert.match(reader, /shouldPauseReaderForFocus/);
  assert.match(reader, /shouldPauseReaderForTabMessage/);
  assert.match(reader, /credentials:\s*'include'/);
  assert.match(reader, /releaseOutput/);
  assert.match(reader, /data-reader-audio/);
  assert.doesNotMatch(reader + readerPage + drawer, /localStorage|sessionStorage|x-member-id|local-dev-user/);
  assert.doesNotMatch(reader, /autoPlay|useAudioCoordinator|registerPlayer/);
});

test('Listening Room exposes one explicit App Router doorway to Reader', () => {
  assert.match(listeningRoom, /title:'Elemental Alchemy Reader',href:'\/maia\/community\/elemental-alchemy\/reader'/);
  assert.match(listeningRoom, /import Link from 'next\/link'/);
});

test('Reader controls expose explicit Play, Pause and Stop without native bypass controls', () => {
  assert.match(controls, /Play narration/);
  assert.match(controls, /Pause narration/);
  assert.match(controls, /Stop narration/);
  assert.match(reader, /onStop=\{\(\) => stopNarration\(\)\}/);
  assert.doesNotMatch(reader, /\bcontrols\b/);
});

test('root receipt is independent of the music review flag while transport is not', () => {
  assert.match(boundary, /receiptEligible = readerRoute \|\| \(enabled && onlineRoute\)/);
  assert.match(boundary, /transportEligible = enabled && onlineRoute/);
  assert.match(boundary, /VerifiedAudioMemberProvider memberKey=\{activeMemberKey\}/);
  assert.match(boundary, /apiFetch\('\/api\/members\/session'/);
  assert.doesNotMatch(boundary, /localStorage|sessionStorage|x-member-id/);
});

test('persistent music cooperates with Reader preflight and cannot auto-resume itself', () => {
  assert.match(provider, /message\.type === 'reader-narration-preflight'/);
  assert.match(provider, /source && source !== 'listening-room'\) pause\(\)/);
  assert.doesNotMatch(provider, /reader-narration-preflight'[\s\S]{0,200}(playSketch|playLocalFile)/);
});

test('Reader identifiers and moments are validated and presented in the client contract', () => {
  const uuid = '47211111-1111-4111-8111-111111111111';
  assert.equal(readerUuid(uuid.toUpperCase()), uuid);
  assert.equal(readerUuid(`${uuid}-suffix`), null);
  assert.equal(readerMomentType('highlight'), 'highlight');
  assert.equal(readerMomentType('delete'), null);
  assert.equal(readerRitualMode('aether'), 'aether');
  assert.equal(readerRitualMode('ether'), null);
  assert.equal(readerText('  a member note  ', 100), 'a member note');
  assert.equal(readerText('x'.repeat(101), 100), null);
  assert.deepEqual(presentReadingMoment({
    id: 'moment', segment_id: uuid, moment_type: 'highlight', content: null,
    ritual_mode: 'earth', created_at: '2026-10-25T22:00:00.000Z',
    segment_text: 'Fictional passage', segment_index: 0,
  }), {
    id: 'moment', segmentId: uuid, type: 'highlight', content: undefined,
    ritualMode: 'earth', createdAt: '2026-10-25T22:00:00.000Z',
    segmentText: 'Fictional passage', segmentIndex: 0,
  });
  assert.match(readerPage, /id: seg\.id \|\| `\$\{manifest\.id\}-\$\{idx\}`/);
});

test('Reader APIs derive ownership from the verified session and reject browser identity', () => {
  for (const source of [momentsRoute, askRoute]) {
    assert.match(source, /getMemberIdFromRequest\(request\)/);
    assert.doesNotMatch(source, /x-member-id|localStorage|sessionStorage/);
  }
  assert.match(momentsRoute, /WHERE rm\.member_id = \$1/);
  assert.match(momentsRoute, /result\.rows\.map\(presentReadingMoment\)/);
  assert.match(momentsRoute, /Valid segmentId and momentType required/);
  assert.match(askRoute, /Valid segmentId and question required/);
});

test('Reader page and APIs have exact authenticated outer rules in strict mode', () => {
  for (const pathname of [
    '/maia/community/elemental-alchemy/reader',
    '/api/reader/moments',
    '/api/reader/ask',
  ]) {
    const rule = matchRule(pathname);
    assert.ok(rule, pathname);
    assert.equal(rule.exact, pathname);
    assert.equal(rule.prefix, undefined);
    assert.equal(rule.minTier, 'free');
    assert.equal(checkAccess(pathname, 'free', ['member'], true).allowed, true);
    const anonymous = checkAccess(pathname, 'free', [], false);
    assert.equal(anonymous.allowed, false);
    assert.equal(anonymous.reason, 'unauthenticated');
  }
  for (const pathname of ['/api/reader/moments/other', '/api/reader/ask/other']) {
    assert.equal(matchRule(pathname), null, pathname);
    assert.equal(checkAccess(pathname, 'free', ['member'], true).allowed, false, pathname);
  }
});
