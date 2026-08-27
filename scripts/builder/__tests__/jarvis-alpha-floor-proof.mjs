// JARVIS Desktop Alpha — Floor 1 proof (F2 governed action · F3 dual provenance · F5 continuity).
//
// Founder ruling 2026-08-11: Alpha = Presence + Orientation + Governed Action.
// F1 is satisfied by the existing surface; F4 shipped with the C0 explorer.
// This suite proves only F2, F3 and the F5 hygiene — and, as strictly, proves
// the things the ruling forbade: no new authority, no alternative semantics,
// no collapsing of the two identities.
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { RATIFIED_INVOKE_CHANNELS, INVOKE_CHANNEL_NAMES, PUSH_CHANNEL_NAMES } from './desktop-preload-allowlist.mjs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..');
const src = path.join(repoRoot, 'jarvis-desktop', 'src');
const GOV = require(path.join(src, 'governance.js'));
// MAIA-D00A: the ratified channel allow-list lives in ONE place now, with the
// review that authorized each channel. See desktop-preload-allowlist.mjs.
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
  // MAIA-D00A instrument repair. This assertion previously matched the literal
  // string `execFileSync('node', built.argv`. JOP-04b deliberately replaced the
  // bare command name with a RESOLVED node path — "name the builder's node, not
  // Electron's" — so the assertion went red while the property it cares about
  // (argv is GOV-composed and passed through unmodified) never stopped holding.
  // The token was stale, not the boundary. Repaired to test the property, and
  // TIGHTENED while we are here: the old form would have accepted the bare,
  // PATH-dependent `'node'`; the new second assertion forbids any string-literal
  // executable in this handler outright.
  const govArgvCall = /execFileSync\(\s*([A-Za-z0-9_.]+)\s*,\s*built\.argv\b/.exec(govHandler);
  report('governance path runs GOV-composed argv, never a hand-built command',
    govHandler.includes('GOV.buildGovernanceArgv') && !!govArgvCall,
    govArgvCall ? `built.argv passed unmodified to ${govArgvCall[1]}` : 'no execFileSync(<node>, built.argv)');
  report('the governance executable is a resolved node path, never a bare command name',
    !!govArgvCall && govArgvCall[1].endsWith('.path') && !/execFileSync\(\s*['"]/.test(govHandler),
    govArgvCall ? govArgvCall[1] : 'none');
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

console.log('\n=========== B — repo-root authority: conflict must not read clean ===========');
{
  // Precedence is ESTABLISHED and unchanged: env outranks a saved choice by
  // design. What is asserted here is surface CONSISTENCY — a state that needs
  // operator remediation must not simultaneously render as clean/green.
  const A_ROOT = '/repo/saved', B_ROOT = '/repo/env';
  const base = { buildInfo: { app_build_sha: 'bld1' }, isPackaged: true, head: 'h1', dirty: false };

  // A — ENV only, valid root
  const a = PROV.describeProvenance({ ...base, repoRoot: B_ROOT, resolution: PROV.RESOLUTION.ENV, conflictingConfigRoot: null });
  report('A · ENV only → AVAILABLE, clean', a.substrate.state === 'AVAILABLE' && !a.substrate.conflict && a.self_binding_satisfied === true, a.substrate.state);

  // B — CONFIG only, valid root
  const b = PROV.describeProvenance({ ...base, repoRoot: A_ROOT, resolution: PROV.RESOLUTION.CONFIG, conflictingConfigRoot: null });
  report('B · CONFIG only → AVAILABLE, clean', b.substrate.state === 'AVAILABLE' && !b.substrate.conflict && b.self_binding_satisfied === true, b.substrate.state);

  // C — ENV + CONFIG agree
  const c = PROV.describeProvenance({ ...base, repoRoot: B_ROOT, resolution: PROV.RESOLUTION.ENV, conflictingConfigRoot: B_ROOT });
  report('C · ENV + CONFIG same root → AVAILABLE, clean', c.substrate.state === 'AVAILABLE' && !c.substrate.conflict && c.self_binding_satisfied === true, c.substrate.state);

  // D — the previously untested divergence path
  const d = PROV.describeProvenance({ ...base, repoRoot: B_ROOT, resolution: PROV.RESOLUTION.ENV, conflictingConfigRoot: A_ROOT });
  report('D · runtime still uses ENV — precedence NOT inverted', d.substrate.resolved_repo_root === B_ROOT, d.substrate.resolved_repo_root);
  report('D · resolution still reports explicit-env', d.substrate.resolution === PROV.RESOLUTION.ENV);
  report('D · substrate is DEGRADED, not green AVAILABLE', d.substrate.state === 'DEGRADED', d.substrate.state);
  report('D · self_binding_satisfied does NOT falsely report clean', d.self_binding_satisfied === false);
  report('D · the overridden saved root is named', d.substrate.conflict && d.substrate.conflict.overridden_config_root === A_ROOT);
  report('D · the governing root is named', d.substrate.conflict && d.substrate.conflict.governing === B_ROOT);
  report('D · remediation is stated', /launchctl unsetenv JARVIS_REPO_ROOT/.test(d.substrate.detail));
  report('D · substrate head/dirty still reported', d.substrate.resolved_repo_head === 'h1' && d.substrate.resolved_repo_dirty === false);
  report('D · artifact identity untouched by the conflict', d.artifact.state === 'AVAILABLE' && d.artifact.app_build_sha === 'bld1');
  report('D · identities still not collapsed', d.identities_distinct === true);

  // E — invalid / unresolved behaviour unchanged
  const e = PROV.describeProvenance({ buildInfo: null, isPackaged: true, repoRoot: null, resolution: PROV.RESOLUTION.NONE, conflictingConfigRoot: A_ROOT });
  report('E · unresolved stays UNAVAILABLE regardless of conflict input', e.substrate.state === 'UNAVAILABLE');
  const e2 = PROV.describeProvenance({ ...base, repoRoot: '/d', resolution: PROV.RESOLUTION.DEFAULT, conflictingConfigRoot: null });
  report('E · implicit default still DEGRADED', e2.substrate.state === 'DEGRADED' && e2.self_binding_satisfied === false);

  // A conflict is only meaningful against ENV — CONFIG cannot conflict with itself.
  const f = PROV.describeProvenance({ ...base, repoRoot: A_ROOT, resolution: PROV.RESOLUTION.CONFIG, conflictingConfigRoot: '/repo/other' });
  report('conflict flag applies to ENV only, never to a CONFIG resolution', f.substrate.state === 'AVAILABLE' && !f.substrate.conflict);

  // Wiring: the resolver must hand the fact through, and every return path must
  // carry the field so an absent key can never be read as "no conflict".
  const mainJs = code('main.js');
  report('resolver passes conflictingConfigRoot into provenance', /conflictingConfigRoot: RESOLVED\.conflictingConfigRoot/.test(mainJs));
  // MAIA-D00A instrument repair. The old selector took every {..root..resolution..}
  // literal, which also swept in the jarvis:status PAYLOAD — a CONSUMER that
  // merely reads RESOLVED.resolution and has no business declaring a resolver
  // field. One false positive, and the guard read as a boundary defect that did
  // not exist. Discriminate by vocabulary instead: a resolver return WRITES a
  // PROV.RESOLUTION.* constant; a consumer READS RESOLVED.resolution. This is
  // not a loosening — any genuinely new resolver return must assign the same
  // constant vocabulary, so it is still selected and still has to declare the
  // field. And the partition below closes the gap the old form left open: no
  // THIRD kind of {root, resolution} literal can now appear unclassified.
  const rootResolutionLiterals = (mainJs.match(/\{[^{}]*\bresolution:[^{}]*\}/g) || [])
    .filter(l => /\broot:/.test(l));
  const resolverLiterals = rootResolutionLiterals.filter(l => /\bresolution:\s*PROV\.RESOLUTION\./.test(l));
  const consumerLiterals = rootResolutionLiterals.filter(l => /\bresolution:\s*RESOLVED\.resolution\b/.test(l));
  report('every resolver return declares conflictingConfigRoot',
    resolverLiterals.length >= 5 && resolverLiterals.every(l => l.includes('conflictingConfigRoot')),
    `${resolverLiterals.length} resolver literal(s)`);
  report('every {root, resolution} literal is either a resolver return or a RESOLVED consumer',
    resolverLiterals.length + consumerLiterals.length === rootResolutionLiterals.length,
    `${resolverLiterals.length} resolver + ${consumerLiterals.length} consumer / ${rootResolutionLiterals.length} total`);
  report('the Preferences surface still carries the conflict as a problem',
    /problem: RESOLVED\.configProblem/.test(mainJs));
  report('precedence unchanged — env is still tested before saved config',
    mainJs.indexOf('process.env.JARVIS_REPO_ROOT && isValidRepoRoot') < mainJs.indexOf('cfg.present && isValidRepoRoot(cfg.repo_root)'));
  report('renderer surfaces the conflict where the substrate is displayed',
    code('renderer.js').includes('p.substrate.conflict'));
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
  // ── JCR-PROOF-01 (2026-08-16) — RE-SPECIFIED, not relaxed ────────────────
  // Old: no Desktop source may mention 'jarvis-runtime' at all.
  //
  // That was right while the mechanism was off-trunk and the risk was a PORTED
  // COPY. It became wrong the moment the cluster became canonical (#1043):
  // Desktop is now REQUIRED to reference the one canonical substrate, and a
  // string-match cannot tell "imports the canonical module" from "copied it in
  // here" — so honouring the invariant tripped the guard defending it.
  //
  // The contract the guard actually defends is NO DESKTOP-LOCAL IMPLEMENTATION.
  // These fail if anyone later copies the runtime, pipeline or verifier into
  // jarvis-desktop/, and also if Desktop stops resolving the canonical one.
  const desktopFiles = readdirSync(src);
  report('no Desktop-local runtime/pipeline/verifier implementation file',
    !desktopFiles.some(f => /(runtime|pipeline|verify-?evidence)/i.test(f)),
    desktopFiles.join(', '));
  report('no Desktop-local copy of the canonical verifier',
    !/function\s+verifyEvidence|verifyEvidence\s*=\s*(function|\()/.test(all));
  report('Desktop DOES reference the canonical mechanism (a fork would not)',
    all.includes('jarvis-runtime-pipeline'));
  report('the mechanism is resolved from the BOUND root, not a nearby copy',
    code('builder-mechanism.js').includes('mechanismDir'));
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
  // JCR-PROOF-01 (2026-08-16) — the list was NINE, reviewed, and EXACT.
  // MAIA-D00A (2026-08-25) — it is now TEN. `reveal-workspace` was added by
  // JOP-04 without re-review; this unit reviewed it against the five questions
  // (required · authorized · minimal · main-validated · doctrine-compatible),
  // ratified it, and moved the whole list into desktop-preload-allowlist.mjs so
  // there is exactly ONE place to come and argue for the next addition. The
  // list stays EXACT and is NOT relaxed to a subset check: a subset check is
  // precisely what would let the eleventh channel through silently.
  report(`preload exposes exactly the ${INVOKE_CHANNEL_NAMES.length} ratified channels`,
    JSON.stringify(channels) === JSON.stringify(INVOKE_CHANNEL_NAMES), channels.join(', '));
  report('every ratified channel carries a documented purpose and a naming ruling',
    RATIFIED_INVOKE_CHANNELS.every(c => typeof c.purpose === 'string' && c.purpose.length > 40
      && typeof c.ratified_in === 'string' && c.ratified_in.length > 0),
    `${RATIFIED_INVOKE_CHANNELS.length} entries`);

  // MAIA-D00A hardening — the three properties that make `reveal-workspace`
  // minimal are now ASSERTED rather than merely argued in a comment.
  report('revealWorkspace forwards no argument across the bridge',
    /revealWorkspace:\s*\(\)\s*=>\s*ipcRenderer\.invoke\('jarvis:reveal-workspace'\)/.test(preload));
  const revealHandler = /ipcMain\.handle\('jarvis:reveal-workspace',[\s\S]*?\n\}\);/.exec(code('main.js'))[0];
  report('the reveal handler declares no parameter, so no renderer value can reach it',
    /ipcMain\.handle\('jarvis:reveal-workspace',\s*async\s*\(\s*\)\s*=>/.test(revealHandler));
  report('the reveal handler short-circuits an unbound root before touching shell',
    revealHandler.indexOf('revealed: false') < revealHandler.indexOf('shell.showItemInFolder'));
  report('main.js reveals only — it never opens or executes a path',
    !/shell\.openPath\s*\(/.test(code('main.js')) && !/shell\.openExternal\s*\(/.test(code('main.js')));

  // The original guard only counted invoke() channels, so a push channel could
  // have been added without it noticing. Pin those too.
  const pushed = [...preload.matchAll(/ipcRenderer\.on\('([^']+)'/g)].map(m => m[1]).sort();
  report(`preload subscribes to exactly the ${PUSH_CHANNEL_NAMES.length} ratified push channel(s)`,
    JSON.stringify(pushed) === JSON.stringify(PUSH_CHANNEL_NAMES), pushed.join(', '));
  report('F4 capability surface untouched', code('capability-form.js').includes('validateSubmission'));
  report('no week-long acceptance is asserted anywhere', !all.includes('seven days') && !all.includes('Alpha passed'));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
