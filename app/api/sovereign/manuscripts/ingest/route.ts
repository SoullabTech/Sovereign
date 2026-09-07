// Production web requires force-dynamic for runtime database access / auth.
// Capacitor builds: API routes are moved aside by scripts/build-capacitor.sh
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 120; // large .docx/.pdf extraction can take a moment

/**
 * Soullab Press — Manuscript upload ingest (DOCX / PDF / TXT / MD → text).
 *
 * POST (multipart/form-data, field `file`) → { text, warnings, title, sourceArrivalId }
 *
 * The extracted text flows back into the member's own hands: it lands in the
 * upload textarea, the member reviews it, then proceeds through the existing
 * member-confirmed segmentation + save path in ../route.ts. The author's words
 * are carried through unchanged.
 *
 * WS-01 — this is also the ONLY moment the arrival itself exists.
 *
 * Downstream, the text passes through a member-editable textarea and a
 * member-editable confirm-cuts preview before anything is written, so nothing
 * the client sends later can be called "what arrived". So the artifact's exact
 * bytes and the extraction they produced are placed in custody HERE, before the
 * member can edit and before any segmentation runs. Custody is recorded even if
 * the member then abandons the import — an unclaimed arrival is an orphan row a
 * sweep can collect, which is strictly better than a false claim of custody.
 *
 * Member-scoped by credential — 401 without a verified session. No parameter
 * can name another member; nothing is written.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  checkAccess,
  hasRequiredRole,
  type AccessRule,
  type Role,
} from '@/config/accessMatrix';
import { deriveVerifiedAccess } from '@/lib/auth/verifiedAccess';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import {
  CLIENT_ASSERTABLE_IDENTITY_HEADERS,
  forgedIdentityHeaders,
} from '@/lib/auth/identityAssertions';
import { parseUpload, UnsupportedUploadError } from '@/lib/manuscript/ingest/parseUpload';
import { memberRef } from '@/lib/privacy/memberRef';
import { recordArtifactArrival } from '@/lib/manuscript/source/arrivals';

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB — generous for a full book file
const MAX_TEXT_CHARS = 2_000_000; // mirrors the save path's cap in ../route.ts

/**
 * INGEST-TRANSPORT — the authority boundary this route must carry itself.
 *
 * This is the one API path excluded from the middleware matcher, because
 * middleware buffers and rebuilds the request body and that destroys a
 * multipart upload (`Response body object should not be disturbed or locked`;
 * see the rationale at the end of middleware.ts). The exclusion buys transport
 * at the cost of the boundary: nothing upstream validates the session, applies
 * the access matrix, or strips the caller's identity assertions here.
 *
 * So the boundary is reproduced below, in the same order and with the same
 * semantics middleware uses — deliberately by CALLING the matrix rather than
 * restating today's answer. `/api/sovereign` currently carries `minTier: 'free'`
 * (rank 0, so the tier test is vacuous) and no role requirement. If that rule
 * later acquires a role or a higher tier, middleware would enforce it
 * everywhere and this route would be the single hole. Calling `checkAccess`
 * means the rule change reaches here too.
 *
 * The order matters and is not interchangeable:
 *
 *   1. REFUSE the names no real client sends. `x-member-id` is the only
 *      client-assertable header with a real sender behind it (`apiFetch` on
 *      iOS); every other name in the list — `x-maia-member-id` included — is
 *      middleware's own derived answer or a role/tier claim, and an inbound
 *      copy is always a forgery.
 *   2. AUTHORITY inspects the ORIGINAL request — `deriveVerifiedAccess` must
 *      still see `x-member-id` to catch a claim that disagrees with the
 *      session. Sanitising first would blind the impersonation check.
 *   3. IDENTITY through the ordinary gate. `getMemberIdFromRequest` accepts a
 *      NARROWER credential set than `deriveVerifiedAccess` — cookie and
 *      `x-session-token`, but not the `?_t=` query token. Custody is written
 *      under its answer, so this route cannot become the one upload path where
 *      a URL parameter authenticates a write.
 *   4. SANITISATION happens after all of that, IN PLACE on the same request —
 *      the caller's assertions may be inspected by the authority boundary, but
 *      they may not survive beyond it as ambient request context. A verified
 *      claim is still a claim: verification is a reason to admit it, never a
 *      reason to leave it standing.
 *   5. INGEST reads `formData()` from that same request. No second Request is
 *      constructed anywhere in this file: a copy is exactly the body-consuming
 *      move that made the exclusion necessary.
 */
const INGEST_PATHNAME = '/api/sovereign/manuscripts/ingest';

/** Correlation stamp, same shape and purpose as the middleware's `rid`. */
function requestId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Middleware's API denial semantics, reproduced for this path.
 *
 * Returns the refusal to send, or `null` when the denial is one middleware
 * itself waives (the development tier gate) and the request proceeds.
 *
 * The Capacitor page-load bypass is deliberately absent: middleware reaches it
 * only after `pathname.startsWith('/api/')` has already returned 401, so an API
 * route has no such branch to reproduce.
 */
function denialResponse(
  reason: string | undefined,
  rule: AccessRule | undefined,
  roles: Role[],
  rid: string,
): NextResponse | null {
  switch (reason) {
    case 'unauthenticated':
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required.', rid },
        { status: 401 },
      );

    case 'insufficient-tier':
      // Commercial tier gating stays disabled during development — but a role
      // requirement is orthogonal to it and is evaluated on its own first.
      if (rule?.rolesAnyOf && !hasRequiredRole(roles, rule.rolesAnyOf)) {
        console.warn(
          `[press/manuscripts/ingest] tier gate waived but ROLE still required (need: ${rule.rolesAnyOf.join('|')}) rid=${rid}`,
        );
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: 'You do not have permission to access this resource.',
            requiredRoles: rule.rolesAnyOf,
            rid,
          },
          { status: 403 },
        );
      }
      return null;

    case 'missing-role':
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to access this resource.',
          requiredRoles: rule?.rolesAnyOf,
          rid,
        },
        { status: 403 },
      );

    case 'no-rule-match':
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'This route is not configured in the access matrix.',
          pathname: INGEST_PATHNAME,
          rid,
        },
        { status: 404 },
      );

    default:
      return new NextResponse('Access Denied', { status: 403 });
  }
}

function titleFromFilename(filename: string): string {
  return filename.replace(/\.[a-z0-9]+$/i, '').trim();
}

export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ error: 'Not available in static build' }, { status: 501 });
  }
  try {
    const rid = requestId();

    // ── 1. REFUSE what no real client sends ────────────────────────────────
    // Refused rather than merely stripped, because these names carry
    // information: their presence is an attempt, and an attempt is worth a log
    // line and a closed door. The list is derived from the sanitisation list
    // minus the one name with a real sender, so it cannot drift from it.
    const forged = forgedIdentityHeaders(request.headers);
    if (forged.length > 0) {
      console.error(
        `[press/manuscripts/ingest] refused client-asserted identity headers: ${forged.join(', ')} rid=${rid}`,
      );
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required.', rid },
        { status: 401 },
      );
    }

    // ── 2. AUTHORITY — on the ORIGINAL request ─────────────────────────────
    // `deriveVerifiedAccess` validates the session token against
    // `auth_sessions` and reads tier/roles from the `members` row it names.
    // It also compares any `x-member-id` / `x-maia-member-id` claim against
    // that session and denies a mismatch as impersonation. That comparison is
    // why the caller's headers are still intact at this point.
    const verified = await deriveVerifiedAccess(request);

    if (!verified.authenticated && verified.reason && verified.reason !== 'no_credential') {
      // A credential was presented and REFUSED — a stolen, stale, or forged
      // token, or an identity claim that disagreed with the session.
      console.warn(
        `[press/manuscripts/ingest] credential refused (${verified.reason}) rid=${rid}`,
      );
    }

    const { allowed, reason, rule } = checkAccess(
      INGEST_PATHNAME,
      verified.tier,
      verified.roles,
      verified.authenticated,
    );

    if (!allowed) {
      const denial = denialResponse(reason, rule, verified.roles, rid);
      if (denial) return denial;
    }

    // ── 3. IDENTITY — the ordinary member gate, unchanged ──────────────────
    // The access matrix answers "may this caller in"; this answers "who is
    // this", and it is deliberately the SAME resolver every other member-scoped
    // route uses. Not `verified.memberId`: `deriveVerifiedAccess` also accepts
    // a `?_t=` query token, and adopting it here would quietly widen what
    // counts as a credential on an upload path. Narrower wins.
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required.', rid },
        { status: 401 },
      );
    }

    // Two resolvers, one predicate — they cannot honestly disagree. If they
    // ever do, something is wrong that no upload should proceed through.
    if (verified.memberId && verified.memberId !== memberId) {
      console.error(
        `[press/manuscripts/ingest] identity resolvers disagree — refusing rid=${rid}`,
      );
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required.', rid },
        { status: 401 },
      );
    }

    // ── 4. SANITISE — the SAME request, in place ───────────────────────────
    // Authority has finished inspecting the caller's claims, so nothing
    // downstream may see them. Deleting from `request.headers` mutates the
    // request Next.js already holds; it does not touch, read, or replace the
    // body, so `formData()` below still reads the original stream. A second
    // Request is NOT constructed — copying the body is the exact move that
    // forced this route out of the matcher.
    //
    // Verified rather than assumed: if a runtime ever seals these headers, the
    // deletions become no-ops and this route would go on serving with
    // attacker-controlled context in scope. So the absence is checked, and a
    // survivor is refused. An honest request carries none of these names
    // except `x-member-id` (apiFetch sends it on iOS), which has now been
    // checked against the session and deletes cleanly.
    for (const header of CLIENT_ASSERTABLE_IDENTITY_HEADERS) {
      try {
        request.headers.delete(header);
      } catch {
        // Fall through to the survivor check, which is the real test.
      }
    }
    const surviving = CLIENT_ASSERTABLE_IDENTITY_HEADERS.filter((h) =>
      request.headers.has(h),
    );
    if (surviving.length > 0) {
      console.error(
        `[press/manuscripts/ingest] client identity assertions survived sanitisation: ${surviving.join(', ')} rid=${rid}`,
      );
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required.', rid },
        { status: 401 },
      );
    }

    // ── 5. INGEST — the same request, body untouched until now ─────────────
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      // A throw here does NOT mean no file was chosen — the most common cause is
      // a body dropped in transit before it reached this handler (see
      // experimental.middlewareClientMaxBodySize in next.config.js). Saying
      // "expected a file" sent members looking for a mistake they had not made.
      // Stay neutral about the cause and name the one thing they can act on.
      return NextResponse.json(
        { error: 'The upload could not be read. Confirm the file is under 25 MB and try again.' },
        { status: 400 },
      );
    }

    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'File too large (25 MB max)' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let result;
    try {
      result = await parseUpload(buffer, file.name, file.type);
    } catch (err) {
      if (err instanceof UnsupportedUploadError) {
        return NextResponse.json({ error: err.message }, { status: 415 });
      }
      console.error('[press/manuscripts/ingest] parse error:', err);
      return NextResponse.json(
        { error: 'We could not read that file. Try a .docx, .pdf, .txt, or .md.' },
        { status: 422 },
      );
    }

    if (result.text.length > MAX_TEXT_CHARS) {
      return NextResponse.json({ error: 'Manuscript too large (2MB of text max)' }, { status: 413 });
    }

    // Log marker: counts only, never content.
    console.log(
      `[MAIA/press] manuscript ingest { memberRef: ${memberRef(memberId)}, ` +
        `format: ${result.format}, chars: ${result.text.length}, warnings: ${result.warnings.length} }`,
    );

    // Bytes into custody before anything interprets them. A failure here fails
    // the import: an arrival we could not preserve must not proceed as though
    // it had been (P0 — Source custody).
    let sourceArrivalId: string;
    try {
      const arrival = await recordArtifactArrival({
        memberId,
        bytes: buffer,
        originalFilename: file.name,
        mimeType: file.type || null,
        sourceText: result.text,
        extractor: result.format,
      });
      sourceArrivalId = arrival.id;
    } catch (err) {
      console.error('[press/manuscripts/ingest] source custody failed', err);
      return NextResponse.json(
        { error: 'We could not take custody of that file. Nothing was saved — please try again.' },
        { status: 500 },
      );
    }

    // Log marker: counts and provenance only, never content.
    console.log(
      `[MAIA/press] source custody { memberRef: ${memberRef(memberId)}, ` +
        `kind: artifact_extraction, bytes: ${buffer.byteLength}, chars: ${result.text.length} }`,
    );

    return NextResponse.json({
      text: result.text,
      warnings: result.warnings,
      title: titleFromFilename(file.name),
      format: result.format,
      sourceArrivalId,
    });
  } catch (err) {
    console.error('[press/manuscripts/ingest] POST error:', err);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
