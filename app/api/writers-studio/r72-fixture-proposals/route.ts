/**
 * R72 isolated browser authoring fixture. NEVER promoted to production.
 * Requires session, exact Writer consent, member ownership, and same-origin.
 * Appends actual proposal_chains/proposal_versions as the member.
 * MAIA attribution is not fabricated by this door.
 */
import {NextRequest,NextResponse} from 'next/server';
import {getMemberIdFromRequest} from '@/lib/auth/getMemberFromRequest';
import {privateWriterNoStore} from '@/lib/writersStudio/release/privateWriterNoStore';
import {
 enabledR72,stageR72MemberProposals,recordR72ConsentRevoke,R72Refused,
} from '@/lib/writersStudio/recovery/r72MemberProposalConsent';
export const dynamic='force-dynamic';
const refusal=(reason:string,status=409)=>
 privateWriterNoStore(NextResponse.json(
 {kind:'refused',reason,releaseApproved:false},{status}));
const enabled=(req:NextRequest)=>
 process.env.NODE_ENV==='development'&&enabledR72()&&
 req.nextUrl.protocol==='http:'&&
 /^127\.0\.0\.1:\d+$/.test(req.headers.get('host')||'');
const only=(v:Record<string,unknown>,keys:string[])=>
 Object.keys(v).sort().join('|')===keys.sort().join('|');
export async function POST(req:NextRequest){
 if(!enabled(req))return new NextResponse(null,{status:404});
 if(req.headers.get('origin')!==`http://${req.headers.get('host')}`||
   req.headers.get('sec-fetch-site')==='cross-site'||
   req.headers.has('x-member-id')||
   !/^application\/json(?:;\s*charset=utf-8)?$/i.test(
    req.headers.get('content-type')||'')||
   req.nextUrl.searchParams.size!==0)
  return refusal('untrusted_origin',403);
 const memberId=await getMemberIdFromRequest(req);
 if(!memberId)return refusal('authentication_required',401);
 let data:Record<string,unknown>;
 try{
  const raw=await req.text();
  if(Buffer.byteLength(raw,'utf8')>4096)return refusal('request_too_large',413);
  const body:unknown=JSON.parse(raw);
  if(!body||Array.isArray(body)||typeof body!=='object')
   return refusal('invalid_json',400);
  data=body as Record<string,unknown>;
 }catch{return refusal('invalid_json',400);}
 try{
  if(data.kind==='stage_member_formulations'){
   if(!only(data,['kind','manuscriptId','sectionId','expectedGeneration',
    'selected','formulations']))return refusal('foreign_field',400);
   const selected=data.selected;
   if(!selected||typeof selected!=='object'||Array.isArray(selected)||
      !only(selected as Record<string,unknown>,['start','end','text'])||
      !Array.isArray(data.formulations)||
      !data.formulations.every(x=>typeof x==='string'))
    return refusal('invalid_member_formulations',400);
   const passage=selected as Record<string,unknown>;
   return privateWriterNoStore(NextResponse.json(
    await stageR72MemberProposals({
     memberId,manuscriptId:String(data.manuscriptId),
     sectionId:String(data.sectionId),
     generation:Number(data.expectedGeneration),
     selected:{start:Number(passage.start),end:Number(passage.end),
      text:String(passage.text)},
     formulations:data.formulations as string[],
    })));
  }
  if(data.kind==='revoke_fictional_writer_consent'){
   if(!only(data,['kind']))return refusal('foreign_field',400);
   return privateWriterNoStore(NextResponse.json(
    await recordR72ConsentRevoke(memberId)));
  }
  return refusal('unknown_action',400);
 }catch(err){
  if(err instanceof R72Refused)return refusal(err.reason,err.http);
  return refusal('fixture_unavailable',503);
 }
}
