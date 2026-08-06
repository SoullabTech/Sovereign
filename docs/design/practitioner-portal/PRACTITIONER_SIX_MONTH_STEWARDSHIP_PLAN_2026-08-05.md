# Practitioner Six-Month Stewardship Plan

**Status: CANDIDATE — JUDGED 2026-08-05. This document remains the proposal as submitted; it was
deliberately NOT edited after judgment, so the Candidate act stays legible.**
⛔ **Do not implement from this file.** Judgments: `PLAN_ACCEPTANCE_LEDGER_2026-08-05.md`.
What binds: `PRACTITIONER_PLAN_RECORD_2026-08-05.md` (draft, awaiting ratification).
⚠️ Rows **P4, P6, P8 were AMENDED** in acceptance and **P6 was SPLIT (P6a/P6b)**; **P9's dependency
on P8 was struck**; **P1 proof-sufficiency and the P6→P7 coupling were RULED**. The rows below do
not reflect those amendments — the Record does.
**Date:** 2026-08-05 · Produced under Prompt A of `PRACTITIONER_DISCOVERY_PROMPT_LIBRARY_2026-08-05.md`
**Scope:** the smallest stewardship environment that helps Larry succeed, grow, and evolve during his actual next six months — Harvard Positive Psychology coursework, active executive coaching, reflection, program revision.

> **BUILD GATE.** This plan authorizes nothing. No implementation, migration, or ingestion derives from it. Every row is a candidate for row-by-row founder acceptance. The five human acts (signed agreement → authorized sitting → captured source record → classification → ratification) precede any ingestion; zero Larry-authored sources are held; the rights agreement is unsigned; Attachment A is empty (IP audit §3; Attachment A instrument §0).

### Binding-document provenance note

**All five governance/spec documents named as binding were ABSENT from this checkout** (`feature/labtools-redesign`). None was reconstructed from inference; each was read verbatim from git history at its committed revision:

| Document | Read from commit |
|---|---|
| `docs/specs/PRACTITIONER_WISDOM_FIELD_PRODUCT_DEFINITION_v0.md` (constitution, v0.2) | `72945d1eb` |
| `docs/governance/PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md` (authority schema v1) | `6a521eb5f` |
| `docs/reviews/LARRY_IP_CORPUS_INVENTORY_AUDIT_2026-08-03.md` | `51fea00ad` |
| `docs/governance/PRACTITIONER_WISDOM_CAPTURE_PROTOCOL_v1.md` | `51deb4b2d` |
| `docs/governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md` | `51fea00ad` |

Present in this checkout: the prompt library and `docs/design/INHABITABLE_ARCHITECTURE.md`. Citations below use "Constitution", "Schema", "Audit", "Protocol", "Attachment A" for the five above.

---

## 1. Priority table

Ordering follows the Constitution §8 binding sequence (authority model → bind ALL channels → promotion semantics → ratification → synthetic test → only then onboard Larry). Steps 1–5 complete before any Larry material is inventoried into a system surface — including his own in-system reflections (Constitution §8: Layer 2 work is "the shortest honest path" but "*not* unblocked today").

Dev Test = Succeed / Grow / Evolve / Why-these-six-months, answered per row.

| Priority | Capability | Why now | Success / Growth / Evolution | Evidence that unlocks next step |
|---|---|---|---|---|
| **P1 (M1)** | **Corpus authority gate — ✅ ALREADY DEPLOYED (corrected 2026-08-05, parent-session verification).** The original row here read "merge `c327dd526` and deploy" — that was a stale finding: the commit id is not a trunk ancestor, but the gate itself (`corpusIsComposable()` hard-false at both composition boundaries) reached trunk via **PR #945** and was **deployed at `95b21ce42` on 2026-08-03, provenance-verified, runtime presence confirmed from inside the container at both sites** (unit proof 8/8 + 3 adversarial controls). Prod behavioral proof is **NOT EVALUABLE by design** (corpus NULL on every row — nothing to withhold) and is recorded as the result, not a gap. | Residue, not deployment: (a) carry the NOT-EVALUABLE observation record `855674994` to trunk via its own Class C PR so the durable record keeps the gap half, not only the progress half; (b) the recorded open judgment — accept existing proof vs. run a controlled-fixture behavioral pass — is the founder's choice and inertia must not make it. | S: the Protocol §1.2 promise ("nothing becomes part of your field without your explicit approval") is already architecturally keepable in production. | **P1 is satisfied → the plan begins at P2.** |
| **P2 (M1)** | **Founder ratification of the authority model** — Constitution §3 axes + Schema Part 1–3, as written. A human ruling, zero code. | Both documents are CANDIDATE status awaiting ratification (Constitution §9; Schema header). §8 step 1 blocks everything downstream. Per the prompt library process rule, this is citation of settled design, not re-derivation — only the ratification act is missing. | S/G/E: indirect — nothing below it is legitimate without it. **Six months:** it is step 1 of the binding sequence and costs a sitting of founder attention, not an engineering month. | Ratification recorded (canon or ruling doc) → unlocks P3. |
| **P3 (M1–M2)** | **FieldContribution provenance spine** — implement `PractitionerSource` + `AttachmentAPermission` (Schema §1.1–1.3), the pure permission compiler (Schema Part 2), and the retrieval boundary that scopes queries rather than filtering results (Schema §3.1), **binding BOTH live channels** — `library_sources`→lessons AND `practice_fields.active_field_content` (Constitution §4: "a provenance design that binds only the vault path governs the inert channel and leaves the live one open"). Fail closed on meaning: `unknown` blocks composition (Constitution §3). | Schema §4.3: Parts 1–3 currently describe a control surface that does not exist — a description, not a boundary. The environment that will RECEIVE the first governed source is exactly this spine. | S: when Larry later grants `ground`/`offer` per item, MAIA can serve his clients from his material under authority he actually granted — the checkable differentiator (Constitution §11). G: gives his Layer 2 a container that cannot leak. E: the composition-trace is the raw material of any later evolution view. **Six months:** without it the sitting produces a signed Attachment A that nothing can enforce. | Compiler passes: unsigned Attachment A → empty set; ownership gate refuses `third_party`/`unknown`; both channels demonstrably enter through the gate → unlocks P4/P5. |
| **P4 (M2)** | **Promotion + ratification gestures** — the human status model (Protocol §4: Captured → Understood → Practitioner reviewed → Authorized for MAIA use → Authorized for collective contribution) wired as explicit, recorded, reversible practitioner acts. Every transition a human act, never time-based/accumulative/inferred; MAIA may show what sits unadvanced, never say it is ready (Constitution §5; Protocol §4). Includes version ratification: new upload → `discovered`, prior version stays eligible, only explicit ratify composes (Schema §3.3). | Constitution §5: layer promotion is "the whole ballgame" — the second silent upgrade. §8 step 3–4. | S: Larry controls exactly what MAIA may speak from, per item, per version. G: the Refined→Approved steps of the ratified cultivation lifecycle become real gestures instead of pipeline states. E: recorded lineage (what was promoted from, when, by whom) is his development becoming visible as authored acts. **Six months:** program revision is on his actual agenda — v2 upload without version ratification recreates the silent-replace hazard. | A 2→3 promotion and a version ratify both produce audit rows; reversal works without explanation → unlocks P5. |
| **P5 (M2–M3)** | **Synthetic-practitioner test** — a fictional practitioner with an invented corpus traverses the full chain: capture → classification → signed (synthetic) Attachment A → compile → composition; plus the **absence tests** of Schema §3.2 (counts, ordering, timing, metadata, conversational tell — prove the instrument can see the blocked object before reading a clean result as enforcement). | Constitution §8 step 5, explicitly not optional: "the first real test of a provenance gate must run against material no one is invested in." | S/G/E: none directly — it is the earned right to onboard a real practitioner. **Six months:** it is the last gate before the sitting. | 6-step §8 chain green on synthetic material, absence tests pass → unlocks the sitting (P6). |
| **P6 (M3, human acts + intake seam)** | **Sitting readiness** — (a) human acts, not build items: both agreement versions signed, Attachment A built item-by-item with Larry (rows enter only from Larry naming the item — Attachment A §0), consent-to-record on tape, the five-domain `about_practice` question put to Larry (only he can answer it — Constitution §9); (b) environment side: the **capture intake seam** — immutable hash-anchored recording reference (stored outside the repo per Protocol §3), derived-transcript record naming its parent with a resolvable pointer, classification per `PractitionerSource`, everything `still exploring`/non-composable until the human acts of P4 move it. | Protocol §0: the sitting creates the first primary artifact that exists — the recording IS the source. Protocol §6: the field stays empty through and after the sitting; the first corpus enters through the same gate every future practitioner uses. | S: the derivation chain (Protocol §3) that never reverses is what lets his real teaching corpus eventually serve clients without a Soullab translation carrying source weight (the incident class — Constitution §1). G: the sitting's first-class question — "what do you still want to become as a practitioner?" — is the Layer 2 seed (Protocol §6). E: baseline of his language, framework, boundaries in his own words. **Six months:** every downstream capability waits on this event. | Signed agreement + populated Attachment A + first `PractitionerSource` rows at `discovered` with correct classes → unlocks P7. |
| **P7 (M3–M6)** | **Layer 2 Development Field workbench** — the private, non-authoritative capture-and-reflect surface for the Captured→Connected→Reflected-on segment of the cultivation lifecycle: quick capture of Larry's OWN reflections (coursework integration in his own synthesis — never Harvard text, which is Class C/Mitchell per Audit §2f-bis; post-session practice observations *about his practice*, never client material — Constitution §6.3); linking a capture to earlier captures (Connected); the §6.4 practice loop (Idea → Experiment → Reflection → Refinement) held as `still exploring`. Arrival surface honors the honest empty state: "I don't know your work yet. Help me understand it" (Constitution §12.12) — no templates, no Commons defaults. Surface design under `INHABITABLE_ARCHITECTURE.md` (floor plan before code; plain language at the doorway); IA placement deferred to Prompt B. | This is the center of gravity of Larry's actual six months: a student-practitioner integrating coursework with live coaching. Constitution §8: Layer 2 development work with his own in-system reflections is "the one part of the Larry relationship that is not blocked" by the unsigned agreement — once P1–P5 are done. | S: session prep grounded in his own maturing distinctions (via existing prep substrate) rather than memory. G: the dojo itself — reflection, integration, "what am I noticing / what do I now believe" (Constitution §2 Layer 2). E: everything captured here is the substrate his later promotions and evolution view are made of. **Six months:** coursework runs now; unreflected learning evaporates now. | Weekly real use by Larry; first practitioner-initiated 2→3 promotion candidate appears → unlocks P8 timing and validates the P4 gestures with a real practitioner. |
| **P8 (M4–M6)** | **Program revision under version governance** — connect the existing program substrate (`field_program_lessons` + `field_program_revisions`, `programAuthoringService`) to P4's version-ratification semantics so Larry's planned program revision runs as: revise → new version at `discovered` → prior version stays live → explicit ratify. Offerings already made pin `source_version_at` and fail closed (Schema §3.3; Bring Forward ruling cited there). | Program revision is named in Larry's actual six months. The substrate exists; the *governed transition* does not — and Schema §3.3 marks "the dangerous moment is later, not at ingestion." | S: he can revise the program he coaches with, without silently changing what clients already received. G: the Refined step of the lifecycle exercised on his central artifact. E: revision lineage = his program's development made visible. **Six months:** the revision happens in this window with or without governance; with is the point. | First real lesson revision ratified through the gesture; no silent replacement observed. |
| **P9 (M5–M6)** | **Evolution trace, minimal** — a chronological, read-only view over Larry's OWN captures, links, and promotion acts: "what you captured in September; what it became by January." Strictly Path A (own material only); no scoring, no stage assignment, no readiness judgment, no themes MAIA inferred (Constitution §2 balance-shift warning, §10; prompt library Evolve-domain constraint). MAIA may show what sits unadvanced in Layer 2; it may not say it is ready (Constitution §5). | The Evolve domain is "the layer almost no software supports" (prompt library) — and it is only honest once there are months of real captures to show. Built last because its input is P7's accumulated record, not because it matters least. | S: indirectly — a practitioner who can see their thinking change coaches from firmer ground. G: revisiting old ideas in light of new experience (the prompt library's own definition). E: this IS the evolve capability, in its smallest defensible form. **Six months:** by month 5 there is a real record; earlier there is nothing true to show. | Larry uses it in a monthly review; any request for more (search, comparison) becomes *observed* need, per promote-on-observed-use. |

**Row count: 9.**

> **Dependency labeling (verification annex, 2026-08-05).** Six of the eight inter-row links are
> constitutional or evidential necessity. Two are not, and are labeled here so acceptance acts on
> the real structure:
> - **P6 → P7 is an OPEN FOUNDER RULING, not a deduction** — see open question 9. P7's hard
>   dependency is P2–P5. Do not treat the sitting as a gate on P7 until ruled.
> - **P7 → P8 is TIMING, not sequence law** — P8's hard dependency is P4 plus Larry actually
>   revising the program; it may run parallel to P7 without violating any ruling.
>
> **Prohibition authority (annex §B).** The no-reactivation rows number **seven** (N5, N7, N8, N9,
> N10, N11, N16), in two tiers: N5/N9/N10/N16 are binding today on prior founder rulings; N7/N8/N11
> draw their force from the constitutional candidate — **accepting them and accepting P2 are the
> same act.** Rejecting one requires amending the candidate before ratifying it, not striking a
> plan row.

---

## 2. Negative recommendations — do NOT build these yet

Each row: reason, and the evidence or human act that would reactivate it.

| # | Do not build | Why not | Reactivation |
|---|---|---|---|
| N1 | **Assessments** (the one true greenfield) | Fails Dev Test Q4: not in Larry's actual six months (coursework, coaching, reflection, revision). Greenfield build with zero observed practitioner need. | Larry (or a second practitioner) names an assessment he actually delivers; founder acceptance of a scoped spec. |
| N2 | **Commons contribution surface / scope axis (§12)** | Constitution §12.8: Cat 1 preserved direction; contribution mechanics before a second field exists = "specifying a relation with only one term." §8 step 7 (second practitioner observed) unreached. | A second practitioner field in real use, then design against observed need. |
| N3 | **Language Field (voice/phrase capture)** | Constitution §6.6: 🔴 not authorized; requires its own ruling; admissible only from Class A / `created through experience` material — none exists yet. | Founder ruling on §6.6 AND a real Class A corpus post-sitting. |
| N4 | **Any client-derived input path — at any scope, including `own_field`** | Constitution §6.3 (highest-risk input), §12.5 (excluded, not bounded): the client's material is not the practitioner's to promote; `sessions.notes` carries plaintext PHI (open lane, #899 prerequisite); no consent instrument exists. | A dedicated member-consent instrument, its own founder ruling, and #899 resolved — none of which this plan proposes. |
| N5 | **Development stage/score/level surfaces** | Constitution §2: the balance shift is "a description of a trajectory, never a measurement"; §10: a growth score inverts the sovereignty test. Never analytics or scoring (Path A ruling). | Nothing reactivates this. Standing prohibition, not a deferral. |
| N6 | **The §6.7 capability-toggle roster as built features** (Community, Courses, Certification, Publishing, Assessments toggles) | Constitution §6.7: "a sketch, not a roadmap"; promote on observed use — no abstraction on an imagined second practitioner. | An observed second use, per the standing ruling. |
| N7 | **Anonymized pattern extraction / cross-practitioner aggregation** | Constitution §12.4: "the extraction vector wearing the vocabulary of governance"; class laundering must be structurally impossible; no single practitioner can authorize an aggregate grant. | Nothing reactivates the aggregation form. Standing prohibition. |
| N8 | **Consensus indicators, popularity-weighted retrieval, "best practice" framing** | Constitution §12.10: each converts commons into canon; the threat model is emergence, not bad actors. | Standing prohibition. |
| N9 | **Gating composition on `status` / readiness completeness** | Schema §4.3: `status` is a form-filled heuristic; gating on it means "composable once someone finishes typing" — a false control surface. Explicitly rejected control (Constitution §4). | Never in this form; the authority gate is the distinct ratification state (P4). |
| N10 | **Revision history as a review/authority control** | Constitution §4, rejected control: proves change, never that the practitioner reviewed what MAIA may compose. | Never in this form. |
| N11 | **MAIA readiness nudges** ("this reflection looks ready to promote") | Constitution §5: promotion may not be suggested in a way that nudges toward claiming authorship; Protocol §4: MAIA may show, not say ready. | Standing prohibition. |
| N12 | **Reopening `corpusIsComposable()` / any composition of practitioner corpus before the P2–P5 chain + per-item ratification** | Constitution §9: this document set does not reopen it; the gate is the boundary the incident (63,861-char false-relationship corpus, Constitution §1) proved necessary. | The §8 chain complete AND a ratified, signed, per-item grant compiling to eligibility — then composition happens *through* the gate, which is never "reopened" wholesale. |
| N13 | **Ingesting any pre-existing Larry material, or pre-populating Attachment A from Soullab documents** | Agreement unsigned; Attachment A deliberately empty; zero Class A sources located (Audit §3); pre-filling from our synthesis compounds the five-vs-six-domain error (Attachment A §0). Harvard PSY 1060 slides are Jason Mitchell's — never on the A list (Audit §2f-bis). | The five human acts, in order. Rows enter only from Larry naming the item. |
| N14 | **Shared authoring / voice engine, publishing pipeline** | Prompt library archive: BLOCKED on the #764 authenticated founder writing walk; standing ruling — no further architecture rounds until the walk. Q10 exclusions in force. | #764 walk completes AND author evidence exists. |
| N15 | **Engineering fix of the five-domain error in `about_practice`** | Standing ruling (covenant-gate lane): engineering must NOT fix it; fixable only from Larry's own language (Constitution §9: "a translation-fidelity question only Larry can answer"). | Larry answers it at the sitting (P6 human-acts list). |
| N16 | **Templates, Commons defaults, or "starter frameworks" filling the empty field** | Constitution §12.12: each is a system-supplied answer occupying the place where the practitioner's authority belongs; the honest empty state is a feature. | Nothing. The empty state is the milestone, not a gap. |
| N17 | **Commons as a text corpus (Layer 1 holding third-party text)** | Constitution §2: ⛔⛔ pointer layer, not a text corpus — a rights constraint already ruled. Larry's ~44 course readings are Class B pointers at most (Audit §2f-bis). | Only §12.1 contribution (Class A, authored, explicit grant) ever puts text in the Commons — and that is behind N2. |

**Negative recommendation count: 17.**

---

## 3. Larry's workflows through the environment

Grounded in the ratified cultivation lifecycle: **Captured → Connected → Reflected on → Practiced → Refined → Approved → Available to clients** — readiness-to-offer LAST, never first. Active from month ~3 (post-sitting); before that, his only "workflow" is the human acts of P6.

### Weekly (the working rhythm — Layers 2 only, nothing composable)

| When | Act | Lifecycle step | Substrate |
|---|---|---|---|
| After each coursework session | Capture his OWN synthesis of what he's learning — his words, never the slide text (Class C) | **Captured** | P7 workbench |
| After coaching days | Capture practice observations *about his practice* — what he tried, what he noticed; no client material (N4) | **Captured** | P7 |
| Once weekly | Link new captures to earlier ones — "this connects to what I noticed in September" | **Connected** | P7 |
| Once weekly | One deliberate reflection: what am I noticing? what do I now believe? (Constitution §2, Layer 2) | **Reflected on** | P7 |
| Before sessions | Session prep from existing prep substrate; from M4+, alongside his own Layer 2 distinctions | (Succeed side) | `sessionPrep.ts`, existing routes |
| In sessions with clients | Try an emerging distinction — the §6.4 loop's Experiment step; the system records nothing about the client | **Practiced** | none (lived practice) |

### Monthly (the stewardship rhythm — where governed transitions live)

| Act | Lifecycle step | Substrate |
|---|---|---|
| Review what sits in Layer 2 unadvanced — MAIA shows, never judges ready | — | P7 + P4 |
| Refine one emerging distinction into a worked draft — still `still exploring` | **Refined** | P7 |
| If — and only if — he chooses: explicit promotion 2→3 with recorded lineage (what from, when, by whom); reversible | **Approved** (Authorized for MAIA use) | P4 gestures |
| Program revision pass: revise a lesson → new version at `discovered` → explicitly ratify or hold | **Refined → Approved** on the program artifact | P8 |
| Only for material already Approved, a separate per-item grant makes it client-facing — a distinct consent, never bundled (Protocol §4) | **Available to clients** | P3 compiler (`offer` × `member_visibility`) |
| Month 5–6: read the evolution trace in the monthly review | (Evolve) | P9 |

---

## 4. Substrate reuse map

Checkout surveyed: `feature/labtools-redesign` working tree. Anything marked **BRANCH-ONLY** is NOT platform state and must not be cited as capability.

| Plan row | Existing substrate it builds on | State |
|---|---|---|
| P1 | `corpusIsComposable()` gate | **ON TRUNK + DEPLOYED** (corrected 2026-08-05) — landed via PR #945; present in `origin/clean-main-no-secrets:lib/practiceField/practiceFieldService.ts`; deployed `95b21ce42` 08-03, runtime-verified in-container at both sites. ⚠️ Commit `c327dd526` is not a trunk ancestor — measuring the commit id instead of the object is what produced the original stale "branch-only" claim; NOT in this checkout remains true (this branch predates the merge). |
| P3 | Composition channels to bind: `lib/practiceField/practiceFieldService.ts` (`formatFieldContextForRoom`, `buildPracticeFieldContext`, `getPracticeFieldBySlug`), `lib/maia/roomComposition.ts` (`resolveFieldBlock`); `PUT /api/practitioner/practice-field` writes `active_field_content` | In checkout; the unguarded live path Schema §4.1 describes. P3 adds the missing spine; tables/compiler are net-new (Schema Part 4: ❌ not built). |
| P3/P8 | `library_sources` lifecycle `uploaded→processed→reviewed→ratified→archived` (migrations `20260130000001`, `20260714000001`, `20260727000001` ingest integrity) | In checkout. ⚠️ Constitution §1: this is an **editorial trust gate, not a rights gate** — reused for pipeline tracking only, never as the authority gate (N9). No `authored_by`/`rights_status` columns exist anywhere — the "one axis short" gap P3 fills. |
| P6 | Recording custody precedent: `/Users/soullab/Larry_Corpus/` outside-repo convention (Protocol §3) | Convention, not code. Intake seam is net-new. |
| P7 | Practitioner shell: `app/studio/*` (~30 rooms incl. `field`, `portal`, `materials`, `programs`), practitioner auth (`lib/auth/getCurrentPractitioner.ts`, `practitionerAuth.tsx`) | In checkout. ⚠️ Open lane: `/studio` gate is client-side (memory: absent ≠ hidden; payload-level assertion required) — P7's Layer 2 content is private-by-construction and must be server-gated, not shell-gated. IA placement is Prompt B's question. |
| P7/P8 (Succeed side, reused not built) | Clients: `app/api/practitioner/clients/*`, caseload/groups/invites/subscriptions migrations (`20260107…`, `20260118…`, `20260202300001`, `20260122…`). Session prep: `lib/practitioner/sessionPrep.ts`, emergency info, session pipeline migrations. Communication: `lib/practitioner/messages.ts`, messages routes. Programs: `lib/practiceField/programAuthoringService.ts`, `field_program_lessons` + `field_program_revisions` (`20260714000001`) | In checkout — the "capabilities 1–4 substantially built" base. Plan reuses; builds nothing here except P8's governed transition. 🔴 `sessions.notes` plaintext PHI (lane #899) — no wisdom-path may read from it (N4). |
| P9 | Composition-trace + promotion audit rows created by P3/P4 | Net-new view over P3/P4's own records; no legacy substrate. |
| Assessments | — | **Confirmed greenfield**: no assessment migrations or routes found. Stays N1. |

Working-tree provenance caveat (standing ruling): this checkout is a feature branch with uncommitted work; per *verify working-tree state before citing a file as evidence*, any row above cited for implementation must be re-verified against `origin/clean-main-no-secrets` at build time.

---

## 5. Open questions — genuinely undecided, founder-ruling material

Listed without proposed answers, per the prompt spec.

1. **Field Object versioning model** — Schema §3.3 names the constraint it needs but explicitly does not settle the model; the versioning question is 🔴 unruled (`project_field_object_versioning_question`). P8 depends on the constraint only, but a full model needs the ruling.
2. **Demo-field containment — largely EXECUTED since the Schema was written** (Phase 0 remediation, founder-authorized 2026-08-05 evening): `about_practice` replaced on both prod rows with honest Soullab-configured text; the 4 invented `field_programs` doors deleted; `/soul-portrait/larry` withdrawn (PR #986, deployed `72584bdf4`). Remaining open: whether the slug composition path needs a structural gate beyond the current data state.
3. **Larry's own domain language** — the five-domain error is **no longer in production** (Phase 0 replaced it with text making no Larry claims). What remains open is the original question in its clean form: capturing Larry's actual six domains in his own words at the sitting, as first governed content (Constitution §9: only he can answer it).
4. **Language Field authorization** (Constitution §6.6) — requires its own ruling; not proposed here.
5. **Client-derived input consent instrument** (Constitution §6.3/§12.5) — excluded from this plan; whether one is ever designed is a separate constitutional question.
6. **Where the P7 workbench lives in the practitioner IA** — new room vs. extension of an existing Studio room; deliberately deferred to Prompt B (floor plan before code, Inhabitable Architecture).
7. **Who performs Captured → Understood** — Protocol §4 assigns it to "us"; which role, under what review, on which surface is undecided.
9. 🔴 **P6 → P7 coupling — the governing question, left deliberately open (founder, 2026-08-05):**

   > **Does Larry's authorship inside the platform derive its legitimacy from platform participation, or from the prior rights agreement governing the imported body of work?**

   These are different legal and constitutional objects. The rights instrument governs his
   pre-existing IP; reflections he authors *inside* the environment may instead be governed by
   platform terms. ⛔ The answer must come from **the intended relationship with authors**, never
   from schedule optimization — the fact that P6 is calendar-bound and P7 is not is a consequence
   of the ruling, not a reason for it. Until ruled, P7 is treated as gated. Generalizes beyond
   Larry: it is the rule for every practitioner who writes inside the field before signing
   anything about what they bring into it.

8. **P1 residue judgment (founder's, recorded 08-03, still open):** whether the existing gate proof (unit 8/8 + adversarial controls + in-container runtime presence) is sufficient, or a controlled-fixture behavioral pass should run (pinned SHA · isolated env · never production · never the shared dev DB). Neither answer is a defect; inertia must not decide it. Also open: carrying observation record `855674994` to trunk.

---

*End of candidate plan. Acceptance is row-by-row; a rejected row removes its dependents from the sequence rather than reordering them past a gate.*
