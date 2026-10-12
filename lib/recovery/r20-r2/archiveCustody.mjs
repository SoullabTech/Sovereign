/**
 * R20-R2 archive custody: read-only classification/planning only.
 * NEVER removes backup files, NAS snapshots, vault bytes or offsite replicas.
 * Any archive whose deletion sequence is unknown is not assumed safe.
 *
 * Existing historical MAIA manifests lack an externally signed high-water
 * sequence, so this planner must HOLD them until proven otherwise.
 */
const SHA = /^[a-f0-9]{64}$/;
const CLASSES = new Set(['postgres', 'media', 'vault', 'synology_snapshot', 'offsite_replica', 'time_machine']);

function fail(reason) { throw new Error('R20 archive custody refused: ' + reason); }

export function planArchiveCustody({ archives, deletionHighWater, cleanContinuity, humanAuthorization }) {
  if (!Number.isSafeInteger(deletionHighWater) || deletionHighWater < 0 ||
      !Array.isArray(archives)) {
    fail('invalid independent deletion high-water or archive inventory');
  }
  const continuity = cleanContinuity?.verified === true &&
    cleanContinuity?.restoreTestPassed === true &&
    Number.isSafeInteger(cleanContinuity?.coverageSequence) &&
    cleanContinuity.coverageSequence >= deletionHighWater;
  const seen = new Set();

  const dispositions = archives.map(archive => {
    if (!archive || typeof archive.id !== 'string' || !archive.id ||
        seen.has(archive.id) || !CLASSES.has(archive.class)) {
      fail('unrecognized or duplicate archive custody entry');
    }
    seen.add(archive.id);

    let status, reason;
    if (!SHA.test(archive.sha256 || '') ||
        !Number.isSafeInteger(archive.coverageSequence)) {
      status = 'HELD_UNATTRIBUTED';
      reason = 'archive digest/independent deletion coverage unavailable';
    } else if (archive.coverageSequence > deletionHighWater ||
               archive.coverageSequence < 0) {
      status = 'HELD_UNVERIFIABLE';
      reason = 'future or invalid archive deletion high-water';
    } else if (archive.coverageSequence < deletionHighWater) {
      status = 'POTENTIALLY_CONTAMINATED';
      reason = 'archive predates a later deletion authority event';
    } else if (archive.contentIntegrityVerified !== true) {
      status = 'HELD_UNVERIFIED';
      reason = 'no successful archive integrity/restore evidence';
    } else {
      status = 'CLEAN_CANDIDATE';
      reason = 'independent deletion coverage is current; separate restoration still required';
    }

    const canRequestPurge =
      status === 'POTENTIALLY_CONTAMINATED' &&
      continuity &&
      humanAuthorization?.scope === 'EXACT_ARCHIVE_IDS' &&
      humanAuthorization?.reviewedArchiveIds?.includes(archive.id) === true &&
      humanAuthorization?.approved === true;

    return Object.freeze({
      id: archive.id,
      class: archive.class,
      status,
      reason,
      nextAction: canRequestPurge ?
        'ELIGIBLE_FOR_SEPARATE_MANUAL_PURGE_REVIEW' : 'HOLD_AND_REVIEW',
      deleted: false, // always false — no deletion side effect in this module
    });
  });

  return Object.freeze({
    deletionHighWater,
    cleanContinuityVerified: continuity,
    decisions: dispositions,
    automaticDeletionAuthorized: false,
    productionSnapshotsAuthorized: false,
  });
}
