/**
 * R71 LOCAL-FICTIONAL AUTHOR ROUTE.
 * Deliberately unreachable in production, on a real database or over LAN.
 * Do not turn on the older WRITERS_STUDIO_EDITORIAL_ENABLED switch.
 */
import {NextRequest,NextResponse} from 'next/server';
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {privateWriterNoStore} from '@/lib/writersStudio/release/privateWriterNoStore';
import {
 prepareR71,applyR71,prepareUndoR71,undoR71,readR71,
 R71Refused,R71_PRODUCTION_ENABLED,
} from '@/lib/writersStudio/recovery/r71FictionalCanonicalEditorial';
import {R72Refused} from '@/lib/writersStudio/recovery/r72MemberProposalConsent';
export const dynamic='force-dynamic';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const db=/^postgresql:\/\/fict@127\.0\.0\.1:\d+\/ws_atomic$/;
const refusal=(reason:string,status=409)=>privateWriterNoStore(NextResponse.json({
 kind:'refused',reason,releaseApproved:false,
},{status}));
const enabled=(r:NextRequest)=>
 R71_PRODUCTION_ENABLED===false &&
 process.env.NODE_ENV==='development' &&
 process.env.R71_AUTHOR_EDITORIAL_FIXTURE==='fictional-only' &&
 process.env.NEXT_PUBLIC_R71_AUTHOR_EDITORIAL_FIXTURE==='fictional-only' &&
 db.test(process.env.DATABASE_URL||'') &&
 r.nextUrl.protocol==='http:' &&
 /^127\.0\.0\.1:\d+$/.test(r.headers.get('host')||'');
const closed=(b:Record<string,unknown>,keys:string[]) =>
 Object.keys(b).sort().join('|')===keys.sort().join('|');
function failure(err:unknown){
 if(err instanceof R71Refused||err instanceof R72Refused)
  return refusal(err.reason,err.http);
 // No prose/credentials in the error response.
 return refusal('fixture_backend_unavailable',503);
}
export async function GET(req:NextRequest){
 if(!enabled(req))return new NextResponse(null,{status:404});
 const memberId=await getMemberIdFromRequest(req);
 if(!memberId)return refusal('authentication_required',401);
 const manuscriptId=req.nextUrl.searchParams.get('manuscriptId')||'';
 const mode=req.nextUrl.searchParams.get('mode');
 if(!UUID.test(manuscriptId)||(mode!=='state'&&mode!=='reopen')||
    [...req.nextUrl.searchParams.keys()].some(k=>k!=='mode'&&k!=='manuscriptId'))
  return refusal('invalid_read_request',400);
 try{return privateWriterNoStore(NextResponse.json(
   await readR71(memberId,manuscriptId,mode)));}
 catch(err){return failure(err);}
}
export async function POST(req:NextRequest){
 if(!enabled(req))return new NextResponse(null,{status:404});
 // Browser same-origin gesture only. Native cross-origin policy NOT opened.
 // Next dev rewrites nextUrl.hostname to localhost, but preserves the
 // original bound IPv4 loopback Host. Use that exact validated Host for CSRF.
 if(req.headers.get('origin')!==`http://${req.headers.get('host')}` ||
   !/^application\/json(?:;\s*charset=utf-8)?$/i.test(
    req.headers.get('content-type')||'') ||
   req.headers.get('sec-fetch-site')==='cross-site' ||
   req.headers.has('x-member-id') ||
   req.nextUrl.searchParams.size!==0)return refusal('untrusted_origin',403);
 const memberId=await getMemberIdFromRequest(req);
 if(!memberId)return refusal('authentication_required',401);
 let data:Record<string,unknown>;
 try{
  const raw=await req.text();
  if(Buffer.byteLength(raw,'utf8')>4096)return refusal('request_too_large',413);
  const parsed:unknown=JSON.parse(raw);
  if(!parsed||Array.isArray(parsed)||typeof parsed!=='object')
   return refusal('invalid_json',400);
  data=parsed as Record<string,unknown>;
 }catch{return refusal('invalid_json',400);}
 if(!UUID.test(String(data.manuscriptId||'')))
  return refusal('invalid_manuscript_id',400);
 const manuscriptId=String(data.manuscriptId);
 try{
  switch(data.kind){
  case 'review_exact_passage':{
   if(!closed(data,['kind','manuscriptId','expectedGeneration','sectionId',
     'selected','chosenAlternativeId']))return refusal('foreign_field',400);
   const selection=data.selected as {start?:unknown;end?:unknown;text?:unknown}|null;
   if(!selection||typeof selection!=='object'||
      !closed(selection as Record<string,unknown>,['start','end','text'])||
      typeof selection.text!=='string')
     return refusal('invalid_selection',400);
   return privateWriterNoStore(NextResponse.json(await prepareR71({
    memberId,manuscriptId,sectionId:String(data.sectionId),
    generation:Number(data.expectedGeneration),
    selection:{start:Number(selection.start),end:Number(selection.end),
     text:selection.text},alternativeId:String(data.chosenAlternativeId),
   })));
  }
  case 'apply_reviewed_change':
   if(!closed(data,['kind','manuscriptId','opaqueToken']))
    return refusal('foreign_field',400);
   return privateWriterNoStore(NextResponse.json(
    await applyR71(memberId,manuscriptId,String(data.opaqueToken))));
  case 'review_last_apply_for_undo':
   if(!closed(data,['kind','manuscriptId']))return refusal('foreign_field',400);
   return privateWriterNoStore(NextResponse.json(
    await prepareUndoR71(memberId,manuscriptId)));
  case 'undo_reviewed_change':
   if(!closed(data,['kind','manuscriptId','opaqueToken']))
    return refusal('foreign_field',400);
   return privateWriterNoStore(NextResponse.json(
    await undoR71(memberId,manuscriptId,String(data.opaqueToken))));
  default:return refusal('invalid_action',400);
  }
 }catch(err){return failure(err);}
}
