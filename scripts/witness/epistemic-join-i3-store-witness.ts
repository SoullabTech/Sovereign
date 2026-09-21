/**
 * Synthetic-only I3 adapter witness. The shell harness creates a disposable DB
 * and member, then invokes this script with persistence explicitly enabled.
 */
import {
  envelope,
  lawfulRequest,
  standingAct,
} from '../../lib/ain/epistemic-join/__tests__/fixtures';
import {
  EpistemicJoinPersistenceConflict,
  persistEpistemicJoinSnapshot,
} from '../../lib/ain/epistemic-join/persistence/store';

const memberId = process.env.I3_MEMBER_ID;
if (!memberId) throw new Error('I3_MEMBER_ID is required');

const joinId = 'i3-synthetic-join';
const baseEnvelope = envelope({ joinId, memberScope: memberId });
const root = standingAct({
  actId: 'i3-act-root',
  joinId,
  supersedesActId: null,
});

const firstRequest = lawfulRequest({
  envelope: baseEnvelope,
  standingActs: [root],
});
async function main(): Promise<void> {
const first = await persistEpistemicJoinSnapshot({
  memberId,
  request: firstRequest,
  expectedPreviousAdmissionId: null,
  admissionId: '00000000-0000-4000-8000-000000000311',
});

const successor = standingAct({
  actId: 'i3-act-successor',
  joinId,
  basis: 'new_evidence',
  supersedesActId: root.actId,
});

const secondRequest = lawfulRequest({
  envelope: baseEnvelope,
  standingActs: [root, successor],
});

const second = await persistEpistemicJoinSnapshot({
  memberId,
  request: secondRequest,
  expectedPreviousAdmissionId: first.admissionId,
  admissionId: '00000000-0000-4000-8000-000000000312',
});
let staleRefused = false;
try {
  await persistEpistemicJoinSnapshot({
    memberId,
    request: secondRequest,
    expectedPreviousAdmissionId: first.admissionId,
    admissionId: '00000000-0000-4000-8000-000000000313',
  });
} catch (error) {
  staleRefused =
    error instanceof EpistemicJoinPersistenceConflict
    && error.reason.startsWith('stale admission tip:');
}

if (!staleRefused) {
  throw new Error('stale admission tip was not refused');
}

console.log(JSON.stringify({
  first,
  second,
  staleRefused,
  downstreamRepresentationAuthorized: false,
}));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
