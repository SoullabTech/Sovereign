# Root Entry Lifecycle Ownership Map

**Date:** 2026-08-03 · **Status:**

```
STATUS
  mechanical inventory        COMPLETE
  semantic classification     PENDING OWNER ASSIGNMENT
  migration                   NOT AUTHORIZED
  retirement decisions        NONE MADE
```

⭐⭐⭐ **A blank Owner field is a FINDING, not an omission.** An Owner filled in by the wrong person
is corruption. The column is meant to be visibly incomplete until each constraint's owner claims it.

⛔ This file is a **shared measurement surface**, not a resolution. Its value is that it makes the
authority question visible, not that it answers it.
**Governs:** `memory/MEMORY.md` · **Sits under:** `ROOT_MEMORY_GOVERNANCE_SCHEMA_v1` (`dc7c70334`, ratified, unapplied)

> The root-purpose ruling answers *what belongs here*. This map exists to answer the next question:
> **who is allowed to decide when it no longer belongs here?**

## Roles (founder ruling, 2026-08-03)

| Role | Decides | Must NOT decide |
|---|---|---|
| **Constraint owner** | *when does this stop being important enough for root?* | — |
| **Migration steward** | classification, formatting, duplicate detection, schema validation, movement of history | whether something matters · whether a constraint is dead · what the future action should be |
| **Governance authority** | conflicting owners · no identifiable owner · owner absent · competing constraints | — |

⛔ **The migration agent is not the author of meaning.** This file was produced by the steward: every
mechanically-derivable column is filled, every judgment column is blank **by design**.

## ⭐ Pending schema amendment (founder, 2026-08-03) — NOT yet in `dc7c70334`

```
exit_condition   declared at ADMISSION   "remove when the auth boundary is replaced"
exit_event       recorded LATER          "auth boundary v2 deployed 2026-08-03"
```

⛔⛔ Without this split, exit conditions get rewritten after the fact and **lifecycle quietly becomes
retrospective justification.** The condition must be falsifiable before the event that satisfies it.

## What the steward measured

| | |
|---|---:|
| entries | 113 |
| index bytes | 26,476 |
| entries with **no canonical record** (no link) | **2** |
| entries carrying **lineage inside the constraint** | **48** |
| entries with an `exit_condition` | **0** |

⭐ **The two entries with no canonical record are a PROVENANCE problem, not a compression one.**
The lifecycle rule *replace in root, append to topic* requires both sides; with no topic record a
transition has nowhere legitimate to go. Disposition is **create the canonical record** — ⛔ not
retirement, ⛔ not migration.

⚠️ **Entries with no canonical record have nowhere for their history to move** — they must gain a topic
artifact before §4 (replace-in-root, append-to-topic) can apply to them at all.

⭐ *Lineage present* = the entry contains SHAs, PR numbers, dates, or transition words (`MERGED`,
`DEPLOYED`, `STALE`, `RETRACTED`…). Per schema §4 that content belongs in the canonical record, not the
root. **This is a detection, not a verdict** — a transition word can be load-bearing (`STALE`, `LOST`).


## ⭐⭐⭐ Who is the owner? (founder refinement, 2026-08-03)

> **An owner is not whoever can edit the file.** The owner is the person or role who can answer
> *"when does this stop governing?"* — and that is often **not** the person who wrote it.

**The test:**

```
If this disappeared tomorrow, who would notice the WRONG ACTION being taken?
```

That person is closer to the owner than the original author.

⚠️⚠️ **The 48 lineage-carrying entries mix two different ownerships:**

| | Question | Likely owner |
|---|---|---|
| **Constraint ownership** | who owns the *rule*? — *"do not infer member meaning from practitioner content"* | architecture / governance authority |
| **Historical residue ownership** | who wrote the *explanation*? — *"this came from PR #742 after the recovery-seam incident"* | whoever documented the event |

⛔⛔ **If migration treats the author of the history as the owner of the constraint, it creates
accidental authority transfer.** These diverge often, and they diverge most in exactly the 42% of
entries where history has fused with the rule.

**Assignment approach — ⛔ not a 113-row review exercise:**

```
1. group entries by CONSTRAINT FAMILY, not by file
2. identify the person/role who can answer "when does this stop mattering?"
3. only then populate Owner
4. that owner defines the exit_condition
```

## Pass 1 — lifecycle inventory

Q1/Q2 are the owner's. Q3 is measured (all `no`). Q4 is measured (`lineage`).

| # | Entry | Canonical record | B | Lineage | Owner | Exit condition | Disposition |
|---:|---|---|---:|:---:|---|---|---|
| 1 | Now What? Client Home is LIVE | project_now_what_client_home_lane.md | 1480 | yes | | | |
| 2 | Stale checkout mimics the 4th artifact state | feedback_stale_checkout_mimics_fourth_artifact_state.md | 686 | yes | | | |
| 3 | Practitioner Field — provenance constitution | project_practitioner_field_provenance_constitution.md | 673 | yes | | | |
| 4 | Corpus gate LIVE + Covenant Gates ≠ merge control | project_covenant_gate_enforcement_gap.md | 658 | yes | | | |
| 5 | Memory migration checkpoint 08-03 | project_memory_migration_checkpoint_2026-08-03.md | 642 | yes | | | |
| 6 | **Gate 0** (`NOW_WHAT_GATE0_FOUNDATION_PRECHECK_EVIDENCE_2 | ⚠️ NONE | 574 | yes | | | |
| 7 | Now What? ⊥ Larry's Flourishing framework | project_now_what_flourishing_landscape.md | 481 | no | | | |
| 8 | Shared checkout hides a 4th artifact state | feedback_shared_checkout_hides_a_fourth_artifact_state.md | 425 | no | | | |
| 9 | Memory transformation protocol | feedback_memory_transformation_protocol.md | 407 | no | | | |
| 10 | Detector collision — CLOSED by merge | project_detector_characterization_collision.md | 395 | yes | | | |
| 11 | Universal Practitioner Field shape | project_universal_practitioner_field_shape.md | 387 | no | | | |
| 12 | Larry IP — NOT INGESTED (≠ lost) | project_larry_ip_corpus_null.md | 382 | yes | | | |
| 13 | Acceptance walk AMENDED 08-03 | project_phase_6_disambiguation.md | 368 | yes | | | |
| 14 | Remediation state ≠ prior state | feedback_remediation_state_is_not_prior_state.md | 360 | yes | | | |
| 15 | Documentation as false control surface | feedback_documentation_as_false_control_surface.md | 355 | no | | | |
| 16 | Now What? Client Home lane | project_now_what_client_home_lane.md | 353 | yes | | | |
| 17 | Union of concepts ≠ union of authorities | feedback_union_of_concepts_is_not_union_of_authorities.md | 343 | yes | | | |
| 18 | Authority judgment needs a perceivable object | feedback_authority_judgment_needs_a_perceivable_object.md | 342 | yes | | | |
| 19 | Task prompts must not embed the fix | feedback_task_prompt_must_not_embed_the_fix.md | 300 | no | | | |
| 20 | detectRelationalSignal suite | project_detect_relational_signal_suite.md | 295 | yes | | | |
| 21 | AIN OS Experience Constitution | project_ain_os_experience_constitution.md | 280 | no | | | |
| 22 | #919 escape-hatch fix | project_escape_hatch_pointer_919.md | 273 | yes | | | |
| 23 | Practitioner door placement | project_practitioner_door_placement_conflict.md | 268 | yes | | | |
| 24 | STATE_VECTOR egress leak — PR #921 | project_state_vector_egress_leak_921.md | 263 | yes | | | |
| 25 | A study must satisfy the boundary it tests | feedback_study_must_satisfy_the_boundary_it_tests.md | 260 | no | | | |
| 26 | Absent ≠ hidden | feedback_absent_is_not_hidden.md | 252 | no | | | |
| 27 | Writing Intelligence Layer | project_writing_intelligence_layer.md | 246 | yes | | | |
| 28 | Now What? calibration sitting | project_now_what_calibration_sitting.md | 244 | no | | | |
| 29 | Writer's Studio Phase 1 = RELEASE OBJECT | project_writers_studio_phase1_release_object.md | 233 | no | | | |
| 30 | Now What? lane reconciliation 08-03 | project_now_what_lane_reconciliation_2026-08-03.md | 230 | yes | | | |
| 31 | Founder Decision Docket | project_founder_decision_docket.md | 230 | yes | | | |
| 32 | Bring Forward v1 — PARKED | project_bring_forward_v1_branch.md | 225 | no | | | |
| 33 | Absence tests & relational failure | feedback_absence_tests_and_relational_failure.md | 225 | no | | | |
| 34 | Representation crossed without permission | feedback_representation_crossed_without_permission.md | 223 | yes | | | |
| 35 | `/signin` "defect" — RETRACTED | project_signin_entry_surface_defect.md | 220 | yes | | | |
| 36 | Decisions/Changes split | project_decisions_changes_split_ruling.md | 220 | yes | | | |
| 37 | ecosystem review | project_ecosystem_experiential_review_program.md | 210 | yes | | | |
| 38 | Native device-walk PRs | project_house_navigation_contract_pr1.md | 210 | yes | | | |
| 39 | Controls & referents sub-index | feedback_controls_and_referents_index.md | 207 | no | | | |
| 40 | Coach Field foundation | project_coach_field_integrated_foundation.md | 205 | yes | | | |
| 41 | PR collision check BEFORE first edit | feedback_pr_collision_check_before_first_edit.md | 199 | no | | | |
| 42 | Three kinds of incompleteness | feedback_three_kinds_of_incompleteness.md | 197 | yes | | | |
| 43 | Typecheck gate contract | reference_typecheck_gate_is_one_file.md | 196 | yes | | | |
| 44 | Mark→resurfacing trace | project_mark_to_resurfacing_trace.md | 195 | yes | | | |
| 45 | Boundary requires a shared referent | feedback_boundary_requires_shared_referent.md | 195 | no | | | |
| 46 | Capsule draft ⊥ Field declaration | project_capsule_draft_vs_declaration.md | 194 | yes | | | |
| 47 | iOS R1 lane traps | project_ios_r1_testflight_lane.md | 189 | yes | | | |
| 48 | "Phase 6" names THREE referents | project_phase_6_disambiguation.md | 187 | no | | | |
| 49 | Merged ≠ Activated ≠ Verified ≠ Accepted | feedback_merged_verified_accepted_states.md | 185 | no | | | |
| 50 | MAIA & Product | project_maia_product_index.md | 183 | no | | | |
| 51 | Security lanes sub-index | project_security_lanes_index.md | 181 | no | | | |
| 52 | Evidence channel ≠ the capability it resembles | feedback_evidence_channel_vs_capability.md | 180 | no | | | |
| 53 | Practitioner Notes + Client Note | project_studio_practitioner_notes_v1.md | 179 | yes | | | |
| 54 | RELEASE `6defc5fec` LIVE | project_working_draft_write_path_857.md | 176 | yes | | | |
| 55 | Episodic marks — LIVE | project_episodic_marks_live_substrate.md | 176 | no | | | |
| 56 | Mobile & Native sub-index | project_mobile_native_index.md | 175 | no | | | |
| 57 | Lane ownership before branch mutation | feedback_lane_ownership_before_branch_mutation.md | 171 | yes | | | |
| 58 | Deploy path determines runtime correctness | feedback_deploy_path_determines_runtime_correctness.md | 170 | no | | | |
| 59 | Empty measurement ≠ absence | feedback_empty_measurement_is_not_absence.md | 168 | no | | | |
| 60 | Member Experience Design Constitution | project_authors_studio_experience_charter.md | 168 | no | | | |
| 61 | Governance lifecycle chain | project_layer1_lifecycle_gap_ruling.md | 167 | no | | | |
| 62 | Work from the canonical home | feedback_work_from_the_canonical_home.md | 164 | no | | | |
| 63 | Referent ⊥ authority axes | feedback_referent_and_authority_axes.md | 163 | no | | | |
| 64 | Memory compaction is a TRANSFORMATION | feedback_memory_compaction_is_a_transformation.md | 160 | no | | | |
| 65 | Governance candidates sub-index | project_governance_candidates_index.md | 158 | no | | | |
| 66 | Steward of platform coherence | feedback_steward_of_platform_coherence.md | 157 | no | | | |
| 67 | The return test | feedback_the_return_test.md | 156 | no | | | |
| 68 | Promote on observed use | feedback_promote_on_observed_use.md | 156 | no | | | |
| 69 | Verify canonical AND deployed SHA | feedback_urgent_findings_verify_deployed_sha.md | 155 | no | | | |
| 70 | Rendering is not reachability | feedback_rendering_is_not_reachability.md | 153 | no | | | |
| 71 | Practitioner/Studio sub-index | project_practitioner_studio_index.md | 152 | no | | | |
| 72 | Living Works ontology | project_living_works_ontology.md | 151 | yes | | | |
| 73 | Declared durability ≠ durability | feedback_declared_durability_is_not_durability.md | 151 | no | | | |
| 74 | Field Object versioning — UNRULED | project_field_object_versioning_question.md | 150 | no | | | |
| 75 | Soullab landing archaeology | project_soullab_landing_archaeology.md | 147 | no | | | |
| 76 | Standing threads sub-index | project_standing_threads_index.md | 146 | no | | | |
| 77 | Field Illustration & Motion lane | project_field_illustration_motion_lane.md | 145 | no | | | |
| 78 | SimplePractice positioning | project_simplepractice_positioning_counsel.md | 145 | no | | | |
| 79 | `gh pr create --body` fails Covenant Gates | feedback_gh_pr_create_body_fails_covenant_gates.md | 144 | no | | | |
| 80 | Living Work declaration | project_living_work_declaration_gesture.md | 141 | yes | | | |
| 81 | Decision integrity isomorphism | feedback_decision_integrity_isomorphism.md | 141 | no | | | |
| 82 | Member Field re-centering | project_member_field_recentering.md | 140 | yes | | | |
| 83 | **Walk C3 | ⚠️ NONE | 138 | yes | | | |
| 84 | Field Object declaration | project_field_object_declaration_question.md | 138 | no | | | |
| 85 | Declared ≠ derived | feedback_declared_is_not_derived.md | 137 | no | | | |
| 86 | Migration checksum integrity | project_migration_checksum_integrity_lane.md | 137 | no | | | |
| 87 | Environmental Field Studies | project_environmental_field_studies_method.md | 137 | yes | | | |
| 88 | Lane V — practitioner visibility | project_lane_v_practitioner_visibility_authority.md | 136 | yes | | | |
| 89 | Deploy discipline sub-index | feedback_deploy_discipline_index.md | 136 | no | | | |
| 90 | Four governance dimensions | project_four_governance_dimensions.md | 135 | no | | | |
| 91 | Held directions & verified state | project_held_directions_and_state_index.md | 135 | no | | | |
| 92 | Fail-open requires external integrity evidence | feedback_fail_open_requires_external_integrity_evidence.md | 133 | yes | | | |
| 93 | People, project state & ops sub-index | project_people_ops_index.md | 132 | no | | | |
| 94 | Session creation BROKEN | project_session_creation_team_id_break.md | 128 | yes | | | |
| 95 | Author writing walk protocol | project_author_writing_walk_protocol.md | 128 | yes | | | |
| 96 | Member Workbench Keep slice | project_member_workbench_keep_slice.md | 127 | no | | | |
| 97 | iOS PWA text-input lane | project_ios_pwa_text_input_lane.md | 127 | yes | | | |
| 98 | Three layers of review evidence | feedback_three_layers_of_review_evidence.md | 126 | no | | | |
| 99 | Shared dev DB breaks evidence | feedback_shared_dev_db_breaks_repeatable_evidence.md | 124 | no | | | |
| 100 | BUILD CONVERSATION | feedback_build_conversation_phase.md | 121 | no | | | |
| 101 | #918 merge control gap | project_merge_control_gap_918.md | 120 | yes | | | |
| 102 | State-changing authority is explicit | feedback_state_changing_authority_is_explicit.md | 119 | no | | | |
| 103 | House / Session Room / Arrival | project_house_session_room_index.md | 118 | no | | | |
| 104 | Standing rules & traps | feedback_standing_rules_and_traps_index.md | 117 | no | | | |
| 105 | Phase 2 referent pass | _referent_pass_report_2026-08-02.md | 115 | yes | | | |
| 106 | iOS TestFlight RC1 train | project_ios_testflight_rc1_train.md | 113 | no | | | |
| 107 | Voice & Interface sub-index | project_voice_interface_index.md | 113 | no | | | |
| 108 | Referent pass 08-03 | _referent_pass_report_2026-08-03.md | 109 | yes | | | |
| 109 | Methodology sub-index | feedback_methodology_index.md | 104 | no | | | |
| 110 | Browser pane CANNOT hit-test | reference_browser_pane_cannot_hit_test.md | 103 | no | | | |
| 111 | Claims fail, not architectures | feedback_claims_fail_not_architectures.md | 100 | yes | | | |
| 112 | The Member's World is Primary | feedback_speak_from_members_world.md | 100 | no | | | |
| 113 | Author Studio cluster | project_author_studio_index.md | 91 | no | | | |

⛔ **No disposition in this file is authoritative until its Owner column is filled by that constraint's owner.**
