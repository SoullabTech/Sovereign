// @ts-check
/**
 * programme-state.v1 — deterministic projector (B4)
 * ═══════════════════════════════════════════════════════════════════════════
 * JARVIS-FOUNDER-WORKSPACE-01 / B4, authorized by the P0 founder adjudication
 * (FD-3, 2026-09-23). Law: D-03 — a projection contract, never a second truth
 * store. The repository is the authority; this output is derived, disposable
 * and rebuildable (PS-8). Nothing may read it to decide whether an act may
 * run (PS-7): `authority_effect: 'none'`, `presentation_only: true`.
 *
 * FD-3, as implemented (every rule is a named, replaceable decision so the
 * matrix can kill a wrong version of each one):
 *   population  = every *.md under docs/programme/** + every bullet of the
 *                 CLAUDE.md "Current priority thread"
 *   association = R-A1 filename prefix id · R-A2 evidence/<ID>/ directory ·
 *                 R-A3 first backticked id in a thread bullet · else UNCLASSIFIED
 *   precedence  = (1) founder adjudication / rulings / ratification record with an
 *                 extractable standing line, newest first · (2) newest record naming
 *                 the programme with a **State|Status|Standing:** line · (3) the
 *                 thread ORIENTS (newer act identified) and never overrides ·
 *                 (4) equal-tier same-date different-standing ⇒ UNVERIFIED / CONFLICT
 *   external    = D-01 rule: a founder record line that carries a backticked id
 *                 together with "EXTERNAL PROTECTED DEPENDENCY"
 *   complete    = zero unclassified + zero unreadable subjects AND
 *                 examined == emitted + excluded_by_rule + classified
 *
 * Pure over an injected filesystem view: `readTree()` gathers; `project()` is
 * a function of its inputs. No network, no $AIN read, no write here.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/** B4R1: the governed identity/succession map (evidence per entry; RM-1 refuses entries without evidence). */
export const MAP_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'programme-projection-map.v1.json');
/** @param {string} [file] */
export function loadMap(file = MAP_PATH) {
  const m = JSON.parse(readFileSync(file, 'utf8'));
  if (m.schema !== 'programme-projection-map.v1') throw new Error(`map schema ${m.schema} is not programme-projection-map.v1`);
  for (const group of ['families', 'ops_lanes', 'aliases', 'classifications']) for (const e of m[group] || []) {
    if (!Array.isArray(e.evidence) || e.evidence.length === 0 || e.evidence.some((/** @type {unknown} */ x) => typeof x !== 'string' || !x.trim())) throw new Error(`RM-1: map entry without evidence in ${group}: ${JSON.stringify(e).slice(0, 80)}`);
  }
  return m;
}
const DECLARATION_RE = /^\*\*(?:Programme|Program|Lane)\*\*\s*:?\s*`?([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)`?|^\*\*(?:Programme|Program|Lane):\*\*\s*`?([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)`?/m;
const SUPERSEDES_RE = /^\*\*(?:Supersedes|Predecessors?|Superseded)[^*\n]*\*\*:?[^\n]*$/gim;

export const SCHEMA = 'programme-state.v1';
export const PROJECTOR_ID = 'founder-workspace/programme-state-projector@3-b4r1r1';

/** Programme id: upper-case tokens joined by hyphens, at least one hyphen (`JARVIS-KP-01`, `S3-O1`, `RGR-05`). */
const ID_RE = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
const FILENAME_ID_RE = /^([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?=[_.]|-[a-z])/;
const DATE_RE = /(\d{4}-\d{2}-\d{2})/;
/** Exactly two forms are standing declarations: `**Standing:** text` and `**Standing: text…` (bold closes later). `**Standing with X**:` is prose, not a declaration. */
const STANDING_LINE_RE = /^\*\*(State|Status|Standing|Disposition):\s+([^\n]+)$/m;
const STANDING_LINE_RE_COLON_INSIDE = /^\*\*(State|Status|Standing|Disposition):\*\*\s*([^\n]+)$/m;
const TIER1_FILE_RE = /FOUNDER_ADJUDICATION|FOUNDER_RULINGS|_RATIFICATION/;
const EXTERNAL_RE = /EXTERNAL PROTECTED DEPENDENCY/;
const THREAD_START = /^## Current priority thread/m;
const THREAD_END = /^## Re-entry vow/m;

/**
 * @typedef {{ id: string, kind: 'file'|'thread-bullet', path: string, text: string|null, error: string|null, date: string|null, first_add_commit?: string|null, ops_lane_id?: string }} Subject
 */

// ── gather (fs) ───────────────────────────────────────────────────────────────

/**
 * Read the governed population. The only fs code in this module.
 * @param {{ root: string, programmeDir?: string, claudeMd?: string, map?: any, git?: ((args: string[]) => string)|null, opsSelect?: (map: any, root: string) => {path:string, id:string}[] }} opts
 * @returns {{ subjects: Subject[], root: string, map: any, isAncestor: ((older:string, newer:string)=>boolean|null)|null }}
 */
export function readTree(opts) {
  const root = opts.root;
  const map = opts.map || (opts.map === null ? EMPTY_MAP : (existsSync(MAP_PATH) ? loadMap() : EMPTY_MAP));
  const dir = path.join(root, opts.programmeDir || 'docs/programme');
  const claude = path.join(root, opts.claudeMd || 'CLAUDE.md');
  /** @type {Subject[]} */ const subjects = [];
  const walk = (/** @type {string} */ d) => {
    let names;
    try { names = readdirSync(d).sort(); } catch (e) { subjects.push({ id: rel(root, d), kind: 'file', path: rel(root, d), text: null, error: `readdir: ${msg(e)}`, date: null }); return; }
    for (const n of names) {
      const p = path.join(d, n);
      let st; try { st = statSync(p); } catch (e) { subjects.push({ id: rel(root, p), kind: 'file', path: rel(root, p), text: null, error: `stat: ${msg(e)}`, date: null }); continue; }
      if (st.isDirectory()) { walk(p); continue; }
      if (!n.endsWith('.md')) continue;
      let text = null, error = null;
      try { text = readFileSync(p, 'utf8'); } catch (e) { error = `read: ${msg(e)}`; }
      subjects.push({ id: rel(root, p), kind: 'file', path: rel(root, p), text, error, date: dateOf(n) });
    }
  };
  if (existsSync(dir)) walk(dir); else subjects.push({ id: rel(root, dir), kind: 'file', path: rel(root, dir), text: null, error: 'docs/programme absent', date: null });
  // thread bullets
  let claudeText = null;
  try { claudeText = readFileSync(claude, 'utf8'); } catch (e) { subjects.push({ id: 'CLAUDE.md', kind: 'thread-bullet', path: 'CLAUDE.md', text: null, error: `read: ${msg(e)}`, date: null }); }
  if (claudeText !== null) for (const b of threadBullets(claudeText)) subjects.push(b);
  // R-O1: governed docs/ops lanes enter the population ONLY by name (the map), never the whole directory
  for (const lane of (opts.opsSelect || DECISIONS.opsLanes)(map, root)) {
    const p = path.join(root, lane.path);
    let text = null, error = null;
    try { text = readFileSync(p, 'utf8'); } catch (e) { error = `read: ${msg(e)}`; }
    subjects.push({ id: lane.path, kind: 'file', path: lane.path, text, error, date: dateOf(path.basename(lane.path)), ops_lane_id: lane.id });
  }
  // R-S2: first-add commit identity per file, plus a true DAG ancestry predicate (null when git is unavailable).
  const git = opts.git === undefined ? defaultGit(root) : opts.git;
  const firstAdd = firstAddIndex(root, git);
  for (const s of subjects) if (s.kind === 'file') s.first_add_commit = firstAdd ? (firstAdd.get(s.path) ?? null) : null;
  return { subjects, root, map, isAncestor: ancestorPredicate(git) };
}
const EMPTY_MAP = Object.freeze({ schema: 'programme-projection-map.v1', families: [], ops_lanes: [], aliases: [], classifications: [], succession: {} });
/** @param {string} root */
function defaultGit(root) { return (/** @type {string[]} */ args) => { const cp = /** @type {any} */ (process).getBuiltinModule('node:child_process'); return cp.execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }); }; }
/** @param {string} _root @param {((args: string[]) => string)|null} git @returns {Map<string, string>|null} */
function firstAddIndex(_root, git) {
  if (!git) return null;
  let out; try { out = git(['log', '--diff-filter=A', '--name-only', '--format=%H', '--', 'docs/programme', 'docs/ops']); } catch { return null; }
  /** @type {Map<string, string>} */ const m = new Map(); let commit = null;
  for (const line of out.split('\n')) {
    if (/^[0-9a-f]{40}$/i.test(line)) { commit = line; continue; }
    if (line && commit !== null) m.set(line, commit); // log is newest-first; last write wins = oldest add commit for this path
  }
  return m;
}
/** True only when Git proves older is an ancestor of newer; false means not-ancestor; null means unknown/instrument error.
 * @param {((args: string[]) => string)|null} git @returns {((older:string, newer:string)=>boolean|null)|null} */
function ancestorPredicate(git) {
  if (!git) return null;
  return (older, newer) => {
    if (older === newer) return false;
    try { git(['merge-base', '--is-ancestor', older, newer]); return true; }
    catch (e) {
      if (e && typeof e === 'object' && 'status' in e && /** @type {any} */ (e).status === 1) return false;
      return null;
    }
  };
}

/** @param {string} text */
export function threadBullets(text) {
  const s = text.search(THREAD_START); const e = text.search(THREAD_END);
  if (s < 0) return [];
  const block = text.slice(s, e > s ? e : undefined);
  /** @type {Subject[]} */ const out = [];
  const lines = block.split('\n');
  let n = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^- \*\*/.test(line)) continue;
    n++;
    const m = line.match(/^- \*\*(LATEST|PRIOR|DIRECTION|NAMING)[^\d]*(\d{4}-\d{2}-\d{2})?/);
    out.push({ id: `CLAUDE.md#thread-bullet-${String(n).padStart(3, '0')}`, kind: 'thread-bullet', path: `CLAUDE.md#thread-bullet-${String(n).padStart(3, '0')}`, text: line, error: null, date: m && m[2] ? m[2] : null });
  }
  return out;
}

// ── decisions (each replaceable; the matrix kills a wrong version of each) ───

export const DECISIONS = Object.freeze({
  /** R-O1: which docs/ops files enter the population — exactly the lanes the map names, never a directory listing. @param {any} map @param {string} _root @returns {{path:string, id:string}[]} */
  opsLanes(map, _root) { return (map.ops_lanes || []).map((/** @type {any} */ l) => ({ path: String(l.path), id: String(l.id) })); },
  /**
   * Associate a subject with a programme id. Order (B4R1): R-A0 the record's own declaration · R-O1 ops lane by name ·
   * R-A4 map alias · R-A1/R-A2 filename/evidence dir (then R-F1 family canonical) · R-A3 backticked id in a thread bullet (then family) · null.
   * @param {Subject} s @param {any} [map] @returns {{ id: string, rule: string, role: 'record'|'supporting' }|null}
   */
  associate(s, map = EMPTY_MAP) {
    const fam = (/** @type {string} */ id) => { for (const f of map.families || []) if (new RegExp(f.member_pattern).test(id)) return { id: f.canonical, via: f.family }; return null; };
    if (s.kind === 'thread-bullet') {
      const m = s.text ? s.text.match(/`([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?:[ /`·]|$)/) : null;
      if (m) { const f = fam(m[1]); return f ? { id: f.id, rule: `R-A3+R-F1(${f.via})`, role: 'record' } : { id: m[1], rule: 'R-A3', role: 'record' }; }
      for (const f of map.families || []) if (f.thread_token && s.text && new RegExp('`' + f.thread_token + '`').test(s.text)) return { id: f.canonical, rule: `R-A3b family token (${f.family})`, role: 'record' };
      // R-A3c: exactly one well-formed id in PLAIN text inside the bullet's bold title
      const title = (s.text || '').match(/^- \*\*([^*]*)\*\*/); const plain = title ? [...new Set([...title[1].matchAll(/(?<![\w`-])([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?![\w`-])/g)].map((x) => x[1]))] : [];
      if (plain.length === 1) { const f = fam(plain[0]); return f ? { id: f.id, rule: `R-A3c plain id in title+R-F1(${f.via})`, role: 'record' } : { id: plain[0], rule: 'R-A3c plain id in title', role: 'record' }; }
      return null;
    }
    if (s.ops_lane_id) return { id: s.ops_lane_id, rule: 'R-O1 ops lane (map)', role: 'record' };
    if (s.text) { const d = s.text.match(DECLARATION_RE); const declared = d ? (d[1] || d[2]) : null; if (declared) { const f = fam(declared); return f ? { id: f.id, rule: `R-A0 declaration+R-F1(${f.via})`, role: 'record' } : { id: declared, rule: 'R-A0 declaration', role: 'record' }; } }
    for (const a of map.aliases || []) if (new RegExp(a.match).test(s.path)) return { id: a.id, rule: 'R-A4 map alias', role: a.role === 'record' ? 'record' : 'supporting' };
    const parts = s.path.split('/');
    const base = parts[parts.length - 1];
    let id = null, rule = null;
    if (parts.length >= 4 && parts[2] === 'evidence' && ID_RE.test(parts[3])) { id = parts[3]; rule = 'R-A2'; }
    else { const m = base.match(FILENAME_ID_RE); if (m) { id = m[1]; rule = 'R-A1'; } }
    if (!id) return null;
    const f = fam(id);
    return f ? { id: f.id, rule: `${rule}+R-F1(${f.via})`, role: 'record' } : { id, rule: /** @type {string} */ (rule), role: 'record' };
  },
  /** R-A6: a still-unassociated file whose own text carries exactly one distinct well-formed backticked id → supporting record of it. @param {Subject} s @param {any} [map] */
  associateBySingleCitation(s, map = EMPTY_MAP) {
    const ids = [...new Set([...(s.text || '').matchAll(/`([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?:[ /`·]|$)/g)].map((m) => /** @type {string} */ (m[1])))];
    const one = ids[0];
    if (ids.length !== 1 || one === undefined) return null;
    /** @type {'supporting'} */ const role = 'supporting';
    for (const f of map.families || []) if (new RegExp(f.member_pattern).test(one)) return { id: String(f.canonical), rule: `R-A6 single cited id+R-F1(${f.family})`, role };
    return { id: one, rule: 'R-A6 single cited id', role };
  },
  /** R-A5: a still-unassociated file cited by the STANDING-BEARING records of exactly one programme. @param {Subject} s @param {Map<string, Set<string>>} citedBy path → set of ids (tier-1/2 file records only)
   * @param {{ citedByAll?: Map<string, Set<string>> }} [_ctx] every mention incl. notes/bullets — never consulted by the conforming decision
   * @returns {Association | { ambiguous: string[] } | null} */
  associateByCitation(s, citedBy, _ctx) {
    const ids = citedBy.get(s.path) || (s.path.includes('/') ? [...citedBy.entries()].filter(([k]) => k.endsWith('/') && s.path.startsWith(k)).flatMap(([, v]) => [...v]) : []);
    const set = new Set(ids);
    if (set.size === 1) return { id: /** @type {string} */ ([...set][0]), rule: 'R-A5 cited by one programme', role: /** @type {'supporting'} */ ('supporting') };
    return set.size > 1 ? { ambiguous: [...set].sort() } : null;
  },
  /** RM-3: explicit classification (examined, counted, never a programme). @param {Subject} s @param {any} map @param {number} distinctIdsInText */
  classify(s, map, distinctIdsInText) {
    for (const c of map.classifications || []) {
      if (!new RegExp(c.match).test(s.path)) continue;
      if (c.when === 'no single programme id in the file' && distinctIdsInText === 1) continue;
      if (c.when && c.when.startsWith('bullet is not a LATEST') && s.kind === 'thread-bullet' && /^- \*\*(LATEST|PRIOR|DIRECTION|NAMING)/.test(s.text || '')) continue;
      if (c.when && c.when.startsWith('bullet is a LATEST') && s.kind === 'thread-bullet' && !/^- \*\*(LATEST|PRIOR|DIRECTION|NAMING)/.test(s.text || '')) continue;
      return { category: c.category, rule: 'RM-3 map classification' };
    }
    return null;
  },
  /** Tier of a file record: 1 founder act · 2 standing record · 3 supporting. @param {Subject} s */
  tier(s) {
    if (s.kind !== 'file' || s.text === null) return 3;
    const hasStanding = extractStanding(s.text) !== null;
    if (TIER1_FILE_RE.test(s.path) && hasStanding) return 1;
    return hasStanding ? 2 : 3;
  },
  /** PS-1: verbatim standing line from a record. @param {string} text @returns {string|null} */
  standing(text) { return extractStanding(text); },
  /**
   * Choose the governing record for a programme. @param {Subject[]} records (files only, associated to this id)
   * @param {(s: Subject) => number} tierOf
   * @param {{ succeedBySupersedes: (set: Subject[]) => Subject|null, succeedByFirstAdd: (set: Subject[], isAncestor?: ((older:string,newer:string)=>boolean|null)|null) => Subject|null }} [D] the effective decision set
   *        (B4R1: succession is reached THROUGH the injected decisions, so a replaced succession rule is actually exercised — the matrix found
   *        the first version calling the frozen module object directly, which let three defeat candidates survive unexercised)
   * @param {((older:string,newer:string)=>boolean|null)|null} [isAncestor] true Git DAG relation for first-add commits
   * @returns {{ governing: Subject|null, tier: number|null, conflict: Subject[]|null, note: string|null, succession: {rule:string, among:string[]}|null }}
   */
  select(records, tierOf, D = DECISIONS, isAncestor = null) {
    for (const tier of [1, 2]) {
      const all = records.filter((r) => tierOf(r) === tier);
      if (all.length === 0) continue;
      if (all.length === 1) return { governing: all[0], tier, conflict: null, note: null, succession: null }; // one record needs no ordering
      if (all.some((r) => r.date === null)) return { governing: null, tier, conflict: null, note: `${all.length} tier-${tier} records and at least one carries no date in its filename; newest-first is undecidable`, succession: null };
      const cands = all.sort((a, b) => /** @type {string} */ (b.date).localeCompare(/** @type {string} */ (a.date)) || a.path.localeCompare(b.path));
      const top = cands[0];
      const sameDay = cands.filter((r) => r.date === top.date);
      const standings = new Set(sameDay.map((r) => extractStanding(r.text || '') || ''));
      if (standings.size <= 1) return { governing: top, tier, conflict: null, note: null, succession: null };
      // B4R1 succession — R-S1 explicit supersession lines first
      const s1 = D.succeedBySupersedes(sameDay);
      if (s1) return { governing: s1, tier, conflict: null, note: null, succession: { rule: 'R-S1 explicit supersession line', among: sameDay.map((r) => r.path) } };
      // R-S2 git ancestry second
      const s2 = D.succeedByFirstAdd(sameDay, isAncestor);
      if (s2) return { governing: s2, tier, conflict: null, note: null, succession: { rule: 'R-S2 git first-add ancestry', among: sameDay.map((r) => r.path) } };
      // R-S3 remaining ties stay conflicts
      return { governing: null, tier, conflict: sameDay, note: `${sameDay.length} tier-${tier} records dated ${top.date} carry different standing lines; no supersession line, same or unknown first-add commit`, succession: null };
    }
    return { governing: null, tier: null, conflict: null, note: 'no standing record', succession: null };
  },
  /** R-S1. @param {Subject[]} set @returns {Subject|null} the unique record superseded by none and superseding at least one other */
  succeedBySupersedes(set) {
    const superseded = new Set();
    for (const a of set) for (const line of (a.text || '').match(SUPERSEDES_RE) || []) for (const b of set) if (b !== a && line.includes(path.basename(b.path))) superseded.add(b.path);
    if (superseded.size === 0) return null;
    const rest = set.filter((r) => !superseded.has(r.path));
    return rest.length === 1 ? rest[0] : null;
  },
  /** R-S2. A successor must have been first-added in a commit that is a strict descendant of every competing first-add commit.
   * Wall-clock timestamps never establish succession. Same-commit, incomparable, or unknown ancestry stays tied.
   * @param {Subject[]} set @param {((older:string,newer:string)=>boolean|null)|null} [isAncestor] @returns {Subject|null} */
  succeedByFirstAdd(set, isAncestor = null) {
    if (!isAncestor || set.some((r) => r.first_add_commit == null)) return null;
    const winners = set.filter((candidate) => set.every((other) => {
      if (other === candidate) return true;
      if (other.first_add_commit === candidate.first_add_commit) return false;
      return isAncestor(/** @type {string} */ (other.first_add_commit), /** @type {string} */ (candidate.first_add_commit)) === true;
    }));
    return winners.length === 1 ? winners[0] : null;
  },
  /** FD-3(3): the thread orients; it never supplies standing. @param {Subject[]} bullets @param {string|null} governingDate */
  orient(bullets, governingDate) {
    const dated = bullets.filter((b) => b.date).sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.path.localeCompare(b.path));
    if (!dated.length) return null;
    const latest = dated[0];
    return { date: latest.date, source: latest.path, excerpt: (latest.text || '').replace(/^- \*\*/, '').slice(0, 240), newer_act_identified: governingDate ? String(latest.date) > governingDate : true, overrides: false };
  },
  /** D-01 rule. @param {Subject[]} allFiles @returns {Map<string, string>} id → source path */
  externals(allFiles) {
    const out = new Map();
    for (const f of allFiles) {
      if (f.kind !== 'file' || !f.text || !TIER1_FILE_RE.test(f.path)) continue;
      for (const line of f.text.split('\n')) {
        if (!EXTERNAL_RE.test(line)) continue;
        const m = line.match(/`([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?:[ /`·]|$)/);
        if (m && !out.has(m[1])) out.set(m[1], f.path);
      }
    }
    return out;
  },
  /** Explicit exclusions by rule (FD-3). None in v1: everything unassociable stays UNCLASSIFIED. @param {Subject} _s @returns {string|null} rule id or null */
  excludeByRule(_s) { return null; },
  /** PS-9 / FD-3 completeness. */
  complete(/** @type {{examined:number, emitted:number, excluded:number, classified:number, unclassified:number, unreadable:number}} */ n) {
    return n.unclassified === 0 && n.unreadable === 0 && n.examined === n.emitted + n.excluded + n.classified;
  },
});

// ── project (pure) ────────────────────────────────────────────────────────────

/**
 * @typedef {{ id: string, rule: string, role: 'record'|'supporting' }} Association
 * @param {{ subjects: Subject[], map?: any, isAncestor?: ((older:string,newer:string)=>boolean|null)|null }} tree
 * @param {{ observed_against: string, projected_at?: string, decisions?: Partial<typeof DECISIONS> }} opts
 */
export function project(tree, opts) {
  const D = { ...DECISIONS, ...(opts.decisions || {}) };
  const map = tree.map || EMPTY_MAP;
  const projected_at = opts.projected_at || new Date().toISOString();
  const subjects = [...tree.subjects].sort((a, b) => a.path.localeCompare(b.path));
  /** @type {Map<string, Subject[]>} */ const byId = new Map();
  /** @type {Map<string, { id: string, rule: string, role: 'record'|'supporting' }>} */ const assoc = new Map();
  /** @type {{path:string, kind:string, reason:string}[]} */ const unclassified = [];
  /** @type {{path:string, error:string}[]} */ const unreadable = [];
  /** @type {{path:string, rule:string}[]} */ const excluded = [];
  /** @type {{path:string, category:string, rule:string}[]} */ const classified = [];
  /** @type {Subject[]} */ const pending = [];
  const idsIn = (/** @type {Subject} */ s) => new Set([...(s.text || '').matchAll(/`([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?:[ /`·]|$)/g)].map((m) => m[1])).size;
  for (const s of subjects) {
    if (s.error) { unreadable.push({ path: s.path, error: s.error }); continue; }
    const rule = D.excludeByRule(s);
    if (rule) { excluded.push({ path: s.path, rule }); continue; }
    const a = D.associate(s, map);
    if (a) { assoc.set(s.path, a); if (!byId.has(a.id)) byId.set(a.id, []); /** @type {Subject[]} */ (byId.get(a.id)).push(s); continue; }
    pending.push(s);
  }
  // R-A5 citation pass: a pending file cited by subjects of exactly one programme becomes a supporting record of it
  /** @type {Map<string, Set<string>>} */ const citedBy = new Map();
  // R-A5 credits only citations from STANDING-BEARING file records (tier 1/2). A docket note, evidence record or thread bullet that
  // mentions a path — even to say it belongs to nobody — is not a claim of custody. (B4R1: the B4R1 evidence record itself, naming
  // the one unclassified file in its docket, would otherwise have associated it and flipped the real projection to complete:true.)
  /** @type {Map<string, Set<string>>} */ const citedByAll = new Map(); // every mention, kept only so a defeat candidate can be built against it
  for (const [p, a] of assoc) {
    const s = subjects.find((x) => x.path === p); if (!s) continue;
    const credit = s.kind === 'file' && a.role !== 'supporting' && D.tier(s) <= 2;
    for (const m of (s.text || '').matchAll(/docs\/programme\/[A-Za-z0-9_./-]+?(?:\.md|\/)/g)) {
      const k = m[0];
      if (!citedByAll.has(k)) citedByAll.set(k, new Set()); /** @type {Set<string>} */ (citedByAll.get(k)).add(a.id);
      if (!credit) continue;
      if (!citedBy.has(k)) citedBy.set(k, new Set()); /** @type {Set<string>} */ (citedBy.get(k)).add(a.id);
    }
  }
  for (const s of pending) {
    const c = D.associateByCitation(s, citedBy, { citedByAll });
    if (c && 'id' in c) { assoc.set(s.path, c); if (!byId.has(c.id)) byId.set(c.id, []); /** @type {Subject[]} */ (byId.get(c.id)).push(s); continue; }
    const c6 = s.kind === 'file' ? D.associateBySingleCitation(s, map) : null;
    if (c6) { assoc.set(s.path, c6); if (!byId.has(c6.id)) byId.set(c6.id, []); /** @type {Subject[]} */ (byId.get(c6.id)).push(s); continue; }
    const cl = D.classify(s, map, idsIn(s));
    if (cl) { classified.push({ path: s.path, category: cl.category, rule: cl.rule }); continue; }
    unclassified.push({ path: s.path, kind: s.kind, reason: c && 'ambiguous' in c ? `cited by ${c.ambiguous.length} programmes (${c.ambiguous.join(', ')})` : s.kind === 'file' ? 'no declaration (R-A0), no map alias (R-A4), no hyphenated filename id (R-A1/R-A2), not cited by the standing records of one programme (R-A5), no single cited id (R-A6), no classification (RM-3)' : 'thread bullet names no backticked programme id or family token (R-A3)' });
  }
  const externals = D.externals(subjects.filter((s) => s.kind === 'file' && !s.error));
  for (const id of externals.keys()) if (!byId.has(id)) byId.set(id, []);

  const ids = [...byId.keys()].sort();
  const programmes = ids.map((id) => {
    const all = /** @type {Subject[]} */ (byId.get(id));
    const files = all.filter((s) => s.kind === 'file');
    const records = files.filter((s) => assoc.get(s.path)?.role !== 'supporting'); // supporting records never supply standing
    const bullets = all.filter((s) => s.kind === 'thread-bullet');
    const sel = D.select(records, D.tier, D, tree.isAncestor || null);
    const governing = sel.governing;
    const standing = governing && governing.text ? D.standing(governing.text) : null;
    const thread = D.orient(bullets, governing ? governing.date : null);
    const externalSource = externals.get(id) || null;
    let evidence_state;
    if (sel.conflict) evidence_state = 'UNVERIFIED / CONFLICT';
    else if (governing && standing) evidence_state = 'OBSERVED';
    else if (externalSource) evidence_state = 'OBSERVED';
    else if (files.length || bullets.length) evidence_state = 'UNVERIFIED';
    else evidence_state = 'UNVERIFIED';
    return {
      id, name: id, kind: 'programme', question: null,
      standing: sel.conflict ? 'UNVERIFIED / CONFLICT' : (standing ?? (externalSource ? 'external protected dependency — standing carried by founder ruling, not by a record in this repository' : null)),
      stage: null,
      needs_founder: [],
      last_change: governing ? { date: governing.date, authority: sel.tier === 1 ? 'founder record' : 'programme record', source: governing.path } : (externalSource ? { date: null, authority: 'founder ruling (D-01 rule)', source: externalSource } : { date: null, authority: null, source: null }),
      thread,
      custody: { branch: externalSource ? 'outside this repository' : null, observed_against: opts.observed_against },
      authority: null,
      external: !!externalSource,
      evidence_state,
      precedence: { tier: sel.tier, note: sel.note, conflict: sel.conflict ? sel.conflict.map((c) => c.path) : null, thread_overrides: false, succession: sel.succession || null },
      sources: files.map((f) => f.path).sort(),
      association: files.map((f) => ({ path: f.path, rule: assoc.get(f.path)?.rule, role: assoc.get(f.path)?.role })).sort((a, b) => a.path.localeCompare(b.path)),
      thread_sources: bullets.map((b) => b.path).sort(),
    };
  });

  const counts = { examined: ids.length, emitted: programmes.length, excluded: 0, classified: 0, unclassified: unclassified.length, unreadable: unreadable.length };
  // NOTE: `classified` subjects are documents explicitly categorized as not-a-programme (RM-3); they are reported in the
  // population and do not enter the programme arithmetic (examined counts programme ids).
  const complete = D.complete(counts);
  const population = {
    definition: 'a programme = a hyphenated programme id deterministically associated with at least one subject (R-A0 declaration · R-O1 map-named ops lane · R-A4 map alias · R-A1 filename prefix · R-A2 evidence/<ID>/ · R-F1 family canonical · R-A3/R-A3b/R-A3c thread bullet · R-A5/R-A6 citation) or named external by the D-01 rule; map classifications (RM-3) are examined and are never programmes',
    source: 'docs/programme/**/*.md + CLAUDE.md "Current priority thread" bullets + the docs/ops lanes named by programme-projection-map.v1, read by the projector',
    subjects: { total: subjects.length, files: subjects.filter((s) => s.kind === 'file').length, thread_bullets: subjects.filter((s) => s.kind === 'thread-bullet').length, associated: subjects.length - unclassified.length - unreadable.length - excluded.length },
    examined: counts.examined, emitted: counts.emitted,
    excluded_by_rule: excluded, classified, unclassified, unreadable,
    map: { schema: map.schema, authored: map.authored || null, families: (map.families || []).length, ops_lanes: (map.ops_lanes || []).length, aliases: (map.aliases || []).length, classifications: (map.classifications || []).length },
    complete,
    why_not_complete: complete ? null : `${unclassified.length} subject(s) could not be deterministically associated or classified and ${unreadable.length} could not be read; FD-3 forbids complete:true until every subject is emitted, excluded by rule, or classified`,
  };
  const body = { schema: SCHEMA, projector: PROJECTOR_ID, observed_against: opts.observed_against, presentation_only: true, authority_effect: 'none', rules: RULES, population, programmes };
  const content_hash = createHash('sha256').update(JSON.stringify(body)).digest('hex');
  return { ...body, projected_at, content_hash };
}

export const RULES = Object.freeze({
  'R-A0': 'file: an explicit **Programme:** / **Lane:** declaration naming a well-formed id governs association (B4R1)',
  'R-O1': 'docs/ops: a governed lane enters the population only when the map names its record (B4R1); the directory is never swallowed',
  'R-A4': 'file: a map alias (path pattern → id) with evidence; role supporting unless the map says record (B4R1)',
  'R-F1': 'family: an id matching a map family member_pattern resolves to the family canonical id (B4R1)',
  'R-A5': 'file: a still-unassociated file cited (by docs/programme path) from the standing-bearing records of exactly one programme becomes a supporting record of it; cited by several → unclassified, ambiguity named; a mention by a supporting note, a no-standing record or a thread bullet is not a citation (B4R1)',
  'R-A6': 'file: a still-unassociated file whose own text carries exactly one distinct backticked programme id becomes a supporting record of it (B4R1)',
  'R-A3c': 'thread bullet: exactly one well-formed id in plain text inside the bold title associates; several → unclassified, ambiguity named (B4R1)',
  'RM-3': 'a map classification (path pattern → category, with evidence) marks a subject as examined and explicitly not a programme (B4R1)',
  'R-S1': 'succession: explicit **Supersedes**/**Predecessor** lines naming another same-day record (B4R1)',
  'R-S2': 'succession: a same-day record succeeds only when its first-add commit is a strict Git descendant of every competing first-add commit; wall-clock time never orders succession; same-commit, incomparable or unknown ancestry stays tied (B4R1R1)',
  'R-S3': 'remaining ties stay UNVERIFIED / CONFLICT; act-number order inside one commit is a founder rule (docket PD-1)',
  'R-A1': 'file: programme id = leading hyphenated upper-case token of the filename (e.g. JARVIS-KP-01_ACT5_… → JARVIS-KP-01)',
  'R-A2': 'file under docs/programme/evidence/<ID>/… → <ID>',
  'R-A3': 'thread bullet: first backticked hyphenated id',
  'R-P1': 'tier 1 = filename matches FOUNDER_ADJUDICATION | FOUNDER_RULINGS | _RATIFICATION and carries a **State|Status|Standing|Disposition:** line; newest date governs',
  'R-P2': 'tier 2 = any associated record carrying a **State|Status|Standing|Disposition:** line; newest date governs when no tier-1 record has an extractable standing; a lone record in a tier governs without a date; several records with any undated one are undecidable (UNVERIFIED)',
  'R-P3': 'CLAUDE.md priority thread orients (newest bullet naming the id, newer_act_identified) and never overrides a record',
  'R-P4': 'same tier, same date, different standing text → UNVERIFIED / CONFLICT, both cited, nothing guessed',
  'R-X1': 'external (D-01): a tier-1 file line carrying a backticked id and "EXTERNAL PROTECTED DEPENDENCY"',
  'R-E1': 'no exclusion rules in v1; unassociable subjects stay UNCLASSIFIED and block complete:true',
  'R-C1': 'complete ⇔ 0 unclassified ∧ 0 unreadable ∧ examined = emitted + excluded_by_rule + classified',
});

// ── helpers ───────────────────────────────────────────────────────────────────
/** @param {string} text @returns {string|null} verbatim standing line (PS-1), or null */
export function extractStanding(text) {
  const m = text.match(STANDING_LINE_RE_COLON_INSIDE) || text.match(STANDING_LINE_RE);
  if (!m) return null;
  const v = (m[2] || '').trim();
  return v.length ? v : null;
}
/** @param {string} name */
function dateOf(name) { const m = name.match(DATE_RE); return m ? m[1] : null; }
/** @param {string} root @param {string} p */
function rel(root, p) { return path.relative(root, p).split(path.sep).join('/'); }
/** @param {unknown} e */
function msg(e) { return e instanceof Error ? e.message : String(e); }
