# Now What? × MAIA — The Relationship Architecture Question

**Status:** QUESTION FOR RULING — no implementation. Prepared under Kelly's Ruling 3 (2026-07-17): isolation is preserved and governed; this document frames the *future* model. The question is not "does global MAIA enter Now What?" but:

> **Which MAIA relationship is present in a practitioner-created environment, and whose continuity governs it?**

## Current facts (verified from source, 2026-07-17)

1. **It already speaks as MAIA.** `/api/now-what/interview` prompt: *"You are MAIA, in a live encounter with someone in the What Now? room"* (+ return-encounter and propose variants), governed by the Response Grammar, Twelve Disciplines, and hard limits (no sorting/typing/modeling). One voice is already honored in *presentation*.
2. **The boundary is asymmetric, not sealed.** The room's prompt composition folds in the member's **read-only** constitutional memory addenda (atoms, developmental, cross-session recall via `roomComposition.ts`). So the member's MAIA continuity already flows *in*. Nothing flows *out*: the interview route persists nothing; evidence crosses into the field only through an explicit member gesture (field-note route → `member_field_note_events` / `member_field_note_threads` — separate tables, not the MAIA memory chain).
3. **Member-authenticated** (session cookie → 401 without), Claude-pinned register.
4. **Presence layer excluded**: `/now-what/*` is not in `GOVERNED_ROOMS`; the global handle never renders there (tested).

So the de-facto current model is already a hybrid of Kelly's options 1 and 4: *the member's MAIA voice and read-only continuity accompany the member in, but the container keeps its own records and returns nothing to general memory.*

## The four models, evaluated

| Model | What it means concretely | Serves | Risks / open costs |
|---|---|---|---|
| **1. Member's MAIA accompanies them in** | Global presence extends into Now What?; one transcript, one memory; container becomes a governed room | Strongest relational continuity; one-MAIA rule trivially satisfied | Larry's program material enters general member memory (whose IP? — the custody gap is unresolved and load-bearing); practitioner has no say over what leaves their environment; template model for future practitioner platforms collapses into "rooms of Soullab" |
| **2. Larry's practitioner posture mediated through the member's MAIA** | One relationship; the environment supplies a posture (per `MaiaPosture` contract) + program context; continuity is the member's | One voice AND practitioner authorship; matches the mentor-surface ruling's grammar ("a room may shape the conversation") | Requires the posture channel + a *program-content* consent design: what may the posture inject, what may the member's memory retain of the program, what does Larry see (today: nothing — preserve?) |
| **3. Bounded container relationship with explicit consented exchange** | Now What? keeps its own continuity (field notes, threads); crossings happen only by member gesture in BOTH directions | Closest to what is built (the field-note gesture is exactly this, inbound); container sovereignty; clean template for practitioner platforms | Two continuities to govern; the read-only inflow (fact 2) already breaches strict boundedness — would need to be either ratified or removed; risk of the member *feeling* two MAIAs even with one voice |
| **4. Full isolation** | Remove the read-only memory inflow; the room greets every member fresh | Maximal container sealing; simplest IP story | Regresses what is live (return-encounters currently draw on continuity); "it forgot me" inside the room; weakest relational truth |

## What any ruling must settle

1. **Direction of authority (Inv 16):** program-authored meaning must not be injected as if it were the member's own recognition. Model 2's posture-injection needs a boundary honoring this.
2. **IP & custody:** the Larry rights instrument does not exist yet and gates activation — any model that moves program content into general memory (1, partly 2) inherits that gap.
3. **Practitioner sight:** today Larry sees nothing of the member's conversation. Every model must state what, if anything, the practitioner may see, and by whose consent.
4. **Member's memory sovereignty:** whatever the container, what the member chooses to keep must be *theirs* to carry out (the field-note gesture is the existing grammar for this — likely the load-bearing primitive for any model).
5. **Template honesty:** whichever model is ruled becomes the default story for every future practitioner-created environment — it should be chosen as a category answer, not a Larry-specific patch.

## Observation (not a recommendation)

The built system is closest to **model 3 with a model-2 inflow**: one voice, container-owned records, member-gestured crossings, read-only continuity inward. The smallest coherent ruling may be to *name* this hybrid as the intended model and close its one inconsistency (ratify or remove the read-only inflow), rather than move to any pole.
