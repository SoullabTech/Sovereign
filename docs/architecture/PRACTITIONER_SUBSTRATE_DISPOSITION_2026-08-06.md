# Practitioner Substrate — What Exists, What Generalizes, What Stays With Larry

**Date:** 2026-08-06 · **Measured at:** `f5c5b7ab9` (branch `feature/labtools-redesign`)
**Status:** ⛔ **INVENTORY / DISPOSITION RECORD. Rules nothing. Authorizes no build, no move, no deletion.**
**Answers:** founder question — *"What is already built around practitioner for Now What?, what can be
integrated into Studio as a general, and what needs to stay with Larry alone?"*
**Companion to:** `DEVELOPMENT_ENVIRONMENT_AS_UNIVERSAL_2026-08-06.md` (same day)
**Method:** all claims **[O] observed** by reading the tree at the SHA above unless marked **[I] inferred**.

---

## 0. The headline

**The practitioner substrate is already substantially universal. Larry is thinner in the code than
the conversation implies.** What is Larry-specific is almost entirely *instance content and brand
strings* — not architecture. The reusable layer exists; what is missing is not generality but the
**authority ruling** that governs how MAIA may reason across it.

There is one exception that runs the other way, and it is the most important finding in this
document: a **live write path already exists for MAIA-authored developmental claims about the
practitioner** (§3). It is the exact violation of the boundary rule proposed in this conversation —
pointed at the practitioner instead of the member.

---

## 1. ALREADY GENERAL — keyed on `practitioner_member_id`, no Larry anywhere

These need **no generalization work**. They are already the Universal Practitioner Field's substrate.

| Substrate | Where | What it is |
|---|---|---|
| **`practice_fields`** | `20260701000001` + `lib/practiceField/practiceFieldService.ts` | The core. Practitioner-authored context, four layers (Identity · Relationship · Practice · Adaptive Guidance-deferred). **Stable Field** formation-snapshotted per relationship; **Active Field** never snapshotted, pushes live. PENDING→LIVE gate requires five authored fields. Header states the constitution outright: *"A Practice Field is not MAIA configuration. It is practitioner-authored context. MAIA receives it as context, not as instructions."* |
| Practice Field revisions | `20260710000002` | Append-only version history — the provenance spine. |
| Practice Field slug + MAIA guidance | `20260710000001`, `20260708000001` | |
| **Practitioner client notes + continuity** | `20260730000001`, `20260731000001`, `20260801000003` | Commitments · recognitions · carried-forward notes. Shipped `6defc5fec`, 25/25 prod-verified. |
| **Practitioner-visibility withdrawal** | `20260730000002` + Lane V (`#841`) | **Member** authority over what the practitioner sees, recorded in the authorship ledger. |
| Observation provenance | `20260624000001` | The five-column provenance seed; `PRACTITIONER_SUBSTRATE_READ_2026-08-03` already names it the reusable pattern. |
| Practitioner files / sessions / encounters team scope | `20260630000006`, `-004`, `-001` | Scoping via `lib/team/sessionTeamScope.ts`. |
| Field programs & positions | `20260712000001`, `20260714000001` | |

**[O]** `lib/practiceField/*.ts` contains **39** references to `practitioner_member_id` /
`practitionerMemberId` and **zero** hardcoded Larry or `now-what` identifiers.

> ⭐ **Disposition: these ARE the general layer.** "Integrating into Studio" is not a port — it is
> giving them **rooms**. The substrate is done; the environment around it is not.

---

## 2. ALREADY GENERAL BUT DUPLICATED — one concern, two unrelated models

**[O]** Two independent practitioner-observation substrates exist and do not know about each other:

- `studio_practitioner_observations` + `studio_field_signals` — live routes at
  `app/api/studio/practitioner-observations/`, `app/api/studio/field-signals/`, and consumed by
  `app/api/studio/changes/[id]/consult/` and `app/api/studio/decisions/[id]/consult/`.
- `practitioner_observation_provenance` (`20260624000001`) — the provenance-carrying model.

Flagged as a finding in `PRACTITIONER_SUBSTRATE_READ_2026-08-03.md` §4 and still unreconciled.

> **Disposition: reconcile before either is given a room.** Same failure class already named in the
> Writer's Studio ruling — *parallel substrates claiming one concern*. ⛔ Do not build a "Wisdom" or
> "Inquiry" room on top of an unreconciled pair; the room would inherit the ambiguity.

---

## 3. 🔴 MUST NOT GENERALIZE — MAIA-authored developmental claims *about* the practitioner

`PRACTITIONER_SUBSTRATE_READ_2026-08-03.md` §2 flagged `practitioner_growth`
(`20260110000001_practice_sessions.sql`) and marked liveness **[I] not established**.

**Liveness check performed 2026-08-06 — result: the read, write, and acknowledge paths are all live code.**

**[O]**
- `lib/practice/PracticeStore.ts:500` — `addGrowthObservation({ practitionerId, growthType, observation, sessionRefs, confidence })`
- `app/api/practice/growth/route.ts` — `GET` (read) · **`POST` line 85 (write)** · `PATCH` line 106 (acknowledge)
- Schema: `growth_type ∈ {pattern_identified, strength_developing, edge_emerging, modality_expanding, style_evolution, client_type_affinity}`, `confidence NUMERIC(3,2)`, control column `acknowledged BOOLEAN`.
- `session_insights.insight_type` includes `blind_spot`, `growth_edge`, `strength_spotted`, `practitioner_pattern`.

**[O] Bounding the claim honestly:** `lib/practice/InsightGenerator.ts` contains **no** reference to
`addGrowth`, `blind_spot`, `growth_edge`, `strength_spotted`, or `practitioner_pattern`. **No MAIA
generator currently calls the write path.** The endpoint is reachable but, on this tree, nothing
automated is feeding it.

So the accurate statement is: **the receptacle, the confidence score, the endpoint, and the
`acknowledged`-only control are all built and live. The generator is not.** The substrate is one
generator away from producing exactly what this conversation just ruled illegitimate.

**Why it is the same violation, mirrored:**

| Founder's illegitimate case | This substrate |
|---|---|
| MAIA tells Larry *"belonging appeared across seven clients"* | MAIA writes `pattern_identified`, `confidence 0.85`, about Larry |
| Derived from member encounters | `session_refs[]` — derived from session records |
| Authorship is wrong even if accurate | Authorship is wrong even if accurate |
| — | `acknowledged` proves he **saw** it, never that he **agreed** — the same rejected control shape as gating on readiness `status` (rejected in `c327dd526`) |

> 🔴 **Disposition: this is the pre-existing counter-example to the rule being written. It must be
> ruled on explicitly — not quietly generalized into Studio's "Wisdom" room, and not quietly deleted
> either.** ⛔ I have changed nothing. Whether the right move is remove / gut to member-authored-only
> / re-shape `acknowledged` into an authorship gesture is a founder call, and it belongs inside the
> **MAIA Perspective and Authority in Practitioner Studio** decision, not before it.

---

## 4. THE CROSS-CLIENT SURFACE — already exists, already unruled

**[O]** `app/api/caseload/list/route.ts` — `GET /api/caseload?memberId=<practitioner>` returns cases
across all of a practitioner's clients, filterable by `status`, `element`, and free-text `search`
over client identifiers. Authorization is `CaseStore.isPractitioner(memberId)` — a **role check**,
which per the standing ruling (`feedback_list_filter_is_not_authorization_boundary`) is a *list
filter*, not a per-client authority boundary.

This is the surface the founder's fifth question points at: *"Can Larry ask cross-client questions
at all — and if so, from what practitioner-authored substrate rather than client aggregation?"*

> **Disposition: the aggregation capability already ships. The ruling does not.** ⛔ Nothing here is
> currently MAIA-facing — it is a list API, not a reasoning input. That is the line to hold until
> the perspective ruling exists: **`/api/caseload` must not become a MAIA context source.**

---

## 5. WHAT IS ACTUALLY LARRY-ONLY

Far less than expected. **[O]** Every occurrence of "Larry" in `app/`, `lib/`, `components/`:

**Real Larry-specific content (4 items):**
1. `components/now-what/NowWhatRoom.tsx:829` — `"Now What? · with Larry Closs"` (brand string)
2. `components/now-what/NowWhatRoom.tsx:898` — `"This room holds Larry's work"` (brand string)
3. `lib/soulPortrait/portraits/larry.ts` + `lib/soulPortrait/registry.ts:26,40` — his soul portrait, registered by slug alongside others
4. The `app/now-what/*` route namespace itself — one deployment's vocabulary (`arrive · coaching · cultivate · field · position · questions · reflections · room · themes · welcome · map · next · calendar · admin`)

**Everything else naming Larry is a code comment**, marking provenance or a pending validation —
`lib/practiceField/practiceFieldService.ts` (×4), `lib/navigation/maiaNav.ts:206`,
`app/now-what/coaching/page.tsx:14`, `app/now-what/cultivate/page.tsx:9`,
`app/studio/environment/page.tsx:6`, `app/api/now-what/interview/route.ts:363`. **No behavior branches
on Larry's identity anywhere.**

**Beyond the code, what stays with Larry alone:**

| Item | Why it stays |
|---|---|
| His authored `practice_fields` text — `welcome_message`, `about_practice`, `how_we_work_together`, `how_maia_supports`, `active_field_content` | Instance data. Universal *shape*, his *content*. |
| The **Flourishing framework** | Per `project_now_what_flourishing_landscape` + CF-D5b: a **lens**, and *a lens may never become the owner's name for the experience*. Platform-izing it is domain drift — the third drift `NOMENCLATURE_AND_WORLD_ALIGNMENT_PRINCIPLE` exists to prevent. |
| The **"Now What?"** name and the executive-coaching vocabulary | Contextual vocabulary over universal architecture. Read-time, not schema. |
| His IP / corpus | ⛔ **NOT INGESTED, and the rights instrument is UNSIGNED** (`project_larry_ip_corpus_null`). Stage 2 of the founder-set roadmap is gated on this. |
| The `about_practice` five-domain error currently live in production | 🔴 Per `project_covenant_gate_enforcement_gap`: **engineering must NOT fix it.** It is his authored text; correcting it would be the system overwriting the practitioner. |

---

## 6. The disposition, in one table

| Layer | State | Move |
|---|---|---|
| `practice_fields` + revisions + notes/continuity + visibility-withdrawal + provenance | ✅ built, general, largely prod-verified | **Give it rooms.** No porting needed. |
| Observation substrate (two models) | ⚠️ built, general, **duplicated** | **Reconcile first.** |
| `practitioner_growth` / `session_insights` practitioner claims | 🔴 built + live endpoint, **generator absent** | **Rule on it.** ⛔ Neither generalize nor delete unilaterally. |
| `/api/caseload` cross-client | ✅ built, ⛔ unruled | **Hold the line: not a MAIA context source.** |
| Brand strings · soul portrait · route vocabulary | Larry-only, correctly so | **Stays.** Parameterize only when a second practitioner exists — *promote on observed use.* |
| Flourishing framework · his corpus · his authored text | Larry-only, **constitutionally** | **Stays. Permanently.** |

---

## 7. What this changes about sequencing

Nothing contradicts the founder's proposed next step. It sharpens it:

**MAIA Perspective and Authority in Practitioner Studio** now has a concrete, already-built agenda
rather than a hypothetical one. Its five questions map onto real artifacts:

1. *Which fields can MAIA access in each context?* → `practice_fields` (yes, by design) vs
   `/api/caseload` (§4, unruled) vs member private field (must be no).
2. *What may cross from relationship into practitioner reflection?* → the Lane V withdrawal ledger
   (`20260730000002`) is the **member-side control that already exists**; the practitioner-side
   counterpart does not.
3. *What must remain inaccessible?* → member private field; and per §3, **the practitioner's own
   development must be inaccessible to MAIA as an authoring surface.**
4. *How is source authorship visibly preserved?* → the provenance seed (`20260624000001`) is the
   mechanism; ⚠️ it is one axis short (`project_practitioner_field_provenance_constitution`).
5. *Can Larry ask cross-client questions?* → §4. The capability ships; the authority does not.

⛔ **This document rules none of the five.** It establishes only that four of them are questions
about **code that already exists**, not about code to be written — which means the ruling is
overdue rather than premature.
