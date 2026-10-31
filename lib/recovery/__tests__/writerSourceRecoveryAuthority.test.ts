import { generateKeyPairSync } from "node:crypto";

jest.mock("@/lib/db/postgres", () => ({ query: jest.fn() }));
jest.mock("@/lib/manuscript/source/encryptedLanding", () => ({
  inspectEncryptedStoredObject: jest.fn(),
}));

import { query } from "@/lib/db/postgres";
import { inspectEncryptedStoredObject } from "@/lib/manuscript/source/encryptedLanding";
import {
  authorizeWriterSourceRecoveryManifest,
  signWriterSourceRecoveryAuthorityForTests,
  verifyWriterSourceRecoverySet,
  writerSourceRecoveryAuthorityEnvelopeSha256,
  writerSourceRecoveryManifestSha256,
  type WriterSourceRecoveryAuthorityEnvelope,
  type WriterSourceRecoveryAuthorityRecord,
  type WriterSourceRecoveryManifest,
} from "../writerSourceRecoveryAuthority";

const mockQuery = query as jest.Mock;
const mockInspect = inspectEncryptedStoredObject as jest.Mock;
const SOURCE_COMMIT = "a".repeat(40);
const SOURCE_TREE = "b".repeat(40);
const MEMBER = "11111111-1111-4111-8111-111111111111";
const MANUSCRIPT = "22222222-2222-4222-8222-222222222222";
const ARRIVAL = "33333333-3333-4333-8333-333333333333";
const LANDING = "44444444-4444-4444-8444-444444444444";
const REF =
  "manuscript-sources/55555555-5555-4555-8555-555555555555.source.enc";

function manifest(
  database = "c".repeat(64),
  vault = "d".repeat(64),
): WriterSourceRecoveryManifest {
  return {
    protocol: "soullab.writer.source-recovery-manifest.v1",
    sourceCommit: SOURCE_COMMIT,
    sourceTree: SOURCE_TREE,
    databaseGenerationSha256: database,
    vaultGenerationSha256: vault,
    createdAt: "2026-10-27T16:30:00.000Z",
    objects: [
      {
        storageClass: "writer-source-encrypted-v1",
        memberId: MEMBER,
        manuscriptId: MANUSCRIPT,
        arrivalId: ARRIVAL,
        landingIntentId: LANDING,
        artifactRef: REF,
        originalSha256: "e".repeat(64),
        originalBytes: 37,
        ciphertextSha256: "f".repeat(64),
        ciphertextBytes: 37,
        keyId: "fictional-kek-v2",
      },
    ],
  };
}

function chain(current: WriterSourceRecoveryManifest): {
  envelopes: WriterSourceRecoveryAuthorityEnvelope[];
  publicKey: string;
  old: WriterSourceRecoveryManifest;
} {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicPem = publicKey
    .export({ format: "pem", type: "spki" })
    .toString();
  const privatePem = privateKey
    .export({ format: "pem", type: "pkcs8" })
    .toString();
  const old = manifest("1".repeat(64), "2".repeat(64));
  const oldSha = writerSourceRecoveryManifestSha256(old);
  const currentSha = writerSourceRecoveryManifestSha256(current);
  const firstRecord: WriterSourceRecoveryAuthorityRecord = {
    protocol: "soullab.writer.source-recovery-authority.v1",
    generation: 1,
    previousRecordSha256: "0".repeat(64),
    sourceCommit: SOURCE_COMMIT,
    sourceTree: SOURCE_TREE,
    admittedManifestSha256: oldSha,
    retiredManifestSha256: [],
    requestNonceSha256: "3".repeat(64),
    issuedAt: "2026-10-27T16:31:00.000Z",
  };
  const first = signWriterSourceRecoveryAuthorityForTests({
    record: firstRecord,
    privateKeyPem: privatePem,
  });
  const second = signWriterSourceRecoveryAuthorityForTests({
    record: {
      ...firstRecord,
      generation: 2,
      previousRecordSha256: writerSourceRecoveryAuthorityEnvelopeSha256(first),
      admittedManifestSha256: currentSha,
      retiredManifestSha256: [oldSha],
      requestNonceSha256: "4".repeat(64),
      issuedAt: "2026-10-27T16:32:00.000Z",
    },
    privateKeyPem: privatePem,
  });
  return { envelopes: [first, second], publicKey: publicPem, old };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test("current encrypted recovery manifest is admitted by the latest signed authority", () => {
  const current = manifest();
  const authority = chain(current);
  expect(
    authorizeWriterSourceRecoveryManifest({
      manifest: current,
      envelopes: authority.envelopes,
      publicKeyPem: authority.publicKey,
      expectedSourceCommit: SOURCE_COMMIT,
      expectedSourceTree: SOURCE_TREE,
      expectedMinimumGeneration: 2,
    }),
  ).toMatchObject({ authorityGeneration: 2 });
});

test("a previously admitted recovery manifest is refused once the external authority retires it", () => {
  const current = manifest();
  const authority = chain(current);
  expect(() =>
    authorizeWriterSourceRecoveryManifest({
      manifest: authority.old,
      envelopes: authority.envelopes,
      publicKeyPem: authority.publicKey,
      expectedSourceCommit: SOURCE_COMMIT,
      expectedSourceTree: SOURCE_TREE,
      expectedMinimumGeneration: 2,
    }),
  ).toThrow("WRITER_SOURCE_RECOVERY_MANIFEST_RETIRED");
});

test("wrong verification key and manifest tamper both fail closed", () => {
  const current = manifest();
  const authority = chain(current);
  const wrong = generateKeyPairSync("ed25519")
    .publicKey.export({ format: "pem", type: "spki" })
    .toString();
  expect(() =>
    authorizeWriterSourceRecoveryManifest({
      manifest: current,
      envelopes: authority.envelopes,
      publicKeyPem: wrong,
      expectedSourceCommit: SOURCE_COMMIT,
      expectedSourceTree: SOURCE_TREE,
    }),
  ).toThrow("WRITER_SOURCE_RECOVERY_SIGNATURE_INVALID");

  const tampered = { ...current, vaultGenerationSha256: "9".repeat(64) };
  expect(() =>
    authorizeWriterSourceRecoveryManifest({
      manifest: tampered,
      envelopes: authority.envelopes,
      publicKeyPem: authority.publicKey,
      expectedSourceCommit: SOURCE_COMMIT,
      expectedSourceTree: SOURCE_TREE,
    }),
  ).toThrow("WRITER_SOURCE_RECOVERY_MANIFEST_NOT_ADMITTED");
});

test("physical recovery verification binds owner, Work, arrival, landing and ciphertext", async () => {
  const current = manifest();
  const authority = chain(current);
  const object = current.objects[0];
  mockQuery.mockResolvedValue({
    rows: [
      {
        id: object.landingIntentId,
        member_id: object.memberId,
        idempotency_key: object.arrivalId,
        artifact_ref: object.artifactRef,
        original_sha256: object.originalSha256,
        original_bytes: object.originalBytes,
        original_format: "text",
        state: "ARRIVAL_RECORDED",
        write_epoch: 1,
        lease_token: "66666666-6666-4666-8666-666666666666",
        lease_expires_at: new Date(),
        verified_at: new Date(),
        arrival_id: object.arrivalId,
        encryption_version: 1,
        encryption_algorithm: "aes-256-gcm",
        key_provider: "local-test",
        key_wrap_algorithm: "aes-256-gcm-local-test",
        key_id: object.keyId,
        cipher_iv: "AAAAAAAAAAAAAAAA",
        cipher_tag: "AAAAAAAAAAAAAAAAAAAAAA==",
        wrapped_dek: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        wrap_iv: "AAAAAAAAAAAAAAAA",
        wrap_tag: "AAAAAAAAAAAAAAAAAAAAAA==",
        ciphertext_sha256: object.ciphertextSha256,
        ciphertext_bytes: object.ciphertextBytes,
        arrival_member_id: object.memberId,
        manuscript_id: object.manuscriptId,
        arrival_artifact_ref: object.artifactRef,
        artifact_hash: object.originalSha256,
        artifact_size: object.originalBytes,
      },
    ],
  });
  mockInspect.mockResolvedValue("MATCHED");

  await expect(
    verifyWriterSourceRecoverySet({
      manifest: current,
      envelopes: authority.envelopes,
      publicKeyPem: authority.publicKey,
      expectedSourceCommit: SOURCE_COMMIT,
      expectedSourceTree: SOURCE_TREE,
      expectedMinimumGeneration: 2,
    }),
  ).resolves.toMatchObject({ objectsVerified: 1, authorityGeneration: 2 });
});

test("wrong owner and unavailable ciphertext are refused", async () => {
  const current = manifest();
  const authority = chain(current);
  const object = current.objects[0];
  mockQuery.mockResolvedValueOnce({
    rows: [
      {
        member_id: object.memberId,
        arrival_member_id: "77777777-7777-4777-8777-777777777777",
      },
    ],
  });
  await expect(
    verifyWriterSourceRecoverySet({
      manifest: current,
      envelopes: authority.envelopes,
      publicKeyPem: authority.publicKey,
      expectedSourceCommit: SOURCE_COMMIT,
      expectedSourceTree: SOURCE_TREE,
    }),
  ).rejects.toThrow("WRITER_SOURCE_RECOVERY_DB_BINDING_MISMATCH");

  mockQuery.mockResolvedValueOnce({
    rows: [
      {
        id: object.landingIntentId,
        member_id: object.memberId,
        artifact_ref: object.artifactRef,
        original_sha256: object.originalSha256,
        original_bytes: object.originalBytes,
        ciphertext_sha256: object.ciphertextSha256,
        ciphertext_bytes: object.ciphertextBytes,
        key_id: object.keyId,
        arrival_member_id: object.memberId,
        manuscript_id: object.manuscriptId,
        arrival_artifact_ref: object.artifactRef,
        artifact_hash: object.originalSha256,
        artifact_size: object.originalBytes,
      },
    ],
  });
  mockInspect.mockResolvedValueOnce("ABSENT");
  await expect(
    verifyWriterSourceRecoverySet({
      manifest: current,
      envelopes: authority.envelopes,
      publicKeyPem: authority.publicKey,
      expectedSourceCommit: SOURCE_COMMIT,
      expectedSourceTree: SOURCE_TREE,
    }),
  ).rejects.toThrow("WRITER_SOURCE_RECOVERY_OBJECT_ABSENT");
});
