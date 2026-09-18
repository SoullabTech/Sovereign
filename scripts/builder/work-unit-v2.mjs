/**
 * JARVIS Work Unit V2 — pure deterministic authorized-core schema.
 *
 * I1 boundary:
 * - new versioned schema only; W0.v1 remains historical
 * - no filesystem, shell, network, environment, clock, randomness, credentials
 * - no routing execution, lifecycle transition, provider/model call, or evidence mutation
 */

export const WORK_UNIT_VERSION = 'W0.v2';

export const WORK_CLASSES = Object.freeze([
  'RESEARCH', 'PATCH', 'REFACTOR', 'REBUILD', 'ARCHITECTURE', 'VERIFICATION', 'DELIVERY',
]);

export const TASK_SHAPES = Object.freeze([
  'CODE_GROUNDED',
  'ARCHITECTURE_REASONING',
  'ADVERSARIAL_FALSIFICATION',
  'LONG_HORIZON_DECOMPOSITION',
  'EVIDENCE_SYNTHESIS',
  'FRONTIER_UNKNOWN',
]);

export const EVIDENCE_CLASSES = Object.freeze([
  'E0_TASK_TEXT',
  'E1_REPOSITORY_LOCAL',
  'E2_CONTINUITY_LOCAL',
  'E3_EXTERNAL_REPO_BUNDLE',
  'E4_SENSITIVE_OR_PRODUCTION',
]);

export const REPOSITORY_WRITE_SCOPES = Object.freeze(['none', 'worktree']);
export const SHELL_SCOPES = Object.freeze(['none', 'read_only', 'bounded_write']);
export const EXTERNAL_DISCLOSURE_SCOPES = Object.freeze(['none', 'task_text_only', 'exact_bundle']);
export const REQUESTED_POSTURES = Object.freeze([
  'default', 'local_only', 'independent_review', 'adversarial_challenge', 'frontier_text', 'frontier_repository',
]);
export const REVIEW_PRESSURES = Object.freeze(['ordinary', 'high_value_uncertain']);

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function blocker(code, detail, path = null) { return Object.freeze({ code, detail, path }); }
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function nonBlank(value) { return typeof value === 'string' && value.trim().length > 0; }
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function enumOk(value, allowed) { return allowed.includes(value); }
function booleanField(value) { return value === true || value === false; }
function validGitSha(value) { return typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value.trim()); }
function textList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean))];
}
function invalidTextList(value) {
  return !Array.isArray(value) || value.some((entry) => typeof entry !== 'string' || entry.trim().length === 0);
}
function invalidRepoPath(value) {
  if (!nonBlank(value)) return true;
  const p = value.trim();
  return p === '.' || p === '..' || p === '/' || p === '*' || p === '**' || p === '**/*'
    || p.startsWith('/') || p.startsWith('../') || p.includes('/../') || p.includes('\\');
}

function coreBlockers(input) {
  const blocks = [];
  if (!isObject(input)) return [blocker('WORK_UNIT_INPUT_REQUIRED', 'Structured Work Unit input is required.')];

  if (input.work_unit_version != null && input.work_unit_version !== WORK_UNIT_VERSION) {
    blocks.push(blocker(
      'WORK_UNIT_VERSION_MISMATCH',
      'Historical Work Units are not silently reinterpreted as W0.v2.',
      'work_unit_version',
    ));
  }

  const identity = input.identity;
  if (!isObject(identity)) {
    blocks.push(blocker('IDENTITY_REQUIRED', 'identity must be structured.', 'identity'));
  } else {
    if (!nonBlank(identity.id)) blocks.push(blocker('WORK_UNIT_ID_REQUIRED', 'identity.id is required.', 'identity.id'));
    if (!nonBlank(identity.programme)) blocks.push(blocker('PROGRAMME_REQUIRED', 'identity.programme is required.', 'identity.programme'));
    if (!nonBlank(identity.objective)) blocks.push(blocker('OBJECTIVE_REQUIRED', 'identity.objective is required.', 'identity.objective'));
    if (!enumOk(identity.work_class, WORK_CLASSES)) blocks.push(blocker('INVALID_WORK_CLASS', 'identity.work_class is not recognized.', 'identity.work_class'));
    if (!enumOk(identity.task_shape, TASK_SHAPES)) blocks.push(blocker('INVALID_TASK_SHAPE', 'identity.task_shape must use the J5 six-shape vocabulary.', 'identity.task_shape'));
    if (identity.capability != null && !nonBlank(identity.capability)) blocks.push(blocker('INVALID_CAPABILITY', 'identity.capability must be null or nonblank text.', 'identity.capability'));
    if (identity.parent_work_unit != null && !nonBlank(identity.parent_work_unit)) blocks.push(blocker('INVALID_PARENT_WORK_UNIT', 'identity.parent_work_unit must be null or nonblank.', 'identity.parent_work_unit'));
  }

  const custody = input.custody;
  if (!isObject(custody)) {
    blocks.push(blocker('CUSTODY_REQUIRED', 'custody must be structured.', 'custody'));
  } else if (!enumOk(custody.evidence_class, EVIDENCE_CLASSES)) {
    blocks.push(blocker('INVALID_EVIDENCE_CLASS', 'custody.evidence_class must be E0-E4.', 'custody.evidence_class'));
  }

  const routingRequest = input.routing_request;
  if (!isObject(routingRequest)) {
    blocks.push(blocker('ROUTING_REQUEST_REQUIRED', 'routing_request must be structured.', 'routing_request'));
  } else {
    if (!enumOk(routingRequest.requested_posture, REQUESTED_POSTURES)) blocks.push(blocker('INVALID_REQUESTED_POSTURE', 'routing_request.requested_posture is not recognized.', 'routing_request.requested_posture'));
    if (!enumOk(routingRequest.review_pressure, REVIEW_PRESSURES)) blocks.push(blocker('INVALID_REVIEW_PRESSURE', 'routing_request.review_pressure is not recognized.', 'routing_request.review_pressure'));
  }

  const scope = input.scope;
  if (!isObject(scope)) {
    blocks.push(blocker('SCOPE_REQUIRED', 'scope must be structured.', 'scope'));
  } else {
    if (!nonBlank(scope.repository)) blocks.push(blocker('REPOSITORY_REQUIRED', 'scope.repository is required.', 'scope.repository'));
    if (!validGitSha(scope.base_ref)) blocks.push(blocker('EXACT_BASE_REF_REQUIRED', 'scope.base_ref must be an exact 40-character Git SHA.', 'scope.base_ref'));
    if (invalidTextList(scope.allowed_paths)) blocks.push(blocker('INVALID_ALLOWED_PATHS', 'scope.allowed_paths must be nonblank repository-relative paths.', 'scope.allowed_paths'));
    if (invalidTextList(scope.forbidden_paths)) blocks.push(blocker('INVALID_FORBIDDEN_PATHS', 'scope.forbidden_paths must be nonblank repository-relative paths.', 'scope.forbidden_paths'));
    for (const p of textList(scope.allowed_paths)) {
      if (invalidRepoPath(p)) { blocks.push(blocker('UNBOUNDED_ALLOWED_PATH', 'Allowed paths must be bounded repository-relative paths.', 'scope.allowed_paths')); break; }
    }
    for (const p of textList(scope.forbidden_paths)) {
      if (invalidRepoPath(p)) { blocks.push(blocker('INVALID_FORBIDDEN_PATH', 'Forbidden paths must be bounded repository-relative paths.', 'scope.forbidden_paths')); break; }
    }
    const allowed = new Set(textList(scope.allowed_paths));
    if (textList(scope.forbidden_paths).some((p) => allowed.has(p))) blocks.push(blocker('CONFLICTING_PATH_SCOPE', 'A path appears in both allowed and forbidden scope.', 'scope'));
  }

  const authority = input.authority;
  if (!isObject(authority)) {
    blocks.push(blocker('AUTHORITY_REQUIRED', 'authority must be structured.', 'authority'));
  } else {
    if (!booleanField(authority.repository_read)) blocks.push(blocker('INVALID_REPOSITORY_READ', 'authority.repository_read must be boolean.', 'authority.repository_read'));
    if (!enumOk(authority.repository_write, REPOSITORY_WRITE_SCOPES)) blocks.push(blocker('INVALID_REPOSITORY_WRITE', 'authority.repository_write must be none or worktree.', 'authority.repository_write'));
    if (!enumOk(authority.shell, SHELL_SCOPES)) blocks.push(blocker('INVALID_SHELL_SCOPE', 'authority.shell is not recognized.', 'authority.shell'));
    if (!booleanField(authority.network_external)) blocks.push(blocker('INVALID_NETWORK_AUTHORITY', 'authority.network_external must be boolean.', 'authority.network_external'));
    if (!booleanField(authority.provider_spend)) blocks.push(blocker('INVALID_PROVIDER_SPEND', 'authority.provider_spend must be boolean.', 'authority.provider_spend'));
    if (!enumOk(authority.external_disclosure, EXTERNAL_DISCLOSURE_SCOPES)) blocks.push(blocker('INVALID_EXTERNAL_DISCLOSURE', 'authority.external_disclosure is not recognized.', 'authority.external_disclosure'));
    for (const field of ['merge', 'deploy', 'production_read', 'production_write']) {
      if (!booleanField(authority[field])) blocks.push(blocker('INVALID_' + field.toUpperCase(), 'authority.' + field + ' must be boolean.', 'authority.' + field));
    }
    if (authority.provider_spend === true && authority.network_external !== true) blocks.push(blocker('SPEND_REQUIRES_EXTERNAL_NETWORK', 'provider_spend requires network_external.', 'authority'));
    if (authority.external_disclosure !== 'none' && authority.network_external !== true) blocks.push(blocker('DISCLOSURE_REQUIRES_EXTERNAL_NETWORK', 'External disclosure requires network_external.', 'authority'));
    const allowedPaths = textList(scope?.allowed_paths);
    if (authority.repository_write === 'worktree' && authority.repository_read !== true) blocks.push(blocker('WRITE_REQUIRES_REPOSITORY_READ', 'worktree write requires repository_read=true.', 'authority.repository_read'));
    if (authority.repository_write === 'worktree' && allowedPaths.length === 0) blocks.push(blocker('WRITE_PATHS_REQUIRED', 'worktree write requires bounded allowed paths.', 'scope.allowed_paths'));
    else if (authority.repository_read === true && allowedPaths.length === 0) blocks.push(blocker('READ_PATHS_REQUIRED', 'repository_read=true requires bounded allowed paths.', 'scope.allowed_paths'));
    if (authority.merge === true && authority.repository_write !== 'worktree') blocks.push(blocker('MERGE_REQUIRES_WORKTREE_WRITE', 'merge cannot be true when repository_write is none.', 'authority.merge'));
  }

  const evaluation = input.evaluation;
  if (!isObject(evaluation)) {
    blocks.push(blocker('EVALUATION_REQUIRED', 'evaluation must be structured.', 'evaluation'));
  } else {
    for (const [field, code] of [
      ['acceptance_conditions', 'ACCEPTANCE_CONDITIONS_REQUIRED'],
      ['falsification_conditions', 'FALSIFICATION_CONDITIONS_REQUIRED'],
      ['stop_conditions', 'STOP_CONDITIONS_REQUIRED'],
    ]) {
      if (invalidTextList(evaluation[field]) || textList(evaluation[field]).length === 0) blocks.push(blocker(code, 'evaluation.' + field + ' must contain at least one condition.', 'evaluation.' + field));
    }
  }

  const provenance = input.provenance;
  if (!isObject(provenance)) {
    blocks.push(blocker('PROVENANCE_REQUIRED', 'provenance must be structured.', 'provenance'));
  } else {
    if (!nonBlank(provenance.creator)) blocks.push(blocker('CREATOR_REQUIRED', 'provenance.creator is required.', 'provenance.creator'));
    if (provenance.authorizing_act != null && !nonBlank(provenance.authorizing_act)) blocks.push(blocker('INVALID_AUTHORIZING_ACT', 'provenance.authorizing_act must be null or nonblank.', 'provenance.authorizing_act'));
    if (invalidTextList(provenance.source_commits) || textList(provenance.source_commits).length === 0) blocks.push(blocker('SOURCE_COMMITS_REQUIRED', 'provenance.source_commits must contain the exact base commit.', 'provenance.source_commits'));
    else if (validGitSha(scope?.base_ref) && !textList(provenance.source_commits).includes(text(scope.base_ref))) blocks.push(blocker('BASE_REF_NOT_IN_PROVENANCE', 'scope.base_ref must appear in provenance.source_commits.', 'provenance.source_commits'));
  }

  return blocks;
}

export function validateWorkUnitV2(input) { return deepFreeze([...coreBlockers(input)]); }

export function createWorkUnitDraftV2(input) {
  const blockers = coreBlockers(input);
  if (blockers.length) return deepFreeze({ ok: false, work_unit: null, blockers });

  const record = {
    work_unit_version: WORK_UNIT_VERSION,
    identity: {
      id: text(input.identity.id),
      programme: text(input.identity.programme),
      parent_work_unit: input.identity.parent_work_unit == null ? null : text(input.identity.parent_work_unit),
      objective: text(input.identity.objective),
      work_class: input.identity.work_class,
      task_shape: input.identity.task_shape,
      capability: input.identity.capability == null ? null : text(input.identity.capability),
    },
    custody: { evidence_class: input.custody.evidence_class },
    routing_request: {
      requested_posture: input.routing_request.requested_posture,
      review_pressure: input.routing_request.review_pressure,
    },
    context: {
      context_refs: textList(input.context?.context_refs),
      evidence_refs: textList(input.context?.evidence_refs),
      assumptions: textList(input.context?.assumptions),
      unknowns: textList(input.context?.unknowns),
    },
    scope: {
      repository: text(input.scope.repository),
      base_ref: text(input.scope.base_ref),
      allowed_paths: textList(input.scope.allowed_paths),
      forbidden_paths: textList(input.scope.forbidden_paths),
    },
    authority: {
      repository_read: input.authority.repository_read,
      repository_write: input.authority.repository_write,
      shell: input.authority.shell,
      network_external: input.authority.network_external,
      provider_spend: input.authority.provider_spend,
      external_disclosure: input.authority.external_disclosure,
      merge: input.authority.merge,
      deploy: input.authority.deploy,
      production_read: input.authority.production_read,
      production_write: input.authority.production_write,
    },
    routing: {
      router_version: null,
      route_version: null,
      route_record: null,
      route_digest: null,
      route_source: null,
      bound_at_sha: null,
      execution_connected: false,
      primary: null,
      challengers: [],
      transport_bindings: [],
    },
    execution: { attempts: [], artifacts: [], diffs: [], test_results: [] },
    evaluation: {
      acceptance_conditions: textList(input.evaluation.acceptance_conditions),
      falsification_conditions: textList(input.evaluation.falsification_conditions),
      stop_conditions: textList(input.evaluation.stop_conditions),
      verifier_results: [],
    },
    provenance: {
      creator: text(input.provenance.creator),
      authorizing_act: input.provenance.authorizing_act == null ? null : text(input.provenance.authorizing_act),
      source_commits: textList(input.provenance.source_commits),
      model_identity: [],
      resulting_commits: [],
      timestamps: [],
    },
    state: {
      lifecycle_state: 'DRAFT',
      disposition: 'open',
      supersedes: input.state?.supersedes == null ? null : text(input.state.supersedes),
    },
  };
  return deepFreeze({ ok: true, work_unit: record, blockers: [] });
}
