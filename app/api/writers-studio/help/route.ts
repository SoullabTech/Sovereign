import { NextResponse, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
import { HELP_RELEASE } from '@/lib/writersStudio/help/catalogue';
import { parseHelpQuestion, currentHelpRelease, helpOriginAllowed } from '@/lib/writersStudio/help/request';
import { acquireHelpRequest, resolveHelpQuestion } from '@/lib/writersStudio/help/resolveQuestion';
export const dynamic='force-dynamic';
const headers={ 'Cache-Control':'private, no-store', 'X-Content-Type-Options':'nosniff' };
const response=(body:unknown,status=200)=>NextResponse.json(body,{status,headers});
const scope=(id:string)=>createHash('sha256').update('studio-help-session:'+id).digest('hex');
const enabled=()=>process.env.WRITERS_STUDIO_EDITORIAL_ENABLED==='1';

// Verifies identity without reading a Work or changing a session. No model call.
export async function GET(req:NextRequest) {
  try {
    const member=await getMemberIdFromRequest(req);
    if(!member) return response({release:HELP_RELEASE,canAsk:false},401);
    const access=enabled() && (await writersStudioBetaAccess(member)).eligible;
    return response({release:HELP_RELEASE,sessionScope:scope(member),canAsk:Boolean(access)});
  } catch { return response({release:HELP_RELEASE,canAsk:false},503); }
}

async function boundedBody(req:NextRequest):Promise<unknown> {
  if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return null;
  if(Number(req.headers.get('content-length') || 0)>8192) return null;
  const reader=req.body?.getReader(); if(!reader) return null;
  const chunks:Uint8Array[]=[]; let bytes=0;
  try { for(;;){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>8192){await reader.cancel();return null;}chunks.push(part.value);}
    const body=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.byteLength;}
    return JSON.parse(new TextDecoder().decode(body));
  } catch {return null;} finally {reader.releaseLock();}
}

export async function POST(req:NextRequest) {
  // Browser requests are same-origin; authenticated non-browser clients may omit Origin.
  if(!helpOriginAllowed(req.headers,req.url)) return response({refusal:'origin_mismatch'},403);
  try {
    const member=await getMemberIdFromRequest(req);
    if(!member) return response({refusal:'sign_in_required'},401);
    if(!enabled() || !(await writersStudioBetaAccess(member)).eligible) return response({refusal:'help_service_unavailable'},403);
    const parsed=parseHelpQuestion(await boundedBody(req));
    if(!parsed) return response({refusal:'invalid_help_question'},400);
    if(!currentHelpRelease(parsed.release)) return response({refusal:'guide_version_mismatch',release:HELP_RELEASE},409);
    if(parsed.sanctuary) return response({refusal:'use_local_guide'},409);
    const release=acquireHelpRequest(member);
    if(!release) return response({refusal:'request_already_running_or_limited'},429);
    try {
      const result=await resolveHelpQuestion(parsed);
      return result.ok
        ? response({release:HELP_RELEASE,sessionScope:scope(member),topicIds:result.ids,source:'maia_guide_match'})
        : response({refusal:'guide_match_unavailable',release:HELP_RELEASE},503);
    } finally {release();}
  } catch {return response({refusal:'guide_match_unavailable',release:HELP_RELEASE},503);}
}
