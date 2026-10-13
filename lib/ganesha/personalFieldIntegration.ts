/**
 * G2-3D: Individual Personal Field integration.
 *
 * No route is released, and no Professional Studio identity confers access.
 * Data reaches this view only after each SQL statement independently checks
 * the authenticated member and, where needed, an unambiguous active legacy
 * Personal Studio reference owned by that member.
 */
import { query } from '@/lib/db/postgres';
import type { IndividualContext } from '@/lib/auth/individualContext';
import { readPersonalFieldContinuity } from '@/lib/ganesha/personalFieldContinuity';
import { MEMBER_NOTES_READ_SQL, MEMBER_ATTENTION_READ_SQL } from '@/lib/ganesha/memberFieldAuthoring';

const LIMIT = 25;
type Source = 'member-native'|'historical-personal';
type Timestamp = string | Date;
type Base = { id:string; createdAt:Timestamp };
type Note = Base & {section:string; body:string};
type Event = Base & {title:string; eventAt:Timestamp};
type Person = Base & {name:string; note:string|null};
type Attention = Base & {field:string; kind:string; label:string|null; gone?:boolean; position?:number};

export const PERSONAL_FIELD_4_TABLE_CAPABILITY_SQL = `
WITH t AS (
 SELECT ARRAY[
   to_regclass('public.field_notes'),
   to_regclass('public.field_attention'),
   to_regclass('public.field_events'),
   to_regclass('public.field_people')
 ] AS relations
)
SELECT (
  array_position(relations, NULL::regclass) IS NULL
  AND (SELECT COUNT(*) FROM pg_attribute a
       WHERE a.attrelid = ANY(relations)
         AND a.attname = 'personal_member_id'
         AND NOT a.attisdropped) = 4
  AND (SELECT COUNT(*) FROM pg_attribute a
       WHERE a.attrelid = ANY(relations)
         AND a.attname = 'practitioner_id'
         AND NOT a.attisdropped AND NOT a.attnotnull) = 4
  AND (SELECT COUNT(*) FROM pg_constraint c
       WHERE c.conrelid = ANY(relations)
         AND c.conname IN (
           'field_notes_personal_member_fk','field_attention_personal_member_fk',
           'field_events_personal_member_fk','field_people_personal_member_fk'
         ) AND c.contype = 'f') = 4
  AND (SELECT COUNT(*) FROM pg_constraint c
       WHERE c.conrelid = ANY(relations)
         AND c.conname IN (
           'field_notes_exactly_one_owner_ck','field_attention_exactly_one_owner_ck',
           'field_events_exactly_one_owner_ck','field_people_exactly_one_owner_ck'
         ) AND c.contype = 'c') = 4
) AS ready FROM t`;

export const NATIVE_EVENTS_SQL = `
 SELECT e.id, e.title, e.event_at, e.created_at
   FROM field_events e
  WHERE e.personal_member_id = $1::uuid
    AND e.practitioner_id IS NULL AND e.team_id IS NULL
  ORDER BY e.event_at ASC, e.id DESC LIMIT $2`;
export const LEGACY_EVENTS_SQL = `
 SELECT e.id, e.title, e.event_at, e.created_at
   FROM field_events e
   JOIN practitioners p ON p.id = e.practitioner_id
    AND p.id = $2::uuid AND p.member_id = $1::uuid
    AND p.portal_type = 'personal' AND p.status = 'active'
  WHERE e.team_id IS NULL
  ORDER BY e.event_at ASC, e.id DESC LIMIT $3`;
export const NATIVE_PEOPLE_SQL = `
 SELECT p.id, p.name, p.note, p.created_at
   FROM field_people p
  WHERE p.personal_member_id = $1::uuid
    AND p.practitioner_id IS NULL AND p.team_id IS NULL
  ORDER BY p.created_at DESC, p.id DESC LIMIT $2`;
export const LEGACY_PEOPLE_SQL = `
 SELECT p.id, p.name, p.note, p.created_at
   FROM field_people p
   JOIN practitioners adapter ON adapter.id = p.practitioner_id
    AND adapter.id = $2::uuid AND adapter.member_id = $1::uuid
    AND adapter.portal_type = 'personal' AND adapter.status = 'active'
  WHERE p.team_id IS NULL
  ORDER BY p.created_at DESC, p.id DESC LIMIT $3`;

type EventDb = {id:string;title:string;event_at:Timestamp;created_at:Timestamp};
type PersonDb = {id:string;name:string;note:string|null;created_at:Timestamp};
type NoteDb = {id:string;section:string;body:string;created_at:Timestamp};
type AttentionDb = {id:string;field:string;kind:string;position:number;
  resolved:string|null;gone:boolean;created_at:Timestamp};

function iso(t:Timestamp):string {
  const d = new Date(t);
  if(!Number.isFinite(d.valueOf())) throw new Error('Personal Field timestamp unavailable');
  return d.toISOString();
}
function tag<T extends Base>(rows:readonly T[], origin:Source, kind:string) {
  return rows.map(r=>({...r,createdAt:iso(r.createdAt),origin,
    key:`${kind}/${origin}/${r.id}`,editable:false as const}));
}
function assertIds<T extends {id:string}>(kind:string,a:readonly T[],b:readonly T[]) {
  const seen=new Set<string>();
  for(const row of [...a,...b]) {
    if(!row.id || seen.has(row.id))
      throw new Error(`Personal Field ${kind} has ambiguous history`);
    seen.add(row.id);
  }
}
function recent<T extends {createdAt:string;key:string}>(items:T[]) {
  return items.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||a.key.localeCompare(b.key)).slice(0,LIMIT);
}
function sourceOrderedAttention(rows:Attention[],origin:Source) {
  const prepared=tag(rows,origin,'attention').map(item=>{
    const gone=Boolean(item.gone) || !item.label;
    return {...item, gone,
      label:gone?'Reference unavailable':item.label, editable:false as const};
  });
  if(origin==='member-native')
    prepared.sort((a,b)=>(a.position??0)-(b.position??0)||
      b.createdAt.localeCompare(a.createdAt)||a.key.localeCompare(b.key));
  // Historical ordering is already supplied by the historical SQL.
  return prepared.slice(0,LIMIT);
}

export function composeVerifiedPersonalField(input:{
  legacyStatus:IndividualContext['legacyPersonalStatus'];
  history:Awaited<ReturnType<typeof readPersonalFieldContinuity>>;
  nativeNotes:Note[];
  nativeAttention:Attention[];
  nativeEvents:Event[];
  nativePeople:Person[];
  legacyEvents:Event[];
  legacyPeople:Person[];
}) {
  const {history}=input;
  const historicalNotes:Note[]=history.records.notes;
  const historicalAttention:Attention[]=history.records.attention;
  if(input.legacyStatus!=='active' &&
      (historicalNotes.length+historicalAttention.length+
       input.legacyEvents.length+input.legacyPeople.length)>0) {
    throw new Error('Personal history not safely attributable to this member');
  }
  assertIds('Notes',input.nativeNotes,historicalNotes);
  assertIds('Attention',input.nativeAttention,historicalAttention);
  assertIds('Events',input.nativeEvents,input.legacyEvents);
  assertIds('People',input.nativePeople,input.legacyPeople);

  const notes=recent([...tag(input.nativeNotes,'member-native','note'),
    ...tag(historicalNotes,'historical-personal','note')]);
  const people=recent([...tag(input.nativePeople,'member-native','person'),
    ...tag(input.legacyPeople,'historical-personal','person')]);
  const events=[...tag(input.nativeEvents,'member-native','event'),
    ...tag(input.legacyEvents,'historical-personal','event')]
    .map(row=>({...row,eventAt:iso(row.eventAt)}))
    .sort((a,b)=>a.eventAt.localeCompare(b.eventAt)||a.key.localeCompare(b.key))
    .slice(0,LIMIT);
  return {
    owner:'member' as const, personalOnly:true as const,
    access:'source_held_read_only' as const,
    coverage:'bounded_verified_sources_only' as const,
    completeHistory:false as const, interpretation:'none' as const,
    authoredRanking:'none' as const,
    legacyStatus:input.legacyStatus,
    notes, people, events,
    // Distinct authored positions: do NOT turn two storage lineages into
    // a new "importance" score or pretend ordering was shared.
    attention:{
      memberNative:sourceOrderedAttention(input.nativeAttention,'member-native'),
      historical:sourceOrderedAttention(historicalAttention,'historical-personal'),
      ordering:'author_order_within_each_source_only' as const,
    },
    decisions:history.records.decisions,
    changes:history.records.changes,
    processItems:history.records.processItems,
    limitPerSource:LIMIT,
    authoringEnabled:false as const,
  };
}

export async function readVerifiedPersonalField(
  context:IndividualContext,
) {
  const ready=await query<{ready:boolean}>(PERSONAL_FIELD_4_TABLE_CAPABILITY_SQL);
  if(ready.rows.length!==1 || ready.rows[0].ready!==true)
    throw new Error('Personal Field 4-table schema unavailable');

  const member=context.memberId;
  const ref=context.legacyPersonalStatus==='active'
    ? context.legacyPersonalPractitionerId:null;
  const hist=await readPersonalFieldContinuity(context);
  // Every SELECT independently binds the authenticated member; legacy rows
  // are revalidated against both member and portal_type/status in SQL.
  const [n,a,ev,pe,lev,lpe]=await Promise.all([
    query<NoteDb>(MEMBER_NOTES_READ_SQL,[member,LIMIT]),
    query<AttentionDb>(MEMBER_ATTENTION_READ_SQL,[member,LIMIT]),
    query<EventDb>(NATIVE_EVENTS_SQL,[member,LIMIT]),
    query<PersonDb>(NATIVE_PEOPLE_SQL,[member,LIMIT]),
    ref?query<EventDb>(LEGACY_EVENTS_SQL,[member,ref,LIMIT]):Promise.resolve({rows:[] as EventDb[]}),
    ref?query<PersonDb>(LEGACY_PEOPLE_SQL,[member,ref,LIMIT]):Promise.resolve({rows:[] as PersonDb[]}),
  ]);
  return composeVerifiedPersonalField({
    legacyStatus:context.legacyPersonalStatus,
    history:hist,
    nativeNotes:n.rows.map(x=>({id:x.id,section:x.section,body:x.body,createdAt:x.created_at})),
    nativeAttention:a.rows.map(x=>({id:x.id,field:x.field,kind:x.kind,
      label:x.gone?'Reference unavailable':x.resolved,gone:x.gone,
      position:x.position,createdAt:x.created_at})),
    nativeEvents:ev.rows.map(x=>({id:x.id,title:x.title,eventAt:x.event_at,createdAt:x.created_at})),
    nativePeople:pe.rows.map(x=>({id:x.id,name:x.name,note:x.note,createdAt:x.created_at})),
    legacyEvents:lev.rows.map(x=>({id:x.id,title:x.title,eventAt:x.event_at,createdAt:x.created_at})),
    legacyPeople:lpe.rows.map(x=>({id:x.id,name:x.name,note:x.note,createdAt:x.created_at})),
  });
}
