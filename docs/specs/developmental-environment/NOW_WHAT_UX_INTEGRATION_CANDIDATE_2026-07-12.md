# Now What? — UX Integration (CANDIDATE)
**2026-07-12 · Cat 1 / walk-before-build · prompted by the founder's walk: "we need to integrate and rethink the UI/UX completely"**

## The diagnosis in one sentence
Every surface was built well *alone*; no one built the **hallways** — the member experiences a set of disconnected rooms, not one environment, because the surfaces were composed by accretion (room 07-06, field 07-09, welcome 07-10, map 07-12) and each lane verified its own component, never the walk between them.

## The organizing decision: one building, one register
Everything a member touches is a **place in a single geography**, reached by walking, never by menu:

```
outside                    inside (signed in)
────────                   ─────────────────────────────────────
/now-what/welcome    →     /now-what (map — the hallway)
(shareable face;           ├─ Session room   (the primary act)
 not a room)               ├─ Your field     (what you kept)
                           └─ [gated rooms]  (position, themes, …)
```

**Five invariants that make it feel like one place:**
1. **The map is the ground.** `/now-what` lands on the map (Q6 — ruling pending). Every room carries one quiet, *visible* threshold door back to it. No member surface is ever a dead end. *(Threshold door shipped 07-12; visibility fixed same evening.)*
2. **One name, everywhere** — *Now What?* (ratified 07-12). One typographic voice: the room's serif display + tracked-caps kicker becomes the family signature across map, field, and welcome.
3. **Outside stays outside.** The welcome page is the shareable face — it does not appear as a room on the member map. → resolves the "The door" card: **drop it from OPEN_ROOMS** (decision pending Kelly; recommended). Two honest doors (Session room · Your field) until gated rooms open.
4. **One primary gesture per surface.** Map: Session room card carries "begin here" weight. Room: the conversation. Field: reading what you kept. Nothing competes with the primary gesture; secondary affordances stay quiet.
5. **Atmosphere is clearance.** Member surfaces share one palette family; the practitioner studio keeps its distinct dark-studio atmosphere. A member never sees the practitioner register (the `viewer` prop already enforces this — keep it structural).

## What this rethink is NOT
- Not a nav bar, breadcrumbs, or app chrome — wayfinding stays doorway-grammar.
- Not new capability — no room opens that isn't already open; gated rooms stay gated (position → #595 deploy; trust copy → Q1 legibility act; keep-nudge-on-exit → Known Holding territory, sitting-gated; the threshold door stays a hallway, not a shelf).
- Not a practitioner-side change — Larry's studio map already mirrors the geography at structure-only clearance.

## Build sequence (each step walkable alone)
1. ~~Threshold door visible in room~~ — DONE 07-12.
2. ~~Drop "The door" card; primary weight on Session room~~ — **RULED ("drop it, both changes together") and DONE 07-12.** Slot reserved in-code for real program doors at Gate 1 (the door a member arrived through IS their arc context — never re-wire to the public landing).
3. ~~Unify member palette~~ — DONE 07-12: navy field atmosphere across map ↔ room ↔ field (walk-corrected in-lane).
4. Q6 ruling → `/now-what` lands on map; welcome CTA relabels "See the rooms".
5. Merge + deploy; **founder walks the whole loop before any member does** (the 07-12 walk proved this witness class is the only one that sees composition).

## Open decisions (owner: Kelly / sitting)
| # | Decision | Status |
|---|----------|--------|
| 1 | "The door" card | **RULED 07-12: dropped** — impostor; slot reserved for program doors (Gate 1) |
| 2 | Q6 landing: map vs room | Open — recommendation: map. Exhibits: founder trapped in room (dead end) + circular door (welcome as landing *and* destination) |
| 3 | Member palette | **Resolved 07-12: navy field** everywhere on the member side (walk-corrected) |

## Standing test for any future card (from the arc ruling)
Card copy speaks in *arc language* — it answers a first question a walker actually carries ("keep what mattered", "where am I in this?", "who can see this?", "return without guilt"). Per-arc foregrounding of the map is deliberately NOT designed from assumption — it waits on doors-as-arc-context (catalog Gate 1) + round-2 §G per-persona evidence.
