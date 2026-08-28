# WRITERS-STUDIO-V2 — Programme

**This is the parent object.** It is not a task list handed to a session. It is
the standing programme that outlives every Claude Code context window.

Read order for any session touching Writer's Studio:

1. `STATE.md` — where the programme actually is. Short by design.
2. `PROGRAMME.md` (this file) — what is being built and in what order.
3. `DESIGN-CONTRACT.md` — the frozen visual/experiential source material.
4. `CAPABILITY-MAP.md` — what already exists and must survive.
5. `DECISIONS.md` — what has been settled, by whom, and when.
6. `ACCEPTANCE.md` — how a unit is proved finished.

**Do not reconstruct this programme from conversation history.** Claude Code
context is disposable. Programme state is not allowed to live in it.

---

## The correction this programme exists to make

The previous lane produced *new functionality wearing the old room*. Capability
was added to the existing Press shell because that shell was already there and
extending it shipped fast. The cost was exactly the thing the founder saw on
screen: function without the room.

**This programme is not "keep extending Press until it resembles the design."**
The reference screens describe a coherent product architecture. The existing
capabilities move *into* it, deliberately.

```text
WRITE → DEVELOP → EXPLORE → REVIEW → PUBLISH
```

One environment. MAIA as a persistent companion. The work as the shared object.
Materials, Structure, Versions, Goals, Research, Statistics appearing in the
context where they belong — not as seven unrelated features.

---

## Ownership

```text
Kelly
  ↓
Claude Code                    ← the current JARVIS console
  ↓
JARVIS operating protocol      ← programme state, governance, orchestration
  ↓
bounded implementation units
  ↓
production
```

**JARVIS Desktop is not on this critical path.** It is a separate programme
(`JARVIS-DESKTOP-REPAIR`, secondary) and it must never block this one. Desktop
catches up to the system later.

Claude Code holds the whole programme and issues bounded units underneath it.
Big enough intelligence to hold the whole design; small enough execution units
to know whether anything actually worked.

---

## PRESERVE — capabilities that must survive the rebuild

Listed in full in `CAPABILITY-MAP.md`. Summary:

- existing materials and their provenance
- versions
- developmental review
- reader lenses
- MAIA intelligence (companion stance, room facts, refusal discipline)
- manuscript structure
- find/replace
- member data and permissions

A unit that reaches its visual target by dropping one of these has failed, not
shipped.

## DO NOT

- continue decorating the old Press shell
- silently substitute one manuscript for another
- invent quality scores (see `DECISIONS.md` §D-003)
- destroy existing architecture to reach a visual target
- deploy unproved lineage

---

## Order

| Unit | Objective | Outcome |
|---|---|---|
| **WS2-00** | Product contract | Reference screens become canonical; five modes and shared architecture defined |
| **WS2-01** | Identity / content correctness | Correct work→manuscript→section→content resolution everywhere; no substitution, no silent fallback |
| **WS2-SUBSTRATE-01** | Object-model repair | Work↔Manuscript persisted; real provenance model; adoption/disposition state; companion FK. Authorized 2026-08-28 (D-021) — see `WS2-SUBSTRATE-01.md` |
| **WS2-02** | Studio design system | Typography, spacing, surfaces, gold treatment, navigation, panels, states, responsive rules |
| **WS2-03** | Studio shell | New application shell, persistent work context, navigation, MAIA region |
| **WS2-04** | WRITE | Chapter editor, manuscript navigator, focus mode, contextual materials, versions |
| **WS2-05** | EXPLORE / Work Home | Recent work, materials, goals, MAIA discoveries, work navigation |
| **WS2-06** | MATERIALS | Materials Studio: sources, transcript/audio/doc/image, preview, provenance, relationship-to-work |
| **WS2-07** | STRUCTURE | Structure map, outline, movements, threads, continuity, timeline, versions |
| **WS2-08** | DEVELOP / REVIEW | Developmental review, findings, passages/evidence, dispositions, reader lenses |
| **WS2-09** | MAIA | Context-aware companion across every field without creating competing MAIAs |
| **WS2-10** | Supporting fields | Goals, statistics, Notes, Research, Templates, Word Web, comments |
| **WS2-11** | PUBLISH | Export, manuscript assembly, sharing/review workflow |
| **WS2-12** | Integration | Migrations, regression suite, permissions, responsive behavior |
| **WS2-13** | Production walk | Deploy exact proven lineage; real-member experiential acceptance |

**WS2-SUBSTRATE-01 precedes WS2-02 — see D-021.** It is not a thirteenth unit
inserted for tidiness: the reference pack is ahead of the substrate, and
WS2-02/03 are entitled to implement against an object model that already tells
the truth. Doing the repairs inside the design units entangles presentation with
object-model work, after which *"the UI chose this"* and *"the data model forced
this"* can no longer be told apart.

**Deployment is per room, from WS2-03 onward — see D-012.** WS2-13 is final
acceptance, not first contact. The Studio goes live once WS2-02 + WS2-03 pass,
with core capability preserved, and each vertical room deploys as it finishes.
Exact lineage and both-ways verification apply to every one of those deploys.

Dependency order is real. WS2-02 and WS2-03 gate everything from WS2-04 onward:
**after WS2-03 lands, every change has to land inside the new Studio
architecture.** No further sophistication added to a room that is coming down.

---

## What a unit packet must contain

An agent that reads a screen, recognizes "developmental review", finds the
existing Press page and improves it has reproduced the exact failure this
programme corrects. So every unit gets, before implementation:

- canonical reference screen(s)
- intended user experience
- exact existing capabilities that must survive
- allowed implementation files
- known data/API substrate
- explicit things that must **not** be fabricated
- responsive behavior
- acceptance evidence required

**The visual hierarchy is itself a requirement.** The Developmental Review
screen is not "show findings"; its architecture is
`work context → manuscript navigator → whole-work analysis → findings →
evidence → conversation with MAIA`. That relationship is part of the spec.

## Vertical rooms, not backend features

A unit does not finish because an API exists.

`WS2-06` finishes when a writer can enter Materials Studio and
*import → inspect → understand provenance → establish relationship to work →
see connections → talk with MAIA → return to the manuscript.*

`WS2-04` does not finish because a rich-text package was installed. It finishes
when a writer can *open the correct manuscript → open the correct chapter →
write → format → autosave → navigate → pull material → ask MAIA → inspect the
insight → version → return later and find the same state.*

---

## Relationship to the previous programme

The R2 programme (`docs/programme/WRITERS_STUDIO_EXECUTION_DIRECTIVE.md`,
`WRITERS_STUDIO_PROGRAMME_BOARD.md`) is **superseded for sequence** by this
file. It is not deleted, and two of its holdings carry forward intact:

- **WS-01 formal acceptance** remains outstanding. Evidence 003 records PASS;
  acceptance is the founder's act and has not occurred.
- **STRUCTURE-02 remains held.** Its redefinition — structure as MAIA's
  *attentional architecture*, determining what stays outside attention, not an
  organizing feature — is canon and carries into **WS2-07**. See
  `WRITERS_STUDIO_EXECUTION_DIRECTIVE.md` § "Not 'give MAIA everything'".
- **SHELL-01 is withdrawn** as a standalone starting unit. Its intent is
  absorbed by WS2-02 + WS2-03.

`WRITERS_STUDIO_MASTER_BRIEF.md` remains the product constitution and is **not**
superseded. Where this programme and the Master Brief conflict on meaning, the
Master Brief governs.

## Quarantined — may not be cited in any WS2 outcome

- CADDY-CUSTODY-01
- Resend / `auth:email-code` failure
- dependency audit debt (38 prod vulns, 4 critical) and the inert `pnpm` gate on minisforum

These need fixing. None of them determines whether the creative architecture works.
