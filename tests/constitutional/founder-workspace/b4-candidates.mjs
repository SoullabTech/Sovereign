// @ts-check
/** Defeat candidates for the programme-state projector (B4). Each replaces ONE decision on the same substrate. */
import { DECISIONS, extractStanding } from '../../../scripts/builder/founder-workspace/programme-state-projector.mjs';

export const CANDIDATES = Object.freeze([
  { id: 'DC-P1', kills: 'PJ-3', belief: 'the CLAUDE.md thread is the freshest truth, so it should override a record',
    decisions: { orient: (/** @type {any[]} */ bullets, /** @type {string|null} */ d) => { const o = DECISIONS.orient(bullets, d); return o ? { ...o, overrides: true } : null; } } },
  { id: 'DC-P2', kills: 'PJ-4', belief: 'newest record wins regardless of who authored it',
    decisions: { select: (/** @type {any[]} */ records, /** @type {(s:any)=>number} */ tierOf) => { const c = records.filter((r) => tierOf(r) <= 2 && r.date).sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path)); return c.length ? { governing: c[0], tier: tierOf(c[0]), conflict: null, note: null } : { governing: null, tier: null, conflict: null, note: 'none' }; } } },
  { id: 'DC-P3', kills: 'PJ-5', belief: 'when two same-day records disagree, alphabetical order is as good as any',
    decisions: { select: (/** @type {any[]} */ records, /** @type {(s:any)=>number} */ tierOf) => { for (const t of [1, 2]) { const c = records.filter((r) => tierOf(r) === t && r.date).sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path)); if (c.length) return { governing: c[0], tier: t, conflict: null, note: null }; } return { governing: null, tier: null, conflict: null, note: 'none' }; } } },
  { id: 'DC-P4', kills: 'PJ-6', belief: 'a file that names no programme is noise and can be dropped from the population',
    decisions: { excludeByRule: (/** @type {any} */ s) => (DECISIONS.associate(s) ? null : 'R-E-DROP-NOISE') } },
  { id: 'DC-P5', kills: 'PJ-1', belief: 'standing lines read better once the emoji and emphasis are stripped',
    decisions: { standing: (/** @type {string} */ text) => { const v = extractStanding(text); return v ? v.replace(/[⭐⛔⚠️✅*`·]/g, ' ').replace(/\s+/g, ' ').trim() : null; } } },
  { id: 'DC-P6', kills: 'PJ-2', belief: 'the population is complete enough once every programme has a row',
    decisions: { complete: (/** @type {any} */ n) => n.examined === n.emitted } },
]);
