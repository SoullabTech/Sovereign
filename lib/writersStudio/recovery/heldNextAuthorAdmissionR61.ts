/**
 * R61: UNMOUNTED, fictional-only NextRequest-shaped author admission handler.
 *
 * This is NOT an app/api route. R56 forbids live route imports until real
 * independent KMS/revocation/consent and manuscript service are qualified.
 * All results are HTTP 423; it never writes, grants access or opens prose.
 *
 * Real protected editing remains disabled pending independent KMS, durable
 * author intent, revocation and legacy-writer migration qualification.
 */
import {NextResponse,type NextRequest} from 'next/server';
import {
  readHeldRealSessionWorkR56,recheckHeldRealSessionWorkR56,
  R56_REAL_PROTECTED_WRITER_ENABLED,
} from '@/lib/writersStudio/recovery/heldRealSessionWorkAdmissionR56';

export const dynamic='force-dynamic';
export const R61_REAL_AUTHOR_POST_ENABLED=false as const;
export const R61_PROTOCOL='soullab.ws.r61.held-next-author-post.v1' as const;

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BYTES=512;
const HEADERS={
  'Cache-Control':'private, no-store, max-age=0',
  'Pragma':'no-cache',
  'Vary':'Cookie, Origin, x-session-token',
  'X-Content-Type-Options':'nosniff',
};
type Preflight={kind:'held_author_preflight';manuscriptId:string;selectedLivingWorkId:string};
function held(kind:string){
  return NextResponse.json({
    protocol:R61_PROTOCOL,kind,
    canSave:false,canApply:false,canUndo:false,
    writerAuthorized:false,releaseApproved:false,
  },{status:423,headers:HEADERS});
}
function fictionOnly(){
  return R61_REAL_AUTHOR_POST_ENABLED===false&&
    R56_REAL_PROTECTED_WRITER_ENABLED===false&&
    (process.env.NODE_ENV==='test'||process.env.NODE_ENV==='development')&&
    process.env.R61_HELD_AUTHOR_POST_FIXTURE==='fictional-only'&&
    process.env.R56_REAL_SESSION_WORK_FIXTURE==='fictional-only'&&
    process.env.WRITERS_STUDIO_RESTRICTED_BETA==='true'&&
    /^postgresql:\/\/fict@127\.0\.0\.1:\d+\/r35_draft$/.test(
      process.env.DATABASE_URL||'')&&
    /^\/.*\/ws-r35-physical-r5[67]-[^/]+\/vault$/.test(
      process.env.FILE_STORAGE_PATH||'');
}
/**
 * Only an exact small location envelope comes from the browser. The member,
 * chosen Work's ownership, current consent and head are checked in R56 SQL.
 * Text, key, review proposals and Apply tokens are not valid on this door.
 */
async function envelope(request:NextRequest):Promise<Preflight|null>{
  const contentLength=request.headers.get('content-length');
  const bytes=Number(contentLength);
  if(!contentLength||!Number.isSafeInteger(bytes)||
    bytes<=0||bytes>MAX_BYTES)return null;
  if(!/^application\/json(?:;\s*charset=utf-8)?$/i.test(
    request.headers.get('content-type')||''))return null;
  const stream=request.body;
  if(!stream)return null;
  const reader=stream.getReader();
  const decoder=new TextDecoder('utf-8',{fatal:true});
  let raw='',received=0;
  try{
    // A claimed small Content-Length cannot authorize an unlimited body.
    for(;;){
      const part=await reader.read();
      if(part.done)break;
      received+=part.value.byteLength;
      if(received>MAX_BYTES||received>bytes){
        await reader.cancel();
        return null;
      }
      raw+=decoder.decode(part.value,{stream:true});
    }
    if(received!==bytes)return null;
    raw+=decoder.decode();
    const value:unknown=JSON.parse(raw);
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const v=value as Record<string,unknown>;
    if(Object.keys(v).sort().join('|')!==
       'kind|manuscriptId|selectedLivingWorkId')return null;
    if(v.kind!=='held_author_preflight'||
      typeof v.manuscriptId!=='string'||
      typeof v.selectedLivingWorkId!=='string'||
      !UUID.test(v.manuscriptId)||!UUID.test(v.selectedLivingWorkId))return null;
    return v as Preflight;
  }catch{return null;}
  finally{reader.releaseLock();}
}
export async function inspectHeldFictionalAuthorPostR61(request:NextRequest){
  // This check is deliberately FIRST: production never examines user data.
  if(!fictionOnly())return held('unavailable');
  if(request.method!=='POST')return held('unavailable');
  // Apply and Undo MUST NOT be rerouted through a read-only preflight.
  if(request.headers.get('x-ws-author-intent')!=='review')
    return held('unavailable');
  const data=await envelope(request);
  if(!data)return held('unavailable');
  const first=await readHeldRealSessionWorkR56({
    request,manuscriptId:data.manuscriptId,
    selectedLivingWorkId:data.selectedLivingWorkId,intent:'review',
  });
  if(first.kind!=='held_private_session_and_work_witness')
    return held('unavailable');
  const second=await recheckHeldRealSessionWorkR56(first,request);
  if(second.kind!=='held_private_session_and_work_witness')
    return held('unavailable');
  // Fixture-only confirmation of two reads, never a write entitlement.
  return held('fictional_scope_rechecked_no_author_action');
}
