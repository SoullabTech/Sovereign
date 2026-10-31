import { mkdtemp, rm, readdir, readFile, writeFile, stat } from 'fs/promises';
import path from 'path';
import os from 'os';
import { createHash } from 'crypto';
import { writeDurableVaultBytes, readVaultBytes } from '../fileVault';

describe('durable manuscript source custody — file before database', () => {
  let root: string;
  let previous: string | undefined;
  beforeEach(async () => {
    previous = process.env.FILE_STORAGE_PATH;
    root = await mkdtemp(path.join(os.tmpdir(), 'ws-durable-vault-test-'));
    process.env.FILE_STORAGE_PATH = root;
  });
  afterEach(async () => {
    if (previous === undefined) delete process.env.FILE_STORAGE_PATH;
    else process.env.FILE_STORAGE_PATH = previous;
    if (root.startsWith(os.tmpdir() + path.sep + 'ws-durable-vault-test-')) {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('publishes verified exact bytes without exposing pending paths', async () => {
    const bytes = Buffer.from('TEST ONLY source bytes \u2728\nwith full UTF-8 fidelity', 'utf8');
    const ref = await writeDurableVaultBytes('manuscript-sources', 'synthetic-a', 'docx', bytes);
    expect(ref).toBe(path.join('manuscript-sources', 'synthetic-a.docx'));
    const recovered = await readVaultBytes(ref);
    expect(recovered.equals(bytes)).toBe(true);
    expect(createHash('sha256').update(recovered).digest('hex'))
      .toBe(createHash('sha256').update(bytes).digest('hex'));
    const entries = await readdir(path.join(root, 'manuscript-sources'));
    expect(entries).toEqual(['synthetic-a.docx']);
    const info = await stat(path.join(root, ref));
    expect(info.isFile()).toBe(true);
  });

  it('refuses a reused identity instead of overwriting an existing Source', async () => {
    const before = Buffer.from('FIRST original source');
    const ref = await writeDurableVaultBytes('manuscript-sources', 'collision', 'txt', before);
    await expect(writeDurableVaultBytes('manuscript-sources', 'collision', 'txt', Buffer.from('SECOND would overwrite')))
      .rejects.toThrow();
    expect((await readFile(path.join(root, ref))).equals(before)).toBe(true);
    expect((await readdir(path.join(root, 'manuscript-sources'))).sort()).toEqual(['collision.txt']);
  });

  it('fails closed when the chosen vault cannot be written', async () => {
    const blocker = path.join(root, 'not-a-directory');
    await writeFile(blocker, 'do not alter');
    process.env.FILE_STORAGE_PATH = blocker;
    await expect(writeDurableVaultBytes('manuscript-sources', 'refuse', 'txt', Buffer.from('bytes')))
      .rejects.toThrow();
    expect(await readFile(blocker, 'utf8')).toBe('do not alter');
  });
});
