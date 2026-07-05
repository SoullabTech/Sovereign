# Flourishing: Now What? — The Augmenting Field
**For:** Larry's coaching/consulting practice — leaders, facilitators, clients, students
**Status:** CANDIDATE — imagineering document. Vision-heavy by design; every claim carries a Live / Designed / Vision label per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`. Nothing here authorizes construction.
**Version:** 0.2 — 2026-07-05 (reciprocity test + drift failure mode added per Kelly review)

**What this document actually is (Kelly, on review):** not primarily an integration of Larry's work into the platform — a **stress test of whether the constitutional architecture is genuinely framework-neutral**. If it survives Larry without new primitives, it becomes much more plausible that it can survive many other frameworks. The first Larry implementation is a constitutional experiment, not an integration project. See §X.

---

## I. Why this platform and this work belong together

Larry's central claim:

> Flourishing is not a destination. It is a practice.

The platform's constitutional stance, written independently into the Vision Studio welcome:

> This is not a race toward expertise. It is a practice of becoming.

These are the same sentence at different scales. That is not a marketing convenience — it is an architectural fact with consequences:

**A flourishing practice delivered through a system that profiles, scores, gamifies, or captures attention would contradict its own content.** Most "positive psychology tech" is assessment tech: measure flourishing, score it, dashboard it, nudge it. That architecture treats flourishing as a destination with a metric — the exact thing Larry's work says it is not.

This platform is likely the only environment whose *refusals* agree with Larry's thesis. It does not measure people. It does not manufacture authority. It holds walls while the person develops. The augmenting field for "Flourishing: Now What?" is therefore not a feature set bolted onto a coaching practice — it is Larry's philosophy given structural form.

The five practice domains have native platform expressions — not as a forced mapping, but worth noticing:

| Practice domain | Native platform expression |
|---|---|
| Attention | The platform refuses engagement capture; Sanctuary Mode; presence-centered encounters |
| Relationships | Relationship Spaces; relational memory ("remember people, not sessions") |
| Meaning | Recognition-first authorship — the member authors meaning, always |
| Contribution | Contribution Field; the Offering movement |
| Presence | Live Session Rooms; Walk & Talk; encounter as primitive |

---

## II. The three constituencies and their fields

The practice serves three distinct populations. Each needs a different relationship to Larry's framework — and the architecture already distinguishes them.

```
┌─────────────────────────────────────────────────────────────┐
│  LARRY                                                       │
│  Legacy Field (a life) · Body of Work Field (the framework) │
│  — Vision Studio, transcript pipeline, dual observation      │
└──────────────────────────┬──────────────────────────────────┘
                           │ authors & versions
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  THE FRAMEWORK — "Now What?" as Framework Organization       │
│  A lens over interpretations. Never platform truth.          │
│  Provenance-tracked. Grantable. Versioned as it matures.     │
└──────────┬──────────────────────────────┬───────────────────┘
           │ offered as lens              │ granted with provenance
           ▼                              ▼
┌────────────────────────┐   ┌────────────────────────────────┐
│  CLIENTS / STUDENTS     │   │  FACILITATORS (future)         │
│  Sovereign members.     │   │  Developmental environments    │
│  Own Personal Field +   │   │  of their own. Framework as    │
│  MAIA. Practice loops.  │   │  inherited lens, their own     │
│  Consent-carried shares.│   │  emerging body of work.        │
└────────────────────────┘   └────────────────────────────────┘
```

The load-bearing move: **"Now What?" enters the architecture as a Framework Organization** — the same slot Spiralogic, Jungian, and IFS occupy in the harvest data model (`Harvest → Interpretation → Framework Organization → Derived View`). This single decision does most of the constitutional work:

- Client harvests and interpretations stay framework-neutral; the five domains *organize* meaning as a view, they never *replace* it
- Multiple frameworks coexist without invalidating each other — a client already working with a therapist's lens loses nothing
- No client ever *has* a flourishing profile; a derived view may be computed from provenance ingredients, never stored (per the harvest model: confidence computed, never stored)
- Invariant 14 (cultural sovereignty) is satisfied structurally: the framework is offered, member-initiated, never the platform's vocabulary for the member

**Named failure mode — interpretation drifting to representation.** A lens organizes; it never defines. The five domains must stay *views* in the strongest sense. The specific drift forms to refuse, each of which quietly converts the framework from interpretation into representation of the member:

- automatic domain assignment ("this reflection is a Presence item")
- flourishing profiles (stored, not derived)
- longitudinal domain scoring
- "you're strongest in…" statements in any surface, MAIA included

Any one of these appearing in a spec, schema, or prompt is a jurisdictional violation: the framework performing the member's constitutional function of self-recognition. The test at every design decision: *does this organize what the member authored, or does it start describing the member?*

---

## III. Larry's side — the Body of Work engine

**Status: Designed (three-moment sequence); partially Live on branch (Vision Studio live-discovery path).**

Already specified in `VISION_STUDIO_SPEC.md` and the three-moment sequence:

1. **Human encounter** — interview, lecture, workshop, podcast. No data collection during; recognition through conversation.
2. **Vision Studio as reflective intelligence** — transcript enters the workspace as evidence; candidate recognitions extracted (themes, methods, tensions, developmental arcs) — proposals, never truth.
3. **Larry authors** — accepts, rewrites, rejects, expands. Only recognized material enters the Body of Work.

What this yields over years: every talk, session, and course Larry gives feeds the same pipeline. The framework stops being a static book outline and becomes a **living, versioned body of work** — with provenance for every refinement. When the framework changes because forty client encounters taught Larry something, the version history shows exactly that. *Evidence accumulates. Authority does not.* Authority stays with demonstrated practice.

The **Dual Observation Discipline** runs throughout: participant recognitions go to participants' fields; method observations (what conditions supported recognition) go to Larry's method stream and mature the framework. Clients contribute to the evolution of the method through participation — never by becoming objects of analysis.

---

## IV. The client/student experience — a leader's journey

**Status: Vision, assembled from Designed components (Practice Field spec, Relationship Spaces, harvest model, carry-items).**

The atomic unit is not the session. It is the **practice loop** — because that is Larry's actual claim about how flourishing works:

```
Session (Encounter)
   → leader chooses a practice (one domain, one experiment)
      → lives it between sessions
         → reflects with their own MAIA (private, sovereign)
            → carries what mattered to the shared Relationship Space
               → next session works with what was carried
```

**What the leader experiences:**

- **Their own MAIA, not Larry's chatbot.** Between sessions, the leader reflects with their personal companion. Those reflections are theirs — Larry never sees them. This is the three-layer privacy model (Live as invariants): personal MAIA = member only; the relationship space holds only what the member carries.
- **Continuity Larry could never provide alone.** The augmentation is not "AI coach replaces coach." It is: the practice thread stays alive across the six days between sessions, held by the member's own companion, and the member decides what returns to the work with Larry. Larry walks into every session with what the *leader* chose to bring — richer material than any intake form, with zero surveillance.
- **The framework as invitation.** MAIA can offer a "Now What?" practice lens when the member reaches for it — never as unsolicited categorization. "Would you like to look at this through the attention practice?" is member-pulled, mirroring the anchors `surface_preference` model (Live for anchors).
- **No scores. Ever.** The leader is never told their flourishing level. What they can see: their own authored recognitions accumulating — the record of a practice, in their own words.

**What Larry experiences per engagement:**

- His **Practice Field** (Designed — spec exists, PENDING state blocks invitations until complete) expresses how he works: How We Work Together, what MAIA must never substitute for, professional declarations. Snapshotted into each relationship at formation.
- The **Active Field** pulse fits his practice natively: *"This month I'm inviting everyone to practice presence in meetings."* One authored line, pushed to all active relationship spaces — a standing practice invitation across his whole client base.
- Session harvests → candidate insights (MAIA as bounded candidate generator) → interpretations Larry authors and takes responsibility for → organized under the "Now What?" framework organization. Nothing downstream edits upstream.

---

## V. Cohorts and workshops — the group container

**Status: Vision, mapped onto Designed Co-Lab architecture.**

Larry's workshop and organizational work maps directly onto the existing hierarchy:

```
Flourishing Practice Co-Lab (Larry's sovereign workspace)
    ├── Group: Acme Leadership Cohort — Spring
    │      ├── Encounter: Workshop Day 1  → Session Room
    │      ├── Encounter: Practice Week Check-in
    │      └── Encounter: Integration Session
    ├── Group: Open "Now What?" Course
    └── Group: 1:1 Client Relationships
```

The **carry gesture generalizes** to groups: individual reflections during a cohort are private by default; only what a member explicitly carries becomes group-visible. A leadership cohort inside a company gets a structural guarantee no facilitator can promise verbally — *your employer cannot see your reflections; only what you choose to bring to the room* — enforced by schema, not policy. For corporate work this is not a feature; it is the reason the offering is trustworthy.

MAIA memory stays Co-Lab-scoped (Designed invariant): nothing from Larry's practice bleeds across organizational containers.

---

## VI. The facilitator layer — when Larry trains others

**Status: Vision. Furthest out; named so the architecture doesn't foreclose it.**

When "Now What?" becomes something other facilitators deliver:

- Each facilitator gets their **own developmental environment** — the Vision Studio identity applies wholesale ("a developmental environment where practitioners cultivate a body of work over a lifetime"). The practitioner development stages (Emerging → Developing → Established → Distinctive) shape what questions the platform asks them.
- Larry's framework is **granted as a lens with provenance** — per-object grants (substrate/lens pattern, Candidate), not global roles. A facilitator's use of the framework always shows whose work it is; their own emerging insights accrue to *their* body of work, distinguishable from Larry's.
- **Certification becomes demonstration, not license.** A facilitator's standing derives from provenance-tracked practice — encounters facilitated, method observations contributed, recognitions their participants authored — not from a completed course. The framework itself matures through the network's method stream while remaining Larry's authored, versioned work.

This is the difference between franchising content and growing a school of practice.

---

## VII. The augmentation loop — how it compounds

```
Leaders run practice loops ──→ authored recognitions (their fields)
        │                              │
        │ consent-carried              │ (never extracted)
        ▼                              │
Relationship Spaces ──→ richer sessions with Larry
        │
        ▼
Harvests → candidates → Larry-authored interpretations
        │
        ▼                         (Dual Observation:
Method observations ──────────────  conditions, never persons)
        │
        ▼
Body of Work versions ──→ refined Practice Field, courses, book, talks
        │
        ▼
Better conditions for practice ──→ deeper practice loops  ⟲
```

Every arrow is an authorship event or a consent event. The flywheel runs on recognition, not extraction — which means it compounds without accumulating the liability every data-hungry coaching platform carries.

---

## VIII. What this refuses (the contribution is what it refuses)

The refusal beneath all five below: **the refusal to confuse measurement with recognition.** These are different epistemologies, not different feature sets —

> Assessment asks: *"How flourishing are you?"*
>
> Recognition asks: *"What became visible through living?"*

The first produces a claim about the person. The second preserves the person's authority over what their own living revealed. Everything this offering refuses follows from refusing the first epistemology.

1. **No flourishing assessments.** No scores, levels, or wellbeing indices. The saturated market does assessment; this offering's differentiation *is the refusal*.
2. **No client profiling.** Derived views are computed from provenance ingredients, never stored; the member is never told who they are.
3. **No cross-context synthesis.** Practitioner relationships siloed; Co-Lab-scoped memory; employer-blind cohort reflections.
4. **No simulated Larry.** MAIA may surface Larry's authored teaching with provenance ("Larry writes…"); it never speaks *as* him and never extends his availability beyond what his Practice Field declares.
5. **No manufactured maturity.** Year one, the honest sentence is "Larry is developing an approach integrating executive leadership with positive psychology." The platform will not say more than the field warrants — and five years of practice will let it say much more, truthfully.

---

## IX. Build sequence and gates

| Phase | What | Status | Gate |
|---|---|---|---|
| 0 | Interview → transcript pipeline → Legacy Field genesis | Designed; Vision Studio live-path built on branch | Deploy + migration + practitioner assignment (existing gate) |
| 1 | Body of Work accrual (lectures/podcasts through same pipeline) | Designed — needs transcript workspace, candidate extraction, review interface | Feature test per capability |
| 2 | First client engagement (one leader, full practice loop) | Vision on Designed substrate | Practice Field PENDING→LIVE; three privacy invariants verified |
| 3 | First cohort container | Vision | Co-Lab Release Gate 31/31 (MANDATORY before any invite) |
| 4 | Facilitator layer | Vision | Requires substrate/lens grants ratified; do not begin before Phase 2–3 evidence |

Constitutional checks this document ran (architectural-integrity):
- **Ontology:** zero new primitives — composes Fields, Practice Field, Relationship Space, Encounter/Harvest, Framework Organization, Co-Lab, grants. Extract, don't invent: satisfied.
- **Jurisdiction:** client meaning stays with client; Larry's authority covers his framework only; joint space governed by consent.
- **Provenance:** framework = view over interpretations; nothing downstream edits upstream; two-field provenance assumed on every persisted artifact.
- **Direction of authority:** every protection lands as schema/gate (grants, snapshots, scoped memory, carry gestures) — not prompt text.
- **Candidate vs canon:** this entire document is Candidate.
- **Evidence proportionality:** Live/Designed/Vision labeled throughout; the honest center of gravity today is *Designed*.

---

## X. The reciprocity test — this is a constitutional experiment

Every check above asks one direction of the question: *can the platform host Larry's framework without distortion?* The stronger test runs the other way:

> **Does Larry's framework reveal a weakness in the platform that was previously invisible?**

A genuinely participatory architecture shouldn't merely accommodate external frameworks; it should allow them to expose blind spots in the host. If the Larry implementation concludes with "nothing new learned about the platform," the integration risks having been an exercise in confirmation.

**What to watch for during Phases 0–2** (this is the method-observation stream applied to the architecture itself). The common question beneath every item is not "did users like it?" but: **where did the architecture have to bend in order to accommodate reality?** Friction is diagnostic, not merely undesirable.

- A moment where Larry's actual practice needs something the Practice Field's four layers cannot express without contortion
- A reflection pattern the practice loop's shape (choose → live → reflect → carry) forces into the wrong grain
- A cohort dynamic the Co-Lab hierarchy can hold only by mislabeling what it is
- Anything Larry or a client does naturally that the carry gesture makes awkward — friction at the consent boundary is architectural evidence, not user error

Finding such a point does **not** automatically justify a new primitive — the governance discipline (extract, don't invent; return work to the earliest authorized stage) still applies. What it does is identify the next place where lived encounter should guide architectural evolution, with evidence instead of speculation.

The question is not whether Larry fits the platform. It is whether the platform can host his work faithfully **without ceasing to be itself** — and whether, in doing so, it learns something it could not have discovered alone.

Three outcomes are acceptable under this governance: the architecture is left unchanged, a compositional adjustment is revealed, or a limitation is exposed. **The experiment succeeds by being capable of surprising the architecture, not by guaranteeing that it will.**

---

*The platform does not make Larry's practice bigger. It makes it more continuous, more consented, and more cumulative — and it lets the framework mature the way Larry says flourishing does: as a practice, not a destination.*
