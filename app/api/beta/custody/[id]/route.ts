/**
 * Candidate post-withdrawal self-custody: download the latest stored writing,
 * or explicitly delete one member-owned manuscript using the existing
 * source-vault erasure service.
 *
 * Deliberately separate from MAIA, Studio sessions, and editorial APIs.
 * Exact member ID is sourced ONLY from verified server session.
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { eraseManuscript } from '@/lib/manuscript/source/eraseManuscript';
import {
  VALID_WORK_ID, authenticatedPostWithdrawalMember,
} from '@/lib/writersStudio/betaPostWithdrawalCustody';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const CACHE = { 'Cache-Control': 'no-store', 'X-Content-Type-Options':'nosniff' };
type RouteParams = { params: Promise<{id:string}> };
function refusal(code: number) {
  return NextResponse.json({error:'custody_unavailable'}, {status:code,headers:CACHE});
}
async function identify(request: NextRequest, params: RouteParams) {
  const id = (await params.params).id;
  if (!VALID_WORK_ID.test(id)) return {kind:'refused' as const,status:404};
  const candidate = await authenticatedPostWithdrawalMember(request);
  if (candidate.kind === 'refused') return candidate;
  return {kind:'allowed' as const, memberId:candidate.memberId, id};
}

export async function GET(request: NextRequest, params: RouteParams) {
  try {
    const access=await identify(request,params);
    if (access.kind==='refused') return refusal(access.status);
    const ms = await query<{ id:string; title:string|null; created_at:string }>(
      `SELECT id,title,created_at FROM member_manuscripts WHERE id=$1 AND member_id=$2`,
      [access.id,access.memberId],
    );
    if (!ms.rows.length) return refusal(404);
    // Return BOTH: stored latest whole draft and the durable source sections.
    // The draft is authoritative where edits exist; source preserves
    // original headings and text. No AI/rewriting/conversion is invoked.
    const [draft,sections]=await Promise.all([
      query<{content:string;version:string;updated_at:string}>(
        `SELECT content,version,updated_at
           FROM manuscript_working_drafts WHERE manuscript_id=$1 AND member_id=$2`,
        [access.id,access.memberId],
      ),
      query<{id:string;position:number;heading:string|null;body:string;heading_depth:number|null}>(
        `SELECT id,position,heading,body,heading_depth
           FROM manuscript_sections
          WHERE manuscript_id=$1 ORDER BY position ASC,id ASC`,
        [access.id],
      ),
    ]);
    return NextResponse.json({
      kind:'soullab.member-owned-writing-custody',
      schemaVersion:1,
      manuscript:ms.rows[0],
      currentDraft: draft.rows[0] ?? null,
      originalSections:sections.rows.map(s=>({
        id:s.id,position:s.position,heading:s.heading,headingDepth:s.heading_depth,body:s.body,
      })),
      // This is a portable text/data copy, not an original DOCX/PDF.
      originalFileIncluded:false,
      generatedAt:new Date().toISOString(),
    },{headers:CACHE});
  } catch {
    return refusal(503);
  }
}

export async function DELETE(request: NextRequest,params:RouteParams) {
  // Explicit, exact-site Origin is mandatory for irreversible deletion.
  if (request.headers.get('origin')!=='https://beta.soullab.life') return refusal(403);
  try {
    const access=await identify(request,params);
    if (access.kind==='refused') return refusal(access.status);
    let body:unknown;
    try { body=await request.json(); }
    catch {return refusal(400);}
    const data = body && typeof body==='object' && !Array.isArray(body)
      ? body as Record<string,unknown> : null;
    if (!data || Object.keys(data).sort().join(',')!=='confirmation,manuscriptId' ||
        data.manuscriptId!==access.id || data.confirmation!=='DELETE MY WRITING') {
      return refusal(400);
    }
    const outcome=await eraseManuscript(access.id,access.memberId);
    if (!outcome.ok) return refusal(outcome.refusal==='not_found'?404:409);
    if (!outcome.sweptAll) {
      return NextResponse.json({removed:true,originalBytesDestroyed:false,error:'custody_incomplete'},
        {status:503,headers:CACHE});
    }
    return NextResponse.json({removed:true,originalBytesDestroyed:true},
      {status:200,headers:CACHE});
  } catch {
    return refusal(503);
  }
}
