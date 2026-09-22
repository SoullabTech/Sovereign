/**
 * MAIA-TEACHING-APPLICATIONS-01 / A2 — constitutional evidence matrix.
 *
 * Pure test-only evidence. The matrix proves A2 contract boundaries and mapping
 * completeness. A3–A5 still owe application/runtime behavioral evidence.
 */
import assert from 'node:assert/strict';
import {
  APPLICATION_PROFILES,
  canonicalDomainKeys,
  effectDecision,
  transitionDecision,
  validateApplicationProfile,
  type TeachingApplicationProfile,
} from './contract';

const line = (text: string) => process.stdout.write(`${text}\n`);

const FALSIFIER_IDS = [
  'F-A0-01', 'F-A0-02', 'F-A0-03', 'F-A0-04', 'F-A0-05',
  'F-A0-06', 'F-A0-07', 'F-A0-08', 'F-A0-09', 'F-A0-10',
  'F-A0-11', 'F-A0-12', 'F-A0-13', 'F-A0-14', 'F-A0-15',
  'F-A0-16', 'F-A0-17', 'F-A0-18', 'F-A0-19', 'F-A0-20',
] as const;

const FALSIFIER_MAPPING: Readonly<Record<(typeof FALSIFIER_IDS)[number], {
  scope: string;
  clause: string;
  laterEvidence: 'A3' | 'A4' | 'A5' | 'A3-A5';
}>> = {
  'F-A0-01': { scope: 'global', clause: 'I/II/XII', laterEvidence: 'A3-A5' },
  'F-A0-02': { scope: 'global', clause: 'XIV', laterEvidence: 'A3-A5' },
  'F-A0-03': { scope: 'writers_studio', clause: 'VIII/XII', laterEvidence: 'A3' },
  'F-A0-04': { scope: 'writers_studio', clause: 'VIII', laterEvidence: 'A3' },
  'F-A0-05': { scope: 'practitioner', clause: 'V/X/XII', laterEvidence: 'A4' },
  'F-A0-06': { scope: 'practitioner/research', clause: 'III', laterEvidence: 'A4' },
  'F-A0-07': { scope: 'global', clause: 'I/XIV', laterEvidence: 'A3-A5' },
  'F-A0-08': { scope: 'global', clause: 'XIV', laterEvidence: 'A3-A5' },
  'F-A0-09': { scope: 'soullab', clause: 'I/XI', laterEvidence: 'A3-A5' },
  'F-A0-10': { scope: 'research', clause: 'XI', laterEvidence: 'A5' },
  'F-A0-11': { scope: 'global', clause: 'IX/XI', laterEvidence: 'A3-A5' },
  'F-A0-12': { scope: 'global', clause: 'IX', laterEvidence: 'A3-A5' },
  'F-A0-13': { scope: 'global', clause: 'IV/IX/XIV', laterEvidence: 'A3-A5' },
  'F-A0-14': { scope: 'source-bearing', clause: 'IX', laterEvidence: 'A3-A5' },
  'F-A0-15': { scope: 'global', clause: 'I/XII', laterEvidence: 'A3-A5' },
  'F-A0-16': { scope: 'global', clause: 'VI/VII', laterEvidence: 'A3-A5' },
  'F-A0-17': { scope: 'global', clause: 'I', laterEvidence: 'A3-A5' },
  'F-A0-18': { scope: 'host-bound', clause: 'III/VIII', laterEvidence: 'A3' },
  'F-A0-19': { scope: 'global', clause: 'VII/XII/XIV', laterEvidence: 'A3-A5' },
  'F-A0-20': { scope: 'global', clause: 'I/XIV', laterEvidence: 'A3-A5' },
};

function mutableClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function errorCodes(profile: TeachingApplicationProfile): readonly string[] {
  return validateApplicationProfile(profile).map((e) => e.code);
}

line('── canonical profiles ───────────────────────────────────────────────');

const profileNames = Object.keys(APPLICATION_PROFILES).sort();
assert.deepEqual(profileNames, [
  'coaching_practice',
  'general_maia',
  'research_lab',
  'therapist_practitioner',
  'writers_studio',
]);

for (const [surface, profile] of Object.entries(APPLICATION_PROFILES)) {
  const errors = validateApplicationProfile(profile);
  assert.deepEqual(errors, [], `${surface}: ${JSON.stringify(errors)}`);
  assert.deepEqual(
    [...profile.domainKeys].sort(),
    [...canonicalDomainKeys(profile.hostSurface)].sort(),
    `${surface}: domain scope drift`,
  );
  line(`  ✅ ${surface}`);
}

line('');
line('── G1 · authority evidence forms ─────────────────────────────────────');

assert.equal(
  APPLICATION_PROFILES.writers_studio.surfaceAuthorityBasis,
  'SERVER_BOUND_HOST_ROUTE_CURRENT_INTERACTION',
);
assert.equal(APPLICATION_PROFILES.writers_studio.structuralAuthorityEvidence?.clientSelectable, false);
assert.equal(
  APPLICATION_PROFILES.writers_studio.structuralAuthorityEvidence?.elevatedProfessionalOrResearchRole,
  false,
);
for (const surface of [
  'general_maia',
  'coaching_practice',
  'therapist_practitioner',
  'research_lab',
] as const) {
  assert.equal(
    APPLICATION_PROFILES[surface].surfaceAuthorityBasis,
    'SERVER_ADJUDICATED_CURRENT_TURN',
  );
  assert.equal(APPLICATION_PROFILES[surface].structuralAuthorityEvidence, null);
}
line('  ✅ bounded Writer structural authority is distinct from four T8B shared surfaces');

const badWriterClientSelectable = mutableClone(APPLICATION_PROFILES.writers_studio);
(badWriterClientSelectable as any).structuralAuthorityEvidence.clientSelectable = true;
assert.ok(errorCodes(badWriterClientSelectable).includes('WRITER_STRUCTURAL_EVIDENCE'));
line('  ✅ client-selectable Writer authority is killed');

line('');
line('── G2 · source plane / retrieval ─────────────────────────────────────');

assert.equal(APPLICATION_PROFILES.writers_studio.sourcePlane, 'NO_GOVERNED_SOURCE_WIRING');
assert.equal(APPLICATION_PROFILES.writers_studio.retrievalAuthority, 'NO_NEW_ACQUISITION');
assert.equal(
  effectDecision(APPLICATION_PROFILES.writers_studio, 'NEW_SOURCE_RETRIEVAL'),
  'STOP_RETRIEVAL_GOVERNANCE',
);
const badWriterRetrieval = mutableClone(APPLICATION_PROFILES.writers_studio);
(badWriterRetrieval as any).sourcePlane = 'INHERITED_SHARED_ROUTE';
(badWriterRetrieval as any).retrievalAuthority = 'INHERITED_ONLY_NO_NEW_ACQUISITION';
assert.ok(errorCodes(badWriterRetrieval).includes('WRITER_RETRIEVAL_WIDENING'));
line('  ✅ permitted source classes do not manufacture Writer retrieval');

/* ⭐ The combined mutant above changes BOTH fields, and the validator refuses
   through one compound OR — so either clause could disappear while this test
   stayed green, because the surviving clause still kills the double mutant.
   A2 declares source-plane standing and retrieval authority to be SEPARATE
   governance facts, so each load-bearing clause needs a mutant that depends on
   that clause ALONE. The assert on the untouched field is part of the law, not
   decoration: without it a single-field candidate could silently drift back
   into a double mutant and the masking would return unnoticed. */

const badWriterSourcePlaneOnly = mutableClone(APPLICATION_PROFILES.writers_studio);
(badWriterSourcePlaneOnly as any).sourcePlane = 'INHERITED_SHARED_ROUTE';
assert.equal(
  (badWriterSourcePlaneOnly as any).retrievalAuthority,
  'NO_NEW_ACQUISITION',
  'G2-A must vary sourcePlane alone',
);
assert.ok(errorCodes(badWriterSourcePlaneOnly).includes('WRITER_RETRIEVAL_WIDENING'));
line('  ✅ G2-A source-plane widening dies on its own clause');

const badWriterRetrievalOnly = mutableClone(APPLICATION_PROFILES.writers_studio);
(badWriterRetrievalOnly as any).retrievalAuthority = 'INHERITED_ONLY_NO_NEW_ACQUISITION';
assert.equal(
  (badWriterRetrievalOnly as any).sourcePlane,
  'NO_GOVERNED_SOURCE_WIRING',
  'G2-B must vary retrievalAuthority alone',
);
assert.ok(errorCodes(badWriterRetrievalOnly).includes('WRITER_RETRIEVAL_WIDENING'));
line('  ✅ G2-B retrieval-authority widening dies on its own clause');

line('');
line('── G3 · practitioner terminality ─────────────────────────────────────');

for (const surface of ['coaching_practice', 'therapist_practitioner'] as const) {
  const p = APPLICATION_PROFILES[surface];
  assert.equal(p.professionalJudgmentOwner, 'practitioner');
  assert.equal(p.downstreamHandoff, 'NONE_TERMINAL_EDUCATION');
  assert.equal(effectDecision(p, 'DIAGNOSIS'), 'STOP_HOST_OR_CORE_AUTHORITY');
  assert.equal(effectDecision(p, 'TREATMENT_DIRECTION'), 'STOP_HOST_OR_CORE_AUTHORITY');
  assert.equal(effectDecision(p, 'CLIENT_ACTION'), 'STOP_HOST_OR_CORE_AUTHORITY');
}
const badPractitioner = mutableClone(APPLICATION_PROFILES.therapist_practitioner);
(badPractitioner as any).downstreamHandoff = 'NONE';
assert.ok(errorCodes(badPractitioner).includes('PRACTITIONER_ACTION_CAPTURE'));
line('  ✅ practitioner teaching remains terminal education');

line('');
line('── G4 + C-A0-12 · domain authority never unions ─────────────────────');

const coach = APPLICATION_PROFILES.coaching_practice;
const practitioner = APPLICATION_PROFILES.therapist_practitioner;
assert.equal(coach.domainKeys.includes('relational_geometry'), false);
assert.equal(practitioner.domainKeys.includes('relational_geometry'), true);
assert.equal(
  transitionDecision(coach, 'coaching_practice', 'relational_geometry'),
  'ROUTE_OUTWARD_PLATFORM_BINDING',
);
assert.equal(
  transitionDecision(coach, 'therapist_practitioner', 'relational_geometry'),
  'READJUDICATE_SURFACE_OR_REFRAIN',
);
assert.equal(
  transitionDecision(
    practitioner,
    'therapist_practitioner',
    practitioner.domainKeys[0]!,
  ),
  'CONTINUE_WITHIN_CURRENT_ENVELOPE',
);
const widenedCoach = mutableClone(coach);
(widenedCoach as any).domainKeys.push('relational_geometry');
assert.ok(errorCodes(widenedCoach).includes('DOMAIN_SCOPE_DRIFT'));
line('  ✅ cross-surface capability cannot widen current surface scope');

line('');
line('── Writer custody + research boundary ───────────────────────────────');

assert.equal(
  effectDecision(APPLICATION_PROFILES.writers_studio, 'MANUSCRIPT_MUTATION'),
  'HANDOFF_EXISTING_HOST_AUTHORITY',
);
assert.equal(APPLICATION_PROFILES.writers_studio.mutationAuthority, 'NONE');
assert.equal(APPLICATION_PROFILES.writers_studio.artifactAuthorshipOwner, 'writer');

assert.equal(APPLICATION_PROFILES.research_lab.scientificJudgmentOwner, 'researcher');
assert.equal(APPLICATION_PROFILES.research_lab.scientificExecutionAuthority, 'NONE');
assert.equal(
  effectDecision(APPLICATION_PROFILES.research_lab, 'RESEARCH_EXECUTION'),
  'STOP_HOST_OR_CORE_AUTHORITY',
);
line('  ✅ teaching points outward without taking host/scientific authority');

line('');
line('── authority defaults + parallel-teacher falsification ──────────────');

for (const p of Object.values(APPLICATION_PROFILES)) {
  assert.equal(p.mutationAuthority, 'NONE');
  assert.equal(p.providerRoutingAuthority, 'NONE');
  assert.equal(p.learnerPersistenceAuthority, 'NONE');
  assert.equal(p.scientificExecutionAuthority, 'NONE');
}
const parallelTeacher = mutableClone(APPLICATION_PROFILES.general_maia);
(parallelTeacher as any).teacherIdentity = 'SECOND_TEACHER';
assert.ok(errorCodes(parallelTeacher).includes('PARALLEL_TEACHER'));
line('  ✅ A0 authority defaults remain closed and second teacher is killed');

line('');
line('── F-A0-01 … F-A0-20 mapping completeness ─────────────────────────');

assert.deepEqual(Object.keys(FALSIFIER_MAPPING).sort(), [...FALSIFIER_IDS].sort());
assert.equal(new Set(Object.keys(FALSIFIER_MAPPING)).size, 20);
for (const id of FALSIFIER_IDS) {
  const row = FALSIFIER_MAPPING[id];
  assert.ok(row.scope.length > 0, `${id}: scope missing`);
  assert.ok(row.clause.length > 0, `${id}: clause missing`);
  assert.ok(row.laterEvidence.length > 0, `${id}: later evidence owner missing`);
}
line('  ✅ all 20 A0 falsifiers mapped to A2 clauses and later evidence owners');

line('');
line('── verdict ──────────────────────────────────────────────────────────');
line('  ⭐ A2 APPLICATION CONTRACT MATRIX PASS');
line('  five profiles · G1–G4 resolved · authority defaults closed · 20/20 falsifiers mapped');
line('  ⛔ no A3/A4/A5 runtime evidence claimed');
