// @ts-check
/**
 * B5 Desktop composition seam.
 *
 * One live, presentation-only Founder Workspace view-model for the existing
 * JARVIS Desktop. Reads governed organs; never creates authority or state.
 * Evidence preview is fail-closed to refs already present in the freshly
 * composed view-model and to safe text-like files beneath the bound repo or
 * local AIN home.
 */
import { mkdtempSync, readFileSync, statSync, lstatSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import { readAllOrgans, resolveAinHome, resolvePartnerHandoffDir } from './read-organs.mjs';
import { composeViewModel } from './adapters.mjs';
import { readTree, project } from './programme-state-projector.mjs';
import { buildRegistry, observeAll, readObservationHistory } from './instrument-registry.mjs';
import { validateViewModel } from './viewmodel-v1.mjs';
import { buildEvidenceGraph, parseExplicitProgrammeRelation } from './graph-join.mjs';

const SAFE_EXT = new Set(['.md', '.txt', '.json', '.jsonl', '.mjs', '.js', '.cjs', '.ts', '.tsx', '.html', '.sh', '.yml', '.yaml']);
const MAX_PREVIEW_BYTES = 64 * 1024;

/** @param {string} observedAgainst @param {string} now @param {NodeJS.ProcessEnv} env @returns {any} */
function emptyOrgans(observedAgainst, now, env) {
  const home = resolveAinHome(env);
  const absent = (/** @type {string} */ organ, /** @type {string} */ dir) => ({ organ, present: false, dir, observed_at: now, unreadable: [] });
  return {
    home,
    units: { ...absent('work-units-v2', path.join(home, 'work-units-v2')), units: [] },
    runs: { ...absent('runs', path.join(home, 'runs')), runs: [] },
    events: { organ: 'events', present: false, file: path.join(home, 'events.jsonl'), observed_at: now, entries: [], unreadable: [] },
    sessions: { ...absent('sessions', path.join(home, 'sessions')), sessions: [] },
    governor: { organ: 'governor-report', present: false, observed_at: now, report: null, unreadable: [], reason: `no bound workspace (${observedAgainst})` },
    results: { ...absent('results', path.join(home, 'results')), results: [], siblings: [], truncated: false },
    partner_handoffs: { ...absent('partner-handoffs', path.join(os.homedir(), '.jarvis', 'context-handoffs')), handoffs: [], truncated: false },
  };
}

/** @param {string} root @param {string[]} args */
function gitText(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }).trim();
}

/**
 * Project programme state from the exact named canonical commit, never from a
 * development branch merely because that branch is the Desktop's bound worktree.
 * A disposable archive under /tmp is presentation substrate only and is removed
 * after projection. Git first-add succession is still read from the real repo,
 * explicitly rooted at the same canonical commit.
 * @param {string} root @param {string} canonicalRef @param {string} now
 */
export function projectCanonicalProgrammeState(root, canonicalRef, now) {
  if (!/^[0-9a-f]{40}$/.test(canonicalRef)) throw new Error(`canonical programme projection requires exact 40-hex ref, got ${canonicalRef}`);
  // Prove the commit exists locally before creating any scratch material.
  gitText(root, ['cat-file', '-e', `${canonicalRef}^{commit}`]);
  const canonicalGit = (/** @type {string[]} */ args) => {
    const scoped = args[0] === 'log' ? ['log', canonicalRef, ...args.slice(1)] : args;
    return execFileSync('git', ['-C', root, ...scoped], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
  };
  const scratch = mkdtempSync(path.join(os.tmpdir(), 'jfw-b5-canonical-'));
  const archive = path.join(scratch, 'canonical.tar');
  try {
    execFileSync('git', ['-C', root, 'archive', '--format=tar', '-o', archive, canonicalRef, 'CLAUDE.md', 'docs/programme', 'docs/ops'], { stdio: ['ignore', 'pipe', 'pipe'] });
    execFileSync('/usr/bin/tar', ['-xf', archive, '-C', scratch], { stdio: ['ignore', 'pipe', 'pipe'] });
    // readTree is pointed at the disposable exact-commit archive, never the bound working tree.
    return project(readTree({ root: scratch, git: canonicalGit }), { observed_against: canonicalRef, projected_at: now });
  } finally {
    try { rmSync(scratch, { recursive: true, force: true }); } catch { /* disposable canonical snapshot */ }
  }
}

/**
 * Read only explicit programme relation sentences from the exact canonical tree.
 * V1 admits only a literal backticked "A supersedes B" statement. Co-mention,
 * shared prefixes, and fuzzy name resemblance produce no relation.
 * @param {string} root @param {string} canonicalRef @param {any} programmeState
 */
export function projectCanonicalProgrammeRelations(root, canonicalRef, programmeState) {
  if (!/^[0-9a-f]{40}$/.test(String(canonicalRef||''))) return [];
  const known=new Set((Array.isArray(programmeState?.programmes)?programmeState.programmes:[]).map((/** @type {any} */ p)=>String(p?.id||'')).filter(Boolean));
  let out='';
  try {
    out=execFileSync('git',['-C',root,'grep','-n','-I','-E','supersedes',canonicalRef,'--','docs/programme'],{
      encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:16*1024*1024,
    });
  } catch (e) {
    if (/** @type {any} */ (e)?.status===1) return [];
    throw e;
  }
  /** @type {any[]} */ const relations=[];
  for (const raw of out.split('\n')) {
    if (!raw.trim()) continue;
    const m=raw.match(/^[0-9a-f]{40}:(.*?):(\d+):(.*)$/);
    if (!m) continue;
    const rel=parseExplicitProgrammeRelation({path:m[1],line:Number(m[2]),text:m[3]},known);
    if (rel) relations.push(rel);
  }
  return relations;
}

/**
 * @param {{ root: string|null, status: any, observedAgainst: string, env?: NodeJS.ProcessEnv, now?: string, observeMode?: 'quick'|'full', governorExec?: (file:string,args:string[],opts:any)=>string }} input
 */
export async function buildDesktopViewModel(input) {
  const env = input.env || process.env;
  const now = input.now || new Date().toISOString();
  const root = input.root;
  /** @type {any} */
  const organs = root
    ? await readAllOrgans({ root, env, runsLimit: 40, eventsN: 60, resultsLimit: 40, exec: input.governorExec })
    : emptyOrgans(input.observedAgainst, now, env);

  let programme_state;
  /** @type {any} */ let registry = { schema: 'monitor-instrument-registry.v1', entries: [] };
  /** @type {any[]} */ let observations = [];
  /** @type {any} */ let history = {};
  let scratch = null;

  if (root) {
    programme_state = projectCanonicalProgrammeState(root, input.observedAgainst, now);
    registry = buildRegistry({ root });
    history = readObservationHistory({ env });
    const observeMode = input.observeMode === 'full' ? 'full' : 'quick';
    const observedRegistry = observeMode === 'full'
      ? registry
      : { ...registry, entries: registry.entries.filter((/** @type {any} */ e) => e.kind !== 'script') };
    scratch = mkdtempSync(path.join(os.tmpdir(), 'jfw-b5-observe-'));
    try {
      observations = await observeAll(observedRegistry, { root, env, scratchDir: scratch });
    } finally {
      try { rmSync(scratch, { recursive: true, force: true }); } catch { /* disposable scratch */ }
    }
  }

  const vm = composeViewModel({
    status: input.status,
    organs,
    observed_against: input.observedAgainst,
    programme_state,
    graph: { nodes: [], edges: [] },
    vocabularies: [],
    now,
    observations,
    registry,
    observation_history: history,
  });

  if (root) {
    const explicitRelations = projectCanonicalProgrammeRelations(root, input.observedAgainst, vm.programme_state);
    vm.graph = buildEvidenceGraph({
      programme_state: vm.programme_state,
      work: vm.work,
      partner_handoffs: organs.partner_handoffs?.handoffs || [],
      explicit_relations: explicitRelations,
    });
  }

  const validation = validateViewModel(vm, { mode: 'live' });
  if (!validation.ok) {
    const detail = validation.violations.slice(0, 8).map((v) => `${v.law} ${v.path}: ${v.detail}`).join(' · ');
    throw new Error(`B5 live view-model refused: ${detail}`);
  }
  return vm;
}

/** @param {unknown} value @param {Set<string>} out @param {string|null} key */
function collect(value, out, key = null) {
  if (typeof value === 'string') {
    if (key && /^(source|file|reveal|ref)$/.test(key)) out.add(value);
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const x of value) {
      if (typeof x === 'string' && key === 'sources') out.add(x);
      else collect(x, out, key);
    }
    return;
  }
  for (const [k, v] of Object.entries(/** @type {Record<string, unknown>} */ (value))) collect(v, out, k);
}

/** @param {any} vm */
export function evidenceRefs(vm) {
  const out = new Set();
  collect(vm, out);
  return out;
}

/** @param {string} ref */
function splitRef(ref) {
  let token = ref.trim();
  token = token.replace(/\s+§.*$/, '');
  token = token.replace(/#.*$/, '');
  let line = null;
  const m = token.match(/^(.*?):(\d+)(?:-(\d+))?$/);
  if (m) { token = m[1]; line = Number(m[2]); }
  return { token, line };
}

/** @param {string} candidate @param {string} parent */
function inside(candidate, parent) {
  const rel = path.relative(parent, candidate);
  return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel));
}

/**
 * Read one exact evidence ref that already exists in the live view-model.
 * @param {any} vm
 * @param {string} ref
 * @param {{ root: string|null, env?: NodeJS.ProcessEnv, canonicalRef?: string, partnerHome?: string }} opts
 */
export function readEvidencePreview(vm, ref, opts) {
  if (typeof ref !== 'string' || !ref.trim()) return { ok: false, reason: 'evidence ref required' };
  const admitted = evidenceRefs(vm);
  if (!admitted.has(ref)) return { ok: false, reason: 'ref is not present in the current live view-model' };
  if (!opts.root) return { ok: false, reason: 'no workspace is bound' };

  const env = opts.env || process.env;
  const home = resolveAinHome(env);

  if (ref.startsWith('partner-handoff:')) {
    const name=ref.slice('partner-handoff:'.length);
    if (!/^[a-z0-9][a-z0-9._-]{2,100}\.json$/i.test(name) || path.basename(name)!==name) return { ok:false, reason:'invalid partner handoff evidence ref' };
    const dir=resolvePartnerHandoffDir(opts.partnerHome || os.homedir());
    const full=path.join(dir,name);
    try {
      const st=lstatSync(full);
      if (st.isSymbolicLink() || !st.isFile()) return { ok:false, reason:'partner handoff evidence is not a regular file' };
      if (st.size > 16*1024) return { ok:false, reason:'partner handoff evidence exceeds bounded size' };
      const raw=readFileSync(full,'utf8');
      return {
        ok:true, ref, display_path:`Partner handoff/${name}`, line_start:1, line_end:raw.split('\n').length,
        text:raw, truncated:false, source_kind:'partner handoff receipt · orientation only', evidence_state:'ORIENTATION_ONLY',
      };
    } catch (e) { return { ok:false, reason:`partner handoff evidence read failed: ${String(e)}` }; }
  }

  const { token, line } = splitRef(ref);
  if (!token || /^(https?:|file:)/i.test(token)) return { ok: false, reason: 'non-local evidence refs are not readable here' };

  const full = path.isAbsolute(token) ? path.resolve(token) : path.resolve(opts.root, token);
  if (!inside(full, opts.root) && !inside(full, home)) return { ok: false, reason: 'evidence path is outside the bound workspace and local AIN home' };
  const base = path.basename(full);
  if (base.startsWith('.') || full.includes(`${path.sep}node_modules${path.sep}`) || !SAFE_EXT.has(path.extname(full).toLowerCase())) {
    return { ok: false, reason: 'evidence file type is not admitted for in-app preview' };
  }
  const preferCanonical = !path.isAbsolute(token) && !!opts.canonicalRef && (token === 'CLAUDE.md' || token.startsWith('docs/programme/'));
  let raw;
  let sourceKind = 'bound workspace';
  if (preferCanonical) {
    if (!/^[0-9a-f]{40}$/.test(String(opts.canonicalRef))) return { ok: false, reason: 'canonical evidence ref is not an exact commit' };
    try {
      raw = execFileSync('git', ['-C', opts.root, 'show', `${opts.canonicalRef}:${token}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: MAX_PREVIEW_BYTES * 4 });
      sourceKind = `canonical ${String(opts.canonicalRef).slice(0, 12)}`;
    } catch (e) { return { ok: false, reason: `canonical evidence read failed: ${String(e)}` }; }
  } else {
    if (!existsSync(full)) return { ok: false, reason: 'evidence file is absent on this substrate' };
    let st; try { st = statSync(full); } catch (e) { return { ok: false, reason: `evidence stat failed: ${String(e)}` }; }
    if (!st.isFile()) return { ok: false, reason: 'evidence ref is not a file' };
    try { raw = readFileSync(full, 'utf8'); } catch (e) { return { ok: false, reason: `evidence read failed: ${String(e)}` }; }
  }
  const truncated = Buffer.byteLength(raw, 'utf8') > MAX_PREVIEW_BYTES;
  if (truncated) raw = Buffer.from(raw, 'utf8').subarray(0, MAX_PREVIEW_BYTES).toString('utf8');
  const lines = raw.split('\n');
  let start = 1, end = Math.min(lines.length, 180);
  if (line && Number.isFinite(line)) { start = Math.max(1, line - 12); end = Math.min(lines.length, line + 28); }
  const text = lines.slice(start - 1, end).join('\n');
  const display_path = inside(full, opts.root) ? path.relative(opts.root, full) : `AIN/${path.relative(home, full)}`;
  return {
    ok: true,
    ref,
    display_path,
    line_start: start,
    line_end: end,
    text,
    truncated: truncated || end < lines.length,
    source_kind: sourceKind,
    evidence_state: 'OBSERVED',
  };
}
