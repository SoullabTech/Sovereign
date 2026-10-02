/** I3C1 synthetic persistence -> direct reconstruction witness. */
import assert from 'node:assert/strict';

import {
  adoptionAct,
  author,
  component,
  endpoint,
  envelope,
  lawfulRequest,
  standingAct,
} from '../../lib/ain/epistemic-join/__tests__/fixtures';
import { persistEpistemicJoinSnapshot } from '../../lib/ain/epistemic-join/persistence/store';
import { closePool, query } from '../../lib/db/postgres';

const memberId = process.env.I3_MEMBER_ID;
if (!memberId) throw new Error('I3_MEMBER_ID is required');

const joinId = 'i3-roundtrip-join';
const endpoints = [
  endpoint('i3-rt-reliance', { mode: 'reliance' }),
  endpoint('i3-rt-reference', { mode: 'reference' }),
];
const root = standingAct({
  actId: 'i3-rt-root',
  joinId,
  supersedesActId: null,
});
const successor = standingAct({
  actId: 'i3-rt-successor',
  joinId,
  basis: 'new_evidence',
  supersedesActId: root.actId,
});
const adopted = adoptionAct({
  actId: 'i3-rt-adopt',
  joinId,
  adoptedComponentIds: ['c-meaning'],
  adopter: author({
    authorClass: 'MEMBER_CONFIRMED',
    roleExercised: 'member',
    authorRef: memberId,
  }),
});

const request = lawfulRequest({
  envelope: envelope({
    joinId,
    memberScope: memberId,
    endpoints,
    components: [component('c-meaning')],
  }),
  standingActs: [root, successor],
  adoptionActs: [adopted],
});
async function main(): Promise<void> {
  const firstAdmissionId = '00000000-0000-4000-8000-000000000321';
  const first = await persistEpistemicJoinSnapshot({
    memberId,
    request,
    expectedPreviousAdmissionId: null,
    admissionId: firstAdmissionId,
  });

  const discharge = standingAct({
    actId: 'i3-rt-discharge',
    joinId,
    claimedStanding: 'DISCHARGED',
    basis: 'authority_withdrawal',
    warrantRef: null,
    supersedesActId: successor.actId,
  });
  const dischargeRequest = {
    ...request,
    standingActs: [...request.standingActs, discharge],
    requestedStanding: 'DISCHARGED' as const,
  };
  const second = await persistEpistemicJoinSnapshot({
    memberId,
    request: dischargeRequest,
    expectedPreviousAdmissionId: first.admissionId,
    admissionId: '00000000-0000-4000-8000-000000000322',
  });

  const join = await query<{ envelope: unknown }>(
    'SELECT envelope FROM epistemic_join_records WHERE join_id = $1',
    [joinId],
  );
  const warrants = await query<{ warrant_id: string; warrant: unknown }>(
    'SELECT warrant_id, warrant FROM epistemic_warrant_records WHERE join_id = $1 ORDER BY warrant_id',
    [joinId],
  );
  const deps = await query<{ ref_id: string; dependence_mode: string }>(
    `SELECT ref_id, dependence_mode
       FROM epistemic_join_dependencies
      WHERE join_id = $1
      ORDER BY ref_id`,
    [joinId],
  );
  const acts = await query<{
    act_id: string;
    supersedes_act_id: string | null;
    authorship: unknown;
    jurisdiction: string;
  }>(
    `SELECT act_id, supersedes_act_id, authorship, jurisdiction
       FROM epistemic_standing_acts
      WHERE join_id = $1
      ORDER BY created_at, act_id`,
    [joinId],
  );
  const adoptions = await query<{
    act_id: string;
    adopter: unknown;
    adopter_jurisdiction: string;
    original_proposer: unknown;
  }>(
    `SELECT act_id, adopter, adopter_jurisdiction, original_proposer
       FROM epistemic_adoption_acts
      WHERE join_id = $1`,
    [joinId],
  );
  const admission = await query<{
    evaluation_request: unknown;
    evaluation_result: {
      admittedStanding: string;
      downstreamRepresentationAuthorized: boolean;
      representationAuthority: string;
    };
  }>(
    `SELECT evaluation_request, evaluation_result
       FROM epistemic_join_admissions
      WHERE admission_id = $1::uuid`,
    [firstAdmissionId],
  );
  const current = await query<{ admitted_standing: string }>(
    'SELECT admitted_standing FROM epistemic_join_current_standing WHERE join_id = $1',
    [joinId],
  );

  assert.equal(join.rows.length, 1);
  assert.deepStrictEqual(join.rows[0]?.envelope, request.envelope);
  assert.equal(warrants.rows.length, 1);
  assert.equal(warrants.rows[0]?.warrant_id, request.warrants[0]?.warrantId);
  assert.deepStrictEqual(warrants.rows[0]?.warrant, request.warrants[0]);
  assert.deepStrictEqual(
    deps.rows,
    [
      { ref_id: 'i3-rt-reference', dependence_mode: 'reference' },
      { ref_id: 'i3-rt-reliance', dependence_mode: 'reliance' },
    ],
  );
  const actsById = new Map(acts.rows.map((row) => [row.act_id, row] as const));
  assert.equal(actsById.get('i3-rt-root')?.supersedes_act_id, null);
  assert.equal(
    actsById.get('i3-rt-successor')?.supersedes_act_id,
    'i3-rt-root',
  );
  assert.equal(
    actsById.get('i3-rt-discharge')?.supersedes_act_id,
    'i3-rt-successor',
  );
  assert.deepStrictEqual(actsById.get('i3-rt-root')?.authorship, root.authorship);
  assert.equal(actsById.get('i3-rt-root')?.jurisdiction, root.jurisdiction);

  assert.equal(adoptions.rows.length, 1);
  assert.deepStrictEqual(adoptions.rows[0]?.adopter, adopted.adopter);
  assert.equal(adoptions.rows[0]?.adopter_jurisdiction, adopted.adopterJurisdiction);
  assert.deepStrictEqual(adoptions.rows[0]?.original_proposer, adopted.originalProposer);
  assert.deepStrictEqual(admission.rows[0]?.evaluation_request, request);
  assert.equal(admission.rows[0]?.evaluation_result.admittedStanding, first.admittedStanding);
  assert.equal(
    admission.rows[0]?.evaluation_result.downstreamRepresentationAuthorized,
    false,
  );
  assert.equal(admission.rows[0]?.evaluation_result.representationAuthority, 'closed');
  assert.equal(second.admittedStanding, 'DISCHARGED');
  assert.equal(current.rows[0]?.admitted_standing, 'DISCHARGED');

  const history = await query<{ act_id: string }>(
    'SELECT act_id FROM epistemic_standing_acts WHERE join_id = $1',
    [joinId],
  );
  assert.equal(history.rows.length, 3);

  console.log(JSON.stringify({
    roundTrip: true,
    referenceReliancePreserved: true,
    authorshipJurisdictionPreserved: true,
    adoptionProvenancePreserved: true,
    dischargePreservedHistory: true,
    representationClosed: true,
  }));
}
main()
  .catch((error) => {
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
