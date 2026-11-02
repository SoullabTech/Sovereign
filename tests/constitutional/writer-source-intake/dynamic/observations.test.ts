/**
 * Dynamic observation probes for the Writer encrypted-Source landing.
 *
 * WHAT THIS IS. It runs the REAL library (encryptedLanding, sourceKeyAuthority's aws-kms code path, arrivals,
 * discard, erase) against a real PostgreSQL 16 and a real vault directory, with the AWS SDK client replaced by a
 * recording fake through the library's own test seam (setSourceKmsClientFactoryForTests). It observes behaviour the
 * static plan could only read.
 *
 * WHAT THIS IS NOT. It is NOT evidence about real AWS KMS: no network, no IAM, no CloudTrail, no real latency or
 * throttling. It is NOT a production-shaped schema (the runner builds the witness script's stub schema plus three
 * migrations). It does NOT exercise the HTTP route, which is held at module load. Every observation below carries
 * that ceiling.
 *
 * STYLE. Each probe records an observation and asserts TODAY's behaviour. If someone fixes a defect, the probe fails
 * with "FINDING CHANGED" - which is the point: the acceptance record must then be updated, not silently outdated.
 *
 * SAFETY. Disabled unless WS_SOURCE_INTAKE_DYNAMIC=fictional-only. Refuses a vault whose path lacks
 * 'ws-encrypted-source-fictional-' and any non-loopback database. Fictional data only; output is content-free.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { KMSClient, KMSClientConfig } from '@aws-sdk/client-kms';

jest.mock('@/lib/recovery/r20DeletionLedger', () => ({
  sealR20DeletionLedger: jest.fn(async () => ({ sealed: true })),
  r20LedgerErrorCode: jest.fn(() => 'fictional_r20_error'),
}));

import { closePool, query, transaction } from '@/lib/db/postgres';
import {
  beginEncryptedLanding,
  inspectMemberIncompleteLandings,
  markEncryptedBytesVerified,
  prepareEncryptedWrite,
  recordEncryptedArtifactArrival,
  writePreparedCiphertext,
} from '@/lib/manuscript/source/encryptedLanding';
import { claimArrival, verifyCustody } from '@/lib/manuscript/source/arrivals';
import { clearSourceEnvelopeKeyCacheForTests } from '@/lib/manuscript/source/sourceEnvelope';
import { setSourceKmsClientFactoryForTests } from '@/lib/manuscript/source/sourceKeyAuthority';
import { discardUnclaimedArrival } from '@/lib/manuscript/source/discardUnclaimedArrival';
import { eraseManuscript } from '@/lib/manuscript/source/eraseManuscript';
import { discardIncompleteLanding, listMemberUnfinishedUploads } from '@/lib/manuscript/source/discardIncompleteLanding';
import { sealR20DeletionLedger } from '@/lib/recovery/r20DeletionLedger';
import * as fileVault from '@/lib/storage/fileVault';
import { parseUpload } from '@/lib/manuscript/ingest/parseUpload';

const enabled = process.env.WS_SOURCE_INTAKE_DYNAMIC === 'fictional-only';
const suite = enabled ? describe : describe.skip;

/**
 * INCIDENT (2026-11-02, first run of this suite): clearSourceEnvelopeKeyCacheForTests() ALSO nulls the library's KMS
 * client factory (clearSourceKeyAuthorityCachesForTests sets kmsClientFactory = null). A reset() that called it
 * silently dropped the fake, the library built a REAL KMSClient, the SDK's default credential chain picked up the
 * ambient AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY of the host, and signed GenerateDataKey requests went to the real
 * regional endpoint (rejected: invalid token). Three layers now prevent a repeat:
 *   1. the fake is RE-INSTALLED after every cache clear (installFake in reset);
 *   2. ambient AWS_* / proxy variables are removed from THIS process and replaced by obviously fictional credentials
 *      and a loopback endpoint, so even a dropped fake cannot sign with a real credential or leave the host;
 *   3. every test asserts the fake actually received the traffic (kms.config is set; commands were recorded).
 * Finding for the acceptance plan: the SDK default chain DOES pick up ambient AWS_* environment credentials
 * (measured, accidentally). This is the hazard FILL-6b names for .env.production reaching 14 services.
 */
if (enabled) {
  for (const k of Object.keys(process.env)) {
    if (/^(AWS_|HTTPS?_PROXY$|ALL_PROXY$|NODE_USE_ENV_PROXY$)/i.test(k)) delete process.env[k];
  }
  process.env.AWS_ACCESS_KEY_ID = 'fictional-not-a-credential';
  process.env.AWS_SECRET_ACCESS_KEY = 'fictional-not-a-credential';
  process.env.AWS_ENDPOINT_URL = 'http://127.0.0.1:9';
  process.env.AWS_ENDPOINT_URL_KMS = 'http://127.0.0.1:9';
  process.env.NO_PROXY = '*';
  process.env.no_proxy = '*';
}
jest.setTimeout(180_000);

const vaultRoot = process.env.FILE_STORAGE_PATH ?? '';
const OUT = process.env.WS_OBSERVATIONS_OUT ?? '';
const FIXTURE_DIR = process.env.WS_FIXTURE_DIR ?? '';

const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';
const MS_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MS_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const MS_DELETE = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
// Built at runtime so no ARN-shaped literal is committed. All-zero account and key id: obviously fictional.
const FAKE_ARN = ['arn', 'aws', 'kms', 'us-east-1', '000000000000', 'key/00000000-0000-4000-8000-000000000000'].join(':');
const CANARY = `WSICANARY${randomBytes(12).toString('hex').toUpperCase()}`;

/* ------------------------------------------------------------------ observation log (content-free) */
type Obs = { id: string; obligations: string[]; finding: string; observed: Record<string, unknown> };
const OBS: Obs[] = [];
function observe(id: string, obligations: string[], finding: string, observed: Record<string, unknown>) {
  OBS.push({ id, obligations, finding, observed });
}

/* ------------------------------------------------------------------ console capture (WSI-38 / FILL-17b) */
const logged: string[] = [];
function captureConsole() {
  for (const m of ['log', 'info', 'warn', 'error', 'debug'] as const) {
    jest.spyOn(console, m).mockImplementation((...a: unknown[]) => {
      try { logged.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x, (_k, v) => (v instanceof Error ? `${v.name}:${v.message}` : v)))).join(' ')); } catch { logged.push('[unserializable]'); }
    });
  }
}

/* ------------------------------------------------------------------ recording fake KMS */
type Mode = 'ok' | 'denied' | 'throttled' | 'disabled' | 'outage' | 'hang';
type Cmd = 'GenerateDataKeyCommand' | 'DecryptCommand';
class FakeKms {
  config: unknown = null;
  commands: { name: Cmd; input: Record<string, unknown> }[] = [];
  mode: Record<Cmd, Mode> = { GenerateDataKeyCommand: 'ok', DecryptCommand: 'ok' };
  issuedPlaintextKeys: Buffer[] = []; // per test (reset)
  allIssuedPlaintextKeys: Buffer[] = []; // cumulative, NEVER reset: the log scan at the end must cover every key issued in the run
  private readonly master = randomBytes(32);
  private releaseHang: (() => void) | null = null;
  private enteredResolve: (() => void) | null = null;
  entered: Promise<void> = Promise.resolve();

  reset() { this.commands = []; this.mode = { GenerateDataKeyCommand: 'ok', DecryptCommand: 'ok' }; }
  count(name: Cmd) { return this.commands.filter((c) => c.name === name).length; }
  armHang() { this.entered = new Promise<void>((r) => { this.enteredResolve = r; }); }
  release() { this.releaseHang?.(); this.releaseHang = null; }

  private ctxAad(ctx: unknown) {
    const o = (ctx ?? {}) as Record<string, string>;
    return Buffer.from(JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]])), 'utf8');
  }
  private fail(mode: Mode): never {
    const names: Record<string, string> = { denied: 'AccessDeniedException', throttled: 'ThrottlingException', disabled: 'DisabledException', outage: 'ServiceUnavailableException' };
    const e = new Error('fictional kms fault'); e.name = names[mode] ?? 'Error'; throw e;
  }
  async send(cmd: { constructor: { name: string }; input: Record<string, unknown> }) {
    const name = cmd.constructor.name as Cmd;
    this.commands.push({ name, input: JSON.parse(JSON.stringify(cmd.input, (_k, v) => (v instanceof Uint8Array ? '[bytes]' : v))) });
    const mode = this.mode[name];
    if (mode === 'hang') {
      this.enteredResolve?.();
      await new Promise<void>((r) => { this.releaseHang = r; });
    } else if (mode !== 'ok') this.fail(mode);
    if (name === 'GenerateDataKeyCommand') {
      const plain = randomBytes(32);
      this.issuedPlaintextKeys.push(Buffer.from(plain));
      this.allIssuedPlaintextKeys.push(Buffer.from(plain));
      const iv = randomBytes(12);
      const c = createCipheriv('aes-256-gcm', this.master, iv); c.setAAD(this.ctxAad(cmd.input.EncryptionContext));
      const ct = Buffer.concat([c.update(plain), c.final()]);
      return { Plaintext: new Uint8Array(plain), CiphertextBlob: new Uint8Array(Buffer.concat([iv, c.getAuthTag(), ct])), KeyId: cmd.input.KeyId };
    }
    const blob = Buffer.from(cmd.input.CiphertextBlob as Uint8Array);
    const d = createDecipheriv('aes-256-gcm', this.master, blob.subarray(0, 12)); d.setAAD(this.ctxAad(cmd.input.EncryptionContext)); d.setAuthTag(blob.subarray(12, 28));
    const plain = Buffer.concat([d.update(blob.subarray(28)), d.final()]);
    return { Plaintext: new Uint8Array(plain), KeyId: FAKE_ARN };
  }
  destroy() { /* nothing to close */ }
}
const kms = new FakeKms();
function installFake() {
  setSourceKmsClientFactoryForTests((config: KMSClientConfig) => { kms.config = config; return kms as unknown as KMSClient; });
}

/* ------------------------------------------------------------------ helpers */
function bytesFor(label: string) {
  // Starts with a ZIP magic on purpose: a plaintext original in the vault would be detectable by magic AND by canary.
  return Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from(` ${label} ${CANARY} `, 'utf8'), randomBytes(512)]);
}
function input(label: string, key: string, over: Record<string, unknown> = {}) {
  return {
    memberId: MEMBER_A, bytes: bytesFor(label), originalFilename: `${label}.docx`, mimeType: DOCX,
    sourceText: `# ${label}\n\nFictional extracted text ${CANARY}.`, extractor: 'docx' as const, format: 'docx' as const,
    idempotencyKey: key, ...over,
  };
}
const KEY = (n: number) => `20000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
async function intentRow(key: string, member = MEMBER_A) {
  return (await query<{ id: string; state: string; artifact_ref: string; arrival_id: string | null }>(
    'SELECT id,state,artifact_ref,arrival_id FROM writer_source_landing_intents WHERE idempotency_key=$1::uuid AND member_id=$2::uuid', [key, member])).rows[0];
}
async function vaultFiles(): Promise<string[]> {
  const out: string[] = [];
  async function walk(d: string) {
    for (const e of await fs.readdir(d, { withFileTypes: true }).catch(() => [])) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p); else out.push(p);
    }
  }
  await walk(vaultRoot);
  return out;
}
async function reset() {
  await query('TRUNCATE provenance_tombstones, deletion_manifest_scopes, deletion_manifests, vault_erasure_queue, writer_source_landing_intents, manuscript_source_arrivals, member_manuscripts, members CASCADE');
  await query('INSERT INTO members(id) VALUES ($1::uuid),($2::uuid)', [MEMBER_A, MEMBER_B]);
  await query(`INSERT INTO member_manuscripts(id,member_id,title) VALUES ($1::uuid,$2::uuid,'Fictional A'),($3::uuid,$4::uuid,'Fictional B'),($5::uuid,$2::uuid,'Fictional Delete')`, [MS_A, MEMBER_A, MS_B, MEMBER_B, MS_DELETE]);
  for (const f of await vaultFiles()) await fs.rm(f, { force: true });
  kms.reset();
  kms.issuedPlaintextKeys = [];
  clearSourceEnvelopeKeyCacheForTests(); // NOTE: this also nulls the KMS client factory ...
  installFake(); // ... so the fake is put back immediately (see INCIDENT note at the top of this file)
  kms.config = null;
}
/** Needle forms for a secret: raw, utf8-hex, base64 (3 alignments for substrings), base64url, hex upper. */
function forms(secret: Buffer): Buffer[] {
  const out: Buffer[] = [secret, Buffer.from(secret.toString('hex'), 'utf8'), Buffer.from(secret.toString('hex').toUpperCase(), 'utf8'),
    Buffer.from(secret.toString('base64'), 'utf8'), Buffer.from(secret.toString('base64url'), 'utf8')];
  for (const pad of [1, 2]) out.push(Buffer.from(Buffer.concat([Buffer.alloc(pad), secret]).toString('base64'), 'utf8').subarray(pad === 1 ? 2 : 3, -2));
  return out;
}
function hasAny(hay: Buffer, needles: Buffer[]) { return needles.some((n) => n.length > 0 && hay.includes(n)); }

suite('Writer encrypted Source landing - dynamic observations (fake KMS, real PostgreSQL 16, real vault)', () => {
  beforeAll(async () => {
    if (!vaultRoot.includes('ws-encrypted-source-fictional-')) throw new Error('refused: needs a disposable fictional vault');
    if (!/@(127\.0\.0\.1|localhost)[:/]/.test(process.env.DATABASE_URL ?? '')) throw new Error('refused: database must be loopback');
    captureConsole();
    process.env.WRITER_SOURCE_KEY_PROVIDER = 'aws-kms';
    process.env.WRITER_SOURCE_KMS_KEY_ARN = FAKE_ARN;
    process.env.WRITER_SOURCE_KMS_REGION = 'us-east-1';
    delete process.env.WRITER_SOURCE_KEK; delete process.env.WRITER_SOURCE_KEK_ID; delete process.env.WRITER_SOURCE_KEK_RING_JSON;
    installFake();
  });
  beforeEach(async () => { await reset(); });
  afterAll(async () => {
    setSourceKmsClientFactoryForTests(null);
    if (OUT) await fs.writeFile(OUT, JSON.stringify({ protocol: 'writer-source-intake-dynamic-observations/1', ceiling: 'fake KMS, stub schema, no HTTP route', observations: OBS }, null, 1));
    await closePool();
  });

  it('K1 [C04,D9] the KMS client is built with region, maxAttempts 3 and EXPLICIT connect/request timeouts that throw', async () => {
    await recordEncryptedArtifactArrival(input('k1', KEY(1)));
    const cfg = kms.config as any;
    observe('K1', ['WSI-32', 'WSI-03'], 'client config', { keys: Object.keys(cfg).sort(), maxAttempts: cfg?.maxAttempts, requestHandler: cfg?.requestHandler });
    expect(Object.keys(cfg).sort()).toEqual(['maxAttempts', 'region', 'requestHandler']);
    expect(cfg.maxAttempts).toBe(3);
    // requestTimeout alone only LOGS a warning in the installed SDK; throwOnRequestTimeout is what makes it a bound.
    expect(cfg.requestHandler).toEqual({ connectionTimeout: 3000, requestTimeout: 10000, throwOnRequestTimeout: true });
  });

  it('K2 [C20] one upload plus claim plus verify makes 1 GenerateDataKey and the expected Decrypt count', async () => {
    const a = await recordEncryptedArtifactArrival(input('k2', KEY(2)));
    const afterUpload = { gdk: kms.count('GenerateDataKeyCommand'), dec: kms.count('DecryptCommand') };
    await claimArrival(a.id, MS_A, MEMBER_A);
    const afterClaim = { gdk: kms.count('GenerateDataKeyCommand'), dec: kms.count('DecryptCommand') };
    await verifyCustody(MS_A, MEMBER_A);
    const afterVerify = { gdk: kms.count('GenerateDataKeyCommand'), dec: kms.count('DecryptCommand') };
    observe('K2', ['WSI-36'], 'KMS call model', { afterUpload, afterClaim, afterVerify });
    expect(afterUpload.gdk).toBe(1);
    expect(afterClaim.gdk).toBe(1);
    expect(afterVerify.gdk).toBe(1);
    // The plan's model: upload decrypts twice (verify read-back + commit inspection), claim once, verify once.
    expect(afterUpload.dec).toBe(2);
    expect(afterClaim.dec - afterUpload.dec).toBe(1);
    expect(afterVerify.dec - afterClaim.dec).toBe(1);
  });

  it('K3 [WSI-35] every KMS command carries exactly the two content-free context keys and no member, work, filename or canary', async () => {
    const a = await recordEncryptedArtifactArrival(input('k3-file-name', KEY(3)));
    await claimArrival(a.id, MS_A, MEMBER_A);
    const ctxKeys = new Set<string>();
    for (const c of kms.commands) ctxKeys.add(Object.keys((c.input.EncryptionContext ?? {}) as object).sort().join('|'));
    const blob = JSON.stringify(kms.commands);
    const leaks = [MEMBER_A, MS_A, 'k3-file-name', CANARY].filter((s) => blob.includes(s));
    observe('K3', ['WSI-35', 'FILL-17b'], 'encryption context', { distinctKeySets: [...ctxKeys], commands: kms.commands.length, leaks: leaks.length });
    expect([...ctxKeys]).toEqual(['soullab:context-sha256|soullab:domain']);
    expect(leaks).toEqual([]);
    const domains = new Set(kms.commands.map((c) => (c.input.EncryptionContext as any)['soullab:domain']));
    expect([...domains]).toEqual(['writer-source-v1']);
  });

  it('K4 [WSI-16] a denied GenerateDataKey fails closed: no file, intent left PENDING_BYTES, and a retry resumes the same intent', async () => {
    const inp = input('k4', KEY(4));
    kms.mode.GenerateDataKeyCommand = 'denied';
    const err: any = await recordEncryptedArtifactArrival(inp).then(() => null, (e) => e);
    const row = await intentRow(KEY(4));
    const files = (await vaultFiles()).length;
    kms.mode.GenerateDataKeyCommand = 'ok';
    const done = await recordEncryptedArtifactArrival(inp);
    observe('K4', ['WSI-16', 'WSI-37'], 'KMS denied at upload', { rejected: Boolean(err), errorName: err?.name, errorMessage: String(err?.message).slice(0, 120), intentState: row?.state, filesOnDisk: files, retryResumedSameIntent: done.landingIntentId === row?.id });
    expect(err).not.toBeNull();
    expect(row?.state).toBe('PENDING_BYTES');
    expect(files).toBe(0);
    expect(done.landingIntentId).toBe(row?.id);
  });

  it('K5 [WSI-18,C08] with KMS down, verifyCustody reports not custodied and a claim fails without moving ownership', async () => {
    const a = await recordEncryptedArtifactArrival(input('k5-claimed', KEY(5)));
    await claimArrival(a.id, MS_A, MEMBER_A);
    const b = await recordEncryptedArtifactArrival(input('k5-unclaimed', KEY(6)));
    kms.mode.DecryptCommand = 'outage';
    const verified = await verifyCustody(MS_A, MEMBER_A);
    const claim: any = await claimArrival(b.id, MS_B, MEMBER_B).then((v) => ({ resolved: v }), (e) => ({ threw: e?.message }));
    const owner = (await query<{ manuscript_id: string | null }>('SELECT manuscript_id FROM manuscript_source_arrivals WHERE id=$1::uuid', [b.id])).rows[0];
    observe('K5', ['WSI-18', 'WSI-24'], 'reopen and claim under KMS outage', { verifyCustody: verified, claimOutcome: claim, arrivalStillUnclaimed: owner?.manuscript_id === null });
    expect(verified.custodied).toBe(false);
    expect(owner?.manuscript_id).toBeNull();
  });

  it('K6 [C19,WSI-32] while KMS Decrypt hangs inside claimArrival, row locks are held on the arrival and the Work', async () => {
    const a = await recordEncryptedArtifactArrival(input('k6', KEY(7)));
    kms.mode.DecryptCommand = 'hang';
    kms.armHang();
    const claim = claimArrival(a.id, MS_A, MEMBER_A);
    await Promise.race([kms.entered, new Promise((_r, rej) => setTimeout(() => rej(new Error('Decrypt was never reached inside claimArrival')), 15_000))]);
    const probe = async (sql: string, p: unknown[]) => query(sql, p).then(() => 'free', (e: any) => e?.code ?? 'error');
    const arrivalLock = await probe('SELECT 1 FROM manuscript_source_arrivals WHERE id=$1::uuid FOR UPDATE NOWAIT', [a.id]);
    const workLock = await probe('SELECT 1 FROM member_manuscripts WHERE id=$1::uuid FOR UPDATE NOWAIT', [MS_A]);
    kms.release(); kms.mode.DecryptCommand = 'ok';
    const claimed = await claim;
    observe('K6', ['WSI-32'], 'row locks held across a KMS call', { arrivalRowLock: arrivalLock, workRowLock: workLock, claimCompletedAfterRelease: claimed });
    expect(arrivalLock).toBe('55P03'); // lock_not_available: the row is locked while the KMS call is in flight
    expect(claimed).toBe(true);
  });

  it('K7 [WSI-12] two simultaneous uploads of the same key and bytes converge on one intent and one arrival', async () => {
    const inp = input('k7', KEY(8));
    const r = await Promise.allSettled([recordEncryptedArtifactArrival(inp), recordEncryptedArtifactArrival(inp)]);
    const rows = (await query<{ n: number }>('SELECT count(*)::int n FROM writer_source_landing_intents WHERE idempotency_key=$1::uuid', [KEY(8)])).rows[0].n;
    const arrivals = (await query<{ n: number }>('SELECT count(*)::int n FROM manuscript_source_arrivals')).rows[0].n;
    observe('K7', ['WSI-12', 'WSI-36'], 'concurrent same-key upload', { settled: r.map((x) => x.status), rejectedMessages: r.filter((x) => x.status === 'rejected').map((x: any) => String(x.reason?.message).slice(0, 80)), intentRows: rows, arrivalRows: arrivals, generateDataKeyCalls: kms.count('GenerateDataKeyCommand') });
    expect(r.some((x) => x.status === 'fulfilled')).toBe(true); // a run where both failed would pass the lines below vacuously
    expect(kms.count('GenerateDataKeyCommand')).toBeGreaterThanOrEqual(1);
    expect(rows).toBe(1);
    expect(arrivals).toBe(1);
  });

  it('K8 [WSI-13] a key reused with different bytes is refused without a second intent; another member may reuse the key independently', async () => {
    const first = await recordEncryptedArtifactArrival(input('k8-a', KEY(9)));
    const clash: any = await recordEncryptedArtifactArrival(input('k8-b', KEY(9))).then(() => null, (e) => e);
    const other = await recordEncryptedArtifactArrival(input('k8-a', KEY(9), { memberId: MEMBER_B }));
    const intents = (await query<{ n: number }>('SELECT count(*)::int n FROM writer_source_landing_intents WHERE idempotency_key=$1::uuid', [KEY(9)])).rows[0].n;
    observe('K8', ['WSI-13', 'WSI-37'], 'idempotency conflict is wrapped as an incomplete landing', { thrownName: clash?.name, thrownMessage: String(clash?.message).slice(0, 60), causeMessage: String(clash?.cause?.message).slice(0, 60), intentsForKey: intents, otherMemberGotOwnIntent: other.landingIntentId !== first.landingIntentId });
    expect(clash).not.toBeNull();
    // The member-facing wrapper hides the cause: a permanent conflict reads as the same retryable 'incomplete' as an outage.
    expect(clash.name).toBe('SourceLandingIncompleteError');
    expect(String(clash.message)).toBe('source_landing_incomplete');
    expect(String(clash.cause?.message)).toContain('idempotency_conflict');
    expect(other.landingIntentId).not.toBe(first.landingIntentId);
    expect(intents).toBe(2); // one per member, never merged
  });

  it('K9 [C12,D-await] a database error while replaying an already-recorded upload is wrapped, never leaked raw', async () => {
    const inp = input('k9', KEY(18));
    await recordEncryptedArtifactArrival(inp); // ARRIVAL_RECORDED
    const pg = require('@/lib/db/postgres');
    const real = pg.query;
    const spy = jest.spyOn(pg, 'query').mockImplementation(((sql: string, params?: unknown[]) => {
      if (typeof sql === 'string' && sql.includes('FROM manuscript_source_arrivals') && sql.includes('source_text_hash')) {
        return Promise.reject(Object.assign(new Error('fictional database fault'), { name: 'FictionalDbFault' }));
      }
      return real(sql, params);
    }) as any);
    let err: any = null;
    try { await recordEncryptedArtifactArrival(inp); } catch (e) { err = e; } finally { spy.mockRestore(); }
    observe('K9', ['WSI-12'], 'replay database fault', { thrownName: err?.name, causeName: err?.cause?.name });
    expect(err).not.toBeNull();
    // Before the fix `return loadRecordedArrival(..)` inside the try skipped the catch, so the RAW fault escaped here and
    // the route turned it into a generic 500 that said no manuscript was created although the arrival existed.
    expect(err.name).toBe('SourceLandingIncompleteError');
    expect(err.cause?.name).toBe('FictionalDbFault');
  });

  it('S1 [C17,WSI-20] incomplete intents persist with ciphertext and are reached by no PRE-EXISTING discard or Delete Work door (the new member door is S5)', async () => {
    const pending = await beginEncryptedLanding(input('s1-pending', KEY(10)));
    const wInp = input('s1-writing', KEY(11));
    const w = await beginEncryptedLanding(wInp);
    const wPrepared = await prepareEncryptedWrite({ memberId: MEMBER_A, intentId: w.id, bytes: wInp.bytes });
    await writePreparedCiphertext(wPrepared);
    const vInp = input('s1-verified', KEY(12));
    const v = await beginEncryptedLanding(vInp);
    const vPrepared = await prepareEncryptedWrite({ memberId: MEMBER_A, intentId: v.id, bytes: vInp.bytes });
    await writePreparedCiphertext(vPrepared);
    await markEncryptedBytesVerified(vPrepared.lease);
    const before = (await query<{ state: string }>('SELECT state FROM writer_source_landing_intents ORDER BY state')).rows.map((r) => r.state);
    const filesBefore = (await vaultFiles()).length;
    const inspected = await inspectMemberIncompleteLandings(MEMBER_A);
    const discards = await Promise.all([pending.id, w.id, v.id].map((id) => discardUnclaimedArrival(id, MEMBER_A)));
    const erased = await eraseManuscript(MS_DELETE, MEMBER_A);
    const after = (await query<{ state: string }>('SELECT state FROM writer_source_landing_intents ORDER BY state')).rows.map((r) => r.state);
    const filesAfter = (await vaultFiles()).length;
    observe('S1', ['WSI-20', 'WSI-21', 'WSI-26'], 'stranded intents', { statesBefore: before, statesAfter: after, filesBefore, filesAfter, inspectLibraryFnSees: inspected.length, discardOutcomes: discards.map((d) => d.kind), eraseOkButNothingQueued: (erased as any).artifactsQueued });
    expect(after).toEqual(before);
    expect(filesAfter).toBe(filesBefore);
    expect(filesBefore).toBeGreaterThanOrEqual(2);
    expect(discards.every((d) => d.kind === 'not_found')).toBe(true);
    expect(inspected.length).toBe(3); // the door exists as a library function; nothing deployed calls it
  });

  describe('S5 [D3] the member can remove an unfinished upload', () => {
    async function stage(label: string, key: number, upTo: 'pending' | 'writing' | 'verified', member = MEMBER_A) {
      const inp = input(label, KEY(key), { memberId: member });
      const intent = await beginEncryptedLanding(inp);
      if (upTo === 'pending') return { intent, inp, prepared: null as any };
      const prepared = await prepareEncryptedWrite({ memberId: member, intentId: intent.id, bytes: inp.bytes });
      await writePreparedCiphertext(prepared);
      if (upTo === 'verified') await markEncryptedBytesVerified(prepared.lease);
      return { intent, inp, prepared };
    }
    /**
     * Simulates the passage of the 10-minute write lease. A lease lapses with TIME, and a test cannot wait ten minutes, so
     * the clock-bearing column is backdated directly. The guard trigger forbids every update of a BYTES_VERIFIED row except
     * its single legal transition, so it is disabled for exactly this statement inside one transaction and restored in
     * the same transaction (ALTER TABLE is transactional). This is a disposable test database; nothing in the library does
     * this, and the library's own code paths are what the probes then exercise.
     */
    const expireLease = (id: string) => transaction(async (tx) => {
      await tx.query('ALTER TABLE writer_source_landing_intents DISABLE TRIGGER writer_source_landing_guard_trigger');
      await tx.query(
        `UPDATE writer_source_landing_intents
            SET lease_expires_at = clock_timestamp() - interval '1 second'
          WHERE id = $1::uuid AND lease_token IS NOT NULL`, [id]);
      await tx.query('ALTER TABLE writer_source_landing_intents ENABLE TRIGGER writer_source_landing_guard_trigger');
    });
    const rowCount = async (id: string) => (await query('SELECT 1 FROM writer_source_landing_intents WHERE id=$1::uuid', [id])).rowCount;
    const tombstones = async (id: string) => (await query(`SELECT 1 FROM provenance_tombstones WHERE object_kind='writer_source_landing_intents' AND object_id=$1`, [id])).rowCount;
    const queueRows = async () => (await query('SELECT 1 FROM vault_erasure_queue')).rowCount;

    it('S5a removes an intent in each incomplete state: row and wrapped key gone, ciphertext destroyed, tombstoned, nothing owed', async () => {
      const pending = await stage('s5a-pending', 20, 'pending');
      const verified = await stage('s5a-verified', 21, 'verified');
      const writing = await stage('s5a-writing', 22, 'writing');
      await expireLease(verified.intent.id);  // a live lease is refused (S5b); a lapsed one is removable
      await expireLease(writing.intent.id);
      const filesBefore = (await vaultFiles()).length;
      const outcomes = [];
      for (const x of [pending, verified, writing]) outcomes.push(await discardIncompleteLanding(x.intent.id, MEMBER_A));
      const after = { rows: [await rowCount(pending.intent.id), await rowCount(verified.intent.id), await rowCount(writing.intent.id)],
        tombstoned: [await tombstones(pending.intent.id), await tombstones(verified.intent.id), await tombstones(writing.intent.id)],
        files: (await vaultFiles()).length, queue: await queueRows() };
      observe('S5a', ['WSI-20', 'WSI-21', 'FILL-1b'], 'unfinished upload removal', { outcomes: outcomes.map((o) => o.kind), bytesDestroyed: outcomes.map((o: any) => o.bytesDestroyed), filesBefore, after });
      expect(outcomes.map((o) => o.kind)).toEqual(['discarded', 'discarded', 'discarded']);
      expect(after.rows).toEqual([0, 0, 0]);       // the intent rows are gone, and the wrapped key lived in the row
      expect(after.tombstoned).toEqual([1, 1, 1]); // an older snapshot cannot reintroduce them
      expect(filesBefore).toBe(2);
      expect(after.files).toBe(0);                 // the ciphertext is destroyed
      expect(after.queue).toBe(0);                 // and no erasure is owed
    });

    it('S5b refuses under a live write lease, refuses a foreign member, refuses a recorded arrival, and is idempotent', async () => {
      const live = await stage('s5b-live', 23, 'writing');
      const mine = await stage('s5b-mine', 24, 'verified');
      const recorded = await recordEncryptedArtifactArrival(input('s5b-recorded', KEY(25)));
      const liveOutcome = await discardIncompleteLanding(live.intent.id, MEMBER_A);
      const liveVerifiedOutcome = await discardIncompleteLanding(mine.intent.id, MEMBER_A); // verified, lease still live
      await expireLease(mine.intent.id);
      const foreign = await discardIncompleteLanding(mine.intent.id, MEMBER_B);
      const recordedOutcome = await discardIncompleteLanding(recorded.landingIntentId, MEMBER_A);
      const stillThere = [await rowCount(live.intent.id), await rowCount(mine.intent.id), await rowCount(recorded.landingIntentId)];
      const first = await discardIncompleteLanding(mine.intent.id, MEMBER_A);
      const second = await discardIncompleteLanding(mine.intent.id, MEMBER_A);
      observe('S5b', ['WSI-20'], 'removal refusals', { liveLease: liveOutcome.kind, liveVerifiedLease: liveVerifiedOutcome.kind, foreignMember: foreign.kind, recordedArrival: recordedOutcome.kind, rowsUntouched: stillThere, first: first.kind, second: second.kind });
      expect(liveOutcome.kind).toBe('in_progress');
      expect(liveVerifiedOutcome.kind).toBe('in_progress'); // BYTES_VERIFIED keeps its write lease, so it is protected the same way
      expect(foreign.kind).toBe('not_found');          // another member's upload is indistinguishable from absent
      expect(recordedOutcome.kind).toBe('already_recorded');
      expect(stillThere).toEqual([1, 1, 1]);           // none of the refusals deleted anything
      expect(first.kind).toBe('discarded');
      expect(second.kind).toBe('not_found');           // a second press is harmless
    });

    it('S5c keeps the obligation durable and does NOT claim success when the bytes cannot be destroyed or the ledger cannot be sealed', async () => {
      const a = await stage('s5c-destroy-fails', 26, 'verified');
      await expireLease(a.intent.id);
      const destroy = jest.spyOn(fileVault, 'destroyVaultBytes').mockRejectedValueOnce(new Error('fictional disk fault'));
      const failedDestroy = await discardIncompleteLanding(a.intent.id, MEMBER_A);
      const owedAfterDestroy = { queue: await queueRows(), files: (await vaultFiles()).length, row: await rowCount(a.intent.id), tomb: await tombstones(a.intent.id) };
      destroy.mockRestore();
      await query('TRUNCATE vault_erasure_queue');
      const b = await stage('s5c-seal-fails', 27, 'verified');
      await expireLease(b.intent.id);
      (sealR20DeletionLedger as jest.Mock).mockResolvedValueOnce({ sealed: false });
      const failedSeal = await discardIncompleteLanding(b.intent.id, MEMBER_A);
      const owedAfterSeal = { queue: await queueRows(), row: await rowCount(b.intent.id), tomb: await tombstones(b.intent.id) };
      observe('S5c', ['WSI-28', 'WSI-29'], 'partial failure', { destroyFails: failedDestroy.kind, afterDestroyFails: owedAfterDestroy, sealFails: failedSeal.kind, afterSealFails: owedAfterSeal });
      expect(failedDestroy.kind).toBe('erasure_pending');
      expect(owedAfterDestroy).toEqual({ queue: 1, files: expect.any(Number), row: 0, tomb: 1 }); // record gone, bytes still owed
      expect(owedAfterDestroy.files).toBeGreaterThanOrEqual(1);
      expect(failedSeal.kind).toBe('erasure_pending');
      expect(owedAfterSeal).toEqual({ queue: 1, row: 0, tomb: 1 });
    });

    it('S5e refuses, and changes nothing, when another record still references the same stored original', async () => {
      // artifact_ref is not unique on arrivals, so this state is constructible (corruption or an operator mistake).
      // Destroying those bytes would break the other record's custody, so the door must stop before touching anything.
      const a = await stage('s5e-shared', 33, 'verified');
      await expireLease(a.intent.id);
      const ref = (await query<{ artifact_ref: string }>('SELECT artifact_ref FROM writer_source_landing_intents WHERE id=$1::uuid', [a.intent.id])).rows[0]!.artifact_ref;
      await query(
        `INSERT INTO manuscript_source_arrivals
           (member_id, source_kind, artifact_ref, artifact_hash, artifact_size, original_filename, source_text,
            source_text_hash, extraction_method, extractor_version)
         VALUES ($1::uuid, 'artifact_extraction', $2, $3, 1, 'fictional-shared.txt', 'fictional', 'h', 'test', 'test')`,
        [MEMBER_A, ref, 'f'.repeat(64)]);
      const filesBefore = (await vaultFiles()).length;
      let thrown: string | null = null;
      try { await discardIncompleteLanding(a.intent.id, MEMBER_A); } catch (e) { thrown = (e as Error).message; }
      const after = { row: await rowCount(a.intent.id), tomb: await tombstones(a.intent.id), queue: await queueRows(), files: (await vaultFiles()).length };
      observe('S5e', ['WSI-20'], 'shared reference refusal', { thrown, filesBefore, after });
      expect(thrown).toBe('shared original artifact reference');
      expect(after).toEqual({ row: 1, tomb: 0, queue: 0, files: filesBefore }); // the whole transaction rolled back
    });

    it('S5d lists exactly what is held for the member and nothing else, with no content', async () => {
      await stage('s5d-pending', 28, 'pending');
      await stage('s5d-verified', 29, 'verified');
      const unclaimed = await recordEncryptedArtifactArrival(input('s5d-unclaimed', KEY(30)));
      const claimed = await recordEncryptedArtifactArrival(input('s5d-claimed', KEY(31)));
      await claimArrival(claimed.id, MS_A, MEMBER_A);
      await stage('s5d-other-member', 32, 'verified', MEMBER_B);
      const mine = await listMemberUnfinishedUploads(MEMBER_A);
      const json = JSON.stringify(mine);
      observe('S5d', ['WSI-20', 'WSI-21'], 'unfinished list', { kinds: mine.map((m) => m.kind).sort(), unclaimedFilename: mine.find((m) => m.kind === 'unclaimed')?.filename ?? null });
      expect(mine.map((m) => m.kind).sort()).toEqual(['incomplete', 'incomplete', 'unclaimed']);
      expect(mine.find((m) => m.kind === 'unclaimed')?.id).toBe(unclaimed.id);
      expect(mine.some((m) => m.id === claimed.id)).toBe(false);   // attached to a Work: not "unfinished"
      expect(json.includes(CANARY)).toBe(false);                    // no extracted text
      expect(json).not.toContain('manuscript-sources/');            // no object path
      expect(json).not.toMatch(/wrapped|cipher|dek|key_id/i);       // no key material
      expect((await listMemberUnfinishedUploads(MEMBER_B)).length).toBe(1);
    });
  });

  it('S2 [C16,WSI-11] LIBRARY level: empty extracted text lands and verifies ciphertext, then is refused, and the retry can never succeed (the ingest route now refuses empty text before custody: intakeRefusals.test.ts)', async () => {
    const inp = input('s2-textless', KEY(13), { sourceText: '' });
    const first: any = await recordEncryptedArtifactArrival(inp).then(() => null, (e) => e);
    const row = await intentRow(KEY(13));
    const files = (await vaultFiles()).length;
    const second: any = await recordEncryptedArtifactArrival(inp).then(() => null, (e) => e);
    const rows = (await query<{ n: number }>('SELECT count(*)::int n FROM writer_source_landing_intents WHERE idempotency_key=$1::uuid', [KEY(13)])).rows[0].n;
    observe('S2', ['WSI-11', 'WSI-20'], 'textless upload', { firstRejected: Boolean(first), firstMessage: String(first?.message).slice(0, 80), intentState: row?.state, filesOnDisk: files, retryRejectedAgain: Boolean(second), intentRows: rows });
    expect(first).not.toBeNull();
    expect(row?.state).toBe('BYTES_VERIFIED');
    expect(files).toBeGreaterThanOrEqual(1);
    expect(second).not.toBeNull();
    expect(rows).toBe(1);
  });

  it('S4 [WSI-10,WSI-11] LIBRARY level: extracted text containing a NUL byte lands ciphertext and is then refused by the database, stranding the intent (the ingest route now refuses NUL text before custody: intakeRefusals.test.ts)', async () => {
    const inp = input('s4-nul', KEY(17), { sourceText: `before\u0000after ${CANARY}` });
    const err: any = await recordEncryptedArtifactArrival(inp).then(() => null, (e) => e);
    const row = await intentRow(KEY(17));
    const files = (await vaultFiles()).length;
    const arrivals = (await query<{ n: number }>('SELECT count(*)::int n FROM manuscript_source_arrivals')).rows[0].n;
    observe('S4', ['WSI-10', 'WSI-11', 'WSI-20'], 'NUL byte in extracted text', { rejected: Boolean(err), thrownName: err?.name, causeName: err?.cause?.name, intentState: row?.state, filesOnDisk: files, arrivalsRecorded: arrivals });
    expect(err).not.toBeNull();
    expect(row?.state).toBe('BYTES_VERIFIED'); // ciphertext verified, arrival never recorded: a stranded intent
    expect(files).toBeGreaterThanOrEqual(1);
    expect(arrivals).toBe(0);
  });

  it('S3 [C07,WSI-26] Delete Work removes the claimed arrival and its file but leaves an unclaimed arrival and its file', async () => {
    const claimed = await recordEncryptedArtifactArrival(input('s3-claimed', KEY(14)));
    await claimArrival(claimed.id, MS_DELETE, MEMBER_A);
    const unclaimed = await recordEncryptedArtifactArrival(input('s3-unclaimed', KEY(15)));
    const filesBefore = (await vaultFiles()).length;
    const out = await eraseManuscript(MS_DELETE, MEMBER_A);
    const claimedLeft = (await query('SELECT 1 FROM manuscript_source_arrivals WHERE id=$1::uuid', [claimed.id])).rowCount;
    const unclaimedLeft = (await query('SELECT 1 FROM manuscript_source_arrivals WHERE id=$1::uuid', [unclaimed.id])).rowCount;
    const filesAfter = (await vaultFiles()).length;
    observe('S3', ['WSI-25', 'WSI-26'], 'Delete Work reach', { erase: out, claimedArrivalLeft: claimedLeft, unclaimedArrivalLeft: unclaimedLeft, filesBefore, filesAfter });
    expect(claimedLeft).toBe(0);
    expect(unclaimedLeft).toBe(1);
    expect(filesAfter).toBe(filesBefore - 1);
  });

  it('R1 [WSI-07,FILL-17a] the vault holds ciphertext only and no plaintext data key is persisted anywhere; extracted text IS plaintext in the database', async () => {
    // Arm the scan first: plant the canary and the key in every form in a scratch file and prove the matcher sees them.
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ws-armed-'));
    const planted = randomBytes(32);
    await fs.writeFile(path.join(dir, 'planted'), Buffer.concat([...forms(planted), ...forms(Buffer.from(CANARY))]));
    const armed = forms(planted).every((n) => hasAny(Buffer.concat(forms(planted)), [n])) && hasAny(await fs.readFile(path.join(dir, 'planted')), forms(Buffer.from(CANARY)));
    await fs.rm(dir, { recursive: true, force: true });
    expect(armed).toBe(true);

    const a = await recordEncryptedArtifactArrival(input('r1', KEY(16)));
    await claimArrival(a.id, MS_A, MEMBER_A);
    const files = await vaultFiles();
    const canaryForms = forms(Buffer.from(CANARY));
    const dekForms = kms.issuedPlaintextKeys.flatMap((k) => forms(k));
    let vaultCanary = 0; let vaultDek = 0; let vaultZipMagic = 0;
    for (const f of files) {
      const b = await fs.readFile(f);
      if (hasAny(b, canaryForms)) vaultCanary++;
      if (hasAny(b, dekForms)) vaultDek++;
      if (b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) vaultZipMagic++;
    }
    const dump = Buffer.from(JSON.stringify([
      (await query('SELECT * FROM writer_source_landing_intents')).rows,
      (await query('SELECT * FROM manuscript_source_arrivals')).rows,
    ]), 'utf8');
    const dbDek = hasAny(dump, dekForms);
    const dbCanary = hasAny(dump, canaryForms);
    observe('R1', ['WSI-07', 'WSI-38', 'FILL-17a', 'FILL-11c'], 'residue', { vaultFiles: files.length, vaultFilesWithCanary: vaultCanary, vaultFilesWithPlaintextKey: vaultDek, vaultFilesStartingWithZipMagic: vaultZipMagic, dbHoldsPlaintextKey: dbDek, dbHoldsCanaryInExtractedText: dbCanary, scannerArmed: armed });
    expect(files.length).toBeGreaterThanOrEqual(1);
    expect(vaultCanary).toBe(0);
    expect(vaultDek).toBe(0);
    expect(vaultZipMagic).toBe(0);
    expect(dbDek).toBe(false);
    expect(dbCanary).toBe(true); // 'encrypted' covers original bytes only; extracted text stays plaintext in Postgres
  });

  it('L1 [WSI-38,FILL-17b] nothing logged during this whole run contains the canary or any plaintext data key', async () => {
    const all = Buffer.from(logged.join('\n'), 'utf8');
    expect(kms.allIssuedPlaintextKeys.length).toBeGreaterThanOrEqual(10); // arming: an empty key list would make the key scan below vacuous (it did, until a mutation survived)
    const dekForms = kms.allIssuedPlaintextKeys.flatMap((k) => forms(k));
    const hitCanary = hasAny(all, forms(Buffer.from(CANARY)));
    const hitDek = hasAny(all, dekForms);
    const armedControl = hasAny(Buffer.from(`x ${CANARY} y`, 'utf8'), forms(Buffer.from(CANARY)));
    observe('L1', ['WSI-38', 'FILL-17b'], 'logging', { keysCovered: kms.allIssuedPlaintextKeys.length, linesCaptured: logged.length, canaryInLogs: hitCanary, plaintextKeyInLogs: hitDek, scannerArmed: armedControl });
    expect(armedControl).toBe(true);
    expect(logged.length).toBeGreaterThan(0); // an empty capture would make this vacuous
    expect(hitCanary).toBe(false);
    expect(hitDek).toBe(false);
  });

  const fixtureSuite = FIXTURE_DIR ? it : it.skip;
  fixtureSuite('P1 [fixtures] the real parseUpload agrees with the fixture manifest expectations (route mapping: typed 415/422, any other parse error 422, empty text or NUL text 503 after custody)', async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(FIXTURE_DIR, 'manifest.json'), 'utf8')) as Array<{ name: string; path: string; mime: string | null; expectedStatus: number }>;
    const rows: Array<{ name: string; expectedStatus: number; outcome: string; agrees: boolean | 'route-level' | 'instrument-limit' }> = [];
    for (const f of manifest) {
      const buf = await fs.readFile(f.path);
      let outcome: string;
      try {
        const r: any = await parseUpload(buf, f.name, f.mime);
        const t = typeof r?.text === 'string' ? r.text : null;
        outcome = t === null ? 'ok:?' : t.trim().length === 0 ? 'ok:empty' : t.includes('\u0000') ? 'ok:text+nul' : 'ok:text';
      } catch (e: any) {
        outcome = e?.name === 'UnsupportedUploadError' || e?.name === 'UnsupportedDocxStructureError' ? `throws:${e.name}` : `throws:generic:${String(e?.message ?? e).slice(0, 70).replace(/\s+/g, ' ')}`;
      }
      const s = f.expectedStatus;
      const agrees: boolean | 'route-level' | 'instrument-limit' =
        outcome.includes('Setting up fake worker failed') ? 'instrument-limit' // pdfjs cannot run in jest's sandbox; see parse-pdf-fixtures.mts
        : s === 415 ? outcome === 'throws:UnsupportedUploadError'
        : s === 422 ? outcome.startsWith('throws:') && outcome !== 'throws:UnsupportedUploadError'
        : s === 200 ? outcome === 'ok:text'
        : s === 503 ? outcome === 'ok:empty' || outcome === 'ok:text+nul'
        : 'route-level';
      rows.push({ name: f.name, expectedStatus: s, outcome, agrees });
    }
    const disagreements = rows.filter((r) => r.agrees === false);
    observe('P1', ['WSI-06', 'WSI-10', 'WSI-11'], 'parser vs fixture manifest', { checked: rows.length, routeLevelOnly: rows.filter((r) => r.agrees === 'route-level').length, disagreements, rows });
    expect(rows.length).toBeGreaterThan(0);
    expect(disagreements).toEqual([]);
    // The instrument limit may excuse exactly the PDFs - nothing else can hide behind it.
    expect(rows.filter((r) => r.agrees === 'instrument-limit').map((r) => r.name).sort()).toEqual(['scanned.pdf', 'text-layer.pdf']);
  });
});
