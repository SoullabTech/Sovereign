import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { seal, digest, LEDGER_FORMAT, HEAD_FORMAT } from '../../../lib/recovery/r20-r2/signedLedger.mjs';
import { rehearseSealedRestore } from '../../../lib/recovery/r20-r2/sealedRestore.mjs';
import { planArchiveCustody } from '../../../lib/recovery/r20-r2/archiveCustody.mjs';

const ledgerKeys = generateKeyPairSync('ed25519');
const headKeys = generateKeyPairSync('ed25519');
const deleted = 'synthetic-deleted';
const other = 'synthetic-unaffected';
const artifact = (table, id, owner, session) => ({
  table, id, synthetic: true,
  ...(table === 'conversation_turns' ? { user_id: owner } : { member_id: owner }),
  session_id: session, created_at: '2026-05-01T00:00:00Z',
  body: 'FAKE CONTENT — SYNTHETIC ONLY',
});

function fixture() {
  const ledger = {
    schema: LEDGER_FORMAT,
    sequence: 2,
    events: [
      { sequence: 1, manifest: 'fake-deletion-1',
        tombstones: [
          { table: 'member_manuscripts', id: 'fake-manuscript' },
          { table: 'living_works', id: 'fake-living-work' },
        ], scopes: [] },
      { sequence: 2, manifest: 'fake-deletion-2',
        tombstones: [], scopes: [{ table: 'conversation_turns', memberId: deleted }] },
    ],
  };
  const head = {
    schema: HEAD_FORMAT, sequence: 2, ledgerDigest: digest(ledger),
    issuedBy: 'EXTERNAL_SYNTHETIC_WITNESS',
  };
  const archive = {
    type: 'SYNTHETIC_JSON_FIXTURE',
    containsMemberData: false,
    rows: [
      artifact('member_manuscripts', 'fake-manuscript', deleted, 'fake-session'),
      artifact('living_works', 'fake-living-work', deleted, 'fake-session'),
      artifact('conversation_turns', 'fake-turn', deleted, 'fake-session'),
      artifact('conversation_turns', 'unrelated-turn', other, 'other-session'),
      artifact('member_manuscripts', 'unrelated-manuscript', other, 'other-session'),
    ],
  };
  return {
    target: 'R20_DISPOSABLE_SYNTHETIC_ONLY',
    archive,
    independentlyPinnedArchiveSha256: digest(archive),
    authority: {
      sealedLedger: seal(ledger, ledgerKeys.privateKey, ledgerKeys.publicKey),
      sealedHead: seal(head, headKeys.privateKey, headKeys.publicKey),
      ledgerPublicKey: ledgerKeys.publicKey,
      headPublicKey: headKeys.publicKey,
      independentlyPinnedMinimumSequence: 2,
      independentlyPinnedHeadDigest: digest(head),
    },
  };
}

test('sealed synthetic recovery drops deleted rows and preserves unaffected control', () => {
  const input = fixture();
  const evidence = rehearseSealedRestore(input);
  assert.equal(evidence.state, 'SYNTHETIC_QUARANTINED_VALIDATION_ONLY');
  assert.equal(evidence.promotionAllowed, false);
  assert.equal(evidence.sourceRowCount, 5);
  assert.equal(evidence.suppressedRowCount, 3);
  assert.equal(evidence.restoredRowCount, 2);
  assert.deepEqual(evidence.preview.map(x => x.id).sort(),
    ['unrelated-manuscript', 'unrelated-turn']);
  assert.equal(input.archive.rows.length, 5, 'Original fixture must not be mutated');
});

for (const [name, patch] of [
  ['production target', input => { input.target = 'maia_consciousness'; }],
  ['unverified member content', input => { input.archive.containsMemberData = true; }],
  ['backup hash mismatch', input => { input.independentlyPinnedArchiveSha256 = '0'.repeat(64); }],
  ['missing independent deletion authority', input => { delete input.authority.sealedHead; }],
  ['stale head', input => { input.authority.independentlyPinnedMinimumSequence = 3; }],
  ['unknown restored content lane', input => {
    input.archive.rows.push(artifact('unknown_private_table', 'x', deleted, 's'));
    input.independentlyPinnedArchiveSha256 = digest(input.archive);
  }],
  ['scope owner field missing', input => {
    delete input.archive.rows[2].user_id;
    input.independentlyPinnedArchiveSha256 = digest(input.archive);
  }],
]) {
  test('sealed synthetic recovery refuses ' + name, () => {
    const input = fixture();
    patch(input);
    assert.throws(() => rehearseSealedRestore(input), /refused/i);
  });
}

const SHA = 'a'.repeat(64);
test('archive custody holds unknown historic backup without deletion authority provenance', () => {
  const result = planArchiveCustody({
    deletionHighWater: 2,
    archives: [{ id:'historic-old', class:'postgres', sha256:SHA }],
  });
  assert.equal(result.decisions[0].status, 'HELD_UNATTRIBUTED');
  assert.equal(result.decisions[0].nextAction, 'HOLD_AND_REVIEW');
  assert.equal(result.automaticDeletionAuthorized, false);
});

test('archive custody marks earlier backup potentially contaminated but never deletes', () => {
  const result = planArchiveCustody({
    deletionHighWater: 2,
    archives: [{ id:'historic-1', class:'postgres', sha256:SHA, coverageSequence:1 }],
    cleanContinuity: { verified:true, restoreTestPassed:true, coverageSequence:2 },
    humanAuthorization: { scope:'EXACT_ARCHIVE_IDS', approved:true, reviewedArchiveIds:['historic-1'] },
  });
  assert.equal(result.decisions[0].status, 'POTENTIALLY_CONTAMINATED');
  assert.equal(result.decisions[0].nextAction, 'ELIGIBLE_FOR_SEPARATE_MANUAL_PURGE_REVIEW');
  assert.equal(result.decisions[0].deleted, false);
  assert.equal(result.automaticDeletionAuthorized, false);
});

test('archive custody rejects pruning without verified clean continuity', () => {
  const result = planArchiveCustody({
    deletionHighWater: 3,
    archives: [{ id:'media-old', class:'media', sha256:SHA, coverageSequence:1 }],
    cleanContinuity: { verified:true, restoreTestPassed:false, coverageSequence:3 },
    humanAuthorization: { scope:'EXACT_ARCHIVE_IDS', approved:true, reviewedArchiveIds:['media-old'] },
  });
  assert.equal(result.decisions[0].nextAction, 'HOLD_AND_REVIEW');
});

test('archive custody labels a verified current archive as a candidate only', () => {
  const result = planArchiveCustody({
    deletionHighWater: 2,
    archives: [{ id:'recent', class:'postgres', sha256:SHA, coverageSequence:2, contentIntegrityVerified:true }],
  });
  assert.equal(result.decisions[0].status, 'CLEAN_CANDIDATE');
  assert.equal(result.productionSnapshotsAuthorized, false);
});

test('archive inventory rejects duplicate IDs and unsupported storage class', () => {
  assert.throws(() => planArchiveCustody({
    deletionHighWater:1,
    archives:[{id:'x',class:'other'},{id:'x',class:'postgres'}],
  }), /refused/i);
});
