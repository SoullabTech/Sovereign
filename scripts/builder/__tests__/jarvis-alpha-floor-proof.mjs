// JARVIS Desktop Alpha — Floor 1 proof (F2 governed action · F3 dual provenance · F5 continuity).
//
// Founder ruling 2026-08-11: Alpha = Presence + Orientation + Governed Action.
// F1 is satisfied by the existing surface; F4 shipped with the C0 explorer.
// This suite proves only F2, F3 and the F5 hygiene — and, as strictly, proves
// the things the ruling forbade: no new authority, no alternative semantics,
// no collapsing of the two identities.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..');
const src = path.join(repoRoot, 'jarvis-desktop', 'src');
const GOV = require(path.join(src, 'governance.js'));
const PROV = require(path.join(src, 'provenance.js'));

function code(file) {
  return readFileSync(path.join(src, file), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map(l => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');
}
let pass = 0, fail = 0;
function report(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS  ${name}${detail ? ' :: ' + detail : ''}`); }
  else { fail++; console.log(`FAIL  ${name}${detail ? ' :: ' + detail : ''}`); }
}

console.log('==================== F2 — governed action, no new authority ====================');
{
  // The governor's own close states must still agree with ours.
  const sessionMjs = readFileSync(path.join(repoRoot, 'scripts/builder/session.mjs'), 'utf8');
  const m = /const CLOSE_STATES = \[([^\]]+)\]/.exec(sessionMjs);
  const governorStates = m[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
  report('CLOSE_STATES mirror the governor exactly',
    JSON.stringify(GOV.CLOSE_STATES) === JSON.stringify(governorStates), GOV.CLOSE_STATES.join('|'));

  report('exactly three verbs are invocable', JSON.stringify(Object.keys(GOV.ACTIONS).sort()) === '["close","reconcile","recover"]', Object.keys(GOV.ACTIONS).join(','));

  const ok = GOV.buildGovernanceArgv({ action: 'recover', sessionId: 's-abc123', reason: 'stale after crash' });
  report('recover composes the governor CLI verbatim',
    ok.ok && ok.argv.join(' ') === 'scripts/builder/session.mjs recover --session s-abc123 --reason stale after crash', ok.argv && ok.argv.join(' '));

  report('recover without a reason is refused locally (audited act)',
    GOV.buildGovernanceArgv({ action: 'recover', sessionId: 's-abc123', reason: '  ' }).ok === false);
  report('close requires a valid state',
    GOV.buildGovernanceArgv({ action: 'close', sessionId: 's-abc123', state: 'nonsense' }).ok === false);
  report('a non-session-id is refused', GOV.buildGovernanceArgv({ action: 'recover', sessionId: 'the stale one', reason: 'x' }).ok === false);
  report('an unlisted verb is refused', GOV.buildGovernanceArgv({ action: 'open', sessionId: 's-abc123' }).ok === false);

  // --force is a safeguard bypass. It must be unreachable from Desktop.
  const mainJs = code('main.js'), govJs = code('governance.js'), rendererJs = code('renderer.js');
  report('--force is unreachable from Desktop',
    !govJs.includes('--force') && !mainJs.includes('--force') && !rendererJs.includes('--force'));
  report('argv builder can never emit --force',
    ['recover', 'reconcile', 'close'].every(a => {
      const r = GOV.buildGovernanceArgv({ action: a, sessionId: 's-abc123', reason: 'r', state: 'paused' });
      return !r.ok || !r.argv.includes('--force');
    }));

  // Availability comes from the governor's flags, not Desktop's judgement.
  report('recover offered only when governor says recoverable',
    GOV.availableActionsFor({ liveness: { recoverable: true } }).includes('recover') &&
    !GOV.availableActionsFor({ liveness: { recoverable: false } }).includes('recover'));
  report('reconcile offered only when governor says reconcilable',
    GOV.availableActionsFor({ liveness: { reconcilable: true } }).includes('reconcile') &&
    !GOV.availableActionsFor({ liveness: {} }).includes('reconcile'));

  // A refusal must stay a refusal.
  report('exit 1 renders as REFUSED, never ok', GOV.interpretExit(1, '', 'refused').outcome === 'refused');
  report('exit 2 renders as COLLISION', GOV.interpretExit(2, '', '').outcome === 'collision');
  report('exit 4 renders as usage/not-found', GOV.interpretExit(4, '', '').outcome === 'usage');
  report('only exit 0 is ok', [1, 2, 3, 4, -1, 7].every(c => GOV.interpretExit(c, '', '').outcome !== 'ok'));
  report('unknown exit is not silently ok', GOV.interpretExit(99, '', '').governed === false);

  // The real property: the governance path composes NOTHING itself — it runs
  // the argv GOV built, and main.js carries no governance verb of its own.
  const govHandler = /ipcMain\.handle\('jarvis:governance-action'[\s\S]*$/.exec(mainJs)[0];
  report('governance path runs GOV-composed argv, never a hand-built command',
    govHandler.includes('GOV.buildGovernanceArgv') && govHandler.includes('execFileSync(\'node\', built.argv'));
  report('main.js contains no governance verb string of its own',
    !/['"](recover|reconcile)['"]/.test(mainJs), 'no inline verbs');
  report('main.js never rewrites a non-zero exit into success',
    mainJs.includes('GOV.interpretExit(typeof e.status'));
}

console.log('\n==================== F3 — dual provenance, never collapsed ====================');
{
  const p = PROV.describeProvenance({
    buildInfo: { app_build_sha: 'aaaa111', built_at: '2026-08-11T00:00:00Z' },
    isPackaged: true, repoRoot: '/repo', resolution: PROV.RESOLUTION.ENV, head: 'bbbb222', dirty: false,
  });
  report('artifact and substrate are separate members', !!p.artifact && !!p.substrate && p.identities_distinct === true);
  report('artifact SHA is the BUILD sha', p.artifact.app_build_sha === 'aaaa111');
  report('substrate SHA is the CHECKOUT head', p.substrate.resolved_repo_head === 'bbbb222');
  report('the two SHAs are never conflated', p.artifact.app_build_sha !== p.substrate.resolved_repo_head);
  report('all four F3 fields are exposed',
    ['app_build_sha'].every(k => k in p.artifact) &&
    ['resolved_repo_root', 'resolved_repo_head', 'resolved_repo_dirty'].every(k => k in p.substrate));
  report('self-binding satisfied when both are named and explicit', p.self_binding_satisfied === true);

  // Hard-coded fallback must never read as truth.
  const d = PROV.describeProvenance({ buildInfo: { app_build_sha: 'a1' }, isPackaged: true, repoRoot: '/Users/soullab/MAIA-SOVEREIGN', resolution: PROV.RESOLUTION.DEFAULT, head: 'b2', dirty: false });
  report('implicit-default substrate is DEGRADED, not AVAILABLE', d.substrate.state === 'DEGRADED', d.substrate.state);
  report('implicit-default fails self-binding', d.self_binding_satisfied === false);
  report('implicit-default says so in words', /IMPLICIT DEFAULT/.test(d.substrate.detail));

  // Dev mode must not borrow the substrate SHA as its own identity.
  const dev = PROV.describeProvenance({ buildInfo: null, isPackaged: false, repoRoot: '/repo', resolution: PROV.RESOLUTION.WALK, head: 'cccc333', dirty: true });
  report('unpackaged Desktop reports NO build identity', dev.artifact.app_build_sha === null && dev.artifact.state === 'UNKNOWN');
  report('unpackaged Desktop does not borrow the substrate sha', !JSON.stringify(dev.artifact).includes('cccc333'));
  report('dirty substrate is DEGRADED', dev.substrate.state === 'DEGRADED' && dev.substrate.resolved_repo_dirty === true);
  report('packaged-but-unstamped is DEGRADED, not silently fine',
    PROV.describeProvenance({ buildInfo: null, isPackaged: true, repoRoot: '/r', resolution: PROV.RESOLUTION.ENV, head: 'h', dirty: false }).artifact.state === 'DEGRADED');
  report('unresolved substrate is UNAVAILABLE',
    PROV.describeProvenance({ buildInfo: null, isPackaged: true, repoRoot: null, resolution: PROV.RESOLUTION.NONE }).substrate.state === 'UNAVAILABLE');

  // A STALE STAMP MUST NOT ELEVATE A DEV PROCESS.
  //
  // The cases above only ever tested unpackaged WITH buildInfo: null, so they
  // could not see this: `npm run stamp` wrote src/build-info.json, and a later
  // `npm start` read it and reported "Desktop build <sha> · packaged <time>"
  // for a process running straight off the source tree — state AVAILABLE, and
  // the window titled "JARVIS — build <sha>". Reproduced against the real
  // module on 2026-08-11 before the fix.
  //
  // app.isPackaged is the only thing that can answer "am I a built artifact",
  // because it describes THIS process. A file on disk is a claim about some
  // other process. A stamp may say WHICH build; never THAT there is one.
  const stale = { app_build_sha: 'staleaaa', built_at: '2026-08-11T00:00:00Z' };
  const contaminated = PROV.describeProvenance({
    buildInfo: stale, isPackaged: false,
    repoRoot: '/repo', resolution: PROV.RESOLUTION.WALK, head: 'dddd444', dirty: false,
  });
  report('stale stamp does NOT give an unpackaged process a build sha',
    contaminated.artifact.app_build_sha === null, contaminated.artifact.app_build_sha);
  report('stale stamp does NOT make an unpackaged process AVAILABLE',
    contaminated.artifact.state === 'UNKNOWN', contaminated.artifact.state);
  report('stale stamp does NOT leak its sha into the artifact record',
    !JSON.stringify(contaminated.artifact).includes('staleaaa'));
  report('stale stamp does NOT flip the packaged flag',
    contaminated.artifact.packaged === false);
  report('window title of a stale-stamped dev process still says dev',
    PROV.windowTitle(contaminated.artifact) === 'JARVIS — dev (unpackaged)',
    PROV.windowTitle(contaminated.artifact));

  // The gate must not have broken real packaged identity (case C) …
  const packagedOk = PROV.artifactIdentity({ buildInfo: stale, isPackaged: true });
  report('a packaged process with a valid stamp still reports its build',
    packagedOk.state === 'AVAILABLE' && packagedOk.app_build_sha === 'staleaaa' && packagedOk.packaged === true);

  // … nor the visible divergence between the two identities (case D), which is
  // the live 2026-08-11 reading: build 2d9eb671c operating /Users/soullab/
  // jarvis-runtime @ 5767d5d41. That divergence is CORRECT and must stay legible.
  const diverged = PROV.describeProvenance({
    buildInfo: { app_build_sha: '2d9eb671c' }, isPackaged: true,
    repoRoot: '/Users/soullab/jarvis-runtime', resolution: PROV.RESOLUTION.CONFIG, head: '5767d5d41', dirty: false,
  });
  report('artifact and substrate SHAs are both visible when they differ',
    diverged.artifact.app_build_sha === '2d9eb671c' && diverged.substrate.resolved_repo_head === '5767d5d41');
  report('divergence degrades neither identity',
    diverged.artifact.state === 'AVAILABLE' && diverged.substrate.state === 'AVAILABLE');
  report('an explicitly CONFIGURED substrate satisfies self-binding',
    diverged.self_binding_satisfied === true);

  const mainJs = code('main.js');
  report('main.js reports HOW the root resolved', mainJs.includes('PROV.RESOLUTION.DEFAULT') && mainJs.includes('PROV.RESOLUTION.ENV'));
  report('main.js reads the substrate HEAD and dirty state', mainJs.includes("'rev-parse', '--short', 'HEAD'") && mainJs.includes("'status', '--porcelain'"));
  // The stamp is generated OUTSIDE the source tree and shipped as a resource,
  // so packaging cannot leave a file in src/ for a later dev run to read.
  report('generated build stamp is git-ignored', readFileSync(path.join(repoRoot, 'jarvis-desktop/.gitignore'), 'utf8').includes('build/'));
  report('stamp is NOT written into the source tree',
    !JSON.parse(readFileSync(path.join(repoRoot, 'jarvis-desktop/package.json'), 'utf8')).scripts.stamp.includes('src/build-info.json'));
  report('packaged stamp is read from Resources, not __dirname',
    mainJs.includes('process.resourcesPath') && !mainJs.includes("path.join(__dirname, 'build-info.json')"));
  report('readBuildInfo refuses to read a stamp when unpackaged',
    /function readBuildInfo\(\)\s*\{\s*if \(!app\.isPackaged\) return null;/.test(mainJs));
  const pkg = JSON.parse(readFileSync(path.join(repoRoot, 'jarvis-desktop/package.json'), 'utf8'));
  report('packaging stamps the build identity', pkg.scripts.pack.includes('stamp') && pkg.scripts.dist.includes('stamp'));
  report('the artifact keeps its distinct JARVIS identity', pkg.build.appId === 'life.soullab.jarvis');
}

console.log('\n==================== F5 — continuity hygiene ====================');
{
  const mainJs = code('main.js');
  report('one instance per artifact identity', mainJs.includes('requestSingleInstanceLock'));
  report('a second launch focuses the existing window', mainJs.includes("app.on('second-instance'"));
  report('window title carries the artifact identity, not a bare name',
    mainJs.includes('PROV.windowTitle(') && !mainJs.includes("title: 'JARVIS'"));
  // Behavioural, not structural. The 2026-08-11 walk showed the call site can
  // be present and correct while the title still reads "JARVIS", because a
  // static <title> in the page overrides it once the document loads.
  const html = readFileSync(path.join(src, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  report('no static <title> can override the artifact identity', !/<title>/i.test(html));
  report('title is re-asserted after the document loads',
    /did-finish-load[\s\S]{0,200}setTitle\(/.test(mainJs));
  report('titles distinguish builds', PROV.windowTitle({ app_build_sha: 'abc1234' }) === 'JARVIS — build abc1234');
  report('an unpackaged window says so', PROV.windowTitle({ app_build_sha: null, packaged: false }) === 'JARVIS — dev (unpackaged)');
  report('an unstamped packaged window says so', PROV.windowTitle({ app_build_sha: null, packaged: true }) === 'JARVIS — unstamped build');
}

console.log('\n==================== exclusions the ruling required ====================');
{
  const all = ['main.js', 'renderer.js', 'governance.js', 'provenance.js', 'preload.js'].map(code).join('\n');
  report('no orient.mjs donor port', !all.includes('orient.mjs'));
  report('no continue.mjs donor port', !all.includes('continue.mjs'));
  report('no runtime/pipeline substrate pulled in from lineage A',
    !all.includes('jarvis-runtime') && !all.includes('runtime-pipeline'));
  report('no model work added', !all.includes('anthropic') && !all.includes('claude-opus'));
  const preload = code('preload.js');
  const channels = [...preload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map(m => m[1]).sort();
  // Was four. The three repo-* channels are the persisted-repository binding
  // surface (Preferences, ⌘,), added deliberately so the installed app can be
  // pointed at a checkout without Terminal or JARVIS_REPO_ROOT.
  //
  // Kept as an EXACT list rather than relaxed to "at least these": the point of
  // this guard is that the IPC surface cannot widen unnoticed, and a
  // subset-check would let the next addition through silently. Note also that
  // none of the three lets the renderer SET a path — chooseRepo runs the native
  // dialog in main, so validation and persistence never cross the bridge.
  report('preload exposes exactly the seven sanctioned channels',
    JSON.stringify(channels) === JSON.stringify([
      'jarvis:capabilities', 'jarvis:choose-repo', 'jarvis:clear-repo',
      'jarvis:governance-action', 'jarvis:repo-config', 'jarvis:status', 'jarvis:submit-task',
    ]), channels.join(', '));
  // The original guard only counted invoke() channels, so a push channel could
  // have been added without it noticing. Pin those too.
  const pushed = [...preload.matchAll(/ipcRenderer\.on\('([^']+)'/g)].map(m => m[1]).sort();
  report('preload subscribes to exactly one push channel',
    JSON.stringify(pushed) === JSON.stringify(['jarvis:repo-changed']), pushed.join(', '));
  report('F4 capability surface untouched', code('capability-form.js').includes('validateSubmission'));
  report('no week-long acceptance is asserted anywhere', !all.includes('seven days') && !all.includes('Alpha passed'));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
