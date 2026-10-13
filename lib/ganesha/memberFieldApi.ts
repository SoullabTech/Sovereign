/** G2-3C shared Ganesha admission, not practitioner standing. */
import { NextRequest, NextResponse } from 'next/server';
import { resolveIndividualContext } from '@/lib/auth/individualContext';
import { memberNativeSchemaReady } from '@/lib/ganesha/memberFieldAuthoring';
import { isG2MemberAuthoringReleaseAdmitted } from '@/lib/ganesha/g2MemberAuthoringRelease';

export const PRIVATE_CACHE = { 'Cache-Control': 'private, no-store' };
export type MemberFieldAdmission =
  | { ok: true; memberId: string }
  | { ok: false; response: NextResponse };

export async function admitMemberField(request: NextRequest): Promise<MemberFieldAdmission> {
  const context = await resolveIndividualContext(request);
  if (!context) {
    return {ok:false,response:NextResponse.json(
      {error:'Sign in required'}, {status:401,headers:PRIVATE_CACHE},
    )};
  }
  if (!isG2MemberAuthoringReleaseAdmitted()) {
    // Even applying the proposed schema to a future environment must NOT
    // accidentally turn on member writes without accepted release authority.
    return {ok:false,response:NextResponse.json(
      {error:'Personal Field authoring is awaiting independent acceptance',
       state:'authorization_held'},
      {status:503,headers:PRIVATE_CACHE},
    )};
  }
  if (!(await memberNativeSchemaReady())) {
    // G2-3A was proposed but never installed. Never create a professional
    // compatibility row as a silent fallback just to satisfy a legacy FK.
    return {ok:false,response:NextResponse.json(
      {error:'Personal Field authoring is not yet available', state:'migration_held'},
      {status:503,headers:PRIVATE_CACHE},
    )};
  }
  return {ok:true,memberId:context.memberId};
}

export function fieldFailure(area: string): NextResponse {
  // Do not log raw driver errors, member-written content, or SQL params.
  console.error('[Ganesha member Field] Source unavailable', {area, failureKind:'query_failed'});
  return NextResponse.json(
    {error:'Personal Field temporarily unavailable'},
    {status:503,headers:PRIVATE_CACHE},
  );
}
export function fieldBadRequest(error: string): NextResponse {
  return NextResponse.json({error},{status:400,headers:PRIVATE_CACHE});
}
