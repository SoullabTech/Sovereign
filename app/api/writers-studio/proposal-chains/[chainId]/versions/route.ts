/**
 * W2 · POST …/proposal-chains/[chainId]/versions — THE WRITER AUTHORS WORDING.
 *
 * ⭐⭐ THE GOVERNING SENTENCE (founder, 2026-09-14):
 *
 *     The writer may author the next wording. The system may judge whether that
 *     succession is still possible; it may never choose a different succession
 *     on the writer's behalf.
 *
 * ⭐ This is the first time `appendAuthoredVersion` is reachable from the
 * product. Until now it existed only under witnesses, which is why the surface
 * could only ever be a delivery mechanism: MAIA spoke once and the writer
 * reacted. The chain becomes reciprocal here.
 *
 * ── ⛔ WHAT THE BROWSER MAY SEND, AND NOTHING ELSE ─────────────────────────
 *
 *     supersedes        the predecessor the writer ACTED AGAINST
 *     replacementText   candidate manuscript wording
 *
 * ⛔ NOT `author` — the server writes `member`, always. A route that accepted
 * an author would let a browser sign MAIA's name to a formulation.
 * ⛔ NOT rationale, direction, question, prompt, versionId, target, locus,
 * expectedText, Work version, authorization or execution facts. None of those
 * is an authoring fact, and two of them do not yet exist as objects at all.
 *
 * ⭐ AN UNKNOWN FIELD IS A 400, NOT A SILENT DISCARD. If a caller sends
 * `direction` or `rationale` and we quietly drop it, the caller believes it
 * authored something the server never received — the writer would think they
 * had given MAIA an instruction, and nothing would have been recorded. Refusing
 * loudly is the only honest answer while Direction and Discourse have no home.
 *
 * ⛔ AND `replacementText` IS NOT TRUTHINESS-CHECKED. `''` is lawful candidate
 * wording: a deletion is an ordinary replacement with an empty formulation, and
 * `if (!replacementText)` would make the writer unable to propose one.
 *
 * ── ⛔ WHAT THIS ROUTE NEVER DOES ──────────────────────────────────────────
 *
 * It never finds the current head and attaches there; never retries against a
 * newer head; never turns wording into an authorization; never writes the
 * manuscript. A stale predecessor is a truthful refusal the writer answers —
 * ⛔ not a race for the machine to resolve on their behalf.
 */

import { NextRequest, NextResponse } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { appendAuthoredVersion } from '@/lib/manuscript/proposalChain/store';

export const dynamic = 'force-dynamic';
const enabled = () => process.env.WRITERS_STUDIO_WRITE_ENABLED === '1';

/** ⛔ The closed set. Anything else is a 400. */
const AUTHORING_FIELDS = new Set(['supersedes', 'replacementText']);

export async function POST(
  request: NextRequest, ctx: { params: Promise<{ chainId: string }> },
) {
  if (!enabled()) return new NextResponse(null, { status: 404 });

  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'malformed' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  /* ⭐ The loud refusal. A caller that believed it authored a rationale or a
     direction learns that it did not. */
  const unknown = Object.keys(b).filter((k) => !AUTHORING_FIELDS.has(k));
  if (unknown.length > 0) {
    return NextResponse.json({ error: 'unknown_field', fields: unknown }, { status: 400 });
  }

  if (typeof b.replacementText !== 'string') {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }
  /* ⛔ `null` is the root; a string is a predecessor. Absent is neither, and
     guessing which one the writer meant is exactly the invention this route
     exists to refuse. */
  if (!(b.supersedes === null || typeof b.supersedes === 'string')) {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const { chainId } = await ctx.params;
  const r = await appendAuthoredVersion(identity.memberId, chainId, {
    supersedes: b.supersedes,
    replacementText: b.replacementText,
    /* ⭐ THE SERVER'S FACT, not the caller's. */
    author: 'member',
  });

  if (r.outcome === 'refused') {
    /* ⛔ Absence is one answer. An unknown chain and another member's chain are
       deliberately indistinguishable — a caller must not be able to enumerate
       other writers' chains by their refusal shapes. */
    if (r.reason === 'chain_unknown') return new NextResponse(null, { status: 404 });
    /* ⭐ 409 · the exchange moved while the writer was writing. The reason
       travels so the surface can say WHAT changed — and so it can keep their
       draft rather than discarding words nobody has seen yet. */
    return NextResponse.json({ reason: r.reason }, { status: 409 });
  }

  return NextResponse.json({
    id: r.version.id,
    author: r.version.author,
    supersedes: r.version.supersedes,
    replacementText: r.version.replacementText,
    authoredAt: r.version.authoredAt,
  }, { status: 201 });
}
