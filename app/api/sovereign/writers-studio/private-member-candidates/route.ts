/**
 * R1P — authenticated private member alternative staging.
 * REVIEW CANDIDATE ONLY: public route is compile-time CLOSED with 404.
 * Do not activate until operational Work-key custody, shipping HTTPS,
 * owner-scoped consent, signed-in WebKit, recovery and founder beta GO.
 * This route never accepts MAIA/model identity or user-supplied Work keys,
 * and it has no Apply, Undo, Source or Draft write method.
 */
import {NextResponse,type NextRequest} from 'next/server';
import {privateWriterNoStore} from '@/lib/writersStudio/release/privateWriterNoStore';
import {serveHeldPrivateMemberCandidateR1P} from '@/lib/writersStudio/release/verifiedMemberCandidateRequestR1P';

export const runtime='nodejs';
export const dynamic='force-dynamic';

/** Entrypoint remains 404 before reading a session or even a request body. */
export async function POST(request:NextRequest){
  return serveHeldPrivateMemberCandidateR1P(request);
}

const notAvailable=()=>privateWriterNoStore(new NextResponse(null,{
  status:404,headers:{'Vary':'Cookie, Origin, x-session-token',
    'X-Content-Type-Options':'nosniff'},
}));
export async function GET(){return notAvailable();}
export async function PUT(){return notAvailable();}
export async function PATCH(){return notAvailable();}
export async function DELETE(){return notAvailable();}
