import { NextResponse, type NextRequest } from 'next/server';
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import { saveCraftVersion, savedCraftVersions } from '@/lib/manuscript/editorialRuntime/craftSave';
import { parseCraftSaveRequest } from '@/lib/writersStudio/craftSaveContractR1';

export const dynamic = 'force-dynamic';
const enabled = () => process.env.WRITERS_STUDIO_EDITORIAL_ENABLED === '1';

export async function POST(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  let raw: unknown;
  try { raw = await request.json(); }
  catch { return NextResponse.json({ error: 'invalid_body', persisted: false }, { status: 400 }); }
  const parsed = parseCraftSaveRequest(raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.reason, persisted: false }, {
    status: parsed.reason === 'sanctuary_unavailable' ? 409 : 400,
  });
  try {
    const result = await saveCraftVersion(identity, parsed.value);
    if (!result.ok) return NextResponse.json({ error: result.reason, persisted: false }, {
      status: result.reason === 'thread_not_found' || result.reason === 'section_not_found' ? 404 : 409,
    });
    return NextResponse.json({ threadId: result.threadId, versionId: result.versionId }, { status: 201 });
  } catch {
    // Do not echo the request or infer whether a lost commit acknowledgement persisted.
    return NextResponse.json({ error: 'save_unconfirmed' }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  if (!enabled()) return new NextResponse(null, { status: 404 });
  const identity = await resolveCanonicalIdentity(request);
  if (identity.status !== 'verified') return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const manuscriptId = request.nextUrl.searchParams.get('manuscriptId');
  if (!manuscriptId || !/^[0-9a-f-]{36}$/i.test(manuscriptId)) return NextResponse.json({ error: 'manuscript_required' }, { status: 400 });
  try { return NextResponse.json({ versions: await savedCraftVersions(identity, manuscriptId) }); }
  catch { return NextResponse.json({ error: 'saved_versions_unavailable' }, { status: 503 }); }
}
