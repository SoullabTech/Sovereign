/**
 * O4 pre-implementation defeat candidates.
 *
 * These are mutation DESCRIPTORS only. They contain no router and select no
 * capability. The O4 falsifier harness builds each valid baseline from
 * canonical O3/J6 law, changes exactly one named path, and requires the
 * resulting candidate to die on the named blocker.
 */

export const FIXTURE_VERSION = 'o4.defeat-candidates.v1';

export const DEFEAT_CANDIDATES = Object.freeze([
  Object.freeze({
    id: 'F-O4-01',
    law: 'O3 authority gate dominates capability selection',
    scenario: 'o3-gated',
    mutation: Object.freeze({ path: 'candidate.outcome', value: 'ROUTED_LOCAL' }),
    expected_blocker: 'O3_AUTHORITY_GATE_BYPASS',
  }),
  Object.freeze({
    id: 'F-O4-02',
    law: 'routing may not create authority',
    scenario: 'local-model',
    mutation: Object.freeze({
      path: 'candidate.granted_authorities',
      value: Object.freeze(['network.external']),
    }),
    expected_blocker: 'ROUTE_AUTHORITY_GRANT_FORBIDDEN',
  }),
  Object.freeze({
    id: 'F-O4-03',
    law: 'provider availability cannot manufacture provider-spend authority',
    scenario: 'provider-ready-no-spend',
    mutation: Object.freeze({ path: 'candidate.outcome', value: 'EXTERNAL_REVIEW_READY' }),
    expected_blocker: 'PROVIDER_SPEND_NOT_AUTHORIZED',
  }),
  Object.freeze({
    id: 'F-O4-04',
    law: 'deterministic capability wins before model routing',
    scenario: 'deterministic-known',
    mutation: Object.freeze({ path: 'candidate.outcome', value: 'ROUTED_LOCAL' }),
    expected_blocker: 'DETERMINISTIC_CAPABILITY_BYPASSED',
  }),
  Object.freeze({
    id: 'F-O4-05A',
    law: 'release readiness is not PR authority',
    scenario: 'release-ready',
    mutation: Object.freeze({ path: 'candidate.consequence_effect', value: 'PR_CREATE' }),
    expected_blocker: 'CONSEQUENCE_AUTHORITY_FORBIDDEN',
  }),
  Object.freeze({
    id: 'F-O4-05B',
    law: 'release readiness is not merge authority',
    scenario: 'release-ready',
    mutation: Object.freeze({ path: 'candidate.consequence_effect', value: 'MERGE' }),
    expected_blocker: 'CONSEQUENCE_AUTHORITY_FORBIDDEN',
  }),
  Object.freeze({
    id: 'F-O4-05C',
    law: 'release readiness is not deploy authority',
    scenario: 'release-ready',
    mutation: Object.freeze({ path: 'candidate.consequence_effect', value: 'DEPLOY' }),
    expected_blocker: 'CONSEQUENCE_AUTHORITY_FORBIDDEN',
  }),
  Object.freeze({
    id: 'F-O4-05D',
    law: 'release readiness is not production-write authority',
    scenario: 'release-ready',
    mutation: Object.freeze({ path: 'candidate.consequence_effect', value: 'PRODUCTION_WRITE' }),
    expected_blocker: 'CONSEQUENCE_AUTHORITY_FORBIDDEN',
  }),
  Object.freeze({
    id: 'F-O4-06',
    law: 'LOCAL_ONLY evidence cannot route externally',
    scenario: 'local-only-external',
    mutation: Object.freeze({ path: 'candidate.outcome', value: 'EXTERNAL_REVIEW_READY' }),
    expected_blocker: 'LOCAL_ONLY_EVIDENCE',
  }),
  Object.freeze({
    id: 'F-O4-07',
    law: 'external repository review requires disclosure authority',
    scenario: 'external-repo-no-disclosure',
    mutation: Object.freeze({ path: 'candidate.outcome', value: 'EXTERNAL_REVIEW_READY' }),
    expected_blocker: 'EXTERNAL_REPOSITORY_DISCLOSURE_NOT_AUTHORIZED',
  }),
  Object.freeze({
    id: 'F-O4-08A',
    law: 'selected model family cannot be silently substituted',
    scenario: 'external-ready-inkling',
    mutation: Object.freeze({ path: 'candidate.selected_model_family', value: 'NEMOTRON' }),
    expected_blocker: 'MODEL_FAMILY_SUBSTITUTION',
  }),
  Object.freeze({
    id: 'F-O4-08B',
    law: 'selected transport cannot be silently substituted',
    scenario: 'external-ready-inkling',
    mutation: Object.freeze({ path: 'candidate.selected_transport', value: 'nemotron-tinker' }),
    expected_blocker: 'TRANSPORT_SUBSTITUTION',
  }),
  Object.freeze({
    id: 'F-O4-09',
    law: 'same-model retry is not independent review',
    scenario: 'local-model',
    mutation: Object.freeze({ path: 'candidate.retry_counts_as_independent', value: true }),
    expected_blocker: 'RETRY_NOT_INDEPENDENT_REVIEW',
  }),
  Object.freeze({
    id: 'F-O4-10',
    law: 'O4 never emits execution authority',
    scenario: 'local-model',
    mutation: Object.freeze({ path: 'candidate.execution_authorized', value: true }),
    expected_blocker: 'EXECUTION_AUTHORITY_FORBIDDEN',
  }),
  Object.freeze({
    id: 'F-O4-11',
    law: 'ambient held authority is not inherited by the selected capability',
    scenario: 'ambient-authority',
    mutation: Object.freeze({
      path: 'candidate.relevant_authorities',
      value: Object.freeze(['repo.read', 'merge']),
    }),
    expected_blocker: 'AMBIENT_AUTHORITY_INHERITED',
  }),
  Object.freeze({
    id: 'F-O4-12A',
    law: 'unknown explicit deterministic capability cannot normalize into model routing',
    scenario: 'unknown-capability',
    mutation: Object.freeze({ path: 'candidate.outcome', value: 'ROUTED_LOCAL' }),
    expected_blocker: 'UNKNOWN_EXPLICIT_CAPABILITY',
  }),
  Object.freeze({
    id: 'F-O4-12B',
    law: 'unknown provider/transport identity cannot normalize into a valid route',
    scenario: 'external-ready-inkling',
    mutation: Object.freeze({ path: 'request.requested_transport', value: 'future-provider-transport' }),
    expected_blocker: 'UNKNOWN_REQUESTED_TRANSPORT',
  }),
  Object.freeze({
    id: 'F-O4-13',
    law: 'O4 refuses internally inconsistent O3 requirement evidence',
    scenario: 'o3-gated',
    mutation: Object.freeze({
      path: 'o3_entry.requirement_decisions.1.operatorRequired',
      value: false,
    }),
    expected_blocker: 'O3_REQUIREMENT_DECISION_INCOHERENT',
  }),
]);

export const REQUIRED_FALSIFIER_IDS = Object.freeze([
  'F-O4-01',
  'F-O4-02',
  'F-O4-03',
  'F-O4-04',
  'F-O4-05A',
  'F-O4-05B',
  'F-O4-05C',
  'F-O4-05D',
  'F-O4-06',
  'F-O4-07',
  'F-O4-08A',
  'F-O4-08B',
  'F-O4-09',
  'F-O4-10',
  'F-O4-11',
  'F-O4-12A',
  'F-O4-12B',
  'F-O4-13',
]);
