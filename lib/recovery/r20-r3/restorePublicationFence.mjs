/**
 * R20-R3I — synthetic-only, fail-closed restore publication fence.
 *
 * This contract verifies a separately signed ledger/head/pin twice and
 * requires an exclusive deletion/restore publication fence between the final
 * verification and a synthetic acknowledgement. A production deployment
 * must supply a genuinely independent, durable signer, authoritative
 * committed-outbox census and atomic publication coordinator.
 *
 * No production keys, member contents, database, vault, network clients or
 * actual publication routines are present here. The caller cannot opt out
 * of the synthetic-only boundary.
 */
import { readAndAdmitExternalCapturedAuthority } from './externalAnchorBoundary.mjs';

export const SYNTHETIC_TARGET = 'R20_R3I_DISPOSABLE_FIXTURE_ONLY';
const SHA = /^[0-9a-f]{64}$/;
const FIXTURE_ID = /^fixture-[a-z0-9-]{1,70}$/;

function refuse(code) {
  throw new Error('R20-R3I restore publication refused: ' + code);
}

function validFixtureArchive(archive) {
  const fields = [
    'archiveId', 'captureGeneration', 'capturedDeletionSequence',
    'containsMemberData', 'fixtureDigest', 'type',
  ];
  return archive && typeof archive === 'object' && !Array.isArray(archive) &&
    Object.keys(archive).length === fields.length &&
    fields.every(key => Object.prototype.hasOwnProperty.call(archive, key)) &&
    archive.type === 'SYNTHETIC_CONTENT_FREE_ARCHIVE' &&
    archive.containsMemberData === false &&
    typeof archive.archiveId === 'string' &&
    FIXTURE_ID.test(archive.archiveId) &&
    typeof archive.captureGeneration === 'string' &&
    FIXTURE_ID.test(archive.captureGeneration) &&
    Number.isSafeInteger(archive.capturedDeletionSequence) &&
    archive.capturedDeletionSequence >= 0 &&
    typeof archive.fixtureDigest === 'string' &&
    SHA.test(archive.fixtureDigest);
}

async function verifiedAuthority(readCurrentAuthorityInputs) {
  let input;
  try {
    input = await readCurrentAuthorityInputs();
  } catch {
    refuse('independent_authority_unavailable');
  }
  let witnessed;
  try {
    witnessed = await readAndAdmitExternalCapturedAuthority(input);
  } catch {
    refuse('independent_authority_invalid_or_incomplete');
  }
  if (witnessed.state !== 'R20_EXTERNAL_ANCHOR_CONTRACT_SYNTHETIC_VERIFIED' ||
      witnessed.witnessOriginCount !== 3 ||
      witnessed.independentKeyRoleCount !== 3 ||
      witnessed.productionPromotionAllowed !== false ||
      witnessed.physicallyIndependentSignerCertified !== false ||
      !Number.isSafeInteger(witnessed.signedSequence) ||
      witnessed.signedSequence < 1 ||
      !SHA.test(witnessed.signedHeadDigest || '') ||
      !SHA.test(witnessed.verifiedRegistryDigest || '')) {
    refuse('signed_authority_contract_incomplete');
  }
  return witnessed;
}

/**
 * The only permitted publisher receives content-free fixture identifiers.
 * The fence provider MUST atomically serialize committed deletions against
 * publication; this module cannot prove the provider's physical independence
 * or locking correctness. It therefore never authorizes production promotion.
 *
 * Before-fence hook exists only to inject a synthetic concurrent deletion.
 */
export async function rehearseR20FencedRestore({
  target, archive, readCurrentAuthorityInputs,
  withExclusiveDeletionPublicationFence, acknowledgeSyntheticPublication,
  beforeFence,
}) {
  if (target !== SYNTHETIC_TARGET || !validFixtureArchive(archive)) {
    refuse('synthetic_fixture_only');
  }
  if (typeof readCurrentAuthorityInputs !== 'function' ||
      typeof withExclusiveDeletionPublicationFence !== 'function' ||
      typeof acknowledgeSyntheticPublication !== 'function' ||
      (beforeFence !== undefined && typeof beforeFence !== 'function')) {
    refuse('required_authority_fence_or_synthetic_ack_missing');
  }

  const initial = await verifiedAuthority(readCurrentAuthorityInputs);
  if (archive.capturedDeletionSequence > initial.signedSequence) {
    refuse('archive_generation_outside_signed_authority');
  }
  if (beforeFence) await beforeFence();

  let invoked = false;
  let finished = false;
  const commitUnderFence = async (token) => {
    if (invoked) refuse('fence_callback_invoked_more_than_once');
    invoked = true;
    if (token !== 'R20_SYNTHETIC_EXCLUSIVE_FENCE_HELD') {
      refuse('deletion_publication_fence_not_held');
    }

    // This read must be fresh, not a cached copy of the pre-fence witness.
    const current = await verifiedAuthority(readCurrentAuthorityInputs);
    if (current.signedSequence !== initial.signedSequence ||
        current.signedHeadDigest !== initial.signedHeadDigest ||
        current.verifiedRegistryDigest !== initial.verifiedRegistryDigest ||
        current.coveredOutboxCount !== initial.coveredOutboxCount) {
      refuse('authority_changed_since_restore_preparation');
    }

    const acknowledgement = await acknowledgeSyntheticPublication(
      Object.freeze({
        archiveId: archive.archiveId,
        captureGeneration: archive.captureGeneration,
        fixtureDigest: archive.fixtureDigest,
        signedSequence: current.signedSequence,
        signedHeadDigest: current.signedHeadDigest,
      }),
    );
    if (acknowledgement !== 'R20_SYNTHETIC_RECEIPT_ONLY') {
      refuse('synthetic_publication_not_acknowledged');
    }
    finished = true;
    return Object.freeze({
      state: 'R20_R3I_SYNTHETIC_FENCED_RECEIPT_ONLY',
      archiveId: archive.archiveId,
      observedDeletionSequence: current.signedSequence,
      signedHeadDigest: current.signedHeadDigest,
      productionPromotionAllowed: false,
      actualArchiveRestored: false,
      physicalCustodyVerified: false,
    });
  };

  let result;
  try {
    result = await withExclusiveDeletionPublicationFence(commitUnderFence);
  } catch (error) {
    if (error?.message?.startsWith('R20')) throw error;
    refuse('exclusive_fence_provider_failed');
  }
  if (!invoked || !finished ||
      result?.state !== 'R20_R3I_SYNTHETIC_FENCED_RECEIPT_ONLY' ||
      result.productionPromotionAllowed !== false ||
      result.actualArchiveRestored !== false) {
    refuse('fence_execution_not_completed');
  }
  return result;
}
