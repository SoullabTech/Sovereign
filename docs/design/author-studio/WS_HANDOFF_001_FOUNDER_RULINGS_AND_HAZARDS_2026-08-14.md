# WS-HANDOFF-001 — §11 Founder rulings (issued) · §12 Hazards · §13 Stop conditions

```text
STATUS ......................... RULINGS ISSUED — founder, 2026-08-14 (Kelly)
COMPANION ...................... WS_HANDOFF_001_APERTURE_PROTOCOL_v0.1_2026-08-14.md
CANONICAL REF .................. 8ca322891801960ff0b4bfd4c499d16436fd3b73

STANDING AFTER THE RULINGS
  WS-HANDOFF-001 ............... DESIGN FINDING / SPECIFICATION
  FOUNDER RULINGS .............. R1–R5 DECIDED
  IMPLEMENTATION ............... ⛔ CLOSED
  STUDIO HOME .................. existing acceptance/failure sequence remains PRIMARY
```

⭐ **These rulings decide principle. ⛔ None of them opens an implementation lane.** The live
member-facing problem remains **arrival** — `FOUNDER_STUDIO_HOME_WALK_VERDICT_2026-08-14`:
Studio Home walk **FAILED**, member-facing build **CLOSED**, redesign authority **DESIGN
ONLY**. R4 selects a *preferred direction* for whenever a lane is opened; ⛔ it is not that
lane.

---

## §11 — Rulings as issued

### R1 — Grammar: preserve the insight as an aperture model

⛔ **Do not canonize `Work → Writing → Materials → Shape → Expression` as five peer zones.**
`Work` remains the center. Existing nouns keep their existing meanings — in particular
⛔ **Expression does not become a room**, and ⛔ **Shape is not promoted out of its
already-ruled Studio meaning.**

The protocol layer uses **neutral relational vocabulary rather than product nouns** —
descriptions of distance, ⛔ not destinations in the UI:

```text
aperture.distance   close | gathered | structural | outward
aperture.focus      <focal object>
aperture.scope      local | work | selected-materials | whole-work
aperture.purpose    writer-declared  |  null
```

⭐ **The durable principle:** *The Studio contains governed changes of aperture around a Work;
aperture names must not manufacture new product rooms.*

This keeps the discovery without overriding `studioMap.ts` or the Expression ruling.

---

### R2 — No durable MAIA-authored `evidence_status` in v0.1

⛔ **There is no canonical MAIA-authored `evidence_status` field in v0.1.** It would create
precisely the second authority the protocol is trying to prevent. MAIA may produce an
assessment during an **active** inquiry; it remains an assessment and ⛔ never becomes the
durable status of the claim.

```text
PERSIST
  claim provenance · evidence references · writer acts
  writer recognition / declaration · historical MAIA proposal

⛔ DO NOT PERSIST
  claim.evidence_status = supported      ← as though the system owns that fact
  maia_confidence · maia_posture · authority_after · salience
```

⚠️ If longitudinal machine assessment is ever genuinely needed, it requires **its own ruled
object — an explicitly non-authoritative assessment event — never the claim's authority
state.** ⛔ Naming it here does not authorize it.

⭐ **This also resolves the temporal problem cleanly:** *provenance persists; MAIA's
assessment is recomputed.*

---

### R3 — Refinement mints a new claim; the old one is never rewritten

```text
H17: river imagery may be a recurring motif
        ↓ refines_into
H23: water imagery may mark structural transitions
```

H17 remains historically intact — `proposed_by = maia` · `writer_authorized = inquiry` ·
`disposition = unresolved / superseded-for-current-inquiry`. H23 receives **its own**
provenance, evidence, and authority history.

Otherwise an edit to a claim silently rewrites what the writer and MAIA actually considered
earlier.

⭐ **Foundational form:** *Intellectual development creates lineage; it does not rewrite
provenance.*

⚠️ Rider carried from the specification: lineage links are **declared by whoever proposes the
refinement, and recorded with that origin** — ⛔ never inferred by similarity, because
*connections are declared, never inferred.*

---

### R4 — Minimal substrate is the preferred direction (all three documented)

`DESIGN_LENSES` requires *obvious · simpler · minimal* before any implementation is proposed.
All three are recorded; the third is selected.

**Obvious — ⛔ rejected as preferred.** A durable `handoff` object carrying current
aperture, reason, posture, authority-before/after, hypothesis state. Too much denormalized
authority; **posture and claim status rot.**

**Simpler — useful, insufficient.** Keep existing Studio objects; add only an *ephemeral*
aperture context to MAIA/navigation. ⛔ Cannot preserve the crucial historical distinction —
*"MAIA proposed this; the writer agreed to inspect; no conclusion followed"* — so it loses
the epistemic continuity this job discovered.

⭐ **Minimal substrate — preferred.** Existing Work/belonging primitives plus a small
**append-only set of acts/events**, with current state **derived**:

```text
EVENTS (append-only; each says who acted and what authority that act created — usually none)
  threshold offered · threshold authorized · aperture entered
  hypothesis proposed · inquiry activated
  writer recognized · writer declared · decision made
  inquiry parked · inquiry rejected

DERIVED (⛔ never stored as mutable truth)
  current aperture · active inquiry · claim lineage
  writer authority · appropriate MAIA posture
```

This directly incorporates the job's strongest recovery finding: **`authority_after`,
`maia_posture`, and `hypothesis_status` must not become competing state stores.**

---

### R5 — Recognition and decision are orthogonal

⛔ **Never model `recognized → adopted` as a lifecycle.** Model two independent dimensions:

```text
epistemic recognition   ⊥   creative decision
```

A writer may legitimately: recognize a pattern and do nothing · adopt an edit without
believing the interpretation that led to it · **reject MAIA's hypothesis but keep an
interesting structural change discovered while testing it.**

⭐ Recorded as a **substantial correction** to the transition matrix proposed in the mandate.

---

### Held, ⛔ not opened

- **Platform-wide promotion** of this protocol — not ripe; no evidence available today could
  support it. Remains `UNESTABLISHED OUTSIDE STUDIO`.
- **A1** — the first member act establishing a Work relationship. Recorded on canonical as
  *deliberately unresolved*; ⛔ not answered here by accretion.
- **Reversibility of a belonging** — unspecified in canon; noted, ⛔ not designed.
- **May MAIA surface a parked claim unprompted?** Already governed by *never brings anything
  in unasked*: **she may not.** Below the boundary; ⛔ not escalated.

---

## §12 — Implementation hazards (for whenever a lane opens)

1. 🔴 **Any durable claim store is the largest new authority surface the Studio has proposed.**
   R2 and R4 shrink it to append-only acts, which is what makes it survivable at all.
2. 🔴 **Any UI that lists claims becomes MAIA's agenda.** A "things we're wondering about"
   surface violates *never brings anything in unasked* and defeats `inquiry_active`. Claims
   must be reachable **only through the writer's own question.**
3. ⚠️ **`last_examined_at` is counter-adjacent** — A2 constrains exactly this. If it can
   order, rank, or influence retrieval, it is an interpretive judgment wearing a timestamp.
4. ⚠️ **Denormalization drift.** ⛔ Never copy a claim's state into a crossing record; the
   copy ages into a contradicting authority. Carry `claim_ref` only.
5. ⚠️ **Stored posture** is the single mechanism by which an old posture stays permanently on.
6. ⚠️ **Lineage inferred by similarity** would make MAIA an asserter of relationships — the
   failure mode named against every comparator. Lineage is declared.
7. ⚠️ **`studio_projects` (B2)** — exists, 0 rows, predates the ruled ontology, **unruled.**
   Any claim/project association binds to an undetermined referent.
8. ⚠️ **Vocabulary leak.** *Aperture · distance · posture · crossing · claim* must not reach a
   member surface. Same class as *Hearth / Place / Gesture*.
9. 🔴 **Arrival is failing now.** Building an epistemic layer above an arrival that does not
   yet let a writer continue their work would compound, not repair. §5 framing: **the broken
   crossing is arrival.**
10. ⚠️ **Acceptance must be a writer walk.** Every claim here is of the form *"a member
    can…"*, and per the First Crossing observer constitution an endpoint result is
    **inadmissible** for such claims. ⛔ No `.focus()`, no direct calls, no SQL.

---

## §13 — Stop conditions, as resolved

| Mandate stop condition | Outcome |
|---|---|
| May MAIA cause a semantic transition without writer authorization? | **No.** Two dimensions; assessment never touches authority (R2) |
| May repeated attention increase authority? | **No.** ⛔ No dimension has a term for repetition or age |
| May MAIA-generated interpretations persist as member knowledge? | **No — R2.** Assessment is ephemeral; only provenance and writer acts persist |
| Does an aperture crossing constitute intent? | **No.** `aperture.purpose` is writer-declared or null |
| May anything join a Work without a writer declaration? | **Already ruled** — Guard 1 + `refuseBelonging()`. ⛔ Not reopened |
| Should this become a platform-wide protocol? | **Held — not ripe** |

**Steward-procedure stop conditions hit and reported:**

- ⚠️ **Custody.** Drafted from `feature/labtools-redesign` @ `d41b8b355` — **547 behind / 55
  ahead**, **500 dirty paths**. Per founder direction, custody was taken **off canonical
  `8ca3228918`** on a preserve branch; ⛔ nothing was committed from that worktree, and the
  lane was not contested.
- ⚠️ **Three governing documents** (`WRITERS_FIELD_GOVERNING_CONSTRAINTS`,
  `WRITERS_STUDIO_OPEN_ARCHITECTURAL_QUESTIONS`, `JARVIS_STEWARDSHIP_CONSTITUTION_2026-08-12`)
  exist on disk but **not at canonical**. Their standing here is *recovered design*.
- ⚠️ **A proposed schema could have duplicated an existing primitive** — resolved by binding
  the Work-belonging crossing to shipped `refuseBelonging()` / `refuseDeclaration()`.
- ⚠️ **Vision documents are not build authority.** The member-experience corpus declares
  itself CANDIDATE throughout; this specification inherits that limit.
- ⛔ **No live walk was performed.** No claim in either document is an experiential claim.

---

**What this job did not do:** write code · create a migration · rename anything · resolve A1,
A2, B2, or G1–G3 · open an implementation lane.
