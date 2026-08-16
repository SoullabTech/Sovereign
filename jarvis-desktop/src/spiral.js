// JOP-02 — JARVIS Living Spiral. PROJECTION ONLY.
//
// This module is a RENDERER over the governed derivation. It is not a verifier,
// not an authority source, not a telemetry source, and not a state store.
//
// It takes ONE input: the object `legibility.deriveOperatorView()` already
// produced. It does not read `jarvis:status`, does not call IPC, does not touch
// the filesystem, git, or any endpoint. If it needs to know something it cannot
// obtain from that input, it renders an APERTURE saying so. It never becomes
// clever enough to reconstruct truth independently.
//
//   AUTHORITATIVE EVIDENCE → governed derivation → legibility.js → THIS → grammar
//
// Jurisdiction (founder ruling 2026-08-16): operator instrument, JARVIS Desktop
// only. A member is NEVER an inferred node. The phenomenon names below are the
// canonical JARVIS operational vocabulary — Fire/Water/Earth/Air/Aether belong
// to MAIA's Spiralogic and are deliberately not used here, because identical
// names collapse distinct referents.

'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisSpiral = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

// ── phenomenon: PRESENTATION ALIAS ONLY ──────────────────────────────────────
// Not a stored category, not queryable, not a reasoning input. It is an angular
// position chosen for display. Nothing downstream may branch on it.
const PHENOMENA = Object.freeze({
  TRANSFORMATION: 'something is becoming or changing',
  FLOW:           'something is moving between organs',
  STANDING:       'something is held, persisted, established',
  DISCERNMENT:    'something is differentiating, selecting, evaluating',
  INTEGRATION:    'several things are forming a larger whole',
});

/** Display placement only. A node's meaning comes from its assertion, never here. */
const PLACEMENT = Object.freeze({
  'Builder execution mechanism': 'TRANSFORMATION',
  'Builder OS':                  'INTEGRATION',
  'Deterministic registry':      'DISCERNMENT',
  'Local model worker':          'TRANSFORMATION',
  'Claude reasoning':            'DISCERNMENT',
  'Automatic C3 execution':      'DISCERNMENT',
  'Desktop runtime':             'STANDING',
  'Artifact identity':           'STANDING',
  'Execution substrate':         'STANDING',
  'Sovereign binding':           'FLOW',
});

/**
 * The ONLY motion this system may currently claim.
 *
 * Motion is a derivative: it requires at least two lawful observations of the
 * same subject at different times. Nothing in the current evidence chain retains
 * prior state — `deriveOperatorView` describes a single instant. Therefore no
 * motion is derivable, and a node that happens not to be changing during a
 * render must NEVER be reported as `stable`. "Nothing moved while I looked" and
 * "this is steady" are different claims, and only the first is observed.
 */
function motionFor(/* node */) {
  return Object.freeze({
    state: 'UNOBSERVED',
    reason: 'no lawful temporal evidence source',
    aperture: 'no prior observation of this subject is retained; motion is a derivative and cannot be computed from a single instant',
  });
}

/**
 * THREE facts that a UI cleanup would happily collapse into one:
 *
 *   the view was produced at T
 *     ≠ this organ was independently observed at T
 *       ≠ this organ's state is current
 *
 * The lawful source supplies only the first. So the snapshot timestamp is
 * reported at view scope, and every node's own freshness is UNOBSERVED. Stamping
 * the view's time onto each organ would manufacture per-organ observation that
 * never happened — the same error as inventing custody rings.
 */
function freshnessFor(/* node */) {
  return Object.freeze({
    state: 'UNOBSERVED',
    reason: 'no per-organ observation timestamp is supplied by the lawful source',
    do_not_infer_from: 'the view-level snapshot timestamp',
  });
}

/** States that are not operational. Mirrors legibility; never widens it. */
const NON_OPERATIONAL = ['NEEDS_SETUP', 'NEEDS_AUTHORITY', 'DEGRADED', 'BLOCKED', 'FAILED', 'UNVERIFIED'];

/**
 * Disturbance is DERIVED FROM THE ASSERTION, never scored.
 * There is no severity arithmetic and no confidence number, because either
 * would be an aggregate the evidence cannot support.
 */
function disturbanceFor(organ) {
  if (!NON_OPERATIONAL.includes(organ.state)) return null;
  if (organ.by_design) {
    return { kind: 'BY_DESIGN', reason: organ.reason || null, needs_attention: false };
  }
  if (organ.state === 'UNVERIFIED') {
    return { kind: 'UNOBSERVED', reason: organ.reason || null, needs_attention: false };
  }
  return { kind: 'IMPEDED', reason: organ.reason || null, needs_attention: true };
}

function nodeFrom(organ) {
  return {
    id: organ.name,
    label: organ.name,
    describes: organ.describes || null,
    phenomenon: PLACEMENT[organ.name] || 'STANDING',   // presentation only
    standing: organ.state,                             // the governed assertion, verbatim
    reason: organ.reason || null,
    remediation: organ.remediation || null,
    evidence: organ.evidence || null,
    by_design: !!organ.by_design,
    motion: motionFor(organ),
    freshness: freshnessFor(organ),
    disturbance: disturbanceFor(organ),
  };
}

/**
 * Project a spiral from an operator view.
 *
 * @param {object} view - output of legibility.deriveOperatorView(). Nothing else.
 */
function projectSpiral(view) {
  const v = view || {};
  const organs = Array.isArray(v.organs) ? v.organs : [];

  const nodes = organs.map(nodeFrom);

  // The binding is a first-class node: it is the substrate every other organ
  // depends on, and its absence is why the others go unobserved.
  if (v.binding) {
    nodes.unshift({
      id: 'Sovereign binding',
      label: v.binding.bound ? v.binding.root : 'No repository connected',
      describes: 'The checkout JARVIS is operating on.',
      phenomenon: 'FLOW',
      standing: v.binding.state,
      reason: v.binding.reason || null,
      remediation: v.binding.remediation || null,
      evidence: 'jarvis:status.repo_root',
      by_design: false,
      motion: motionFor(),
      freshness: freshnessFor(),
      disturbance: v.binding.state === 'READY' ? null
        : { kind: 'IMPEDED', reason: v.binding.reason || null, needs_attention: true },
    });
  }

  return {
    observed_at: v.observed_at || null,
    snapshot: Object.freeze({
      observed_at: v.observed_at || null,
      scope: 'whole operator-view snapshot',
      not: 'evidence that any individual organ was observed at this time',
    }),
    // The axes declare their own meaning, so the renderer cannot let a viewer
    // read "farther out = more canonical". Radius is STANDING. Custody position
    // is a separate, unobserved dimension and is never encoded spatially.
    axes: Object.freeze({
      radial: { means: 'standing', not: ['custody', 'maturity', 'importance', 'health'] },
      angular: { means: 'phenomenon (presentation alias)', not: ['reasoning category', 'stored attribute'] },
      custody: { state: 'UNOBSERVED', reason: 'no lawful custody-position evidence source', encoded_spatially: false },
    }),
    nodes,
    edges: edgesFrom(v, nodes),
    apertures: aperturesFor(v, nodes),
    attention: nodes.filter(n => n.disturbance && n.disturbance.needs_attention)
                    .map(n => ({ id: n.id, reason: n.disturbance.reason })),
    // ⛔ Deliberately absent: any aggregate health, score, percentage, or
    // confidence. The evidence cannot support one, so none is offered.
  };
}

/**
 * Edges require ASSEMBLY-POINT EVIDENCE.
 *
 * A relationship being plausible is not a relationship being evidenced. Two
 * organs both being READY is co-occurrence, not composition. The only
 * composition this view can lawfully witness is the dependency the mechanism
 * itself reports: when nothing is bound, dependent organs say so in their own
 * reason string, and THAT is the assembly point.
 */
function edgesFrom(view, nodes) {
  const edges = [];
  const unbound = view && view.binding && view.binding.bound === false;
  if (!unbound) return edges;
  for (const n of nodes) {
    if (n.id === 'Sovereign binding') continue;
    if (n.standing !== 'UNVERIFIED') continue;
    if (!n.reason || !/no repository is bound/i.test(n.reason)) continue;
    edges.push({
      from: 'Sovereign binding', to: n.id, kind: 'BLOCKS_OBSERVATION',
      evidence: `${n.id}: "${n.reason}"`,
    });
  }
  return edges;
}

/**
 * An aperture is a declared limit of what this projection could establish.
 * Rendering one is the correct alternative to inference — never a placeholder
 * to be filled in later by cleverness.
 */
function aperturesFor(view, nodes) {
  const a = [{
    subject: 'motion',
    limit: 'No lawful temporal evidence source exists. Motion is UNOBSERVED for every node.',
    consequence: 'The spiral shows present standing only. It cannot show change.',
  }, {
    subject: 'custody layer (radial axis)',
    limit: 'The operator view reports standing, not custody position. Whether a subject is committed, merged, deployed, or canonical is not present in this evidence source.',
    consequence: 'Nodes are placed by standing, not by custody ring. A custody spiral would require an evidence source this projection does not have.',
  }];
  if (view && view.active_work && view.active_work.observable === false) {
    a.push({
      subject: 'active work',
      limit: view.active_work.summary || 'not observed',
      consequence: 'Work in flight cannot be represented; absence here is not evidence of none.',
    });
  }
  return a;
}


// ── founder inspector ────────────────────────────────────────────────────────
// Interrogability, not new truth. Every field below is read from the projection;
// nothing is computed about the world here. Plain language comes FIRST so the
// surface is usable without developer vocabulary, and the evidentiary chain sits
// immediately beneath it so provenance is never hidden behind that readability.

/** One ordinary sentence, then the standing disclaimer that stops a misreading. */
function plainly(node) {
  const subject = node.label === node.id ? node.id : `${node.id} (${node.label})`;
  switch (node.standing) {
    case 'READY':
    case 'WORKING':
      return { says: `${subject} is operational.`,
               caveat: 'This is an observed standing, not a health claim.' };
    case 'NEEDS_AUTHORITY':
      return { says: `${subject} is not authorized.`,
               caveat: 'Absent by design. No operator action grants it, and nothing is broken.' };
    case 'UNVERIFIED':
      return { says: `${subject} was not observed.`,
               caveat: 'This is a limit of the observation, not a statement that the subject is absent.' };
    default:
      return { says: `${subject} is impeded.`,
               caveat: 'Something observable is preventing it from operating.' };
  }
}

/**
 * The six-field node contract. `remediation` is deliberately null for BY_DESIGN:
 * offering a fix for something no act can grant would be a lie the surface tells
 * to look helpful.
 */
function inspectNode(spiral, id) {
  const sp = spiral || {};
  const n = (sp.nodes || []).find(x => x.id === id);
  if (!n) return null;
  const byDesign = !!n.by_design;
  return {
    plain: plainly(n),
    phenomenon: { value: n.phenomenon, means: PHENOMENA[n.phenomenon] || null,
                  note: 'presentation alias only — it names where the mark sits, never what it means' },
    assertion: { standing: n.standing, describes: n.describes || null, reason: n.reason || null },
    evidence: { source: n.evidence || null,
                absent: !n.evidence ? 'no evidence pointer was supplied for this node' : null },
    binding: { via: 'legibility.deriveOperatorView', from: n.evidence || null,
               note: 'this projection reads the governed derivation and nothing else' },
    temporal: {
      snapshot_observed_at: (sp.snapshot && sp.snapshot.observed_at) || null,
      snapshot_scope: (sp.snapshot && sp.snapshot.scope) || null,
      node_freshness: n.freshness ? n.freshness.state : 'UNOBSERVED',
      node_freshness_reason: n.freshness ? n.freshness.reason : null,
      motion: n.motion ? n.motion.state : 'UNOBSERVED',
      motion_reason: n.motion ? n.motion.reason : null,
    },
    authority: {
      disposition: byDesign ? 'BY_DESIGN'
        : (n.standing === 'UNVERIFIED' ? 'UNOBSERVED'
        : (n.standing === 'READY' || n.standing === 'WORKING' ? 'PERMITTED' : 'IMPEDED')),
      governing_reason: n.reason || null,
      remediation: byDesign ? null : (n.remediation || null),
      attention: n.disturbance ? { typed: n.disturbance.kind, needs_attention: n.disturbance.needs_attention } : null,
    },
    custody: sp.axes ? sp.axes.custody : null,
  };
}

/**
 * The four-field edge contract. An edge with no licence does not exist: this
 * returns null rather than a relation with an empty justification.
 */
function inspectEdge(spiral, from, to) {
  const sp = spiral || {};
  const e = (sp.edges || []).find(x => x.from === from && x.to === to);
  if (!e || !e.evidence) return null;
  const src = (sp.nodes || []).filter(n => n.id === e.from || n.id === e.to)
    .map(n => ({ id: n.id, standing: n.standing }));
  return {
    plain: { says: `${e.from} is preventing ${e.to} from being observed.`,
             caveat: 'This relation is drawn only because the mechanism said so in its own words.' },
    relation: e.kind,
    licence: e.evidence,
    source_assertions: src,
    causal_standing: 'ESTABLISHED',
  };
}

  return { PHENOMENA, PLACEMENT, NON_OPERATIONAL, motionFor, freshnessFor, disturbanceFor, edgesFrom, aperturesFor,
           plainly, inspectNode, inspectEdge, projectSpiral };
});
