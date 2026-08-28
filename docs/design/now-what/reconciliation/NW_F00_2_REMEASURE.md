# NW-F00.2 — Remeasure against canonical `d332935ae`

**Mode**: read-only. **No implementation.**
**Canonical**: `d332935ae` — now contains the recovered lineage (UX-02, NW-I01, NW-A02).
**Question**: *can Larry V1 be produced mostly by recomposing existing capability, and what is the
smallest genuinely missing set?*

## Answer

> **Yes. Larry V1 is predominantly recomposition. Four member surfaces need zero new routes, and
> the genuinely missing behaviours reduce to three — of which only one is unavoidable for V1.**

---

## Source status (corrected)

The Scope & Direction deck is **founder-provided source evidence, reviewed externally** — not
merely relayed. It is **not** classified as Larry-authored teaching material; authorship is
unconfirmed and that classification waits on separate confirmation.

**Confirmed product doctrine**: a simple, elegant environment helping successful people answer
*"Now what comes next?"* · journey **Achievement → Transition → Clarity → Confidence →
Flourishing** · **Phase 1 goal — help people continue the work when they are not with Larry, while
keeping Larry at the centre of the relationship.**

**Confirmed architectural intent**: simple visible surface, strong foundation underneath; preserve
continuity, permissions, sharing, materials, sessions and future growth; **do not expose enterprise
complexity merely because the substrate exists.**

**Visual — preference evidence, not a ruling.** Larry has *leaned* Miami / Palm Springs, brighter,
cleaner, more colourful. **The preference checklist is blank.** Therefore: **the warm-token brand
system is NOT superseded**, nothing is re-tokenized, and alternatives may be prototyped and put to
Larry for acceptance. *(This retracts the supersession flag raised in NW-V1-DESIGN-01 — a leaning
is not a decision.)*

**Teaching boundary.** The deck does not define the methodology and says so. **No definitions of
the five stages, no exercises, practices, assessments, stage transitions or coaching doctrine may
be invented.** The journey's *sequence* is preserved; its *content* is not ours to supply.

## Is the F00 diagnosis still true on `d332935ae`?

**Mostly repaired, and the core finding stands.**

| F00 finding | Status now |
|---|---|
| Lineage not in canonical | ✅ **RESOLVED** — merged |
| Home is a directory, no primary gesture | ✅ **RESOLVED** — UX-02 |
| Return is Today again | ✅ **RESOLVED** — carried thread promoted |
| Keep's arrival not perceptible | ✅ **RESOLVED** — names the room it went to |
| Two design languages | ✅ **RESOLVED** — one shared surface |
| Floor bypassable / composition unbounded | ✅ **RESOLVED** — I01 + A02 |
| **Environment has no memory of the member's agency** | ⚠️ **PARTIALLY** — Home now shows the last keep; nothing yet shows *change over time* |
| Living map reveals nothing lived | ⚠️ **UNCHANGED** — correctly out of V1 |

**The remaining gap is exactly one thing: `WHAT HAPPENED NEXT`.** Everything else the deck's Phase 1
asks for now exists.

## Deck Phase 1 needs, mapped to canonical

### Client side

| Deck need | Canonical | Disposition |
|---|---|---|
| Reflection | The Room | **RECOMPOSE** |
| Insights | keeps, `member_field_note_threads` | **RECOMPOSE** |
| Questions | `spiralogic_phase = 'question'` | **RECOMPOSE** |
| Continuity | carried thread on Home (UX-02) | **RECOMPOSE** |
| Deliberate sharing | `can_be_shown_to_practitioner`, default FALSE | **KEEP — do not touch** |
| Materials *(Larry's, reaching the member)* | 🔴 no member-facing surface consumes practitioner materials | **MISSING** |
| Uploads | "bring an insight" is client-side `FileReader`/paste, **never uploaded** | **MISSING** |

### Larry side

| Deck need | Canonical | Disposition |
|---|---|---|
| Clients | `/api/practitioner/clients` | **RECOMPOSE** |
| Programs | `/api/practitioner/programs`, `field_programs` | **RECOMPOSE** |
| Sessions | sessions substrate + `sessionPrep.ts` | **RECOMPOSE** |
| Resources | `practice_fields.resources` (JSONB, exists) | **RECOMPOSE** |
| Client context | Bring-Forward — member-shared only | **KEEP — the invariant** |
| Private practice development | `practice-field`, `maia-guidance`, `practices` | **RECOMPOSE** |

**Larry's side is essentially complete as substrate.** Fifteen practitioner API groups exist. His V1
is a *composition and restraint* problem — showing four things on a phone and hiding eleven — not a
build problem. That is the deck's own instruction: *do not expose enterprise complexity merely
because the substrate exists.*

## The smallest genuinely missing set

**Three, ranked. Only the first is unavoidable for V1.**

**1 · `WHAT HAPPENED NEXT` — required.**
The one thing that makes return consequential and the only gap in the member's core loop. A member
chooses a practice, lives it, returns — and there is no place for what happened. The room has the
prompt (`entry=lived`); **nothing carries its answer back to the surface that shows the choice.**
Smallest form: a kept thread whose provenance links it to the practice it answers. **A relation,
not a subsystem** — the substrate holds both objects already.

**2 · Materials reaching the member — deferrable.**
`sharedOfferings` and `/api/practitioner/materials` exist on Larry's side; no member surface
consumes them. Real V1 value (*"access Larry's materials between sessions"*) but the loop closes
without it. **Defer unless Larry says it is essential to his practice.**

**3 · Member upload — deferrable, and deliberately so.**
"Bring an insight" is intentionally client-side and never uploaded. Making it persist is not a UI
change: it introduces member-authored file storage, retention, and consent — and it is exactly the
kind of capability the deck's *"strong foundation, simple surface"* would want designed rather than
bolted on. **Defer.**

## Standing constraints re-confirmed at this canonical

- **Larry sees what the member deliberately shared. Never what they explored privately.**
  Architectural boundary, not a V1 UI choice.
- **Mobile-first** — invariant; desktop expands the phone composition.
- **Six flourishing domains hidden in V1** — unvalidated, unlicensed (NW-D01), and the deck defers
  methodology.
- **No re-tokenization** pending Larry's blank checklist.

## Disposition

```
NW-F00.2
diagnosis on d332935ae     largely resolved; one gap remains
recomposition answer       YES — 4 surfaces, 0 new routes
genuinely missing          3, of which 1 required for V1
implementation             none
```

**Next: the three iPhone prototypes** — Returning Home, The Room, What I'm Carrying. **STOP for
founder review.**
