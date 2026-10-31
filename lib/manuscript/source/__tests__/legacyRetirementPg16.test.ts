import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import { generateKeyPairSync, randomUUID } from "node:crypto";

jest.mock("@/lib/recovery/r20DeletionLedger", () => ({
  sealR20DeletionLedger: jest.fn(async () => ({ sealed: true })),
  r20LedgerErrorCode: jest.fn(() => "fictional_r20_error"),
}));
import { promises as fs } from "node:fs";
import path from "node:path";
import { closePool, query } from "@/lib/db/postgres";
import { sealR20DeletionLedger } from "@/lib/recovery/r20DeletionLedger";
import { writeVaultBytes } from "@/lib/storage/fileVault";
import { verifyCustody } from "../arrivals";
import { EXTRACTORS, hashBytes, hashText } from "../custody";
import { clearSourceEnvelopeKeyCacheForTests } from "../sourceEnvelope";
import { retireLegacyPlaintextSource } from "../legacyRetirement";
import {
  signWriterSourceRecoveryAuthorityForTests,
  verifyWriterSourceRecoverySet,
  writerSourceRecoveryManifestSha256,
  type WriterSourceRecoveryAuthorityRecord,
  type WriterSourceRecoveryManifest,
} from "@/lib/recovery/writerSourceRecoveryAuthority";

const enabled =
  process.env.WS_LEGACY_SOURCE_RETIREMENT_PG16 === "fictional-only";
const suite = enabled ? describe : describe.skip;
const MEMBER = "11111111-1111-4111-8111-111111111111";
const FOREIGN = "22222222-2222-4222-8222-222222222222";
const MANUSCRIPT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const vaultRoot = process.env.FILE_STORAGE_PATH ?? "";
const sourceCommit = process.env.WRITER_SOURCE_COMMIT ?? "a".repeat(40);
const sourceTree = process.env.WRITER_SOURCE_TREE ?? "b".repeat(40);
const key = Buffer.alloc(32, 0x44).toString("base64");
const mockSeal = sealR20DeletionLedger as unknown as jest.MockedFunction<
  typeof sealR20DeletionLedger
>;

async function seedLegacy(label: string) {
  const arrivalId = randomUUID();
  const fileId = randomUUID();
  const bytes = Buffer.from(`FICTIONAL LEGACY PLAINTEXT ${label}`, "utf8");
  const artifactRef = await writeVaultBytes(
    "legacy-writer-source",
    fileId,
    "txt",
    bytes,
  );
  const sourceText = `# ${label}\n\nFictional extracted Source.`;
  await query(
    `INSERT INTO manuscript_source_arrivals
       (id,member_id,manuscript_id,source_kind,artifact_ref,artifact_hash,
        artifact_size,original_filename,mime_type,source_text,source_text_hash,
        extraction_method,extractor_version)
     VALUES ($1::uuid,$2::uuid,$3::uuid,'artifact_extraction',$4,$5,$6,$7,
             'text/plain',$8,$9,$10,$11)`,
    [
      arrivalId,
      MEMBER,
      MANUSCRIPT,
      artifactRef,
      hashBytes(bytes),
      bytes.length,
      `${label}.txt`,
      sourceText,
      hashText(sourceText),
      EXTRACTORS.text.method,
      EXTRACTORS.text.version,
    ],
  );
  return { arrivalId, artifactRef, bytes };
}

suite(
  "legacy plaintext Source retirement — physical PostgreSQL 16 + vault",
  () => {
    beforeAll(async () => {
      if (!vaultRoot.includes("ws-legacy-source-retirement-")) {
        throw new Error(
          "legacy retirement fixture requires a disposable vault",
        );
      }
      process.env.WRITER_SOURCE_KEY_PROVIDER = "local-test";
      process.env.WRITER_SOURCE_KEK_ID = "fictional-retirement-k1";
      process.env.WRITER_SOURCE_KEK = key;
      delete process.env.WRITER_SOURCE_KEK_RING_JSON;
      clearSourceEnvelopeKeyCacheForTests();
      await query(
        `TRUNCATE writer_source_legacy_retirements,provenance_tombstones,
                deletion_manifest_scopes,deletion_manifests,vault_erasure_queue,
                writer_source_landing_intents,manuscript_source_arrivals,
                member_manuscripts,members CASCADE`,
      );
      await query("INSERT INTO members(id) VALUES($1::uuid),($2::uuid)", [
        MEMBER,
        FOREIGN,
      ]);
      await query(
        `INSERT INTO member_manuscripts(id,member_id,title)
       VALUES($1::uuid,$2::uuid,'Fictional legacy Work')`,
        [MANUSCRIPT, MEMBER],
      );
    });

    afterAll(async () => {
      clearSourceEnvelopeKeyCacheForTests();
      await closePool();
    });

    it("replaces one legacy plaintext arrival with exact-provenance ciphertext and retires the raw bytes", async () => {
      const seeded = await seedLegacy("retire-me");
      const retirement = await retireLegacyPlaintextSource({
        legacyArrivalId: seeded.arrivalId,
        memberId: MEMBER,
      });

      expect(retirement.state).toBe("RETIRED");
      expect(retirement.legacy_arrival_id).toBe(seeded.arrivalId);
      expect(retirement.replacement_arrival_id).not.toBe(seeded.arrivalId);
      await expect(
        fs.stat(path.join(vaultRoot, seeded.artifactRef)),
      ).rejects.toMatchObject({
        code: "ENOENT",
      });

      const rows = await query<{
        original_filename: string;
        source_text_hash: string;
        extraction_method: string;
        extractor_version: string;
        artifact_ref: string;
        manuscript_id: string;
      }>(
        `SELECT original_filename,source_text_hash,extraction_method,extractor_version,
              artifact_ref,manuscript_id
         FROM manuscript_source_arrivals WHERE id=$1::uuid`,
        [retirement.replacement_arrival_id],
      );
      expect(rows.rows[0]).toMatchObject({
        original_filename: "retire-me.txt",
        extraction_method: EXTRACTORS.text.method,
        extractor_version: EXTRACTORS.text.version,
        manuscript_id: MANUSCRIPT,
      });
      expect(rows.rows[0]?.artifact_ref.endsWith(".source.enc")).toBe(true);
      expect(await verifyCustody(MANUSCRIPT, MEMBER)).toEqual({
        custodied: true,
        reason: "artifact_recovered",
      });

      const replay = await query(
        `INSERT INTO manuscript_source_arrivals
         (id,member_id,manuscript_id,source_kind,artifact_ref,artifact_hash,
          artifact_size,original_filename,mime_type,source_text,source_text_hash,
          extraction_method,extractor_version)
       VALUES($1::uuid,$2::uuid,$3::uuid,'artifact_extraction',$4,$5,$6,
              'retire-me.txt','text/plain','replayed','${"0".repeat(64)}',
              'utf8-decode','node-buffer-utf8') RETURNING id`,
        [
          seeded.arrivalId,
          MEMBER,
          MANUSCRIPT,
          seeded.artifactRef,
          hashBytes(seeded.bytes),
          seeded.bytes.length,
        ],
      );
      expect(replay.rowCount).toBe(0);

      await expect(
        retireLegacyPlaintextSource({
          legacyArrivalId: seeded.arrivalId,
          memberId: MEMBER,
        }),
      ).resolves.toMatchObject({
        id: retirement.id,
        state: "RETIRED",
      });
    });

    it("keeps raw bytes and an ERASURE_OWED record when the recovery ledger is unavailable, then completes on retry", async () => {
      const seeded = await seedLegacy("ledger-offline");
      mockSeal.mockImplementationOnce(async () => {
        throw new Error("fictional-ledger-offline");
      });

      await expect(
        retireLegacyPlaintextSource({
          legacyArrivalId: seeded.arrivalId,
          memberId: MEMBER,
        }),
      ).rejects.toThrow(
        "legacy_source_retirement_recovery_seal_fictional_r20_error",
      );

      const owed = await query<{ state: string; queue_count: number }>(
        `SELECT r.state,
              (SELECT count(*)::int FROM vault_erasure_queue q
                WHERE encode(digest(q.artifact_ref,'sha256'),'hex') =
                      r.legacy_artifact_ref_sha256) AS queue_count
         FROM writer_source_legacy_retirements r
        WHERE r.legacy_arrival_id=$1::uuid`,
        [seeded.arrivalId],
      );
      expect(owed.rows[0]).toEqual({ state: "ERASURE_OWED", queue_count: 1 });
      await expect(
        fs.stat(path.join(vaultRoot, seeded.artifactRef)),
      ).resolves.toBeDefined();

      mockSeal.mockImplementationOnce(async () => ({
        sealed: true as const,
        generation: 1,
        changed: true,
        payloadSha256: "0".repeat(64),
      }));
      await expect(
        retireLegacyPlaintextSource({
          legacyArrivalId: seeded.arrivalId,
          memberId: MEMBER,
        }),
      ).resolves.toMatchObject({ state: "RETIRED" });
      await expect(
        fs.stat(path.join(vaultRoot, seeded.artifactRef)),
      ).rejects.toMatchObject({
        code: "ENOENT",
      });
    });

    it("binds the replacement to a signed recovery manifest and refuses a foreign owner", async () => {
      const retirement = (
        await query<any>(
          "SELECT * FROM writer_source_legacy_retirements ORDER BY created_at LIMIT 1",
        )
      ).rows[0];
      const row = (
        await query<any>(
          `SELECT l.*,a.member_id arrival_member_id,a.manuscript_id,
              a.artifact_ref arrival_artifact_ref,a.artifact_hash,a.artifact_size
         FROM writer_source_landing_intents l
         JOIN manuscript_source_arrivals a ON a.id=l.arrival_id
        WHERE l.id=$1::uuid`,
          [retirement.replacement_landing_id],
        )
      ).rows[0];
      const manifest: WriterSourceRecoveryManifest = {
        protocol: "soullab.writer.source-recovery-manifest.v1",
        sourceCommit,
        sourceTree,
        databaseGenerationSha256: "c".repeat(64),
        vaultGenerationSha256: "d".repeat(64),
        createdAt: "2026-10-27T17:00:00.000Z",
        objects: [
          {
            storageClass: "writer-source-encrypted-v1",
            memberId: MEMBER,
            manuscriptId: MANUSCRIPT,
            arrivalId: retirement.replacement_arrival_id,
            landingIntentId: retirement.replacement_landing_id,
            artifactRef: row.artifact_ref,
            originalSha256: row.original_sha256,
            originalBytes: Number(row.original_bytes),
            ciphertextSha256: row.ciphertext_sha256,
            ciphertextBytes: Number(row.ciphertext_bytes),
            keyId: row.key_id,
          },
        ],
      };
      const { publicKey, privateKey } = generateKeyPairSync("ed25519");
      const publicPem = publicKey
        .export({ type: "spki", format: "pem" })
        .toString();
      const privatePem = privateKey
        .export({ type: "pkcs8", format: "pem" })
        .toString();
      const record: WriterSourceRecoveryAuthorityRecord = {
        protocol: "soullab.writer.source-recovery-authority.v1",
        generation: 1,
        previousRecordSha256: "0".repeat(64),
        sourceCommit,
        sourceTree,
        admittedManifestSha256: writerSourceRecoveryManifestSha256(manifest),
        retiredManifestSha256: [],
        requestNonceSha256: "e".repeat(64),
        issuedAt: "2026-10-27T17:01:00.000Z",
      };
      const envelope = signWriterSourceRecoveryAuthorityForTests({
        record,
        privateKeyPem: privatePem,
      });
      await expect(
        verifyWriterSourceRecoverySet({
          manifest,
          envelopes: [envelope],
          publicKeyPem: publicPem,
          expectedSourceCommit: sourceCommit,
          expectedSourceTree: sourceTree,
        }),
      ).resolves.toMatchObject({ objectsVerified: 1, authorityGeneration: 1 });

      const foreignManifest = structuredClone(manifest);
      foreignManifest.objects[0]!.memberId = FOREIGN;
      const foreignEnvelope = signWriterSourceRecoveryAuthorityForTests({
        record: {
          ...record,
          admittedManifestSha256:
            writerSourceRecoveryManifestSha256(foreignManifest),
        },
        privateKeyPem: privatePem,
      });
      await expect(
        verifyWriterSourceRecoverySet({
          manifest: foreignManifest,
          envelopes: [foreignEnvelope],
          publicKeyPem: publicPem,
          expectedSourceCommit: sourceCommit,
          expectedSourceTree: sourceTree,
        }),
      ).rejects.toThrow("WRITER_SOURCE_RECOVERY_DB_BINDING_MISMATCH");
    });
  },
);
