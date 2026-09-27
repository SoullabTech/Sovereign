---
room: Divination Symbolic Receiving Prototype
human_activity: bringing a saved symbolic reading beside my writing without confusing the cast, inherited symbolism, generated interpretation, and my own meaning
surfaces:
  - lib/house/symbolicSource.server.ts
  - app/api/house/symbolic-source/route.ts
  - app/dev/symbolic-crossing-review/page.tsx
change_class: prototype
principles:
  - SOULLAB_LIVING_ORIENTATION_SYSTEM — source identity survives; the destination remains its own room
  - MAIA_OATH — interpretation remains secondary and cannot author the member's destination
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — member meaning outranks system synthesis
reference_surfaces:
  - docs/design/contracts/symbolic-crossing-readiness.md
  - docs/design/contracts/divination-saved-readings.md
  - docs/design/contracts/facet-crossings.md
shared_with_house: provenance, exact return, blank receiving authorship, authenticated source resolution
distinct_to_room: this prototype makes epistemic classes visible before any durable Divination → Journal or Divination → Daily Anchor crossing exists
experience_verification: >
  2026-09-27 authenticated local witness on localhost:3597 using one temporary Runes reading explicitly marked SAFE TO DELETE.
  The typed source packet rendered SOURCE FACT (member question, cast, runes drawn), SYMBOLIC TRADITION (stored rune meanings),
  SYSTEM SYNTHESIS (Wyrd message, generated interpretation, generated guidance), and YOUR MEANING (member notes) as separate visible regions.
  Journal and Daily Anchor prototype writing fields both opened empty. The exact-return doorway reopened the saved reading at
  /oracle/reflections?reading=runes:<uuid> with its original question and cast. Read-only witness created 0 member_facet_crossings
  rows and 0 Daily Anchor rows. The temporary reading was deleted and residue verified at 0.
---

# FACET-FLOW-04 — Divination Typed Source Packet + Read-Only Receiver
## Standing

> **PROTOTYPE PASS · TYPED EPISTEMIC SEPARATION PROVEN · NO DURABLE JOURNAL/ANCHOR CROSSING AUTHORITY**

This act proves that a saved Divination reading can be resolved as a typed symbolic source rather than one blended interpretation blob.

It does not create a member-facing Divination → Journal or Divination → Daily Anchor crossing.

## Typed source law

A saved reading resolves under the authenticated member into fields carrying an explicit epistemic class:

- **source_fact** — the question actually asked and the symbols actually cast or drawn;
- **symbolic_tradition** — inherited symbolic meanings stored with the source;
- **system_synthesis** — generated interpretation, Wyrd synthesis, or guidance;
- **possible_expression** — reserved for explicitly hypothetical lived-expression language;
- **member_meaning** — notes or resonance authored by the member.

Missing classes remain absent. The runtime does not fabricate one to fill the matrix.
## Receiver law

The read-only prototype renders the symbolic source beside two possible receiving acts:

- **Journal — Write with this in view**
- **Daily Anchor — What do you want to stay connected to today?**

Both begin empty.

The symbolic source is context, never seed text.

The prototype has:

- no POST;
- no crossing ledger write;
- no memory write;
- no Journal write;
- no Daily Anchor write;
- no automatic interpretation promotion.

## Exact return

Every packet includes the saved reading's durable identity and exact return URL.

Return must reopen the original saved reading, not reconstruct it from receiving text.

## Existing Divination → Reflection authority remains unchanged

The proven Saved Reading → Reflection crossing still uses its existing source-custody resolver.

FACET-FLOW-04 does not silently substitute the new packet into that path and does not alter its persistence semantics.
## Why the typed packet is separate

The older provenance resolver intentionally produces a compact readable excerpt and may combine:

- question;
- cast;
- interpretation;
- guidance.

That is acceptable for showing where an already-created Reflection began.

It is not sufficient for a new authorship crossing, because the receiver would lose the distinction between event, tradition, interpretation, and member meaning.

The typed packet exists specifically to preserve that distinction.

## Acceptance

FACET-FLOW-04 passes when:

- authenticated source ownership is required;
- all available symbolic fields have explicit epistemic standing;
- Journal and Anchor prototype fields remain empty;
- no persistence path exists from the prototype;
- exact source return works;
- local witness leaves zero crossing/Anchor residue;
- the existing Reflection crossing is unchanged.

All conditions passed locally on 2026-09-27.

## Supersession

FACET-FLOW-04 remains the visual/epistemic prototype authority. Its Journal question was answered by FACET-FLOW-05, which locally proved the durable Journal crossing.

> **SUPERSEDED FOR JOURNAL BY FACET-FLOW-05 · NO DURABLE DIVINATION → DAILY ANCHOR**

The current adjudication lives in `divination-journal-crossing.md`.
