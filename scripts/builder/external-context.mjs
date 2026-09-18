#!/usr/bin/env node
/**
 * Build a bounded external-provider evidence bundle from Work Unit allowed_files.
 * Exact files only; no globs, directories, symlinks, path escapes, secret-bearing
 * paths, binary files, or unbounded payloads.
 */
import {
  lstatSync, readFileSync, realpathSync, statSync,
} from 'node:fs';
import path from 'node:path';

export const EXTERNAL_CONTEXT_LIMITS = Object.freeze({
  max_files: 12,
  max_file_bytes: 128 * 1024,
  max_total_bytes: 512 * 1024,
});

const sentinel = (value) => /^NO FILES\b/i.test(value.trim());

function isSensitivePath(rel) {
  const normalized = rel.replaceAll('\\', '/').toLowerCase();
  const base = path.posix.basename(normalized);
  if (normalized === 'data/vault' || normalized.startsWith('data/vault/')) return true;
  if (base === '.env' || (base.startsWith('.env.') && base !== '.env.example')) return true;
  if (/\.(pem|key|p12|pfx|keystore)$/.test(base)) return true;
  if (['auth.json', 'credentials.json', 'secrets.json'].includes(base)) return true;
  return false;
}

function validateRelativePath(rel) {
  if (typeof rel !== 'string' || rel.trim() === '') throw new Error('INVALID_ALLOWED_FILE');
  if (path.isAbsolute(rel)) throw new Error('ABSOLUTE_PATH_REFUSED');
  if (/[*?\[\]{}]/.test(rel)) throw new Error('GLOB_PATH_REFUSED');
  const normalized = path.posix.normalize(rel.replaceAll('\\', '/'));
  if (normalized === '..' || normalized.startsWith('../')) throw new Error('PATH_ESCAPE_REFUSED');
  if (isSensitivePath(normalized)) throw new Error('SENSITIVE_PATH_REFUSED');
  return normalized;
}

export function bundleExternalContext({ packet, worktree }) {
  const raw = Array.isArray(packet?.allowed_files) ? packet.allowed_files : [];
  const files = raw.filter((entry) => typeof entry === 'string' && !sentinel(entry));
  if (files.length === 0) return '';
  if (files.length > EXTERNAL_CONTEXT_LIMITS.max_files) throw new Error('TOO_MANY_ALLOWED_FILES');

  const root = realpathSync(worktree);
  const blocks = [];
  let total = 0;

  for (const entry of files) {
    const rel = validateRelativePath(entry);
    const candidate = path.join(root, rel);
    const lst = lstatSync(candidate);
    if (lst.isSymbolicLink()) throw new Error('SYMLINK_REFUSED');
    if (!lst.isFile()) throw new Error('NON_FILE_REFUSED');

    const resolved = realpathSync(candidate);
    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
      throw new Error('PATH_ESCAPE_REFUSED');
    }

    const size = statSync(resolved).size;
    if (size > EXTERNAL_CONTEXT_LIMITS.max_file_bytes) throw new Error('FILE_TOO_LARGE');
    total += size;
    if (total > EXTERNAL_CONTEXT_LIMITS.max_total_bytes) throw new Error('CONTEXT_TOO_LARGE');

    const buffer = readFileSync(resolved);
    if (buffer.includes(0)) throw new Error('BINARY_FILE_REFUSED');
    const text = buffer.toString('utf8');

    blocks.push([
      `=== BEGIN AUTHORIZED FILE: ${rel} ===`,
      text,
      `=== END AUTHORIZED FILE: ${rel} ===`,
    ].join('\n'));
  }

  return [
    'AUTHORIZED REPOSITORY EVIDENCE',
    'JARVIS selected exactly these files from the Work Unit allowlist.',
    'Do not infer access to any other repository content.',
    '',
    ...blocks,
  ].join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [command, packetPath, worktree] = process.argv.slice(2);
  if (command !== 'bundle' || !packetPath || !worktree) {
    process.stderr.write('usage: external-context.mjs bundle <packet.json> <worktree>\n');
    process.exit(2);
  }
  try {
    const packet = JSON.parse(readFileSync(packetPath, 'utf8'));
    const bundle = bundleExternalContext({ packet, worktree });
    if (bundle) process.stdout.write(bundle + '\n');
  } catch (error) {
    const code = error instanceof Error ? error.message : 'EXTERNAL_CONTEXT_ERROR';
    process.stderr.write(`[external-context] REFUSED ${code}\n`);
    process.exit(3);
  }
}
