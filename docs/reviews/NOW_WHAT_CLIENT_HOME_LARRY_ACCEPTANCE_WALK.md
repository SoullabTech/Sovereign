# Now What? Client Home — Larry Acceptance Walk

**Date:** 2026-08-02 · **Status:** ACCEPTANCE DESIGN. Not executed. Not authorized.
**Design lane FROZEN** — this artifact defines how Slice 0 would be *accepted*, not what to build.

**Composes with (does not replace):**
`docs/specs/developmental-environment/FIELD_STUDY_METHOD_CANDIDATE_2026-07-29.md` — evidence
classes, observation status, confabulation guard, study ethics.
Prior lane: [Phase 0](../architecture/NOW_WHAT_CLIENT_HOME_LARRY_PILOT_PHASE0_2026-08-02.md) ·
[Phase 0.5](../architecture/NOW_WHAT_CLIENT_HOME_PHASE_0_5_BOUNDARY_2026-08-02.md) ·
[Experience Design](../product/NOW_WHAT_CLIENT_HOME_EXPERIENCE_DESIGN_2026-08-02.md)

---

## 0. What Slice 0 actually is

> **Slice 0 is not a homepage with widgets. It is a trust boundary demonstration.**

The thing being accepted:

> A client can return to their work and feel accompanied, while the practitioner can support the
> relationship without gaining invisible access to the client's inner process.

That is a stronger test than *"does the dashboard display data?"* — and it is why acceptance cannot
be an automated suite. Half of it is structural and machine-checkable. The other half exists only
in two people's experience.

**The absence is the product.** Larry's view is accepted partly on what it does *not* contain.

---

## 1. The confabulation guard — who may answer what

**This is the load-bearing constraint of this document.**

Every question in Walks A and B is **Class C — experiential**. Per the method, Class C *may not
support rulings until human observation confirms it.* An AI observer is most fluent and least
truthful exactly here.

> **Claude may not walk Walk A or Walk B.** I do not experience accompaniment, or being observed,
> or feeling met. Producing an account of "how the Home feels" would be a literary performance
> wearing the costume of evidence, and downstream it would be read as though a human reported it.

| Who | May produce |
|---|---|
| **Claude** | Gate 0 structural assertions (Class A/B), copy audit (Class A), Class E constitutional check, this design |
| **Larry (human)** | Walk A findings only |
| **A real client (human, consented)** | Walk B findings only |
| **Nobody** | A Class C finding inferred from implementation |

**Required form for any Class C statement, if one is written before human observation:** not
*"the Home feels calm,"* but *"the Home presents one action per band with named consequences —
a structure associated with lower decision load"* — with the class tag attached.

---

## 2. Gate 0 — structural assertions (Class A, must pass BEFORE any human walks)

Evidence is a **prerequisite, never a substitute**. If Gate 0 fails, the walks do not happen: you
would be asking two people how a broken boundary feels.

| # | Assertion | Method | Class |
|---|---|---|---|
| **G1** | A practitioner-scoped query cannot reach `coach_client_selected_focus` — no `relationship_id` exists on it | schema assertion (gate `1a`) | A |
| **G2** | A practitioner-scoped query cannot reach member Field material | route + query audit | A |
| **G3** | Larry's client view returns **no** focus field — absent from the payload, not `null`-and-hidden | response inspection | A |
| **G4** | Withdrawal emits **no** practitioner-visible signal and **no** notification | route audit + `member_field_note_events` reader census | A |
| **G5** | No deferred `coach_*` content table exists (gate `1d`) | boundary gate | A |
| **G6** | Scope derives server-side from the authenticated actor; no client-supplied identity is honoured | route audit | A |
| **G7** | A second practitioner cannot reach this relationship; refusal asserts a **matching reason** | refusal probe | A |
| **G8** | Band ① ordering contains no recency judgment (§4, E-2′) | code read | A/B |
| **G9** | Copy audit: no productivity semantics (§4) | string audit | A |

**G3 is the sharp one.** A field that is present-but-empty in the payload is a different system
from a field that is absent. The first leaks that focus exists and invites a future developer to
render it; the second cannot. *Prefer boundaries unreachable by construction.*

⚠️ Gate 0 must run against the **deployed referent**, not an observer's checkout. Standing trap
I-11: `--verify` fingerprints the observer's build. Verify the running commit separately.

---

## 3. Walk A — Larry

**Seat:** Larry Closs, practitioner. **Observation status:** Walked (required).
**Screen under walk** — deliberately minimal; the full Practice Workspace is NOT in scope:

```
Larry's Practice · Clients · Senja

Relationship:   Active
Program:        Leadership transition
Stage:          Exploring
Client focus:   (not visible)
Client Field:   (not visible)
```

| # | Question | What a pass looks like | Class |
|---|---|---|---|
| **A1** | Can Larry understand who this person is and where they are in the shared work? | He can state the relationship, program and stage unprompted | C |
| **A2** | Can he prepare for the next conversation? | He can name what he'd open with, using only what is shown | C |
| **A3** | Does he wonder why he cannot see more? | — see the interpretation trap below | C |
| **A4** | Does the system feel supportive rather than restrictive? | Restriction reads as *design*, not as *missing feature* | C |

### ⚠️ A3 is ambiguous by construction — design the probe, don't just ask

Silence is not evidence. *"Never wondered"* can mean the boundary is well-designed **or** that he
never engaged deeply enough to reach it. The probe must distinguish:

1. **Unprompted:** did he ask, during the walk, to see more? Record verbatim.
2. **Prompted, after:** *"there are things here you cannot see — did you notice?"*
3. **If he noticed:** did it read as *withheld* or as *not his to hold*?
4. **The adoption question:** *"would you want it?"* — and then, separately, *"should you have it?"*

A practitioner answering *"I'd want it, and I shouldn't have it"* is the **strongest possible
pass**: the boundary is legible, felt, and endorsed. Record all four answers; do not collapse them.

**Do not lead the witness.** Larry is not told in advance what the design is proving.

---

## 4. Walk B — Client

**Seat:** a real client, in a real relationship with Larry. **Observation status:** Walked.

> **Study ethics — consent gate (not optional).** Walk B observes a real person's real material
> inside a live developmental relationship. It requires the client's explicit, informed,
> revocable consent to being observed *as a research subject*, separate from any consent to use
> the product. The observer must not read their Field content into the study record. **The study
> is itself a governed act** — an acceptance walk may not become the first violation of the
> boundary it is testing.

| # | Question | What a pass looks like | Class |
|---|---|---|---|
| **B1** | Do I recognize myself here? | They read their own material and say *"yes, that's mine"* — no reorientation needed | C |
| **B2** | Do I understand what Larry is offering? | They can state what is his and what is theirs, unprompted | C |
| **B3** | Do I feel accompanied rather than evaluated? | No sense of being assessed, scored, or reported on | C |
| **B4** | Do I know what I can continue? | They can name a next thing **and** that it was their choice | C |

### The final acceptance question

> **Does the client feel met, not measured?**

No schema and no automated test can prove this. It is the acceptance criterion, and it is a human
finding or it is nothing.

**Empty-state variant (required, not optional).** Walk B must also be run with a client who has
**no active program** — the arrival state. If the Home only works once Larry has placed someone, it
is a dashboard that is sometimes blank, and Q-B was not actually honoured.

---

## 5. Language acceptance (Class A audit + Class C confirmation)

The Home must not turn reflection into project management. Kept ≠ completed · recognized ≠ resolved
· present ≠ progressed.

| Prohibited | Preferred |
|---|---|
| Completed · Progress · Goals achieved · Items remaining · Done | Carrying · Returning to · Exploring · Holding |

**E-2′ ruled — ordering carries interpretation.** Ordering by *newest*, *most active*, or *most
important* embeds a judgment before a word is read.

> **Preserve the member's chosen center order if one exists; otherwise preserve the order of
> keeping. Never label it "recent."**

The invitation must read *"here is what you are currently carrying,"* never *"here are your latest
thoughts."* Those are different psychological invitations. `member_field_note_center` is the first
place to look for an existing center mechanism — do not invent a second one.

**E-3 consequence — withdrawal is not a social act.** The Home must never render *"you withdrew
this from Larry."* The member's experience is **my Field changed**, not *I performed an action
toward Larry*. Rendering withdrawal as a directed act builds a surveillance relationship around the
very gesture that exists to prevent one. Class A check: no copy string on any member surface names
the practitioner as the object of a withdrawal.

---

## 6. Class E — constitutional consistency

Checked by Claude, not by walkers:

- MAIA is not the destination — one door among several, bottom weight
- Authority moves only upward through authored experience — no practitioner claim rendered as the
  client's state
- The member understands who can see what — privacy story one tap from the top
- Consent is unmistakable — no ambient sharing
- The Field is the platform root — Home survives with no relationship (state E)
- No manufactured higher-order meaning — nothing on the page is model-generated about the person

---

## 7. Result vocabulary

Each walk question resolves to exactly one, per the three-layers-of-review rule:

**Pass** · **Fail** · **Blocked** (couldn't reach it) · **Not applicable** · **Rationale
insufficient** (*"by design"* offered where no ruling exists).

**Three destinations:** structural failures → defect queue · experiential findings → design queue ·
questions the design cannot answer → founder docket. Do not merge the queues.

⚠️ A passing Gate 0 with an unrun Walk A/B is **not acceptance**. *A harness never run is a
proposal.* Slice 0 is Accepted only when both walks have been performed by their human seats.

---

## 8. Explicit non-actions

This document does not: authorize implementation · specify UI · schedule a walk · assert any
Class C finding · claim Gate 0 has been run · approve Walk B without the consent gate.

---

## 9. Status

Acceptance design recorded. Design lane frozen. Nothing built, nothing walked.
Execution authorization — and the Walk B consent decision — are the founder's.
