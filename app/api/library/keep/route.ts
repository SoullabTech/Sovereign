// Per-member write path → force-dynamic (per-user DB access, server-derived identity).
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { LibraryService } from '@/lib/library/LibraryService';
import {
  DEFAULT_USAGE_AUTHORITY,
  type UsageAuthority,
} from '@/lib/library/governedRetrieval';
import { shouldPersistKeep } from '@/lib/sanctuary/sanctuaryGuards';

/**
 * POST /api/library/keep — Personal Wisdom Library increment 1, the "Keep this" primitive.
 *
 * The member keeps ONE item into their private corpus and grants a usage authority.
 * Acceptance: "Can a member keep one item privately, assign a usage authority, and
 * have governed retrieval honor that authority?" Retrieval honoring lives in
 * LibraryService (authorizationPredicateSql); this route is the write path.
 *
 * Constitutional commitments enforced here:
 *  - Identity is SERVER-DERIVED. owner_id comes from the session, never the body —
 *    a member cannot keep an item on another member's behalf.
 *  - Member scope, PRIVATE visibility (impl §5 fixed-in-v1).
 *  - Usage authority defaults to the LOW end (only_when_i_ask): no kept item is
 *    guidance-authoritative by default (arch §4 invariant).
 *  - Provenance is recorded (arch §5/§9).
 *
 * Spec: docs/specs/PERSONAL_WISDOM_LIBRARY_IMPL_2026-06-27.md §5
 *
 * Sanctuary guard (arch §9.6): ENFORCED below — a Sanctuary session (request flag
 * `sanctuary: true`) is refused before any DB write, so a Sanctuary keep creates 0 rows.
 *
 * DEFERRED (not yet wired — tracked for the live/Clean-Language slice, not this increment):
 *  - "Offer"/promotion path (deferred by design, arch §8).
 */

const USAGE_AUTHORITIES: readonly UsageAuthority[] = [
  'store_only',
  'only_when_i_ask',
  'reflect_with_me',
  'use_in_guidance',
];

const PROVENANCES = [
  'transcript', 'manual', 'book', 'paper', 'workshop',
  'personal_insight', 'clinical', 'tradition', 'maia_conversation',
] as const;
type Provenance = (typeof PROVENANCES)[number];

// provenance → library_sources.type (content type CHECK). Member keeps default to 'txt'.
const PROVENANCE_TO_TYPE: Partial<Record<Provenance, string>> = {
  transcript: 'transcript',
  manual: 'manual',
  book: 'book',
  paper: 'article',
};

/** Minimal paragraph-aware chunker. Most kept items are a single chunk. */
function chunkText(content: string, maxChars = 3600): Array<{ content: string; tokenCount: number; meta: Record<string, any> }> {
  const text = content.trim();
  if (text.length <= maxChars) {
    return [{ content: text, tokenCount: Math.ceil(text.length / 4), meta: {} }];
  }
  const paras = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let buf = '';
  for (const p of paras) {
    if (buf && buf.length + p.length + 2 > maxChars) {
      chunks.push(buf);
      buf = p;
    } else {
      buf = buf ? `${buf}\n\n${p}` : p;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.map((c) => ({ content: c, tokenCount: Math.ceil(c.length / 4), meta: {} }));
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  try {
    // 1. Server-derived identity — the only source of ownership.
    const session = await getCurrentSession();
    const ownerId = session?.memberId;
    if (!ownerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Parse + validate.
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be an object' }, { status: 400 });
    }

    // Sanctuary guard (arch §9.6): a Sanctuary session must not write to the library —
    // a kept item is long-term memory, and Sanctuary content never enters persistence.
    // `sanctuary` is a request-provided signal (same shape as maiaOrchestrator's
    // meta.sanctuary). Checked BEFORE any DB write ⇒ a Sanctuary keep creates 0 rows.
    const isSanctuary = body.sanctuary === true;
    if (!shouldPersistKeep(isSanctuary)) {
      return NextResponse.json(
        { error: 'Sanctuary session: nothing is kept.', sanctuary: true, kept: false },
        { status: 403 },
      );
    }

    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!content) {
      return NextResponse.json({ error: "Field 'content' is required" }, { status: 400 });
    }

    // Intent interpreter (impl §0): the member's "how should MAIA use this?" choice
    // maps to the usage_authority axis. Default = low end of the ladder.
    let usageAuthority: UsageAuthority = DEFAULT_USAGE_AUTHORITY;
    if (body.usageAuthority !== undefined) {
      if (!USAGE_AUTHORITIES.includes(body.usageAuthority)) {
        return NextResponse.json(
          { error: `usageAuthority must be one of: ${USAGE_AUTHORITIES.join(', ')}` },
          { status: 400 },
        );
      }
      usageAuthority = body.usageAuthority;
    }

    let provenance: Provenance = 'personal_insight';
    if (body.provenance !== undefined) {
      if (!PROVENANCES.includes(body.provenance)) {
        return NextResponse.json(
          { error: `provenance must be one of: ${PROVENANCES.join(', ')}` },
          { status: 400 },
        );
      }
      provenance = body.provenance;
    }

    const title =
      typeof body.title === 'string' && body.title.trim()
        ? body.title.trim().slice(0, 200)
        : content.slice(0, 60) + (content.length > 60 ? '…' : '');
    const author = typeof body.author === 'string' ? body.author.trim().slice(0, 200) : undefined;

    // 3. Persist (member scope, private). Checksum binds content to its owner so the
    // global unique(checksum) index does not collide across members.
    const checksum = createHash('sha256').update(`${ownerId}:${content}`).digest('hex');
    const svc = new LibraryService();

    let sourceId: string;
    try {
      sourceId = await svc.createSource({
        type: PROVENANCE_TO_TYPE[provenance] ?? 'txt',
        title,
        author,
        filePath: `member:${ownerId}/${checksum}`,
        checksum,
        meta: { kept_via: 'keep_v1' },
        scope: 'member',
        ownerType: 'member',
        ownerId,
        visibility: 'private',
        usageAuthority,
        lifecycleState: 'kept',
        provenance,
      });
    } catch (err: any) {
      // Unique checksum violation → this member already kept identical content.
      if (err?.code === '23505') {
        return NextResponse.json({ error: 'You have already kept this item' }, { status: 409 });
      }
      throw err;
    }

    const chunks = chunkText(content);
    await svc.addChunks(sourceId, chunks);
    const tokenCount = chunks.reduce((n, c) => n + c.tokenCount, 0);
    await svc.updateSourceStatus(sourceId, 'completed', undefined, {
      tokenCount,
      chunkCount: chunks.length,
    });

    // 4. Embed inline so the kept item is immediately retrievable (governed by authority).
    // ("Queue" is the eventual shape; inline keeps increment 1 deterministically testable.)
    const embedded = await svc.generateChunkEmbeddings(sourceId);

    return NextResponse.json(
      {
        id: sourceId,
        scope: 'member',
        visibility: 'private',
        usage_authority: usageAuthority,
        lifecycle_state: 'kept',
        provenance,
        chunk_count: chunks.length,
        embedded,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('[library/keep] POST error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
