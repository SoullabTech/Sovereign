# WS-DISCLOSURE-ORIENTATION-TRANSPORT-01 — runtime wire witness

**Evidence-custody act.** This directory holds the instruments that produced the
lane's runtime evidence and the output they produced. It is instrument-only: no
production file imports anything here, nothing here is wired into CI, and
nothing here is a migration, a fixture promoted to product state, or a new
authorization semantic.

## Provenance of these files

`seed.mjs`, `witness.mjs` and `wire-result.json` are the **exact bytes that ran**
— copied out of the run directory unmodified, not rewritten, not tidied, not
ported to TypeScript. They are the instrument, not a reconstruction of it.

| File | Ran as | SHA-256 |
|---|---|---|
| `seed.mjs` | `witness-seed.mjs` | `2141e4dfbef29151139ed3c86b68125699563670f79bebe0c61442407dc3f47f` |
| `witness.mjs` | `witness-run.mjs` | `2078aa033ef737e1abc12a8475fd4517eade800c01dba96e35a69cc69f34fd6c` |
| `wire-result.json` | stdout of `witness-run.mjs` | `2978ba32d2cbde1cfbee121448819543e84bebf5a783c2f7e1d68cc5444c2298` |

Only the filenames changed (path placement); the contents did not. If either
script is ever edited, it stops being the instrument of record for this run and
must be relabelled a **RECONSTRUCTION / REPRODUCTION HARNESS** rather than
inheriting this run's provenance.

⚠️ `seed.mjs` is the *third* draft. Two earlier drafts died on CHECK constraints
(`member_manuscripts_provenance_check`, then
`developmental_readings_outcome_observations`) and are deliberately not kept:
they inserted no reading and produced no fixture, so they are not instruments of
anything. The bytes here are the ones that actually seeded the run.

## Subject

```
SUBJECT SHA   2902def019fca72a820b9f78afcff1f7188fab28
BASE SHA      843cf9dacd30f15df75f440f437e44e56e3562f0
```

## Environment

```
PostgreSQL    16, disposable cluster, trust auth, loopback only
migrations    424 of 480 applied
refused        56  — absent extensions / predecessors, the same known
                    reconstruction refusals the S3 lane recorded
server        Next dev, real HTTP, real route
transport     real fetch over 127.0.0.1; nothing stubbed downstream
```

## Fixture

Nine sections. The three body-requiring ones sit **2nd, 5th and 9th**, and their
ids are prefixed so that **lexical order and manuscript order disagree**: sorted
by id they read `aa, mm, zz`; in the work they sit `zz, mm, aa`. That is what
makes F1 and F2 observable on the wire rather than modelled.

```
orientation set   zz = 2 · mm = 5 · aa = 9
```

A second reading carries a required section id absent from the frozen topology
(`ghost-never-in-topology`) — the unlocatable arm.

## Arms — status, byte count, body

```
ARM 1  BODY_AUTHORITY_REQUIRED       200   768 bytes
       sections              aa · mm · zz      (authority identities, unchanged)
       sectionOrientations   zz=2 · mm=5 · aa=9 (whole-Work ordinal order)

ARM 2  BODY_SCOPE_INCOMPLETE         200   509 bytes
       sections              identical to ARM 1
       sectionOrientations   identical to ARM 1 — one derivation, two outcomes

ARM 3  unlocatable required section  500    66 bytes
       body   {"refusal":"section_orientation_unavailable","unlocatableCount":1}
       carries no section identifier, no topology, no authored character
```

Exact response bodies are in `wire-result.json`.

## ARM 3 — mutation proof

Counts taken immediately before and after the refusing request:

| table | before | after | delta |
|---|---|---|---|
| `ask_threads` | 1 | 1 | **0** |
| `ask_turns` | 1 | 1 | **0** |
| `ask_authorization_acts` | 1 | 1 | **0** |
| `ask_authorization_consumptions` | 0 | 0 | **0** |
| `context_disclosure_receipts` | 0 | 0 | **0** |

The non-zero *before* values are ARM 1 and ARM 2's own lawful records. What the
deltas establish is that the refusing request added nothing: no thread, no
author turn, no minted opportunity, no claim, no receipt.

This is the line the source-only evidence could not reach. The ordering law is
now witnessed behaviour rather than a readable property of the file.

## Cleanup

```
Next server   stopped
cluster       stopped (immediate)
data dir      removed
```

The shadow no longer exists. Re-running these instruments builds a new one; it
does not reproduce this one.

## What this witness does NOT establish

- It exercises the two orientation-bearing pause outcomes and the preflight
  refusal. It says nothing about the other four non-error 200 outcomes, which
  `lib/writersStudio/askClient.ts` still casts as ordinary success.
- It establishes no S3 or S4 authority semantics, and widens neither.
- `lib/manuscript/development/__tests__/evidenceCannotAct.test.ts` fails
  identically at the lane base and is routed out, unrepaired, unrelated.
