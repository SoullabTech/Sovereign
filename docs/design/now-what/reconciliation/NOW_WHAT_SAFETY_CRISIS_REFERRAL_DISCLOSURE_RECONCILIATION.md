# NW-S01 — SAFETY, CRISIS, REFERRAL & DISCLOSURE RECONCILIATION

**Unit**: NW-S01 · **Date**: 2026-08-26 · **Authorized**: founder ruling 2026-08-26
**Destination**: Layer 3 and constitutional infrastructure. **This must never become a
member-facing taxonomy.**

> **Status of this document**: it is a *source-bound architecture*, not clinical content. The
> member-facing language in the risk classes is drafted to be reviewed, not shipped. **No
> escalation copy in this document may go to production before qualified clinical and legal
> sign-off** (see LEGAL/CLINICAL REVIEW GAPS).

---

## SOURCES

Retrieved 2026-08-26. Primary/high-authority only, per the founder's source hierarchy.

- [NIMH — Warning Signs of Suicide](https://www.nimh.nih.gov/health/publications/warning-signs-of-suicide)
- [NIMH — Frequently Asked Questions About Suicide](https://www.nimh.nih.gov/health/publications/suicide-faq)
- [NIMH — Suicide Prevention](https://www.nimh.nih.gov/health/topics/suicide-prevention)
- [SAMHSA — Safety Plan (988)](https://www.samhsa.gov/resource/988/safety-plan)
- [SAMHSA — Build a Safety Plan](https://www.samhsa.gov/resource/988/build-safety-plan-video)
- [988 Lifeline — Stanley/Brown Patient Safety Plan Template](https://988lifeline.org/wp-content/uploads/2017/09/Brown_StanleySafetyPlanTemplate1.pdf)
- [SAMHSA — 2025 National Guidelines for a Behavioral Health Coordinated System](https://988crisissystemshelp.samhsa.gov/sites/default/files/2025-04/national-guidelines-crisis-care-pep24-01-037.pdf)
- [ICF — Code of Ethics](https://coachingfederation.org/credentialing/coaching-ethics/icf-code-of-ethics/)
- [ICF — Referring a Client to Therapy: A Set of Guidelines](https://coachingfederation.org/wp-content/uploads/2024/12/icf-research-guide-referring-client-to-therapy.pdf)
- [ICF — Coaching vs. Therapy, Setting Professional Boundaries (Standard 3.7 case study)](https://coachingfederation.org/resource/coaching-ethics-case-study-standard-3-7/)
- [ICF — 2025 Core Competencies](https://coachingfederation.org/wp-content/uploads/2025/09/icf-cs-core-competencies-2025.pdf)

**Not retrieved, and required before implementation**: jurisdiction-specific legal duties for
Larry's actual service context. See gaps.

## EVIDENCE

**NIMH.** Immediate-risk warning signs include talking about wanting to die or kill oneself;
feeling empty, hopeless, or having no reason to live; feeling trapped or that there are no
solutions; and **making a plan or looking for ways** to do it. Other signs: extreme mood swings,
increased substance use, dangerous risk-taking, sleeping or eating much more or less. **Response
guidance**: if someone says they are going to kill themselves, *do not leave them alone* and *do
not promise to keep it secret*. **911 for life-threatening situations; 988 for suicidal crisis or
emotional distress**, 24/7, free and confidential, by call, text, or chat at 988lifeline.org.

**SAMHSA / 988.** Safety planning is a recognized **non-emergency** intervention with six steps:
warning signs · internal coping strategies · people and places for distraction · people to ask
for help · professionals and crisis resources · making the environment safer. Critically for this
architecture: **SAMHSA frames the plan as made with a counselor, provider, or someone you trust
— not autonomously by a tool.**

**ICF.** Referral is an *ethical obligation*, not a courtesy. The first Core Competency requires
clearly communicating the distinctions between coaching and other support professions, **knowing
when a referral is needed, and being familiar with available resources.** Code of Ethics §3.23
requires encouraging a change when the client would be better served by another resource; §3.7
governs the coaching/therapy boundary. ICF's practical threshold: **refer when the problem
interferes with everyday functioning — professionally, personally, or socially.**

**Consequence.** All three sources converge on the same shape, and it is *not* a detection
system: **know the boundary, state it plainly, keep the resource at hand, and route to a human.**
None of them asks a non-clinician to assess risk. This is the architecture the product should
build, and it is considerably more modest than "safety detection."

---

## CURRENT CODE PATH

`components/now-what/NowWhatRoom.tsx` → `POST /api/now-what/interview` →
`composeRoomTurnPrompt()` (`lib/maia/roomComposition.ts:292`) →
`getLLMProvider().generateSimple()`.

Composition order when it runs:
`[ MAIA_RUNTIME_PROMPT, presence, fieldBlock, positionBlock, lessonBlock, roomPrompt ]`.

## CURRENT BYPASSES

| # | Bypass | Location | Nature |
|---|---|---|---|
| 1 | **Mode** — `if (mode === 'turn')` guards composition, so `propose` runs on `PROPOSE_SYSTEM` alone with no floor | `app/api/now-what/interview/route.ts:327` | **Unconditional.** Not flag-dependent. Sits on the product's most interpretively loaded operation |
| 2 | **Feature flag** — `if (!presenceEnabled && !fieldBlock) return { systemPrompt: roomPrompt }` | `lib/maia/roomComposition.ts:285` | Env-dependent. Production value unread |
| 3 | **Model routing** — `tier` + `forceClaude: cloudRegisterPinned()`; under `LOCAL_TIER_ENABLED` a local model may serve the turn | `interview/route.ts` → `LLMProvider` | The prompt travels; **instruction-following does not**. Presence guaranteed, efficacy not |

**And the floor has no safety content.** `lib/consciousness/MAIA_RUNTIME_PROMPT.ts` contains no
crisis, referral, scope, or stopping instruction. Its only adjacent lines are voice constraints
that point *away* from safety: *"not a therapist or technician"*, *"no therapeutic-sounding
frameworks"*, *"less clinical"*. Per the founder ruling, **these remain legitimate voice
constraints and do not count as safety.**

---

## ⚠️ CORRECTION — THE NOTIFICATION CONFLICT DOES NOT EXIST

**This corrects the finding I reported in the relational-architecture amendment and which the
founder ruled against. The premise of that ruling was wrong, and it was my error.**

`database/migrations/20260121_between_session_container.sql:139`:

```sql
COMMENT ON COLUMN client_messages.urgency IS
  'Client self-selected: not_urgent, time_sensitive, safety_concern';
```

**The existing practitioner notification is triggered by the member's own selection, on a message
the member deliberately composed and sent to their practitioner.** There is **no system detection
anywhere in that lane.** `urgency` is a CHECK-constrained member choice; `safety_concern_logs`
records only that a member-flagged message was logged, whether the notification email sent, and
whether the practitioner acknowledged it.

So the existing lane is **already fully compliant** with the member-act rule — by a member act
twice over: composing the message, and labelling its urgency. There is no constitutional
inconsistency between the two lanes. What I read as an automatic disclosure is a member pulling a
cord they chose to pull.

**Consequences for the founder ruling:**
- **Nothing needs freezing.** No automatic third-party safety notification exists to expand. The
  ruling's preservation clause has no subject.
- **The genuinely open question is narrower and entirely greenfield**: what happens when MAIA
  encounters concerning content in **private reflection the member has not sent to anyone.** No
  member act has occurred there. That case has no precedent in the codebase.
- **One design asset transfers directly**: the member-selected urgency pattern is a proven,
  consent-clean way to let a member escalate. It should be the model for the Now What? off-ramp.

**One finding stands**: `safety_concern_logs` has **no risk-class field** — it cannot distinguish
non-imminent from imminent. The founder's *"not a single boolean called `safety_concern`"* is
correct as a design requirement for anything new; it is not a defect in the existing lane, where
the label is a member's word for their own message, not a system risk classification.

---

## RISK CLASSES

Eight classes per the founder's directive. **No class permits the system to assess, score, or
assign risk.** Each is a response to explicit present-tense content. Where a class says
"continue", it means MAIA remains in ordinary conversation — no special handling, because
over-escalation is itself a harm and is this product's likelier failure mode.

**Applies to every class**: nothing persists as risk state (see PERSISTENCE RULE) · no
third-party disclosure without member act (see MEMBER-ACT RULE) · language offers and checks,
never diagnoses.

### A — Ordinary uncertainty / ordinary emotional difficulty
The product's core case. **Qualifying evidence**: none needed — this is the default.
**System may ask**: anything ordinary to the room. **Must not infer**: that difficulty is
pathology. **Conversation**: continues normally. **Off-ramp**: the standing coach relationship,
always visible, never urged. **Resources**: none surfaced. **Disclosure**: none. **Telemetry**:
none. **Persistence**: ordinary member-authored material only.

### B — Elevated distress, no self-harm content
**Qualifying evidence**: explicit statements of overwhelm, exhaustion, hopelessness *without*
reference to death or self-harm. **System may ask**: how they are doing right now; whether they
want to keep going or stop. **Must not infer**: depression, a diagnosis, a trajectory, or a
"pattern". **Conversation**: continues, with reduced demand — shorter turns, fewer questions, no
proposals. **Language**: *"That sounds like a lot to be carrying. We can stay with it, or stop
here — whichever helps."* **Off-ramp**: the human coach, offered once, not repeated.
**Resources**: none pushed; ICF's functional-interference threshold is the marker for gently
naming that some things are better served outside coaching. **Disclosure**: none.
**Persistence**: none of the distress; only what the member authors.

### C — Explicit passive death wish / self-harm content, no active intent
**Qualifying evidence**: explicit statements matching NIMH warning signs — wanting to die,
feeling empty or having no reason to live, feeling trapped, being a burden — **without** current
intent, plan, or means. **System may ask**: a direct, calm check on immediate safety. It may
**not** conduct a risk assessment, administer screening items, or ask for method detail.
**Must not infer**: severity, likelihood, or a clinical state. **Conversation**: pauses its
ordinary structure. No thread proposals, no practices, no forward motion. **Language**:
*"What you just said makes me want to check on your immediate safety."* — the founder-ruled
formulation. **Resources**: **988 surfaced** (call/text 988, chat 988lifeline.org) as available
support, not as a dismissal. **Off-ramp**: the human coach, plus 988. **Disclosure**: none
without member act. **Persistence**: none. **Telemetry**: existence of a class-C response only,
member-unidentifiable, and only if the review authorizes any at all.

### D — Active suicidal thoughts
**Qualifying evidence**: explicit current suicidal thinking. **System may ask**: only whether
they are safe right now and whether they will contact 988 or a person they trust. **Must not
infer or do**: assess, stratify, contract for safety, or generate a safety plan — SAMHSA frames
safety planning as done *with a counselor, provider, or trusted person*, and the product is none
of those. **Conversation**: ordinary room behavior stops. **Language**: plain, unalarmed,
non-abandoning; explicitly does **not** promise secrecy (NIMH), and does **not** claim the
product can help with this. **Resources**: 988 prominently; 911 named for life-threatening
situations. **Off-ramp**: 988 and a human. **Disclosure**: **this is the class the imminent-danger
exception must be defined against — not by this unit.** **Persistence**: none.

### E — Plan, access, immediate intent, or other imminent danger
**Qualifying evidence**: explicit plan, stated means or access, stated immediate intent.
**System may ask**: essentially nothing beyond directing to emergency help. **Must not do**:
anything resembling assessment, negotiation, or delay. **Conversation**: ends its ordinary
function entirely; the surface becomes a route to help. **Language**: direct — **911 for
life-threatening situations, 988 for crisis** (NIMH). NIMH's *"do not leave them alone"* and *"do
not promise to keep it secret"* both bear here and are the strongest argument that a purely
non-disclosing product has a real limit. **Disclosure**: **the narrow exception the founder
authorized — and it is undefined. This class must not ship until clinical and legal review
defines it.** **Persistence**: whatever the reviewed exception requires, and nothing more.

### F — Abuse, coercion, or danger from another person
**Qualifying evidence**: explicit statements of being harmed, threatened, or controlled by
another. **System may ask**: whether they are safe right now; whether they want resources.
**Must not do**: assess the relationship, advise on leaving or staying, ask for detail, or
counsel. **Conversation**: continues only as accompaniment. **Resources**: specialist support
appropriate to jurisdiction — **not yet identified; a review gap.** **Off-ramp**: human, and
specialist services. **Disclosure**: **the highest-consequence consent case in the set** —
disclosure to the wrong person can increase danger. **Nothing reaches a coach, a field, a shared
thread, or any surface another person can see, without an explicit, informed member act.**
**Persistence**: none, and this content must never appear on a Home or shared surface.

### G — Psychosis / mania-like content, severe disorganization
**Qualifying evidence**: explicit content the member presents as real that the system cannot and
must not adjudicate. **System may ask**: little; stay concrete, brief, present-tense. **Must not
do**: interpret, confirm, challenge, or engage the symbolic content. **Specific requirement**:
**MAIA's symbolic, mythic and elemental register is contraindicated here and must be
suppressible** — the register that serves every other class can amplify this one.
**Conversation**: reduced stimulation, short turns. **Off-ramp**: human, and medical care.
**Disclosure**: none without member act. **Persistence**: none.

### H — Medical, legal, financial high-stakes outside coaching scope
**Qualifying evidence**: a request for a decision or advice requiring a licensed professional.
**System may ask**: what the member wants to think through *about* the decision. **Must not do**:
give the answer or a decision framework. **Conversation**: continues — reflection on how the
member *relates* to the decision remains squarely in scope; the decision does not.
**Language**: names the limit plainly, per ICF Competency 1. **Off-ramp**: the relevant
professional. **Note**: **R01-F1 is live here** — the six flourishing domains have no place for
material instability, so a member in financial difficulty has no domain their life fits. Until
D01 rules the vocabulary, MAIA must not force material concerns into an existing domain.
**Disclosure**: none. **Persistence**: ordinary.

---

## MEMBER-ACT RULE

**No content originating in private reflection reaches any third party — coach, practitioner,
family, or service — without an explicit member act.** Ordinary concern (classes A, B, C, F, G,
H) creates **no** disclosure path. The member's own escalation is always available and should be
made easy, modelled on the proven `urgency` self-selection pattern already deployed in the
messaging lane.

## IMMINENT-DANGER EXCEPTION

**Not defined by this unit, and deliberately so.** It applies at most to classes D and E. It
requires: clinical review of thresholds · legal review of duty and jurisdiction · an explicit
statement of what is disclosed, to whom, and on what basis · what the member is told, before and
after · audit requirements.

**Three constraints the architecture should carry into that review**: NIMH's guidance not to
promise secrecy is in real tension with a product whose trust copy promises exactly that, and the
trust copy may need to change *before* any exception ships — a member must not discover the
exception at the moment it fires. Second, the exception must be **narrow, explicit-content-bound,
and never inferential**. Third, **an exception that cannot be operated correctly is worse than
none**: a product that notifies a coach who is asleep, unqualified, or unavailable has
substituted a gesture for help that 911 and 988 actually provide.

## THIRD-PARTY DISCLOSURE RULE

Default: **none, ever, without member act.** The only candidate exception is the reviewed
imminent-danger pathway (D/E). Class F is explicitly excluded from any automatic disclosure under
any future exception — disclosure there can escalate danger.

## PRACTITIONER NOTIFICATION RULE

**No new automatic practitioner notification.** The existing member-selected `urgency` mechanism
stands unchanged and is compliant. Now What? should **reuse that pattern**, not build a parallel
one: a member-initiated "bring this to Larry" act with a member-chosen urgency. Anything
system-initiated waits on the reviewed exception.

## PERSISTENCE RULE

A safety response **writes nothing**: no flag, no field, no ledger row, no memory, no thread, no
`spiralogic_phase`, no `flourishing_dimension`. Safety state is **request-scoped operational
state and does not outlive the turn.** The system does not remember that it was concerned about
someone. Any audit record required by the reviewed exception is a **separate, access-controlled
store** and is never readable by MAIA, the member model, or any coaching surface.

## SAFETY / DEVELOPMENT FIREWALL

**`SAFETY STATE ≠ MEMBER MODEL`** — enforced structurally, not by convention.

Safety state must not feed: story · flourishing placement · developmental interpretation · coach
assessment · Larry-derived personalization · long-term memory · `member_field_note_threads` ·
prompt context on any later turn.

Enforcement recommendation: safety state should live in a type that **has no path** into
`MaiaContext`, the field-note substrate, or prompt composition — and a CI check in the family of
the existing `check-member-owned-boundary.ts` should fail the build if it acquires one. The
project already demonstrates this pattern works.

## REQUIRED CODE REPAIR

1. **Close bypass 1** — move floor composition above the `mode` branch. Best shape: compose at
   the **provider boundary**, so a future mode cannot opt out by omission. Call-site composition
   is what created this bypass.
2. **Close bypass 2** — split `presenceEnabled` from floor composition. Presence may be flagged;
   the floor may not. Remove the `roomPrompt`-only early return.
3. **Mitigate bypass 3** — assume weaker instruction-following. Floor content short, imperative,
   first. For classes D/E, determine whether prompt-level instruction is sufficient at all, or
   whether a non-model check belongs in the path. **Open design question, not decided here.**
4. **Author the floor's safety content** — scope statement, class behaviors, stopping rule, human
   path, 988/911. **Pending review sign-off.**
5. **Make the symbolic register suppressible** (class G).
6. **Witness tests** — floor present in the composed prompt for every mode × flag combination; a
   fixture per class asserting the room does not do the "must not" items; a firewall test
   asserting safety state reaches no member-model surface.

**None of this touches member data, schemas, or migrations.** It is prompt-composition
architecture. Item 4's *content* is blocked on review; items 1, 2, 5, 6 are not.

## LEGAL / CLINICAL REVIEW GAPS

1. **Imminent-danger exception** — thresholds, duty, jurisdiction, consent expectations, audit.
   **Blocking for classes D/E.**
2. **Escalation copy** — every member-facing line in classes C, D, E, F is drafted here **to be
   reviewed, not shipped**.
3. **Jurisdiction** — 988 and 911 are US. Member locale is not established anywhere in the
   product. **A US-only crisis resource shown to a non-US member is a real failure**, and the
   environment currently has no locale signal.
4. **Larry's own obligations** — as a practitioner, his professional and legal duties may differ
   from the platform's and may create duties the product must not obstruct. **Unknown; D01.**
5. **Class F specialist resources** — not identified, jurisdiction-dependent.
6. **Trust-copy reconciliation** — if an exception ships, `RoomTrustCopy` must say so beforehand.
7. **Minors / vulnerable adults** — not considered by this unit; different duties apply.

## FOUNDER DECISIONS REMAINING

1. **Acknowledge the correction** above — the notification conflict does not exist, so the
   freeze ruling has no subject and the open question is narrower (private reflection only).
2. **Authorize items 1, 2, 5, 6 of REQUIRED CODE REPAIR to proceed as NW-I01** ahead of D01 —
   architecture only, floor content pending review. Recommended: yes; bypass 1 is a live defect.
3. **Commission the qualified review** with the seven gaps as its scope.
4. **Rule on locale** — whether the product acquires a locale signal, or restricts to US members
   until it does.
5. **Rule on telemetry** — whether any safety-class counter may exist at all. Recommended:
   none until the review, since even a count is a record that concern occurred.

## STOP
