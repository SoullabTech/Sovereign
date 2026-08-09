# Now What? — Room Consolidation Pass (2026-08-05)

**Status**: **ONTOLOGY RATIFIED by founder (2026-08-05)** — the 4-noun-room + 1-verb-room grammar is accepted ("The resulting grammar is much cleaner"). Consolidation implementation NOT yet authorized. The two silent-loss bugs (§3) are explicitly first-priority and proceed independently.

**Founder rulings on the flagged decisions (2026-08-05)**:
- **D-A — RULED.** The Room is the verb-room; My Question and Think-with-MAIA do not split. "The Room is not another content category. It is where the person goes when they choose to think. Same room. Different arrival." Governing principle: *places where meaning accumulates; one place where meaning is explored — the rooms hold the person's life; The Room holds the conversation.* This prevents the AI layer from becoming the center.
- **D-C — criteria ruled, gesture wording open.** *"A turning point cannot be detected. A turning point is recognized."* The gesture is a member act (candidates: "This mattered" / "Remember this" / "This was a turning point"); the system may NEVER promote something because it appears statistically important.
- **D-D — test ruled.** *"Can someone say 'this is not the lens I use' and still belong in the room? If yes, it is an offering. If no, it has become architecture."* The six domains may be offered, never imposed.
- **D-E — direction ruled.** A held-capabilities page must orient, not advertise unfinished software. *"If it is only for internal transparency, keep it out of the member house."* Default disposition: no member-facing held page; the themes/reflections placeholders retire without replacement unless a member-orienting reason survives this test.
- **D-B — still open** (Position's home: My Coaching panel vs context strip).

**Architectural test now standing** (founder): *two rooms cannot exist merely because they use different nouns if they invoke the same human gesture.*
**Inputs**: `docs/reviews/NOW_WHAT_ROOM_DOORWAY_LOGIC_REVIEW_2026-08-05.md` + founder consolidation directive (2026-08-05).
**Governing tests** (founder-authored, applied to every candidate — including the founder's own five-room sketch):
1. What human question does this room answer?
2. What is its one primary gesture?
3. What changes when I leave?
4. Can another room replace it? → if yes, it is not a room.
5. *If this room disappeared tomorrow, what human experience would become impossible?*
6. Rooms are born from a repeated human gesture, not a conceptual category.

**CEO five-minute test**: the five places a first-week executive would believe exist here.

---

## 1. Target ontology — five rooms

The founder sketch named five: My Question · My Work · My Coaching · My Story · Think with MAIA. Applying test 4 to the sketch itself surfaces one collision: **"My Question" and "Think with MAIA" share the same gesture-verb (think with MAIA in conversation) and the same destination mechanic (the Session Room).** Two rooms with one gesture fail the sketch's own test. The resolution is not to delete either promise — it is to recognize that the ontology contains **four noun-rooms and one verb-room**:

| # | Room | Human question it answers | Primary gesture | What changes when you leave | Irreplaceable because |
|---|---|---|---|---|---|
| 1 | **My Question** | *What am I actually wrestling with?* | **Continue thinking** → enters The Room carrying the question's thread | The question is warmer: touched, revised, or resolved | Only place questions persist as living things across weeks — without it, inquiry restarts from zero every visit |
| 2 | **My Work** | *What am I living and cultivating right now?* | **Reflect on what you are living** → enters The Room carrying a practice or dimension | A practice is witnessed, adjusted, or completed | Only place chosen practices and cultivation are held together — without it, commitments exist only inside conversations |
| 3 | **My Coaching** | *How is another person's presence shaping this work?* | **Prepare for my next conversation** | You arrive at the next human conversation already oriented | Only room about a *relationship* rather than the member alone — without it, the coach is an appointment, not a presence |
| 4 | **My Story** | *What is becoming, over time?* | **See what is becoming** (member-assembled — see D-C) | Perspective: pieces cohere into an arc | The integrative room. Everything else is lived in pieces; without it, continuity is never visible |
| 5 | **The Room** (Session Room — "Think with MAIA") | *Can I think this through, now?* | **Think something through** | Something ephemeral became something kept — or was honestly discarded | The only gesture-generative surface; every other room's CTA lands here with context |

**Structural grammar**: four noun-rooms hold; one verb-room works. Every noun-room's primary gesture is a *contextualized door into The Room* — which is already the codebase's honest shape ("Return to the room →" everywhere). The dissonance the review found (many doors, one room, no differentiation) is cured not by splitting The Room but by making **every entry carry real context and a real arrival branch**. A door and a room need not be 1:1 — but a door's promise must be honored at arrival, mechanically, not just in copy.

**Front door** (founder direction): signed-in arrival = **Home**, answering *"here is what is alive since you were last here"* — five doors, aliveness-ordered by member-authored facts only (open question touched, practice active, conversation upcoming, thing kept). Map becomes post-orientation navigation, derived from the registry, never the landing.

---

## 2. Disposition of every existing surface

| Existing surface | Disposition | Where it goes | Notes |
|---|---|---|---|
| `room` (Session Room) | **KEEP** | The Room | Wire real arrival branches for every surviving entry (`think` currently dead; `cultivate` must persist — see §3) |
| `page.tsx` / ClientHome | **KEEP, rework** | Home (hearth) | 8 doors → 5; aliveness line per door; grid orphan resolved |
| `field` | **MERGE (split)** | Practices → My Work; kept-things timeline → My Story | Same substrate legitimately serves two rooms because the rooms answer different questions — the table is not the organizing principle |
| `next` | **RETIRE** | Lens inside My Work | Strict subset of field; keeps its copy line ("held open, not prescribed") as My Work's practices panel |
| `cultivate` | **MERGE** | My Work (cultivation panel) | **BLOCKED until the dimension-persistence bug is fixed** — the room may not re-open while the placing gesture silently drops (see §3, D-D) |
| `questions` | **MERGE** | My Question (its ledger) | **BLOCKED until the phase-tag bug is fixed** — self-authored questions currently never surface |
| `position` | **MERGE (flagged)** | My Coaching panel — see D-B | Program placement is relationship-context, not a standalone room; keeps "only you can say where you are" |
| `coaching` | **KEEP, absorb** | My Coaching core | Absorbs calendar's upcoming/previous blocks (currently duplicated byte-for-byte) |
| `calendar` | **RETIRE as room** | Upcoming conversations → My Coaching; commitments → My Work | Founder reframe honored: a commitment's home is *the living of it* (My Work), not a date grid. No separate productivity object |
| `themes` | **DEFER** | Single held-capabilities statement — see D-E | Held promise stands; two near-identical placeholder rooms collapse to one page |
| `reflections` | **DEFER** | Same held page | Same template, same rhetoric — one honest statement, not two rooms |
| `map` | **KEEP, demote** | Post-orientation navigation | Derive rooms from `lib/nowWhat/rooms.ts` (registry becomes single source of truth; all five rooms registered; `rooms.test.ts` gains disk→registry assertion) |
| `arrive` | **KEEP** | Auth door | Signed-in landing → Home (not Map); dead `ArrivalResolving` branch removed in passing |
| `welcome` | **KEEP** | Public threshold | `/now-what/pitch` gets a real route or in-repo redirect |

Net: **13 surfaces → 5 rooms + 4 non-room surfaces** (Home, Map, Arrive, Welcome). Nothing a member kept is deleted; only doors and duplicate renderings retire.

---

## 3. Sequencing constraint — trust before architecture

The two silent-loss bugs precede any consolidation work, because both violate the trust contract the ontology is built on (*invite meaning-making, then fail to preserve it*):

1. **Cultivate dimension persistence** — the placing gesture must actually write, or the door stays closed.
2. **Question thread classification** — member-authored questions must reach My Question's ledger.

These are fixes to the *current* code and are ontology-independent — they are correct under any future room structure.

---

## 4. Decisions requiring founder ruling (not settled here)

- **D-A — Question/Think shape.** Recommended above: My Question = noun-room (holds living questions), Think-with-MAIA = the verb-room itself, not a sixth room. This *diverges from the sketch's literal five* by one substitution. Confirm or overrule.
- **D-B — Position's home.** Recommended: panel inside My Coaching. Alternative: context strip only (not member-facing as a place). Program-scoped members are the only ones affected.
- **D-C — My Story's marking gesture.** "See what is becoming" must be **member-assembled** (pulled, never pushed): what gesture promotes a kept thing to a turning point? No silent promotion; no MAIA-narrated arc. Until the marking gesture is ruled, My Story = the month-grouped kept-things timeline (current field page behavior) — integrative by *arrangement*, not by synthesis. Related live substrate: episodic marks (`/maia/moments`) exist outside Now What?; whether they feed My Story is part of this ruling.
- **D-D — Cultivation vocabulary.** The six hardcoded domains are a fixed framework imposed on the member (Invariant 14 exposure; the review's flourishing-taxonomy boundary). Options: (a) member names their own dimensions; (b) six domains as *offered starting vocabulary*, member may rename/discard; (c) keep fixed six. Recommended: (b).
- **D-E — Held-capabilities page.** Recommended: one page ("What is not open yet, and why") replacing themes + reflections until either capability actually ships.

## 4b. Post-deploy acceptance walk for PR #980 (founder-authored, 2026-08-05)

State transition ruled: ratification = what rooms/gestures *mean* · #980 = mechanical proof the ratified meanings survive contact with the system · consolidation build = still held. The checkbox is **a declaration of authorship, not metadata**; *"the member's gesture is the classification event."* Merge posture: founder merges only after PR review confirms migration + route behavior. Deploy: full `deploy <SHA>` (migration), never quick rebuild.

The walk (after merge + deploy):
1. Enter the Flourishing Field through a dimension.
2. Create a reflection.
3. Choose keep/place.
4. Leave.
5. Return to the field.
6. Confirm: it appears only where the member placed it · the wording remains theirs · provenance is visible · nothing appears because MAIA inferred it.

~~⚠️ Pre-registered expected finding at step 6: no member surface renders per-dimension threads yet~~ — **SUPERSEDED (2026-08-05, post-deploy verification)**: this finding described trunk *before* #978. PR #978 also built the minimal read side — the Flourishing Field (cultivate page) now fetches the member's threads and **gathers them per `flourishing_dimension`** (up to 4 per domain, session-gated, member's words only, unplaced material never renders, quiet on read failure). Deployed at `7ef3f04a7`. **Step 6 is therefore walkable in full for the dimension path.** Still open: the broader ontology read side (My Work room, question/practice gathering, provenance labeling per thread) — the consolidation slices remain unauthorized; the Flourishing Field's gathering is the minimal loop, not the My Work room.

Governing principle (founder): *a field is not a collection of topics; it is a collection of relationships a person has intentionally placed.*

**Two-loop framing (founder, 2026-08-05 — governing interpretation for the walk and the next authorization):**
- **Write loop — implemented by #980**: dimension doorway → member reflects → member chooses keep/place → thread persists with dimension provenance. Verifiable now: explicit gesture · no inference · invalid dimensions rejected · originating dimension survives persistence · API returns placement context.
- **Read loop — not yet implemented**: member returns → field gathers placed threads → dimension area shows accumulated work → member recognizes their own continuity. *The system is currently carrying memory without yet providing the experience of memory.* The read slice is **the completion of the ontology, not a cosmetic enhancement** — without it the database knows, the API knows, the member does not. *A field exists for the member, not for the database.*

**Review posture for #980 (founder-ruled, final form)** —
*Approve if*: ① migration additive and safe · ② existing records remain valid · ③ dimension values constrained · ④ placement comes only from member action · ⑤ no runtime surface claims more than the implementation proves.
*Reject or hold if*: the system begins inferring dimensions · Larry's framework is implied before authorization · the migration creates an obligation to render unsupported behavior · provenance is presented as if already visible when it is only stored.
Do NOT expand scope: read rendering, provenance display, and My Work are intentionally deferred, separately authorized slices.

**Production verification after merge — one sentence, not the whole field**: *"When a member makes a placing gesture, the system remembers that gesture faithfully."* It should NOT attempt to prove the Flourishing Field. The future read slice then reveals continuity that already exists in the substrate rather than building empty architecture — *the sequencing that prevents a beautiful interface from outrunning the underlying truth.*

**Honest acceptance statement after #980**: *"The system can now remember where a member intentionally placed something. The system cannot yet show that remembered placement back to the member."* A successful intermediate state, not a failure.

**Next authorization question (queued behind production verification, NOT yet authorized)**: build the read-side field gathering so intentional placements become visible continuity. Not a redesign. Not more rooms. Not more concepts. Complete the loop.

**Write-loop closure record (2026-08-05, post-deploy)**: #978 owns dimension placing (`flourishing_dimension`, CHECK-constrained, indexed); #980 owns the question gesture — both merged, fully deployed at `7ef3f04a7`, schema-verified in production, no shadow ontology (orphan `dimension` column confirmed absent). Final write architecture: two member-declaration paths, one deeper rule — *meaning enters through human declaration, not system interpretation.* Supported claim: *if a member places something or names a question, it will be preserved* — **and, for the dimension path, gathered back into the Flourishing Field's domain areas** (#978's read side, deployed; correction 2026-08-05 — the earlier "stored but not rendered" framing was stale against #978's full scope). Not yet supported: *a member has returned and recognized their own continuity* — that evidence requires a real member's placement and return, and the broader ontology read side (My Work room, question/practice gathering) remains unbuilt and unauthorized. The remaining read-side question is therefore experiential, not hypothetical: **does the member experience the continuity the architecture intends to hold?** The write side has earned that question; it has not predetermined the answer.

## 5. Constitutional guards carried into the ontology

- Aliveness-ordering on Home keys on **member-authored facts only** — never inferred psychological state (Inhabitable Architecture sovereignty rider).
- My Story and any future themes surface remain **pull-only**; the system never announces a pattern.
- Every merge preserves the existing **withdraw-visibility** gesture wherever kept things render.
- Authority direction respected: nothing here manufactures higher-order meaning from kept fragments; The Room proposes, the member keeps, My Story arranges what was kept.

---

*Test against the CEO five-minute question: My Question · My Work · My Coaching · My Story · The Room. Five places, five distinct verbs, one house.*
