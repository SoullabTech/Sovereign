# Practice Field (current) ⟷ Practitioner Field (requirement) — ADR Gap Analysis

**Date:** 2026-08-03 · **Status:** ANALYSIS — no build authorized by this document
**Referent (intent):** `docs/specs/developmental-environment/PRACTITIONER_PROGRAM_PLATFORM_ADR_2026-07-14.md` (110 lines, status PROPOSED)
**Referent (implementation):** `lib/practiceField/programAuthoringService.ts` · `database/migrations/20260714000001_practitioner_program_platform.sql` · `lib/maia/roomComposition.ts` · `app/studio/{materials,programs}`
**Method:** ADR read first, implementation read second. **Surface walk NOT performed** — every "Unknown until walked" row below is unmeasured, not passed.

---

## 0. Scope correction carried into this document

The prior framing asked *"should we build a Practitioner Field?"*. Evidence says the substrate exists. The question this document answers is:

> **Is the existing Practice Field infrastructure the correct substrate for a sovereign Practitioner Field, and what must change to make it that?**

Standing constraint (Kelly, this sitting): **Larry is not the test case for whether the infrastructure exists.** Larry is the test case for whether it can hold a practitioner's world without distorting it. This document answers only the first question.

---

## 1. ADR §L migration sequence — declared vs. built

| # | ADR §L item | State | Evidence |
|---|---|---|---|
| L1 | `library_sources` ratification cols + `vault_file_id` | ✅ BUILT | `20260714000001` lines 31–48 |
| L2 | `field_program_lessons` | ✅ BUILT | `20260714000001`; `programAuthoringService.upsertLesson` |
| L3 | Program revisions (PR #586 pattern) | ✅ BUILT | `20260710000002_practice_field_revisions.sql` + `20260714000001` |
| L4 | `runtime_events.program_revision_id` | ❌ **NOT BUILT** | zero occurrences in `database/migrations/`, `lib/` |
| L5 | Event rows (`lesson_opened`, …) | ⬜ NOT BUILT — **compliant** | ADR: *"only when a surface needs it"* |

**L4 is the one silent gap in the declared sequence.** ADR §C names its purpose: *"so any MAIA reply can be traced to the program revision that composed it."* Without it, `composeLessonContext` injects practitioner material into a prompt and **the reply is not traceable to the revision that produced it.** That is a provenance break on the output side, not the input side.

---

## 2. The seven capabilities against the evidence

| Capability | State | Evidence / gap |
|---|---|---|
| Practitioner identity/access | ✅ EXISTS | `app/practitioners/{signup,onboarding}`, `app/api/practitioners/{check,create,verify-passcode}`, `getPractitionerIdForMember` |
| Knowledge corpus | ✅ EXISTS | `practitioner_files` (vault, disk-backed, 100MB, MIME-validated) ⟷ `library_sources` joined by `vault_file_id`; originals immutable |
| Provenance (review lifecycle) | ✅ EXISTS | `uploaded → processed → reviewed → ratified → archived`; `ratified_at`/`ratified_by` stamped from the actor; illegal transitions throw |
| Ownership boundaries | ✅ EXISTS | `getAuthoredField(memberId)` — *"there is no field parameter to reach anyone else's library"* |
| Permissions / composability | ✅ EXISTS | `composeLessonContext` re-checks `review_status = 'ratified'` **at read time**; unratified refs compose as nothing |
| MAIA grounding | 🟡 PARTIAL | `roomComposition.ts:266` composes `lessonBlock` in the ADR §G order, framed *"context not instruction"*. **Missing L4 trace.** |
| Practitioner experience | ❓ UNWALKED | `app/studio/materials/page.tsx`, `app/studio/programs/page.tsx` exist and call the APIs. Reachability, deployment, and lived quality all unmeasured. |

---

## 3. The comparison

### Preserved
- The **custody spine**: field-scoped ownership, immutable originals, append-only revisions, read-time ratification re-check.
- The **absence-of-query doctrine** (ADR §E.2) — no practitioner-keyed query over member positions. This is the constitutional core and it survived into implementation.
- The **untrusted-content posture**: uploaded material is neutralized at save and at compose; framed as context, never instruction.
- **Export-on-departure** (ADR §I) as the technical half of *"if Larry leaves, his work leaves with him."*

### Missing
1. **L4 prompt-provenance** (`runtime_events.program_revision_id`) — declared, unbuilt.
2. **Rights/authorship provenance** — see §4. Not in the ADR, not in the schema.
3. **Export implementation** — ADR §I describes the bundle; no export route found under the practitioner API surface.

### Misaligned
**The ADR's object is a program-authoring platform, not a practitioner world.**

ADR §A ontology: *"a practitioner organizes authored materials into programs so participants can learn, reflect, and continue between human encounters."* Everything downstream serves that sentence — Materials Library, Programs, Focal Points, Lessons.

The corpus taxonomy actually standing on disk at `/Users/soullab/Larry_Corpus/` is six-way:

```
01_Larry_Own_Framework          ← authored by Larry            (EMPTY)
02_Larry_Practice_Context       ← how Larry works              (EMPTY)
03_Larry_Knowledge_Library      ← what shaped Larry — OTHERS' IP  (POPULATED, ~30 files)
04_Recordings_and_Transcripts   ← Larry speaking               (EMPTY)
05_Rights_and_Consent           ← the gate
06_Soullab_Derived_ABOUT_Larry  ← our reading of Larry, not Larry
```

The schema flattens all six into one `library_sources.type` enum (`txt|book|transcript|article|manual|teaching|audio|video|worksheet|exercise|image|link|document`) — a **media-format** vocabulary. There is no column that distinguishes *Larry authored this* from *Larry was shaped by this* from *we wrote this about Larry*.

**This is the misalignment, stated precisely: the platform models what a material IS, not whose it is.**

### Unknown until walked
- Whether `app/studio/materials` and `app/studio/programs` are reachable by an authenticated practitioner on the deployed build.
- Whether migration `20260714000001` is applied in production.
- Whether the ratify gesture is present, legible, and understood as a rights act rather than a "done" button.
- Whether the vault upload path survives a real 100MB media file.
- Whether a practitioner experiences this as *their field* or as *a CMS they were given*.

---

## 4. The load-bearing finding: ratification ≠ rights

`library_sources` carries `author TEXT` (free text, unconstrained, indexed) and `meta JSONB` whose column comment speculatively mentions `lineage`. A repo-wide search for `authored_by`, `rights_status`, `license`, `copyright`, `is_own_work`, `attribution` across all library/material/corpus/vault migrations returns **zero**.

So the ratification lifecycle is an **editorial trust gate** — *"the practitioner has reviewed this and approves it for composition."* It is not a **rights gate** — it makes no claim about who authored the material or under what permission it entered.

### 4a. Correction — the runtime fences impersonation; it does not fence absorption

An earlier draft of this section said MAIA *"will attribute ratified material to the practitioner."* That overstated it. `lib/practiceField/practiceFieldService.ts:239–241` composes a hard fence into every field room:

> *"you are not the practitioner and never speak as them"*

That half is enforced in runtime, not merely declared in the ADR. **The impersonation risk is closed.**

What is not closed is the opposite failure. The same header block continues:

> *"Knowledge stance: you KNOW this practice … you speak from them with easy familiarity. **Never claim not to know** the practitioner, this practice, or its discipline."*

and the corpus is composed **in full** — the code comment reads *"depth is the product."*

So the runtime forbids MAIA from saying *"I am Larry"* while requiring it to speak from the field's material with familiarity and forbidding it to disclaim knowledge. Meanwhile:

- `library_sources.author` **exists as a column**;
- `composeLessonContext` selects `title, type, description` — **not `author`**;
- a search for attribution vocabulary (`attribut`, `by name`, `according to`) across `practiceFieldService.ts` and `fieldGuidance.ts` returns **zero**.

**Attribution has no carrier at compose time, even where the data exists.** The failure mode is therefore not impersonation but **unattributed absorption**: Mitchell's, Gilbert's, and Haidt's ideas enter a room framed as *the field's material*, spoken with mandated familiarity, with no surviving trace of who wrote them. That is a weaker claim than "MAIA pretends to be Larry" and a harder one to detect — which is precisely why it needs a schema object rather than a prompt line.

This restates the `voice_authority` insight in the form the evidence supports: the danger boundary is **whose ideas may be spoken from without citation**, not whose name may be worn.

---

This is not hypothetical. The only populated directory in the corpus is `03_Larry_Knowledge_Library` — Harvard PSY 1060 lecture PDFs (Mitchell), Gilbert's *Stumbling on Happiness* chapters, Haidt's *Happiness Hypothesis* chapters, Lyubomirsky, Oishi & Schimmack, NYT and Atlantic articles. **None of it is Larry's IP.** Standing memory already flags this exact material with a hard prohibition. The one folder that has files in it is the one folder that must never compose as Larry's voice.

The ADR does not catch this, because the ADR's §K non-goal — *"real-IP ingestion before the signed agreement"* — assumes the agreement is the gate. Per standing state, `~/Desktop/Larry Materials Agreement.docx` v1.2 is **UNSIGNED**, and its own §1 says *"if it's not on the list, it's not in the system."* The agreement gates *whether* ingestion may begin. It does not give the schema a place to record *what a given row's rights status is* once it has begun.

**Attachment A is a list on paper. The system has no column that corresponds to it.** That is the gap between the governance instrument and the substrate — and it is the answer to *"is this the correct substrate?"*

---

## 5. Verdict on the two hypotheses

> **(1) Exactly the right foundation**, needing only corpus ingestion and practitioner validation — or **(2) a different object** (a program-authoring CMS) that must evolve.

**Neither, cleanly. It is (1) for custody and (2) for provenance.**

- The **custody architecture is right** and better than the prior framing credited. Field-scoped ownership, read-time ratification re-check, immutable originals, append-only history, absence-of-query — these are the hard parts and they are built correctly.
- The **provenance architecture is one axis short.** It models editorial trust; it does not model authorship or rights. For a *program platform*, one axis is sufficient — the practitioner assembles a curriculum and vouches for it. For a *practitioner field* that speaks in the practitioner's name, one axis is a misattribution engine.

The evolution needed is therefore **narrow and structural, not a rebuild**: add the rights/authorship axis, make Attachment A a schema object rather than a document, and gate the *"Larry's work suggests…"* voice on that axis rather than on ratification.

---

## 5a. Static pre-read of the surface (NOT the walk)

Source-level read of `app/studio/materials/page.tsx`. This is evidence about **authored copy**, not about reachability or lived experience. The walk still owes both.

**Q2 — does the ratify gesture say "I approve use" or "I claim ownership"?** ✅ **It already says use.** Verbatim:

- `'Ratify — let MAIA draw on it'`
- ratified → *"MAIA may draw on this in your field"*
- ratified → reverse action: **`'Withdraw from MAIA'`**
- *"Everything here is private to your studio until you ratify it."*

No ownership language anywhere. The split you asked for — *"I authorize this material's role in my field"* rather than *"this is mine"* — **is already the surface's semantics.** That is a genuine strength and should be preserved verbatim through any provenance evolution.

**Q1 — can a practitioner distinguish my work / my influences / reference / not mine?** ❌ **No.** A search of the surface for `mine`, `author`, `influence`, `reference`, `source`, `rights`, `licen`, `attribut`, `owned`, `whose` returns **zero**. The only vocabulary offered is the five-state review lifecycle plus a media-format type. **The distinction is not expressible in the UI because it is not expressible in the schema.**

**Q3 — can they see why MAIA would or would not use something?** 🟡 **Partially.** The status `plain` strings explain the *mechanism* legibly (*"you have read it — ratify to let MAIA draw on it"*). They explain **whether**, never **on what authority**.

**Composed:** the surface is honest about the flag it has. The flag is overloaded — it carries use-authorization (which the UI discloses) and, downstream, corpus-composability with no attribution carrier (which the UI does not disclose, because nothing in the surface knows about it).

---

## 6. What this document does not authorize

No build. No migration. No corpus ingestion. Larry's agreement remains unsigned, ADR §K holds, and the surface walk has not been performed.

**Next admissible step:** the walk — establish whether `app/studio/materials` is reachable and what the ratify gesture actually looks like to a practitioner. Then, separately and only after, the Larry question: *can this field receive Larry's actual world with provenance, custody, and authority intact?*

---

## 7. Walk-readiness — PRODUCTION MEASUREMENT (2026-08-03)

Measured against production (`minisforum` / `maia-postgres`), deployed `GIT_COMMIT=77c51b61b`, container created `2026-08-03T15:47Z`. **Not** the shared dev DB.

### 7.1 Deployment reality — ✅ APPLIED

| Object | Prod state |
|---|---|
| `library_sources`: `review_status`, `ratified_at`, `ratified_by`, `vault_file_id`, `field_slug`, `author` | ✅ all present |
| `field_program_lessons` | ✅ exists |
| `practitioner_files`, `practice_fields` | ✅ exist |

ADR §L items **L1 and L2 are live in production.** L4 remains unbuilt (§1).

### 7.2 The field is empty — and that is the decisive finding

| Measurement | Prod |
|---|---|
| `library_sources` total | **2,228** |
| …by `review_status` | **`uploaded`: 2,228. Ratified: 0.** |
| …by `field_slug` | **NULL (pre-platform house corpus): 2,228. Practitioner-scoped: 0.** |
| `field_program_lessons` | **0** |
| `practice_fields` rows | 2 (`(null)`, `now-what-demo`) |
| `active_field_content` length | **0 chars on both** |

**Therefore: no practitioner corpus reaches any prompt in production today.** `composeLessonContext` gates on `review_status='ratified'` over `field_program_lessons` — both empty, so it returns `''` unconditionally. The field-corpus block requires `active_field_content` — zero-length on every row, so `buildFieldContext` returns `''`.

**The ratification lifecycle currently governs nothing.** It is deployed and inert — a pre-use state, not a defect.

### 7.3 Second corpus channel — unratified by design

`practice_fields.active_field_content` is a **free-text `TEXT` column** written directly by the practitioner via `PUT /api/practitioner/practice-field`. It is **not** fed from `library_sources`, carries no `vault_file_id`, no checksum, no `author`, and no `review_status` — and `practiceFieldService.ts:262` composes it **in full**:

```
[The field's material — composed in full]
```

So the platform has **two independent paths from practitioner intent into a prompt**:

| Channel | Vault-backed | Ratification-gated | Attribution carrier |
|---|---|---|---|
| `library_sources` → `field_program_lessons` → `composeLessonContext` | ✅ | ✅ | ❌ (`author` dropped at SELECT) |
| `practice_fields.active_field_content` → field block | ❌ | ❌ | ❌ |

**A provenance constitution attached only to `library_sources` would govern the inert channel and leave the live one open.** Any provenance work must name which channel it binds — or bind both.

### 7.4 What this means for the walk

- **Q1 (deployment)** — ✅ answered: schema is present where the experience claims it.
- **Q2 (reachability)** — still unmeasured; requires the actual walk.
- **Q3 (experiential meaning)** — **not producible by me.** A practitioner's interpretation of *"Ratify — let MAIA draw on it"* is a Class C finding and belongs to the participant.

The walk available today is an **empty-state walk**: the walker uploads their own material and traverses upload → review → ratify → withdraw. It **cannot** test the multi-origin problem, because that needs a populated field with mixed provenance — and Larry's corpus is barred (unsigned agreement, ADR §K).

### 7.5 The window this opens

Zero practitioner materials exist under the current model. **A provenance layer can therefore be added before first use, with no backfill and no reinterpretation of existing rows.** The 2,228 house-corpus rows are `field_slug`-NULL and unreachable by the lesson path — a separate concern, not a migration burden.

This is the cheapest moment this change will ever have.

---

## 8. Ruling carried from the 2026-08-03 sitting

> **Do not create a provenance constitution for a table. Create it for the moment where practitioner meaning becomes available to MAIA.**

The governed object is **field contribution into composition**, not `library_sources`. Both known paths are in scope:

```
library source → lesson → MAIA
practice field text → MAIA
```

`active_field_content` is the proof: a practitioner can create meaningful MAIA context **without uploading a file**, bypassing the richer lifecycle entirely. Any provenance design that binds only the vault path governs the inert channel and leaves the live one open.

Corollary — **the substrate may change; the authority relationship is the invariant.** The provenance object attaches to a `FieldContribution` (origin · authority · permission · composition-trace), not to a storage table.

**Sequencing agreed (before first practitioner use):** define authority model → bind all composition paths → add ratification semantics → test with synthetic material → *only then* onboard Larry.

## 9. Walk scope — corrected label and stated limits

**The walk is NOT:** *"Does the Practitioner Field solve provenance?"*
**The walk IS:** *"Does the practitioner experience the existing custody lifecycle, before provenance expansion?"*

Test material is neutral and practitioner-authored (e.g. *"My Coaching Approach Draft"*). Observations sought: upload vs. use · ratify vs. own · withdraw · what MAIA would do with it.

### 9.1 Reachability — partial evidence

- `app/studio/materials/page.tsx` and `app/studio/programs/page.tsx` were committed in `3741290cc` (*"practitioner program platform v0"*), which **is an ancestor of deployed `77c51b61b`**.
- `/studio/materials` is present in the deployed container's `routes-manifest.json` and `app-paths-manifest.json`.

**This establishes the route is shipped. It does NOT establish reachability.** Per standing doctrine, a manifest entry is the same class of evidence as an endpoint call — it cannot stand in for a member/practitioner path. Whether an authenticated practitioner can *arrive* at this surface, and what they meet on the way, is unmeasured.

### 9.2 What Claude cannot produce for this walk

1. **Authentication as a practitioner** — signing in or creating an account is outside what I may do. The walk past the auth boundary requires a human operator.
2. **Writing test material into production** — a state-changing act requiring explicit founder authorization. It is also **baseline-destroying**: §7.2 records zero field-scoped rows and zero ratified rows. The first synthetic upload ends that clean pre-use state permanently. **Recommend the walk run against local or staging, not production** — or that the founder explicitly accept the baseline loss.
3. **Practitioner interpretation (Q3)** — a Class C finding. It belongs to the participant, not to me.

**Open decision for the founder:** where the walk runs (prod vs. local/staging), and who holds the practitioner credentials for it.

---

*§1–§6 analysed the working tree on `clean-main-no-secrets`. §7 is measured production state at 2026-08-03, deployed `77c51b61b`. §9.1 is deployment evidence only. Reachability past authentication and practitioner interpretation remain unmeasured.*
