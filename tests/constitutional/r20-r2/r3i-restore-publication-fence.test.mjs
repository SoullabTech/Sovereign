import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { seal, digest } from '../../../lib/recovery/r20-r2/signedLedger.mjs';
import {
  LEDGER_FORMAT, HEAD_FORMAT, registryDigest,
} from '../../../lib/recovery/r20-r3/capturedLedger.mjs';
import { PIN_FORMAT } from '../../../lib/recovery/r20-r3/externalAnchorBoundary.mjs';
import {
  SYNTHETIC_TARGET, rehearseR20FencedRestore,
} from '../../../lib/recovery/r20-r3/restorePublicationFence.mjs';

const registry = JSON.parse(readFileSync(new URL(
  '../../../lib/recovery/r20-r3/writer-studio-captured-graph-20261013.json',
  import.meta.url,
)));
const ledgerKeys = generateKeyPairSync('ed25519');
const headKeys = generateKeyPairSync('ed25519');
const pinKeys = generateKeyPairSync('ed25519');
const wrongKeys = generateKeyPairSync('ed25519');
const deletedManuscript = '20000000-0000-4000-8000-000000000001';
const deletedWork = '30000000-0000-4000-8000-000000000002';
const events = [
  {
    sequence: 1,
    manifest: '40000000-0000-4000-8000-000000000003',
    tombstones: [{ table: 'member_manuscripts', id: deletedManuscript }],
  },
  {
    sequence: 2,
    manifest: '50000000-0000-4000-8000-000000000004',
    tombstones: [{ table: 'living_works', id: deletedWork }],
  },
];
const locations = {
  ledger: 'https://ledger-fixture.example.invalid/v1',
  head: 'https://head-fixture.example.invalid/v1',
  pin: 'https://pin-fixture.example.invalid/v1',
};
const hash = 'a'.repeat(64);

function context() {
  const clock = { sequence: 1, edition: 'first', offline: false, wrongPin: false };
  let acknowledgements = 0;
  function currentInputs() {
    const currentEvents = events.slice(0, clock.sequence);
    const contract = registryDigest(registry);
    const ledger = {
      schema: LEDGER_FORMAT, sequence: clock.sequence,
      captureRegistryDigest: contract, events: currentEvents,
    };
    const head = {
      schema: HEAD_FORMAT, sequence: clock.sequence,
      captureRegistryDigest: contract, ledgerDigest: digest(ledger),
      issuedBy: clock.edition,
    };
    const pin = {
      schema: PIN_FORMAT, registryDigest: contract,
      headDigest: digest(head), minimumSequence: clock.sequence,
    };
    return {
      captureRegistry: registry,
      locations: { ...locations },
      keys: {
        ledgerPublicKey: ledgerKeys.publicKey,
        headPublicKey: headKeys.publicKey,
        pinPublicKey: clock.wrongPin ? wrongKeys.publicKey : pinKeys.publicKey,
      },
      transport: {
        getLedger: async () => {
          if (clock.offline) throw Error('synthetic ledger offline');
          return seal(ledger, ledgerKeys.privateKey, ledgerKeys.publicKey);
        },
        getHead: async () => seal(head, headKeys.privateKey, headKeys.publicKey),
        getPin: async () => seal(pin, pinKeys.privateKey, pinKeys.publicKey),
      },
      completeCommittedOutbox: currentEvents.map(item => ({
        manifest: item.manifest, tombstones: item.tombstones,
      })),
    };
  }
  const input = {
    target: SYNTHETIC_TARGET,
    archive: {
      type: 'SYNTHETIC_CONTENT_FREE_ARCHIVE',
      archiveId: 'fixture-archive-a',
      captureGeneration: 'fixture-generation-a',
      capturedDeletionSequence: 1,
      fixtureDigest: hash,
      containsMemberData: false,
    },
    readCurrentAuthorityInputs: async () => currentInputs(),
    withExclusiveDeletionPublicationFence: async callback =>
      callback('R20_SYNTHETIC_EXCLUSIVE_FENCE_HELD'),
    acknowledgeSyntheticPublication: async receipt => {
      assert.equal(receipt.archiveId, 'fixture-archive-a');
      assert.equal(receipt.fixtureDigest, hash);
      acknowledgements++;
      return 'R20_SYNTHETIC_RECEIPT_ONLY';
    },
  };
  return { clock, input, count: () => acknowledgements };
}
async function refusal(name, change) {
  await test(name, async () => {
    const c = context();
    change(c);
    await assert.rejects(
      rehearseR20FencedRestore(c.input),
      /R20.*refused/i,
    );
  });
}

test('frozen signed authority checked twice under synthetic fence; never production admission', async () => {
  const c = context();
  const result = await rehearseR20FencedRestore(c.input);
  assert.equal(result.state, 'R20_R3I_SYNTHETIC_FENCED_RECEIPT_ONLY');
  assert.equal(result.productionPromotionAllowed, false);
  assert.equal(result.actualArchiveRestored, false);
  assert.equal(result.physicalCustodyVerified, false);
  assert.equal(result.observedDeletionSequence, 1);
  assert.equal(c.count(), 1);
});

await refusal('new committed deletion between stage and fenced publish refuses', c => {
  c.input.beforeFence = async () => { c.clock.sequence = 2; };
});
await refusal('re-signed different head at same epoch refuses', c => {
  c.input.beforeFence = async () => { c.clock.edition = 'changed-head'; };
});
await refusal('loss of external ledger at final fenced check refuses', c => {
  c.input.beforeFence = async () => { c.clock.offline = true; };
});
await refusal('invalid externally pinned public key refuses', c => {
  c.clock.wrongPin = true;
});
await refusal('missing external reader refuses', c => {
  c.input.readCurrentAuthorityInputs = undefined;
});
await refusal('missing publication fence refuses', c => {
  c.input.withExclusiveDeletionPublicationFence = undefined;
});
await refusal('fence provider bypasses callback refuses', c => {
  c.input.withExclusiveDeletionPublicationFence = async () => ({ state: 'claimed' });
});
await refusal('fence provider wrong token refuses', c => {
  c.input.withExclusiveDeletionPublicationFence = async fn => fn('UNHELD');
});
await refusal('fence provider fails refuses', c => {
  c.input.withExclusiveDeletionPublicationFence = async () => {
    throw Error('synthetic fence lock unavailable');
  };
});
await refusal('synthetic publisher does not acknowledge refuses', c => {
  c.input.acknowledgeSyntheticPublication = async () => false;
});
await refusal('candidate cannot pass real member rows', c => {
  c.input.archive.rows = [{ text: 'NEVER_REAL' }];
});
await refusal('candidate cannot claim member data exists in fixture', c => {
  c.input.archive.containsMemberData = true;
});
await refusal('target cannot be production', c => {
  c.input.target = 'PRODUCTION';
});
await refusal('archive captured beyond current signed epoch refuses', c => {
  c.input.archive.capturedDeletionSequence = 3;
});
await refusal('invalid synthetic archive fingerprint refuses', c => {
  c.input.archive.fixtureDigest = 'not-a-sha';
});
await refusal('unavailable authority input read refuses', c => {
  c.input.readCurrentAuthorityInputs = async () => {
    throw Error('synthetic authority unreachable');
  };
});

test('new deletion keeps synthetic publication count at zero', async () => {
  const c = context();
  c.input.beforeFence = async () => { c.clock.sequence = 2; };
  await assert.rejects(rehearseR20FencedRestore(c.input), /authority_changed/);
  assert.equal(c.count(), 0);
});
