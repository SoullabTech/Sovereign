/** G2-3C: member's own newly authored Field notes; no practitioner, client or team. */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { admitMemberField, PRIVATE_CACHE, fieldFailure, fieldBadRequest } from '@/lib/ganesha/memberFieldApi';
import {
  fieldsMatch, isPlainObject, READ_LIMIT, VALID_SECTIONS,
  MEMBER_NOTES_CREATE_SQL, MEMBER_NOTES_READ_SQL,
} from '@/lib/ganesha/memberFieldAuthoring';

const mapped=(r:Record<string,unknown>)=>({
  id:r.id, section:r.section, body:r.body, createdAt:r.created_at,
});
export async function GET(req:NextRequest) {
  try {
    const access=await admitMemberField(req);
    if(!access.ok) return access.response;
    const result=await query(MEMBER_NOTES_READ_SQL,[access.memberId,READ_LIMIT]);
    return NextResponse.json(
      {owner:'member', scope:'personal', notes:result.rows.map(mapped),limit:READ_LIMIT,
       coverage:'member_native_only'},
      {headers:PRIVATE_CACHE},
    );
  } catch {return fieldFailure('notes_read');}
}
export async function POST(req:NextRequest) {
  try {
    const access=await admitMemberField(req);
    if(!access.ok) return access.response;
    const body:unknown=await req.json().catch(()=>null);
    if(!isPlainObject(body) || !fieldsMatch(body,['section','body'])) {
      return fieldBadRequest('Only a personal section and note body are accepted');
    }
    const section=body.section;
    const authored=typeof body.body==='string'?body.body.trim():null;
    if(typeof section!=='string' || !VALID_SECTIONS.has(section))
      return fieldBadRequest('Invalid personal section');
    if(!authored || authored.length>2000)
      return fieldBadRequest('Note must be between 1 and 2000 characters');
    const result=await query(MEMBER_NOTES_CREATE_SQL,[access.memberId,section,authored]);
    if(result.rows.length!==1)
      return NextResponse.json({error:'Account unavailable'},{status:403,headers:PRIVATE_CACHE});
    return NextResponse.json(mapped(result.rows[0]),{status:201,headers:PRIVATE_CACHE});
  } catch {return fieldFailure('notes_author');}
}
