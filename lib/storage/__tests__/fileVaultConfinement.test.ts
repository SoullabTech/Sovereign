/**
 * Class A source/custody regression: no reads, writes, or destructive actions
 * escape a vault through a parent symlink, leaf alias, hardlink or traversal.
 * All fixtures are fictional and live under disposable OS temporary paths.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readVaultBytes, writeVaultBytes, deleteVaultBytes, destroyVaultBytes } from '../fileVault';

let fixture: string;
let vault: string;
let outside: string;
const previousVaultRoot = process.env.FILE_STORAGE_PATH;

beforeEach(() => {
  fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'r20-vault-classa-'));
  vault = path.join(fixture, 'vault');
  outside = path.join(fixture, 'outside');
  fs.mkdirSync(vault, { mode: 0o700 });
  fs.mkdirSync(outside, { mode: 0o700 });
  process.env.FILE_STORAGE_PATH = vault;
});
afterEach(() => {
  if (previousVaultRoot === undefined) delete process.env.FILE_STORAGE_PATH;
  else process.env.FILE_STORAGE_PATH = previousVaultRoot;
  fs.rmSync(fixture, { recursive: true, force: true });
});

describe('Class A vault path confinement — fictional only', () => {
  it('preserves valid Writer, visual and bug-report writes and strict erasure', async () => {
    const a = await writeVaultBytes('manuscript-sources', 'fictional-id-1', 'epub', Buffer.from('fictional'));
    const b = await writeVaultBytes('work-visuals', 'fictional-id-2', 'png', Buffer.from('fictional'));
    const c = await writeVaultBytes('bugs/attachments', 'fictional-id-3', 'jpeg', Buffer.from('fictional'));

    expect(a).toBe('manuscript-sources/fictional-id-1.epub');
    expect(b).toBe('work-visuals/fictional-id-2.png');
    expect(c).toBe('bugs/attachments/fictional-id-3.jpeg');
    expect((await readVaultBytes(c)).toString()).toBe('fictional');
    await destroyVaultBytes(c);
    await expect(destroyVaultBytes(c)).resolves.toBeUndefined();
    await deleteVaultBytes(a);
    expect(fs.existsSync(path.join(vault, a))).toBe(false);
  });

  it('refuses all three read/delete methods through a symlinked parent', async () => {
    for (const name of ['read.txt', 'delete.txt', 'erase.txt']) {
      fs.writeFileSync(path.join(outside, name), 'fictional-outside');
    }
    fs.symlinkSync(outside, path.join(vault, 'link'));

    await expect(readVaultBytes('link/read.txt')).rejects.toThrow(/symlink/);
    await expect(deleteVaultBytes('link/delete.txt')).resolves.toBeUndefined();
    await expect(destroyVaultBytes('link/erase.txt')).rejects.toThrow(/symlink/);
    for (const name of ['read.txt', 'delete.txt', 'erase.txt']) {
      expect(fs.readFileSync(path.join(outside, name), 'utf8')).toBe('fictional-outside');
    }
  });

  it('refuses a symlinked leaf even when the parent is inside the vault', async () => {
    fs.writeFileSync(path.join(outside, 'keeper.txt'), 'fictional-keeper');
    fs.symlinkSync(path.join(outside, 'keeper.txt'), path.join(vault, 'alias.txt'));
    await expect(readVaultBytes('alias.txt')).rejects.toThrow();
    await expect(deleteVaultBytes('alias.txt')).resolves.toBeUndefined();
    await expect(destroyVaultBytes('alias.txt')).rejects.toThrow();
    expect(fs.readFileSync(path.join(outside, 'keeper.txt'), 'utf8')).toBe('fictional-keeper');
  });

  it('refuses hard-link aliases into outside protected bytes', async () => {
    fs.writeFileSync(path.join(outside, 'keeper.txt'), 'fictional-keeper');
    fs.linkSync(path.join(outside, 'keeper.txt'), path.join(vault, 'alias.txt'));
    await expect(readVaultBytes('alias.txt')).rejects.toThrow();
    await expect(deleteVaultBytes('alias.txt')).resolves.toBeUndefined();
    await expect(destroyVaultBytes('alias.txt')).rejects.toThrow();
    expect(fs.readFileSync(path.join(outside, 'keeper.txt'), 'utf8')).toBe('fictional-keeper');
  });

  it('refuses parent traversal on all operations, including writes', async () => {
    fs.writeFileSync(path.join(outside, 'keeper.txt'), 'fictional-keeper');
    await expect(readVaultBytes('../outside/keeper.txt')).rejects.toThrow(/outside the vault root/);
    await expect(deleteVaultBytes('../outside/keeper.txt')).resolves.toBeUndefined();
    await expect(destroyVaultBytes('../outside/keeper.txt')).rejects.toThrow(/outside the vault root/);
    await expect(writeVaultBytes('../outside', 'new', 'txt', Buffer.from('fictional'))).rejects.toThrow();
    await expect(writeVaultBytes('bugs', '../outside', 'txt', Buffer.from('fictional'))).rejects.toThrow();
    await expect(writeVaultBytes('bugs', 'new', '../txt', Buffer.from('fictional'))).rejects.toThrow();
    expect(fs.existsSync(path.join(outside, 'new.txt'))).toBe(false);
  });

  it('refuses a symlinked parent on write without creating outside directories', async () => {
    fs.symlinkSync(outside, path.join(vault, 'linked'));
    await expect(writeVaultBytes('linked/new', 'file', 'txt', Buffer.from('fictional'))).rejects.toThrow(/symlink/);
    expect(fs.existsSync(path.join(outside, 'new'))).toBe(false);
  });

  it('uses exclusive writes: existing file and symlink cannot be overwritten', async () => {
    await writeVaultBytes('bugs', 'one', 'txt', Buffer.from('first'));
    await expect(writeVaultBytes('bugs', 'one', 'txt', Buffer.from('second'))).rejects.toThrow();
    expect(fs.readFileSync(path.join(vault, 'bugs/one.txt'), 'utf8')).toBe('first');

    fs.writeFileSync(path.join(outside, 'keeper.txt'), 'keeper');
    fs.symlinkSync(path.join(outside, 'keeper.txt'), path.join(vault, 'bugs/two.txt'));
    await expect(writeVaultBytes('bugs', 'two', 'txt', Buffer.from('fictional'))).rejects.toThrow();
    expect(fs.readFileSync(path.join(outside, 'keeper.txt'), 'utf8')).toBe('keeper');
  });

  it('refuses even internal directory symlinks to avoid ambiguous custody', async () => {
    fs.mkdirSync(path.join(vault, 'inside'));
    fs.writeFileSync(path.join(vault, 'inside/file.txt'), 'fictional');
    fs.symlinkSync(path.join(vault, 'inside'), path.join(vault, 'indirect'));
    await expect(readVaultBytes('indirect/file.txt')).rejects.toThrow();
    await expect(destroyVaultBytes('indirect/file.txt')).rejects.toThrow();
    await expect(writeVaultBytes('indirect', 'new', 'txt', Buffer.from('fictional'))).rejects.toThrow();
    expect(fs.readFileSync(path.join(vault, 'inside/file.txt'), 'utf8')).toBe('fictional');
  });

  it('refuses unavailable vault mount rather than claiming successful erasure', async () => {
    process.env.FILE_STORAGE_PATH = path.join(fixture, 'missing-mount');
    await expect(readVaultBytes('something.txt')).rejects.toThrow(/Vault root unavailable/);
    await expect(destroyVaultBytes('something.txt')).rejects.toThrow(/Vault root unavailable/);
    await expect(writeVaultBytes('bugs', 'file', 'txt', Buffer.from('fictional'))).rejects.toThrow(/Vault root unavailable/);
  });

  it('treats missing files inside a healthy mounted vault as already erased', async () => {
    await expect(destroyVaultBytes('missing/file.docx')).resolves.toBeUndefined();
  });
});
