// JARVIS Desktop — C0 capability explorer proof.
//
// Proves the acceptance tests A–H for the Desktop C0 discovery + structured
// argument surface. Everything here exercises the SAME modules the running
// console loads: scripts/builder/deterministic.mjs (registry),
// scripts/builder/router.mjs (routing), and jarvis-desktop/src/capability-form.js
// (the DOM-free logic the renderer calls). Nothing is re-implemented for the
// test, so a divergence between console and registry would fail here.
import { CAPABILITIES } from '../deterministic.mjs';
import { route } from '../router.mjs';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..', '..');
const desktopSrc = path.join(repoRoot, 'jarvis-desktop', 'src');
const CF = require(path.join(desktopSrc, 'capability-form.js'));

// Structural assertions below inspect CODE, not prose. Comments legitimately
// name capabilities and describe execution semantics; a substring match that
// counted them would fail on documentation quality, which is not the property
// under test.
function code(file) {
  return readFileSync(path.join(desktopSrc, file), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(l => l.replace(/(^|[^:'"`])\/\/.*$/, '$1'))
    .join('\n');
}

let pass = 0, fail = 0;
function report(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS  ${name}${detail ? ' :: ' + detail : ''}`); }
  else { fail++; console.log(`FAIL  ${name}${detail ? ' :: ' + detail : ''}`); }
}

// The manifest the Desktop shows is built by this exact function, from the
// registry object main.js imports out of the checkout at runtime.
const manifest = CF.buildManifest(CAPABILITIES);

console.log('==================== A — registry source (no second catalog) ====================');
{
  const registryNames = Object.keys(CAPABILITIES).sort();
  const shownNames = manifest.map(c => c.name);
  report('manifest names === registry names', JSON.stringify(shownNames) === JSON.stringify(registryNames), `${shownNames.length} capabilities`);

  // Structural: main.js must derive its list from deterministic.mjs and must
  // not carry a hard-coded capability list of its own.
  const mainJs = code('main.js');
  report("main.js reads scripts/builder/deterministic.mjs", mainJs.includes("'deterministic.mjs'"));
  report('main.js builds the manifest via buildManifest (no literal capability list)',
    mainJs.includes('buildManifest(mod.CAPABILITIES)') &&
    registryNames.every(n => !mainJs.includes(`'${n}'`)));

  const formJs = code('capability-form.js');
  const rendererJs = code('renderer.js');
  report('no capability name is hard-coded in capability-form.js or renderer.js',
    registryNames.every(n => !formJs.includes(n) && !rendererJs.includes(n)));

  // The registry declares no descriptions and no categories. The manifest must
  // therefore carry none — absence reported, never invented.
  report('manifest invents no description/category fields',
    manifest.every(c => !('description' in c) && !('category' in c)));
}

console.log('\n==================== B — selection yields the real identifier ====================');
{
  const entry = CF.findCapability(manifest, 'inventory.routes');
  report('inventory.routes is selectable from the manifest', entry !== null);
  report('selected identifier is exactly the registry key', entry && entry.name === 'inventory.routes', entry && entry.name);
  report('its declared schema is surfaced', entry && entry.args.length === 1 && entry.args[0].name === 'dir' && entry.args[0].type === 'string',
    entry && JSON.stringify(entry.args));
}

console.log('\n==================== C — structured arguments -> valid payload ====================');
{
  const out = CF.validateSubmission({
    manifest,
    capabilityName: 'inventory.routes',
    mode: 'structured',
    rawValues: { dir: 'app/api' },
  });
  report('validates', out.ok, out.errors.join('; '));
  report('args === {"dir":"app/api"}', JSON.stringify(out.task.args) === '{"dir":"app/api"}', JSON.stringify(out.task.args));
  report('payload shape unchanged from what is valid today',
    JSON.stringify(out.task) === '{"capability":"inventory.routes","args":{"dir":"app/api"}}', JSON.stringify(out.task));

  // A blank optional field must be ABSENT, not "" — otherwise the UI would
  // silently override the capability's own default.
  const blank = CF.validateSubmission({ manifest, capabilityName: 'inventory.routes', mode: 'structured', rawValues: { dir: '' } });
  report('blank optional field omitted, not sent as empty string', blank.ok && JSON.stringify(blank.task.args) === '{}', JSON.stringify(blank.task.args));

  // Numbers coerce; enums are constrained by the registry's own list.
  const num = CF.validateSubmission({ manifest, capabilityName: 'git.log', mode: 'structured', rawValues: { max_count: '5' } });
  report('numeric field coerced to a real number', num.ok && num.task.args.max_count === 5, JSON.stringify(num.task.args));
  const en = CF.validateSubmission({ manifest, capabilityName: 'check.run', mode: 'structured', rawValues: { test_type: 'typecheck' } });
  report('enum value accepted', en.ok && en.task.args.test_type === 'typecheck');
}

console.log('\n==================== D — prose cannot become a capability identifier ====================');
{
  const prose = "Fully recover and wire MAIA's memory";
  const out = CF.validateSubmission({ manifest, capabilityName: prose, mode: 'structured', rawValues: {} });
  report('arbitrary sentence refused locally', out.ok === false, out.errors.join('; '));
  report('no task payload produced', out.task === null);
  report('router is never consulted to discover this', CF.isRegistered(manifest, prose) === false);

  // The affordance itself: the renderer must source the identifier from the
  // registry-backed <select>, never from a free-text capability-name box.
  const rendererJs = code('renderer.js');
  report('renderer has no free-text capability-name input', !rendererJs.includes('id="capability"'));
  report('renderer reads the identifier from the registry-backed select', rendererJs.includes("getElementById('capability-select')"));
  report('renderer gates C0 submission through validateSubmission', rendererJs.includes('CF.validateSubmission('));

  // Regression guard — founder walk 2026-08-11: filtering used to re-render the
  // whole C0 block, destroying the focused filter input so only the first
  // typed character survived. Filtering must rewrite options only.
  report('filter input does not re-render its own subtree',
    rendererJs.includes("getElementById('cap-filter').addEventListener('input', applyCapabilityFilter)") &&
    !/addEventListener\('input', renderC0Fields\)/.test(rendererJs));
}

console.log('\n==================== E — malformed Advanced JSON rejected before routing ====================');
{
  const bad = CF.validateSubmission({ manifest, capabilityName: 'inventory.routes', mode: 'advanced', advancedText: '{"dir": app/api}' });
  report('malformed JSON refused', bad.ok === false && bad.task === null, bad.errors.join('; '));
  const arr = CF.validateSubmission({ manifest, capabilityName: 'inventory.routes', mode: 'advanced', advancedText: '["app/api"]' });
  report('non-object JSON refused', arr.ok === false, arr.errors.join('; '));
  const unknown = CF.validateSubmission({ manifest, capabilityName: 'inventory.routes', mode: 'advanced', advancedText: '{"nope":1}' });
  report('unexpected argument refused (mirrors runCapability)', unknown.ok === false, unknown.errors.join('; '));
  const missing = CF.validateSubmission({ manifest, capabilityName: 'repo.grep', mode: 'structured', rawValues: {} });
  report('missing required argument refused', missing.ok === false, missing.errors.join('; '));
  const good = CF.validateSubmission({ manifest, capabilityName: 'inventory.routes', mode: 'advanced', advancedText: '{"dir":"app/api"}' });
  report('well-formed Advanced JSON still accepted', good.ok && JSON.stringify(good.task.args) === '{"dir":"app/api"}');
}

console.log('\n==================== F — existing execution path preserved ====================');
{
  const out = CF.validateSubmission({ manifest, capabilityName: 'inventory.routes', mode: 'structured', rawValues: { dir: 'app/api' } });
  const decision = route(out.task);
  report('validated task routes to C0 through the canonical router', decision.execution_lane === 'C0', decision.reason);
  report('router still verification_required', decision.verification_required === true);

  const mainJs = code('main.js');
  report('main.js still routes every submitted task through router.mjs', mainJs.includes("'router.mjs'") && mainJs.includes('const decision = route(task);'));
  report('C0 execution still goes through runCapability', mainJs.includes('runCapability(task.capability, task.args || {}, REPO_ROOT)'));
  // Was: "exactly one execFileSync". That count-based proxy broke when the
  // founder-ruled Alpha floor added F3 (git provenance reads) and F2 (running
  // the governor). The property it stood for is asserted directly instead:
  // no shell, and no execFileSync whose COMMAND is renderer-supplied.
  const execCmds = [...mainJs.matchAll(/execFileSync\(\s*'([^']+)'/g)].map(m => m[1]);
  report('no Desktop-side execution shortcut',
    !mainJs.includes('execSync(') &&
    execCmds.length > 0 && execCmds.every(c => c === 'node' || c === 'git'),
    execCmds.join(', '));
  report('no execFileSync takes a renderer-supplied command', !/execFileSync\(\s*(task|req|args|input)/.test(mainJs));
}

console.log('\n==================== G — C1 unchanged ====================');
{
  const rendererJs = code('renderer.js');
  report('C1 textarea prompt interface intact', rendererJs.includes('id="prompt"') && rendererJs.includes('c1-fields'));
  report('C1 task shape unchanged', rendererJs.includes('{ bounded_for_local: true, input_chars: p.length, prompt: p }'));
  const d = route({ bounded_for_local: true, input_chars: 42, prompt: 'x' });
  report('C1 still routes to C1', d.execution_lane === 'C1', d.reason);
  const over = route({ bounded_for_local: true, input_chars: 999999 });
  report('oversized C1 still refused, not escalated', over.status === 'rejected_oversized' && over.execution_lane === null);

  const mainJs = code('main.js');
  report('C1 execution + honest verification split untouched',
    mainJs.includes("kind: 'execution'") && mainJs.includes("correctness: 'unverified'"));
}

console.log('\n==================== H — no new authority ====================');
{
  const preload = code('preload.js');
  const channels = [...preload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map(m => m[1]).sort();
  // Four channels as of the Alpha floor ruling (2026-08-11): jarvis:governance-action
  // was explicitly authorized for F2. It is still not NEW authority — it runs the
  // governor's own CLI — so it is asserted alongside the delegation check below.
  report('preload exposes exactly the four authorized channels',
    JSON.stringify(channels) === JSON.stringify(['jarvis:capabilities', 'jarvis:governance-action', 'jarvis:status', 'jarvis:submit-task']), channels.join(', '));
  report('the governance channel delegates to the governor, inventing no authority',
    code('main.js').includes('GOV.buildGovernanceArgv') && !/['"](recover|reconcile)['"]/.test(code('main.js')));
  report('no general IPC / shell bridge added', !preload.includes('exec') && !preload.includes('send('));

  const mainJs = code('main.js');
  report('jarvis:capabilities is read-only (no runCapability, no execution)',
    /ipcMain\.handle\('jarvis:capabilities'[\s\S]*?\n\}\);/.exec(mainJs)[0].includes('runCapability') === false);
  report('C3 still routed_not_executed — Desktop does not invoke Claude',
    mainJs.includes("response.status = 'routed_not_executed';") && !mainJs.includes('ANTHROPIC_API_KEY'));
  report('no founder-session activation added', !mainJs.includes('founder') || !mainJs.includes('authenticate'));

  // Presentation must not upgrade an unverified result.
  report('describeVerification never turns UNVERIFIED into PASS',
    CF.describeVerification({ kind: 'execution', pass: true, correctness: 'unverified' }) === 'EXECUTION VERIFIED · RESULT UNVERIFIED');
  report('describeVerification reports absence honestly', CF.describeVerification(null) === 'NOT VERIFIED');
  report('result-kind verification worded as result', CF.describeVerification({ kind: 'result', pass: true }) === 'RESULT VERIFIED');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
