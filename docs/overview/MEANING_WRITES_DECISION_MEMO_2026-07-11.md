# DECISION MEMO — Journal Bridge Meaning-Writes (2026-07-11)

**Status**: RESOLVED BY REFRAME — see postscript. The interpretation-tradeoff framing below is retained for lineage; the operative analysis is the postscript's.

## Postscript (same day): the reframe that collapsed the decision

On review, these writes are not interpretation at all — **they are constants**. Every dream is water; every dream is significance 7; everything else is 5; all intensity is 0.5. No member content is read. That moves the finding out of the Mirror Invariant's genuine-tradeoff territory ("may the system author interpretation?") into the **Shadow Work species: fabricated data presented as real** — which already has a landed doctrine from the census closures: *fabricated values are removed — not consented to, not surfaced, not preserved as hypothesis.*

Disposition executed as **strip to provenance-only** ("found by trace, closed pre-composition"; readers B and C had already bound to `831a0ca24`):
- Episodic bridge no longer authors `significance`/`emotional_intensity`; the columns are NOT NULL so the uniform schema default applies — a uniform value carries no differential ranking signal. Ranking falls back to recency and member-declared markers (Keeps, breakthroughs), which are the signals that *are* member-authored.
- Capsule bridge `signals` reduced to `{ entryType }` — restating the member's own mode choice, nothing else. The hardcoded `element: 'water'` — system-invented elemental identity on a path that can return to the member as "your element," the most direct Spiralogic-specific violation the trace found — is removed.

**Held direction (correctly open)**: whether MAIA may ever *derive* salience/elemental readings from actual content. If that opens, the Ideas ask-first pattern is the presumptive shape, entering via spec + consent axis + provenance labeling.

**Doctrinal sentence for the trace**: *consent-to-bridge ≠ consent-to-interpret* — though this fix needed only the fabricated-data precedent, not that sentence.

**Two carries for the Codex from the same reader**:
1. The load-bearing negative finding: `spiralogic_phase` on field-note threads is member-supplied workshop position, NOT content inference — claim discipline proven at the exact place it's most tempting to violate.
2. New vocabulary without a constitutional home: **position vs. meaning** (system-inferred structural position in the prompt by design, vs. system-authored semantic meaning, prohibited). Belongs near the Claim-Type Floor (Invariant 13); flagged for a future sitting.

---

*Original memo below, retained for lineage:*
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
