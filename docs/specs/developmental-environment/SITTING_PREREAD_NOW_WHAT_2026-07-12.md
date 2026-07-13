# Sitting Pre-Read — the Now What? Field
**2026-07-12 · one page · both lanes' records reconciled — no item below is disputed between them**

**How to read this:** every numbered item is a *rulable question*, ordered by leverage, with the work each ruling unblocks attached. Nothing here needs design at the sitting — the designs exist (Q3's is carried in the other lane's record, not yet in-repo; see its note); only rulings are missing. Q2 and Q3 were ground-truthed against the working tree on 07-12 — the counts below are verified, not carried. The sitting is the bottleneck by intention, not by backlog.

---

## Q0 — The name. *RATIFIED in-session 07-12.*
Kelly, directly: **"It is supposed to be Now What?"** — live production copy, the walk transcripts, and the fact that the platform's name *is* the client's arrival question all sit on it. The sitting need only witness the ratification into the record; the ground is signed. (The record's failure mode that made this necessary: a standardization got written down, propagated, swept member-facing labels once, and nearly swept them back the same day.)

**Unblocks — four mechanical sweeps:**
1. ~~Eight "What Now?" instances on `feature/now-what-program-catalog`~~ — **SWEPT 07-12** on ratification (map/welcome docstrings, naming doc; the `EnvironmentMapView` render was fixed in-lane the same evening).
2. `lib/og/ogCard.tsx:189` — **the one public instance**: eyebrow, tab title, OG metadata, share card at `soullab.life/now-what/welcome`, unauthenticated. Tracked + deployed file → its own PR through the deploy lane. *Caveat, carried verbatim: already-shared links keep showing the old card after the fix — the correction is prospective only.*
3. The dossier — Larry's orientation document, currently standardized on the inverted name.
4. The session-memory record's own entry titles — a record that carries the drift it documents keeps re-importing it.

## Q1 — The legibility build. *(First wound; smallest build; highest client leverage.)*
MAIA's field-knowledge of the room's own holding + the member trust copy + the store-boundary guard, **shipping as one act** — the trust promise renders only when the guard makes it true. The walks say this is where members first reach and find nothing.
**Unblocks:** trust copy on both map views; the room able to answer "what happens to what I say here."

## Q2 — Sanctuary server-side source of truth. *(Ground-truthed 07-12 against the working tree.)*
The carried "six unguarded paths" holds in spirit but conflates **two defect classes**, and the ruling should address both:
- **Reaches-but-unchecked (1, the confirmed worst):** conversational keep-filing at `app/api/sovereign/app/maia/list/route.ts:1341-1373` — writes a durable member atom with `isSanctuary` in scope and used 35 lines earlier, but never consulted. A "keep this" gesture mid-Sanctuary persists a row today — and `CONVERSATIONAL_KEEP_ENABLED=true` in production (checked 07-12), so this path is **armed and live**, not hypothetical. It is the one item on this docket that arguably should not wait for the sitting: a one-line `!isSanctuary` guard at the existing check site closes it.
- **Flag-never-sent (4 — unguardable as wired):** the standalone member-gesture routes — now-what field-note, field-lab field-note, vision-studio field-note, daily anchor — receive no sanctuary signal from their clients at all. Guarding them requires wiring the flag before checking it.
- **Plus one route-cluster:** `app/api/oracle/conversation` never reads sanctuary and fires 7+ writes (spiral, facet, relational, manifestation, socratic, anamnesis, trace) — so by raw write count the total *exceeds* six. Mitigation: post-audit, that route carries ~zero live traffic; the hole is structural, not currently bleeding.
**Unblocks:** the Sanctuary invariant being structurally true, not behaviorally true. Prerequisite (with Q3) for Q1's trust copy being fully honest.

## Q3 — Meaning-writes ruling. *(Ground-truthed 07-12 against the working tree.)*
Verified: **~9 system-minted meaning-write sites across 5 files**, all in the legacy `lib/memory/*` layer, all attributing values to member-content rows the member never set — 3 clean hardcoded literals (`DevelopmentalMemory` type-keyed significance defaults 0.60–0.95; `RelationshipMemoryService` theme significance `0.5`; bardic cue potency `0.5`) plus inferred-at-write significance/element in `MemoryWriteback` and `PatternMemoryStore`. The counter-model already exists in the repo: the now-what field-note route persists *no* meaning fields ("no transcript, no categories, no elemental scores") — strip-at-write is the newest surface's native grammar. *One record note: no in-repo strip-at-write/derive-at-read spec was found; the designed fix is carried in the other lane's record — confirm its location at the sitting.*
**Unblocks:** "holds what you placed, faithfully" — the layer holds things members placed, not values the system minted.

## Q4 — Presence tiers 2–3 on the practitioner map.
Tier 1 (structure-only) is built and merges as-is. Tiers 2–3 (anonymous aliveness; who-holds-a-position) are deliberately unrendered pending this ruling.
**Unblocks:** nothing until ruled — that is the point. Ruling "not yet" is a complete answer.

## Q5 — Identity cut → program catalog staging.
Gate 1 (catalog-of-one) local-witnessed 10/10; the cut is staged on your word. Sequence: cut → Gate 1 → Gate 2 → position surface.
**Unblocks:** doors that write rows; orientation that speaks; the position surface (P7a–d acceptance live).

## Q6 — The `/now-what` landing, when the map merges.
Today `/now-what` deposits arrivals in the room, and the welcome CTA literally promises "Enter the room" — copy and door agree. If the ruling moves the landing to the map (*enter the building, not materialize in a room*), the CTA label is part of the same change.
**Exhibits (07-12): the founder's own walk — two composition wounds.** First: Kelly entered the deployed flow and found the room with no visible way out and no sense of the whole — "I don't see how we navigate." Second, subtler: the map's first card ("The door") led a signed-in member OUT to the public landing, whose CTA led back in — present, plausible, and wrong; component verification confirmed every card renders and links, and only walking it revealed one door leaves the building. The circular flow exists because the welcome page does double duty as landing *and* destination — map-as-landing dissolves that duty, which is why both wounds are this question's evidence. A synthetic walk ran below the UI and couldn't see it; component verification passed and couldn't see it; only a person standing in the room found the missing hallway. (Third witness class: API walks find voice wounds, component checks find render wounds, founder walks find *composition* wounds — Round 2's room-UI-layer ruling earns its justification here. And an upgrade for the walk-instruments review: two lanes, reading the same walk independently, produced identical repairs — founder walks don't only detect, they *specify*.) The immediate affordances shipped same evening — visible threshold door in the room, map/field cross-links on-branch; the landing ruling remains this question.
**Unblocks:** map merge + ROUTES wiring + AccessMatrix row, with the landing decided rather than defaulted.

## Q7 — Auth posture ruling + Phase 1.
Phase 0 deployed 07-11 (#588); window read opens 07-13; posture ruling and Phase 1 staging await you.

---

## Not rulings — walks and labor already cleared
- **Your signed-in walk** of `/studio/environment` through the real shell — thirty seconds, closes tier-1 verification. (Welcome-landing check already answered from the repo — walk minutes fully released.)
- **Merges:** member map + studio route, after Q0/Q4/Q6 rulings land their pieces.
- **Round 2 walks** — blind, room-UI layer: do members reach for continuity unprompted. Validation, not build.
- **Larry's walk, then his charter sitting** — the field formally becomes his.

**Critical path:** walk + Q0 sweeps (an afternoon) → **this sitting** (Q1–Q7) → legibility build → merge everything → round 2 walks → Larry's walk and charter sitting.

**Standing stamp:** the map pages and studio route are *taking shape, not live* — they appear in no Larry-facing or team-facing claim as existing capability until merged and deployed. The team register rule applies to routes as much as sentences.
