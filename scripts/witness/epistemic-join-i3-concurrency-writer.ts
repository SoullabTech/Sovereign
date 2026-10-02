/** I3C1 synthetic concurrent-writer witness. Disposable DB only. */
import {
  envelope,
  lawfulRequest,
  standingAct,
} from '../../lib/ain/epistemic-join/__tests__/fixtures';
import {
  EpistemicJoinPersistenceConflict,
  persistEpistemicJoinSnapshot,
} from '../../lib/ain/epistemic-join/persistence/store';
import { closePool } from '../../lib/db/postgres';

const memberId = process.env.I3_MEMBER_ID;
const mode = process.env.I3_CONCURRENCY_MODE;
const admissionId = process.env.I3_ADMISSION_ID;
const expectedPreviousAdmissionId =
  process.env.I3_EXPECTED_PREVIOUS_ADMISSION_ID ?? null;

if (!memberId || !mode || !admissionId) {
  throw new Error('I3 concurrency witness env is incomplete');
}

const joinId = 'i3-concurrency-join';
const root = standingAct({
  actId: 'i3-concurrency-root',
  joinId,
  supersedesActId: null,
});
const request = lawfulRequest({
  envelope: envelope({ joinId, memberScope: memberId }),
  standingActs: [root],
});

async function main(): Promise<void> {
  if (mode === 'seed') {
    const receipt = await persistEpistemicJoinSnapshot({
      memberId,
      request,
      expectedPreviousAdmissionId: null,
      admissionId,
    });
    console.log(JSON.stringify({ status: 'seeded', receipt }));
    return;
  }

  if (mode !== 'writer' || !expectedPreviousAdmissionId) {
    throw new Error('writer mode requires I3_EXPECTED_PREVIOUS_ADMISSION_ID');
  }

  console.log(JSON.stringify({
    status: 'attempting',
    admissionId,
    expectedPreviousAdmissionId,
  }));
  try {
    const receipt = await persistEpistemicJoinSnapshot({
      memberId,
      request,
      expectedPreviousAdmissionId,
      admissionId,
    });
    console.log(JSON.stringify({ status: 'success', receipt }));
  } catch (error) {
    if (
      error instanceof EpistemicJoinPersistenceConflict
      && error.reason.startsWith('stale admission tip:')
    ) {
      console.log(JSON.stringify({
        status: 'stale',
        admissionId,
        reason: error.reason,
      }));
      process.exitCode = 3;
      return;
    }
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
