export const dynamic='force-dynamic';
import {NextRequest,NextResponse} from 'next/server';
import db from '@/lib/db/postgres';
import {getCurrentPractitioner} from '@/lib/auth/getCurrentPractitioner';
import {decideStoredEncounterConsent} from '@/lib/encounters/consentLedgerStore';
import {mintThresholdToken} from '@/lib/encounters/threshold';
async function loadOwnedEncounter(encounterId:string,practitionerId:string){
 const result=await db.query(`SELECT id,title,status,consent_agreement_version,consent_generation
   FROM encounters WHERE id=$1 AND practitioner_id=$2`,[encounterId,practitionerId]);
 return result.rows[0]??null;
}
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;const identity=await getCurrentPractitioner(request);
  if(!identity)return NextResponse.json({error:'Unauthorized'},{status:401});
  const encounter=await loadOwnedEncounter(id,identity.practitionerId);
  if(!encounter)return NextResponse.json({error:'Encounter not found'},{status:404});
  const participants=await db.query(`SELECT id,display_name,role FROM encounter_participants
    WHERE encounter_id=$1 ORDER BY created_at`,[id]);
  if(!participants.rows.length)return NextResponse.json({error:'Encounter has no participants'},{status:400});
  const links=participants.rows.map(p=>({participantId:p.id,displayName:p.display_name,role:p.role,
    agreementVersion:encounter.consent_agreement_version,generation:encounter.consent_generation,
    thresholdPath:`/open/threshold/${mintThresholdToken(id,p.id,encounter.consent_agreement_version,encounter.consent_generation)}`}));
  return NextResponse.json({encounterId:id,title:encounter.title,agreementVersion:encounter.consent_agreement_version,
    generation:encounter.consent_generation,links});
 }catch(error){console.error('[Threshold] POST error:',error instanceof Error?error.name:'unknown');
  return NextResponse.json({error:'Failed to mint threshold links'},{status:500});}
}
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;const identity=await getCurrentPractitioner(request);
  if(!identity)return NextResponse.json({error:'Unauthorized'},{status:401});
  const encounter=await loadOwnedEncounter(id,identity.practitionerId);
  if(!encounter)return NextResponse.json({error:'Encounter not found'},{status:404});
  const participants=await db.query(`SELECT id,display_name,role FROM encounter_participants
    WHERE encounter_id=$1 ORDER BY created_at`,[id]);
  const rows=await Promise.all(participants.rows.map(async p=>{
    const base={encounterId:id,participantId:p.id,agreementVersion:encounter.consent_agreement_version,
      generation:Number(encounter.consent_generation)};
    const [join,record]=await Promise.all([
      decideStoredEncounterConsent({...base,purpose:'join'}),
      decideStoredEncounterConsent({...base,purpose:'record_audio'}),
    ]);
    return {participantId:p.id,displayName:p.display_name,role:p.role,joined:join.allowed,
      joinDecision:join.reason,recordConsented:record.allowed,recordDecision:record.reason};
  }));
  return NextResponse.json({encounterId:id,title:encounter.title,
    agreementVersion:encounter.consent_agreement_version,generation:encounter.consent_generation,
    participants:rows,allJoined:rows.length>0&&rows.every(r=>r.joined),
    allRecordConsented:rows.length>0&&rows.every(r=>r.recordConsented)});
 }catch(error){console.error('[Threshold] GET error:',error instanceof Error?error.name:'unknown');
  return NextResponse.json({error:'Failed to load threshold status'},{status:500});}
}
