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

export const SCHEMA = 'programme-state.v1';
export const PROJECTOR_ID = 'founder-workspace/programme-state-projector@1';

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
 * @typedef {{ id: string, kind: 'file'|'thread-bullet', path: string, text: string|null, error: string|null, date: string|null }} Subject
 */

// ── gather (fs) ───────────────────────────────────────────────────────────────

/**
 * Read the governed population. The only fs code in this module.
 * @param {{ root: string, programmeDir?: string, claudeMd?: string }} opts
 * @returns {{ subjects: Subject[], root: string }}
 */
export function readTree(opts) {
  const root = opts.root;
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
  return { subjects, root };
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
  /** R-A1/R-A2/R-A3: associate a subject with a programme id, or null. @param {Subject} s @returns {string|null} */
  associate(s) {
    if (s.kind === 'thread-bullet') {
      const m = s.text ? s.text.match(/`([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)(?:[ /`·]|$)/) : null;
      return m ? m[1] : null;
    }
    const parts = s.path.split('/');
    const base = parts[parts.length - 1];
    if (parts.length >= 4 && parts[2] === 'evidence' && ID_RE.test(parts[3])) return parts[3]; // docs/programme/evidence/<ID>/...
    const m = base.match(FILENAME_ID_RE);
    return m ? m[1] : null;
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
   * @returns {{ governing: Subject|null, tier: number|null, conflict: Subject[]|null, note: string|null }}
   */
  select(records, tierOf) {
    for (const tier of [1, 2]) {
      const all = records.filter((r) => tierOf(r) === tier);
      if (all.length === 0) continue;
      if (all.length === 1) return { governing: all[0], tier, conflict: null, note: null }; // one record needs no ordering
      if (all.some((r) => r.date === null)) return { governing: null, tier, conflict: null, note: `${all.length} tier-${tier} records and at least one carries no date in its filename; newest-first is undecidable` };
      const cands = all.sort((a, b) => /** @type {string} */ (b.date).localeCompare(/** @type {string} */ (a.date)) || a.path.localeCompare(b.path));
      const top = cands[0];
      const sameDay = cands.filter((r) => r.date === top.date);
      const standings = new Set(sameDay.map((r) => extractStanding(r.text || '') || ''));
      if (standings.size > 1) return { governing: null, tier, conflict: sameDay, note: `${sameDay.length} tier-${tier} records dated ${top.date} carry different standing lines` };
      return { governing: top, tier, conflict: null, note: null };
    }
    return { governing: null, tier: null, conflict: null, note: 'no standing record' };
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
 * @param {{ subjects: Subject[] }} tree
 * @param {{ observed_against: string, projected_at?: string, decisions?: Partial<typeof DECISIONS> }} opts
 */
export function project(tree, opts) {
  const D = { ...DECISIONS, ...(opts.decisions || {}) };
  const projected_at = opts.projected_at || new Date().toISOString();
  const subjects = [...tree.subjects].sort((a, b) => a.path.localeCompare(b.path));
  /** @type {Map<string, Subject[]>} */ const byId = new Map();
  /** @type {{path:string, kind:string, reason:string}[]} */ const unclassified = [];
  /** @type {{path:string, error:string}[]} */ const unreadable = [];
  /** @type {{path:string, rule:string}[]} */ const excluded = [];
  for (const s of subjects) {
    if (s.error) { unreadable.push({ path: s.path, error: s.error }); continue; }
    const rule = D.excludeByRule(s);
    if (rule) { excluded.push({ path: s.path, rule }); continue; }
    const id = D.associate(s);
    if (!id) { unclassified.push({ path: s.path, kind: s.kind, reason: s.kind === 'file' ? 'filename carries no hyphenated programme id (R-A1) and is not under evidence/<ID>/ (R-A2)' : 'thread bullet names no backticked programme id (R-A3)' }); continue; }
    if (!byId.has(id)) byId.set(id, []);
    /** @type {Subject[]} */ (byId.get(id)).push(s);
  }
  const externals = D.externals(subjects.filter((s) => s.kind === 'file' && !s.error));
  for (const id of externals.keys()) if (!byId.has(id)) byId.set(id, []);

  const ids = [...byId.keys()].sort();
  const programmes = ids.map((id) => {
    const all = /** @type {Subject[]} */ (byId.get(id));
    const files = all.filter((s) => s.kind === 'file');
    const bullets = all.filter((s) => s.kind === 'thread-bullet');
    const sel = D.select(files, D.tier);
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
      precedence: { tier: sel.tier, note: sel.note, conflict: sel.conflict ? sel.conflict.map((c) => c.path) : null, thread_overrides: false },
      sources: files.map((f) => f.path).sort(),
      thread_sources: bullets.map((b) => b.path).sort(),
    };
  });

  const counts = { examined: ids.length, emitted: programmes.length, excluded: 0, classified: 0, unclassified: unclassified.length, unreadable: unreadable.length };
  const complete = D.complete(counts);
  const population = {
    definition: 'a programme = a hyphenated programme id deterministically associated with at least one subject (R-A1 filename prefix · R-A2 evidence/<ID>/ · R-A3 backticked id in a thread bullet) or named external by the D-01 rule',
    source: 'docs/programme/**/*.md + CLAUDE.md "Current priority thread" bullets, read by the projector',
    subjects: { total: subjects.length, files: subjects.filter((s) => s.kind === 'file').length, thread_bullets: subjects.filter((s) => s.kind === 'thread-bullet').length, associated: subjects.length - unclassified.length - unreadable.length - excluded.length },
    examined: counts.examined, emitted: counts.emitted,
    excluded_by_rule: excluded, classified: [], unclassified, unreadable,
    complete,
    why_not_complete: complete ? null : `${unclassified.length} subject(s) could not be deterministically associated with a programme and ${unreadable.length} could not be read; FD-3 forbids complete:true until every subject is emitted, excluded by rule, or classified`,
  };
  const body = { schema: SCHEMA, projector: PROJECTOR_ID, observed_against: opts.observed_against, presentation_only: true, authority_effect: 'none', rules: RULES, population, programmes };
  const content_hash = createHash('sha256').update(JSON.stringify(body)).digest('hex');
  return { ...body, projected_at, content_hash };
}

export const RULES = Object.freeze({
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
