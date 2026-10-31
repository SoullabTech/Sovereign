import fs from 'node:fs';
import path from 'node:path';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');
const route = read('app/api/sovereign/manuscripts/ingest/route.ts');
const room = read('app/dev/writers-studio-pc3-live/P4R1ImportManuscript.tsx');
const legacy = read('app/press/manuscript/page.tsx');
const helper = read('lib/writersStudio/sourceUploadAttempt.ts');
const landing = read('lib/manuscript/source/encryptedLanding.ts');
const envelope = read('lib/manuscript/source/sourceEnvelope.ts');
const keyAuthority = read('lib/manuscript/source/sourceKeyAuthority.ts');
const migration = read('database/migrations/20261026000001_writer_source_encrypted_landing.sql');
const releaseAuthority = read('lib/writersStudio/releaseAuthority.ts');
const renderRoute = read('app/api/sovereign/manuscripts/[id]/render/route.ts');

describe('full-feature beta encrypted Source upload contract', () => {
  it('keeps the production 423 before retry validation, multipart parsing, or durable custody', () => {
    const hold = route.indexOf('if (!PRESS_SOURCE_INTAKE_RELEASED)');
    const idempotency = route.indexOf('request.headers.get(SOURCE_UPLOAD_IDEMPOTENCY_HEADER)');
    const multipart = route.indexOf('await request.formData()');
    const custody = route.indexOf('await recordArtifactArrival');

    expect(releaseAuthority).toContain('sourceIntakeReleased: false');
    expect(route).toContain('writerReleaseAuthority().sourceIntakeReleased');
    expect(route).toContain('status: 423');
    for (const position of [hold, idempotency, multipart, custody]) {
      expect(position).toBeGreaterThan(-1);
    }
    expect(hold).toBeLessThan(idempotency);
    expect(idempotency).toBeLessThan(multipart);
    expect(multipart).toBeLessThan(custody);
  });

  it('uses one shared idempotency header in the server and both production upload clients', () => {
    expect(helper).toContain("SOURCE_UPLOAD_IDEMPOTENCY_HEADER = 'x-writer-upload-idempotency-key'");
    expect(route).toContain("from '@/lib/writersStudio/sourceUploadAttempt'");
    expect(route).toContain('request.headers.get(SOURCE_UPLOAD_IDEMPOTENCY_HEADER)');
    expect(room).toContain("from '@/lib/writersStudio/sourceUploadAttempt'");
    expect(room).toContain('[SOURCE_UPLOAD_IDEMPOTENCY_HEADER]: uploadAttempt.idempotencyKey');
    expect(legacy).toContain("from '@/lib/writersStudio/sourceUploadAttempt'");
    expect(legacy).toContain('[SOURCE_UPLOAD_IDEMPOTENCY_HEADER]: uploadAttempt.idempotencyKey');
  });

  it('offers all five accepted file families consistently, including EPUB', () => {
    expect(room).toContain("const ACCEPT = '.docx,.pdf,.epub,.txt,.md,.markdown'");
    expect(legacy).toContain('.docx / .pdf / .epub / .txt / .md file');
    expect(legacy).toContain('accept=".txt,.md,.markdown,.docx,.pdf,.epub"');
    expect(route).toContain('parseUpload(buffer, file.name, file.type)');
  });

  it('persists only an encrypted per-arrival object after a committed DB intent', () => {
    const orchestration = landing.slice(
      landing.indexOf('export async function recordEncryptedArtifactArrival'),
    );
    const begin = orchestration.indexOf('await beginEncryptedLanding');
    const prepare = orchestration.indexOf('await prepareEncryptedWrite');
    const write = orchestration.indexOf('await writePreparedCiphertext');
    const verify = orchestration.indexOf('await markEncryptedBytesVerified');
    const commit = orchestration.indexOf('await commitEncryptedArrival');

    expect(migration).toContain("'PENDING_BYTES','WRITING_BYTES','BYTES_VERIFIED','ARRIVAL_RECORDED'");
    expect(migration).toContain('wrapped_dek text');
    expect(migration).toContain('arrival_id uuid UNIQUE REFERENCES manuscript_source_arrivals(id) ON DELETE CASCADE');
    expect(landing).toContain("const VAULT_NAMESPACE = 'manuscript-sources'");
    expect(landing).toContain("'source.enc'");
    expect(envelope).toContain("const ALGORITHM = 'aes-256-gcm'");
    expect(envelope).toContain('await generateSourceDataKey(keyContextSha256(context))');
    expect(envelope).toContain("aad(context, 'source-bytes')");
    expect(envelope).toContain("aad(context, 'dek-wrap')");
    expect(keyAuthority).toContain('new GenerateDataKeyCommand');
    expect(keyAuthority).toContain('new DecryptCommand');
    expect(keyAuthority).toContain("provider === 'local-test'");
    expect(keyAuthority).toContain("process.env.NODE_ENV !== 'test'");
    expect(migration).toContain("key_provider IN ('aws-kms','local-test')");
    expect(migration).toContain("key_wrap_algorithm = 'aws-kms-generate-data-key-v1'");
    for (const position of [begin, prepare, write, verify, commit]) {
      expect(position).toBeGreaterThan(-1);
    }
    expect(begin).toBeLessThan(prepare);
    expect(prepare).toBeLessThan(write);
    expect(write).toBeLessThan(verify);
    expect(verify).toBeLessThan(commit);
  });

  it('keeps PDF and EPUB certification under the same source-owned default-deny manifest', () => {
    expect(releaseAuthority).toContain('exportsCertified: Object.freeze({ pdf: false, epub: false })');
    expect(renderRoute).toContain('const release = writerReleaseAuthority()');
    expect(renderRoute).toContain('if (release.exportsCertified[format] !== true)');
    expect(renderRoute).toContain('status: 423');
    expect(renderRoute).toContain('releaseManifestId: release.manifestId');
  });

  it('keeps explicit discard inside the R20 anti-resurrection law', () => {
    const discard = read('lib/manuscript/source/discardUnclaimedArrival.ts');
    expect(discard).toContain("'manuscript_source_arrivals'");
    expect(discard).toContain("'writer_source_landing_intents'");
    expect(discard).toContain('INSERT INTO deletion_manifests');
    expect(discard).toContain('INSERT INTO provenance_tombstones');
    expect(discard).toContain('sealR20DeletionLedger()');
    expect(migration).toContain('BEFORE INSERT ON manuscript_source_arrivals');
    expect(migration).toContain('BEFORE INSERT ON writer_source_landing_intents');
  });
});
