/** @jest-environment node */
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  beginSourceCustody, stageSourceCustodyFile, publishStagedSource,
  listSourceCustodyIntents, reconcileSourceCustody, stagedSourceFilePath, sourceCustodyRelativeOriginal, type SourceCustodyIntent,
} from '../sourceCustodyFiles';
const intent: SourceCustodyIntent = {
  version: 1,
  operationId: '11111111-1111-4111-8111-111111111111',
  memberId: '22222222-2222-4222-8222-222222222222',
  uploadId: '33333333-3333-4333-8333-333333333333',
};
let root: string;
const final = () => path.join(root, intent.memberId, intent.uploadId);
beforeEach(async () => { root = await fs.mkdtemp(path.join(os.tmpdir(), 'source-custody-test-')); });
afterEach(async () => { await fs.rm(root, { recursive: true, force: true }); });

test('intent is journaled before bytes and survives simulated crash before staging', async () => {
  await beginSourceCustody(root, intent);
  expect(await listSourceCustodyIntents(root)).toEqual([intent]);
  expect(await reconcileSourceCustody(root, intent, 'unresolved')).toBe('held');
  expect(await listSourceCustodyIntents(root)).toEqual([intent]);
  expect(await reconcileSourceCustody(root, intent, 'aborted')).toBe('resolved');
  expect(await listSourceCustodyIntents(root)).toEqual([]);
});
test('simulated crash after staging is recoverable without producing a canonical source', async () => {
  await beginSourceCustody(root, intent);
  await stageSourceCustodyFile(root, intent, 'original.txt', Buffer.from('PRIVATE QA DATA'));
  expect(await listSourceCustodyIntents(root)).toEqual([intent]);
  await reconcileSourceCustody(root, intent, 'aborted');
  await expect(fs.stat(final())).rejects.toMatchObject({ code: 'ENOENT' });
  await expect(fs.stat(path.join(root, '.source-custody', 'staging', intent.operationId))).rejects.toMatchObject({ code: 'ENOENT' });
});
test('simulated crash after publish but before DB admit cleans up only with aborted proof', async () => {
  await beginSourceCustody(root, intent);
  await stageSourceCustodyFile(root, intent, 'original.md', Buffer.from('RECOVERABLE'));
  await publishStagedSource(root, intent);
  expect(await fs.readFile(path.join(final(), 'original.md'),'utf8')).toBe('RECOVERABLE');
  await reconcileSourceCustody(root, intent, 'unresolved');
  expect(await fs.readFile(path.join(final(), 'original.md'),'utf8')).toBe('RECOVERABLE');
  await reconcileSourceCustody(root, intent, 'aborted');
  await expect(fs.stat(final())).rejects.toMatchObject({ code: 'ENOENT' });
});
test('committed original is retained and journal removed after DB-proven commit', async () => {
  await beginSourceCustody(root, intent);
  await stageSourceCustodyFile(root, intent, 'original.txt', Buffer.from('AUTHOR INTENTION'));
  await stageSourceCustodyFile(root, intent, 'reviewed.txt', Buffer.from('REVIEWED TEXT'));
  await publishStagedSource(root, intent);
  expect(await reconcileSourceCustody(root, intent, 'committed')).toBe('resolved');
  expect(await fs.readFile(path.join(final(), 'original.txt'),'utf8')).toBe('AUTHOR INTENTION');
  expect(await fs.readFile(path.join(final(), 'reviewed.txt'),'utf8')).toBe('REVIEWED TEXT');
  expect(await listSourceCustodyIntents(root)).toEqual([]);
});
test('cannot begin a second operation on the same intent identity', async () => {
  await beginSourceCustody(root, intent);
  await expect(beginSourceCustody(root, intent)).rejects.toMatchObject({ code: 'EEXIST' });
});
test('cannot overwrite an original or publish into an existing source directory', async () => {
  await beginSourceCustody(root, intent);
  await stageSourceCustodyFile(root, intent, 'original.txt', Buffer.from('first'));
  await expect(stageSourceCustodyFile(root, intent, 'original.txt', Buffer.from('second'))).rejects.toThrow(/already contains an original/);
  await fs.mkdir(final(), { recursive: true });
  await expect(publishStagedSource(root, intent)).rejects.toThrow(/already exists/);
});
test('rejects traversal and unknown file names before writing bytes', async () => {
  await expect(beginSourceCustody(root, { ...intent, memberId: '../neighbor' })).rejects.toThrow(/Invalid custody intent/);
  await beginSourceCustody(root, intent);
  for (const name of ['../original.txt', 'original.txt/evil', 'secret.txt', '.env']) {
    await expect(stageSourceCustodyFile(root, intent, name, Buffer.from('NO'))).rejects.toThrow(/Invalid custody filename/);
  }
});
test('rejects content parts larger than the 50 MB intake bound', async () => {
  await beginSourceCustody(root, intent);
  await expect(stageSourceCustodyFile(root, intent, 'original.txt', Buffer.alloc(50*1024*1024+1))).rejects.toThrow(/Invalid custody data/);
});
test('committed proof cannot silently bless a missing published directory', async () => {
  await beginSourceCustody(root, intent);
  await expect(reconcileSourceCustody(root, intent, 'committed')).rejects.toMatchObject({ code: 'ENOENT' });
  expect(await listSourceCustodyIntents(root)).toEqual([intent]);
});

test('cannot publish a directory without exactly one nonempty original', async () => {
  await beginSourceCustody(root, intent);
  await stageSourceCustodyFile(root, intent, 'reviewed.txt', Buffer.from('orphan text'));
  await expect(publishStagedSource(root,intent)).rejects.toThrow(/Exactly one custody original/);
  await stageSourceCustodyFile(root, intent, 'original.md', Buffer.alloc(0));
  await expect(publishStagedSource(root,intent)).rejects.toThrow(/Incomplete custody original/);
});
test('cannot stage two differently named originals in the same operation',async()=>{
  await beginSourceCustody(root, intent);
  await stageSourceCustodyFile(root, intent, 'original.md', Buffer.from('first'));
  await expect(stageSourceCustodyFile(root, intent, 'original.txt', Buffer.from('another'))).rejects.toThrow(/already contains an original/);
});
test('committed cleanup retains the journal if the original disappeared',async()=>{
  await beginSourceCustody(root,intent);
  await stageSourceCustodyFile(root,intent,'original.txt',Buffer.from('keeper'));
  await publishStagedSource(root,intent);
  await fs.unlink(path.join(final(),'original.txt'));
  await expect(reconcileSourceCustody(root,intent,'committed')).rejects.toThrow(/Exactly one custody original/);
  expect(await listSourceCustodyIntents(root)).toEqual([intent]);
});

test('corrupted journal never authorizes deletion or commitment of source content', async () => {
  await beginSourceCustody(root,intent);
  await stageSourceCustodyFile(root,intent,'original.txt',Buffer.from('preserve pending'));
  await publishStagedSource(root,intent);
  const file=path.join(root,'.source-custody','intents',intent.operationId+'.json');
  await fs.writeFile(file,'{malformed');
  await expect(listSourceCustodyIntents(root)).rejects.toThrow();
  await expect(reconcileSourceCustody(root,intent,'aborted')).rejects.toThrow();
  expect(await fs.readFile(path.join(final(),'original.txt'),'utf8')).toBe('preserve pending');
});

test('validated paths cannot escape the staged operation or canonical source root', async () => {
  expect(stagedSourceFilePath(root,intent,'original.md')).toContain(intent.operationId);
  expect(sourceCustodyRelativeOriginal(intent,'md')).toBe(path.join(intent.memberId,intent.uploadId,'original.md'));
  expect(()=>stagedSourceFilePath(root,intent,'../../other')).toThrow(/Invalid custody filename/);
  expect(()=>sourceCustodyRelativeOriginal(intent,'../bad')).toThrow(/Invalid custody extension/);
});

test('recovery is idempotent after an aborted journal was removed',async()=>{
  await beginSourceCustody(root,intent);
  await stageSourceCustodyFile(root,intent,'original.txt',Buffer.from('only test'));
  await reconcileSourceCustody(root,intent,'aborted');
  expect(await reconcileSourceCustody(root,intent,'aborted')).toBe('resolved');
});
test('absent journal does not excuse existing canonical source bytes',async()=>{
  await fs.mkdir(final(),{recursive:true});
  await fs.writeFile(path.join(final(),'original.txt'),'PRESERVE');
  await expect(reconcileSourceCustody(root,intent,'aborted')).rejects.toThrow(/exists without a journal/);
  expect(await fs.readFile(path.join(final(),'original.txt'),'utf8')).toBe('PRESERVE');
});
test('committed journal cleanup may be retried without losing original bytes',async()=>{
  await beginSourceCustody(root,intent);
  await stageSourceCustodyFile(root,intent,'original.md',Buffer.from('intended'));
  await publishStagedSource(root,intent);
  await reconcileSourceCustody(root,intent,'committed');
  expect(await reconcileSourceCustody(root,intent,'committed')).toBe('resolved');
  expect(await fs.readFile(path.join(final(),'original.md'),'utf8')).toBe('intended');
});
