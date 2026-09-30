# Writer's Studio Release Evidence + Founder Witness Protocol

**Programme:** WRITERS-STUDIO-STEWARDSHIP-01  
**Status:** implementation contract  
**Primary admin surface:** `/admin/writers-studio`

## 1. North-star principle

Release evidence exists to answer one question:

> **Can a writer safely continue a Work, with authorship and continuity intact, on the exact production artifact we claim is running?**

The dashboard observes the Studio's structural behavior, not the writer's prose.

## 2. Release evidence model

A release is an identity-bearing object, not a deploy note.

### Release identity

Each release declares:

- `release_key` — human-readable release identity, e.g. `R2.0-RETURN-RELATIONSHIP`
- `title`
- `phase`
- `candidate_sha` — exact reviewed candidate
- `canonical_parent_sha`
- `status` — draft / candidate / founder_witness / beta / released / held / rolled_back
- `migration_set`
- `feature_flags`
- `rollback_plan`
- `what_changed`
- `remains_uncertain`
- `falsifier`

The candidate SHA is the binding identity. Evidence does not inherit across a changed head.

### Evidence item

Evidence is append-only. A later result may supersede an earlier one, but the earlier record remains part of the release history.

Each evidence item carries:

- release identity
- gate `G0..G10`
- status: `grey | green | amber | red`
- evidence type
- a concise claim/result summary
- an evidence reference when one exists
- timestamp
- recorder identity
- a structured payload for method, population, sample, uncertainty and machine-readable details

### Metric snapshot

Metrics are aggregated snapshots, never raw manuscript telemetry.

Each snapshot carries:

- release identity
- metric identity
- measurement window
- value and optional numerator / denominator
- sample count
- status
- notes
- calculation timestamp

**Grey means insufficient evidence. Grey never means pass.**

## 3. Universal release gates

| Gate | Name | Release question |
|---|---|---|
| G0 | Identity | Are admission, test and deploy bound to the same exact candidate? |
| G1 | Integrity | Do build, typecheck and required tests pass? |
| G2 | Data | Are schema requirements known, applied and reversible? |
| G3 | Authorship | Can writer text change only through explicit writer authority? |
| G4 | Continuity | Do Work, place and context survive supported transitions? |
| G5 | Evidence | Are MAIA claims grounded at the right epistemic level? |
| G6 | Recovery | Can failures recover without loss or false success? |
| G7 | Experience | Can a writer complete the promised journey without developer help? |
| G8 | Observability | Will structural failures be visible without reading writer content? |
| G9 | Production | Is the exact tested artifact the artifact actually running? |
| G10 | Return | Is rollback defined and sufficiently witnessed? |

Any RED gate blocks cohort expansion. G0, G2, G3, G6 or G9 RED triggers immediate stop / rollback assessment.

## 4. Core metric set

The first dashboard set is deliberately small:

1. **Meaningful Continuation Rate** — eligible returns that become a substantive Work act without recovery failure.
2. **Lost Writing Incidents** — any writer-authored content lost. Hard red when > 0.
3. **Silent Mutation Incidents** — manuscript changed without explicit writer authority. Hard red when > 0.
4. **Return Fidelity** — return restores the intended Work / manuscript / meaningful locus.
5. **Passage Action Reliability** — valid passage selection successfully yields its contextual action.
6. **Undo Reliability** — explicit Undo restores the authorized prior manuscript state.
7. **Evidence Traceability** — substantive developmental/review claims can navigate to supporting evidence.
8. **Dead Ends** — member reaches a state with no lawful continuation or recovery path.

Later metrics may be added only when their behavioral meaning has been validated. Engagement, session length, MAIA-call volume and proposal acceptance are not north-star success measures.

## 5. Telemetry privacy rule

`WS-METRICS-PRIVACY-01`

Writer's Studio product telemetry observes **the behavior of the Studio, not the content of the writer**.

Default stewardship evidence must not contain:

- manuscript prose
- selected passage text
- source contents
- prompt bodies
- MAIA response bodies

Permitted structural examples include:

- opaque Work/manuscript/section identifiers
- release SHA
- route/mode
- event type
- duration
- success/failure/recovery outcome
- proposal/revision identifiers
- gate and metric aggregates

Founder screenshots or qualitative notes that intentionally include content are a separate explicit witness corpus, never silent product telemetry.

## 6. Founder witness protocol

### Purpose

The Founder Witness proves the release's promised human journey on the actual member-facing environment. It is not a developer QA session.

### Preconditions

Before the walk:

1. exact candidate SHA is frozen;
2. required CI for that exact SHA is green;
3. migrations and rollback are known;
4. production runtime SHA is independently checked;
5. a designated real founder Work is chosen;
6. no tuning or code changes occur during the witness.

### Ordinary-use rule

Run the core walk through the normal member UI.

Do **not** use DevTools, database queries, direct API calls or source inspection to make the experience succeed. Those tools may be used only after a falsifier is recorded.

### Core walk

1. Open the exact production Writer's Studio URL and confirm the release identity separately.
2. Enter the intended Work from Studio Home.
3. Write new prose and witness save state.
4. Select one passage and open the contextual passage action.
5. Discuss the passage with MAIA; confirm discussion alone does not mutate manuscript text.
6. Request a revision and compare it with the original.
7. Read the proposal in context.
8. Apply explicitly; verify only the authorized passage changes.
9. Undo; verify the prior passage returns.
10. Move Write → Develop → evidence/passage → Write and verify identity/place continuity.
11. Leave through ordinary use; later return through the ordinary member door and continue meaningfully.
12. Exercise one bounded stale-address or recoverable-failure case and verify honest recovery.

### Outcome vocabulary

**PASS** — promised journey succeeds without repair or hidden intervention.

**FRICTION** — the journey remains truthful and recoverable, but comprehension or flow is meaningfully impaired. Do not expand cohort until adjudicated if friction is recurrent or architectural.

**FAIL** — a promised invariant is false, writer authorship/data is at risk, identity is wrong, the journey dead-ends, or developer intervention is required to continue.

**HOLD** — evidence is insufficient or contradictory. HOLD is not PASS.

### First-falsifier rule

At the first release-relevant falsifier:

1. stop the walk;
2. record exact time, route, release SHA and structural state;
3. preserve the screen/evidence;
4. do not tune the system mid-witness;
5. classify the violated gate;
6. decide repair / rollback / bounded retest;
7. begin a new witness only on a newly frozen candidate.

### Immediate stop falsifiers

- wrong or unexpected Writer's Studio generation appears;
- runtime SHA does not equal the release artifact;
- manuscript identity changes unexpectedly;
- writer text is lost;
- MAIA mutates text without Apply;
- Apply changes outside the authorized range;
- Undo cannot restore the prior state;
- a supported mode transition loses the Work or place;
- return opens the wrong Work or falsely claims a place;
- an error state has no honest recovery;
- a migration or schema expectation is false.

## 7. Release-specific founder witnesses

The universal walk is supplemented by the release promise:

- **R0 One Studio:** every equivalent historical door converges on the canonical Studio; distinct legacy tools remain intentionally distinct.
- **R1 Trustworthy Write:** sustained writing, save, selection, editorial proposal, Apply and Undo.
- **R2 Return + Relationship:** leave/return and cross-mode MAIA relationship continuity.
- **R3 Development:** maturity-aware observation → evidence → discussion → manuscript return.
- **R4 Whole Work:** whole → local → whole traceability.
- **R5 Review:** scoped finding → evidence → discuss → return, with no direct mutation.
- **R6 Sources + Lineage:** source/manuscript/interpretation boundaries remain distinct.
- **R7 Produce:** exact manuscript/version produces reproducible artifacts without source mutation.
- **R8 Living Field:** identity survives manuscript ↔ map ↔ field ↔ recursive representations.

## 8. Dashboard status law

- **GREEN:** all hard gates pass; no unresolved blocking incident.
- **AMBER:** no authorship/data-loss risk, but meaningful friction exists; hold cohort size.
- **RED:** integrity/identity/authorship/data/recovery/provenance risk; stop and assess rollback.
- **GREY:** insufficient evidence.

The dashboard must never infer GREEN from absence of errors.

## 9. Release completion record

A release is not complete until its evidence card can answer:

- What changed?
- What became possible?
- What remains uncertain?
- What would falsify the release?
- Which exact SHA was tested?
- Which exact SHA is running?
- What is the rollback act?
- What did the Founder Witness observe?
- What did the beta population observe?
- Are the north-star and hard-red metrics acceptable for the declared population and window?
