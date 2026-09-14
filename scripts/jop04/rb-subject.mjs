/**
 * JOP-04 RB acceptance instrument — SUBJECT CUSTODY
 *
 * The instrument and the subject must have separate identities. This module
 * materializes an EXACT detached checkout of the subject SHA and proves it,
 * so "baseline" can never quietly drift to "whatever commit contains the tests".
 *
 * ⛔ It does not copy source fragments into fixtures. The subject's own
 *    router.mjs and deterministic.mjs are imported from the detached checkout.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export const SUBJECT_SHA = 'e1c6f527';

const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

/**
 * Materialize the subject at SUBJECT_SHA in a detached worktree.
 * Returns { dir, resolvedSha, dispose } — resolvedSha is read back FROM the
 * checkout, never asserted from the request.
 */
export function materializeSubject(repoRoot, sha = SUBJECT_SHA) {
  const requested = git(['rev-parse', sha], repoRoot);
  const dir = mkdtempSync(path.join(tmpdir(), 'jop04-subject-'));
  rmSync(dir, { recursive: true, force: true }); // git worktree wants a non-existent path
  git(['worktree', 'add', '--detach', dir, requested], repoRoot);

  // Provability: the checkout states its own HEAD. We do not take our word for it.
  const resolvedSha = git(['rev-parse', 'HEAD'], dir);
  if (resolvedSha !== requested) {
    throw new Error(`subject custody violated: asked ${requested}, checkout reports ${resolvedSha}`);
  }
  const dirty = git(['status', '--porcelain'], dir);
  if (dirty) throw new Error(`subject checkout is not pristine:\n${dirty}`);

  return {
    dir,
    resolvedSha,
    shortSha: resolvedSha.slice(0, 8),
    dispose() {
      try { git(['worktree', 'remove', '--force', dir], repoRoot); } catch { /* best effort */ }
      if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    },
  };
}

/** Import the subject's OWN modules — not the instrument branch's copies. */
export async function loadSubjectModules(subjectDir) {
  const at = (...p) => `file://${path.join(subjectDir, ...p)}`;
  const router = await import(at('scripts', 'builder', 'router.mjs'));
  const deterministic = await import(at('scripts', 'builder', 'deterministic.mjs'));
  return { router, deterministic, mainJsPath: path.join(subjectDir, 'jarvis-desktop', 'src', 'main.js') };
}

export function instrumentSha(repoRoot) {
  return git(['rev-parse', 'HEAD'], repoRoot).slice(0, 8);
}
