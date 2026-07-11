# DECISION MEMO — Journal Bridge Meaning-Writes (2026-07-11)

**Status**: DECISION MEMO — awaiting Kelly's ruling. Session 3's trace composes against whatever is decided here.
**Ref**: evidence read at `831a0ca24`. One page; the trace document will carry the full context.

---

## The question

The consent fix at `a61d6d1c1` governed **whether** the journal bridge writes. This memo is about **what** it writes when it does. Two write-sites in `app/api/journal/quick/list/route.ts` attach system-authored interpretation to member material at the moment of capture:

1. **Capsule bridge** — every dream entry is stamped `signals: { element: 'water', tone: 'dream' }`; every other entry `{ tone: 'reflection' }`. Elemental/affective meaning derived from the entry *type* alone, not from anything the member said. Capsules feed the oracle context layer, so the stamp can return into MAIA's prompt.
2. **Episodic bridge** — every entry receives `significance` (7 if dream, 5 otherwise) and `emotional_intensity` (0.5, constant). These drive resonance-search ranking — i.e., they weight *which memories return*.

A member writes a journal entry; the system silently records how significant it was and what it emotionally meant. Even behind the consent gate, that is the system authoring meaning below the floor. Instruments engaged: **Invariant 6** (Mirror Integrity), **Invariant 13** (Claim-Type Floor), and the sovereign-placement principle (the interpretive layer holds only what the sovereign party placed).

Note the contrast the trace itself surfaced: the field-note substrate already does this right — `spiralogic_phase` there is the member's actual workshop position, client-supplied, not inferred; content persists only through explicit member gesture. The journal bridge is the outlier, not the pattern.

## The options

**Option 1 — Strip at write, derive at read (recommended).**
Persist only provenance: member text, entry type, timestamps. Any significance/intensity/elemental reading is computed transiently when the member explicitly asks — the "Ask MAIA" pattern Ideas already models (MAIA reads an idea thread only on one-click request, never ambient).
- *For*: nothing system-authored persists; converges with an existing proven pattern instead of adding a mechanism; the ruling generalizes cleanly ("meaning is derived on request, never persisted uninvited").
- *Against*: recompute cost at read; resonance ranking loses its (currently fake — the values are constants) salience signal. Since `significance` is a two-value function of entry type, deriving it at read time from `entry_type` loses nothing.
- *Implementation*: small — drop `signals` from the capsule call (or reduce to `{ source: 'journal', entryType }` provenance), write neutral defaults or NULL for significance/intensity, adjust the resonance query to rank without them or derive from entry type at query time.

**Option 2 — Persist as provenance-labeled hypothesis.**
Keep the fields; add `authored_by: 'system'`; structurally bar authoritative surfacing (offerable, never framing).
- *For*: preserves current function untouched.
- *Against*: requires the surfacing discipline to hold everywhere these fields are read — which is precisely the class of promise the trace exists to doubt. Also dignifies constants as "hypotheses"; there is no analysis behind 0.5.

**Option 3 — Member-confirmable candidates.**
System proposes at capture; member confirms/discards; only confirmed values persist as member-authored.
- *For*: constitutionally elegant; matches the keep-gesture grammar.
- *Against*: adds interaction friction to a surface whose whole register is 2am zero-friction capture. Wrong tool for this room.

## Recommendation

**Option 1.** The current values are not even inferences — they are constants keyed on entry type. Nothing of member value is lost by not persisting them; the constitutional exposure is removed rather than managed; and the ruling lands as a convergence with Ideas' proven pattern rather than a new mechanism. If a real salience model ever earns its way in, it re-enters through the front door: a spec, a consent axis, and provenance labeling — i.e., through Option 2's discipline *as a designed feature*, not as a default stamped at capture.

## What the ruling settles downstream

- Session 3's trace reports FLAG 1/FLAG 2 as *ruled and remediated* (or *ruled and scheduled*) rather than open.
- The Codex can state the general clause: *interpretation is computed in the member's presence, on the member's request — never attached silently at capture.*
- The remediation (if Option 1) is a small commit on the same file as `a61d6d1c1`, recorded under the census delta discipline.
