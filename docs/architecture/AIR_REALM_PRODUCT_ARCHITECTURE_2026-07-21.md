# Air Realm Development — Product Architecture Recommendation (Prompt 6) — 2026-07-21

**Status**: Design only. Authorizes nothing — the S5 gate holds; nothing here is an implementation
instruction until Prompt 8 is approved and S5 settles. Prompt 6 of the Air Realm Development
sequence, executed under Prompts 2–5 as ruled (including the two Prompt 5 additions and Kelly's
questions Q5/Q6).

**Questions carried in**: the four items handed from Prompt 5 (orchestration home for stances ·
authorship-marker representation · silence affordance → Prompt 7 · uncertainty prompt-layer
guarantees) plus Kelly's Q5 (*where does not-knowing live architecturally?*) and Q6 (*is restraint
a first-class orchestration object?*).

> **RULED — Kelly, 2026-07-21: APPROVED WITH TWO ADDITIONS** (both experiential questions handed
> to Prompt 7): (A1) **relationship coherence** — how do all inspection objects (Held, versions,
> lineage, recognitions, releases) feel like *one continuing relationship* rather than a
> collection of features? "Relationship coherence may matter more than information architecture."
> (A2) **what does forgetting feel like?** — does it disappear completely? is there a trace? does
> release feel ceremonial? does MAIA remember forgetting? what emotional experience accompanies
> release?
> **Caution recorded**: the inspection view must never drift into "Open Items / Growth Areas /
> Insights / Recommendations" — that quietly recreates progress mechanics, hidden funnels, and
> developmental authority. The reading experience matters enormously.
> **Elevated**: RestraintContext may become more than Air — possibly MAIA's **Presence
> Constitution**; selection-before-instruction named one of the most important architectural
> findings ("if evidence above ceiling never enters context, the model cannot beautifully
> overstate it"); *"MAIA carries the material; the member keeps the meaning"* may describe MAIA's
> entire philosophy of accompaniment; "Rooms are where people live. Elements are how meaning
> moves." **Reusable constitutional template observed**: governance objects → existing substrate
> reuse → minimal new data → quiet inspection surfaces → no new room unless evidence demands it.
> **Provisional architecture sentence preserved**: *"Air Realm Development is a cross-platform
> relational capacity expressed through existing conversations, governed by restraint, and
> surfaced only through member-pulled inspection."* Prompt 7 authorized.

---

## 1. Evaluation of candidate architectures

| Candidate | Verdict | Reason |
|---|---|---|
| Dedicated Air studio | **Rejected** | Parallel-product trap (Living Profile reconciliation ruling); would re-derive consent machinery the rooms already carry; contradicts "cross-platform capacity, not a room." Corroborated independently: the five-element-studios discovery (E0, same week) eliminated five parallel element studios on its own evidence. |
| MAIA stance only (prompt text) | **Rejected as sole architecture** | No persistence, no evidence tiers, no dispositions; Prompt 5 would erode exactly as Kelly's Q5 warns — downstream eloquence beats prompt wording without structural enforcement. |
| Living Profile layer | **Rejected as home** | Profile constitution is S5-gated and owns a different concern (portrait of the member). Air is a *practice* capability; it feeds nothing into profile territory. |
| Periodic reflection system | Component, not home | Reflection is one surface; scheduling isn't wired; the capability must not depend on it. |
| Project-based workspace | **Rejected** | Air work is conversational and contextual, not project-shaped; a workspace forces premature objecthood. |
| Contextual practices inside existing rooms | Component — adopted | This is where the capability *appears*. |
| **Hybrid: cross-platform capacity (three layers, below)** | **RECOMMENDED** | Smallest coherent architecture that can grow without fragmentation. |

## 2. The recommended architecture: three layers

```text
Layer 1  RESTRAINT CONTEXT     (orchestration governance — new, small, deterministic)
Layer 2  EVIDENCE SUBSTRATE    (existing objects, minimally extended)
Layer 3  SURFACES              (existing rooms; no new room in v0)
```

### Layer 1 — Restraint Context (answers Q5 and Q6: yes, restraint becomes a first-class object)

A per-turn, deterministically assembled governance object — data, not model discretion. The
sketch below is an **illustrative, non-authoritative representation of the candidate *shape*,
not a designed object**: the field names and structure are rhetorical convenience for this
document, decided nowhere. Prompt 8 designs the real thing; this shows only what kind of thing
it is. *(Register amended 2026-07-21: a typed sketch reads as a decision even when it isn't.)*

```text
RestraintContext {
  stance            // witnessing | clarifying | holding | rehearsing | recognizing | stepping_back
  restraints[]      // the stance's refusal-set (from the Prompt 5 spec, versioned)
  evidenceCeiling   // highest claim tier permitted THIS turn, computed from the actual record
  allowedMoves[]    // offer | describe_record | ask_change | hold | silence | register_impact ...
  contextBinding    // A1: which context (relationship/project/room) this material belongs to
  uncertaintyFloor  // what MAIA must not pretend to know here
}
```

**Where not-knowing lives (Q5): in the assembly step, before generation.** The evidence-tier
ceiling is computed from the member's actual record (kept/enacted/revised counts, time spans,
standing contradictions, prior declines) *before* the model generates. Enforcement is structural,
in order of strength:
1. **Selection**: material above the ceiling is simply not placed in generation context — the
   model cannot elegantly overstate evidence it never sees. (Zero-standing inference is enforced
   here: detected patterns enter context as *questions to possibly offer*, never as facts.)
2. **Instruction**: the RestraintContext renders into the prompt as the stance's refusal-set and
   the tier-revealing grammar forms — wording guidance, second line of defense.
3. **Post-check (light)**: prohibited forms (identity naming, other-person inner states,
   re-raising declined items) are the only generation-output checks — a short deny-list pass, not
   a quality gate.

**Placement**: alongside the existing presence/posture machinery (`lib/maia/presence/postures.ts`
is the natural neighbor) and assembled in the same place context addenda are already assembled per
turn. It rides the existing per-request assembly pattern (MemberLiveContext precedent: computed
fresh, never persisted as profile). Frequency governance (recognitions rare; decline-streak raises
bar) lives here too, reading the same counters the keep-offer governor already uses.

This layer is the architectural encoding of the ruling that *MAIA's personality is what she
refuses to do* — the refusals become inspectable, versioned data rather than prompt prose.

### Layer 2 — Evidence substrate (existing objects, minimally extended)

**No new tables in v0.** Mapping ruled in Prompt 2 §VIII, confirmed against discovery:

| Air need | Existing object | Extension needed (Prompt 8 scope) |
|---|---|---|
| Kept language, adoption, dispositions | `member_memory_atoms` + gesture routes | None — kept/revised/rejected/open already correct |
| Verbatim moments | episodic marks | None |
| Held state | atoms status vocabulary | Verify `still_alive`-family covers Held semantics + Released-forgetting (journey §4a); tiny status addition at most |
| Named inquiry ("development thread") | `member_field_note_threads` | None structurally; usage convention |
| Context binding (A1) | atoms `thread_ids`/registers | A context tag on evidence-bearing items — the one substantive gap |
| Articulation versions + practice events | — (genuinely missing) | The only genuinely new object class; smallest viable: a version-lineage record referencing atoms; schema deferred to Prompt 8 |
| Authorship markers | provenance-field precedents (portrait generation provenance) | Provenance enum on articulation versions |
| Periodic reflection | `ritual_review_opt_in` consent value | Blocked on scheduler wiring — v0 is member-initiated only |

**Untouched, by ruling**: Decisions ledger, Circles, recognitions Layer 3, anything collective
(deferral holds). Sanctuary boundaries unchanged. Memory-Palace episodic lineage explicitly *not*
used (opposite provenance stance; needs its own ruling).

### Layer 3 — Surfaces (existing rooms; conversation-first)

- **Entry**: inside MAIA conversation wherever it already happens (`/maia`, Now What?, Vision
  Studio interview, Session Room follow-ups) — need-first, per journey §2. No nav item, no
  landing page, no program framing in v0.
- **The one visible object**: a quiet, member-pulled **inspection view** — "what we're holding" —
  where the member can read their kept/held/released record with provenance, change dispositions,
  and release. An inspection view is not a dashboard: no stats, no progress, no tiles (existing
  no-stat-tiles discipline applies). Natural home: alongside the existing atoms/portfolio and
  `/maia/moments` surfaces rather than a new route family.
- **Practice**: the four forms (say-it-to-me, say-it-as-if, depth-shifting, after-action) are
  conversational moves, not features — they need Layer 1 stance support, not new UI. Evaluate
  reusing the live practice subsystem (`app/api/practice/*`) as backend before adding anything.
- **Silence affordance** (from Prompt 5): flagged to Prompt 7 — a turn that visibly closes
  nothing; likely a rendering concern only.

## 3. The architecture's answers to the Prompt 6 spec questions

- **Entry**: conversational, contextual, need-first (above). Explicit pathway entry (consent) is a
  conversational act MAIA confirms plainly — "want to work on this together over time?" — recorded
  like other member acts; not a signup flow.
- **Continuity**: existing loaders (atoms loader, MemberLiveContext pattern) extended with A1
  context filtering: what was evidenced in one context is assembled only into that context;
  cross-context assembly requires the higher-burden cross-context claim to already be
  member-confirmed.
- **Context detection**: by room + the member's explicit framing, never inferred silently;
  ambiguity resolved by asking (one question, not a classifier).
- **Consent**: existing vocabulary end-to-end — member acts create eligibility
  (keeping/marking/entering), `member_pulled` default, `contextual_doorway` opt-in,
  `ritual_review_opt_in` reserved for wired scheduling; Sanctuary absolutely excluded; pause/exit
  are gestures with zero friction (journey §8).
- **Privacy model**: private to member ↔ available to MAIA under consented assembly · practitioner
  visibility **none** in v0 (mirrors threads' held-FALSE posture) · shareable/exportable/
  publishable only through the explicit private-to-public crossing with authorship marks.
- **Objects**: per Layer 2 — one genuinely new class (articulation version / practice event),
  everything else reuse.

## 4. Initial release recommendation (maps to the sequence's five-capability boundary)

Smallest release that creates real developmental value, flag-gated, S5-compliant:

1. Member can explicitly begin a named Air inquiry in conversation (thread convention).
2. MAIA carries it across time with context-bound continuity (existing loaders + A1 tag).
3. Tier 0/1 recognition offers only (no Tier 2/3 in v0 — they need months of evidence to exist
   anyway), under Layer 1 governance.
4. Full disposition grammar incl. Held and Released-with-forgetting.
5. Articulation practice at multiple depths with version lineage and authorship markers.

Explicitly out of v0: Tier 2/3 claims · periodic reflection scheduling · any collective surface ·
practitioner visibility · public artifact generation · any new room. Each is named in the release
note as designed-but-not-built (six-category discipline: this list is Cat 2/5, not Cat 6).

## 5. Growth path without fragmentation

The three layers absorb the roadmap without re-architecture: Tier 2/3 claims switch on inside
Layer 1 when evidence accumulates and the pilot supports them · periodic reflection plugs into
Layer 3 when `ritual_review` scheduling is wired · Voice/Work/World pathway = configuration of the
same layers in occupational contexts (Book Studio "Ready to Write" becomes a Layer 3 consumer of
articulation versions) · relational Air practice deepens inside Layer 1 stance support ·
collective Air, if ever unlocked, arrives as a *new consumer* of the same restraint/evidence
discipline (Decisions ledger + offering acts), not a new substrate. If the elemental-restraint
generalization (Kelly's hypothesis) is ever ratified, Layer 1's RestraintContext is already the
container — Water/Earth/Fire/Aether refusal-sets would be sibling data, one more reason restraint
must be data, not prose.

## 6. Handed to Prompt 7 (UX)

1. The inspection view: reading experience for kept/held/released with provenance — quiet, no
   stats.
2. Silence rendering: what a turn that closes nothing looks like in text and voice.
3. Disposition gestures in conversation (keep/hold/release) without ceremony.
4. How pathway entry and exit *feel* — one plain question in, one plain gesture out.
5. Version-lineage reading ("what you said in March / what you say now") member-pulled display.
