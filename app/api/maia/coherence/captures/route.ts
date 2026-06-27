import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { isMemberTester } from '@/lib/auth/tester';

export const dynamic = 'force-dynamic';

// MAIA Coherence Engine v0 — capture surface ("loose ends safely held").
// Doctrine: docs/canon/MAIA_COHERENCE_ENGINE_v0.md
//
// v0 contract: store the member's text VERBATIM with an OPTIONAL, member-chosen
// classification (absent → NULL = held, unsorted). No AI parsing, no calendar
// writes, no reminders. Releasing a capture is reversible. Member-scoped on every
// read and write, and gated to the tester cohort (labs.preview ⟸ members.tester).

const CLASSIFICATIONS = ['today', 'later', 'time_sensitive', 'ongoing'] as const;
type Classification = (typeof CLASSIFICATIONS)[number];

function isClassification(v: unknown): v is Classification {
  return typeof v === 'string' && (CLASSIFICATIONS as readonly string[]).includes(v);
}

const CAPTURE_COLUMNS = 'id, capture_text, classification, released_at, created_at';

// Tester cohort gate — the SERVER enforcement boundary (the page's <PreviewGate> is only
// the client UX gate). Resolves the member (x-member-id on iOS, cookies on web), then
// requires the labs.preview entitlement (members.tester). Returns the memberId, or a
// NextResponse error for the caller to return as-is.
async function requireTester(request: NextRequest): Promise<string | NextResponse> {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ error: 'Member ID required' }, { status: 401 });
  }
  if (!(await isMemberTester(memberId))) {
    return NextResponse.json({ error: 'Tester access required' }, { status: 403 });
  }
  return memberId;
}

// GET — list captures for the member. Held only by default; ?include=released for all.
export async function GET(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  const gated = await requireTester(request);
  if (gated instanceof NextResponse) return gated;
  const memberId = gated;

  const includeReleased = request.nextUrl.searchParams.get('include') === 'released';

  try {
    const result = await query(
      `SELECT ${CAPTURE_COLUMNS}
         FROM coherence_captures
        WHERE member_id = $1
          ${includeReleased ? '' : 'AND released_at IS NULL'}
        ORDER BY created_at DESC`,
      [memberId]
    );
    return NextResponse.json({ captures: result.rows });
  } catch (error) {
    console.error('[coherence/captures] GET failed:', error);
    return NextResponse.json({ error: 'Failed to load captures' }, { status: 500 });
  }
}

// POST — create a capture. Text stored verbatim; classification is OPTIONAL.
export async function POST(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  const gated = await requireTester(request);
  if (gated instanceof NextResponse) return gated;
  const memberId = gated;

  try {
    const body = await request.json().catch(() => ({}));
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    // Classification is OPTIONAL (Doctrine 6: capture is not commitment). Absent/empty
    // → NULL (held, unsorted). A provided value must be a known disposition.
    const rawClass = body?.classification;
    let classification: Classification | null = null;
    if (rawClass !== undefined && rawClass !== null && rawClass !== '') {
      if (!isClassification(rawClass)) {
        return NextResponse.json({ error: 'Invalid classification' }, { status: 400 });
      }
      classification = rawClass;
    }

    if (!text) {
      return NextResponse.json({ error: 'Capture text required' }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: 'Capture too long (2000 char max)' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO coherence_captures (member_id, capture_text, classification)
       VALUES ($1, $2, $3)
       RETURNING ${CAPTURE_COLUMNS}`,
      [memberId, text, classification]
    );
    return NextResponse.json({ capture: result.rows[0] });
  } catch (error) {
    console.error('[coherence/captures] POST failed:', error);
    return NextResponse.json({ error: 'Failed to save capture' }, { status: 500 });
  }
}

// PATCH — release a held capture (default), or restore one ({ released: false }). ?id=<uuid>
export async function PATCH(request: NextRequest) {
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }

  const gated = await requireTester(request);
  if (gated instanceof NextResponse) return gated;
  const memberId = gated;

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Capture id required' }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const release = body?.released !== false; // default: release

    const result = await query(
      `UPDATE coherence_captures
          SET released_at = ${release ? 'NOW()' : 'NULL'},
              updated_at = NOW()
        WHERE id = $1 AND member_id = $2
        RETURNING ${CAPTURE_COLUMNS}`,
      [id, memberId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Capture not found' }, { status: 404 });
    }
    return NextResponse.json({ capture: result.rows[0] });
  } catch (error) {
    console.error('[coherence/captures] PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update capture' }, { status: 500 });
  }
}
