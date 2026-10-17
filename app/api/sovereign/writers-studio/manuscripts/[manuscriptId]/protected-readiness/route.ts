/**
 * Actual Next.js member + legacy manuscript ownership READINESS door.
 *
 * READ-ONLY and ALWAYS HOLD: this is not Source/Draft access, author-click
 * witnessing, an encrypted Apply/Undo service, KMS grant, or beta admission.
 * A future release MUST still independently fence all old writer paths.
 */
import {NextResponse,type NextRequest} from 'next/server';
import {
 verifyWriterReadinessScope,WS_PROTECTED_READINESS_PROTOCOL,
 WS_REAL_PROTECTED_MEMBER_WRITES_ENABLED,
} from '@/lib/writersStudio/release/verifyWriterReadinessScope';

export const dynamic='force-dynamic';
const HEADERS={
 'Cache-Control':'private, no-store, max-age=0',
 'Pragma':'no-cache',
 'Vary':'Cookie, x-session-token',
 'X-Content-Type-Options':'nosniff',
};
const response=(status:number,kind:string)=>NextResponse.json({
 protocol:WS_PROTECTED_READINESS_PROTOCOL,
 kind,releaseApproved:false,
},{status,headers:HEADERS});

export async function GET(request:NextRequest,
 ctx:{params:Promise<{manuscriptId:string}>}){
 let manuscriptId:string;
 try{manuscriptId=(await ctx.params).manuscriptId;}
 catch{return response(400,'invalid_manuscript_scope');}
 const scope=await verifyWriterReadinessScope(request,manuscriptId);
 if(scope.kind==='refused'){
  // Never reveal another person's manuscript existence, tester membership
  // or consent details through a public error body.
  const kind=scope.status===401?'authentication_required':
   scope.status===503?'readiness_unavailable':
   scope.status===400?'invalid_request':'not_found';
  return response(scope.status,kind);
 }
 // Ownership of a *legacy* manuscript does not prove encrypted custody.
 // No feature flag, role, user-selected token, or local source test can
 // promote this status into permission to write.
 if(WS_REAL_PROTECTED_MEMBER_WRITES_ENABLED!==false)
  return response(503,'independent_custody_not_certified');
 return NextResponse.json({
  protocol:WS_PROTECTED_READINESS_PROTOCOL,
  kind:'protected_writer_not_yet_qualified',
  scope:'legacy_manuscript_owner_verified_only',
  canImport:false,canSave:false,canApply:false,canUndo:false,
  encryptedWorkVerified:false,releaseApproved:false,
 },{status:423,headers:HEADERS});
}

// This is intentionally not an editorial action endpoint.
export async function POST(){return response(405,'read_only_endpoint');}
export async function PUT(){return response(405,'read_only_endpoint');}
export async function PATCH(){return response(405,'read_only_endpoint');}
export async function DELETE(){return response(405,'read_only_endpoint');}
