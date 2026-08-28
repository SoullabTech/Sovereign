# NW-F00 — NOW WHAT? IDEAL-STATE ARCHITECTURE

**Pass**: READ-ONLY. **No code changed. No implementation begun.**
**Governing question**: *how does a person who does not know what comes next enter a place that
helps them orient, understand, discover possibility, choose, move, reflect and become — while
increasing their agency rather than their dependence on the system?*

> **Method note.** Steps 2–4 build on census work already completed and recorded in this lane
> (`NW_D00_EXISTING_PRODUCT_CENSUS`, `NW_D01_5_…CONVERGENCE_CENSUS`, `NW_A01_…AUTHORITY_AUDIT`)
> rather than re-deriving it. Where a classification below rests on that earlier evidence it is
> marked; where it is new to this pass it is stated as such.

---

## 1 · BRANCH RECONCILIATION — and the finding that outranks everything else

| | |
|---|---|
| **CANONICAL** | `2cfa43f16` (2026-08-28, `clean-main-no-secrets`) |
| **UX-02** | `985de48cd` — **NOT an ancestor of canonical** |

🔴 **No Now What? work from this entire lane is in canonical.** Twelve commits sit unmerged —
`9471ddf2f` through `985de48cd` — and they include two repairs that are not cosmetic:

- **NW-I01** (`345dca25e`) — the constitutional floor could be bypassed on the room's `propose`
  path unconditionally, and skipped by an env flag on the turn path. **Unmerged.**
- **NW-A02** (`b386c2fc1`) — a contained field still composed into MAIA's prompt; any authenticated
  member could compose any practitioner's field by knowing its slug. **Unmerged.**

Everything else is documentation and UX-02.

**The branch tip is not a clean semantic statement**, exactly as suspected: three Writer's Studio
commits (`b1674c94c`, `d7f85de6b`, `e3964020e`) sit on top because this session may push only to
its assigned lane. They are semantically unrelated to Now What?.

**Recommended disposition** — no history rewritten, per §VI:

```
cut a fresh Now What? lane from canonical 2cfa43f16
carry 9471ddf2f … 985de48cd  (12 commits, Now What?)
move  b1674c94c, d7f85de6b, e3964020e  → the WS2 lane
leave this branch intact as evidence
```

---

## 2 · SURFACE CLASSIFICATION

Fourteen routes exist. **They are not fourteen product rooms.** (Evidence: NW-D00 §A.)

| Route | Classification | Basis |
|---|---|---|
| `/now-what` (Home) | **CANONICAL** | the environment root; every room returns here |
| `/now-what/room` | **CANONICAL** | the only conversational surface |
| `/now-what/arrive` | **PART OF CANONICAL JOURNEY** | auth door; not a room (registry excludes it) |
| `/now-what/questions` | **CANONICAL** | one of four noun-rooms |
| `/now-what/work` | **CANONICAL** | absorbed `cultivate` + `next` |
| `/now-what/coaching` | **CANONICAL** | absorbed `calendar` + `position` |
| `/now-what/field` (My Story) | **CANONICAL** | integrative by arrangement |
| `/now-what/map` | **SUPPORTING SURFACE** | reached from the wordmark, not a destination |
| `/now-what/welcome` | **SUPPORTING SURFACE** | public landing, zero inbound by design |
| `/now-what/practice` | **INTERNAL** | practitioner workspace, not a member room |
| `/now-what/home` | **DUPLICATE → retired** | redirects to root |
| `/now-what/cultivate`, `/next` | **LEGACY → retired** | redirect to `work` |
| `/now-what/calendar`, `/position` | **LEGACY → retired** | redirect to `coaching` |
| `/now-what/themes`, `/reflections` | **OBSOLETE → retired** | ruling D-E; redirect home |

**Six retirements were executed cleanly** — documented, no broken links, nothing member-facing
advertising unfinished software.

## 3 · CAPABILITY CLASSIFICATION

| Capability | State | Evidence |
|---|---|---|
| Member identity / invitation gate | **LIVE** | static allowlist of 3 contexts; interim by design |
| Keeps (`member_field_note_threads`) | **LIVE** | the one substrate carrying member material |
| Provenance (`authorship`, share-default-FALSE, `released_at`) | **LIVE** | column-enforced; the system's strongest asset |
| Questions / Work / Story rooms | **LIVE** | three filtered views of one table (NW-D00 F1) |
| Coaching room (upcoming, shared, position) | **LIVE** | reads `home` + `program-position` |
| The Room (conversation, keep, share gesture) | **LIVE** | `interview` + `field-note` |
| Constitutional floor on the room path | **PARTIAL** | repaired at NW-I01, **unmerged** |
| Field composition boundary | **PARTIAL** | repaired at NW-A02, **unmerged** |
| Continuity on Home (carried thread) | **PARTIAL** | UX-02, **unmerged** |
| Flourishing domains | **PARTIAL** | Larry's six live; unvalidated, unlicensed (NW-D01) |
| Safety / crisis / referral | **MISSING** | no substrate on the conversational path (NW-S01) |
| Coach→member publishing ("From Larry") | **MISSING** | no lesson/resource migration exists |
| Member↔coach messaging | **BUILT, unused here** | `phiAccessors` + `between_session_container` exist |
| Living map / room revelation | **DESIGNED** | map is a static registry view, not lived evidence |
| Themes / reflections | **LEGACY** | retired behind their gates |
| Locale for crisis resources | **MISSING** | 988/911 are US-only; no locale signal exists |

**Nothing here is called "complete" because a page renders.**

## 4 · THE ACTUAL MEMBER JOURNEY, FROM CODE

Not the ideal — what the code does today:

```
invite link → /now-what/arrive        register (name, email, password)
            → /now-what               five doors, no primary gesture¹
            → /now-what/room?entry=think   "What are you working through?"
            → conversation → MAIA proposes threads
            → Keep / Revise / Discard  + optional share-with-practitioner
            → closed state             confirmation + link²
            → /now-what               same screen as first visit³
```
¹ ² ³ repaired by UX-02, **unmerged**.

## 5 · AGAINST THE EIGHT-STAGE ARC

| Stage | State | Where it lives, or why it does not |
|---|---|---|
| **UNCERTAINTY** | **served** | The Room receives unformed material well |
| **ORIENTATION** | **weak** | Home is a directory; UX-02 begins the repair |
| **UNDERSTANDING** | **served** | MAIA's turn grammar is genuinely good |
| **POSSIBILITY** | **partial** | proposals are offered tentatively and typed by evidence |
| **CHOICE** | **strong** | Keep/Revise/Discard is a real member act |
| **MOVEMENT** | **weak** | a practice can be chosen; nothing supports living it |
| **REFLECTION** | **partial** | the return prompt exists (`entry=lived`) |
| **BECOMING** | **absent** | My Story arranges by month; nothing shows change over time |

**The arc's weak end is its second half.** The product receives a person well and returns them
poorly. That is the shape of the gap, and it is a continuity problem rather than a feature gap.

## 6 · THE MAPS

**Product map** — one place, four holding rooms, one working room, one threshold, one map.
**Continuity map** — one table, one member act (keep), one carried thread, no cross-session
synthesis. **MAIA map** — floor first, presence, field, position, lesson, room grammar last;
proposes, never authors. **Living-architecture map** — **currently empty**: the map renders a
static registry, and nothing in the environment reveals itself because something real happened.
**Gap map** — safety, becoming, movement, locale, publishing.

## 7 · THE NEXT MISSING RELATIONSHIP

> Not *"what feature next?"* but *"what is the next missing relationship required for Now What? to
> feel like one living place?"*

**The answer this census supports: the relationship between a member's act and the environment's
memory of it.** Everything the product does well is a single act well received. Everything it does
poorly is that act failing to change the place afterwards. Living architecture, becoming, return
and the map are all the same missing relationship seen from different angles.

## 8 · ORDERED BOUNDED UNITS

1. **NW-F00.1 — land the lane.** Cut from canonical, carry the twelve, move the three. **The two
   safety repairs are unmerged; this outranks all design work.**
2. **NW-F01 — Arrival → Room → Home continuity.** UX-02 is evidence, not acceptance.
3. **NW-F02 — continuity model.** What returns, and why.
4. **NW-F03 — living architecture.** Only after F02: revelation needs lived evidence to reveal.
5. **NW-F04 — room grammar.** Which of the four noun-rooms are rooms, views, or actions.
6. **NW-F05 — MAIA relational integration.**
7. **NW-F06 — practitioner relationship.**
8. **NW-F08 — responsive / mobile.**
9. **NW-F09 — failure and edge states.**
10. **NW-F10 — whole-platform acceptance.**

*(F07 sovereignty/portability: neither solved nor architected away — parked by its own terms.)*

## 9 · DO NOT IMPLEMENT

This pass changed nothing. **Stopping for founder ruling.**
