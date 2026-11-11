// LISTEN-01 · the Sound Studio player in the native iOS shell loads gated audio by short-lived ticket URL.
// Pure behaviour of the ticket cache, then source checks on the provider and the field, then a mutation
// check: removing the prefetch or the refresh, or awaiting a fetch inside the tap, must fail these checks.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TICKET_MIN_REMAINING_MS, TICKET_REFRESH_AFTER_MS,
  createMediaTicketCache, refreshMaySwap, sourcePathOf,
} from '../../lib/listening/mediaTicketClient.ts';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const code = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const read = f => code(fs.readFileSync(path.join(root, f), 'utf8'));
const PART1 = '/media/sound-studio/night-ground/Night_Ground_01_Guided_Arrival_12min_v0.1.m4a';
const PART2 = '/media/sound-studio/night-ground/Night_Ground_Core_49min_v0.1.m4a';
const MIN = 60_000;
const TTL_S = 15 * 60;

function harness() {
  let clock = 1_800_000_000_000;
  const calls = [];
  const cache = createMediaTicketCache({
    now: () => clock,
    absolute: url => `https://soullab.life${url}`,
    fetchTickets: async paths => {
      calls.push([...paths]);
      return paths.map(p => ({ path: p, url: `${p}?t=T${calls.length}`, expiresAt: Math.floor(clock / 1000) + TTL_S }));
    },
  });
  return { cache, calls, advance: ms => { clock += ms; } };
}

test('a prefetched ticket is available synchronously, absolute, and not refetched while fresh', async () => {
  const { cache, calls } = harness();
  assert.equal(cache.freshUrl(PART1), null, 'nothing before the prefetch');
  await cache.prefetch([PART1, PART2]);
  assert.equal(cache.freshUrl(PART1), `https://soullab.life${PART1}?t=T1`);
  assert.equal(cache.freshUrl(PART2), `https://soullab.life${PART2}?t=T1`);
  await cache.prefetch([PART1, PART2]);
  assert.equal(calls.length, 1, 'fresh tickets are not refetched');
  await cache.prefetch([PART1], true);
  assert.equal(calls.length, 2, 'a forced refresh fetches anew');
});

test('requests stay within the route limit of 4 paths', async () => {
  const { cache, calls } = harness();
  await cache.prefetch(['/a', '/b', '/c', '/d', '/e', '/f']);
  assert.deepEqual(calls.map(c => c.length), [4, 2]);
});

test('a ticket close to expiry is not used to start sound', async () => {
  const { cache, advance } = harness();
  await cache.prefetch([PART1]);
  advance(TTL_S * 1000 - TICKET_MIN_REMAINING_MS - 1000);
  assert.ok(cache.freshUrl(PART1));
  advance(2000);
  assert.equal(cache.freshUrl(PART1), null);
});

test('refresh is scheduled at about 10 minutes, before the 15-minute expiry', async () => {
  const { cache, advance } = harness();
  await cache.prefetch([PART1]);
  assert.equal(TICKET_REFRESH_AFTER_MS, 10 * MIN);
  const delay = cache.refreshDelayMs(PART1);
  assert.equal(delay, 10 * MIN);
  assert.ok(delay < TTL_S * 1000 - TICKET_MIN_REMAINING_MS, 'refresh lands while the old ticket is still valid');
  advance(9 * MIN);
  assert.equal(cache.refreshDelayMs(PART1), MIN);
  advance(20 * MIN);
  assert.equal(cache.refreshDelayMs(PART1), 0, 'overdue means now');
  assert.equal(cache.refreshDelayMs('/never-fetched'), 0);
});

test('a refresh keeps playing only what was playing, never after Stop, Pause, interruption or MAIA', () => {
  const ok = { generationAtStart: 7, generationNow: 7, wasPlaying: true, pausedNow: false, maiaSpeaking: false, samePath: true };
  assert.equal(refreshMaySwap(ok), true);
  assert.equal(refreshMaySwap({ ...ok, generationNow: 8 }), false, 'Pause or Stop during the fetch');
  assert.equal(refreshMaySwap({ ...ok, wasPlaying: false }), false, 'was paused when the refresh began');
  assert.equal(refreshMaySwap({ ...ok, pausedNow: true }), false, 'interrupted meanwhile');
  assert.equal(refreshMaySwap({ ...ok, maiaSpeaking: true }), false, 'MAIA speaking');
  assert.equal(refreshMaySwap({ ...ok, samePath: false }), false, 'part changed meanwhile');
});

test('the file behind a ticket URL is recognised as the same file', () => {
  assert.equal(sourcePathOf(`https://soullab.life${PART1}?t=abc`), PART1);
  assert.equal(sourcePathOf(PART1), PART1);
  assert.equal(sourcePathOf(null), null);
});

// ---- source checks ------------------------------------------------------------------------------------

const between = (s, from, to) => {
  const a = s.indexOf(from);
  const b = s.indexOf(to, a + from.length);
  return a < 0 || b < 0 ? '' : s.slice(a, b);
};

function providerFailures(src) {
  const failures = [];
  const need = (cond, why) => { if (!cond) failures.push(why); };
  need(/isNativeCapacitor\(\) \? tickets\.freshUrl\(path\) : path/.test(src),
    'native uses a cached ticket URL, the web keeps the session path');
  const play = between(src, 'const playExperienceMedia = useCallback(', 'const selectLocalFile');
  const beforePlay = play.slice(0, play.indexOf('await audio.play()'));
  need(beforePlay.length > 0, 'playExperienceMedia awaits audio.play()');
  need((beforePlay.match(/await [^;]*/g) || []).every(a => a.startsWith('await acquireAudioOutput')),
    'no new await between the tap and play() (only the existing output lease)');
  need(beforePlay.indexOf('mediaSource(playPath)') > -1 &&
    beforePlay.indexOf('mediaSource(playPath)') < beforePlay.indexOf('acquireAudioOutput'),
    'the source is chosen synchronously, before any await');
  need(/if \(!source\) \{[\s\S]*?prepareExperienceMedia\(manifest\);[\s\S]*?return false;/.test(play),
    'no fresh ticket: prepare and let the member tap again');
  need(/audio\.src = source/.test(play), 'the element gets the chosen source');
  need(/scheduleTicketRefresh\(\);/.test(play), 'playing schedules the refresh');
  const refresh = between(src, 'refreshTicketsRef.current = async', 'const playExperienceMedia');
  need(/tickets\.prefetch\(next \? \[path, next\] : \[path\], true\)/.test(refresh),
    'the refresh fetches the current part and the next part');
  need(/if \(kind\.current !== 'review-media'\) return;/.test(refresh), 'Stop ends the refresh loop');
  need(/refreshMaySwap\(\{/.test(refresh) && /if \(swap && url\)/.test(refresh),
    'the swap is gated by refreshMaySwap');
  need(/swapSourceKeepingPosition\(audio, url, audio\.currentTime\)/.test(refresh), 'the swap keeps position');
  need(/scheduleTicketRefresh\(\);\s*\};/.test(refresh), 'the refresh reschedules itself');
  need(/window\.setTimeout\([\s\S]*?refreshTicketsRef\.current\(\)[\s\S]*?tickets\.refreshDelayMs\(path\)/
    .test(between(src, 'const scheduleTicketRefresh', 'refreshTicketsRef.current = async')),
    'the refresh timer uses the ticket refresh delay');
  need(/clearTicketRefresh\(\);/.test(between(src, 'const stopAll = useCallback', 'const commitFocusSession')),
    'Stop clears the refresh timer');
  const prepare = between(src, 'const prepareExperienceMedia', 'const experienceMediaReady');
  need(/if \(!isNativeCapacitor\(\)\) return;/.test(prepare) && /tickets\.prefetch\(paths\)/.test(prepare),
    'prepare prefetches every part, native only');
  const handOver = between(src, 'const handOver', 'const ready = mediaSource(nextPath)');
  need(/audio\.src = source;/.test(handOver) && /scheduleTicketRefresh\(\);/.test(handOver),
    'Part 1 → Part 2 hands over on a ticket and keeps refreshing');
  need(/if \(ready\) \{ handOver\(ready\); return; \}/.test(src) &&
    /tickets\.prefetch\(\[nextPath\]\)/.test(src), 'a missing next-part ticket is fetched before the handover');
  return failures;
}

function fieldFailures(src) {
  const failures = [];
  const need = (cond, why) => { if (!cond) failures.push(why); };
  need(/useEffect\(\(\) => \{\s*if \(selected\.manifest\) prepareMedia\?\.\(selected\.manifest\);/.test(src),
    'opening a work prefetches its tickets');
  const begin = between(src, 'const begin = async', 'return (');
  const ready = begin.indexOf('transport.experienceMediaReady(selected.manifest)');
  need(ready > -1 && ready < begin.indexOf('await transport.playExperienceMedia'),
    'the tap checks readiness synchronously before starting');
  return failures;
}

const PROVIDER = read('components/listening/PersistentListeningProvider.tsx');
const FIELD = read('app/listen/SoundStudioField.tsx');

test('provider: native ticket path, synchronous tap, refresh before expiry, no auto-start', () => {
  assert.deepEqual(providerFailures(PROVIDER), []);
});

test('field: tickets are prefetched when a work is opened, readiness checked in the tap', () => {
  assert.deepEqual(fieldFailures(FIELD), []);
});

test('mutation check: removing the refresh, the prefetch, or awaiting a fetch in the tap fails', () => {
  const noRefresh = PROVIDER.replace(/scheduleTicketRefresh\(\);/g, '');
  assert.ok(providerFailures(noRefresh).length > 0, 'refresh removed');
  const noRefreshFetch = PROVIDER.replace('tickets.prefetch(next ? [path, next] : [path], true)', 'Promise.resolve()');
  assert.ok(providerFailures(noRefreshFetch).length > 0, 'refresh fetch removed');
  const noPrefetch = FIELD.replace('if (selected.manifest) prepareMedia?.(selected.manifest);', '');
  assert.ok(fieldFailures(noPrefetch).length > 0, 'prefetch on open removed');
  const noPrepare = PROVIDER.replace('if (paths.length) void tickets.prefetch(paths);', '');
  assert.ok(providerFailures(noPrepare).length > 0, 'provider prefetch removed');
  const awaitInTap = PROVIDER.replace('const source = mediaSource(playPath);',
    'await tickets.prefetch([playPath]);\n    const source = mediaSource(playPath);');
  assert.ok(providerFailures(awaitInTap).length > 0, 'await inside the tap');
  const webOnTickets = PROVIDER.replace('isNativeCapacitor() ? tickets.freshUrl(path) : path', 'tickets.freshUrl(path)');
  assert.ok(providerFailures(webOnTickets).length > 0, 'web moved onto tickets');
  const unguardedSwap = PROVIDER.replace('if (swap && url)', 'if (url)');
  assert.ok(providerFailures(unguardedSwap).length > 0, 'refresh swap without the Stop/Pause guard');
});
