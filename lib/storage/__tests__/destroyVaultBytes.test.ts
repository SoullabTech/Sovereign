/**
 * WS-DELETE-01 — erasure must be observed, not attempted.
 *
 * `deleteVaultBytes` is best-effort and never throws, which is correct for
 * cleanup and wrong for a promise made to a member: it returns normally over
 * bytes that are still on disk. `destroyVaultBytes` is the custody-grade
 * variant, and these tests exist to keep it from quietly becoming the other one.
 */
import { mkdtemp, writeFile, mkdir, stat } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { destroyVaultBytes, deleteVaultBytes } from '../fileVault';

let root: string;
const prevRoot = process.env.FILE_STORAGE_PATH;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'vault-'));
  process.env.FILE_STORAGE_PATH = root;
});

afterEach(() => {
  if (prevRoot === undefined) delete process.env.FILE_STORAGE_PATH;
  else process.env.FILE_STORAGE_PATH = prevRoot;
});

const seed = async (rel: string, body = 'the member\'s manuscript') => {
  const full = path.join(root, rel);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body);
  return full;
};

const exists = async (full: string) => {
  try {
    await stat(full);
    return true;
  } catch {
    return false;
  }
};

describe('bytes actually leave the vault', () => {
  it('destroys the file', async () => {
    const full = await seed('a/original.docx');
    await destroyVaultBytes('a/original.docx');
    expect(await exists(full)).toBe(false);
  });

  it('treats a path that was never written as already destroyed', async () => {
    await expect(destroyVaultBytes('never/written.docx')).resolves.toBeUndefined();
  });
});

describe('absence means ENOENT, never "could not look"', () => {
  /* Founder condition, 2026-09-07: a permissions error must remain a failure. The
     danger is the inverse of the obvious one — not that we fail to delete, but
     that we cannot SEE whether we deleted, and call that gone. */
  const asRoot = typeof process.getuid === 'function' && process.getuid() === 0;

  (asRoot ? it.skip : it)(
    'throws when the file cannot be inspected, rather than reporting it destroyed',
    async () => {
      const { chmod } = await import('fs/promises');
      const full = await seed('locked/original.docx');
      const dir = path.dirname(full);

      /* Unsearchable parent: unlink and stat both fail with EACCES, not ENOENT. */
      await chmod(dir, 0o000);
      try {
        await expect(destroyVaultBytes('locked/original.docx')).rejects.toMatchObject({
          code: 'EACCES',
        });
      } finally {
        await chmod(dir, 0o700);
      }

      /* And the bytes really are still there — the throw was not pessimism. */
      expect(await exists(full)).toBe(true);
    },
  );

  it('distinguishes the two cases by errno, not by whether a call threw', async () => {
    /* ENOENT from the unlink is swallowed and the stat confirms absence; every
       other errno propagates. Held explicitly so a later refactor cannot quietly
       widen the catch to `catch {}`. */
    await expect(destroyVaultBytes('absent/file.docx')).resolves.toBeUndefined();

    const dirPath = path.join(root, 'd/adirectory');
    await mkdir(dirPath, { recursive: true });
    await expect(destroyVaultBytes('d/adirectory')).rejects.toThrow();
  });
});

describe('it refuses rather than reporting a success it did not achieve', () => {
  /* The negative that matters. The best-effort helper returns normally for a
     traversal-guarded path, so a caller trusting it would report the member's
     file destroyed while it sits untouched outside the root. */
  it('throws on a path outside the vault root, where the best-effort helper is silent', async () => {
    const outside = await mkdtemp(path.join(tmpdir(), 'outside-'));
    const victim = path.join(outside, 'kept.docx');
    await writeFile(victim, 'not ours to delete');
    const escape = path.relative(root, victim);

    await expect(destroyVaultBytes(escape)).rejects.toThrow(/outside the vault root/);
    expect(await exists(victim)).toBe(true);

    /* The contrast, held explicitly: the same input through the old helper
       resolves, which is exactly why the route may not use it. */
    await expect(deleteVaultBytes(escape)).resolves.toBeUndefined();
  });

  /* A real, unmockable failure to destroy: unlink on a directory fails with
     EPERM/EISDIR on every platform we run. The point is not the errno — it is
     that the bytes are still there afterwards and the caller is told so. */
  it('throws when the path cannot be destroyed, and leaves it observably present', async () => {
    const full = path.join(root, 'c/undeletable');
    await mkdir(full, { recursive: true });

    await expect(destroyVaultBytes('c/undeletable')).rejects.toThrow();
    expect(await exists(full)).toBe(true);

    /* The same input through the best-effort helper resolves as though it had
       worked. That difference is the whole reason this function exists. */
    await expect(deleteVaultBytes('c/undeletable')).resolves.toBeUndefined();
    expect(await exists(full)).toBe(true);
  });
});
