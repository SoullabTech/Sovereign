# Larry's Studio — the Practitioner Field Admin Surface
## Explore · Monitor · Imagineer · Create/Develop

**Status:** CANDIDATE spec v0.2 — PREPARED, NOT AUTHORIZED. Build HELD behind two gates, in order: (a) Kelly ratifies this spec; (b) **the distillation session happens first** — Larry's first contact with the *existing simple editor* precedes any Studio build, and his corrections and frustrations in that session are the requirements document for this surface (reference-implementation rule: the authoring surface is *extracted from what the Larry field needed*, not designed ahead of it). Exception: §3.1 versioning, which must land **before** his first edit, not after.
**Date:** 2026-07-10 (v0.2 — reframed as Larry's Studio; draft-route function verified and corrected)
**Origin:** Kelly directive — *"I want an admin level field for him to explore, monitor, imagineer, and create/develop."* This is the practitioner-side command center the original What Now? framing reserved: *"where he will come for his development and control of the field."*

---

## §1 What "admin" means here (constitutional scope)

Admin = **jurisdiction over his own authored artifacts** — his practice field, its layers, its guidance, its history, its rehearsals. Admin is NOT authority over members, and NOT visibility into them.

Binding constraints, restated so this spec cannot drift:

1. **§9 fence (settled, per `NOW_WHAT_PROGRAM_CATALOG_SPEC_2026-07-10.md` §8/§10):** *"The practitioner gets no read of member positions… no facilitator dashboard, no 'how many participants are active,' no completion funnel — ever. Small cohorts rule out even aggregates."* The fence is not a limitation on this surface — it is **what makes the surface trustworthy enough that his clients' presence in his rooms is safe**. Operating phrase: *monitor the mirror, never through it.*
2. **Mirror Invariant:** nothing here synthesizes client material or the practitioner himself. The only client content that reaches him is what a member explicitly crossed (`can_be_shown_to_practitioner = TRUE`, default FALSE — existing mechanism in `app/api/now-what/field-note/route.ts`). The existing `/draft` assist (§4.1) already embodies this for his own material.
3. **Direction of Authority (Inv 16):** his field narrows beneath the constitutional floor, never widens (enforced in `lib/practiceField/fieldGuidance.ts`). No Studio surface may grant the field new authority.
4. **Gate capabilities, not existence.** The Studio exists for any practitioner-member; what each can do inside is gated by role/ownership.
5. **Place, not fork:** extend `/maia/vision-studio` (authoring) and the existing `app/practitioner/*` shell (practice ops). No parallel admin app.

## §2 The design is inheritance, not invention

The four verbs map onto the house's own ladder. **Draft → rehearse → promote is authored → built → verified wearing practitioner clothes.** His experiments never touch a real client until they've had their contact. The Studio gives Larry the house's own method — which is why most of this spec is wiring existing patterns to a new jurisdiction, not new machinery.

**The spine that makes all four verbs cohere is field versioning (§3.1).** Without it, Imagineer has no safe draft space, Monitor has no history to read, and Develop leaves no trace of his evolution. With it, every promotion is a version with provenance — and the version history *is* the record of his professional development. A coach who can read the diff between how he framed his work in July and how he frames it in December is doing supervision on his own becoming. "Develops as he curates" closed structurally.

---

## §3 The four quadrants

### 3.1 Create / Develop — versioned authorship (the spine; lands first)

**Exists, verified this week:** `PracticeFieldEditor` (`components/maia/practice-field/PracticeFieldEditor.tsx`) edits Layers 1–4 via `PUT /api/practitioner/practice-field`; composition reaches the room next turn. MAIA-assist per dimension via `POST /api/practitioner/practice-field/draft` (candidate expression from what he just shared — mirror-invariant, never auto-saved; see §4.1 for what this route is and is not).

**Gap:** `upsertPracticeField` (`lib/practiceField/practiceFieldService.ts:53`) plain-`UPDATE`s — every save destroys prior state. No audit table exists.

**Build:** append-only `practice_field_revisions`:

```sql
CREATE TABLE practice_field_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_field_id UUID NOT NULL REFERENCES practice_fields(id),
  revision_number INT NOT NULL,           -- monotonic per field
  layers JSONB NOT NULL,                  -- full Layers 1–4 at save
  saved_by TEXT NOT NULL,                 -- 'steward' | member id (provenance)
  note TEXT,                              -- what changed, in his words
  promoted_from_draft BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (practice_field_id, revision_number)
);
```

Written in the same transaction as the PUT (schema + reader ship together). Read surface: "Field history" in the Studio — his own artifact, pulled by him, Mirror-safe by construction. Revisions + notes for V1; diff view later. **This cut alone is authorized to land pre-distillation and pre-identity-cut — it protects the steward baseline from his very first save.**

Also in this quadrant, downstream: curriculum and focal-point design (the practitioner side of the program-position spec — sequenced behind the identity cut per the standing ruling), resources, invitations. And his own development running through his **member stack** — journals, his own MAIA relationship, reflection on rehearsal transcripts. His growth and his field's growth as one braided practice.

### 3.2 Explore — walk his own field from both sides

- **Sandbox room mode:** converse in his own room *as a client would*, against the draft field (§3.3), with test turns that never touch real data — no atoms, no memory formation, no field notes, no crossings. This is the `verification-proof` hygiene pattern productized (Sanctuary-adjacent: useful in the moment, then gone; only the rehearsal transcript persists, labeled REHEARSAL, visible to him alone).
- **Composed-field view:** read-only render of exactly what the room receives (the artifact witnessed at 67,791 chars this week) — what-he-wrote vs what-MAIA-carries is never a mystery.
- **Corpus browsing/search across his own materials** — the field as a landscape he can wander, not just a form he edits.

### 3.3 Imagineer — draft → rehearse → promote

**Gap (verified 2026-07-10):** no draft-vs-live state exists. The single `practice_fields` row is always-live; Active Field + Layer 4 push immediately. (The `/draft` API route is *not* this — see §4.1.)

**Build:** `draft_layers JSONB` (nullable) on `practice_fields`. Editor gains a Draft/Live toggle. Sandbox rehearsals (§3.2) run against the draft. An explicit **Promote** gesture moves draft → live and writes a revision with `promoted_from_draft = TRUE`. Publication becomes an authored act with provenance, not an autosave side-effect. He can hold a direction, sketch an alternate framing of his work, rehearse it against client scenarios, read the transcripts, and promote only when it's earned. The eval harness (Tier 1, deployed) is the natural generator of rehearsal scenarios/transcripts here.

**Scenario library as scope-discernment curriculum:** the rehearsal scenarios must deliberately include **out-of-scope cases** — the client whose stuckness is grief, the disclosure that isn't a values problem, flourishing language papering over something clinical — so the practitioner develops *this is the shape of a thing that isn't mine* before any real client brings it. Supervision's mechanism (boundary-case exposure inside a reflective frame), minus the live stakes. Hard line: the system never *detects* the out-of-scope client for him — detection is person-modeling (refused) and would arrest the very discernment this builds. Full treatment: `docs/practitioner/SCOPE_OF_PRACTICE_AND_CRISIS_READINESS_CANDIDATE_2026-07-10.md` §5.

Formation snapshots (`practice_field_snapshots`) remain untouched — the Stable Field a relationship formed under stays frozen, as designed.

### 3.4 Monitor — the field's health, never the clients' interiors

A Studio panel showing **what his field is doing**, only:
- Composition status: field status, current revision, last promotion (when, note, provenance), guidance layers active.
- What the room is serving: render witness (size, timestamp), provenance labels on composed content.
- Rehearsal transcripts (his own, from §3.2).
- **Explicitly crossed field notes**, per-thread, as the member shared them — surfaced, never aggregated.

Nothing about members otherwise. No positions, no counts, no activity, no funnels. His learning-from-clients channel stays what it constitutionally is: member gestures plus his own reflection on real encounters.

---

## §4 Verified inventory (what exists vs what's new)

### 4.1 Correction — the `/draft` route is drafting *assistance*, not draft *state*

`app/api/practitioner/practice-field/draft/route.ts` (verified 2026-07-10): MAIA drafts a **candidate expression for one field dimension** from what the practitioner just shared — conversation-as-source, mirror-invariant, never auto-saved, practitioner authors the final value. It is a good citizen of the Studio and stays exactly as is — but it is an assist inside Create (§3.1), **not** the Imagineer draft-layer (§3.3), which is unbuilt. Any future claim that "draft infrastructure exists" must carry this distinction.

### 4.2 Ledger

| Exists (verified) | New (this spec) |
|---|---|
| Editor + PUT channel + next-turn composition | `practice_field_revisions` + write-on-save (§3.1) |
| Per-dimension MAIA draft-assist (mirror-invariant) | `draft_layers` + Promote gesture (§3.3) |
| Practitioner app shell (`app/practitioner/*`) + vision-studio tabs | Sandbox room mode with test-turn hygiene (§3.2) |
| Consent-crossing channel (field notes, default-off) | Rehearsal transcript surface (§3.2/§3.4) |
| Eval harness Tier 1 (scenario/transcript generation) | Monitor panel (§3.4) |
| Formation snapshots (frozen Stable Field) | Field history / composed-field views |

All of it Cat 1 until ratified; everything except §3.1 also waits on the identity cut and the distillation session.

## §5 Sequencing

1. **Now (pre-everything):** §3.1 versioning — small migration + PUT change; protects the steward baseline before Larry's first edit. The only cut authorized to precede his walk.
2. **Distillation session:** Larry meets the *existing simple editor*. His corrections and frustrations are captured as the Studio's requirements document.
3. **Identity cut** lands (he signs in as a member; practitioners are members first, one identity).
4. **Studio cuts, extracted from (2):** sandbox + composed-field view → draft/promote → monitor panel. Order may be reshuffled by what he actually reached for.

Sovereignty check per cut: increases his agency (authorship with history) ✓ · pushes life outward (better practice, not platform pull) ✓ · reduces system centrality (he supervises his own externalized practice) ✓ · imposes no framework on members ✓.

**Not in this spec (named so it can't drift in):** client-position views of any kind; aggregate anything; MAIA-synthesized "insights about your clients"; recognition-views of his development (his history is a record he reads, not a narrative the system tells him about himself).
