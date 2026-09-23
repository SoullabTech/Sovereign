// @ts-check
/**
 * Pure adapters: governed organ outputs → founder-workspace-viewmodel.v1 (B2).
 * JARVIS-FOUNDER-WORKSPACE-01 / B2.
 *
 *   governed organs → pure/read-only adapters → viewmodel.v1 → five surfaces   (FD-1)
 *
 * No fs, no process, no network. Every adapter is a function of its inputs.
 * Laws embodied here (each with a defeat candidate in the B2 matrix):
 *   AL-1  a live composition REFUSES any ILLUSTRATIVE object (VM-5 at the seam, not only at render)
 *   AL-2  an organ state the adapter does not recognise renders `unobserved`, never `good` (no false calm)
 *   AL-3  every unreadable organ object becomes a visible row (never dropped)
 *   AL-4  every monitor row names the instrument that observed it and the time it was observed
 *   AL-5  the composer carries no count; population is the one lawful exception (VM-7)
 */
import { assertViewModel, SCHEMA } from './viewmodel-v1.mjs';

/** @param {unknown} s */ const str = (s) => (typeof s === 'string' ? s : s == null ? '' : String(s));
/** @param {unknown} s */ const nonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

// ── status probe → workspace + monitor ────────────────────────────────────────

/** Organ keys of the `jarvis:status` probe (F2 §2, verified) and their plain names. */
export const STATUS_ORGANS = Object.freeze({
  builder_os: 'Builder OS',
  route_a: 'Route A (deterministic lane)',
  local_worker: 'Local model worker (Ollama)',
  memory_postgres: 'Memory (Postgres)',
  production: 'Production (minisforum)',
  claude_lane: 'Claude lane',
  frontier_reasoner: 'Frontier reasoner',
  continuity: 'Continuity',
  builder_mechanism: 'Builder execution mechanism',
  desktop_runtime: 'Desktop runtime',
});

/**
 * Map an organ state word to a monitor level. Fail-closed: unknown → unobserved.
 * @param {unknown} state
 * @returns {'good'|'warn'|'failed'|'unobserved'|'unauthorized'}
 */
export function levelOf(state) {
  const s = str(state).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (['AVAILABLE', 'READY', 'BOUND', 'OK', 'HEALTHY', 'REACHABLE', 'CLEAN'].includes(s)) return 'good';
  if (['DEGRADED', 'WARN', 'WARNING', 'STALE', 'DIRTY'].includes(s)) return 'warn';
  if (['UNREACHABLE', 'FAULT', 'DESKTOP_FAULT', 'FAILED', 'ERROR', 'BROKEN'].includes(s)) return 'failed';
  if (['NOT_PROBED', 'BY_DESIGN', 'UNAUTHORIZED', 'NOT_PERMITTED', 'REFUSED'].includes(s)) return 'unauthorized';
  return 'unobserved';
}

/** @param {'good'|'warn'|'failed'|'unobserved'|'unauthorized'} level @param {string} name @param {string} detail */
function plainFor(level, name, detail) {
  const d = nonEmpty(detail) ? ` ${detail.trim().replace(/\.$/, '')}.` : '';
  switch (level) {
    case 'good': return `${name} is available.${d}`;
    case 'warn': return `${name} needs care.${d}`;
    case 'failed': return `${name} is not working.${d}`;
    case 'unauthorized': return `${name} is not observed from this workspace, by design.${d}`;
    default: return `${name} has not been observed.${d}`;
  }
}

/**
 * @param {any} status  the `jarvis:status` probe result (or null when absent)
 * @returns {{ meta_workspace: any, monitor: any[], provenance: any }}
 */
export function adaptStatus(status) {
  const observed_at = nonEmpty(status?.observed_at) ? status.observed_at : null;
  const instrument = 'jarvis:status probe (jarvis-desktop/src/main.js)';
  /** @type {any[]} */ const monitor = [];
  if (!status || typeof status !== 'object') {
    monitor.push({ group: 'This workspace', subject: 'Status probe', axis: 'availability', value: 'absent', plain: 'JARVIS has not observed this workspace yet.', level: 'unobserved', instrument, observed_at: null, freshness: 'none', evidence_state: 'UNOBSERVED' });
    return { meta_workspace: { evidence_state: 'UNOBSERVED' }, monitor, provenance: { artifact: { app_build_sha: null, evidence_state: 'UNOBSERVED' }, substrate: { head: null, branch: null, evidence_state: 'UNOBSERVED' }, rule: PROVENANCE_RULE } };
  }
  const ws = status.workspace || {};
  const freshness = observed_at ? 'current' : 'none';
  const checkoutLevel = ws.root ? (ws.clean === false ? 'warn' : ws.clean === true ? 'good' : 'unobserved') : 'failed';
  monitor.push({
    group: 'This workspace', subject: 'Checkout', axis: 'branch / head / clean',
    value: ws.root ? `${str(ws.branch) || '?'} · ${str(ws.head).slice(0, 8) || '?'} · ${ws.clean === true ? 'clean' : ws.clean === false ? 'dirty' : 'unknown'}` : 'not bound',
    plain: ws.root ? (ws.clean === true ? 'Your working copy is clean.' : ws.clean === false ? 'Your working copy has uncommitted changes.' : 'Whether your working copy is clean was not observed.') : 'JARVIS is not bound to a checkout, so nothing below can be trusted.',
    level: freshness === 'none' && checkoutLevel === 'good' ? 'unobserved' : checkoutLevel,
    instrument: 'git rev-parse / git status --porcelain (Desktop status probe, main.js)', observed_at, freshness, evidence_state: observed_at ? 'OBSERVED' : 'UNOBSERVED',
  });
  for (const [key, name] of Object.entries(STATUS_ORGANS)) {
    const organ = status[key];
    if (organ === undefined) continue;
    const state = organ && typeof organ === 'object' ? organ.state : organ;
    let level = levelOf(state);
    if (freshness === 'none' && level === 'good') level = 'unobserved';
    const detail = organ && typeof organ === 'object' ? str(organ.detail) : '';
    monitor.push({
      group: key === 'production' ? 'Production' : 'JARVIS organs', subject: name, axis: 'state',
      value: str(state) || 'unknown', plain: plainFor(level, name, detail), level,
      instrument, observed_at, freshness, evidence_state: level === 'unauthorized' ? 'DELIBERATELY REFUSED' : observed_at ? (level === 'unobserved' ? 'UNVERIFIED' : 'OBSERVED') : 'UNOBSERVED',
    });
  }
  const holds = Array.isArray(status.governance_holds) ? status.governance_holds : [];
  for (const h of holds) monitor.push({ group: 'Governance', subject: str(h?.id || h?.name || 'hold'), axis: 'hold', value: str(h?.state || 'active'), plain: str(h?.detail || h?.plain || 'A governance hold is in force.'), level: 'warn', instrument, observed_at, freshness, evidence_state: observed_at ? 'OBSERVED' : 'UNOBSERVED' });
  return {
    meta_workspace: { repo: str(ws.repo || ws.name || ''), path: str(ws.root || ''), branch: str(ws.branch || ''), head: str(ws.head || ''), clean: ws.clean ?? null, resolved_by: str(ws.resolved_by || ws.source || ''), evidence_state: observed_at ? 'OBSERVED' : 'UNOBSERVED' },
    monitor,
    provenance: {
      artifact: { app_build_sha: status.desktop_runtime?.app_build_sha ?? status.provenance?.artifact?.app_build_sha ?? null, evidence_state: status.desktop_runtime?.app_build_sha ? 'OBSERVED' : 'UNOBSERVED' },
      substrate: { head: str(ws.head || '') || null, branch: str(ws.branch || '') || null, evidence_state: ws.head ? 'OBSERVED' : 'UNOBSERVED' },
      rule: PROVENANCE_RULE,
    },
  };
}
const PROVENANCE_RULE = 'Which JARVIS is this? = the artifact that is running · which substrate = the checkout it is bound to. The two are distinct identities and are never merged.';

// ── work units ────────────────────────────────────────────────────────────────

const STATE_PLAIN = Object.freeze({
  DRAFT: 'Drafted, not yet bound to a checkout',
  BOUND: 'Bound to a checkout; scope fixed',
  ROUTED: 'Route chosen; nothing has run',
  EXECUTING: 'Running under a one-time authority',
  EVIDENCE_READY: 'Finished running; evidence is ready for your judgement',
  ADJUDICATED: 'You have ruled on it',
  CLOSED: 'Closed',
});

/**
 * @param {import('./read-organs.mjs').Unreadable} u @param {string} kind
 */
export function unreadableRow(u, kind) {
  return { id: `unreadable:${u.file}`, title: `Unreadable ${kind}`, plain: `JARVIS found a ${kind} it could not read (${u.error}). It is shown so nothing is hidden.`, state: 'UNREADABLE', state_plain: 'Could not be read', file: u.file, evidence_state: 'UNREADABLE' };
}

/** @param {Awaited<ReturnType<import('./read-organs.mjs').listWorkUnitsV2>>} listing */
export function adaptUnits(listing) {
  /** @type {any[]} */ const units = [];
  for (const u of listing.units) {
    const s = u.status;
    const id = s.work_unit_id || u.id;
    const state = str(s.lifecycle?.state) || 'UNKNOWN';
    const transitions = Array.isArray(s.lifecycle?.transitions) ? s.lifecycle.transitions : [];
    const last = transitions.length ? transitions[transitions.length - 1] : null;
    const nextActions = Array.isArray(s.next_actions) ? s.next_actions : [];
    units.push({
      id,
      title: str(s.authorized_core?.identity?.objective) || id,
      plain: `${STATE_PLAIN[/** @type {keyof typeof STATE_PLAIN} */ (state)] || `In state ${state}`}.`,
      state,
      state_plain: STATE_PLAIN[/** @type {keyof typeof STATE_PLAIN} */ (state)] || 'State not recognised by this workspace',
      work_class: str(s.authorized_core?.identity?.work_class) || null,
      evidence_class: str(s.authorized_core?.custody?.evidence_class) || null,
      routing_posture: str(s.authorized_core?.routing_request?.posture ?? s.authorized_core?.routing_request?.requested_posture) || null,
      authority: s.authorized_core?.authority ?? null,
      route: s.routing ? `${str(s.routing.route_source) || 'route'} · ${s.routing.execution_connected ? 'execution connected' : 'not connected'}` : 'not routed yet',
      last_event: last ? `${str(last.at || last.recorded_at || '')} · ${str(last.from || '')}→${str(last.to || '')}`.trim() : (u.file_mtime ? `file modified ${u.file_mtime}` : 'no transition recorded'),
      needs_founder: nextActions.filter((/** @type {any} */ a) => a && typeof a === 'object').map((/** @type {any} */ a) => ({ what: str(a.label || a.action), action: str(a.action) })),
      programme: str(s.authorized_core?.identity?.programme) || null,
      file: u.file,
      evidence_state: 'OBSERVED',
    });
  }
  for (const u of listing.unreadable) units.push(unreadableRow(u, 'Work Unit'));
  return units;
}

/** @param {ReturnType<import('./read-organs.mjs').listRunsReadOnly>} runs */
export function adaptRuns(runs) {
  /** @type {any[]} */ const history = [];
  for (const r of runs.runs) {
    const run = r.run || {};
    history.push({ id: str(run.run_id) || r.file, kind: 'run', title: str(run.work_unit_id) ? `Run for ${run.work_unit_id}` : 'Run', plain: `A ${str(run.execution_lane || run.lane) || 'runtime'} run ${str(run.state) ? `ended in state ${run.state}` : 'was recorded'}.`, state: str(run.state) || 'unknown', at: str(run.created_at) || r.file_mtime, work_unit_id: str(run.work_unit_id) || null, file: r.file, evidence_state: 'OBSERVED' });
  }
  for (const u of runs.unreadable) history.push({ ...unreadableRow(u, 'run'), kind: 'run', at: null });
  return history;
}

/** @param {ReturnType<import('./read-organs.mjs').readEventsTail>} ev */
export function adaptEvents(ev) {
  /** @type {any[]} */ const events = [];
  for (const e of ev.entries) events.push({ at: str(e.event?.at) || null, kind: str(e.event?.event || e.event?.kind || e.event?.type) || 'event', text: summarizeEvent(e.event), source: `${ev.file}:${e.line_no}`, evidence_state: 'OBSERVED' });
  for (const u of ev.unreadable) events.push({ at: null, kind: 'unreadable', text: `An event line could not be read (${u.error}).`, source: u.file, evidence_state: 'UNREADABLE' });
  return events;
}
/** @param {any} e */
function summarizeEvent(e) {
  if (!e || typeof e !== 'object') return 'event';
  const parts = [];
  for (const k of ['event', 'kind', 'type', 'run_id', 'work_unit_id', 'lane', 'state', 'reason']) if (nonEmpty(e[k])) parts.push(`${k}=${e[k]}`);
  return parts.join(' · ') || 'event';
}

/** @param {ReturnType<import('./read-organs.mjs').listSessions>} sessions */
export function adaptSessions(sessions) {
  /** @type {any[]} */ const handoffs = [];
  for (const s of sessions.sessions) {
    const rec = s.session || {};
    const state = str(rec.state) || 'unknown';
    handoffs.push({ id: str(rec.session_id) || s.file, title: str(rec.purpose || rec.work_unit || rec.work_unit_id) || 'Session', plain: state === 'handed-off' ? 'This session was handed off and can be picked up.' : state === 'paused' ? 'This session is paused.' : state === 'active' || state === 'queued' ? 'This session is open.' : `This session is ${state}.`, state, branch: str(rec.branch) || null, worktree: str(rec.worktree) || null, opened_at: str(rec.opened_at) || null, closed_at: str(rec.closed_at) || null, last_heartbeat: str(rec.last_heartbeat) || null, file: s.file, evidence_state: 'OBSERVED' });
  }
  for (const u of sessions.unreadable) handoffs.push({ ...unreadableRow(u, 'session'), state: 'UNREADABLE' });
  return handoffs;
}

/** @param {ReturnType<import('./read-organs.mjs').listResults>} results */
export function adaptResults(results) {
  /** @type {any[]} */ const out = [];
  for (const r of results.results) out.push({ id: r.work_unit_id, title: `Result for ${r.work_unit_id}`, plain: `A result was recorded for ${r.work_unit_id}${nonEmpty(r.result?.lane) ? ` on the ${r.result.lane} lane` : ''}.`, at: r.file_mtime, file: r.file, reveal: r.file, evidence_state: 'OBSERVED' });
  for (const u of results.unreadable) out.push({ ...unreadableRow(u, 'result'), at: null, reveal: u.file });
  return out;
}

// ── composer ─────────────────────────────────────────────────────────────────

/** programme_state when no projector exists (B4 not built). Honest by construction. @param {string} observed_against @param {string} projected_at */
export function absentProgrammeState(observed_against, projected_at) {
  return { schema: 'programme-state.v1', projected_at, observed_against, projector: 'absent', population: { examined: 0, emitted: 0, complete: false, why_not_complete: 'no deterministic projector exists yet (B4 not built); nothing was examined' }, programmes: [] };
}

/**
 * Compose a LIVE view-model. Throws on any law violation (AL-1: ILLUSTRATIVE refused at the seam).
 * @param {{ status?: any, organs: Awaited<ReturnType<import('./read-organs.mjs').readAllOrgans>>, observed_against: string, programme_state?: any, graph?: any, vocabularies?: any[], now?: string }} input
 */
export function composeViewModel(input) {
  const now = nonEmpty(input.now) ? /** @type {string} */ (input.now) : new Date().toISOString();
  const st = adaptStatus(input.status ?? null);
  const organs = input.organs;
  const organRows = [
    organRow('Work Units store', organs.units, 'listWorkUnitsV2 (read-only, founder-workspace/read-organs.mjs)'),
    organRow('Run history', organs.runs, 'listRunsReadOnly (read-only)'),
    organRow('Event log', organs.events, 'readEventsTail (read-only)'),
    organRow('Sessions', organs.sessions, 'listSessions (read-only)'),
    organRow('Session governor report', organs.governor, 'session.mjs report --json (presence-gated wrapper)'),
    organRow('Results', organs.results, 'listResults (read-only)'),
  ];
  const vm = {
    schema: SCHEMA,
    presentation_only: true,
    authority_effect: 'none',
    meta: { observed_against: input.observed_against, observed_at: now, ain_home: organs.home, workspace: st.meta_workspace },
    programme_state: input.programme_state ?? absentProgrammeState(input.observed_against, now),
    work: {
      units: adaptUnits(organs.units),
      history: adaptRuns(organs.runs),
      handoffs: adaptSessions(organs.sessions),
      results: adaptResults(organs.results),
      governor: organs.governor.report ? { ...stripCounts(organs.governor.report), instrument: 'session.mjs report --json', observed_at: organs.governor.observed_at } : null,
      adjudication_note: 'Yes is the only governed gesture (W0.v2 requires decision === accepted). A governed No is owed to JARVIS-WORK-UNIT-01 (OE-2); this workspace does not fabricate it.',
    },
    monitor: [...st.monitor, ...organRows],
    graph: input.graph ?? { nodes: [], edges: [] },
    provenance: st.provenance,
    vocabularies: Array.isArray(input.vocabularies) ? input.vocabularies : [],
    events: adaptEvents(organs.events),
  };
  assertViewModel(vm, { mode: 'live' });
  return vm;
}

/** A monitor row for a read organ: present / absent / partly unreadable. @param {string} name @param {any} organ @param {string} instrument */
function organRow(name, organ, instrument) {
  const unreadable = Array.isArray(organ?.unreadable) ? organ.unreadable.length : 0;
  const where = str(organ?.dir || organ?.file || '');
  if (!organ?.present) return { group: 'JARVIS state', subject: name, axis: 'presence', value: 'absent', plain: `${name}: nothing recorded yet${where ? ` (${where} does not exist)` : ''}. Nothing was created to find that out.`, level: 'unobserved', instrument, observed_at: str(organ?.observed_at) || null, freshness: str(organ?.observed_at) ? 'current' : 'none', evidence_state: 'ABSENT' };
  if (unreadable > 0) return { group: 'JARVIS state', subject: name, axis: 'readability', value: 'partly unreadable', plain: `${name}: some objects could not be read; they are listed, not hidden.`, level: 'warn', instrument, observed_at: str(organ.observed_at), freshness: 'current', evidence_state: 'PARTIAL' };
  return { group: 'JARVIS state', subject: name, axis: 'presence', value: 'present', plain: `${name}: readable.`, level: 'good', instrument, observed_at: str(organ.observed_at), freshness: 'current', evidence_state: 'OBSERVED' };
}

/** The governor report carries counts by design; the view-model may not (VM-7). Keep only its non-count facts. @param {any} rep */
function stripCounts(rep) {
  const keep = {};
  for (const [k, v] of Object.entries(rep || {})) if (typeof v !== 'number' && !/count|total/i.test(k)) /** @type {any} */ (keep)[k] = v;
  return keep;
}
