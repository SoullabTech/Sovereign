# WS2-07 · BUILD-07A — the two open seams

```text
LANE       JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01
UNIT       BUILD-07A · DEVELOPMENTAL EVIDENCE
STATUS     FINDINGS ONLY — no design, no authorization, no implementation
DATE       2026-09-02
```

⛔ **This document decides nothing.** It records two questions the substrate cannot
currently answer, so that neither is discovered later as a surprise and neither acquires a
convenient implementation in the meantime. Both are BUILD-07A work. Neither is Stage 8.

---

## 1 · What is proven, so the open parts are legible against it

```text
textual INV-7b      PROVEN as a mechanism, against the real custody substrate
                    22 checks, PostgreSQL 16 from an empty database
                    scripts/ws2-07-build-07a-inv7b-witness.ts
falsifier 4         PROVEN against real structure rows — 16 checks
                    scripts/ws2-07-build-07a-f4-witness.ts
falsifiers 1,2,3,5–10  passing in the pure substrate
outcomes            0 / 6 demonstrated
```

**A mechanism is not an outcome.** `resolveHistorical` proves a conditional:

```text
IF an exact frozen revision N exists
→ the evidence a reading rested on is recoverable from it
```

The two seams below are both about the antecedent.

---

## 2 · SEAM A — the exact-state capture rule

**The question.** How does a developmental read obtain an immutable revision that EXACTLY
matches the live Work it actually read?

**Why it is open.** `working_draft_revisions` rows are appended on checkpoints, not on
ordinary saves. Verified against the code rather than assumed — every writer of that table
is a create, a member-initiated checkpoint, a restore, or a blank-manuscript
initialization. A section-native autosave updates the live draft and appends nothing.

So a member who has been writing since their last checkpoint has a live draft that matches
no revision. A reading taken now would rest on a state no immutable row holds.

**⛔ Three answers that must not be reached for.**

```text
read the latest checkpoint instead   the reading would rest on prose the member has
                                     already moved past, while claiming to describe
                                     their Work — evidence for a claim never made
                                     about the current Work (INV-19, from the
                                     other direction)

copy the read prose somewhere        the second durable prose store the recoverability
                                     ruling rejected, arriving through a side door

make "Ask MAIA to read" append a     a read gesture that writes to the Work. Reading
revision as a side effect            must not mutate what it reads, and a revision the
                                     member did not ask for is a revision they did not
                                     author
```

**What would settle it.** A capture rule under which the state read IS an immutable
revision, with the member's authorship of that revision intact. Naming that rule is
BUILD-07A work and is not attempted here.

---

## 3 · SEAM B — the structural analogue of `FrozenSectionState`

**The question.** What immutable object lets us recover the exact authored structure as it
stood when a reading happened?

**Why it is open.** DECIDE ruled it directly: `structureFingerprint` detects change, but
unless the structure context is itself frozen or points at a durable immutable snapshot, a
superseded structure-dependent observation cannot show the author the structure it actually
reasoned from.

The substrate now says this out loud rather than papering over it:

```text
FrozenStructure          topologyFingerprint + per-unit fingerprints
                         → makes SUPERSESSION scoped (falsifier 8)
                         → does NOT make structure recoverable
resolveEvidence(...)     refuses structural evidence with
                         `structure_not_historically_recoverable`
```

**⛔ Per-unit digests are not a partial answer.** They make supersession precise; no number
of digests recovers a structure. Adding more granularity would look like progress on this
seam while being progress on a different one.

**What would settle it.** A durable address to an exact authored-structure snapshot,
alongside the fingerprint — the structural counterpart of what
`working_draft_revisions.section_partition` did for prose, and subject to the same
constraint: no second custody domain for the member's own declarations.

---

## 4 · The line this document exists to hold

⛔ **Do not build the reader, the Develop surface, developmental observations, or revision
machinery because the substrate has become interesting.** Everything proven so far is
mechanical and model-free, and the value of that is precisely that it decided nothing about
what MAIA may say.

Until Seam A and Seam B are answered:

```text
structural EvidenceRef   typed · guarded · NOT historically recoverable
heading EvidenceRef      HELD UNAVAILABLE — no authoritative boundary exists
                         (manuscript_draft_sections stores `text` and nothing else)
BUILD-07B–H              unauthorized
Stage 8                  untouched
```
