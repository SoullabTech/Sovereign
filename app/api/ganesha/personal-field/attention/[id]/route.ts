/** G2-3C: reposition personal Attention without reassigning ownership. */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { admitMemberField, PRIVATE_CACHE, fieldFailure, fieldBadRequest } from '@/lib/ganesha/memberFieldApi';
import {fieldsMatch,isPlainObject,UUID_RE,VALID_FIELDS,
  MEMBER_ATTENTION_MOVE_SQL} from '@/lib/ganesha/memberFieldAuthoring';
export async function PATCH(req:NextRequest,ctx:{params:Promise<{id:string}>}) {
  try {
    const access=await admitMemberField(req);
    if(!access.ok) return access.response;
    const {id}=await ctx.params;
    if(!UUID_RE.test(id))
      return NextResponse.json({error:'Not found'},{status:404,headers:PRIVATE_CACHE});
    const body:unknown=await req.json().catch(()=>null);
    if(!isPlainObject(body) || !fieldsMatch(body,['field','position']) ||
       !('field' in body || 'position' in body))
      return fieldBadRequest('Only field and authored position can change');
    const field=body.field===undefined?null:body.field;
    const position=body.position===undefined?null:body.position;
    if(field!==null && (typeof field!=='string' || !VALID_FIELDS.has(field)))
      return fieldBadRequest('Invalid personal field');
    if(position!==null && (typeof position!=='number' || !Number.isSafeInteger(position) ||
        position < -100000 || position > 100000))
      return fieldBadRequest('Invalid authored position');
    const r=await query(MEMBER_ATTENTION_MOVE_SQL,[access.memberId,id,field,position]);
    if(r.rows.length!==1)
      return NextResponse.json({error:'Not found'},{status:404,headers:PRIVATE_CACHE});
    return NextResponse.json(
      {id:r.rows[0].id,field:r.rows[0].field,position:r.rows[0].position},
      {headers:PRIVATE_CACHE},
    );
  } catch {return fieldFailure('attention_reposition');}
}
