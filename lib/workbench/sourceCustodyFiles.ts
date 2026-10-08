/**
 * SOURCE-CUSTODY-FS-01: recoverable filesystem staging, NOT an admitted upload route.
 *
 * Each operation gets a durable, content-free journal record *before* any
 * content bytes are written. The journal remains until a database owner has
 * authoritatively declared the operation committed or aborted. An unresolved
 * operation is never swept by time or inference.
 *
 * IMPORTANT: This primitive alone does not guard Sanctuary transitions. A
 * separately admitted DB reservation/reconciliation protocol must keep the
 * corresponding session non-transitionable while a journal is unresolved.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FILE_RE = /^(?:original\.[a-z0-9]{1,10}|draft\.txt|reviewed\.txt)$/;
const MAX_FILE_BYTES = 50 * 1024 * 1024;

export type SourceCustodyIntent = Readonly<{
  version: 1;
  operationId: string;
  memberId: string;
  uploadId: string;
}>;

function validUuid(value: string): boolean {
  return typeof value === 'string' && UUID_RE.test(value);
}
function assertIntent(value: unknown): asserts value is SourceCustodyIntent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid custody intent');
  const intent = value as Record<string, unknown>;
  if (intent.version !== 1 || !validUuid(intent.operationId as string) ||
      !validUuid(intent.memberId as string) || !validUuid(intent.uploadId as string) ||
      Object.keys(intent).sort().join(',') !== 'memberId,operationId,uploadId,version') {
    throw new Error('Invalid custody intent');
  }
}
function paths(root: string, intent: SourceCustodyIntent) {
  assertIntent(intent);
  const base = path.resolve(root);
  const journalRoot = path.join(base, '.source-custody');
  return {
    intentFile: path.join(journalRoot, 'intents', `${intent.operationId}.json`),
    intentDir: path.join(journalRoot, 'intents'),
    stagingRoot: path.join(journalRoot, 'staging'),
    stagingDir: path.join(journalRoot, 'staging', intent.operationId),
    memberDir: path.join(base, intent.memberId),
    finalDir: path.join(base, intent.memberId, intent.uploadId),
  };
}
async function syncDirectory(dir: string): Promise<void> {
  const handle = await fs.open(dir, 'r');
  try { await handle.sync(); } finally { await handle.close(); }
}
async function requireSingleOriginal(dir: string): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const originals = entries.filter(e => e.isFile() && /^original\.[a-z0-9]{1,10}$/.test(e.name));
  if (originals.length !== 1) throw new Error('Exactly one custody original is required');
  const stat = await fs.stat(path.join(dir, originals[0].name));
  if (stat.size === 0 || stat.size > MAX_FILE_BYTES) throw new Error('Incomplete custody original');
}
async function writeDurableExclusive(file: string, bytes: Buffer): Promise<void> {
  const handle = await fs.open(file, 'wx', 0o600);
  try { await handle.writeFile(bytes); await handle.sync(); }
  finally { await handle.close(); }
  await syncDirectory(path.dirname(file));
}

/** Content-free intent must be durable before any staged member bytes. */
export async function beginSourceCustody(root: string, intent: SourceCustodyIntent): Promise<void> {
  const p = paths(root, intent);
  await fs.mkdir(path.resolve(root), { recursive: true, mode: 0o700 });
  await fs.mkdir(p.intentDir, { recursive: true, mode: 0o700 });
  await fs.mkdir(p.stagingRoot, { recursive: true, mode: 0o700 });
  await syncDirectory(path.join(path.resolve(root), '.source-custody'));
  await syncDirectory(path.resolve(root));
  await writeDurableExclusive(p.intentFile, Buffer.from(JSON.stringify(intent), 'utf8'));
  // A crash here leaves the journal available for deterministic recovery.
  await fs.mkdir(p.stagingDir, { mode: 0o700 });
  await syncDirectory(p.stagingRoot);
}

/** Create-only; never truncate an earlier staged part or overwrite a final file. */
export async function stageSourceCustodyFile(
  root: string, intent: SourceCustodyIntent, name: string, data: Buffer,
): Promise<void> {
  const p = paths(root, intent);
  if (!FILE_RE.test(name)) throw new Error('Invalid custody filename');
  if (!Buffer.isBuffer(data) || data.byteLength > MAX_FILE_BYTES) throw new Error('Invalid custody data');
  await fs.access(p.intentFile);
  if (name.startsWith('original.')) {
    const existing = await fs.readdir(p.stagingDir);
    if (existing.some(e => e.startsWith('original.'))) throw new Error('Custody already contains an original');
  }
  await writeDurableExclusive(path.join(p.stagingDir, name), data);
}

/** Publish the staged directory on the same filesystem. A journal persists. */
export async function publishStagedSource(root: string, intent: SourceCustodyIntent): Promise<void> {
  const p = paths(root, intent);
  await fs.access(p.intentFile);
  await requireSingleOriginal(p.stagingDir);
  await fs.mkdir(p.memberDir, { recursive: true, mode: 0o700 });
  await syncDirectory(path.resolve(root));
  try {
    await fs.lstat(p.finalDir);
    throw new Error('Custody target already exists');
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
  await fs.rename(p.stagingDir, p.finalDir);
  await syncDirectory(p.memberDir);
  await syncDirectory(p.stagingRoot);
}

/** Enumerate records only; a crash-recovery worker must first obtain DB custody. */
export async function listSourceCustodyIntents(root: string): Promise<SourceCustodyIntent[]> {
  const dir = path.join(path.resolve(root), '.source-custody', 'intents');
  let files: string[];
  try { files = await fs.readdir(dir); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const intents: SourceCustodyIntent[] = [];
  for (const file of files) {
    if (!file.endsWith('.json') || !validUuid(file.slice(0, -5))) throw new Error('Unrecognized custody journal entry');
    const raw = await fs.readFile(path.join(dir, file), 'utf8');
    const parsed: unknown = JSON.parse(raw);
    assertIntent(parsed);
    if (parsed.operationId !== file.slice(0, -5)) throw new Error('Custody journal identity mismatch');
    intents.push(parsed);
  }
  return intents;
}

/**
 * Must only be called under exclusive DB recovery custody and an independently
 * verified committed/aborted DB outcome. "unresolved" can neither delete nor
 * bless member content. Caller, not this primitive, owns that authoritative
 * determination. No call sites currently authorize this for live uploads.
 */
export async function reconcileSourceCustody(
  root: string, intent: SourceCustodyIntent, outcome: 'committed' | 'aborted' | 'unresolved',
): Promise<'resolved' | 'held'> {
  const p = paths(root, intent);
  if (outcome === 'unresolved') return 'held';
  const raw = await fs.readFile(p.intentFile, 'utf8');
  const onDisk: unknown = JSON.parse(raw);
  assertIntent(onDisk);
  if (JSON.stringify(onDisk) !== JSON.stringify(intent)) throw new Error('Custody journal mismatch');
  if (outcome === 'committed') {
    const stat = await fs.lstat(p.finalDir);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Committed source directory unavailable');
    await requireSingleOriginal(p.finalDir);
  } else {
    // Only after the database owner has proved the operation is not committed.
    await fs.rm(p.finalDir, { recursive: true, force: true });
    // A privacy transition must not be acknowledged on merely buffered
    // deletion: fsync the canonical parent before the DB marks it aborted.
    try { await syncDirectory(p.memberDir); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
  await fs.rm(p.stagingDir, { recursive: true, force: true });
  await syncDirectory(p.stagingRoot);
  // Journal is removed LAST: any interrupted cleanup remains discoverable.
  await fs.unlink(p.intentFile);
  await syncDirectory(p.intentDir);
  return 'resolved';
}
