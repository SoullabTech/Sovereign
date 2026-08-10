'use strict';
/**
 * JARVIS Unit 12 — bounded command composer (§4)
 *
 * The Desktop's command surface answers one question: "What do you want JARVIS
 * to do?" — and it answers it from a CLOSED set of reconnaissance templates.
 *
 * Why templates rather than a free text box: the runtime only produces evidence
 * for claims it can bind to SHA-anchored source fragments. A bare objective with
 * no context_selectors materializes no fragments, and every such run terminates
 * ESCALATION_REQUIRED / EVIDENCE_INSUFFICIENT. A bounded composer is therefore
 * not a UI convenience; it is what makes a Desktop-submitted run capable of
 * being verified at all.
 *
 * This module builds a packet. It does NOT validate one — validatePacket and
 * checkAuthority are runtime responsibilities and the runtime remains free to
 * refuse anything built here (§1).
 */

/** The only lane the Unit 11 runtime accepts, and it is READ-ONLY (§4). */
const READ_ONLY_LANE = 'local-native';
const DEFAULT_AUTHORITY = 'READ_ONLY';

/** Mirrors the runtime's own list; used to refuse write requests before submit. */
const WRITE_REQUESTING_KEYS = [
  'allow_write', 'requested_write_authority', 'write_authority',
  'permission_mode', 'repo_write_scope', 'worker_authority',
];

const WORK_UNIT_ID_RE = /^[a-z0-9][a-z0-9-]{2,63}$/;

/**
 * Facts every worker is told. These are authority and method statements, never
 * answers — the packet guard refuses a packet that names the lines the worker is
 * supposed to discover, so nothing here may contain a file:line reference.
 */
const BASE_ESTABLISHED_FACTS = [
  'Your authority is READ-ONLY. Make no edits, writes, installs, commits, or network calls.',
  'The MATERIALIZED CONTEXT block is your only evidence. You have no tools and cannot open files.',
  "The gutter number on each line is that line's absolute position in its file. Cite only numbers you can read in the gutter.",
];

const BASE_ESCALATION_CONDITIONS = [
  'If the supplied context does not contain enough evidence to answer, say so and escalate rather than guessing.',
  'If a claim cannot be supported by a line you can actually read in the gutter, escalate instead of citing it.',
];

/**
 * Bounded repository-reconnaissance templates. Each carries its own SHA-bound
 * context selectors — the operator supplies intent, never file paths or lines.
 */
const TEMPLATES = [
  {
    id: 'provider-trace',
    label: 'Provider path trace',
    summary: 'Trace the live MAIA text-model provider path from the sovereign route to its provider-selection layer.',
    objective:
      'Trace the live MAIA text-model provider path from the sovereign MAIA route to its ' +
      'provider-selection layer and return exact file:line evidence. READ-ONLY. Do not modify anything.',
    expected_output:
      'A short structured report: LIVE ENTRY POINT (file:line), CALL CHAIN, PROVIDER SELECTION ' +
      '(file:line + function name), EVIDENCE (file:line per claim), FAILURES, UNKNOWNS.',
    context_selectors: [
      { ref: 'app/api/sovereign/app/maia/list/route.ts', why: 'the exported HTTP handler for this route, located structurally',
        selector: { type: 'anchor', find: 'export async function POST', mode: 'lines', after: 6 } },
      { ref: 'app/api/sovereign/app/maia/list/route.ts', why: 'how this route obtains its response-producing service',
        selector: { type: 'anchor', find: "from '@/lib/sovereign/maiaService'", mode: 'lines', after: 0 } },
      { ref: 'lib/sovereign/maiaService.ts', why: 'how this service obtains text generation',
        selector: { type: 'anchor', find: "from '../ai/modelService'", mode: 'lines', after: 0 } },
      { ref: 'lib/ai/modelService.ts', why: 'the exported text-generation entry declaration and its opening body',
        selector: { type: 'anchor', find: 'export async function generateText', mode: 'lines', after: 20 } },
      { ref: 'lib/ai/modelService.ts', why: 'the module-level constant that governs which backend is used',
        selector: { type: 'anchor', find: 'export const TEXT_MODEL_PROVIDER', mode: 'lines', after: 2 } },
    ],
  },
  {
    id: 'evidence-boundary-trace',
    label: 'Evidence boundary trace',
    summary: "Trace how JARVIS bounds what a worker is shown and how it lints a packet for answer leakage.",
    objective:
      'Trace how the JARVIS context layer bounds the material a worker is shown, and how a work ' +
      'packet is linted for answer leakage before dispatch. Return exact file:line evidence. ' +
      'READ-ONLY. Do not modify anything.',
    expected_output:
      'A short structured report: CONTEXT MATERIALIZATION (file:line), BUDGET GATE (file:line), ' +
      'LEAKAGE LINT (file:line + rule names), EVIDENCE (file:line per claim), FAILURES, UNKNOWNS.',
    context_selectors: [
      { ref: 'scripts/builder/jarvis-context.mjs', why: 'how a single selector becomes a bounded fragment',
        selector: { type: 'anchor', find: 'export function materializeOne', mode: 'lines', after: 18 } },
      { ref: 'scripts/builder/jarvis-context.mjs', why: 'the gate that decides whether the selected evidence fits the worker',
        selector: { type: 'anchor', find: 'export function budget', mode: 'lines', after: 16 } },
      { ref: 'scripts/builder/jarvis-packet-guard.mjs', why: 'the lint that decides whether a packet leaks its own answer',
        selector: { type: 'anchor', find: 'export function lintLeakage', mode: 'lines', after: 24 } },
    ],
  },
];

function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}

/**
 * Derive a schema-legal work_unit_id from a template and a run nonce.
 * @param {string} templateId
 * @param {string} nonce caller-supplied (the Desktop uses a timestamp) so this
 *   function stays pure and testable.
 */
function workUnitId(templateId, nonce) {
  const raw = `desk-${templateId}-${nonce}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 64);
  return raw.replace(/-+$/, '');
}

/**
 * Refuse write authority at the composer, before the runtime ever sees it (§4).
 * The runtime refuses it too — this is defence in depth, and it lets the Desktop
 * say AUTHORITY REQUIRED without a round trip.
 * @throws {Error} code LOCAL_WRITE_AUTHORITY_REFUSED
 */
function assertReadOnly(input = {}) {
  if (input.authority && input.authority !== DEFAULT_AUTHORITY) {
    const e = new Error(`LOCAL_WRITE_AUTHORITY_REFUSED: Desktop Alpha submits ${DEFAULT_AUTHORITY} work only; ` +
      `got authority '${input.authority}'.`);
    e.code = 'LOCAL_WRITE_AUTHORITY_REFUSED';
    throw e;
  }
  for (const k of WRITE_REQUESTING_KEYS) {
    if (k in input) {
      const e = new Error(`LOCAL_WRITE_AUTHORITY_REFUSED: field '${k}' requests write authority. ` +
        'The Desktop command surface cannot grant it.');
      e.code = 'LOCAL_WRITE_AUTHORITY_REFUSED';
      throw e;
    }
  }
  return true;
}

/**
 * Build a READ-ONLY work packet from a template plus an operator objective.
 *
 * @param {object} input
 * @param {string} input.templateId  one of TEMPLATES[].id
 * @param {string} [input.objective] operator text; falls back to the template's
 * @param {string} input.canonicalSha the runtime's own reported version (§12) —
 *   never read from the filesystem by the Desktop
 * @param {string} input.nonce
 * @returns {object} a packet for POST /runs
 */
function buildPacket(input = {}) {
  assertReadOnly(input);
  const tpl = getTemplate(input.templateId);
  if (!tpl) {
    const e = new Error(`UNKNOWN_TEMPLATE: '${input.templateId}'. Desktop Alpha submits bounded templates only.`);
    e.code = 'UNKNOWN_TEMPLATE';
    throw e;
  }
  const sha = String(input.canonicalSha ?? '').trim();
  if (!/^[0-9a-f]{7,40}$/.test(sha)) {
    const e = new Error(`CANONICAL_SHA_UNAVAILABLE: the runtime did not report a usable repository version ('${sha}').`);
    e.code = 'CANONICAL_SHA_UNAVAILABLE';
    throw e;
  }
  const objective = String(input.objective ?? tpl.objective).trim() || tpl.objective;
  const wuid = workUnitId(tpl.id, String(input.nonce ?? '0'));
  if (!WORK_UNIT_ID_RE.test(wuid)) {
    const e = new Error(`WORK_UNIT_ID_INVALID: derived '${wuid}'`);
    e.code = 'WORK_UNIT_ID_INVALID';
    throw e;
  }
  return {
    work_unit_id: wuid,
    title: `JARVIS Desktop — ${tpl.label}`,
    objective,
    execution_lane: READ_ONLY_LANE,
    canonical_sha: sha,
    branch: `chore/ain-delegate-${wuid}`,
    governing_authority: 'docs/ops/JARVIS_UNIT_12_DESKTOP_ALPHA.md',
    established_facts: BASE_ESTABLISHED_FACTS,
    escalation_conditions: BASE_ESCALATION_CONDITIONS,
    expected_output: tpl.expected_output,
    context_selectors: tpl.context_selectors,
  };
}

module.exports = {
  READ_ONLY_LANE,
  DEFAULT_AUTHORITY,
  WRITE_REQUESTING_KEYS,
  WORK_UNIT_ID_RE,
  BASE_ESTABLISHED_FACTS,
  TEMPLATES,
  getTemplate,
  workUnitId,
  assertReadOnly,
  buildPacket,
};
