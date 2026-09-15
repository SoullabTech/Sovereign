/**
 * WS-EDITORIAL-UI-02 · THE WRITER'S OWN FORMULATION.
 *
 *   POST  append a member-authored version to this thread's chain
 *
 * ⭐ Same posture as the thread and turn routes: ⛔ off by default and 404 —
 * not 403 — ⛔ verified identity only, ⛔ a CLOSED request shape whose unknown
 * keys are refused AND NAMED rather than ignored.
 *
 * ⭐⭐ THE BODY CARRIES THREE THINGS, AND THE THIRD IS THE ONE THAT MATTERS:
 * `supersedes` is the exact formulation the writer acted against, carried from
 * their click to the store unchanged. ⛔ This route never resolves it, never
 * substitutes the current head for it, and never retries on refusal. The
 * machine's timing may judge their relationship stale; it may not rewrite which
 * wording they answered.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import {
  appendMemberEditorialVersion, type MemberVersionRefusal,
} from '@/lib/manuscript/editorialRuntime/memberVersion';

export const dynamic = 'force-dynamic';

const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';

/** ⛔ CLOSED. Everything else is a server fact, a closed capability, or both. */
const BODY_KEYS = ['threadId', 'supersedes', 'replacementText'] as const;

/**
 * ⭐ Which refusals are the writer's exchange having moved (409) and which are
 * this request being wrong (400).
 *
 * ⛔ `simultaneous_append` is a 409 for the same reason `not_successor_of_head`
 * is: both mean another authored act took the slot, and neither is the caller's
 * mistake. ⛔ NO AUTOMATIC RETRY on either.
 */
function statusFor(reason: MemberVersionRefusal): number {
  switch (reason) {
    case 'thread_not_found': return 404;
    case 'not_editorial':    return 400;
    case 'chain_unknown':    return 404;
    case 'not_successor_of_head':
    case 'simultaneous_append':
    case 'version_exists':   return 409;
    /* ⛔ Corrupt succession is not a refusal the writer can act on, and it is
       never repaired to make a request succeed. */
    case 'chain_corrupt':    return 409;
    default:                 return 409;
  }
}

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid JSON' }, { status: 400 }); }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return NextResponse.json({ error: 'a JSON object is required' }, { status: 400 });
  }
  const b = raw as Record<string, unknown>;

  /* ⛔ NAMED, NOT IGNORED. A caller that sent `author` or `chainId` and got 201
     would believe it had standing it does not have — `author` is fixed to
     `member` in the seam, and the chain is derived from the owned thread. */
  const stray = Object.keys(b).filter(
    (k) => !(BODY_KEYS as readonly string[]).includes(k));
  if (stray.length) {
    return NextResponse.json({
      error: `unknown field(s): ${stray.join(', ')} — these are server-fixed, derived, or not open in this cut, and carry no standing here`,
    }, { status: 400 });
  }

  if (typeof b.threadId !== 'string' || b.threadId.length === 0) {
    return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
  }
  if (!(b.supersedes === null || typeof b.supersedes === 'string')) {
    return NextResponse.json({ error: 'supersedes must be a version id or null' }, { status: 400 });
  }
  /* ⛔⛔ TYPE ONLY, NEVER TRUTHINESS. `''` is a lawful candidate formulation —
     a writer may mean *this passage should not be here* — and it changes
     nothing until adoption, which is closed. A `!b.replacementText` guard here
     would silently refuse an act the substrate permits. */
  if (typeof b.replacementText !== 'string') {
    return NextResponse.json({ error: 'replacementText is required' }, { status: 400 });
  }

  const appended = await appendMemberEditorialVersion({
    identity,
    threadId: b.threadId,
    supersedes: b.supersedes,
    replacementText: b.replacementText,
  });

  if (!appended.ok) {
    return NextResponse.json({ error: appended.reason }, { status: statusFor(appended.reason) });
  }
  /* ⭐ THIN. The new version's identity and its stated predecessor — ⛔ no
     lineage, no chain, no locus. The surface re-reads the thread, so the screen
     agrees with storage rather than with what it just sent. */
  return NextResponse.json(
    { versionId: appended.version.id, supersedes: appended.version.supersedes },
    { status: 201 });
}
