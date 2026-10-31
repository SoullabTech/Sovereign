/**
 * R98: Test the seam between Class A physical vault confinement and the
 * existing fsync-backed original-Source publication / strict erasure contract.
 * Fictional temporary files only. Never use a member Source or production mount.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  writeDurableVaultBytes, writeVaultBytes, readVaultBytes,
  destroyVaultBytes,
} from '../fileVault';

let fixture: string;
let root: string;
let outside: string;
let previousVaultRoot: string | undefined;

beforeEach(() => {
  previousVaultRoot = process.env.FILE_STORAGE_PATH;
  fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'r98-fictional-vault-'));
  root = path.join(fixture, 'vault');
  outside = path.join(fixture, 'outside');
  fs.mkdirSync(root, { mode: 0o700 });
  fs.mkdirSync(outside, { mode: 0o700 });
  process.env.FILE_STORAGE_PATH = root;
});
afterEach(() => {
  if (previousVaultRoot === undefined) delete process.env.FILE_STORAGE_PATH;
  else process.env.FILE_STORAGE_PATH = previousVaultRoot;
  fs.rmSync(fixture, { recursive: true, force: true });
});

describe('R98 durable original Source and vault confinement', () => {
  test('valid nested source can be read, durably erased and confirmed absent twice', async () => {
    const bytes = Buffer.from('fictional manuscript only\nΩ', 'utf8');
    const relative = await writeDurableVaultBytes('manuscript-sources/synthetic', 'written-a', 'docx', bytes);
    expect(relative).toBe(path.join('manuscript-sources', 'synthetic', 'written-a.docx'));
    expect((await readVaultBytes(relative)).equals(bytes)).toBe(true);
    expect(fs.statSync(path.join(root, relative)).mode & 0o777).toBe(0o600);
    expect(fs.readdirSync(path.dirname(path.join(root, relative)))).toEqual(['written-a.docx']);
    await expect(destroyVaultBytes(relative)).resolves.toBeUndefined();
    expect(fs.existsSync(path.join(root, relative))).toBe(false);
    await expect(destroyVaultBytes(relative)).resolves.toBeUndefined();
  });

  test('durable source refuses symlinked parent without writing into outside directory', async () => {
    fs.symlinkSync(outside, path.join(root, 'linked'));
    await expect(writeDurableVaultBytes('linked/child', 'any', 'docx', Buffer.from('fiction')))
      .rejects.toThrow(/symlink/);
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  test('durable source refuses lexical traversal in namespace, ID and extension', async () => {
    for (const [namespace, id, ext] of [
      ['../outside', 'any', 'docx'],
      ['synthetic', '../outside', 'docx'],
      ['synthetic', 'any', '../docx'],
      ['synthetic//nested', 'any', 'docx'],
      ['synthetic/..', 'any', 'docx'],
    ]) {
      await expect(writeDurableVaultBytes(namespace, id, ext, Buffer.from('fiction')))
        .rejects.toThrow();
    }
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  test('planted symlink leaf cannot be overwritten by durable writer', async () => {
    fs.mkdirSync(path.join(root, 'manuscript-sources'));
    fs.writeFileSync(path.join(outside, 'keeper'), 'outside original');
    fs.symlinkSync(path.join(outside, 'keeper'),
      path.join(root, 'manuscript-sources', 'original.txt'));
    await expect(writeDurableVaultBytes('manuscript-sources', 'original', 'txt', Buffer.from('attack')))
      .rejects.toThrow();
    expect(fs.readFileSync(path.join(outside, 'keeper'), 'utf8')).toBe('outside original');
    expect(fs.readdirSync(path.join(root, 'manuscript-sources'))).toEqual(['original.txt']);
  });

  test('ordinary and durable writer share exclusive no-overwrite original identity', async () => {
    const first = await writeVaultBytes('manuscript-sources', 'same', 'txt', Buffer.from('first'));
    await expect(writeDurableVaultBytes('manuscript-sources', 'same', 'txt', Buffer.from('second')))
      .rejects.toThrow();
    expect((await readVaultBytes(first)).toString()).toBe('first');
    expect(fs.readdirSync(path.join(root, 'manuscript-sources'))).toEqual(['same.txt']);
  });

  test('missing vault root refuses to claim successful durable writing or erasure', async () => {
    process.env.FILE_STORAGE_PATH = path.join(fixture, 'missing-vault-root');
    await expect(writeDurableVaultBytes('manuscript-sources', 'id', 'txt', Buffer.from('fiction')))
      .rejects.toThrow(/Vault root unavailable/);
    await expect(destroyVaultBytes('manuscript-sources/never-written.txt'))
      .rejects.toThrow(/Vault root unavailable/);
    expect(fs.existsSync(process.env.FILE_STORAGE_PATH)).toBe(false);
  });

  test('symlinked parent blocks strict deletion even after missing target lookup', async () => {
    fs.symlinkSync(outside, path.join(root, 'linked'));
    await expect(destroyVaultBytes('linked/never-written.txt')).rejects.toThrow(/symlink/);
    expect(fs.readdirSync(outside)).toEqual([]);
  });

  test('an unwritten valid nested path is durably recognized absent without creating folders', async () => {
    await expect(destroyVaultBytes('manuscript-sources/never/arrived.docx'))
      .resolves.toBeUndefined();
    expect(fs.existsSync(path.join(root, 'manuscript-sources'))).toBe(false);
  });
});
