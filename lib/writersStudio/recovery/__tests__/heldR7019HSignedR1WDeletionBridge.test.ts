/** R70.19H: opt-in, strictly fictional physical signed GPGV point test.
 * Default test runs only fail-closed guard. To exercise the real public R1W
 * fixture: R7019H_PHYSICAL_FIXTURE=fictional-only (Mac Studio T7 test copy).
 * Private recovery GPG or Docker are NEVER invoked.
 */
import { generateKeyPairSync, sign } from 'node:crypto';
import {
  canonicalR7019HCensus,
  verifyR7019HPhysicalR1WFixture,
  withHeldR7019HSignedR1WAndCurrentDeletion,
  R7019H_PRODUCTION_RESTORE_BRIDGE_ENABLED,
  R7019H_ALL_PRODUCTION_WORKS_CENSUSED,
  R7019H_CURRENT_EXTERNAL_ERASURE_AUTHORITY_CERTIFIED,
  R7019H_PROTOCOL,
  type R7019HSignedCensus,
  type R7019HCensus,
  type R7019HCurrentAuthority,
  type R7019HPhysicalPoint,
} from '../heldR7019HSignedR1WDeletionBridge';
import {
  canonicalDeletionPayload,
  type DeletionHighwaterV1,
} from '../deletionBarrierV1';

const running = process.env.R7019H_PHYSICAL_FIXTURE === 'fictional-only';
const physicalTest = running ? test : test.skip;
const m = '4c0782ca-9074-43ee-9f3c-5f8500026780';
const workA = '306902ed-21a9-4c01-aa15-984755598218';
const workB = '4c0782ca-9074-43ee-9f3c-5f8500026780';
const extra = 'c98f6b64-7055-41ca-b14f-b2ac42df294b';
const keyA = '3ac9b90d-8d79-44cf-bf3f-81376d8b7efe';
const keyB = '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const keyExtra = 'c6fba8b8-303c-41d5-a5a3-a04fd5ff9937';
const works = [
  { memberId: m, workId: workA, keyId: keyA },
  { memberId: m, workId: workB, keyId: keyB },
] as const;
const signer = generateKeyPairSync('ed25519');
const deletion = generateKeyPairSync('ed25519');
const fakeSigner = generateKeyPairSync('ed25519');
const fpr = '35B4553EFB55A54ACF387D6EC15EA2942448481F';
let physical: R7019HPhysicalPoint;
const previousFixture = process.env.R7019H_ERASURE_FIXTURE;

beforeAll(() => {
  if (running) {
    process.env.R7019H_ERASURE_FIXTURE = 'fictional-only';
    physical = verifyR7019HPhysicalR1WFixture();
  }
});
afterAll(() => {
  if (previousFixture === undefined) delete process.env.R7019H_ERASURE_FIXTURE;
  else process.env.R7019H_ERASURE_FIXTURE = previousFixture;
});

function body(overrides: Partial<R7019HCensus> = {}): R7019HCensus {
  return {
    protocol: R7019H_PROTOCOL,
    r1wSourceHead: '1e9eee64306197a0f52e7b547ee3bdd279d786fa',
    generation: physical.generation,
    snapshotGeneration: 20,
    r1wSignerFingerprint: fpr,
    r1wSignedManifestSha256: physical.r1wSignedManifestSha256,
    postgresCipherSha256: physical.postgresCipherSha256,
    fileCipherSha256: physical.fileCipherSha256,
    fileScopes: [...physical.fileScopes],
    works: [...works],
    ...overrides,
  };
}
function signed(
  value = body(), key = signer.privateKey,
): R7019HSignedCensus {
  return {
    body: value,
    signature: sign(null, canonicalR7019HCensus(value), key).toString('base64'),
  };
}
function deletionCheckpoint(
  over: Partial<DeletionHighwaterV1> = {},
): DeletionHighwaterV1 {
  return {
    protocol: 'soullab.ws.deletion-highwater.v1',
    stream: 'writers-studio-beta',
    generation: 22,
    revokedWorks: [],
    revokedKeyIds: [],
    ...over,
  };
}
function authority(
  overrides: Partial<R7019HCurrentAuthority> = {},
  cp = deletionCheckpoint(),
): R7019HCurrentAuthority {
  return {
    pinnedCensusSigner: signer.publicKey,
    pinnedCurrentDeletionSigner: deletion.publicKey,
    signedCurrentDeletion: {
      checkpoint: cp,
      signature: sign(null, canonicalDeletionPayload(cp), deletion.privateKey)
        .toString('base64'),
    },
    externalMinimumSnapshotGeneration: 20,
    externalMinimumDeletionGeneration: 22,
    independentlyExpectedOwnedWorks: [...works],
    ...overrides,
  };
}
function call(
  entry = signed(), independent = authority(),
  point = physical,
) {
  const callback = jest.fn(() => 'fictional-restore-callback-only');
  const invoke = () => withHeldR7019HSignedR1WAndCurrentDeletion({
    physical: point, census: entry, independent,
  }, callback);
  return { callback, invoke };
}
function refused(value: ReturnType<typeof call>) {
  expect(value.invoke).toThrow();
  expect(value.callback).not.toHaveBeenCalled();
}

test('R70.19H is compile-time released FALSE and demands opt-in fixture', () => {
  expect(R7019H_PRODUCTION_RESTORE_BRIDGE_ENABLED).toBe(false);
  expect(R7019H_CURRENT_EXTERNAL_ERASURE_AUTHORITY_CERTIFIED).toBe(false);
  expect(R7019H_ALL_PRODUCTION_WORKS_CENSUSED).toBe(false);
  const prior = process.env.R7019H_ERASURE_FIXTURE;
  process.env.R7019H_ERASURE_FIXTURE = 'disabled';
  expect(verifyR7019HPhysicalR1WFixture).toThrow();
  if (prior === undefined) delete process.env.R7019H_ERASURE_FIXTURE;
  else process.env.R7019H_ERASURE_FIXTURE = prior;
});

physicalTest('real signed five-volume fiction verified using separate pinned R1W GPGV public signer', () => {
  expect(physical.verifiedSignerFingerprint).toBe(fpr);
  expect(physical.fileScopes).toEqual([
    'media', 'vault', 'voice-notes', 'workbench', 'audit-logs',
  ]);
  expect(physical.postgresCipherSha256).toMatch(/^[a-f0-9]{64}$/);
  expect(physical.fileCipherSha256).toMatch(/^[a-f0-9]{64}$/);
});
physicalTest('surviving fictional Work passes both independent signatures before callback', () => {
  const { invoke, callback } = call();
  const result = invoke();
  expect(result.result).toBe('fictional-restore-callback-only');
  expect(result.protectedChecksPassed).toBe(true);
  expect(result.productionReleaseApproved).toBe(false);
  expect(callback).toHaveBeenCalledTimes(1);
});
physicalTest('historical signed backup with current deleted Work never opens fictional restore callback', () => {
  refused(call(signed(), authority({}, deletionCheckpoint({ revokedWorks: [workA] }))));
});
physicalTest('current deleted encryption key also blocks the old signed backup', () => {
  refused(call(signed(), authority({}, deletionCheckpoint({ revokedKeyIds: [keyB] }))));
});
physicalTest('correctly signed but obsolete archived generation refuses', () => {
  refused(call(signed(), authority({ externalMinimumSnapshotGeneration: 21 })));
});
physicalTest('stale deletion checkpoint fails against independent floor', () => {
  refused(call(signed(), authority({
    externalMinimumDeletionGeneration: 23,
  })));
});
physicalTest('newer independent deletion epoch must not be an archive-controlled fallback', () => {
  const stale = deletionCheckpoint({ generation: 21 });
  refused(call(signed(), authority({}, stale)));
});
physicalTest('omitted Work cannot inherit authenticity from valid signed R1W manifest', () => {
  const reduced = signed(body({ works: [works[0]] }));
  refused(call(reduced));
});
physicalTest('foreign expected Work index fails even with correct census signature', () => {
  refused(call(signed(), authority({
    independentlyExpectedOwnedWorks: [
      works[0], { memberId: m, workId: extra, keyId: keyExtra },
    ],
  })));
});
physicalTest('fictional signed Work census cannot name an altered R1W manifest hash', () => {
  const changed = signed(body({
    r1wSignedManifestSha256: '0'.repeat(64),
  }));
  refused(call(changed));
});
physicalTest('R1W five-volume SQL or archive ciphertext hash cannot drift', () => {
  refused(call(signed(body({ postgresCipherSha256: '1'.repeat(64) }))));
  refused(call(signed(body({ fileCipherSha256: '2'.repeat(64) }))));
});
physicalTest('different R1W five-volume file order or missing file scope rejected', () => {
  expect(() => signed(body({ fileScopes: ['media', 'vault'] }))).toThrow();
  expect(() => signed(body({
    fileScopes: ['vault', 'media', 'voice-notes', 'workbench', 'audit-logs'],
  }))).toThrow();
});
physicalTest('untrusted foreign signer cannot author the Work roster', () => {
  refused(call(signed(body(), fakeSigner.privateKey)));
});
physicalTest('modified census bytes with original signature are refused', () => {
  const proof = signed();
  refused(call({
    ...proof, body: { ...proof.body, snapshotGeneration: 19 },
  }));
});
physicalTest('physical witness copied from a verified object is not itself GPGV verified', () => {
  refused(call(signed(), authority(), { ...physical }));
});
physicalTest('missing separately pinned external deletion signer refuses', () => {
  refused(call(signed(), authority({ pinnedCurrentDeletionSigner: null as any })));
});
physicalTest('same key cannot sign both census and current deletion authority', () => {
  refused(call(signed(), authority({
    pinnedCurrentDeletionSigner: signer.publicKey,
  })));
});
physicalTest('signature of current deletion checkpoint by impostor is refused', () => {
  const fake = deletionCheckpoint();
  refused(call(signed(), authority({
    signedCurrentDeletion: {
      checkpoint: fake,
      signature: sign(null, canonicalDeletionPayload(fake), fakeSigner.privateKey)
        .toString('base64'),
    },
  })));
});
physicalTest('future snapshot must not exceed witnessed current deletion epoch', () => {
  refused(call(signed(body({ snapshotGeneration: 24 }))));
});
physicalTest('unsorted, duplicate or malformed roster rejected before callback', () => {
  expect(() => signed(body({ works: [works[1], works[0]] }))).toThrow();
  expect(() => signed(body({ works: [works[0], works[0]] }))).toThrow();
  expect(() => signed(body({ works: [{ ...works[0], keyId: 'not-a-uuid' }] }))).toThrow();
});
physicalTest('survivor is allowed if deletion authority revoked only another Work/key', () => {
  const onlyA = signed(body({ works: [works[0]] }));
  const independent = authority({
    independentlyExpectedOwnedWorks: [works[0]],
  }, deletionCheckpoint({
    revokedWorks: [extra], revokedKeyIds: [keyExtra],
  }));
  const { invoke, callback } = call(onlyA, independent);
  expect(invoke().protectedChecksPassed).toBe(true);
  expect(callback).toHaveBeenCalledTimes(1);
});
