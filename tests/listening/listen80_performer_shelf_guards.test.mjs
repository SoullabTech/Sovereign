// LISTEN-01 · "Listen to someone" — source-level guards (comments stripped).
// What these laws protect: Soullab never starts a performer's sound; the shelf keeps and sends no
// listening data (to anyone, MAIA included); the shelf hosts no media and copies no provider metadata;
// the lease is taken before the sound is allowed to continue. Behaviour is witnessed separately
// (listen81 in jsdom; a real-browser and a device witness are still owed).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = rel => readFileSync(new URL(`../../${rel}`, import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const FILES = {
  embed: 'components/listening/PerformerEmbed.tsx',
  shelf: 'components/listening/PerformerShelf.tsx',
  loaders: 'lib/listening/performerEmbedLoaders.ts',
  policy: 'lib/listening/performerPlaybackPolicy.ts',
  catalog: 'lib/listening/performerCatalog.ts',
  data: 'lib/listening/performerCatalogData.ts',
};
const src = Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, read(f)]));
const all = Object.values(src).join('\n');
const CODE_FILES = ['embed', 'shelf', 'loaders', 'policy'];

// ---- Defeat candidates for the guards themselves: text that SHOULD trip each pattern. -------------
const START_SOUND = [/\.play\s*\(/, /playVideo\s*\(/, /loadVideoById\s*\(/, /loadVideoByUrl\s*\(/, /togglePlay\s*\(/, /\.resume\s*\(/,
  /autoplay\s*:\s*1/, /autoplay\s*=\s*1/, /new Audio\s*\(/, /<audio\b/, /<video\b/];
const STORE_OR_SEND = [/localStorage/, /sessionStorage/, /indexedDB/, /document\.cookie/, /sendBeacon/, /\bfetch\s*\(/, /XMLHttpRequest/, /new WebSocket/];
const REACHES_MAIA = [/from ['"]@\/lib\/maia/, /from ['"]@\/lib\/memory/, /from ['"]@\/lib\/sovereign/, /from ['"]@\/app\/api/];

test('guard patterns are not vacuous: each trips on a hostile sample', () => {
  const hostile = 'player.playVideo(); el.play(); autoplay: 1; new Audio(x); localStorage.setItem(); fetch(u); import x from "@/lib/maia/y";'
    .replace('import x from "@/lib/maia/y";', "import x from '@/lib/maia/y';");
  assert.ok(START_SOUND.filter(p => p.test(hostile)).length >= 3);
  assert.ok(STORE_OR_SEND.filter(p => p.test(hostile)).length >= 2);
  assert.ok(REACHES_MAIA.filter(p => p.test(hostile)).length >= 1);
});

test('Soullab never starts a performer\'s sound: no play, resume, autoplay, load-and-play or own audio element', () => {
  for (const key of CODE_FILES) {
    for (const pattern of START_SOUND) assert.equal(pattern.test(src[key]), false, `${FILES[key]} must not match ${pattern}`);
  }
});

test('the platform adapter interface has no play and no resume', () => {
  const iface = src.policy.match(/interface PerformerPlayerAdapter\s*\{([\s\S]*?)\}/);
  assert.ok(iface, 'adapter interface not found');
  assert.deepEqual([...iface[1].matchAll(/(\w+)\s*\(/g)].map(m => m[1]).sort(), ['destroy', 'pause']);
  assert.equal(/\bplay\b|\bresume\b/.test(iface[1]), false);
});

test('no listening data is stored, sent or shown anywhere, and nothing reaches MAIA or its memory', () => {
  for (const key of CODE_FILES) {
    for (const pattern of STORE_OR_SEND) assert.equal(pattern.test(src[key]), false, `${FILES[key]} must not match ${pattern}`);
    for (const pattern of REACHES_MAIA) assert.equal(pattern.test(src[key]), false, `${FILES[key]} must not match ${pattern}`);
  }
});

test('the lease is taken before the sound is kept, and a refusal pauses', () => {
  const e = src.embed;
  const acquire = e.indexOf("acquireAudioOutput('listening-music')");
  const decide = e.indexOf('decideOnPlaying(');
  const keep = e.indexOf('lease.current = got');
  assert.ok(acquire > 0 && decide > acquire && keep > decide, 'order must be acquire -> decide -> keep');
  assert.match(e, /decideOnPlaying\(got \? 'granted' : 'refused', isMaiaSpeechActive\(\)\) === 'pause'/);
  assert.match(e, /adapter\.current\?\.pause\(\)/);
});

test('it obeys the shared bus, focus events and session end, and releases on every non-playing state', () => {
  const e = src.embed;
  assert.match(e, /new BroadcastChannel\(SOULLAB_AUDIO_TAB_CHANNEL\)/);
  assert.match(e, /decideOnBusMessage\(event\.data, AUDIO_OUTPUT_TAB_NONCE\)/);
  assert.match(e, /decideOnFocusSource\(audioFocusSource\(event\)\)/);
  assert.match(e, /SOULLAB_SESSION_END_EVENT/);
  assert.match(e, /if \(!holdsOutput\(state\)\) \{ releaseLease\(\); return; \}/);
});

test('nothing is requested from a platform until the member presses "Play here"', () => {
  const e = src.embed;
  const begin = e.indexOf('const begin = useCallback');
  const mount = e.indexOf('mountEmbed(');
  const click = e.indexOf('onClick={() => { void begin(); }}');
  assert.ok(begin > 0 && mount > begin && click > mount, 'mountEmbed is only reachable through begin(), which is only reachable from the click');
  assert.equal(/useEffect\([^)]*mountEmbed/.test(e.replace(/\s+/g, ' ')), false);
  assert.equal((e.match(/mountEmbed\(/g) || []).length, 1);
  assert.match(src.loaders, /https:\/\/www\.youtube-nocookie\.com/);
});

test('the shelf shows only Soullab\'s words, the performer\'s own words, and links — no provider artwork', () => {
  assert.equal(/<img\b|<picture\b|thumbnail|backgroundImage|next\/image/i.test(src.shelf + src.embed), false);
  assert.match(src.shelf, /Where to find more of their work/);
  assert.match(src.shelf, /rel="noopener noreferrer"/);
  assert.equal(/Support them|support them/.test(src.shelf + src.embed), false);
});

test('no counts, rankings or popularity signals on the shelf', () => {
  assert.equal(/\b(count|rank|popular|trending|likes?|views?|streak|badge|score)\b/i.test(src.shelf + src.embed), false);
});

test('the shipped catalog is a bare empty list and the data file imports nothing', () => {
  assert.match(src.data, /export const PERFORMER_CATALOG: ReadonlyArray<unknown> = \[\];/);
  assert.equal(/^\s*import\b/m.test(src.data), false);
});

test('the room hook-in is minimal and non-interactive while the catalog is empty', () => {
  const now = read('app/listen/SoundStudioNow.tsx');
  const room = read('app/listen/ListenRoom.tsx');
  assert.match(now, /<PerformerNowEntry onOpen=\{\(\) => onNavigate\('people'\)\} \/>/);
  assert.match(now, /'now' \| 'focus' \| 'people'/);
  assert.match(room, /view==='people' && /);
  assert.match(room, /view === 'focus' \|\| view === 'people' \? 'now' : view/);
  // the mobile tab bar is unchanged: still five sections, no new tab
  assert.equal((room.match(/\{ view: '/g) || []).length, 5);
  assert.match(src.shelf, /data-performer-teaser="in-preparation"/);
});
