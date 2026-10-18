/**
 * Stage G Wisdom Keepers: online-first, hybrid-later field and governance tests.
 * These verify authoring/contract constraints, NOT actual video privacy,
 * host-account settings, multi-party call quality, or real scheduling.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as os from 'node:os';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../..');
const file=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const base='docs/wisdom/source-candidates/glenn-perry/';
const stageG=JSON.parse(file(base+'STAGE-G_ONLINE-TO-HYBRID_DELIVERY-CONTRACT_CANDIDATE_20261017.json'));
const stageF=JSON.parse(file(base+'STAGE-F_FIRST-GATHERING_PILOT-REHEARSAL_CANDIDATE_20261017.json'));
const note=file(base+'STAGE-G_ONLINE-FIRST_TO-HYBRID_GATHERINGS-CANDIDATE_20261017.md');
const invite=file(base+'STAGE-F_FIRST-GATHERING_INVITATION-AND-CONSENT_CANDIDATE_20261017.md');
const charters=JSON.parse(file(base+'WISDOM-KEEPERS-COMMONS_PILOT-CONTRACT_CANDIDATE_20261017.json'));
let tmp,options;

test.before(async()=>{
  tmp=fs.mkdtempSync(path.join(os.tmpdir(),'stage-g-gathering-preview-'));
  fs.writeFileSync(path.join(tmp,'m.mjs'),stripTypeScriptTypes(
    file('lib/maia/knowledge/wisdomGatheringDeliveryPreview.ts'),{mode:'strip'}));
  options=(await import(pathToFileURL(path.join(tmp,'m.mjs')).href)).WISDOM_GATHERING_DELIVERY_PREVIEW;
});
test.after(()=>{if(tmp)fs.rmSync(tmp,{force:true,recursive:true});});

test('online first, hybrid later is the precise founder direction and not a release act',()=>{
  assert.equal(stageG.status,'founder_delivery_direction_review_only');
  assert.equal(stageG.founder_direction,'online_first_then_hybrid');
  assert.equal(stageF.online_first_delivery.selected_as_founder_direction,true);
  assert.equal(stageF.online_first_delivery.first_session_mode,'online_private_meeting');
  for(const key of ['runtime_enabled','meeting_created','calendar_event_created','invitation_sent',
    'live_member_session_started','participant_contact_data_accessed','payment_or_donation_enabled',
    'provider_credentials_used','production_branch_modified','source_corpus_admitted'])
    assert.equal(stageG[key],false,key);
  assert.equal(stageG.field_ontology_new_type,false);
  assert.match(note,/^status: review$/m);
  assert.match(note,/^safe_for_retrieval: false$/m);
});

test('phase sequence starts with one online founder circle and leaves keeper/hybrid gated',()=>{
  assert.deepEqual(stageG.phase_sequence.map(x=>x.id),[
    'one_online_circle','online_series','keeper_online','hybrid_gatherings'
  ]);
  assert.deepEqual(stageG.phase_sequence.map(x=>x.mode),[
    'online','online','online','hybrid'
  ]);
  assert.equal(stageG.phase_sequence[0].duration_minutes,75);
  assert.equal(stageG.phase_sequence[0].status,'prepared_not_hosted');
  assert.equal(stageG.phase_sequence[0].members_invited,false);
  assert.equal(stageG.phase_sequence[0].keeper_partner,false);
  assert.equal(stageG.phase_sequence[2].requires_keeper_specific_acceptance,true);
  assert.equal(stageG.phase_sequence[3].requires_remote_participation_parity,true);
  assert.equal(stageG.phase_sequence[3].status,'concept_not_built');
});

test('pilot cannot invent video provider, account, vendor privacy, join link or timezone',()=>{
  const first=stageG.first_online_pilot;
  assert.equal(first.mode,'online');
  assert.equal(first.provider,'undecided');
  assert.equal(first.provider_account_reviewed,false);
  assert.equal(first.meeting_link,null);
  assert.equal(first.meeting_id,null);
  assert.equal(first.meeting_passcode,null);
  assert.equal(first.provider_e2ee,'not_claimed');
  assert.equal(first.external_provider_retention,'unknown_requires_honest_review');
  assert.equal(first.recording,'off_required_not_yet_verified');
  assert.equal(first.ai_transcription,'off_required_not_yet_verified');
  assert.equal(first.date,null);
  assert.equal(first.time,null);
  assert.equal(first.timezone,null);
  assert.equal(first.send_invites_authorized,false);
  assert.deepEqual(first.invitation_recipients,[]);
  assert.equal(stageF.meeting_url,null);
  assert.equal(stageF.date,null);
});

test('private join, operator consent and recording controls all require real evidence',()=>{
  const first=stageG.first_online_pilot;
  for(const k of ['provider_account_reviewed','human_host_procedural_role_verified',
    'privacy_notice_reconciled','joining_invite_capability_verified','kick_and_revoke_verified',
    'waiting_room_verified','screen_share_controls_verified','participant_visibility_verified',
    'mobile_low_bandwidth_verified','support_and_accessibility_verified','recording_and_log_custody_verified',
    'join_and_exit_with_fictional_sessions_passed']){
    assert.equal(first[k],false,k);
  }
  const tests=stageG.online_host_consent_checklist;
  for(const [key,value] of Object.entries(tests)){
    if(key==='no_automatic_maia_group_summary'||key==='no_sanctuary_or_private_source_transfer'){
      assert.equal(value,true,key);
    }else{
      assert.equal(value,false,key);
    }
  }
});

test('provider-agnostic link out is NOT a claim that existing Session Room hosts a Circle',()=>{
  const vendor=stageG.meeting_provider_selection;
  assert.equal(vendor.status,'none_chosen');
  assert.equal(vendor.provider_agnostic,true);
  assert.equal(vendor.not_a_sovereign_media_claim,true);
  assert.equal(vendor.existing_two_participant_session_room_not_approved_for_group,true);
  assert.equal(vendor.existing_public_event_registration_not_private_circle_access,true);
  assert.equal(vendor.self_hosted_livekit_or_webrtc_not_assumed_deployed,true);
  assert.equal(vendor.provider_specific_claims_must_be_witnessed,true);
  const sketch=file('docs/architecture/MAIA_GROUPS_MEETINGS_2026-06-27.md');
  assert.match(sketch,/Status:\*\* Design sketch\. No code/);
  const spec=file('docs/specs/SESSION_ROOM_VIDEO_PHASE1_SCOPE_2026-06-14.md');
  assert.match(spec,/With external video, MAIA can keep the session memory sovereign/);
  const twoPerson=file('app/open/session-room/[roomId]/page.tsx');
  assert.match(twoPerson,/P2P transport/);
  const publicEvent=file('app/api/events/[slug]/register/route.ts');
  assert.match(publicEvent,/Anonymous: email-only capture/);
  assert.match(publicEvent,/event.visibility === 'private'/);
});

test('hybrid needs independent privacy, accessibility, two-way audio and remote equality',()=>{
  const h=stageG.hybrid_future;
  assert.equal(h.operational_state,'research_only_not_configured');
  assert.equal(h.venue,null);
  assert.equal(h.recording_default_off,true);
  assert.equal(h.keeper_consent_required,true);
  assert.equal(h.member_consent_required,true);
  assert.equal(h.adult_pilot_only,true);
  for(const [k,v] of Object.entries(h)){
    if(typeof v==='boolean' && !['recording_default_off','keeper_consent_required','member_consent_required','adult_pilot_only','time_and_venue_tbd'].includes(k))
      assert.equal(v,false,k);
  }
  assert.match(note,/remote participant advocate/i);
  assert.match(note,/mix-minus\/echo cancellation/);
  assert.match(note,/equal presence/i);
});

test('future hybrid participation cannot be silently bundled into an initial online RSVP',()=>{
  assert.match(invite,/online-first/);
  assert.match(invite,/Later hybrid gatherings are a separate invitation/);
  assert.match(invite,/not.*automatic transfer of your participation consent/i);
  assert.equal(stageF.online_first_delivery.hybrid_is_later_distinct_release_gate,true);
  assert.equal(stageG.release_gates.hybrid_additional_acceptance_required,true);
  assert.equal(stageG.phase_sequence[3].hybrid_event_created,false);
  assert.equal(stageG.hybrid_future.local_venue_selected,undefined);
});

test('no member memory, chart, keeper impersonation, payments or retention pressure',()=>{
  const x=stageG.retention_and_reciprocity;
  for(const name of ['member_discovery_from_private_maia','astrological_or_clinical_matching',
    'attendance_ranking','automated_followup_from_absence','auto_transcript_to_ain',
    'circle_to_commons_release_without_contributors']) assert.equal(x[name],false,name);
  assert.equal(x.author_links_original_public,true);
  assert.equal(x.direct_keeper_support_optional,true);
  assert.equal(x.no_book_embeddings_authorized,true);
  assert.equal(charters.member_interest_capture_enabled,false);
  assert.equal(charters.reference_pilot.keeper_has_consented_to_participate,false);
});

test('every real release requirement remains disabled; labels are not approvals',()=>{
  const gates=stageG.release_gates;
  for(const [key,value] of Object.entries(gates)){
    if(key==='keeper_join_not_inferred'||key==='hybrid_additional_acceptance_required')
      assert.equal(value,true,key);
    else assert.equal(value,false,key);
  }
  assert.equal(stageG.first_online_pilot.provider_subscription_purchase_authorized,false);
  assert.equal(stageG.meeting_created,false);
  assert.match(stageG.next_decision,/Do not create an actual gathering or send invites/);
});

test('founder UI defaults to first online format and never exposes a meeting-link control',()=>{
  const ui=file('components/maia/knowledge/PerryLensFounderPreview.tsx');
  assert.equal(options.online.id,'online');
  assert.equal(options.hybrid.id,'hybrid');
  assert.equal(options.online.status,'First pilot · Proposed');
  assert.equal(options.hybrid.status,'Later phase · Not active');
  assert.equal(options.online.promises.length,4);
  assert.equal(options.hybrid.promises.length,4);
  assert.match(ui,/useState<WisdomGatheringPreviewMode>\('online'\)/);
  assert.match(ui,/wisdom-gathering-delivery-preview/);
  assert.match(ui,/format-online/);
  assert.match(ui,/format-hybrid/);
  assert.match(ui,/No participants are being enrolled/);
  assert.doesNotMatch(ui,/createMeetingRoom\(/);
  assert.doesNotMatch(ui,/sendInviteToKeeper\(/);
  assert.doesNotMatch(ui,/apiFetch\(/);
});

test('an in-person-only webinar style fails the planned hybrid standard',()=>{
  assert.match(note,/not a webinar with second-class remote spectators/);
  assert.match(note,/not a one-way livestream/);
  assert.match(options.hybrid.description,/not a one-way livestream/);
  const out=options.hybrid.promises.map(x=>x.explanation).join(' ');
  assert.match(out,/remote/);
  assert.match(out,/consent|agreed boundaries/);
  assert.equal(stageG.hybrid_future.remote_speaking_and_questions_equal,false);
});
