/** G2-3C: explicit personal Attention placement, never professional inference. */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { admitMemberField, PRIVATE_CACHE, fieldFailure, fieldBadRequest } from '@/lib/ganesha/memberFieldApi';
import {
  fieldsMatch, isPlainObject, READ_LIMIT, UUID_RE, VALID_FIELDS, VALID_KINDS,
  MEMBER_ATTENTION_CREATE_SQL, MEMBER_ATTENTION_READ_SQL, MEMBER_ATTENTION_POSITION_SQL,
} from '@/lib/ganesha/memberFieldAuthoring';

type AttentionRow={
  id:string; field:string; kind:string; position:number;
  safe_ref_id:string|null; resolved:string|null; gone:boolean;
  created_at:string|Date;
};
const view=(r:AttentionRow)=>({
  id:r.id, field:r.field, kind:r.kind,
  // Cached source titles are never displayed when ownership is withdrawn.
  label:r.gone?'Reference unavailable':r.resolved,
  refId:r.gone?null:r.safe_ref_id,
  position:r.position, gone:Boolean(r.gone), createdAt:r.created_at,
});
export async function GET(req:NextRequest) {
  try {
    const access=await admitMemberField(req);
    if(!access.ok) return access.response;
    const r=await query<AttentionRow>(MEMBER_ATTENTION_READ_SQL,[access.memberId,READ_LIMIT]);
    return NextResponse.json(
      {owner:'member',scope:'personal',attention:r.rows.map(view),
       limit:READ_LIMIT,coverage:'member_native_only'},
      {headers:PRIVATE_CACHE},
    );
  } catch {return fieldFailure('attention_read');}
}
export async function POST(req:NextRequest) {
  try {
    const access=await admitMemberField(req);
    if(!access.ok) return access.response;
    const body:unknown=await req.json().catch(()=>null);
    if(!isPlainObject(body) || !fieldsMatch(body,['field','kind','refId','label']))
      return fieldBadRequest('Only personal Attention placement fields are accepted');
    const field=body.field;
    const kind=body.kind;
    if(typeof field!=='string' || !VALID_FIELDS.has(field))
      return fieldBadRequest('Invalid personal field');
    if(typeof kind!=='string' || !VALID_KINDS.has(kind))
      return fieldBadRequest('Invalid placement type');
    const isNote=kind==='note';
    const refId=body.refId===undefined?null:body.refId;
    if(isNote && refId!==null)
      return fieldBadRequest('Authored notes do not carry a source reference');
    if(!isNote && (typeof refId!=='string' || !UUID_RE.test(refId)))
      return fieldBadRequest('Personal source reference required');
    if(!isNote && 'label' in body)
      return fieldBadRequest('Referenced titles are resolved from their actual owners');
    const label=isNote && typeof body.label==='string'?body.label.trim():null;
    if(isNote && (!label || label.length>500))
      return fieldBadRequest('Authored label must be between 1 and 500 characters');
    const p=await query<{pos:number}>(MEMBER_ATTENTION_POSITION_SQL,[access.memberId,field]);
    if(p.rows.length!==1 || !Number.isSafeInteger(Number(p.rows[0].pos)))
      return fieldFailure('attention_position');
    const r=await query(MEMBER_ATTENTION_CREATE_SQL,[
      access.memberId,field,kind,refId,label,Number(p.rows[0].pos),
    ]);
    if(r.rows.length!==1)
      return NextResponse.json({error:'Personal reference unavailable'},
        {status:404,headers:PRIVATE_CACHE});
    const row=r.rows[0];
    return NextResponse.json({
      id:row.id,field:row.field,kind:row.kind,
      label:row.label,refId:row.ref_id,position:row.position,
      gone:false,createdAt:row.created_at,
    },{status:201,headers:PRIVATE_CACHE});
  } catch(e:unknown) {
    if(e && typeof e==='object' && 'code' in e &&
       (e as {code?:string}).code==='23505') {
      return NextResponse.json(
        {error:'Already placed in this personal field'},
        {status:409,headers:PRIVATE_CACHE},
      );
    }
    return fieldFailure('attention_author');
  }
}
