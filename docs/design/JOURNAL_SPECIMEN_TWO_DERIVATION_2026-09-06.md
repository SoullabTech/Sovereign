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

---

## 6. Acceptance (step 2) — written before any design

Derived from Journal's own room, not from the Reflections sheet. A/C/D/E are
final and do not depend on the §5 ruling. B is written three ways, one per fork.

### A — the kept entry remains the subject

- With MAIA's reflection open, the member's kept entry text is present, visible
  and hit-testable without scrolling it out of view.
- MAIA's output renders **beneath** the member's words, never above and never in
  place of them (visual-grammar law: the member's own words are the meaning layer).
- No MAIA element occludes the entry.
- MAIA's reflection is not the largest element in the room.

### C — MAIA enters from the object

- `Reflect with MAIA` is reachable **only** from a kept entry. No path to it from
  arrival, from unkept writing, or from Browse.
- No reflection can be requested without an owned kept-entry id; unauthenticated
  returns 401 (already true of `/api/journal/reflect`).
- Unkept writing never reaches MAIA — keeping is the member's threshold act.
- *Depends on the §4 ruling:* whether the ambient `MaiaPresence` handle may be
  present in this room at all, and if so in which states.

### D — closing restores the exact prior place

- `Let it go` returns the member to the entry-reading state with the same entry
  and the same scroll position.
- Leaving by navigation discards identically (already law).
- `Write from here` carries MAIA's question as context **without seeding the
  member's text** — the existing behaviour, preserved.

### E — exit carries no penalty

- `Let it go` presents no confirmation, no "are you sure", no re-engagement prompt.
- No copy implies the member is losing something by letting go — transience is the
  design, and the room must not perform regret about it.
- `Write from here` must not be framed as the only way to "keep" the reflection,
  which would convert an offer into pressure.

### B — three drafts, one per §5 fork

**B1 · transience stands.** Acceptance is a *refusal* test, not a feature test:
no chat input, no message bubbles, no follow-up turns, no persisted reflection
history; `/api/journal/reflect` writes no conversation turn and no canonical
session row. Falsifiable by grep and by a production walk showing the thread count
unchanged across a reflection. Under B1, property B is **not tested by this
specimen** — and that is a result, not a gap.

**B2 · Journal gains continuation.** Acceptance mirrors Reflections: the handoff
appends to the canonical thread, mints no second identity, requires no navigation.
This is an **amendment to Journal's forbidden list and its transience law** and
must be ruled on its own merits — never as a side effect of wanting a cleaner
comparison.

**B3 · both, by member gesture.** The default path must satisfy B1 in full. A
distinct, explicit member act opens continuation and must satisfy B2. Additional
consent boundary, load-bearing: entering continuation must **not retroactively
persist** the transient reflection that preceded it. Content the member was told
would be discarded cannot become durable because they later chose to continue —
that is a consent violation wearing a convenience.


---

## 7. Founder rulings, 2026-09-06

### Ruling 1 — Journal transience stands · B1 RATIFIED

```text
Journal's MAIA reflection remains transient.
No canonical conversation thread is introduced.
No follow-up turns. No persisted reflection history.

Property B is NOT TESTED by Journal.
That is the specimen result, not a defect.
```

B2 and B3 are **not authorized** — not because they are impossible, but because
there is no Journal-native reason to amend the transience law. Introducing
continuation to make the comparison converge would invalidate the experiment.

The B3 consent boundary (§6) **remains recorded as a safeguard** against any
future reconsideration: later choosing continuation could never retroactively
persist content the member was told would disappear. It is not promoted into
current design.

### Ruling 2 — the ambient MAIA handle does not belong in Journal

Suppressed throughout `/journal`. Recorded in full in
`docs/design/contracts/journal-room.md`, which closes the deviation that room had
been carrying unresolved.

## 8. What specimen two now tests

```text
A  kept entry remains the subject               TEST
B  canonical thread continuity                  NOT TESTED
C  MAIA enters only from kept object            TEST
D  Let it go restores exact prior place/state   TEST
E  exit carries no penalty                      TEST
```

Step 3 does **not** design a contained `MaiaPresence` sheet. Journal's gesture is
already substantially determined by the room:

```text
kept entry → Reflect with MAIA → one transient reflection beneath the
member's words → Let it go → same entry, same place, no durable thread
```

The work is to test that existing path against A/C/D/E and to remove the
unauthorized ambient handle (done — see Ruling 2).

**The information specimen two has already produced:** the sheet is not the
pattern, and canonical conversational continuity is not yet demonstrated as part
of any shared invariant. No extraction. Walk Journal first, then compare two
completed specimens.


---

## 9. Walk in progress — partial observations, 2026-09-06

Live on `66da58b4c`. **Not a closed witness.** Recorded now because these two
findings are durable regardless of how the walk finishes.

### Candidate language for whatever survives both rooms

> **MAIA can be present without becoming the place.**

Founder, on seeing Journal's reflection state beside Reflections' sheet. This is
a better handle than "contained presence" for a diagnosable reason: it names a
*relationship*, not a *container*. The two specimens solved it with different
geometry — a bounded sheet in one room, a subordinate block in the other — so
any name derived from the shape was always going to be Reflections-specific.
Still not canonized; recorded as the leading candidate for the comparison.

### Observed so far

```text
A  kept entry remains the subject      STRONG — entry visually dominant, MAIA
                                       beneath and secondary, labelled
                                       statements not a thread
C  MAIA enters from the object         consistent with intent; not yet tested
                                       by attempting to reach MAIA elsewhere
D  Let it go restores prior place      NOT YET WALKED
E  exit carries no penalty             NOT YET WALKED
   no ambient House handle in /journal NOT YET CONFIRMED across states
```

The observed frame is the reflection state on a **kept** entry, which is the
harder half of the handle ruling (the "after Keep" case). No floating handle is
present in it. That is one state, not "anywhere" — the ruling is not closed by it.

### FINDING (parked, not a walk property): MAIA quoted the member inexactly

The member wrote *"…a white breasted nuthatch sitting n the middle of the
street"*. MAIA's noticing rendered it as: `right after "sitting in the street"`.
The quoted string is a compression, not a verbatim substring of the entry.

Small, but it lands on this room's load-bearing law — *the member's OWN words are
the meaning layer* (INHABITABLE_ARCHITECTURE visual-grammar law). Quotation marks
assert verbatim. A paraphrase inside quotes attributes to the member words they
did not write, in the one room whose whole premise is that their words are the
meaning. Either quote exactly or drop the quotes and describe.

Parked as its own item. It is not property A/C/D/E and must not be folded into
the walk's verdict.
