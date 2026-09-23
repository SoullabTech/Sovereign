// @ts-check
/** Defeat candidates for the programme-state projector (B4 + B4R1). Each replaces ONE decision on the same substrate. */
import { DECISIONS, extractStanding } from '../../../scripts/builder/founder-workspace/programme-state-projector.mjs';
import { readdirSync } from 'node:fs';
import path from 'node:path';

export const CANDIDATES = Object.freeze([
  { id: 'DC-P1', kills: 'PJ-3', belief: 'the CLAUDE.md thread is the freshest truth, so it should override a record',
    decisions: { orient: (/** @type {any[]} */ bullets, /** @type {string|null} */ d) => { const o = DECISIONS.orient(bullets, d); return o ? { ...o, overrides: true } : null; } } },
  { id: 'DC-P2', kills: 'PJ-4', belief: 'newest record wins regardless of who authored it',
    decisions: { select: (/** @type {any[]} */ records, /** @type {(s:any)=>number} */ tierOf) => { const c = records.filter((r) => tierOf(r) <= 2 && r.date).sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path)); return c.length ? { governing: c[0], tier: tierOf(c[0]), conflict: null, note: null, succession: null } : { governing: null, tier: null, conflict: null, note: 'none', succession: null }; } } },
  { id: 'DC-P3', kills: 'PJ-5', belief: 'when two same-day records disagree, alphabetical order is as good as any',
    decisions: { select: (/** @type {any[]} */ records, /** @type {(s:any)=>number} */ tierOf) => { for (const t of [1, 2]) { const c = records.filter((r) => tierOf(r) === t && r.date).sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path)); if (c.length) return { governing: c[0], tier: t, conflict: null, note: null, succession: null }; } return { governing: null, tier: null, conflict: null, note: 'none', succession: null }; } } },
  { id: 'DC-P4', kills: 'PJ-6', belief: 'a file that names no programme is noise and can be dropped from the population',
    decisions: { excludeByRule: (/** @type {any} */ s) => (DECISIONS.associate(s) ? null : 'R-E-DROP-NOISE') } },
  { id: 'DC-P5', kills: 'PJ-1', belief: 'standing lines read better once the emoji and emphasis are stripped',
    decisions: { standing: (/** @type {string} */ text) => { const v = extractStanding(text); return v ? v.replace(/[⭐⛔⚠️✅*`·]/g, ' ').replace(/\s+/g, ' ').trim() : null; } } },
  { id: 'DC-P6', kills: 'PJ-2', belief: 'the population is complete enough once every programme has a row',
    decisions: { complete: (/** @type {any} */ n) => n.examined === n.emitted } },

  // ── B4R1 — identity + succession ────────────────────────────────────────────
  { id: 'DC-P7', kills: 'R-A0', belief: 'the filename prefix is the identity; a **Programme:** line inside the file is commentary',
    decisions: { associate: (/** @type {any} */ s, /** @type {any} */ map) => DECISIONS.associate(s.kind === 'file' && s.text ? { ...s, text: s.text.replace(/^\*\*(?:Programme|Program|Lane)\b[^\n]*$/gim, '') } : s, map) } },
  { id: 'DC-P8', kills: 'R-S1', belief: 'a Supersedes line is prose; only dates and commits order records',
    decisions: { succeedBySupersedes: () => null } },
  { id: 'DC-P9', kills: 'R-S2', belief: 'git history is incidental to a document; the projector should not consult it',
    decisions: { succeedByFirstAdd: () => null } },
  { id: 'DC-P10', kills: 'R-S3', belief: 'when two records share a commit, whichever sorts first alphabetically may as well govern',
    decisions: { succeedByFirstAdd: (/** @type {any[]} */ set) => DECISIONS.succeedByFirstAdd(set) || [...set].sort((a, b) => a.path.localeCompare(b.path))[0] } },
  { id: 'DC-P11', kills: 'RM-1', belief: 'a map entry the founder wrote is its own evidence; an evidence list is ceremony',
    /** a lenient loader: accepts every entry, checks only the schema */
    loadMap: (/** @type {string} */ file) => { const m = JSON.parse(require_fs().readFileSync(file, 'utf8')); if (m.schema !== 'programme-projection-map.v1') throw new Error('schema'); return m; } },
  { id: 'DC-P12', kills: 'R-O1', belief: 'docs/ops holds governed work too, so the whole directory belongs in the population',
    readOpts: { opsSelect: (/** @type {any} */ _map, /** @type {string} */ root) => { const d = path.join(root, 'docs/ops'); const names = (() => { try { return readdirSync(d).filter((n) => n.endsWith('.md')); } catch { return /** @type {string[]} */ ([]); } })(); return names.map((n) => ({ path: `docs/ops/${n}`, id: n.replace(/\.md$/, '').replace(/_/g, '-').toUpperCase() })); } } },
  { id: 'DC-P13', kills: 'RM-3', belief: 'a classified document is still a row on the board; give each category its own programme',
    decisions: { associate: (/** @type {any} */ s, /** @type {any} */ map) => { const a = DECISIONS.associate(s, map); if (a) return a; for (const c of map.classifications || []) if (new RegExp(c.match).test(s.path)) return { id: String(c.category).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''), rule: 'category-as-programme', role: /** @type {'record'} */ ('record') }; return null; } } },
  { id: 'DC-P14', kills: 'R-A4s', belief: 'an aliased record is a record; if it carries a standing line it may govern',
    decisions: { associate: (/** @type {any} */ s, /** @type {any} */ map) => { const a = DECISIONS.associate(s, map); return a && a.rule === 'R-A4 map alias' ? { ...a, role: /** @type {'record'} */ ('record') } : a; } } },
  { id: 'DC-P16', kills: 'R-A5n', belief: 'any record that names a file path is citing it, so the mention is enough to associate the file',
    /** the candidate credits citations from every associated subject — notes, bullets and supporting records included — by re-deriving citedBy itself */
    decisions: { associateByCitation: (/** @type {any} */ s, /** @type {Map<string, Set<string>>} */ citedBy, /** @type {any} */ ctx) => { const wide = ctx?.citedByAll || citedBy; return DECISIONS.associateByCitation(s, wide); } } },
  { id: 'DC-P15', kills: 'R-C1', belief: 'one leftover unclassified file should not hold the whole board at complete:false',
    decisions: { complete: (/** @type {any} */ n) => n.unclassified <= 1 && n.unreadable === 0 && n.examined === n.emitted + n.excluded + n.classified } },
  { id: 'DC-P17', kills: 'R-PD4', belief: 'act-shaped ids look official enough to promote before governance identifies their parent',
    decisions: { classify: (/** @type {any} */ s, /** @type {any} */ map, /** @type {number} */ n, /** @type {any} */ phase) => phase === 'pre-association' ? null : DECISIONS.classify(s, map, n, phase) } },
  { id: 'DC-P18', kills: 'R-G1', belief: 'plain prose like standing is CLOSED is close enough to a formal standing declaration',
    decisions: {
      tier: (/** @type {any} */ s) => { const t = DECISIONS.tier(s); return t === 3 && /\bstanding\s+is\s+[A-Z]/i.test(s.text || '') ? 2 : t; },
      standing: (/** @type {string} */ text) => DECISIONS.standing(text) || (text.match(/\bstanding\s+is\s+([A-Z][A-Z _-]*)/i)?.[1]?.trim() || null),
    } },
]);

function require_fs() { return /** @type {typeof import('node:fs')} */ (/** @type {any} */ (process).getBuiltinModule('node:fs')); }
