import {NextRequest, NextResponse} from 'next/server';
import {getCurrentSession} from '@/lib/auth/serverSessions';
import {query} from '@/lib/db/postgres';
import {readHousePreferences} from '@/lib/house/preferencesStore';
import {canUseHouseStudioH1} from '@/lib/access/houseStudioH1Access';
import type {HomeViewPayload} from '@/lib/auth/homeViewPayload';

export const dynamic = 'force-dynamic';
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'Vary': 'Cookie, Origin',
};

/**
 * JSON, not RSC/SSR. Home and House never serialize a member's Work into
 * a page document. The verified HttpOnly session is the identity authority.
 *
 * Client reconciliation limits accidental cross-account UI presentation;
 * it cannot act as a cryptographic proof against scripts running in-origin.
 */
export async function POST(request:NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  let sameOrigin = false;
  try {
    const parsed = origin ? new URL(origin) : null;
    sameOrigin = !!parsed && !!host && parsed.host === host &&
      (process.env.NODE_ENV !== 'production' || parsed.protocol === 'https:');
  } catch { /* an invalid Origin is never admitted */ }
  if (!sameOrigin) return NextResponse.json({error:'Origin refused'}, {status:403, headers:PRIVATE_HEADERS});
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({error:'Session required'}, {status:401, headers:PRIVATE_HEADERS});

  let body:Record<string,unknown>;
  try {body=await request.json() as Record<string,unknown>;}
  catch {return NextResponse.json({error:'Invalid request'}, {status:400, headers:PRIVATE_HEADERS});}
  const destination=body.destination;
  if (destination !== 'home' && destination !== 'house') {
    return NextResponse.json({error:'Invalid destination'}, {status:400, headers:PRIVATE_HEADERS});
  }
  if (body.expectedMemberId !== session.memberId) {
    return NextResponse.json({error:'Identity mismatch'}, {status:409, headers:PRIVATE_HEADERS});
  }

  try {
    const result=await query<{id:string;name:string|null}>(
      'SELECT id, name FROM members WHERE id = $1',[session.memberId]);
    const member=result.rows[0];
    if (!member || member.id !== session.memberId) {
      return NextResponse.json({error:'Member unavailable'}, {status:403, headers:PRIVATE_HEADERS});
    }
    const works=await query<{id:string;title:string|null}>(
      'SELECT id, title FROM living_works WHERE member_id = $1 ORDER BY updated_at DESC LIMIT 2',
      [session.memberId]);
    const preferences=await readHousePreferences(session.memberId,query);
    const data:HomeViewPayload = {
      memberId:session.memberId,
      firstName:member.name?.trim().split(/\s+/)[0] || 'there',
      livingWorks:works.rows.map(w=>({id:w.id,title:w.title})),
      housePreferences:preferences,
      houseStudioH1Admitted:canUseHouseStudioH1(session.memberId),
    };
    return NextResponse.json(data,{headers:PRIVATE_HEADERS});
  } catch {
    // An unavailable database must not be reported as an empty Work.
    return NextResponse.json({error:'Private data unavailable'}, {status:503, headers:PRIVATE_HEADERS});
  }
}
