/**
 * Stage F — one first founder-hosted Wisdom Circle pilot/rehearsal.
 * Executes source and boundary contracts only; the browser UI is tested
 * separately. No member data, invitations, scheduling or service writes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const base='docs/wisdom/source-candidates/glenn-perry/';
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const pilot=JSON.parse(read(base+'STAGE-F_FIRST-GATHERING_PILOT-REHEARSAL_CANDIDATE_20261017.json'));
const host=read(base+'STAGE-F_FIRST-GATHERING_FACILITATOR-KIT_CANDIDATE_20261017.md');
const invitation=read(base+'STAGE-F_FIRST-GATHERING_INVITATION-AND-CONSENT_CANDIDATE_20261017.md');
const field=JSON.parse(read(base+'KEEPER-HOSTED-FIELD_APPROVAL-CONTRACT_CANDIDATE_20261017.json'));
const sources=JSON.parse(read(base+'sources.json'));
let scratch,movements;

test.before(async()=>{
  scratch=fs.mkdtempSync(path.join(os.tmpdir(),'wisdom-circle-stage-f-'));
  const m=read('lib/maia/knowledge/wisdomFirstCircleRehearsal.ts');
  fs.writeFileSync(path.join(scratch,'module.mjs'),stripTypeScriptTypes(m,{mode:'strip'}));
  movements=await import(pathToFileURL(path.join(scratch,'module.mjs')).href);
});
test.after(()=>{if(scratch)fs.rmSync(scratch,{recursive:true,force:true});});

test('first gathering is explicitly unscheduled, unenrolled and non-operational',()=>{
  assert.equal(pilot.status,'founder_rehearsal_not_scheduled');
  assert.equal(pilot.date,null);
  assert.equal(pilot.time,null);
  assert.equal(pilot.timezone,null);
  assert.equal(pilot.venue,null);
  assert.equal(pilot.meeting_url,null);
  assert.equal(pilot.enrollment_open,false);
  assert.equal(pilot.registration_link,null);
  assert.equal(pilot.invitation_sent,false);
  assert.deepEqual(pilot.recipient_list,[]);
  assert.equal(pilot.deployment_authorized,false);
  assert.equal(field.first_fictional_session.status,'illustrative_only_not_scheduled');
});

test('the fictional 75-minute schedule is contiguous, complete and consistently authored',()=>{
  assert.equal(pilot.duration_minutes,75);
  assert.equal(pilot.session_segments.length,6);
  assert.equal(movements.FIRST_WISDOM_CIRCLE_DURATION_MINUTES,75);
  const list=movements.FIRST_WISDOM_CIRCLE_MOVEMENTS;
  assert.equal(list.length,6);
  let clock=0;
  for(let i=0;i<pilot.session_segments.length;i++){
    const p=pilot.session_segments[i],s=list[i];
    assert.equal(p.start_minute,clock);
    assert.ok(p.end_minute>p.start_minute);
    clock=p.end_minute;
    assert.equal(s.id,p.id);
    assert.equal(s.title,p.title);
    assert.equal(s.startMinute,p.start_minute);
    assert.equal(s.endMinute,p.end_minute);
    assert.equal(s.element,p.element);
    assert.equal(s.invitation,p.host_prompt);
    assert.equal(s.boundary,p.boundary);
  }
  assert.equal(clock,75);
  assert.equal(pilot.session_segments[0].id,'arrival');
  assert.equal(pilot.session_segments.at(-1).id,'close');
});

test('founder, not Glenn Perry, is the proposed human host and rights are separate',()=>{
  assert.equal(pilot.format,'founder_hosted_group_educational_nonclinical');
  assert.equal(pilot.founder_host_verified_for_event,false);
  assert.equal(pilot.glenn_perry_participating,false);
  assert.equal(pilot.glenn_perry_contacted,false);
  assert.equal(pilot.third_party_author_present,false);
  assert.match(pilot.keeper_name_cited,/independent.*unaffiliated/);
  assert.equal(field.reference_keeper.keeper_agreed_to_host,false);
  assert.equal(field.reference_keeper.contact_allowed_to_agent,false);
  assert.equal(pilot.full_text_ingestion_allowed,false);
  assert.equal(pilot.licensed_excerpt_allowed,false);
  assert.equal(sources.flags.embedding_allowed,false);
  assert.equal(sources.flags.admitted_to_corpus,false);
});

test('member privacy, clinical safety and group authorship remain bounded',()=>{
  for(const k of ['community_member_data_used','member_interest_declarations_collected',
    'member_chart_requested','clinical_intake_allowed',
    'recording_on','transcription_on','maia_group_participant','ain_auto_contribution',
    'circle_content_auto_release','member_public_contribution_required',
    'following_up_by_absence','host_speech_generated','astrological_diagnosis_allowed']){
    assert.equal(pilot[k],false,k);
  }
  assert.equal(pilot.participant_scope,'consenting_adults_only');
  assert.equal(pilot.rehearsal_only_controls.no_real_participant_data,true);
  assert.equal(field.policy.no_sanctuary_content_crossing,true);
  assert.equal(field.policy.member_content_release_by_member,true);
  assert.equal(field.policy.recording_off_by_default,true);
});

test('costs are not charged, donated or misrepresented while venue unconfirmed',()=>{
  assert.equal(pilot.fee_or_donation_collected,false);
  assert.equal(pilot.amount_due,null);
  assert.ok(host.includes('Price:')===false, 'kit does not invent price');
  assert.ok(invitation.includes('[CONFIRM ANY ACTUAL COSTS'));
  assert.equal(pilot.registration_link,null);
  assert.equal(pilot.rehearsal_only_controls.no_network_registration,true);
  assert.equal(pilot.online_first_delivery.selected_as_founder_direction,true);
  assert.equal(pilot.online_first_delivery.first_session_mode,'online_private_meeting');
  assert.equal(pilot.online_first_delivery.provider_selected,false);
  assert.equal(pilot.online_first_delivery.meeting_url,null);
  assert.equal(pilot.online_first_delivery.hybrid_is_later_distinct_release_gate,true);
});

test('each release gate is closed except the no-endorsement invariant',()=>{
  assert.equal(pilot.release_gates.no_keeper_endorsement_asserted,true);
  for(const [key,value] of Object.entries(pilot.release_gates)){
    if(key==='no_keeper_endorsement_asserted')continue;
    assert.equal(value,false,key);
  }
  assert.match(pilot.next_human_decision,/Review exact invitation/);
  assert.equal(field.invitations_enabled,false);
  assert.equal(field.runtime_enabled,false);
});

test('facilitator guide preserves an original five-element inquiry without chart claims',()=>{
  assert.match(host,/^status: review$/m);
  assert.match(host,/^safe_for_retrieval: false$/m);
  for(const e of ['Earth','Water','Air','Fire','Weather']) assert.ok(host.includes(e),e);
  for(const b of ['no recording','not psychotherapy','voluntary','silence','private']) {
    assert.ok(host.toLowerCase().includes(b.toLowerCase()),'missing boundary '+b);
  }
  assert.match(host,/\*not\* a Glenn Perry event/i);
  assert.match(host,/No chart predicts a future relationship event/i);
  assert.match(host,/FR-07\/08|FR-07\/08|FR-07.*08/);
  assert.match(host,/no automatic published artifact|no automatic published artifact/i);
});

test('invitation names the real host category and withholds unscheduled details',()=>{
  assert.match(invitation,/^status: review$/m);
  assert.match(invitation,/^safe_for_retrieval: false$/m);
  assert.ok(invitation.includes('NOT SENT'));
  assert.ok(invitation.includes('[DATE — to be decided]'));
  assert.ok(invitation.includes('[TIME + TIME ZONE — to be decided]'));
  assert.ok(invitation.includes('[PRIVATE INVITATION-ONLY VIDEO LINK — NOT YET CREATED]'));
  assert.match(invitation,/not a Glenn Perry-led event/i);
  assert.match(invitation,/not enrollment/i);
  assert.match(invitation,/No recipients are identified/);
});

test('plain-language entry consent does not promise impossible group confidentiality',()=>{
  assert.ok(invitation.includes('cannot promise perfect confidentiality'));
  assert.match(invitation,/participants may hear what you choose to say/i);
  assert.ok(invitation.includes('if they wish')||invitation.includes('may speak'));
  assert.ok(invitation.includes('privacy arrangements'));
  assert.match(invitation,/\*\*before\*\* a real event is offered/);
  assert.ok(invitation.includes('not consent to record'));
  assert.match(invitation,/does not include recording|does not plan to record|not include recording/i);
});

test('the six rehearsal cues remain read-only and are never converted to API control',()=>{
  assert.equal(pilot.rehearsal_only_controls.fixed_fictional_scenario,true);
  assert.equal(pilot.rehearsal_only_controls.no_provider_calls,true);
  assert.equal(pilot.rehearsal_only_controls.no_persistent_rehearsal_content,true);
  const preview=read('components/maia/knowledge/PerryLensFounderPreview.tsx');
  assert.ok(preview.includes('first-circle-rehearsal'));
  assert.ok(preview.includes('FIRST_WISDOM_CIRCLE_MOVEMENTS'));
  assert.ok(preview.includes('does not run a clock, schedule or register participants'));
  assert.ok(!preview.includes('createCircleForPilot('));
  assert.ok(!preview.includes('sendPilotInvitation('));
  assert.ok(!preview.includes('apiFetch('));
  assert.ok(!preview.includes('fetch('));
  const route=read('app/maia/perry-lens-preview/page.tsx');
  assert.match(route,/MAIA_PERRY_FOUNDER_PREVIEW_ENABLED !== '1'/);
  assert.match(route,/await requireFounder\(\)/);
});


test('online-first format is chosen while the vendor, room, date and recipients remain unknown',()=>{
  assert.match(host,/Online is the preferred first pilot/);
  assert.match(invitation,/online-first/);
  assert.match(invitation,/PROVIDER AND PRIVACY SETTINGS TO BE VERIFIED/);
  assert.match(invitation,/A third-party video provider may handle video/);
  assert.equal(pilot.venue,null);
  assert.equal(pilot.meeting_url,null);
  assert.equal(pilot.online_first_delivery.venue_or_platform_privacy_verified,false);
  assert.equal(pilot.online_first_delivery.actual_event_scheduled,false);
  assert.equal(pilot.online_first_delivery.member_invitation_authorized,false);
});

test('hybrid expansion is not accidentally included in initial online consent',()=>{
  assert.match(invitation,/Later hybrid gatherings are a separate invitation/);
  assert.match(invitation,/not.*automatic transfer of your participation consent/i);
  assert.match(host,/local procedural host plus a remote participant advocate/);
  assert.equal(pilot.online_first_delivery.hybrid_is_later_distinct_release_gate,true);
});
