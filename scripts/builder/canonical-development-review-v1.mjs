/**
 * JARVIS-CANONICAL-DEVELOPMENT-01 / D6
 *
 * Pure review-orchestration plan for an exact D4 development commit.
 *
 * D6 creates no Work Unit and performs no provider/network/spend act. It emits
 * canonical Desktop spec candidates that must still pass W0/W2/W3/E1 and the
 * existing one-shot provider authorization flow.
 */

export const DEVELOPMENT_REVIEW_PLAN_VERSION = 'D6.v1';

export const DEVELOPMENT_REVIEW_MODES = Object.freeze([
  'local',
  'adversarial',
  'frontier',
  'full',
]);

function blocker(code, detail, path = null) {
  return Object.freeze({ code, detail, path });
}
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}
function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}
function validSha(value) {
  return /^[0-9a-f]{40}$/i.test(text(value));
}
function safePath(value) {
  if (typeof value !== 'string') return null;
  const p = value.trim();
  if (!p || p.startsWith('/') || p.startsWith('../') || p.includes('/../') || p.includes('\\')) return null;
  return p.replace(/^\.\//, '');
}
function allowed(candidate, roots) {
  const p = safePath(candidate);
  if (!p) return false;
  return roots.some((root) => p === root || p.startsWith(root + '/'));
}
function unique(values) {
  return [...new Set(values)];
}
function focus(paths) {
  return unique(paths).join('\n');
}
function baseSpec({ objective, taskShape, posture, changedPaths, external = false }) {
  return {
    executionIntent: 'review',
    objective,
    workClass: 'VERIFICATION',
    taskShape,
    capability: '',
    evidenceClass: 'E1_REPOSITORY_LOCAL',
    requestedPosture: posture,
    reviewPressure: 'high_value_uncertain',
    evidenceFocus: focus(changedPaths),
    acceptanceCriteria: [
      'Identify concrete defects, regressions, or authority violations grounded in the exact committed evidence.',
      'Distinguish mechanical evidence from semantic judgment.',
      'Do not create merge, deploy, or production authority.',
    ].join('\n'),
    falsificationConditions: [
      'The review relies on evidence outside the exact changed-path bundle.',
      'The review invents repository-write, merge, deploy, production, or authority-changing permission.',
    ].join('\n'),
    stopConditions: [
      'Stop if the exact commit evidence cannot be materialized.',
      'Stop before any repository write, merge, deploy, or production action.',
    ].join('\n'),
    authorityRequest: external
      ? {
        networkExternal: true,
        providerSpend: true,
        externalDisclosure: 'exact_bundle',
      }
      : {
        networkExternal: false,
        providerSpend: false,
        externalDisclosure: 'none',
      },
  };
}

function localSpec(commitSha, paths) {
  return baseSpec({
    objective: 'Independently review JARVIS development commit ' + commitSha + ' using local open-weight models.',
    taskShape: 'CODE_GROUNDED',
    posture: 'default',
    changedPaths: paths,
  });
}
function inklingSpec(commitSha, paths) {
  return baseSpec({
    objective: 'Adversarially review JARVIS development commit ' + commitSha + ' for hidden defects and authority violations.',
    taskShape: 'CODE_GROUNDED',
    posture: 'adversarial_challenge',
    changedPaths: paths,
    external: true,
  });
}
function nemotronSpec(commitSha, paths) {
  return baseSpec({
    objective: 'Synthesize the exact evidence for JARVIS development commit ' + commitSha + ' and identify architectural or long-horizon risks.',
    taskShape: 'EVIDENCE_SYNTHESIS',
    posture: 'frontier_repository',
    changedPaths: paths,
    external: true,
  });
}

export function deriveDevelopmentReviewPlanV1({
  developmentWorkUnit,
  commitRecord,
  publicationRecord = null,
  mode = 'local',
} = {}) {
  const blocks = [];
  if (!DEVELOPMENT_REVIEW_MODES.includes(mode)) {
    blocks.push(blocker('INVALID_REVIEW_MODE', 'D6 review mode is not recognized.', 'mode'));
  }
  if (!commitRecord || commitRecord.version !== 'D4-COMMIT.v1'
      || commitRecord.status !== 'COMMITTED_LOCAL') {
    blocks.push(blocker('LOCAL_COMMIT_RECEIPT_REQUIRED', 'D6 requires the exact D4 local commit receipt.'));
  }
  if (!developmentWorkUnit || developmentWorkUnit.work_unit_version !== 'W0.v2') {
    blocks.push(blocker('DEVELOPMENT_WORK_UNIT_REQUIRED', 'D6 requires the originating W0.v2 development Work Unit.'));
  }

  if (commitRecord && developmentWorkUnit) {
    if (commitRecord.work_unit_id !== developmentWorkUnit.identity?.id) {
      blocks.push(blocker('WORK_UNIT_ID_MISMATCH', 'D6 commit does not belong to the supplied development Work Unit.'));
    }
    if (commitRecord.base_sha !== developmentWorkUnit.scope?.base_ref) {
      blocks.push(blocker('BASE_SHA_MISMATCH', 'D6 commit is not descended from the governed development base.'));
    }
  }
  if (commitRecord && !validSha(commitRecord.commit_sha)) {
    blocks.push(blocker('EXACT_COMMIT_SHA_REQUIRED', 'D6 requires the exact 40-character development commit SHA.'));
  }

  const roots = (developmentWorkUnit?.scope?.allowed_paths || [])
    .map(safePath)
    .filter(Boolean);
  const changedPaths = unique(commitRecord?.changed_paths
    || commitRecord?.verification_changed_paths
    || []);
  // D4-COMMIT.v1 currently binds the verified diff digest but may not repeat
  // changed_paths. A caller may therefore supply the D3/D4 verified population
  // through commitRecord.verification_changed_paths until the Desktop composition
  // record carries it directly.
  if (!changedPaths.length) {
    blocks.push(blocker(
      'VERIFIED_CHANGED_PATHS_REQUIRED',
      'D6 requires the verified changed-path population from D3/D4 evidence.',
    ));
  } else {
    for (const p of changedPaths) {
      if (!safePath(p) || !allowed(p, roots)) {
        blocks.push(blocker(
          'REVIEW_PATH_OUTSIDE_DEVELOPMENT_SCOPE',
          'D6 review path is outside the originating development scope: ' + p,
          p,
        ));
      }
    }
  }

  if (publicationRecord) {
    if (publicationRecord.version !== 'D5.v1'
        || publicationRecord.status !== 'PUBLISHED_FOR_REVIEW') {
      blocks.push(blocker('PUBLICATION_RECORD_INVALID', 'D6 publication record must be a D5 PUBLISHED_FOR_REVIEW receipt.'));
    } else if (publicationRecord.commit_sha !== commitRecord?.commit_sha) {
      blocks.push(blocker('PUBLICATION_COMMIT_MISMATCH', 'D6 publication record identifies a different commit.'));
    }
  }

  if (blocks.length) {
    return deepFreeze({
      ok: false,
      version: DEVELOPMENT_REVIEW_PLAN_VERSION,
      status: 'REFUSED',
      blockers: blocks,
      reviews: [],
    });
  }

  const commitSha = commitRecord.commit_sha;
  const reviews = [
    {
      review_id: 'local-independent',
      purpose: 'local_independent_model_review',
      expected_families: ['QWEN', 'GPT_OSS'],
      external: false,
      metered: false,
      spec: localSpec(commitSha, changedPaths),
    },
  ];
  if (mode === 'adversarial' || mode === 'full') {
    reviews.push({
      review_id: 'inkling-adversarial',
      purpose: 'external_adversarial_review',
      expected_families: ['QWEN', 'GPT_OSS', 'INKLING'],
      external: true,
      metered: true,
      spec: inklingSpec(commitSha, changedPaths),
    });
  }
  if (mode === 'frontier' || mode === 'full') {
    reviews.push({
      review_id: 'nemotron-frontier',
      purpose: 'external_frontier_evidence_synthesis',
      expected_families: ['GPT_OSS', 'QWEN', 'NEMOTRON'],
      external: true,
      metered: true,
      spec: nemotronSpec(commitSha, changedPaths),
    });
  }

  return deepFreeze({
    ok: true,
    version: DEVELOPMENT_REVIEW_PLAN_VERSION,
    status: 'REVIEW_PLAN_READY',
    blockers: [],
    development_work_unit_id: developmentWorkUnit.identity.id,
    development_commit_sha: commitSha,
    development_base_sha: developmentWorkUnit.scope.base_ref,
    changed_paths: changedPaths.sort(),
    publication_ref: publicationRecord?.pull_request_url || null,
    mode,
    reviews,
    automatic_provider_execution: false,
    automatic_network_authorization: false,
    automatic_spend_authorization: false,
    automatic_merge: false,
    automatic_deploy: false,
  });
}
