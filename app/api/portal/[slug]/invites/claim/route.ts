/**
 * RETIRED — DUPLICATE PORTAL CLAIM
 *
 * PRACTITIONER-OFFER-01 · A3-R3-R1 — Canonical Claim & Slug Binding.
 *
 * This route previously consumed invites and created portal credentials. It is retired
 * because it could not establish slug ownership: it destructured `{ params }` and never
 * read `slug`, so it was slug-blind by construction. It also issued its credential
 * update and its invite update as two independent statements outside any transaction, so
 * a failure between them left credentials set against an unconsumed invite.
 *
 * The sole claim authority is now `POST /api/portal/[slug]/claim`.
 *
 * This handler is kept as an explicit, non-claiming refusal rather than deleted so that a
 * client still holding an old link receives a clear answer instead of a 404 from the
 * framework. It reads no invite, touches no credential, and mints no session — there is
 * no claim capability left here to reach.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'retired_endpoint',
      message: 'This claim link is no longer in use. Please reopen your invitation link.',
    },
    { status: 410 }
  );
}
