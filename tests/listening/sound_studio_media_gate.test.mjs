// LISTEN-01 dark launch (2026-11-09): Sound Studio review audio is not a public asset.
// It lives in private-media/ and is served only by a route that requires the review flag and a verified member.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  SOUND_STUDIO_ADMITTED_MEDIA, SOUND_STUDIO_BETA_RELEASED, SOUND_STUDIO_MEDIA_DIR, listenBetaAllows, mediaAllowedFor,
  parseByteRange, parseMemberIdList, resolveSoundStudioMedia, soundStudioMediaEnabled,
} from '../../lib/listening/soundStudioMediaGate.ts';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const code = text => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const manifestDir = path.join(root, 'lib/listening/manifests');

function bundledPaths() {
  const found = new Map();
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (typeof node.path === 'string' && node.bundled === true) found.set(node.path, node.sizeBytes);
    for (const value of Object.values(node)) walk(value);
  };
  for (const file of fs.readdirSync(manifestDir).filter(f => f.endsWith('.json'))) {
    walk(JSON.parse(fs.readFileSync(path.join(manifestDir, file), 'utf8')));
  }
  return found;
}

test('no Sound Studio audio is tracked or present under public/', () => {
  const tracked = execFileSync('git', ['ls-files', 'public/media/sound-studio'], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(tracked, '', 'Sound Studio media must not be tracked under public/');
  assert.equal(fs.existsSync(path.join(root, 'public/media/sound-studio')), false);
});

test('the allowlist is exactly the bundled manifest editions, and every file exists privately at its stated size', () => {
  const bundled = bundledPaths();
  assert.deepEqual([...bundled.keys()].sort(), [...SOUND_STUDIO_ADMITTED_MEDIA].sort());
  for (const [urlPath, sizeBytes] of bundled) {
    const segments = urlPath.replace('/media/sound-studio/', '').split('/');
    const relative = resolveSoundStudioMedia(segments);
    assert.equal(relative, `${SOUND_STUDIO_MEDIA_DIR}/${segments.join('/')}`);
    assert.equal(fs.statSync(path.join(root, relative)).size, sizeBytes, urlPath);
  }
});

test('only exact allowlisted files resolve; traversal, partial and unknown paths are refused', () => {
  for (const bad of [
    [], [''], ['..', 'package.json'], ['open-ground', '..', '..', '.env'], ['open-ground'],
    ['open-ground', 'Open_Ground_Drone01_6min_v1.m4a', 'x'], ['open-ground/Open_Ground_Drone01_6min_v1.m4a'],
    ['open-ground', 'Open_Ground_Drone01_6min_v1_24bit48k.flac'], ['open-ground', 'Open_Ground_Drone01_6min_v1.m4a\0'],
    ['night-ground', '.'], ['night-ground', 'a\\b.m4a'],
  ]) assert.equal(resolveSoundStudioMedia(bad), null, JSON.stringify(bad));
  assert.equal(resolveSoundStudioMedia(['open-ground', 'Open_Ground_Drone01_6min_v1.m4a']),
    'private-media/sound-studio/open-ground/Open_Ground_Drone01_6min_v1.m4a');
});

test('the flag opens only on the literal "1", exactly as the /listen page reads it', () => {
  assert.equal(soundStudioMediaEnabled({}), false);
  for (const value of ['0', 'true', 'TRUE', ' 1', '1 ', 'yes', '']) {
    assert.equal(soundStudioMediaEnabled({ SOULLAB_LISTEN_REVIEW_ENABLED: value }), false, value);
  }
  assert.equal(soundStudioMediaEnabled({ SOULLAB_LISTEN_REVIEW_ENABLED: '1' }), true);
  assert.match(read('app/listen/page.tsx'), /SOULLAB_LISTEN_REVIEW_ENABLED !== '1'/);
});

test('byte ranges: single ranges served, invalid ones refused or ignored', () => {
  assert.equal(parseByteRange(null, 100), null);
  assert.equal(parseByteRange('items=0-1', 100), null);
  assert.equal(parseByteRange('bytes=0-1,5-6', 100), null);
  assert.equal(parseByteRange('bytes=-', 100), null);
  assert.deepEqual(parseByteRange('bytes=0-', 100), { start: 0, end: 99 });
  assert.deepEqual(parseByteRange('bytes=10-19', 100), { start: 10, end: 19 });
  assert.deepEqual(parseByteRange('bytes=90-500', 100), { start: 90, end: 99 });
  assert.deepEqual(parseByteRange('bytes=-10', 100), { start: 90, end: 99 });
  assert.deepEqual(parseByteRange('bytes=-500', 100), { start: 0, end: 99 });
  assert.equal(parseByteRange('bytes=100-', 100), 'unsatisfiable');
  assert.equal(parseByteRange('bytes=20-10', 100), 'unsatisfiable');
  assert.equal(parseByteRange('bytes=-0', 100), 'unsatisfiable');
});

test('the route checks the flag, then the member session, then the beta cohort, then the allowlist, before touching the disk', () => {
  const route = code(read('app/media/sound-studio/[...path]/route.ts'));
  const flag = route.indexOf('soundStudioMediaEnabled(process.env)');
  const member = route.indexOf('await requireMemberId()');
  const cohort = route.indexOf('if (!hasListenBetaAccess(memberId)) return refuse(404)');
  const allow = route.indexOf('resolveSoundStudioMedia(segments)');
  const release = route.indexOf('mediaAllowedFor(segments, isListenFounder(memberId))');
  const disk = route.indexOf('fs.stat(');
  assert.ok(flag > 0 && member > flag && cohort > member && allow > cohort && release > allow && disk > release,
    'order: flag → member → cohort → allowlist → release → disk');
  assert.match(route, /if \(!soundStudioMediaEnabled\(process\.env\)\) return refuse\(404\)/);
  assert.match(route, /'Cache-Control': 'private, no-store'/);
  assert.doesNotMatch(route, /['"]public['"]/);
  assert.doesNotMatch(route, /\bPOST\b|\bPUT\b|\bDELETE\b/);
});

test('deployment and platform wiring keep the audio private and web-only', () => {
  const docker = read('Dockerfile');
  assert.match(docker, /COPY --from=builder --chown=node:node \/app\/private-media \.\/private-media/);
  assert.doesNotMatch(docker, /private-media[^\n]*\.\/public/);
  assert.match(read('config/accessMatrix.ts'), /prefix: '\/media\/sound-studio\/', minTier: 'free'/);
  assert.match(read('scripts/capacitor-patch-routes.sh'), /^\s*"app\/media"\s*$/m);
  assert.match(read('lib/mobile/mobileAllowlist.ts'), /'\/media\/sound-studio\/'/);
  const dockerignore = fs.existsSync(path.join(root, '.dockerignore')) ? read('.dockerignore') : '';
  assert.doesNotMatch(dockerignore, /^\/?private-media\/?$/m, 'the image needs private-media');
});

test('named beta cohort: founders always pass, listed testers pass, everyone else and an empty list do not', () => {
  const ids = parseMemberIdList(' a-1 , ,b-2,');
  assert.deepEqual([...ids].sort(), ['a-1', 'b-2']);
  assert.equal(parseMemberIdList(undefined).size, 0);
  assert.equal(listenBetaAllows('a-1', false, ids), true);
  assert.equal(listenBetaAllows('c-3', false, ids), false);
  assert.equal(listenBetaAllows('c-3', true, ids), true);
  assert.equal(listenBetaAllows('a-1', false, parseMemberIdList('')), false, 'unset list admits no tester');
  assert.equal(listenBetaAllows('', true, ids), false);
});

test('per-recording release: testers hear only released files; founders hear every admitted file; nothing unlisted', () => {
  for (const p of SOUND_STUDIO_BETA_RELEASED) assert.ok(SOUND_STUDIO_ADMITTED_MEDIA.includes(p), `${p} released but not admitted`);
  const seg = p => p.replace('/media/sound-studio/', '').split('/');
  for (const p of SOUND_STUDIO_ADMITTED_MEDIA) {
    assert.equal(mediaAllowedFor(seg(p), true), true);
    assert.equal(mediaAllowedFor(seg(p), false), SOUND_STUDIO_BETA_RELEASED.includes(p));
  }
  assert.equal(mediaAllowedFor(['..', 'package.json'], true), false);
  assert.equal(mediaAllowedFor(['open-ground', 'unknown.m4a'], true), false);
});

test('the cohort module fails closed and is read only by the two Sound Studio doors', () => {
  const mod = code(read('lib/listening/listenBetaAccess.ts'));
  assert.match(mod, /parseMemberIdList\(process\.env\.SOULLAB_LISTEN_BETA_MEMBER_IDS\)/);
  assert.doesNotMatch(mod, /getListenBetaCohortSize[\s\S]*return [^;]*LISTEN_BETA_MEMBER_IDS(?!\.size)/);
  const users = execFileSync('git', ['grep', '-l', 'listenBetaAccess', '--', 'app', 'components', 'lib'], { cwd: root, encoding: 'utf8' })
    .trim().split('\n').filter(f => f !== 'lib/listening/listenBetaAccess.ts').sort();
  assert.deepEqual(users, ['app/listen/page.tsx', 'app/media/sound-studio/[...path]/route.ts']);
  const page = code(read('app/listen/page.tsx'));
  assert.ok(page.indexOf('requireMemberId()') < page.indexOf('hasListenBetaAccess(memberId)'), 'session before cohort');
  assert.match(page, /if \(!hasListenBetaAccess\(memberId\)\) notFound\(\)/);
});
