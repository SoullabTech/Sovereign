# Client Home v1 — Available Now

**How a person continues their own work.**

2026-08-02 · Lane `feature/now-what-client-home-pilot` · trunk `c0c8b0ba6`
Scope: **existing live substrate only.** Boundary: `…CLIENT_HOME_SUBSTRATE_BOUNDARY.md`.
Experience principles: `NOW_WHAT_CLIENT_HOME_EXPERIENCE_DESIGN.md`.

⭐⭐⭐ **AMENDED 2026-08-02 — the governing design is now
`NOW_WHAT_PRACTICE_WORKSPACE_DESIGN.md`** (*familiar outside, transformative inside*). This document
survives as the **pilot build scope** only. ⛔ The planned separate "v2" document is **cancelled** —
future sections live in the workspace design so the layout anticipates them.

> **Pilot name: Client Continuity Pilot.** ⛔ Not a "Larry Platform Pilot."

---

## 1. What v1 claims

> Can a person return to their own work and experience continuity between sessions?

⛔ It does **not** claim Larry can extend his practice into the environment. That is the
**Practitioner Extension Pilot**, which requires the encrypted-content lane.

---

## 2. ⭐ The language ruling — relationship-oriented, not source-oriented

⭐ **AMENDED.** *"From Larry"* is legible as **one section inside a coaching space**. It is not
legible as **the organizing principle of the surface** — a person does not experience coaching as an
inbox sorted by sender.

| ⛔ As page structure (metadata) | ✅ As environment |
|---|---|
| From Larry · From MAIA · From Me — as top-level navigation | Current Work · From Larry · Your Reflections · Next Session — sections of *Your Coaching Space* |

> **Preserve authorship without making the person navigate authorship labels.**

Authorship appears **at the item** (*"Larry offered this"*) and as **one section among four** — never
as the top-level structure of the page.

---

## 3. Composition — only what exists

```
┌───────────────────────────────────────────────┐
│  Welcome back, [name]                         │  recognition
│                                               │
│  YOUR WORK WITH LARRY                         │  ← primary: location
│  [current process · program · stage]          │
│                                               │
│  Your focus: ______                           │  ← client-declared, their words
│                                               │
│  [ Continue ]                                 │  ← ONE primary action
├───────────────────────────────────────────────┤
│  What you are carrying                        │  ← secondary
│    tending · asking · alive                   │
├───────────────────────────────────────────────┤
│  Your Field                                   │  ← tertiary, always present
│    reflections · keeps · questions            │
└───────────────────────────────────────────────┘
```

⛔ **The "From Larry" section is not rendered in this build** — it has no content channel yet. It
**keeps its place in the four-section design** (`NOW_WHAT_PRACTICE_WORKSPACE_DESIGN.md` §5) so the
layout is not reorganized when the channel opens. See §5.

### 3.1 Panel → substrate

| Panel | Source | Note |
|---|---|---|
| **Your work with Larry** | `practitioner_clients` + `coach_client_processes` + `coach_program_enrollments` / `_stages` | structural only |
| **Your focus** | `coach_client_selected_focus` | ⭐ person-owned, **no `relationship_id`** |
| **What you are carrying** | `field_notes` §`tending` · `asking` · `alive` | the client's own commitments & practices |
| **Your Field** | `field_notes` §`emerging` · `member_field_note_threads` · `field_attention` | already live |
| **Continue** | unfinished client thread → MAIA | ⚠️ **client-side only** — no practitioner-set next step |

⚠️ **Sessions:** `coach_sessions` exists but carries only external calendar ids. A next-session date
may be shown **only if** it resolves without practitioner-authored description. Otherwise omit.

---

## 4. The boundary the UI must not undo

- `coach_client_selected_focus` has **no `relationship_id`** — Larry's relationship *cannot address*
  it. ⛔ Never present the client's declared focus as something Larry sees.
- ⛔ The system **does not decide** developmental position. Show practitioner-defined placement and
  client-declared focus; **never interpret progress.**
- **Your Field is not** *"what we know about you."* It is **"what you have chosen to carry."**
- ⛔ No system-generated next step. A next step appears only if a **person** authored it — in this
  build that person is always the client.
- **MAIA is a resident, not the house.** If its affordance is the most prominent element, v1 has
  failed regardless of conversation quality.

---

## 5. Absence, handled honestly

v1's honesty problem is that **the relationship is real but one-directional**. The person is in a
coaching relationship; nothing from the coach can arrive here yet.

**Ruling (amended): designed and held in the layout; not rendered until it has content.**

⭐ The section keeps its place in the four-section design, so the layout is not reorganized when the
channel opens. In the pilot build it is **not rendered** — because *a rendered empty container is a
claim that the channel exists.*

⚠️ This supersedes an earlier, more austere ruling that it be *conspicuously absent*. A visible hole
is its own dishonesty about the product's intent. The person sees no promise the system cannot keep,
**and** the design already anticipates the section.

⚠️ **What this costs, and it must be reported:** with nothing from Larry able to arrive, **the only
thing that can be waiting on return is what the client themselves left.** That is a genuine result
and a **narrower claim** than the full pilot intent. Report it at that width.

---

## 6. Required states (design before build)

| # | State | Must prove |
|---|---|---|
| 1 | first arrival, invitation just accepted | orientation with almost no content — a place, not an empty app |
| 2 | returning client, active process | signature case: recognition + location + one continuation |
| 3 | 🔴 active process, nothing new since last visit | must feel **held**, not **stale** — the hardest state |
| 4 | no active process | ⛔ must not read as an error or dead end |
| 5 | client has an unfinished thread | invitation without obligation |

⭐ **States 3 and 4 are the real design work.** They are where a relational environment is
distinguished from a dashboard.

---

## 7. Acceptance — Client Continuity Pilot

**Client can:** understand where they are · continue their own work · return and find continuity.
**Larry can:** invite a client · see the relationship · see structural state + what the client
explicitly shared.

⛔ **Explicitly out of scope, do not score:** Larry adding meaningful support · preparing the client
between sessions · anything requiring practitioner-authored content.

**Signature test:** a client leaves for two weeks and returns — *"here's another app"* or
**"something I began is still here"**?
