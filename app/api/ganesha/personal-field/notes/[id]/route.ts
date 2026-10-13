/** G2-3C: only owner-scoped corrections to member-native Notes. No erasure lane. */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { admitMemberField, PRIVATE_CACHE, fieldFailure, fieldBadRequest } from '@/lib/ganesha/memberFieldApi';
import { fieldsMatch, isPlainObject, UUID_RE, VALID_SECTIONS,
  MEMBER_NOTES_UPDATE_SQL } from '@/lib/ganesha/memberFieldAuthoring';

export async function PATCH(req:NextRequest,ctx:{params:Promise<{id:string}>}) {
  try {
    const access=await admitMemberField(req);
    if(!access.ok) return access.response;
    const {id}=await ctx.params;
    if(!UUID_RE.test(id))
      return NextResponse.json({error:'Not found'},{status:404,headers:PRIVATE_CACHE});
    const body:unknown=await req.json().catch(()=>null);
    if(!isPlainObject(body) || !fieldsMatch(body,['section','body']) ||
       !('section' in body || 'body' in body)) return fieldBadRequest('Invalid note revision');
    const section=body.section===undefined?null:body.section;
    const authored=body.body===undefined?null:
      typeof body.body==='string'?body.body.trim():null;
    if(section!==null && (typeof section!=='string' || !VALID_SECTIONS.has(section)))
      return fieldBadRequest('Invalid personal section');
    if('body' in body && (!authored || authored.length>2000))
      return fieldBadRequest('Note must be between 1 and 2000 characters');
    const r=await query(MEMBER_NOTES_UPDATE_SQL,[access.memberId,id,section,authored]);
    if(r.rows.length!==1)
      return NextResponse.json({error:'Not found'},{status:404,headers:PRIVATE_CACHE});
    const row=r.rows[0];
    return NextResponse.json(
      {id:row.id,section:row.section,body:row.body,createdAt:row.created_at},
      {headers:PRIVATE_CACHE},
    );
  } catch {return fieldFailure('notes_revise');}
}
