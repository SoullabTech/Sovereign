/**
 * G2-3D source-HELD Personal Field integration overview, for future
 * authorized members only. Current hard release gate always responds 503.
 * No member content is read without verified identity and G2-3A readiness.
 */
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { admitMemberField, fieldFailure, PRIVATE_CACHE } from '@/lib/ganesha/memberFieldApi';
import { readVerifiedPersonalField } from '@/lib/ganesha/personalFieldIntegration';

export async function GET(request:NextRequest) {
  try {
    const result=await admitMemberField(request);
    if(!result.ok) return result.response;
    const view=await readVerifiedPersonalField(result.context);
    return NextResponse.json(view,{headers:PRIVATE_CACHE});
  } catch {
    // Never disguise missing schema, incomplete history, or failed lookup
    // as a successful empty Personal Field.
    return fieldFailure('overview_read');
  }
}
