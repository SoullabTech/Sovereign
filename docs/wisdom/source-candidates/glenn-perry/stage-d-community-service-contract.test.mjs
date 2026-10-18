/**
 * Stage D — Wisdom Keepers Commons as a nonextractive community offering.
 * Contract- and governance-only checks. Does NOT create any service,
 * inspect members, license sources, run a model, or authorize outreach.
 *
 * Run from repository root or source checkout:
 *   node --test docs/wisdom/source-candidates/glenn-perry/stage-d-community-service-contract.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../../..');
const directory=path.join(root,'docs/wisdom/source-candidates/glenn-perry');
const text=(name)=>fs.readFileSync(path.join(directory,name),'utf8');
const json=(name)=>JSON.parse(text(name));
const spec=json('WISDOM-KEEPERS-COMMONS_PILOT-CONTRACT_CANDIDATE_20261017.json');
const charter=text('WISDOM-KEEPERS-COMMONS_SERVICE-CHARTER_CANDIDATE_20261017.md');
const sourceRegistry=json('sources.json');

test('proposed service remains founder-review, not live doctrine or member product',()=>{
  assert.equal(spec.status,'founder_review_not_ratified');
  for(const flag of ['runtime_authorized','member_facing_enabled','public_directory_enabled',
    'member_interest_capture_enabled','human_introductions_enabled','monetary_pool_enabled',
    'source_ingestion_enabled','source_deployed']){
    assert.equal(spec[flag],false,flag);
  }
  assert.match(charter,/^status: review$/m);
  assert.match(charter,/^safe_for_retrieval: false$/m);
  assert.match(charter,/not an adopted constitution/i);
});

test('service reuses ratified Interest Commons ontology, not an activity-score forum',()=>{
  const canon=fs.readFileSync(path.join(root,
    'docs/programme/JARVIS-CIRCLES-01_FOUNDER_RULINGS_2026-09-06.md'),'utf8');
  assert.match(canon,/## FR-02 .*RATIFIED/);
  assert.match(canon,/## FR-06 .*RATIFIED/);
  assert.match(canon,/## FR-07 .*RATIFIED/);
  assert.match(canon,/## FR-08 .*RATIFIED/);
  assert.equal(spec.ontology.field,'Interest Commons (FR-02)');
  assert.equal(spec.ontology.not_a_circle_type,true);
  assert.equal(spec.ontology.not_a_forum,true);
  assert.equal(spec.ontology.not_legacy_community_tables,true);
  assert.equal(spec.ontology.not_legacy_commons_contributions,true);
  assert.match(charter,/existing.*Commons.*ratified|ratified.*meaning.*Commons/i);
});

test('member discovery uses authored declarations, never MAIA surveillance',()=>{
  const x=spec.consent_and_membranes;
  assert.equal(x.member_interest_only_from_explicit_declaration,true);
  assert.equal(x.member_history_used_for_matching,false);
  assert.equal(x.astrology_or_psychological_profile_matching,false);
  assert.equal(x.no_persistent_inferred_relationship_graph,true);
  assert.equal(x.no_silent_AIN_ingestion,true);
  const stage=spec.offering_stages.find(x=>x.id==='declare_interest');
  assert.equal(stage.private_maia_inference_allowed,false);
  assert.equal(stage.reuse_to_another_commons_requires_new_member_act,true);
  assert.equal(spec.member_interest_capture_enabled,false);
});

test('keeper is unaffiliated and no automatic contact or partner status is allowed',()=>{
  const x=spec.reference_pilot;
  assert.equal(x.author_name,'Glenn Perry, Ph.D.');
  assert.equal(x.participation_state,'unaffiliated_reference');
  assert.equal(x.keeper_has_consented_to_participate,false);
  assert.equal(x.affiliation_claim_allowed,false);
  assert.equal(x.direct_contact_automated,false);
  assert.equal(x.founder_manages_outreach,true);
  assert.equal(spec.keeper_standing.automatic_promotion,false);
  assert.equal(spec.keeper_standing.auto_contact,false);
  assert.equal(spec.keeper_standing.public_partner_representation_only_when,'scoped_keeper_consent_recorded');
  assert.ok(spec.no_current_permissions.includes('contact Glenn Perry'));
});

test('a linkout is not a license to embed books, articles, or monetize referral tracking',()=>{
  assert.equal(spec.reference_pilot.book_bodies_stored,false);
  assert.equal(spec.reference_pilot.essay_bodies_stored,false);
  assert.equal(spec.reference_pilot.copyright_embedding_allowed,false);
  assert.equal(sourceRegistry.flags.embedding_allowed,false);
  assert.equal(sourceRegistry.flags.training_allowed,false);
  assert.equal(sourceRegistry.flags.admitted_to_corpus,false);
  assert.deepEqual(spec.reference_pilot.author_sites.sort(),
    [sourceRegistry.wisdom_keeper_discovery.primary_website,
    sourceRegistry.wisdom_keeper_discovery.teaching_institution].sort());
});

test('every keeper and member has a right to decline and to govern contact',()=>{
  assert.equal(spec.consent_and_membranes.dyadic_intro_requires_both_persons_consent,true);
  assert.equal(spec.consent_and_membranes.intro_auto_sent,false);
  assert.equal(spec.consent_and_membranes.no_unconsented_contact_data_exchange,true);
  assert.equal(spec.consent_and_membranes.member_right_to_leave,true);
  assert.equal(spec.consent_and_membranes.keeper_right_to_decline,true);
  assert.equal(spec.keeper_standing.future_participation_revocable,true);
  assert.equal(spec.keeper_standing.author_edit_and_correction_right,true);
});

test('Sanctuary and private Circle material are not extracted across boundaries',()=>{
  const s=spec.consent_and_membranes;
  assert.equal(s.current_sanctuary_content_crosses_never,true);
  assert.equal(s.private_circle_interior_exposed_never,true);
  assert.equal(s.individual_release_requires_author_intent,true);
  assert.equal(s.collective_release_requires_all_represented_authors,true);
  assert.equal(s.recording_default_off,true);
  assert.equal(s.recordings_need_event_specific_consent,true);
});

test('service architecture does not transform payment into standing or teacher obligation',()=>{
  const e=spec.economic_principles;
  for(const k of ['marketplace','advertising','affiliate_tracking','ranking_by_spending',
    'paid_priority_for_mentor_contact','mandatory_gifts','ad_conversion_tracking',
    'keeper_free_labor_assumed']) assert.equal(e[k],false,k);
  assert.equal(e.keeper_compensation_terms_before_event,true);
  assert.equal(e.fund_accounting_policy_before_accepting_money,true);
  assert.equal(e.pooled_support_proposed_not_active,true);
  assert.equal(spec.monetary_pool_enabled,false);
});

test('no engagement manipulation or ranking measures human depth',()=>{
  const m=spec.metrics;
  for(const k of ['leaderboards','rank_members','rank_keepers',
    'track_unconsented_retention','infer_interests_from_absence',
    'score_personal_transformation']) assert.equal(m[k],false,k);
  assert.equal(m.qualitative_invited_feedback_optional,true);
});

test('a keeper encounter is gated independently from reading a public source',()=>{
  const discover=spec.offering_stages.find(x=>x.id==='discover');
  const meet=spec.offering_stages.find(x=>x.id==='keeper_encounter');
  assert.equal(discover.keeper_participation_required,false);
  assert.equal(discover.paid_access_required,false);
  assert.equal(meet.requires_scoped_keeper_consent,true);
  assert.equal(meet.keeper_time_voluntary,true);
  assert.equal(meet.compensation_agreed_in_advance,true);
  assert.equal(meet.recording_default,false);
  assert.equal(spec.human_introductions_enabled,false);
  assert.equal(spec.offering_stages.length,6);
});

test('the conceptual founder page does not quietly create a live event or sign-up',()=>{
  const ui=fs.readFileSync(path.join(root,
    'components/maia/knowledge/PerryLensFounderPreview.tsx'),'utf8');
  assert.ok(ui.includes('wisdom-keepers-commons-concept'));
  assert.ok(ui.includes('Concept only.'));
  assert.ok(ui.includes('not a participating Soullab partner.'));
  assert.ok(ui.includes('no active interest sign-up'));
  assert.ok(ui.includes('There are no pay-to-meet'));
  assert.ok(!ui.includes('fetch('));
  assert.ok(!ui.includes('apiFetch('));
  assert.ok(!ui.includes('memberInterestPOST'));
});
