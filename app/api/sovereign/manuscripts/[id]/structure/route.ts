/**
 * WS2-05A — the Work's authored structure.
 *
 * GET returns the tree and the sections in no unit. POST performs one authoring
 * gesture and returns the tree as it now stands, so the client never has to
 * reconstruct the outcome of its own request — a client that computes what the
 * server "would have done" will eventually compute it wrong and render a book
 * organised differently from the one that is stored.
 *
 * ONE ROUTE, ONE TRANSACTION BOUNDARY. Each gesture is a discriminated union
 * member, and ownership is established once inside the service rather than at
 * five call sites that must each remember to check.
 *
 * IDENTITY. Section ids crossing this boundary are always
 * manuscript_draft_sections ids — the same namespace the writing surface, the
 * save queue and `?s=` use. The Source identity never appears here.
 *
 * NO TEXT CROSSES THIS BOUNDARY in either direction. Structure holds sections
 * by reference; a body arriving or leaving through this route would mean the
 * layer had started carrying the writing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  loadStructure, createUnit, renameUnit, moveUnit, deleteUnit, placeSections,
  type StructureRefusal,
} from '@/lib/manuscript/structure/structureService';

export const dynamic = 'force-dynamic';

/** Refusals the member caused, versus ones about what exists. */
const STATUS: Record<StructureRefusal, number> = {
  not_found: 404,
  no_addressable_draft: 409,
  unknown_unit: 404,
  unknown_parent: 404,
  parent_other_manuscript: 404,
  would_cycle: 422,
  unknown_section: 404,
  empty_name: 422,
  /* Well-formed, and refused by the model: a division is a contiguous part of
     the Work. */
  would_split_division: 422,
  /* Refused by the current state rather than by the request. */
  unit_has_children: 409,
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const tree = await loadStructure(id, memberId);
  if (tree.status === 'refused') {
    return NextResponse.json({ refusal: tree.refusal }, { status: STATUS[tree.refusal] });
  }
  return NextResponse.json(tree.value);
}

type Gesture =
  | { gesture: 'create'; kind: string | null; title: string | null; parentId: string | null; index?: number }
  | { gesture: 'rename'; unitId: string; kind: string | null; title: string | null }
  | { gesture: 'move'; unitId: string; parentId: string | null; index: number }
  | { gesture: 'delete'; unitId: string }
  | { gesture: 'place'; unitId: string | null; fromSectionId: string; toSectionId: string };

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let body: Gesture;
  try {
    body = (await req.json()) as Gesture;
  } catch {
    return NextResponse.json({ refusal: 'malformed' }, { status: 400 });
  }

  const result = await (async () => {
    switch (body?.gesture) {
      case 'create':
        return createUnit(id, memberId, {
          kind: body.kind ?? null, title: body.title ?? null,
          parentId: body.parentId ?? null, index: body.index,
        });
      case 'rename':
        return renameUnit(id, memberId, body.unitId,
          { kind: body.kind ?? null, title: body.title ?? null });
      case 'move':
        return moveUnit(id, memberId, body.unitId,
          { parentId: body.parentId ?? null, index: body.index });
      case 'delete':
        return deleteUnit(id, memberId, body.unitId);
      case 'place':
        return placeSections(id, memberId, {
          unitId: body.unitId ?? null,
          fromSectionId: body.fromSectionId, toSectionId: body.toSectionId,
        });
      default:
        return null;
    }
  })();

  if (result === null) {
    return NextResponse.json({ refusal: 'unknown_gesture' }, { status: 400 });
  }
  if (result.status === 'refused') {
    return NextResponse.json({ refusal: result.refusal }, { status: STATUS[result.refusal] });
  }

  /* The tree as it now stands. Re-read rather than patched: the gesture may
     have renumbered siblings or moved a section out of another unit, and a
     client guessing at those is a client that drifts. */
  const tree = await loadStructure(id, memberId);
  if (tree.status === 'refused') {
    return NextResponse.json({ refusal: tree.refusal }, { status: STATUS[tree.refusal] });
  }
  return NextResponse.json(tree.value);
}
