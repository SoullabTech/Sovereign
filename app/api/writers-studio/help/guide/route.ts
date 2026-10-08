import { NextResponse, type NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { writersStudioBetaAccess } from '@/lib/writersStudio/betaAccessServer';
export const dynamic='force-dynamic';
// Outside public/: the illustrated review PDFs contain the founder's example
// prose and are for the invited cohort, not an anonymous public download.
const guides={
  handbook: { file:path.join(process.cwd(),'data/writers-studio/help/handbook-review-0.9.pdf'),name:'Writers-Studio-Handbook-Review-0.9.pdf' },
  quick: { file:path.join(process.cwd(),'data/writers-studio/help/quick-start-review-0.9.pdf'),name:'Writers-Studio-Quick-Start-Review-0.9.pdf' },
};
export async function GET(req:NextRequest) {
  const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
  try {
    const member=await getMemberIdFromRequest(req);
    if(!member) return NextResponse.json({error:'sign_in_required'},{status:401,headers});
    if(!(await writersStudioBetaAccess(member)).eligible) return NextResponse.json({error:'not_in_pilot'},{status:403,headers});
    const key=req.nextUrl.searchParams.get('document');
    if(key!=='handbook' && key!=='quick') return NextResponse.json({error:'not_found'},{status:404,headers});
    const guide=guides[key],bytes=await readFile(guide.file);
    return new Response(new Uint8Array(bytes),{headers:{...headers,'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${guide.name}"`}});
  }catch{return NextResponse.json({error:'guide_unavailable'},{status:503,headers});}
}
