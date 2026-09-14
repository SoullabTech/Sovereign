/**
 * STEP 1 · the succession functions. Pure, total, and falsifiable without a
 * database, a route or a surface.
 *
 * ⭐⭐ EVERY ANSWER IS RECOVERED WITHOUT REPLAY, TIMING INFERENCE, OR READING
 * PROSE. `authoredAt` is never consulted to establish order — order is what
 * `supersedes` states, and a chain whose timestamps disagree with its
 * succession is still ordered by its succession. ⛔ Inferring sequence from
 * clocks is how two versions written in the same second become unorderable, and
 * how a corrected clock silently rewrites who revised whom.
 */
import {
  isVersionAuthor,
  type ProposalChain,
  type ProposalVersion,
  type SuccessionRefusal,
  type SuccessionResult,
  type VersionAuthor,
  type VersionAuthorization,
} from './contract';

const no = <T>(reason: SuccessionRefusal): SuccessionResult<T> =>
  ({ ok: false, reason });
const yes = <T>(value: T): SuccessionResult<T> => ({ ok: true, value });

/**
 * ⭐ THE INTEGRITY CHECK. Everything else assumes a chain that passed this, so
 * it is deliberately total: it refuses on the FIRST violation it can name,
 * and the order of the checks is the order in which a defect makes later
 * checks meaningless.
 */
export function validateChain(
  chain: ProposalChain,
  versions: readonly ProposalVersion[],
): SuccessionResult<readonly ProposalVersion[]> {
  if (versions.length === 0) return yes(versions);

  const seen = new Set<string>();
  for (const v of versions) {
    /* ⛔ AUTHORSHIP IS EXPLICIT OR THE VERSION IS NOT ONE. Checked before
       anything structural: a formulation nobody authored cannot be repaired by
       being well-linked. */
    if (!isVersionAuthor(v.author)) return no('author_missing');
    if (v.chainId !== chain.id) return no('foreign_chain');
    if (seen.has(v.id)) return no('duplicate_version');
    seen.add(v.id);
  }

  for (const v of versions) {
    if (v.supersedes === v.id) return no('self_predecessor');
    if (v.supersedes !== null && !seen.has(v.supersedes)) {
      return no('predecessor_unknown');
    }
  }

  const roots = versions.filter((v) => v.supersedes === null);
  if (roots.length === 0) return no('no_root');
  if (roots.length > 1) return no('multiple_roots');

  /* ⛔ LINEAR, NOT A TREE. Two versions superseding one predecessor is a
     branch, and a branch has two heads — which would make "the version the
     writer chose" ambiguous at exactly the moment it must not be. */
  const superseded = new Set<string>();
  for (const v of versions) {
    if (v.supersedes === null) continue;
    if (superseded.has(v.supersedes)) return no('branched');
    superseded.add(v.supersedes);
  }

  /* A cycle cannot contain the root, so with exactly one root and no branching
     any version not reachable from it is in one. Walking forward proves
     reachability and terminates in at most `versions.length` steps. */
  const bySupersedes = new Map(
    versions.filter((v) => v.supersedes !== null).map((v) => [v.supersedes as string, v]),
  );
  let reachable = 1;
  let cursor: ProposalVersion | undefined = roots[0];
  while (cursor) {
    const next: ProposalVersion | undefined = bySupersedes.get(cursor.id);
    if (!next) break;
    reachable += 1;
    if (reachable > versions.length) return no('cycle');
    cursor = next;
  }
  if (reachable !== versions.length) return no('cycle');

  return yes(versions);
}

/** The version nobody supersedes. ⛔ Found, never flagged. */
export function headOf(
  versions: readonly ProposalVersion[],
): ProposalVersion | null {
  if (versions.length === 0) return null;
  const superseded = new Set(
    versions.map((v) => v.supersedes).filter((x): x is string => x !== null),
  );
  return versions.find((v) => !superseded.has(v.id)) ?? null;
}

export function rootOf(
  versions: readonly ProposalVersion[],
): ProposalVersion | null {
  return versions.find((v) => v.supersedes === null) ?? null;
}

/**
 * ⭐ THE HISTORY, ROOT FIRST — the answer to "what did this succeed?" for every
 * version at once, derived from what each one names.
 */
export function lineage(
  versions: readonly ProposalVersion[],
): readonly ProposalVersion[] {
  const root = rootOf(versions);
  if (!root) return [];
  const bySupersedes = new Map(
    versions.filter((v) => v.supersedes !== null).map((v) => [v.supersedes as string, v]),
  );
  const out: ProposalVersion[] = [root];
  for (let next = bySupersedes.get(root.id); next; next = bySupersedes.get(next.id)) {
    out.push(next);
    if (out.length > versions.length) break;   // validateChain owns cycles
  }
  return out;
}

/** What a version replaced. ⛔ Stated by the successor, never searched for. */
export function predecessorOf(
  version: ProposalVersion,
  versions: readonly ProposalVersion[],
): ProposalVersion | null {
  if (version.supersedes === null) return null;
  return versions.find((v) => v.id === version.supersedes) ?? null;
}

/**
 * ⭐⭐ APPEND, NEVER REPLACE. The whole point of the substrate:
 *
 *   "a later MAIA revision exists without making the earlier MAIA formulation
 *    disappear, and without making Kelly appear to have authored it."
 *
 * ⛔ There is no update, no upsert and no `replaceVersion` in this module. A
 * version that exists is finished.
 */
export function appendVersion(
  chain: ProposalChain,
  versions: readonly ProposalVersion[],
  candidate: ProposalVersion,
): SuccessionResult<readonly ProposalVersion[]> {
  const valid = validateChain(chain, versions);
  if (!valid.ok) return valid;

  if (!isVersionAuthor(candidate.author)) return no('author_missing');
  if (candidate.chainId !== chain.id) return no('foreign_chain');
  if (versions.some((v) => v.id === candidate.id)) return no('version_exists');

  const head = headOf(versions);
  if (head === null) {
    /* The first formulation is the root, and only the root may supersede
       nothing. */
    return candidate.supersedes === null
      ? yes([candidate])
      : no('predecessor_unknown');
  }
  if (candidate.supersedes === candidate.id) return no('self_predecessor');
  if (candidate.supersedes !== head.id) return no('not_successor_of_head');

  return yes([...versions, candidate]);
}

/**
 * ⛔ AN AUTHORIZATION NAMES ONE EXACT VERSION OF ONE EXACT CHAIN.
 *
 * ⚠️ Note what this does NOT require: that the version be the head. A writer
 * may authorize MAIA's v3 after writing a v4 they then abandoned, and the
 * record must be able to say so. What it refuses is a version from somewhere
 * else entirely.
 */
export function authorizes(
  chain: ProposalChain,
  versions: readonly ProposalVersion[],
  authorization: VersionAuthorization,
): SuccessionResult<ProposalVersion> {
  if (authorization.chainId !== chain.id) return no('authorization_foreign_version');
  const version = versions.find((v) => v.id === authorization.versionId);
  if (!version || version.chainId !== chain.id) {
    return no('authorization_foreign_version');
  }
  return yes(version);
}

/** Who authored each formulation, in order. ⛔ Read, never inferred. */
export function authorship(
  versions: readonly ProposalVersion[],
): readonly VersionAuthor[] {
  return lineage(versions).map((v) => v.author);
}
