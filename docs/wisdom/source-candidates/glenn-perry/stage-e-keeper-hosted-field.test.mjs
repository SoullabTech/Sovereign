/**
 * Stage E: proposed Keeper-Hosted Field approval is a scoped relationship,
 * never an unrestricted permission or current working product.
 * No member, payment, DB, email, outreach, server or model calls.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const source=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const field=JSON.parse(source('docs/wisdom/source-candidates/glenn-perry/KEEPER-HOSTED-FIELD_APPROVAL-CONTRACT_CANDIDATE_20261017.json'));
const proposal=source('docs/wisdom/source-candidates/glenn-perry/KEEPER-HOSTED-FIELD_APPROVAL-AND-ENGAGEMENT-CANDIDATE_20261017.md');
const community=JSON.parse(source('docs/wisdom/source-candidates/glenn-perry/WISDOM-KEEPERS-COMMONS_PILOT-CONTRACT_CANDIDATE_20261017.json'));
const refs=JSON.parse(source('docs/wisdom/source-candidates/glenn-perry/sources.json'));
const circleCanon=source('docs/programme/JARVIS-CIRCLES-01_FOUNDER_RULINGS_2026-09-06.md');

test('field proposal remains unratified, default-off and not a live member product',()=>{
  assert.equal(field.status,'research_review_not_ratified');
  for(const k of ['runtime_enabled','deploy_authorized','founder_scope_authorized',
    'keeper_field_feature_enabled','creator_role_issued','member_facing_access_enabled',
    'invitations_enabled','keeper_contact_automation_enabled','corpus_admission_enabled'])
    assert.equal(field[k],false,k);
  assert.match(proposal,/^status: review$/m);
  assert.match(proposal,/^safe_for_retrieval: false$/m);
  assert.match(proposal,/Proposed future capability/);
});

test('keeper-hosted field is a scope over existing ontology, not a seventh field type',()=>{
  assert.equal(field.keeper_field_not_new_ontology,true);
  assert.deepEqual(field.underlying_field_types,
    ['dyadic','circle','constellation','interest_commons','co_lab']);
  for(const k of ['## FR-02','## FR-05','## FR-06','## FR-07','## FR-08'])
    assert.ok(circleCanon.includes(k),k);
  assert.match(proposal,/not a seventh type of field/i);
  assert.match(proposal,/Keeper ≠ facilitator by title/);
});

test('host approval does not endorse spiritual, astrological or clinical claims',()=>{
  assert.match(proposal,/scientific or spiritual certification/i);
  assert.match(proposal,/not.*therapy|therapy.*require.*separate/i);
  assert.equal(field.policy.no_clinical_services_by_hosting_permission,true);
  assert.equal(field.policy.no_model_impersonation,true);
  assert.equal(field.policy.no_autonomous_keeper_speech_by_maia,true);
  assert.equal(field.policy.group_maia_facilitation_not_implemented,true);
});

test('Glenn Perry is referenced but not partnered, contacted or licensed',()=>{
  const k=field.reference_keeper;
  assert.equal(k.name,'Glenn Perry, Ph.D.');
  assert.equal(k.participation,'unaffiliated_reference');
  assert.equal(k.keeper_agreed_to_host,false);
  assert.equal(k.partner_endorsement,false);
  assert.equal(k.source_text_grant,false);
  assert.equal(k.contact_allowed_to_agent,false);
  assert.equal(k.founder_holds_outreach_authority,true);
  assert.equal(k.field_id,null);
  assert.equal(k.field_created,false);
  assert.equal(refs.flags.embedding_allowed,false);
  assert.equal(community.reference_pilot.keeper_has_consented_to_participate,false);
});

test('hosting requires separate founder, keeper, operational, and member decisions',()=>{
  const gates=field.approved_field_required_evidence;
  const ids=gates.map(x=>x.gate);
  assert.equal(new Set(ids).size,ids.length);
  for(const id of ['verified_keeper_identity','founder_scoped_invitation',
    'keeper_event_and_field_acceptance','signed_specific_activity_terms',
    'field_access_and_moderation','member_informed_entry','privacy_and_session_controls'])
    assert.ok(ids.includes(id),id);
  for(const g of gates)assert.ok(!['accepted','granted','approved','passed'].includes(g.state),g.gate);
  assert.equal(field.state_machine.current,'unaffiliated_reference');
  assert.equal(field.state_machine.automatic_advance,false);
  assert.equal(field.state_machine.needs_human_adjudication,true);
});

test('keeper authority is limited, revocable, and never self-granted',()=>{
  assert.equal(field.state_machine.field_role_revocable,true);
  assert.equal(field.state_machine.keeper_can_refuse,true);
  assert.equal(field.state_machine.paused_implies_no_new_events,true);
  assert.equal(field.state_machine.withdrawn_implies_no_future_hosting,true);
  for(const [name,enabled] of Object.entries(field.scoped_capabilities))
    assert.equal(enabled,false,'permission must be off: '+name);
  assert.equal(field.policy.keeper_role_not_equivalent_to_circle_facilitator,true);
  assert.equal(field.policy.facilitator_procedural_not_interpretive,true);
  assert.match(proposal,/does not obtain.*FOUNDER_MEMBER_IDS/);
});

test('member private, Sanctuary, clinical and unrelated Circle data inaccessible',()=>{
  const cap=field.scoped_capabilities;
  for(const name of ['view_member_personal_field','view_maia_memory',
    'view_member_astrology_or_health_data','view_unrelated_circle_interiors',
    'export_member_roster','receive_member_contact_info','auto_summarize_field_to_ain'])
    assert.equal(cap[name],false,name);
  assert.equal(field.policy.no_sanctuary_content_crossing,true);
  assert.equal(field.policy.no_member_discovery_from_private_maia_context,true);
  assert.equal(field.policy.no_automatic_private_field_sharing,true);
  assert.equal(field.policy.collective_circle_release_needs_all_represented_authors,true);
  assert.equal(field.policy.member_content_release_by_member,true);
});

test('members have visible consent, choice, exit, and no automated introduction',()=>{
  assert.equal(field.policy.verified_session_required,true);
  assert.equal(field.policy.member_joins_by_explicit_act,true);
  assert.equal(field.policy.member_sees_keeper_identity_and_approval_scope,true);
  assert.equal(field.policy.member_sees_host_activity_and_purpose,true);
  assert.equal(field.policy.member_can_leave,true);
  assert.equal(field.policy.no_unconsented_dyadic_contact,true);
  assert.equal(community.consent_and_membranes.intro_auto_sent,false);
  assert.equal(field.member_facing_access_enabled,false);
});

test('recording and publishing remain separately permissioned',()=>{
  assert.equal(field.policy.recording_off_by_default,true);
  assert.equal(field.policy.every_recorded_session_needs_specific_consent,true);
  assert.equal(field.scoped_capabilities.record_or_transcribe_event,false);
  assert.equal(field.scoped_capabilities.publish_licensed_resources,false);
  assert.equal(field.policy.keeper_original_sources_require_separate_rights,true);
  assert.equal(field.corpus_admission_enabled,false);
});

test('keeper collaboration and teaching scope are imagined but not operational',()=>{
  const examples=field.possible_experiences;
  assert.equal(examples.length,7);
  for(const a of examples) assert.equal(a.status,'concept_not_built',a.id);
  for(const id of ['welcome','source_shelf','salon','questions','practice','co_keeper','support'])
    assert.ok(examples.some(x=>x.id===id),id);
  assert.match(proposal,/cross-keeper encounters/i);
  assert.match(proposal,/ethical residencies and apprenticeships/i);
  assert.equal(field.invitations_enabled,false);
});

test('fictional first gathering is nonclinical, adult and not Perry-hosted',()=>{
  const s=field.first_fictional_session;
  assert.equal(s.status,'illustrative_only_not_scheduled');
  assert.equal(s.keeper_guest_included,false);
  assert.equal(s.age_scope,'adults_only');
  assert.equal(s.duration_minutes,75);
  assert.equal(s.mode,'nonclinical_educational_circle');
  assert.equal(s.recording_enabled,false);
  assert.equal(s.autogenerated_transcript_enabled,false);
  assert.equal(s.inference_enabled,false);
  assert.equal(s.source_rights_granted,false);
  assert.equal(s.group_to_commons_release_enabled,false);
  assert.equal(s.scheduled_at,null);
  assert.equal(s.meeting_link,null);
  assert.deepEqual(s.participants,[]);
  assert.equal(s.segments.length,6);
  assert.match(s.host,/not Glenn Perry/);
});

test('no payment-based personal meaning, spiritual scores or unapproved minor access',()=>{
  assert.equal(field.policy.no_payment_based_access_to_personal_meaning,true);
  assert.equal(field.policy.no_rank_or_score_for_spiritual_progress,true);
  assert.equal(field.policy.adult_education_pilot_only,true);
  assert.equal(field.policy.no_minors_without_separate_safeguards,true);
  assert.equal(community.economic_principles.ranking_by_spending,false);
  assert.equal(community.economic_principles.paid_priority_for_mentor_contact,false);
  assert.match(proposal,/fair livelihood/i);
});

test('no UI authority or enacted member source changes are implied by documents',()=>{
  assert.equal(field.policy.do_not_infer_field_is_implemented,true);
  assert.equal(field.reference_keeper.field_created,false);
  assert.equal(field.keeper_field_feature_enabled,false);
  assert.equal(field.deploy_authorized,false);
  const preview=source('app/maia/perry-lens-preview/page.tsx');
  assert.match(preview,/MAIA_PERRY_FOUNDER_PREVIEW_ENABLED !== '1'/);
  const served=source('lib/maia/knowledge/perrySourceLens.ts');
  assert.match(served,/APPROVED_PERRY_EDITORIAL_SOURCE: ApprovedPerryEditorialSource \| null = null/);
  assert.equal(field.feature_permissions_outstanding.length,8);
});

test('umbrella Commons pilot cannot silently graduate Keeper Field into member access',()=>{
  const x=community.keeper_hosted_fields;
  assert.equal(x.status,'approval_candidate_not_active');
  assert.equal(x.founder_approval_required,true);
  assert.equal(x.keeper_specific_acceptance_required,true);
  assert.equal(x.member_informed_entry_required,true);
  assert.equal(x.verified_operational_access_required,true);
  assert.equal(x.recording_requires_separate_consent,true);
  assert.equal(x.copyright_licensing_independent,true);
  assert.equal(x.role_scope_limited_and_revocable,true);
  for(const k of ['glenn_perry_field_exists','keeper_role_assigned','member_enrollment_open',
    'keeper_can_access_private_member_data','maia_may_speak_as_keeper','open_events',
    'auto_invitations','live_runtime'])assert.equal(x[k],false,k);
});

test('existing founder preview is a switchable illustration, not a live keeper room',()=>{
  const ui=source('components/maia/knowledge/PerryLensFounderPreview.tsx');
  assert.ok(ui.includes('keeper-hosted-field-concept'));
  assert.ok(ui.includes('hostedFieldPerspective'));
  assert.ok(ui.includes('field-member-view'));
  assert.ok(ui.includes('field-keeper-view'));
  assert.ok(ui.includes('Not an active room.'));
  assert.ok(ui.includes('Glenn Perry remains an unaffiliated referenced author.'));
  assert.ok(ui.includes('No invitations, signups'));
  assert.ok(!ui.includes('createKeeperField('));
  assert.ok(!ui.includes('joinKeeperField('));
  assert.ok(!ui.includes('apiFetch('));
  assert.ok(!ui.includes('fetch('));
});
