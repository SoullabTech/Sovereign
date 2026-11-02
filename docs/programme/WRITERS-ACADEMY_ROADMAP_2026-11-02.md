# Writers Academy · Roadmap (2026-11-02)

```
STATUS:    ROADMAP: a proposed order of work for the founder.
           It authorizes nothing. Each step needs its own founder approval.
CANONICAL: c0129c670. Production: feba366e9.
LANES:     Implicit Academy = WRITERS-STUDIO-SEMANTIC-FIELD-01 (2026-11-01 ruling).
           Explicit Academy room = not open; needs a founder act.
```

## The aim

Writers learn the craft **through their own writing, in conversation with MAIA**. MAIA carries
the complexity, and the writer steers how deep each turn goes. Founder, 2026-11-01: *"the most
important aspect now is the internal academy that supports the writer through MAIA and the
studio"*; on the conversational version, *"this is the way to go!"*

**Never in any phase:**
- levels, tracks, progress, streaks, certificates;
- anything inferred about a writer's skill (L6c);
- the old `academy_*` tables;
- MAIA writing more of the writer's prose at any depth.

## Phase 0 · Done and live (production `feba366e9`)

| What | Where |
|---|---|
| Census, craft-idea contract (founder rulings), frozen ACAD-2 test suite | ACADEMY-01 census §§1–20 (#2015, #2019, #2042, #2043) |
| MAIA teaches as a conversation: one idea, then a question the writer steers by | #2044 |
| All eleven "Teach me" entry points share one teaching turn, guarded by a test | #2047 (`lib/writersStudio/teachingTurn.ts`) |
| "Teach me about this" one step from a selected passage | #2047 |
| A Teach me chosen at the privacy/relationship gates continues once the writer answers (never under Sanctuary) | #2054 |

**Evidence:**
- Local walks (ACADEMY-01 §19, #2047).
- The production re-run `…MAIA_FIELD_WITNESS_RERUN_2026-11-01.md`. Q3b through "Teach me about this": one idea, 142 words (was about 380), steering question. **Passes the founder's shape.**
- The #2054 production check: privacy unanswered, then Ordinary, then exactly one teaching turn.

## Phase 1 · Now: listen

1. **Jondi's walk.** The first writer other than the founder, non-technical, on her own Work. Invited 2026-11-01 from Proton, with a correction to choose Ordinary.
   - The four questions: conversation or lecture? pitched right? did MAIA give what was asked and no more? anything confusing?
   - **Her answers set the order of Phase 2**, and nothing in Phase 2 starts on a guess where her walk will tell us.

## Phase 2 · Next: make the in-Work Academy whole

Each item is small, its own PR, and witnessed on real replies (not only tests).

| # | Item | Why (evidence) | Owner |
|---|---|---|---|
| 2a | **One shared conversational shape**: `conversationTurn.ts` (`CONVERSATION_TURN_SHAPE`), and `teachingTurn.ts` builds on it with a test against drift | so typed questions and Teach me can't diverge | Walk session creates it (with 3C); this lane composes on it |
| 2b | **The free "Ask MAIA" box answers conversationally** (most important thing first, short, a question), and in full when the question asks for breadth | Q3 via the box: 364 words, several observations | Walk session (Design 3C, #2056) |
| 2c | **Walk the other ten Teach-me entry points live**: Develop observation, Review, Craftsman's Table, revision change, "Teach me why", "Teach me more" | they share the guarded module but only one entry is witnessed | This lane |
| 2d | **MAIA answers Studio-method questions** ("how do I compare…", "best way to work on this chapter") | Q4/Q5 still deflect | Walk session (Design 1A, Studio guide) |
| 2e | **Depth the writer can choose**, if Jondi's walk shows pitch mismatch: make Guided/Learning/Direct (or "say it more simply") visible on this path | no depth choice appears on the Teach-me path today | This lane, only on evidence |
| 2f | Watch, don't fix yet: MAIA opening follow-ups with "You're asking…" | seen in local walks | Judged after Phase 1 |

## Phase 3 · The craft library (founder-authored)

- **3a. ACAD-3, Tier 1 craft ideas.** A small reviewed set (single digits to start).
  - Each idea describes a technique and never prescribes quality.
  - Each is anchored in the writer's passage.
  - **The founder writes them** (ACAD-1 §11, ruling 4).
  - Each is admitted after at least one independent beta-writer read plus founder ratification.
  - They live as a static reviewed file in the repo.
- **3b. ACAD-4, wiring.** Teach me draws on the library, behind a flag, along with a consented store for review records (member data, never in the repo). The frozen ACAD-2 suite is the acceptance law.
- **Founder decisions owed:** the first ideas themselves; who the reviewing beta writers are.

## Phase 4 · A second, independent witness

- **ACAD-5.** A walk by a writer other than the founder and other than Jondi, on the version that includes Phases 2–3.
- Followed by a production witness.
- This is the gate for anything explicit.

## Phase 5 · The explicit Academy room (Door 2), only by founder act

Opens only after Phase 4 and after the founder lifts or reconciles the four recorded lines
(census §10). Tier 2 (longer-form room content, linked to Tier 1 ideas by id) needs its own
admission ruling (ACAD-1 §11, ruling 5, deferred). Every room lesson still starts from, and
returns to, a passage the writer chose.

## Decisions waiting on the founder

1. Merge the open records: #2045 (teaching plan) and #2056 (Semantic Field design rulings).
2. After Jondi's walk: the Phase 2 order, and whether 2e is needed.
3. Phase 3: when to begin writing the first craft ideas, and who reviews them.
4. Phase 5: only when Phase 4 is done.
