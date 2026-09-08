/**
 * WS-01 — Source arrival write authority.
 *
 * Founder ruling 2026-09-08, on PT-3's P11 falsification. PT-3 discovered that
 * historical Source was protected only by naming convention and collision
 * improbability; the repair belongs here, where WS-01 already joins Source
 * relational identity to immutable vault bytes.
 *
 * The write-side complement to S4:
 *
 *   S4   Source lifecycle authority is an operation, not a portable token.
 *   WS-01 Source arrival authority is an operation, not a namespace a caller
 *         may choose.
 *
 * And the byte-level law:
 *
 *   Historical Source is not merely unlikely to be overwritten. It is
 *   un-overwritable through the ordinary writing powers of the Studio.
 *
 * ── Why this is an operation and not a token ──────────────────────────────
 *
 * It takes no namespace: `manuscript-sources` is owned internally and reserved
 * from `writeVaultBytes()`, so a content-working path has no Source-write
 * operation at all — not a restricted one, none. It returns artifact data, never
 * generic write authority. There is deliberately no capability object here; S4's
 * lesson was that a token is a claim, and imitating its shape without its
 * reasons would be cargo cult.
 *
 * ── Create-only, by mechanism ─────────────────────────────────────────────
 *
 * `wx` is `O_CREAT | O_EXCL`: the kernel refuses a path that already exists, so
 * a second establishment cannot replace a first. `EEXIST` MUST NEVER BECOME
 * OVERWRITE. This retries at a fresh unique path instead — a genuinely new
 * artifact, deliberately NOT deduplication: identical bytes arriving twice are
 * two entrustments, and collapsing them would decide a semantic question
 * (shared Source identity) that nobody has ruled on.
 */
import { mkdir, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import {
  canonicalVaultDestination,
  resolveVaultRoot,
  SOURCE_VAULT_NAMESPACE,
  VaultDestinationRefused,
} from '@/lib/storage/fileVault';

export class SourceArtifactExists extends Error {
  constructor(readonly storagePath: string) {
    super(`[source] refusing to replace an existing Source artifact: ${storagePath}`);
    this.name = 'SourceArtifactExists';
  }
}

/**
 * Establish a NEW Source artifact. Never replaces one.
 *
 * `allowRetry` false makes the refusal observable: the caller gets
 * `SourceArtifactExists` and the bytes already on disk are untouched. That is
 * the shape P11(ii) falsifies against — the assertion is not merely that an
 * error occurred, but that the historical bytes remained identical.
 */
export async function createSourceArtifact(
  fileId: string,
  ext: string,
  bytes: Buffer,
  opts: { allowRetry?: boolean } = {},
): Promise<string> {
  const allowRetry = opts.allowRetry !== false;
  const root = resolveVaultRoot();
  await mkdir(path.join(root, SOURCE_VAULT_NAMESPACE), { recursive: true });

  let candidate = fileId;
  for (let attempt = 0; ; attempt += 1) {
    const dest = canonicalVaultDestination(SOURCE_VAULT_NAMESPACE, candidate, ext);
    if (!dest) {
      throw new VaultDestinationRefused('not_canonical', `${SOURCE_VAULT_NAMESPACE}/${candidate}.${ext}`);
    }
    try {
      /* 'wx' — the kernel, not a convention, is what refuses an existing path. */
      await writeFile(path.join(root, dest.path), bytes, { flag: 'wx' });
      return dest.path;
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code !== 'EEXIST') throw err;
      if (!allowRetry) throw new SourceArtifactExists(dest.path);
      /* A fresh unique path: a new artifact, not a merge with the old one. */
      if (attempt >= 4) throw new SourceArtifactExists(dest.path);
      candidate = `${fileId}-${randomUUID().slice(0, 8)}`;
    }
  }
}
