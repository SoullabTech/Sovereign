# Journal as specimen two — derivation, not a contract

**Status: DERIVATION ONLY.** No design, no code, no pattern name. Step 1–2 of the
founder's sequencing (2026-09-06). Step 3 (design the gesture) does not begin
until the collision below is ruled on.

Method constraint, founder-set: *independent derivation, shared implementation
only if earned.* Independence applies to the room contract and handoff design —
**not** to MAIA's conversation engine. We do not build a second
`OracleConversation`. `MaiaPresence` is explicitly **not** the premise.

## 1. What Journal actually is

Read from `docs/design/contracts/journal-room.md` and verified against
`components/journal/room/**`.

- **Member-owned object:** a *kept entry*. `Keep this` is the member's decision
  about what becomes an entry; writing that is not kept is not an object.
- **Threshold for MAIA:** `Reflect with MAIA`, offered **only on kept writing**.
  The room's own words: *"MAIA appears only on a kept entry."*
- **What must remain visible:** the member's own words are the meaning layer
  (INHABITABLE_ARCHITECTURE visual-grammar law). MAIA's reflection renders as
  short labelled statements *beneath* the member's writing.
- **What leaving means:** `Let it go`. The reflection is transient **by design** —
  `Reflection.tsx:12`: *"nothing writes it anywhere. `Let it go` discards it;
  leaving discards it."*

## 2. The five properties against Journal's existing contract

| | Property | Journal | Note |
|---|---|---|---|
| A | member-owned object remains the subject | **COMPATIBLE** | stronger than Reflections: *"everything else in it is subordinate to that, including MAIA"* |
| B | canonical MAIA thread continues without navigation | **COLLIDES** | see §3 |
| C | MAIA enters from the object, not replacing it | **COMPATIBLE** | already implemented as `Reflect with MAIA` on kept writing |
| D | closing MAIA restores the exact prior place/state | **COMPATIBLE** | `Let it go` is already the exit gesture |
| E | exit carries no penalty / no capture pressure | **COMPATIBLE** | arguably stronger — transience means there is nothing to abandon |

Four of five hold without modification. One collides.

## 3. The collision (the actual finding)

Property B is what the Reflections sheet most embodies: a canonical, persistent
thread with a text composer, appended to rather than forked. Journal's contract
forbids exactly that, in the contract and again in the component header:

```
components/journal/room/Reflection.tsx:16-20
  short labelled statements beneath the member's own writing — never a thread.
  MUST NOT appear (contract §4 state 4): chat input · message bubbles ·
  persisted reflection history · follow-up turns.
```

Journal's MAIA is **one transient reflection**. Reflections' MAIA is **a
continuing relationship**. Grep confirms the separation is real and not merely
documented: nothing under `components/journal/room/**` or
`app/api/journal/reflect/route.ts` touches `maia/list`, `conversation/turns`, or
any canonical session identity.

This is the `if no` branch of the founder's step 5, reached at derivation time
rather than after building — which is what the independent-derivation sequencing
was for.

**What it suggests, held as a question and NOT named:** contained presence may
have two legitimate variants — *continuing conversation* and *transient
reflection* — in which case B is Reflections-specific rather than invariant, and
what survives both rooms is A · C · D · E. That is a hypothesis produced by one
comparison. It is not a pattern, and nothing is extracted on it.

## 4. Blocking dependency — an unresolved founder ruling already exists here

`journal-room.md` carries an open item directly about the component in question:

> A signed-in member sees the House's floating MAIA handle
> (`components/maia/presence/MaiaPresence.tsx`) in Journal, but the arrival
> state's specification says **MAIA presence: none**. Is the ambient handle House
> furniture that legitimately appears in every room, or does *"MAIA appears only
> on a kept entry"* require its absence here? **Left for a founder ruling.**

Specimen two cannot be designed around `MaiaPresence` while it is unruled whether
`MaiaPresence` may appear in this room at all. The ruling is upstream of the work,
not a detail inside it.

## 5. The fork — founder ruling required before step 3

1. **Journal's transience is correct and stands.** Then Journal's MAIA does not
   become a thread, property B is not tested here, and specimen two tests A/C/D/E
   only. A genuine result, and it would mean the eventual pattern is narrower than
   Reflections suggested.
2. **Journal should gain a continuing conversation.** Then this is a change to
   Journal's own contract — the forbidden list and the transience law — and must
   be ruled as such, on its own merits, never as a side effect of wanting a second
   specimen.
3. **Both, by member gesture.** Transient reflection stays the default; a distinct
   member act opens continuation. Largest surface, most consent design, and it
   would need its own derivation.

Option 2 is the one to be most careful about: adopting it *because it would make
the comparison cleaner* would be manufacturing convergence — the exact failure the
sequencing exists to prevent.
