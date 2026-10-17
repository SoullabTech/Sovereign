/**
 * R77 — clinician report input, explicitly owned before any transcript read.
 *
 * getCompletedSessionData() is a legacy metadata-only helper. Do not
 * opportunistically widen that helper (it is used by other routes).
 * No model call, external transport, or member content logging in this module.
 */
import {query} from '@/lib/db/postgres';
import {verifySessionOwnership,isValidUUID}
 from '@/lib/scribe/scribeAuth';
import {loadReviewTurns,type TranscriptSegment}
 from '@/lib/scribe/sessionReviewMode';

export type R77OwnedReportData={
 sessionId:string;
 startTime:Date;endTime:Date;duration:number;
 sessionClosed:boolean;container:string;
 transcript:TranscriptSegment[];
 markers:Array<{markerType:string;note:string|null;tsMs:number|null}>;
 segmentCount:number;
};
export type R77ReadResult=
 |{ok:true;data:R77OwnedReportData}
 |{ok:false;status:403|404|422;reason:string};

const deny=(status:403|404|422,reason:string):R77ReadResult=>({
 ok:false,status,reason,
});
type MarkerRow={marker_type:string;note:string|null;marked_at:Date|string};

export async function loadOwnedScribeReportR77(
 sessionId:string,memberId:string,
):Promise<R77ReadResult>{
 if(!isValidUUID(sessionId)||!isValidUUID(memberId))
  return deny(404,'not_found');
 // The verified auth session supplies memberId; the user can never nominate it.
 const before=await verifySessionOwnership(sessionId,memberId);
 if(!before)return deny(404,'not_found');
 if(before.consent_status!=='confirmed')
  return deny(403,'consent_required');
 if(!before.transcript_enabled)
  return deny(403,'transcript_not_enabled');
 // No current authorized boundary permits exporting a sealed transcript to an
 // arbitrary remote provider. The existing LLMProvider may cloud-fallback even
 // with forceOllama=true, so model generation must refuse sealed sessions.
 if(before.memory_policy==='sealed')
  return deny(403,'sealed_session_external_model_unavailable');

 const loaded=await loadReviewTurns(sessionId);
 if(loaded.session.id!==sessionId)return deny(404,'not_found');
 const markers=await query<MarkerRow>(`
  SELECT m.marker_type,m.note,m.marked_at
    FROM scribe_markers m
    JOIN scribe_sessions s ON s.id=m.session_id
   WHERE s.id=$1 AND s.member_id=$2 AND s.consent_status='confirmed'
      AND s.transcript_enabled=TRUE
   ORDER BY m.marked_at ASC`,[sessionId,memberId]);
 // Re-check after transcript and markers are loaded, BEFORE any model call.
 const current=await verifySessionOwnership(sessionId,memberId);
 if(!current||current.consent_status!=='confirmed'||
  !current.transcript_enabled||current.memory_policy==='sealed')
  return deny(403,'consent_or_session_changed');
 if(!loaded.turns.length)return deny(422,'no_transcript_material');

 const startTime=before.started_at;
 const endTime=before.ended_at??new Date();
 const duration=Math.max(0,Math.round(
  (endTime.getTime()-startTime.getTime())/60000));
 return {ok:true,data:{
  sessionId,startTime,endTime,duration,
  sessionClosed:before.ended_at!==null,container:before.container,
  transcript:loaded.turns.map(turn=>({
   speaker:turn.speaker||'unknown',
   text:turn.text,startMs:turn.startMs,endMs:turn.startMs,
  })),
  markers:markers.rows.map(marker=>({
   markerType:marker.marker_type,note:marker.note??null,
   tsMs:marker.marked_at?
    new Date(marker.marked_at).getTime():null,
  })),
  segmentCount:loaded.turns.length,
 }};
}
