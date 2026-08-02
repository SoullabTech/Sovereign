/**
 * Field Object Declaration — the act, as a route.
 *
 * Governed by MEMBER_FIELD_AND_STUDIO_DIRECTIVE.md Amendment 5 (canonical
 * 1e15f9c71): a source does not create an enduring Field Object by being
 * produced or saved. A Field Object comes into being only through an explicit
 * human declaration. THIS REQUEST IS THAT DECLARATION — nothing upstream of it
 * declares anything, and no lifecycle transition reaches this handler.
 *
 * The route decides nothing about provenance. It takes a capsule id, asks who
 * is authenticated, and hands both to keepSource(), which is the single
 * capability every declaration converges on. `source_type`, `generated_by` and
 * ownership are set there, not here and never by the browser — a client that
 * could choose its own provenance could forge the act.
 *
 * 201 vs 200 is the whole subtlety. A member pressing twice, a retry after a
 * dropped response, and two open tabs must all end with one Field Object, and
 * the second attempt must read as "already yours" rather than as an error or
 * as a second creation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { keepSource } from '@/lib/psyche/portfolio';
import { resolveCapsuleDeclarationSource } from '@/lib/psyche/sources/capsule';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let capsuleId: unknown;
  try {
    ({ capsuleId } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Malformed request body' }, { status: 400 });
  }

  if (typeof capsuleId !== 'string' || capsuleId.length === 0) {
    return NextResponse.json({ error: 'capsuleId is required' }, { status: 400 });
  }

  try {
    const atom = await keepSource(memberId, {
      memberId,
      sourceType: 'capsule',
      sourceId: capsuleId,
      // The capsule's own words. The member declared this material; nothing
      // interprets, summarises or rewrites it on the way in.
      //
      // THE FORMULATION IS FIXED AT THIS MOMENT. What the member is looking at
      // when they press the act becomes the Field Object's stable body. Later
      // capsule edits do not reach back and rewrite it: keepSource INSERTs once
      // and its ON CONFLICT path returns the existing row untouched. Capsule and
      // Field Object are separate histories from here on, by construction.
      title: (await resolveCapsuleDeclarationSource(memberId, capsuleId)).title,
      body: null,
    });

    // 201 vs 200 comes from the INSERT itself, not from a read before it.
    //
    // A preflight "does this exist?" is wrong under concurrency: five
    // simultaneous declarations all read absent, all proceed, the unique index
    // correctly converges them onto one row — and all five would answer 201.
    // The row would be right and every response but one would be false.
    //
    // keepSource reports `wasCreated` from `(xmax = 0)` in the same statement
    // that decided it, so exactly one concurrent request can claim creation.
    return NextResponse.json(
      {
        atomId: atom.id,
        sourceType: atom.sourceType,
        sourceId: atom.sourceId,
        alreadyDeclared: !atom.wasCreated,
      },
      { status: atom.wasCreated ? 201 : 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Declaration failed';

    // Absence and non-ownership deliberately share one status and one message,
    // set in keepSource: a member must not be able to discover another member's
    // capsule ids by reading which error comes back.
    if (message.includes('capsule not found')) {
      return NextResponse.json({ error: 'Capsule not found' }, { status: 404 });
    }
    // Eligibility refusals say plainly which condition failed — these concern
    // the member's own capsule, so there is nothing to withhold.
    if (message.includes('still a draft')) {
      return NextResponse.json(
        { error: 'This capsule is still a draft. Finish reviewing it first.', reason: 'draft' },
        { status: 409 },
      );
    }
    if (message.includes('archived')) {
      return NextResponse.json(
        { error: 'This capsule is archived.', reason: 'archived' },
        { status: 409 },
      );
    }

    console.error('[field/declare] declaration failed:', error);
    return NextResponse.json({ error: 'Declaration failed' }, { status: 500 });
  }
}

