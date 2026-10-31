/**
 * FICTIONAL ONLY — joined legacy plaintext Source retirement + signed recovery
 * admission + coordinated local rollback witness.
 */
import { createHash, generateKeyPairSync } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { closePool, query } from "@/lib/db/postgres";
import { retireLegacyPlaintextSource } from "@/lib/manuscript/source/legacyRetirement";
import {
  getEncryptedLandingForArrival,
  recoverEncryptedLandingBytes,
} from "@/lib/manuscript/source/encryptedLanding";
import {
  authorizeWriterSourceRecoveryManifest,
  authorizeWriterSourceRecoveryManifestDigest,
  signWriterSourceRecoveryAuthorityForTests,
  verifyWriterSourceRecoveryAuthorityChain,
  verifyWriterSourceRecoverySet,
  writerSourceRecoveryAuthorityEnvelopeSha256,
  writerSourceRecoveryManifestSha256,
  WriterSourceRecoveryError,
  type WriterSourceRecoveryAuthorityEnvelope,
  type WriterSourceRecoveryAuthorityRecord,
  type WriterSourceRecoveryManifest,
} from "@/lib/recovery/writerSourceRecoveryAuthority";

const phase = process.argv[2] ?? "";
const run = process.env.R20_JOINED_RUN ?? "";
const evidence = process.env.WRITER_LEGACY_RECOVERY_EVIDENCE_DIR ?? "";
const external = process.env.WRITER_LEGACY_RECOVERY_EXTERNAL_DIR ?? "";
const sourceCommit = process.env.WRITER_SOURCE_COMMIT ?? "";
const sourceTree = process.env.WRITER_SOURCE_TREE ?? "";
if (process.env.WS_LEGACY_SOURCE_RECOVERY !== "fictional-only") {
  throw new Error("FICTIONAL_OPT_IN_REQUIRED");
}
if (
  !/^[a-f0-9]{8}$/.test(run) ||
  !path.isAbsolute(evidence) ||
  !path.isAbsolute(external) ||
  !/^[a-f0-9]{40}$/.test(sourceCommit) ||
  !/^[a-f0-9]{40}$/.test(sourceTree)
) {
  throw new Error("LEGACY_RECOVERY_CONFIGURATION_INVALID");
}

const id = (n: number) =>
  `${String(n).padStart(8, "0")}-1111-4111-8111-${String(n).padStart(12, "0")}`;
const memberId = id(9000);
const targetManuscript = id(1001);
const bystanderManuscript = id(2001);
const targetMarker = `R20JOINEDTARGET${run}`;
const bystanderMarker = `R20JOINEDBYSTANDER${run}`;
const sha256 = (value: Buffer | string) =>
  createHash("sha256").update(value).digest("hex");
const stableJson = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(",")}}`;
};
const writeJson = async (file: string, value: unknown) => {
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, {
    mode: 0o600,
  });
};
const readJson = async <T>(file: string): Promise<T> =>
  JSON.parse(await fs.readFile(file, "utf8")) as T;
const errorCode = (error: unknown): string =>
  error instanceof WriterSourceRecoveryError
    ? error.code
    : error instanceof Error
      ? error.message.split(":")[0]!
      : String(error);
async function expectError(code: string, fn: () => unknown | Promise<unknown>) {
  let observed = "NO_ERROR";
  try {
    await fn();
  } catch (error) {
    observed = errorCode(error);
  }
  if (observed !== code)
    throw new Error(`EXPECTED_${code}_OBSERVED_${observed}`);
  return observed;
}
async function arrivalFor(manuscriptId: string) {
  const result = await query<any>(
    `SELECT * FROM manuscript_source_arrivals
      WHERE manuscript_id=$1::uuid AND member_id=$2::uuid
      ORDER BY created_at,id`,
    [manuscriptId, memberId],
  );
  if (result.rows.length !== 1) throw new Error("EXACT_ARRIVAL_REQUIRED");
  return result.rows[0];
}
async function currentManifestObject(manuscriptId: string) {
  const result = await query<any>(
    `SELECT a.id arrival_id,a.member_id,a.manuscript_id,a.artifact_ref,
            a.artifact_hash,a.artifact_size,l.id landing_id,l.original_sha256,
            l.original_bytes,l.ciphertext_sha256,l.ciphertext_bytes,l.key_id
       FROM manuscript_source_arrivals a
       JOIN writer_source_landing_intents l ON l.arrival_id=a.id
      WHERE a.manuscript_id=$1::uuid AND a.member_id=$2::uuid
        AND l.state='ARRIVAL_RECORDED'`,
    [manuscriptId, memberId],
  );
  const row = result.rows[0];
  if (!row || result.rows.length !== 1)
    throw new Error("EXACT_ENCRYPTED_OBJECT_REQUIRED");
  return {
    storageClass: "writer-source-encrypted-v1" as const,
    memberId: row.member_id,
    manuscriptId: row.manuscript_id,
    arrivalId: row.arrival_id,
    landingIntentId: row.landing_id,
    artifactRef: row.artifact_ref,
    originalSha256: row.original_sha256,
    originalBytes: Number(row.original_bytes),
    ciphertextSha256: row.ciphertext_sha256,
    ciphertextBytes: Number(row.ciphertext_bytes),
    keyId: row.key_id,
  };
}

async function captureOld() {
  const dbSha = process.env.OLD_DATABASE_GENERATION_SHA256 ?? "";
  const vaultSha = process.env.OLD_VAULT_GENERATION_SHA256 ?? "";
  if (!/^[a-f0-9]{64}$/.test(dbSha) || !/^[a-f0-9]{64}$/.test(vaultSha)) {
    throw new Error("OLD_GENERATION_DIGESTS_REQUIRED");
  }
  const target = await arrivalFor(targetManuscript);
  const bystander = await arrivalFor(bystanderManuscript);
  const descriptor = {
    protocol: "soullab.writer.source-recovery-legacy-plaintext.v0",
    sourceCommit,
    sourceTree,
    databaseGenerationSha256: dbSha,
    vaultGenerationSha256: vaultSha,
    createdAt: new Date().toISOString(),
    objects: [target, bystander].map((row) => ({
      storageClass: "writer-source-legacy-plaintext-v0",
      memberId: row.member_id,
      manuscriptId: row.manuscript_id,
      arrivalId: row.id,
      artifactRef: row.artifact_ref,
      originalSha256: row.artifact_hash,
      originalBytes: Number(row.artifact_size),
    })),
  };
  const bytes = Buffer.from(`${stableJson(descriptor)}\n`);
  await fs.writeFile(
    path.join(evidence, "OLD_RECOVERY_DESCRIPTOR.json"),
    bytes,
    { mode: 0o600 },
  );
  await writeJson(path.join(evidence, "OLD_RECOVERY_DESCRIPTOR_RECEIPT.json"), {
    protocol: descriptor.protocol,
    sha256: sha256(bytes),
    databaseGenerationSha256: dbSha,
    vaultGenerationSha256: vaultSha,
    objects: descriptor.objects.length,
    contentRecorded: false,
  });
  console.log(
    JSON.stringify(
      { phase, result: "PASS", descriptorSha256: sha256(bytes) },
      null,
      2,
    ),
  );
}

async function migrate() {
  const target = await arrivalFor(targetManuscript);
  const bystander = await arrivalFor(bystanderManuscript);
  const targetRetirement = await retireLegacyPlaintextSource({
    legacyArrivalId: target.id,
    memberId,
  });
  const bystanderRetirement = await retireLegacyPlaintextSource({
    legacyArrivalId: bystander.id,
    memberId,
  });
  if (
    targetRetirement.state !== "RETIRED" ||
    bystanderRetirement.state !== "RETIRED"
  ) {
    throw new Error("LEGACY_RETIREMENT_INCOMPLETE");
  }
  await writeJson(path.join(evidence, "MIGRATION_RECEIPT.json"), {
    protocol: "soullab.writer.source-legacy-retirement-joined.v1",
    sourceCommit,
    sourceTree,
    target: {
      legacyArrivalSha256: sha256(targetRetirement.legacy_arrival_id),
      replacementArrivalSha256: sha256(targetRetirement.replacement_arrival_id),
      retirementState: targetRetirement.state,
      migrationManifestSha256: targetRetirement.migration_manifest_sha256,
    },
    bystander: {
      legacyArrivalSha256: sha256(bystanderRetirement.legacy_arrival_id),
      replacementArrivalSha256: sha256(
        bystanderRetirement.replacement_arrival_id,
      ),
      retirementState: bystanderRetirement.state,
      migrationManifestSha256: bystanderRetirement.migration_manifest_sha256,
    },
    legacyPathsRecorded: false,
  });
  console.log(JSON.stringify({ phase, result: "PASS", retired: 2 }, null, 2));
}

async function captureCurrentAuthority() {
  const dbSha = process.env.CURRENT_DATABASE_GENERATION_SHA256 ?? "";
  const vaultSha = process.env.CURRENT_VAULT_GENERATION_SHA256 ?? "";
  if (!/^[a-f0-9]{64}$/.test(dbSha) || !/^[a-f0-9]{64}$/.test(vaultSha)) {
    throw new Error("CURRENT_GENERATION_DIGESTS_REQUIRED");
  }
  const targetCount = await query<{ n: number }>(
    "SELECT count(*)::int n FROM member_manuscripts WHERE id=$1::uuid",
    [targetManuscript],
  );
  if (targetCount.rows[0]?.n !== 0) throw new Error("TARGET_MUST_BE_DELETED");
  const object = await currentManifestObject(bystanderManuscript);
  const manifest: WriterSourceRecoveryManifest = {
    protocol: "soullab.writer.source-recovery-manifest.v1",
    sourceCommit,
    sourceTree,
    databaseGenerationSha256: dbSha,
    vaultGenerationSha256: vaultSha,
    createdAt: new Date().toISOString(),
    objects: [object],
  };
  const manifestSha = writerSourceRecoveryManifestSha256(manifest);
  const oldReceipt = await readJson<{ sha256: string }>(
    path.join(evidence, "OLD_RECOVERY_DESCRIPTOR_RECEIPT.json"),
  );
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicPem = publicKey
    .export({ format: "pem", type: "spki" })
    .toString();
  const privatePem = privateKey
    .export({ format: "pem", type: "pkcs8" })
    .toString();
  const firstRecord: WriterSourceRecoveryAuthorityRecord = {
    protocol: "soullab.writer.source-recovery-authority.v1",
    generation: 1,
    previousRecordSha256: "0".repeat(64),
    sourceCommit,
    sourceTree,
    admittedManifestSha256: oldReceipt.sha256,
    retiredManifestSha256: [],
    requestNonceSha256: sha256(`old:${run}`),
    issuedAt: new Date(Date.now() - 1000).toISOString(),
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
      admittedManifestSha256: manifestSha,
      retiredManifestSha256: [oldReceipt.sha256],
      requestNonceSha256: sha256(`current:${run}`),
      issuedAt: new Date().toISOString(),
    },
    privateKeyPem: privatePem,
  });
  await fs.mkdir(external, { recursive: true, mode: 0o700 });
  await fs.writeFile(path.join(external, "PUBLIC_KEY.pem"), publicPem, {
    mode: 0o600,
  });
  await writeJson(path.join(external, "AUTHORITY_CHAIN.json"), [first, second]);
  await writeJson(
    path.join(evidence, "CURRENT_RECOVERY_MANIFEST.json"),
    manifest,
  );
  await writeJson(path.join(evidence, "EXTERNAL_AUTHORITY_RECEIPT.json"), {
    protocol: "soullab.writer.source-recovery-authority-receipt.v1",
    generation: 2,
    oldManifestSha256: oldReceipt.sha256,
    currentManifestSha256: manifestSha,
    latestEnvelopeSha256: writerSourceRecoveryAuthorityEnvelopeSha256(second),
    publicKeySha256: second.signature.publicKeySha256,
    privateKeyRetained: false,
    sourceCommit,
    sourceTree,
  });
  console.log(
    JSON.stringify(
      { phase, result: "PASS", authorityGeneration: 2, objects: 1 },
      null,
      2,
    ),
  );
}

async function authorityFiles() {
  return {
    publicKeyPem: await fs.readFile(
      path.join(external, "PUBLIC_KEY.pem"),
      "utf8",
    ),
    envelopes: await readJson<WriterSourceRecoveryAuthorityEnvelope[]>(
      path.join(external, "AUTHORITY_CHAIN.json"),
    ),
  };
}

async function verifyOldRefusal() {
  const oldReceipt = await readJson<{ sha256: string }>(
    path.join(evidence, "OLD_RECOVERY_DESCRIPTOR_RECEIPT.json"),
  );
  const authority = await authorityFiles();
  const retired = await expectError(
    "WRITER_SOURCE_RECOVERY_MANIFEST_RETIRED",
    () =>
      authorizeWriterSourceRecoveryManifestDigest({
        manifestSha256: oldReceipt.sha256,
        ...authority,
        expectedSourceCommit: sourceCommit,
        expectedSourceTree: sourceTree,
        expectedMinimumGeneration: 2,
      }),
  );
  const oldApplication = await expectError(
    "WRITER_SOURCE_RECOVERY_SOURCE_NOT_ADMITTED",
    () =>
      verifyWriterSourceRecoveryAuthorityChain({
        ...authority,
        expectedSourceCommit: "0".repeat(40),
        expectedSourceTree: "1".repeat(40),
        expectedMinimumGeneration: 2,
      }),
  );
  const rows = await query<any>(
    `SELECT manuscript_id,artifact_ref FROM manuscript_source_arrivals
      WHERE manuscript_id IN ($1::uuid,$2::uuid) ORDER BY manuscript_id`,
    [targetManuscript, bystanderManuscript],
  );
  const presence: Array<{ manuscriptIdSha256: string; exists: boolean }> = [];
  for (const row of rows.rows) {
    const full = path.join(
      process.env.FILE_STORAGE_PATH!,
      ...String(row.artifact_ref).split("/"),
    );
    presence.push({
      manuscriptIdSha256: sha256(row.manuscript_id),
      exists: await fs.stat(full).then(
        () => true,
        () => false,
      ),
    });
  }
  if (presence.length !== 2 || presence.some((item) => !item.exists)) {
    throw new Error("OLD_PLAINTEXT_GENERATION_NOT_ACTUALLY_PRESENT");
  }
  console.log(
    JSON.stringify(
      {
        phase,
        result: "PASS_REFUSED_BEFORE_CONTENT_READ",
        retired,
        oldApplication,
        dangerousLegacyObjectsPresent: 2,
        contentRead: false,
      },
      null,
      2,
    ),
  );
}

async function verifyCurrent() {
  const manifest = await readJson<WriterSourceRecoveryManifest>(
    path.join(evidence, "CURRENT_RECOVERY_MANIFEST.json"),
  );
  const authority = await authorityFiles();
  const verified = await verifyWriterSourceRecoverySet({
    manifest,
    ...authority,
    expectedSourceCommit: sourceCommit,
    expectedSourceTree: sourceTree,
    expectedMinimumGeneration: 2,
  });
  const target = await query<{ n: number }>(
    "SELECT count(*)::int n FROM member_manuscripts WHERE id=$1::uuid",
    [targetManuscript],
  );
  const bystander = await query<{ n: number }>(
    "SELECT count(*)::int n FROM member_manuscripts WHERE id=$1::uuid",
    [bystanderManuscript],
  );
  if (target.rows[0]?.n !== 0 || bystander.rows[0]?.n !== 1) {
    throw new Error("CURRENT_RECOVERY_WORK_SET_INVALID");
  }
  const object = manifest.objects[0]!;
  const landing = await getEncryptedLandingForArrival(
    object.arrivalId,
    object.memberId,
  );
  if (
    !landing ||
    sha256(await recoverEncryptedLandingBytes(landing)) !==
      object.originalSha256
  ) {
    throw new Error("CURRENT_RECOVERY_ORIGINAL_MISMATCH");
  }

  const wrongKey = generateKeyPairSync("ed25519")
    .publicKey.export({ format: "pem", type: "spki" })
    .toString();
  const wrongKeyCode = await expectError(
    "WRITER_SOURCE_RECOVERY_SIGNATURE_INVALID",
    () =>
      authorizeWriterSourceRecoveryManifest({
        manifest,
        envelopes: authority.envelopes,
        publicKeyPem: wrongKey,
        expectedSourceCommit: sourceCommit,
        expectedSourceTree: sourceTree,
      }),
  );
  const tampered = structuredClone(manifest);
  tampered.databaseGenerationSha256 = "9".repeat(64);
  const tamperedCode = await expectError(
    "WRITER_SOURCE_RECOVERY_MANIFEST_NOT_ADMITTED",
    () =>
      authorizeWriterSourceRecoveryManifest({
        manifest: tampered,
        ...authority,
        expectedSourceCommit: sourceCommit,
        expectedSourceTree: sourceTree,
      }),
  );
  const wrongOwner = structuredClone(manifest);
  wrongOwner.objects[0]!.memberId = id(9999);
  const wrongOwnerCode = await expectError(
    "WRITER_SOURCE_RECOVERY_MANIFEST_NOT_ADMITTED",
    () =>
      authorizeWriterSourceRecoveryManifest({
        manifest: wrongOwner,
        ...authority,
        expectedSourceCommit: sourceCommit,
        expectedSourceTree: sourceTree,
      }),
  );

  const full = path.join(
    process.env.FILE_STORAGE_PATH!,
    ...object.artifactRef.split("/"),
  );
  const ciphertext = await fs.readFile(full);
  await fs.rename(full, `${full}.missing`);
  const absenceCode = await expectError(
    "WRITER_SOURCE_RECOVERY_OBJECT_ABSENT",
    () =>
      verifyWriterSourceRecoverySet({
        manifest,
        ...authority,
        expectedSourceCommit: sourceCommit,
        expectedSourceTree: sourceTree,
      }),
  );
  await fs.rename(`${full}.missing`, full);
  const corrupt = Buffer.from(ciphertext);
  corrupt[0] ^= 0xff;
  await fs.writeFile(full, corrupt, { mode: 0o600 });
  const corruptCode = await expectError(
    "WRITER_SOURCE_RECOVERY_OBJECT_CORRUPT_CIPHERTEXT",
    () =>
      verifyWriterSourceRecoverySet({
        manifest,
        ...authority,
        expectedSourceCommit: sourceCommit,
        expectedSourceTree: sourceTree,
      }),
  );
  await fs.writeFile(full, ciphertext, { mode: 0o600 });
  await verifyWriterSourceRecoverySet({
    manifest,
    ...authority,
    expectedSourceCommit: sourceCommit,
    expectedSourceTree: sourceTree,
  });

  console.log(
    JSON.stringify(
      {
        phase,
        result: "PASS",
        verified,
        targetAbsent: true,
        bystanderRestored: true,
        negatives: {
          wrongKeyCode,
          tamperedCode,
          wrongOwnerCode,
          absenceCode,
          corruptCode,
        },
      },
      null,
      2,
    ),
  );
}

const phases: Record<string, () => Promise<void>> = {
  "capture-old": captureOld,
  migrate,
  "capture-current-authority": captureCurrentAuthority,
  "verify-old-refusal": verifyOldRefusal,
  "verify-current": verifyCurrent,
};

async function executePhase(): Promise<void> {
  const execute = phases[phase];
  if (!execute) throw new Error(`UNKNOWN_PHASE:${phase}`);
  try {
    await execute();
  } finally {
    await closePool();
  }
}

executePhase().catch((error) => {
  console.error(
    JSON.stringify({ phase, result: "FAIL", code: errorCode(error) }),
  );
  process.exitCode = 1;
});
