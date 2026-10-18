'use strict';

/**
 * R70.19G independent policy gate: the R1W five-volume signer and R70.19F
 * Work-census/destruction checkpoint code coexist but MUST NOT be mistaken
 * for a complete single trust/restore protocol.
 *
 * Source-only tests. They never call production, Docker, GPG, SSH or a KMS.
 * An actual future reviewed bridge must replace this explicit source HOLD.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const file = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const r1wSigner = file('scripts/ops/wsBetaR1WSignedGeneration.py');
const r1wRestore = file('scripts/ops/wsBetaR1WSignedIndependentColdRestore.py');
const r1vWriter = file('scripts/ops/wsBetaR1VMinisforumEncryptedBackup.py');
const r7019e = file('lib/writersStudio/recovery/heldR7019EPreDecryptErasureGate.ts');
const r7019f = file('lib/writersStudio/recovery/heldR7019FActualPgCensus.ts');

test('both signed source families keep live production admission hard-disabled', () => {
  assert.match(r1wSigner, /PRODUCTION_SIGNED_GENERATION_RELEASED=False/);
  assert.match(r1wRestore, /R1W_REAL_SIGNED_PRODUCTION_RESTORE_ENABLED=False/);
  assert.match(r1vWriter, /R1V_PRODUCTION_CUTOVER_RELEASED\s*=\s*False/);
  assert.match(r7019e, /R7019E_PRODUCTION_DECRYPT_ADMISSION_ENABLED=false/);
  assert.match(r7019f, /R7019F_PRODUCTION_CENSUS_ADMISSION_ENABLED=false/);
});

test('R1W verifies an independent pinned signer and a five-volume scope', () => {
  assert.match(r1wSigner, /\bgpgv\b/);
  assert.match(r1wSigner, /VALIDSIG/);
  assert.match(r1wSigner, /SIGNER_FINGERPRINT_MISMATCH/);
  assert.match(r1wSigner, /fileVolumeNames.*\['media','vault','voice-notes','workbench','audit-logs'\]/);
  assert.match(r1wSigner, /postgres\.pgdump\.gpg/);
  assert.match(r1wSigner, /files\.tar\.gpg/);
});

test('R70.19F signs actual fictional SQL census, not complete historical or external ownership', () => {
  assert.match(r7019f, /member_manuscripts/);
  assert.match(r7019f, /ws_managed_work_key_wrappings_r1q/);
  assert.match(r7019f, /allPlatformAndHistoricalWorksCovered:false/);
  assert.match(r7019f, /offhostWorkCensusAuthorityCertified:false/);
  assert.match(r7019f, /realMemberAdmissionApproved:false/);
});

test('R70.19E requires an independent CURRENT deletion checkpoint and Work census', () => {
  assert.match(r7019e, /independentMinimumDeletionGeneration/);
  assert.match(r7019e, /independentMinimumSnapshotGeneration/);
  assert.match(r7019e, /independentlyExpectedOwnedWorks/);
  assert.match(r7019e, /requireCurrentRestoreAuthorization/);
  assert.match(r7019e, /R7019E_PRODUCTION_ANTIRESURRECTION_PROVEN=false/);
});

test('R1W and R70.19E are different manifest protocols, so mere source merge gives no restore authorization', () => {
  assert.match(r1wSigner, /soullab\.ws\.r1v\.minisforum\.complete-encrypted-recovery\.fixture\.v1/);
  assert.match(r7019e, /soullab\.ws\.r70\.19c\.fict-coherent-point\.v1/);
  assert.match(r7019e, /database\.pgdump\.gpg/);
  assert.match(r7019e, /vault\.tar\.gpg/);
  assert.doesNotMatch(r1wRestore, /assertHeldR7019EPreDecryptAdmission|withHeldR7019EPreDecryptGate/);
  assert.doesNotMatch(r1wRestore, /independentMinimumDeletionGeneration/);
});

test('R1W executable always verifies detached signature before attempting private recovery key', () => {
  const signed = r1wRestore.indexOf('result=verify_signed(');
  const secret = r1wRestore.indexOf('r1v.verified_private_home(');
  const restore = r1wRestore.indexOf('r1v.restore_postgres(');
  assert(signed > 0 && secret > signed && restore > secret);
  assert.match(r1wRestore, /WS_R1W_RESTORE_FIXTURE_ONLY/);
  assert.match(r1wRestore, /R1W_SIGNED_RESTORE_REFUSED_DEFAULT_OFF/);
});

test('the review document explicitly refuses unqualified full Writer admission', () => {
  const doc=file('docs/ops/WS_R70_19G_DUAL_SIGNED_RECOVERY_SOURCE_RECONCILIATION_HELD_20261018.md');
  assert.match(doc, /default OFF/);
  assert.match(doc, /R70\.19F/);
  assert.match(doc, /R1W/);
  assert.match(doc, /compatibility ≠ one recoverable and deletion-safe shipping implementation/i);
  assert.match(doc, /historical/);
});
