// JARVIS Desktop — canonical W0.v2 control + read projection.
//
// This module is a native Desktop bridge into the already-proven Builder v2
// substrate. It does not execute providers, read credentials, grant provider
// execution authority, mutate lifecycle directly, or replace Builder law.
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');

const MODE = 'CANONICAL_V2';
const STORE_VERSION = 'I4.v1';

const TASK_SHAPES = Object.freeze([
  'CODE_GROUNDED',
  'ARCHITECTURE_REASONING',
  'ADVERSARIAL_FALSIFICATION',
  'LONG_HORIZON_DECOMPOSITION',
  'EVIDENCE_SYNTHESIS',
  'FRONTIER_UNKNOWN',
]);
const EVIDENCE_CLASSES = Object.freeze([
  'E0_TASK_TEXT',
  'E1_REPOSITORY_LOCAL',
  'E2_CONTINUITY_LOCAL',
  'E3_EXTERNAL_REPO_BUNDLE',
  'E4_SENSITIVE_OR_PRODUCTION',
]);
const WORK_CLASSES = Object.freeze([
  'RESEARCH', 'PATCH', 'REFACTOR', 'REBUILD', 'ARCHITECTURE', 'VERIFICATION', 'DELIVERY',
]);
const POSTURES = Object.freeze([
  'default', 'local_only', 'independent_review', 'adversarial_challenge', 'frontier_text', 'frontier_repository',
]);
const REVIEW_PRESSURES = Object.freeze(['ordinary', 'high_value_uncertain']);
const DISCLOSURES = Object.freeze(['none', 'task_text_only', 'exact_bundle']);

const SPEC_FIELDS = Object.freeze([
  'objective',
  'workClass',
  'taskShape',
  'capability',
  'evidenceClass',
  'requestedPosture',
  'reviewPressure',
  'evidenceFocus',
  'acceptanceCriteria',
  'falsificationConditions',
  'stopConditions',
  'authorityRequest',
]);
const AUTHORITY_REQUEST_FIELDS = Object.freeze([
  'networkExternal',
  'providerSpend',
  'externalDisclosure',
]);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
  }
  return value;
}
function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function nonBlank(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}
function lines(value) {
  return String(value || '').split('\n').map((s) => s.trim()).filter(Boolean);
}
function unique(values) {
  return [...new Set(values)];
}
function safeId(value) {
  return /^[a-z0-9][a-z0-9-]{2,63}$/.test(String(value || ''));
}
function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 34) || 'work';
}
function makeId(objective, nowMs) {
  const suffix = Number(nowMs).toString(36).slice(-8);
  return ('v2-' + slug(objective) + '-' + suffix).slice(0, 63).replace(/-+$/g, '');
}
function digestObject(value) {
  return 'sha256:' + crypto.createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex');
}
function blocker(code, detail, field = null) {
  return Object.freeze({ code, detail, field });
}
function canonicalHome(env = process.env) {
  const home = env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation');
  return path.join(home, 'work-units-v2');
}
function workUnitPath(id, env = process.env) {
  return path.join(canonicalHome(env), id + '.json');
}
function metaPath(id, env = process.env) {
  return path.join(canonicalHome(env), id + '.desktop.json');
}
function ensureStore(env = process.env) {
  fs.mkdirSync(canonicalHome(env), { recursive: true });
}
function atomicWrite(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, file);
}
function readJson(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function defaultMeta(id) {
  return {
    store_version: STORE_VERSION,
    mode: MODE,
    work_unit_id: id,
    prospective_preview: null,
    adjudications: [],
    closures: [],
  };
}
function readMeta(id, env = process.env) {
  return readJson(metaPath(id, env)) || defaultMeta(id);
}
function writeMeta(id, meta, env = process.env) {
  atomicWrite(metaPath(id, env), meta);
}
function readEnvelope(id, env = process.env) {
  if (!safeId(id)) return null;
  return readJson(workUnitPath(id, env));
}
function writeEnvelope(id, envelope, env = process.env) {
  atomicWrite(workUnitPath(id, env), envelope);
}
function existsCanonicalV2(id, env = process.env) {
  return safeId(id) && fs.existsSync(workUnitPath(id, env));
}
async function importBound(root, rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) throw new Error('bound repository is missing ' + rel);
  return import(pathToFileURL(file).href + '?i4=' + Date.now());
}

function stripLineSelector(value) {
  return String(value || '').replace(/:\d+-\d+$/, '').trim();
}
function boundedRepoPath(value) {
  const p = stripLineSelector(value);
  if (!p || p === '.' || p === '..' || p === '/' || p === '*' || p === '**' || p === '**/*') return null;
  if (p.startsWith('/') || p.startsWith('../') || p.includes('/../') || p.includes('\\')) return null;
  return p;
}
function validateSpecShape(spec) {
  const blocks = [];
  if (!isObject(spec)) return [blocker('CANONICAL_SPEC_REQUIRED', 'Canonical v2 intent must be structured.')];
  for (const key of Object.keys(spec)) {
    if (!SPEC_FIELDS.includes(key)) blocks.push(blocker('CANONICAL_SPEC_FIELD_REFUSED', 'Renderer field is not admitted by I4 canonical intent.', key));
  }
  if (spec.authorityRequest != null) {
    if (!isObject(spec.authorityRequest)) {
      blocks.push(blocker('AUTHORITY_REQUEST_INVALID', 'authorityRequest must be structured.', 'authorityRequest'));
    } else {
      for (const key of Object.keys(spec.authorityRequest)) {
        if (!AUTHORITY_REQUEST_FIELDS.includes(key)) {
          blocks.push(blocker('RAW_AUTHORITY_FIELD_REFUSED', 'Renderer cannot supply raw Work Unit authority.', 'authorityRequest.' + key));
        }
      }
    }
  }
  return blocks;
}

function canonicalInputFromSpec(spec, { canonicalSha, workUnitId }) {
  const blocks = [...validateSpecShape(spec)];
  const objective = text(spec?.objective);
  const taskShape = text(spec?.taskShape || 'CODE_GROUNDED');
  const evidenceClass = text(spec?.evidenceClass || 'E1_REPOSITORY_LOCAL');
  const workClass = text(spec?.workClass || 'VERIFICATION');
  const posture = text(spec?.requestedPosture || 'default');
  const reviewPressure = text(spec?.reviewPressure || 'ordinary');
  const capability = text(spec?.capability) || null;

  if (!objective) blocks.push(blocker('OBJECTIVE_REQUIRED', 'Describe what this Work Unit should accomplish.', 'objective'));
  if (!TASK_SHAPES.includes(taskShape)) blocks.push(blocker('INVALID_TASK_SHAPE', 'Use one of the six J5 task shapes.', 'taskShape'));
  if (!EVIDENCE_CLASSES.includes(evidenceClass)) blocks.push(blocker('INVALID_EVIDENCE_CLASS', 'Use E0-E4 custody.', 'evidenceClass'));
  if (!WORK_CLASSES.includes(workClass)) blocks.push(blocker('INVALID_WORK_CLASS', 'Work class is not canonical.', 'workClass'));
  if (!POSTURES.includes(posture)) blocks.push(blocker('INVALID_REQUESTED_POSTURE', 'Requested posture is not canonical.', 'requestedPosture'));
  if (!REVIEW_PRESSURES.includes(reviewPressure)) blocks.push(blocker('INVALID_REVIEW_PRESSURE', 'Review pressure is not canonical.', 'reviewPressure'));
  if (!/^[0-9a-f]{40}$/i.test(String(canonicalSha || ''))) {
    blocks.push(blocker('CANONICAL_SHA_REQUIRED', 'MAIN must derive exact canonical SHA.'));
  }
  if (!safeId(workUnitId)) blocks.push(blocker('WORK_UNIT_ID_REQUIRED', 'MAIN must derive canonical Work Unit identity.'));

  const focus = unique(lines(spec?.evidenceFocus).map(boundedRepoPath).filter(Boolean));
  const acceptance = lines(spec?.acceptanceCriteria);
  const falsification = lines(spec?.falsificationConditions);
  const stopConditions = lines(spec?.stopConditions);

  const isTaskTextOnly = evidenceClass === 'E0_TASK_TEXT';
  if (!isTaskTextOnly && focus.length === 0) {
    blocks.push(blocker(
      'BOUNDED_REPOSITORY_SCOPE_REQUIRED',
      'Non-E0 canonical Work Units require at least one bounded repository-relative evidence path.',
      'evidenceFocus',
    ));
  }

  const authReq = isObject(spec?.authorityRequest) ? spec.authorityRequest : {};
  const networkExternal = authReq.networkExternal === true;
  const providerSpend = authReq.providerSpend === true;
  const externalDisclosure = DISCLOSURES.includes(authReq.externalDisclosure)
    ? authReq.externalDisclosure
    : 'none';

  if (providerSpend && !networkExternal) {
    blocks.push(blocker('SPEND_REQUIRES_NETWORK', 'Provider-spend request requires external-network request.', 'authorityRequest.providerSpend'));
  }
  if (externalDisclosure !== 'none' && !networkExternal) {
    blocks.push(blocker('DISCLOSURE_REQUIRES_NETWORK', 'External disclosure request requires external-network request.', 'authorityRequest.externalDisclosure'));
  }

  const evidenceRefs = [];
  if (isTaskTextOnly || posture === 'frontier_text') {
    evidenceRefs.push('approved-task-text:desktop-intent');
  }
  if (!isTaskTextOnly) {
    evidenceRefs.push('local-worktree:' + canonicalSha);
  }
  if (externalDisclosure === 'exact_bundle') {
    for (const ref of focus) evidenceRefs.push('external-bundle:' + ref);
  }

  const input = {
    identity: {
      id: workUnitId,
      programme: 'JARVIS-DESKTOP/I4-CANONICAL-V2',
      parent_work_unit: null,
      objective,
      work_class: workClass,
      task_shape: taskShape,
      capability,
    },
    custody: { evidence_class: evidenceClass },
    routing_request: {
      requested_posture: posture,
      review_pressure: reviewPressure,
    },
    context: {
      context_refs: [],
      evidence_refs: unique(evidenceRefs),
      assumptions: [],
      unknowns: [],
    },
    scope: {
      repository: 'bound-desktop-repository',
      base_ref: canonicalSha,
      allowed_paths: isTaskTextOnly ? [] : focus,
      forbidden_paths: [],
    },
    authority: {
      repository_read: !isTaskTextOnly,
      repository_write: 'none',
      shell: 'none',
      network_external: networkExternal,
      provider_spend: providerSpend,
      external_disclosure: externalDisclosure,
      merge: false,
      deploy: false,
      production_read: false,
      production_write: false,
    },
    evaluation: {
      acceptance_conditions: acceptance.length ? acceptance : ['Return evidence-grounded findings within the authorized Work Unit.'],
      falsification_conditions: falsification.length ? falsification : ['Stop if evidence cannot support the requested conclusion.'],
      stop_conditions: stopConditions.length ? stopConditions : ['Stop before authority, execution, merge, deploy, or production expansion.'],
    },
    provenance: {
      creator: 'jarvis-desktop:i4',
      authorizing_act: null,
      source_commits: [canonicalSha],
    },
    state: { supersedes: null },
  };

  return { ok: blocks.length === 0, input, blockers: blocks, focus };
}

function prospectiveIntentKey(spec, canonicalSha) {
  return digestObject({
    objective: text(spec?.objective),
    workClass: text(spec?.workClass),
    taskShape: text(spec?.taskShape),
    capability: text(spec?.capability) || null,
    evidenceClass: text(spec?.evidenceClass),
    requestedPosture: text(spec?.requestedPosture),
    reviewPressure: text(spec?.reviewPressure),
    evidenceFocus: unique(lines(spec?.evidenceFocus).map(stripLineSelector)),
    acceptanceCriteria: lines(spec?.acceptanceCriteria),
    falsificationConditions: lines(spec?.falsificationConditions),
    stopConditions: lines(spec?.stopConditions),
    authorityRequest: isObject(spec?.authorityRequest) ? spec.authorityRequest : {},
    canonicalSha,
  });
}

async function prospectivePreview(root, spec, opts = {}) {
  const canonicalSha = String(opts.canonicalSha || '');
  const nowMs = Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
  const workUnitId = 'preview-' + makeId(text(spec?.objective) || 'work', nowMs).slice(3);
  const built = canonicalInputFromSpec(spec, { canonicalSha, workUnitId });
  if (!built.ok) {
    return deepFreeze({
      ok: false,
      status: 'PREVIEW_REFUSED',
      classification: 'PROSPECTIVE_NONCANONICAL_NONEXECUTING',
      blockers: built.blockers,
      route_record: null,
      route_digest: null,
    });
  }

  const [workUnitMod, routeBindMod, routeMod, integrityMod] = await Promise.all([
    importBound(root, 'scripts/builder/work-unit-v2.mjs'),
    importBound(root, 'scripts/builder/work-unit-routing-v2.mjs'),
    importBound(root, 'scripts/builder/routing-intelligence-j5-v1.mjs'),
    importBound(root, 'scripts/builder/routing-route-integrity.mjs'),
  ]);

  const draft = workUnitMod.createWorkUnitDraftV2(built.input);
  if (!draft.ok) {
    return deepFreeze({
      ok: false,
      status: 'PREVIEW_REFUSED',
      classification: 'PROSPECTIVE_NONCANONICAL_NONEXECUTING',
      blockers: draft.blockers,
      route_record: null,
      route_digest: null,
    });
  }
  const projection = routeBindMod.deriveRoutingInputV2(draft.work_unit);
  if (!projection.ok) {
    return deepFreeze({
      ok: false,
      status: 'PREVIEW_REFUSED',
      classification: 'PROSPECTIVE_NONCANONICAL_NONEXECUTING',
      blockers: projection.blockers,
      route_record: null,
      route_digest: null,
    });
  }
  const route = routeMod.routeIntelligenceJ5V1(projection.input);
  const routeDigest = integrityMod.routeDigest(route);
  return deepFreeze({
    ok: route.execution_disposition !== 'refused',
    status: route.execution_disposition === 'refused' ? 'PREVIEW_ROUTE_REFUSED' : 'PREVIEWED',
    classification: 'PROSPECTIVE_NONCANONICAL_NONEXECUTING',
    intent_key: prospectiveIntentKey(spec, canonicalSha),
    work_unit_version: 'W0.v2',
    route_record: route,
    route_digest: routeDigest,
    blockers: route.blockers || [],
    canonical_effect: 'none',
    execution_connected: false,
  });
}

async function createCanonicalV2(root, spec, opts = {}) {
  const canonicalSha = String(opts.canonicalSha || '');
  const nowMs = Number.isFinite(opts.nowMs) ? opts.nowMs : Date.now();
  const workUnitId = makeId(text(spec?.objective) || 'work', nowMs);
  const built = canonicalInputFromSpec(spec, { canonicalSha, workUnitId });
  if (!built.ok) {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_INTENT_REFUSED', blockers: built.blockers });
  }

  const [workUnitMod, lifecycleMod] = await Promise.all([
    importBound(root, 'scripts/builder/work-unit-v2.mjs'),
    importBound(root, 'scripts/builder/work-unit-lifecycle-v2.mjs'),
  ]);
  const draft = workUnitMod.createWorkUnitDraftV2(built.input);
  if (!draft.ok) {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'W0_V2_REFUSED', blockers: draft.blockers });
  }
  const created = lifecycleMod.createLifecycleEnvelopeV2(draft.work_unit);
  if (!created.ok) {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'W2_V2_ENVELOPE_REFUSED', blockers: created.blockers });
  }

  ensureStore(opts.env);
  if (existsCanonicalV2(workUnitId, opts.env)) {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_EXISTS', blockers: [] });
  }

  const preview = await prospectivePreview(root, spec, { canonicalSha, nowMs });
  const meta = defaultMeta(workUnitId);
  meta.prospective_preview = {
    classification: 'PROSPECTIVE_NONCANONICAL_NONEXECUTING',
    intent_key: prospectiveIntentKey(spec, canonicalSha),
    route_digest: preview.route_digest || null,
    route_record: preview.route_record || null,
    blockers: preview.blockers || [],
  };

  writeEnvelope(workUnitId, created.envelope, opts.env);
  writeMeta(workUnitId, meta, opts.env);

  return statusCanonicalV2(root, workUnitId, opts);
}

function lifecycleGestureEvidence(id, to) {
  return 'desktop:i4:' + id + ':' + String(to || '').toLowerCase();
}

async function transitionCanonicalV2(root, workUnitId, to, opts = {}) {
  const envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND', blockers: [] });

  const lifecycleMod = await importBound(root, 'scripts/builder/work-unit-lifecycle-v2.mjs');
  const actorId = text(opts.actorId || 'human:desktop-operator');
  const request = {
    to,
    evidence_ref: lifecycleGestureEvidence(workUnitId, to),
    reason_code: 'JARVIS_DESKTOP_I4_' + String(to || '').toUpperCase(),
  };
  if (to === 'AUTHORIZED') {
    request.authorization_ref = 'desktop:i4:authorize:' + actorId + ':' + workUnitId;
  }

  const transitioned = lifecycleMod.transitionLifecycleV2(envelope, request);
  if (!transitioned.ok) {
    return deepFreeze({
      ok: false,
      status: 'LIFECYCLE_REFUSED',
      reason: 'W2_V2_TRANSITION_REFUSED',
      transition_request: request,
      blockers: transitioned.blockers,
    });
  }
  writeEnvelope(workUnitId, transitioned.envelope, opts.env);
  const snapshot = await statusCanonicalV2(root, workUnitId, opts);
  return deepFreeze({
    ...snapshot,
    transition: transitioned.transition,
  });
}

async function bindCanonicalRouteV2(root, workUnitId, opts = {}) {
  const envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND', blockers: [] });

  const routeBindMod = await importBound(root, 'scripts/builder/work-unit-routing-v2.mjs');
  const bound = routeBindMod.bindAuthorizedRouteV2(envelope);
  if (!bound.ok) {
    return deepFreeze({
      ok: false,
      status: 'ROUTE_REFUSED',
      reason: 'W3_V2_ROUTE_BINDING_REFUSED',
      blockers: bound.blockers,
      route_record: bound.route || null,
    });
  }
  writeEnvelope(workUnitId, bound.envelope, opts.env);

  const meta = readMeta(workUnitId, opts.env);
  const previewDigest = meta.prospective_preview?.route_digest || null;
  meta.bound_route_comparison = {
    standing: previewDigest == null
      ? 'NO_PROSPECTIVE_PREVIEW'
      : previewDigest === bound.envelope.work_unit.routing.route_digest
        ? 'MATCH'
        : 'DIFF',
    prospective_route_digest: previewDigest,
    canonical_route_digest: bound.envelope.work_unit.routing.route_digest,
  };
  writeMeta(workUnitId, meta, opts.env);

  const snapshot = await statusCanonicalV2(root, workUnitId, opts);
  return deepFreeze({
    ...snapshot,
    transition: bound.transition,
    preview_comparison: meta.bound_route_comparison,
  });
}

async function bindCanonicalTransportV2(root, workUnitId, participantId, opts = {}) {
  const envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND', blockers: [] });
  if (!nonBlank(participantId)) return deepFreeze({ ok: false, status: 'REFUSED', reason: 'ROUTE_PARTICIPANT_REQUIRED', blockers: [] });

  const transportMod = await importBound(root, 'scripts/builder/work-unit-transport-v1.mjs');
  const governed = transportMod.governedTransportForParticipantV1(envelope.work_unit, participantId);
  if (!governed) {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'NO_GOVERNED_TRANSPORT', blockers: [] });
  }

  const bindingId = 'i4-' + slug(participantId) + '-' + digestObject(governed).slice(-12);
  const appended = transportMod.appendTransportBindingV1(envelope, {
    transport_binding_id: bindingId,
    supersedes_binding_id: null,
    route_participant_id: participantId,
    provider_id: governed.provider_id,
    model_id: governed.model_id,
    adapter_id: governed.adapter_id,
    readiness: {
      status: 'HOLD',
      evidence_ref: 'desktop:i4:nonexecuting-binding:' + participantId,
    },
  });
  if (!appended.ok) {
    return deepFreeze({
      ok: false,
      status: 'TRANSPORT_BINDING_REFUSED',
      reason: 'W3T_V1_BINDING_REFUSED',
      blockers: appended.blockers,
    });
  }

  writeEnvelope(workUnitId, appended.envelope, opts.env);
  const snapshot = await statusCanonicalV2(root, workUnitId, opts);
  return deepFreeze({
    ...snapshot,
    transport_binding: appended.binding,
  });
}

function readCanonicalExecutionEnvelopeV2(workUnitId, env = process.env) {
  const envelope = readEnvelope(workUnitId, env);
  return envelope ? clone(envelope) : null;
}

async function prepareCanonicalTransportForExecutionV2(root, workUnitId, participantId, opts = {}) {
  const envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND',
      blockers: [],
    });
  }
  if (envelope.work_unit?.state?.lifecycle_state !== 'ROUTED') {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'ROUTED_STATE_REQUIRED_FOR_TRANSPORT_READINESS',
      blockers: [],
    });
  }

  const transportMod = await importBound(root, 'scripts/builder/work-unit-transport-v1.mjs');
  const governed = transportMod.governedTransportForParticipantV1(
    envelope.work_unit,
    participantId,
  );
  if (!governed || governed.execution_mode !== 'automatic') {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: governed ? 'MANUAL_TRANSPORT_NOT_EXECUTABLE' : 'NO_GOVERNED_TRANSPORT',
      blockers: [],
    });
  }

  const active = transportMod.activeTransportBindingsV1(envelope.work_unit)
    .filter((binding) => binding.route_participant_id === participantId);
  if (active.length !== 1) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'EXACT_ACTIVE_TRANSPORT_BINDING_REQUIRED',
      blockers: [],
    });
  }
  const current = active[0];
  if (current.readiness?.status === 'READY') {
    return deepFreeze({
      ...(await statusCanonicalV2(root, workUnitId, opts)),
      transport_binding: clone(current),
      readiness_transition: 'ALREADY_READY',
    });
  }
  if (current.readiness?.status !== 'HOLD') {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'HOLD_TRANSPORT_REQUIRED_FOR_E1_READINESS',
      blockers: [],
    });
  }

  const identityExact = current.model_family === governed.model_family
    && current.role === governed.role
    && current.provider_id === governed.provider_id
    && current.model_id === governed.model_id
    && current.adapter_id === governed.adapter_id
    && current.execution_mode === governed.execution_mode
    && current.response_budget_profile_id === governed.response_budget_profile_id
    && current.evidence_class === governed.evidence_class;
  if (!identityExact) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'TRANSPORT_IDENTITY_DRIFT',
      blockers: [],
    });
  }

  const bindingId = 'e1-ready-' + slug(participantId) + '-'
    + digestObject({
      supersedes: current.transport_binding_id,
      governed,
      route_digest: envelope.work_unit.routing.route_digest,
    }).slice(-12);

  const appended = transportMod.appendTransportBindingV1(envelope, {
    transport_binding_id: bindingId,
    supersedes_binding_id: current.transport_binding_id,
    route_participant_id: participantId,
    provider_id: governed.provider_id,
    model_id: governed.model_id,
    adapter_id: governed.adapter_id,
    readiness: {
      status: 'READY',
      evidence_ref: 'desktop:e1:registered-governed-adapter:' + participantId,
    },
  });
  if (!appended.ok) {
    return deepFreeze({
      ok: false,
      status: 'TRANSPORT_READINESS_REFUSED',
      reason: 'W3T_V1_READY_BINDING_REFUSED',
      blockers: appended.blockers,
    });
  }

  writeEnvelope(workUnitId, appended.envelope, opts.env);
  return deepFreeze({
    ...(await statusCanonicalV2(root, workUnitId, opts)),
    transport_binding: appended.binding,
    readiness_transition: 'HOLD_TO_READY_BY_SUPERSESSION',
  });
}

function activeBindingById(workUnit, bindingId) {
  const bindings = Array.isArray(workUnit?.routing?.transport_bindings)
    ? workUnit.routing.transport_bindings
    : [];
  const superseded = new Set(
    bindings.map((binding) => binding?.supersedes_binding_id).filter(Boolean),
  );
  return bindings.find((binding) =>
    binding?.transport_binding_id === bindingId
    && !superseded.has(binding.transport_binding_id)) || null;
}

function routeParticipantById(workUnit, participantId) {
  const route = workUnit?.routing?.route_record;
  if (route?.primary?.participant_id === participantId) return route.primary;
  return (Array.isArray(route?.challengers) ? route.challengers : [])
    .find((participant) => participant?.participant_id === participantId) || null;
}

async function appendCanonicalExecutionResultV2(root, workUnitId, req = {}, opts = {}) {
  let envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND', blockers: [] });
  }
  if (envelope.work_unit?.state?.lifecycle_state !== 'EXECUTING') {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'EXECUTING_STATE_REQUIRED', blockers: [] });
  }

  const participantId = text(req.route_participant_id);
  const bindingId = text(req.transport_binding_id);
  const participant = routeParticipantById(envelope.work_unit, participantId);
  const binding = activeBindingById(envelope.work_unit, bindingId);
  if (!participant || !binding
      || binding.route_participant_id !== participantId
      || binding.model_family !== participant.model_family
      || binding.role !== participant.role
      || binding.readiness?.status !== 'READY') {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'EXACT_ACTIVE_READY_TRANSPORT_REQUIRED',
      blockers: [],
    });
  }

  const ledgerMod = await importBound(root, 'scripts/builder/work-unit-ledger-v2.mjs');
  const modelIdentityId = 'e1-mi-' + slug(participantId) + '-' + digestObject(binding).slice(-12);
  const existingIdentity = (envelope.work_unit.provenance?.model_identity || [])
    .find((identity) => identity.model_identity_id === modelIdentityId);

  const identity = {
    model_identity_id: modelIdentityId,
    route_participant_id: participantId,
    transport_binding_id: bindingId,
    model_family: binding.model_family,
    provider_id: binding.provider_id,
    model_id: binding.model_id,
    adapter_id: binding.adapter_id,
    role: binding.role,
  };

  if (!existingIdentity) {
    const appendedIdentity = ledgerMod.appendLedgerRecordV2(envelope, {
      kind: 'model_identity',
      entry: identity,
    });
    if (!appendedIdentity.ok) {
      return deepFreeze({
        ok: false,
        status: 'W4_MODEL_IDENTITY_REFUSED',
        reason: appendedIdentity.blockers?.[0]?.code || 'W4_MODEL_IDENTITY_REFUSED',
        blockers: appendedIdentity.blockers,
      });
    }
    envelope = appendedIdentity.envelope;
  }

  const attempts = envelope.work_unit.execution?.attempts || [];
  const sameParticipant = attempts.filter((attempt) =>
    attempt?.route_participant_id === participantId);
  const primaryId = envelope.work_unit.routing?.route_record?.primary?.participant_id;
  let attemptKind = 'primary';
  let parentAttemptId = null;
  if (sameParticipant.length) {
    attemptKind = 'retry';
    parentAttemptId = sameParticipant[sameParticipant.length - 1].attempt_id;
  } else if (participantId !== primaryId) {
    attemptKind = 'independent_model_review';
    const parent = [...attempts].reverse().find((attempt) =>
      ['primary', 'retry'].includes(attempt?.attempt_kind));
    if (!parent) {
      return deepFreeze({
        ok: false,
        status: 'REFUSED',
        reason: 'PRIMARY_OR_RETRY_ATTEMPT_REQUIRED_BEFORE_INDEPENDENT_REVIEW',
        blockers: [],
      });
    }
    parentAttemptId = parent.attempt_id;
  }

  const attemptId = 'e1-attempt-' + String(attempts.length + 1).padStart(2, '0')
    + '-' + slug(participantId);
  const appendedAttempt = ledgerMod.appendDurableAttemptV2(envelope, {
    attempt: {
      attempt_id: attemptId,
      ...identity,
      actor_id: null,
      attempt_kind: attemptKind,
      parent_attempt_id: parentAttemptId,
      evidence_refs: [text(req.result_ref) || ('canonical-result:' + workUnitId + ':' + attemptId)],
    },
    provider_admission: req.provider_admission || { ok: true },
    wrapper_exit_code: Number.isInteger(req.wrapper_exit_code) ? req.wrapper_exit_code : null,
    durable_result: req.durable_result || {},
  });
  if (!appendedAttempt.ok) {
    return deepFreeze({
      ok: false,
      status: 'W4_DURABLE_ATTEMPT_REFUSED',
      reason: appendedAttempt.blockers?.[0]?.code || 'W4_DURABLE_ATTEMPT_REFUSED',
      blockers: appendedAttempt.blockers,
      mapping: appendedAttempt.mapping,
    });
  }
  envelope = appendedAttempt.envelope;

  const resultRef = text(req.result_ref) || ('canonical-result:' + workUnitId + ':' + attemptId);
  const resultDigest = text(req.result_digest) || digestObject(req.durable_result || {});
  const artifact = ledgerMod.appendLedgerRecordV2(envelope, {
    kind: 'artifact',
    entry: {
      artifact_id: 'e1-result-' + attemptId,
      attempt_id: attemptId,
      kind: 'provider_result_contract',
      ref: resultRef,
      digest: resultDigest,
    },
  });
  if (!artifact.ok) {
    return deepFreeze({
      ok: false,
      status: 'W4_RESULT_ARTIFACT_REFUSED',
      reason: artifact.blockers?.[0]?.code || 'W4_RESULT_ARTIFACT_REFUSED',
      blockers: artifact.blockers,
    });
  }
  envelope = artifact.envelope;

  const testResult = ['pass', 'fail', 'not_run'].includes(req.durable_result?.test_results)
    ? req.durable_result.test_results
    : 'not_run';
  const test = ledgerMod.appendLedgerRecordV2(envelope, {
    kind: 'test_result',
    entry: {
      test_result_id: 'e1-test-' + attemptId,
      attempt_id: attemptId,
      suite: 'canonical-provider-execution',
      result: testResult,
      evidence_ref: resultRef,
    },
  });
  if (!test.ok) {
    return deepFreeze({
      ok: false,
      status: 'W4_TEST_RESULT_REFUSED',
      reason: test.blockers?.[0]?.code || 'W4_TEST_RESULT_REFUSED',
      blockers: test.blockers,
    });
  }
  envelope = test.envelope;

  writeEnvelope(workUnitId, envelope, opts.env);
  return deepFreeze({
    ...(await statusCanonicalV2(root, workUnitId, opts)),
    canonical_attempt: clone(appendedAttempt.record?.entry || null),
    durable_mapping: clone(appendedAttempt.mapping),
    result_artifact: clone(artifact.record?.entry || null),
  });
}

async function appendCanonicalVerifierResultV2(root, workUnitId, req = {}, opts = {}) {
  const envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND', blockers: [] });
  }
  if (envelope.work_unit?.state?.lifecycle_state !== 'EXECUTING') {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'EXECUTING_STATE_REQUIRED', blockers: [] });
  }
  const ledgerMod = await importBound(root, 'scripts/builder/work-unit-ledger-v2.mjs');
  const targetAttemptId = text(req.target_attempt_id);
  const verifierAttemptId = text(req.verifier_attempt_id);
  const disposition = text(req.disposition);
  const evidenceRefs = textList(req.evidence_refs);
  const appended = ledgerMod.appendLedgerRecordV2(envelope, {
    kind: 'verifier_result',
    entry: {
      verifier_result_id: 'e1-vr-' + slug(targetAttemptId) + '-' + slug(verifierAttemptId),
      target_attempt_id: targetAttemptId,
      verifier_attempt_id: verifierAttemptId,
      disposition,
      evidence_refs: evidenceRefs.length ? evidenceRefs : ['canonical-verifier:' + verifierAttemptId],
    },
  });
  if (!appended.ok) {
    return deepFreeze({
      ok: false,
      status: 'W4_VERIFIER_RESULT_REFUSED',
      reason: appended.blockers?.[0]?.code || 'W4_VERIFIER_RESULT_REFUSED',
      blockers: appended.blockers,
    });
  }
  writeEnvelope(workUnitId, appended.envelope, opts.env);
  return statusCanonicalV2(root, workUnitId, opts);
}

async function markCanonicalEvidenceReadyV2(root, workUnitId, opts = {}) {
  const envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND', blockers: [] });
  }
  if (envelope.work_unit?.state?.lifecycle_state !== 'EXECUTING') {
    return deepFreeze({ ok: false, status: 'REFUSED', reason: 'EXECUTING_STATE_REQUIRED', blockers: [] });
  }

  const wu = envelope.work_unit;
  const participants = [];
  if (wu.routing?.route_record?.primary) participants.push(wu.routing.route_record.primary);
  for (const challenger of wu.routing?.route_record?.challengers || []) participants.push(challenger);
  const required = participants.filter((participant) => participant.required_for_completion === true);
  const attempts = wu.execution?.attempts || [];
  const incomplete = required.filter((participant) =>
    !attempts.some((attempt) =>
      attempt.route_participant_id === participant.participant_id
      && attempt.status === 'completed'));
  if (incomplete.length) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'REQUIRED_EXECUTION_EVIDENCE_INCOMPLETE',
      blockers: incomplete.map((participant) => blocker(
        'REQUIRED_PARTICIPANT_ATTEMPT_MISSING',
        'Required participant lacks a completed durable attempt.',
        participant.participant_id,
      )),
    });
  }
  if (!(wu.evaluation?.verifier_results || []).length) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'VERIFIER_EVIDENCE_REQUIRED',
      blockers: [blocker('VERIFIER_EVIDENCE_REQUIRED', 'Explicit verifier evidence is required before EVIDENCE_READY.')],
    });
  }
  return transitionCanonicalV2(root, workUnitId, 'EVIDENCE_READY', opts);
}

function adjudicationRecord(workUnitId, actorId, decision, basisRefs) {
  return {
    adjudication_id: 'desktop-i4-adjudication-' + workUnitId,
    actor_kind: 'human',
    actor_id: actorId,
    decision,
    evidence_ref: 'adjudication:desktop:i4:' + workUnitId,
    model_authored: false,
    basis_refs: unique(textList(basisRefs)),
  };
}
function textList(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(nonBlank).map(text);
}

async function adjudicateCanonicalV2(root, workUnitId, req = {}, opts = {}) {
  const allowed = ['decision', 'basis_refs'];
  if (!isObject(req) || Object.keys(req).some((key) => !allowed.includes(key))) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'ADJUDICATION_REQUEST_REFUSED',
      blockers: [blocker('ADJUDICATION_REQUEST_SHAPE_REFUSED', 'Renderer may submit only decision and basis_refs.')],
    });
  }
  const envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND', blockers: [] });
  if (envelope.work_unit?.state?.lifecycle_state !== 'EVIDENCE_READY') {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'EVIDENCE_READY_REQUIRED',
      blockers: [blocker('EVIDENCE_READY_REQUIRED', 'Adjudication gesture is available only from EVIDENCE_READY.')],
    });
  }
  const decision = text(req.decision);
  if (decision !== 'accepted') {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'ACCEPTED_ADJUDICATION_REQUIRED',
      blockers: [blocker('ACCEPTED_ADJUDICATION_REQUIRED', 'I4 canonical adjudication currently supports explicit accepted disposition only.')],
    });
  }
  const basisRefs = textList(req.basis_refs);
  if (!basisRefs.length) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'ADJUDICATION_BASIS_REQUIRED',
      blockers: [blocker('ADJUDICATION_BASIS_REQUIRED', 'Explicit human adjudication requires at least one basis reference.')],
    });
  }

  const actorId = text(opts.actorId || 'human:desktop-operator');
  const record = adjudicationRecord(workUnitId, actorId, decision, basisRefs);
  const lifecycleMod = await importBound(root, 'scripts/builder/work-unit-lifecycle-v2.mjs');
  const transitioned = lifecycleMod.transitionLifecycleV2(envelope, {
    to: 'ADJUDICATED',
    evidence_ref: record.evidence_ref,
    reason_code: 'JARVIS_DESKTOP_I4_HUMAN_ADJUDICATION',
    adjudication: 'accepted',
  });
  if (!transitioned.ok) {
    return deepFreeze({
      ok: false,
      status: 'LIFECYCLE_REFUSED',
      reason: 'W2_V2_ADJUDICATION_REFUSED',
      blockers: transitioned.blockers,
    });
  }

  writeEnvelope(workUnitId, transitioned.envelope, opts.env);
  const meta = readMeta(workUnitId, opts.env);
  meta.adjudications.push(record);
  writeMeta(workUnitId, meta, opts.env);

  const snapshot = await statusCanonicalV2(root, workUnitId, opts);
  return deepFreeze({
    ...snapshot,
    transition: transitioned.transition,
    adjudication_record: record,
  });
}

async function closeCanonicalV2(root, workUnitId, opts = {}) {
  const envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) return deepFreeze({ ok: false, status: 'REFUSED', reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND', blockers: [] });
  if (envelope.work_unit?.state?.lifecycle_state !== 'ADJUDICATED') {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'ADJUDICATED_STATE_REQUIRED',
      blockers: [blocker('ADJUDICATED_STATE_REQUIRED', 'Closure requires prior explicit adjudication.')],
    });
  }
  const meta = readMeta(workUnitId, opts.env);
  const adjudication = meta.adjudications.length ? meta.adjudications[meta.adjudications.length - 1] : null;
  if (!adjudication) {
    return deepFreeze({
      ok: false,
      status: 'REFUSED',
      reason: 'ADJUDICATION_RECORD_REQUIRED',
      blockers: [blocker('ADJUDICATION_RECORD_REQUIRED', 'Closure must cite the explicit human adjudication record.')],
    });
  }

  const closure = {
    closure_id: 'desktop-i4-closure-' + workUnitId,
    evidence_ref: 'closure:desktop:i4:' + workUnitId,
    adjudication_ref: adjudication.evidence_ref,
    actor_kind: 'human',
    actor_id: text(opts.actorId || 'human:desktop-operator'),
  };

  const lifecycleMod = await importBound(root, 'scripts/builder/work-unit-lifecycle-v2.mjs');
  const transitioned = lifecycleMod.transitionLifecycleV2(envelope, {
    to: 'CLOSED',
    evidence_ref: closure.evidence_ref,
    reason_code: 'JARVIS_DESKTOP_I4_EXPLICIT_CLOSE',
  });
  if (!transitioned.ok) {
    return deepFreeze({
      ok: false,
      status: 'LIFECYCLE_REFUSED',
      reason: 'W2_V2_CLOSE_REFUSED',
      blockers: transitioned.blockers,
    });
  }

  writeEnvelope(workUnitId, transitioned.envelope, opts.env);
  meta.closures.push(closure);
  writeMeta(workUnitId, meta, opts.env);

  const snapshot = await statusCanonicalV2(root, workUnitId, opts);
  return deepFreeze({
    ...snapshot,
    transition: transitioned.transition,
    closure_record: closure,
  });
}

function participantReadModel(workUnit) {
  const route = workUnit?.routing?.route_record;
  const participants = [];
  if (isObject(route?.primary)) participants.push(route.primary);
  for (const challenger of Array.isArray(route?.challengers) ? route.challengers : []) {
    if (isObject(challenger)) participants.push(challenger);
  }
  const bindings = Array.isArray(workUnit?.routing?.transport_bindings)
    ? workUnit.routing.transport_bindings
    : [];
  return participants.map((participant) => {
    const related = bindings.filter((binding) => binding?.route_participant_id === participant.participant_id);
    return {
      participant_id: participant.participant_id,
      model_family: participant.model_family,
      role: participant.role,
      review_dimension: participant.review_dimension,
      required_for_completion: participant.required_for_completion === true,
      response_budget_profile_id: participant.response_budget_profile_id || null,
      transport_bindings: related.map((binding) => clone(binding)),
    };
  });
}

function attemptReadModel(workUnit) {
  const attempts = Array.isArray(workUnit?.execution?.attempts) ? workUnit.execution.attempts : [];
  return attempts.map((attempt) => ({
    attempt_id: attempt.attempt_id,
    route_participant_id: attempt.route_participant_id,
    transport_binding_id: attempt.transport_binding_id,
    model_identity_id: attempt.model_identity_id,
    model_family: attempt.model_family,
    provider_id: attempt.provider_id,
    model_id: attempt.model_id,
    adapter_id: attempt.adapter_id,
    role: attempt.role,
    actor_id: attempt.actor_id,
    attempt_kind: attempt.attempt_kind,
    parent_attempt_id: attempt.parent_attempt_id,
    status: attempt.status,
    evidence_refs: clone(attempt.evidence_refs || []),
  }));
}

function verifierReadModel(workUnit) {
  const attempts = Array.isArray(workUnit?.execution?.attempts) ? workUnit.execution.attempts : [];
  const byId = new Map(attempts.map((attempt) => [attempt.attempt_id, attempt]));
  const results = Array.isArray(workUnit?.evaluation?.verifier_results)
    ? workUnit.evaluation.verifier_results
    : [];
  return results.map((result) => {
    const verifier = byId.get(result.verifier_attempt_id) || null;
    return {
      verifier_result_id: result.verifier_result_id,
      target_attempt_id: result.target_attempt_id,
      verifier_attempt_id: result.verifier_attempt_id,
      verifier_kind: verifier?.attempt_kind || null,
      verifier_model_family: verifier?.model_family || null,
      verifier_actor_id: verifier?.actor_id || null,
      disposition: result.disposition,
      evidence_refs: clone(result.evidence_refs || []),
    };
  });
}

function nextActions(workUnit, meta) {
  const state = workUnit?.state?.lifecycle_state;
  const routeParticipants = participantReadModel(workUnit);
  const unbound = routeParticipants.filter((participant) => participant.transport_bindings.length === 0);
  const actions = [];

  if (state === 'DRAFT') actions.push({ action: 'canonical-bound', label: 'Bound scope' });
  if (state === 'BOUNDED') actions.push({ action: 'canonical-authorize', label: 'Authorize Work Unit' });
  if (state === 'AUTHORIZED') actions.push({ action: 'canonical-route', label: 'Bind canonical route' });
  if (state === 'ROUTED') {
    for (const participant of unbound) {
      actions.push({
        action: 'canonical-bind-transport',
        label: 'Bind transport (non-executing)',
        route_participant_id: participant.participant_id,
      });
    }
  }
  if (state === 'EVIDENCE_READY') {
    actions.push({ action: 'canonical-adjudicate', label: 'Adjudicate evidence' });
  }
  if (state === 'ADJUDICATED' && meta.adjudications.length) {
    actions.push({ action: 'canonical-close', label: 'Close Work Unit' });
  }
  return actions;
}

async function statusCanonicalV2(root, workUnitId, opts = {}) {
  const envelope = readEnvelope(workUnitId, opts.env);
  if (!envelope) {
    return deepFreeze({
      ok: false,
      status: 'NOT_FOUND',
      reason: 'CANONICAL_V2_WORK_UNIT_NOT_FOUND',
      mode: MODE,
      work_unit_id: workUnitId,
    });
  }
  const meta = readMeta(workUnitId, opts.env);
  const wu = envelope.work_unit;
  const route = wu.routing?.route_record || null;
  const participants = participantReadModel(wu);
  const attempts = attemptReadModel(wu);
  const verifiers = verifierReadModel(wu);
  const latestAdjudication = meta.adjudications.length
    ? meta.adjudications[meta.adjudications.length - 1]
    : null;
  const latestClosure = meta.closures.length ? meta.closures[meta.closures.length - 1] : null;

  return deepFreeze({
    ok: true,
    status: 'CANONICAL_V2',
    mode: MODE,
    compatibility: false,
    work_unit_id: workUnitId,
    work_unit_version: wu.work_unit_version,
    work_unit: clone(wu),
    authorized_core: {
      identity: clone(wu.identity),
      custody: clone(wu.custody),
      routing_request: clone(wu.routing_request),
      scope: clone(wu.scope),
      authority: clone(wu.authority),
      evaluation: {
        acceptance_conditions: clone(wu.evaluation?.acceptance_conditions || []),
        falsification_conditions: clone(wu.evaluation?.falsification_conditions || []),
        stop_conditions: clone(wu.evaluation?.stop_conditions || []),
      },
    },
    lifecycle: {
      version: envelope.guard?.lifecycle_version || null,
      state: wu.state?.lifecycle_state || null,
      disposition: wu.state?.disposition || null,
      transitions: clone(envelope.transitions || []),
    },
    prospective_preview: clone(meta.prospective_preview),
    preview_comparison: clone(meta.bound_route_comparison || null),
    routing: route ? {
      route_version: wu.routing.route_version,
      route_source: wu.routing.route_source,
      route_digest: wu.routing.route_digest,
      bound_at_sha: wu.routing.bound_at_sha,
      execution_connected: wu.routing.execution_connected,
      task_shape: wu.identity?.task_shape,
      evidence_class: wu.custody?.evidence_class,
      required_authority: clone(route.required_authority || { acts: [], disclosures: [] }),
      blockers: clone(route.blockers || []),
      execution_disposition: route.execution_disposition,
      participants,
    } : null,
    transport_bindings: clone(wu.routing?.transport_bindings || []),
    provenance: {
      model_identities: clone(wu.provenance?.model_identity || []),
      attempts,
      verifier_results: verifiers,
      adjudication: clone(latestAdjudication),
      closure: clone(latestClosure),
    },
    next_actions: nextActions(wu, meta),
    provider_execution: {
      connected: false,
      authority_created: false,
      r4_r5a_required_later: true,
      legacy_r5b_actions_available: false,
    },
    authority_effect: 'none',
    presentation_only: true,
  });
}

module.exports = {
  MODE,
  STORE_VERSION,
  TASK_SHAPES,
  EVIDENCE_CLASSES,
  WORK_CLASSES,
  POSTURES,
  REVIEW_PRESSURES,
  canonicalHome,
  workUnitPath,
  metaPath,
  existsCanonicalV2,
  canonicalInputFromSpec,
  prospectivePreview,
  createCanonicalV2,
  transitionCanonicalV2,
  bindCanonicalRouteV2,
  bindCanonicalTransportV2,
  readCanonicalExecutionEnvelopeV2,
  prepareCanonicalTransportForExecutionV2,
  appendCanonicalExecutionResultV2,
  appendCanonicalVerifierResultV2,
  markCanonicalEvidenceReadyV2,
  adjudicateCanonicalV2,
  closeCanonicalV2,
  statusCanonicalV2,
};
