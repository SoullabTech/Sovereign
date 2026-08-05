# NOW WHAT? — EXPERIENCE GAP (2026-08-04)

**Release name (founder, 2026-08-05): "Now What? Client Home Experience v1 — The Room."**
Goal: *"I have a place."* This is the first customer-facing transformation — it is
NOT "the rebuilt platform," and it must not become the whole product promise.
The relationship behind the conversation door is v2/v3 work (Continuity Loop →
Companion → Practitioner Intelligence), sequenced visible-product-first.

**Acceptance test (experiential, replaces technical acceptance)** — a client
opens the room and immediately understands:
1. *Where am I?* — "This is my coaching space."
2. *Why am I here?* — "My work continues here."
3. *What can I do now?* — "I can continue the conversation."
4. *Why return?* — "Something meaningful is carried forward." **← the
   unfinished piece; v2's goal, not claimable by v1.**

**Merge gate (founder-required)**: no merge on description, architecture
explanation, or test output. The gate artifact is a screenshot of the actual
rendered room with real member data. The screenshot is the truth layer.
The walk that matters: *if Larry opened this room, would he immediately
understand why he paid for Now What?*

**Acceptance statement (founder-required, 2026-08-05)**:
> This release changes the arrival experience only. It does not claim that
> the coaching room, MAIA relationship, continuity loop, or Writer's Field
> equivalents are complete.

The doorway is finally honest; the house is not finished. Post-deploy
sequence (founder-set): **doorway deployed → Larry encounter (evidence) →
Session Room improvement → continuity loop.** After deploy, STOP building
and run the Larry walk — as Larry, not as founder or developer: does he
understand what this is · know how to use it with a client · does it extend
his coaching · does he want to bring clients here. Then one executive.

**Status**: Founder-directed reset (Kelly, 2026-08-04). This document is the
experiential target for the Home transformation. It supersedes the pending
acceptance-walk referent for the Home — the walk re-targets the transformed
room. It is written from a direct read of the working-tree implementation
(`components/now-what/ClientHome.tsx`, `NowWhatShell.tsx`, `RoomTrustCopy.tsx`
on the main checkout, uncommitted), not from prior session memory.

**The product promise being restored**:
> A living environment where a person's coaching work continues between
> conversations.

**The test every decision answers**: does this make the person feel
*"I am continuing my work"* — or *"I am managing my information"*?

---

## A. Current experience

What a signed-in client actually meets at `/now-what` today:

1. **A pill nav bar** (shell `full` variant): Now What? wordmark + a row of
   room chips. App chrome before the room says anything. First felt message:
   *"choose a module."*
2. **Seven stacked panels** in one vertical column: Arrival header → My
   Journey → Decisions → Commitments → Sessions → Reflections → Coach
   connection → trust disclosure. Identical glass-card treatment. The
   grammar is `Header / Tabs / Card / Description / Card / Description…` — a
   SaaS dashboard, regardless of how good the words inside are.
3. **For a new client, ~90% of the screen is empty-state prose.** Every panel
   opens with a lead paragraph explaining what it refuses to do, then a
   `Quiet` paragraph explaining why emptiness is valid. Seven explanations,
   zero experiences. The room describes itself instead of being itself.
4. **The conversation door is buried.** The single most meaningful action —
   enter a conversation — is an amber link inside the *fifth* panel.
   Conversation is a feature of the inventory, not the center of the room.
5. **No continuation gesture.** Sessions render as a date list ("you carried
   2 things forward") with no way to *pick the thread back up*.

The language layer is genuinely good (member-authored, attributed, no
scores). The failure is structural: **content and IA changed inside an
unchanged dashboard grammar.** Renamed sections ≠ redesigned experience.

## B. Desired experience

Within 10 seconds of opening, a client understands: *"this is my place to
continue my coaching work."* Concretely, the first screen communicates, in
order:

1. **I am known** — greeted by name, and by *where my work is pointed*
   (my own stated focal point), not by a feature inventory.
2. **I can have a meaningful interaction now** — one central doorway:
   *"What is alive for you today?"* → begin. The hearth, not a menu item.
3. **My work is here** — one living thread: the things I actually kept
   (decisions, commitments, questions, reflections interleaved as one field,
   in my words, each carrying its author), not four parallel empty drawers.
4. **I know what I can do next** — one continuation gesture from the last
   conversation; one quiet door to the full field.
5. **My coach's work with me continues** — one sentence stating the
   relationship and its boundary, not a panel about visibility mechanics.

Register target: *a trusted coach's room*, not *a SaaS application*.

## C. Exact delta

| # | From (current) | To (target) |
|---|---|---|
| 1 | Shell `full` (pill nav bar) on Home | Shell `quiet` — wordmark only; wayfinding folds into the room's own doors |
| 2 | 7 parallel panels | 4 movements: Arrival · Doorway · Living field · Coach line (+ existing collapsed trust disclosure) |
| 3 | Conversation door inside panel 5 | Central doorway, second thing on screen: *"What is alive for you today?"* → Begin |
| 4 | Sessions = date inventory | One continuation line: last conversation + what was carried → *Pick it back up* |
| 5 | Decisions/Commitments/Questions/Reflections as 4 separate bands | One interleaved thread ordered by the member's keeping gesture, each item typed + attributed (`decision · in your words · July 12`) |
| 6 | ~7 paragraphs of empty-state explanation | ≤2 quiet lines total when empty; the doorway carries the beginning |
| 7 | Coach connection panel + shared list | One sentence + shared items folded into the thread's existing `shared with your coach` marker |
| 8 | Journey panel with lead + provenance sublines | One arrival line under the greeting: *Working through: {focal point}* (provenance kept, one line) |

**Not part of the delta** (already right, preserved exactly): member-scoped
single composition call to `/api/now-what/home`; no writes on open; no
scores/streaks/progress; no system-voiced findings; attribution on every
line; `RoomTrustCopy` as one collapsed disclosure; threshold for signed-out.

## D. Implementation plan

**Scope: rendering pass on one file.** Rewrite the render layer of
`components/now-what/ClientHome.tsx`. No API change, no schema change, no
new routes, no new components, no MAIA wiring change. `app/now-what/page.tsx`
untouched. The doorway and continuation both go to the existing
`/now-what/room` conversation surface — the capability exists; it moves to
the center.

Verification: local dev server, before/after screenshots of the same room
under the same session, console clean. Then founder look, then the
acceptance walk against *this* room.

## E. What NOT to build

- **No inference on the Home.** *"What is alive for you today?"* is an
  invitation string, never a generated question from member material.
- **No new memory writes, tables, or migrations.** Opening the room still
  writes nothing.
- **No practitioner-side changes.** The coach line describes the existing
  boundary; it does not add visibility.
- **No new navigation, sections, tabs, or rooms.** This pass only removes.
- **No theme detection, summaries, or "MAIA noticed…".** The living thread
  is interleaving + rendering, not synthesis — every word remains the
  member's, with its author shown.
- **No backend "quick wins" while in here.** Field-note/API files in the
  working tree belong to other lanes and are not touched.
