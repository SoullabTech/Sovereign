---
name: orient
description: Establish the current epistemic situation before acting on AIN — worktree, branch, HEAD, trunk relationship, dirty state, generated-state hazards, and (optionally) validate a continuation packet against present reality. Use at the start of any session doing real work on this repo, and always when resuming from a handoff packet. Also use when a prior session's claims need checking against current state.
---

# /orient — restore contact with reality

Closed Loop 1, step one. Design: `docs/architecture/CLOSED_LOOP_1_DESIGN_AND_PROOF_2026-08-09.md`.

**`/orient` measures the present. `/continue` carries intention.** A continuation packet is a
claim set from a prior session — an *implementation-class* and *governance-class* witness. It is
**never** a measurement-class witness of what is true now. Only this command establishes that.

## Run

```bash
node scripts/builder/orient.mjs                      # orient from current reality
node scripts/builder/orient.mjs --packet <path>      # + validate a continuation packet
node scripts/builder/orient.mjs --deployed           # + re-witness production (gated; see below)
node scripts/builder/orient.mjs --json               # machine-readable
```

Read-only. Writes nothing. Exit code is always 0 — orientation is a reading, not a gate; the
escalation is in the output.

## What it establishes by measurement

Worktree path and whether it is a linked worktree · branch · HEAD SHA and commit time · upstream ·
dirty count · trunk name **with the source that named it** · ahead/behind trunk ·
generated-state hazards (artifacts whose mtime is newer than HEAD's commit — they may encode
pre-HEAD state and contaminate any instrument that consumes them).

⛔ **Never** take branch, SHA, or dirty state from the session-start `gitStatus` block. It is stale
by standing rule. This probe re-measures.

## Gated and UNKNOWN fields

- **Deployed referent** is acquired **only** with `--deployed`, and only when the task makes or
  checks a production claim. Otherwise it reports `UNKNOWN-NOT-NEEDED` — deliberately distinct from
  `UNKNOWN`.
- **Memory staleness** always reports `UNKNOWN`. Supersession in the memory corpus is prose, not
  structure, so no probe can determine that a record has been superseded. `CITE-ONLY` is mitigation,
  **not proof**. Open the topic file before relying on a hook. *(Declared limitation — falsification
  case 6. Do not report it as solved.)*

⛔⛔ **An `UNKNOWN` field may never be filled by inference from another field.** Reporting `UNKNOWN`
is a successful outcome.

## Reading a packet result

Each packet claim is classified — never promoted into a current-state fact:

| verdict | meaning |
|---|---|
| `confirmed` | measurement agrees with the claim |
| `drifted` | reality moved; the claim is stale but the packet is usable |
| `contradicted` | reality disagrees; act on the escalation |
| `not_measurable` | the competent witness was not consulted — stays UNKNOWN |
| `governance_witness` | cite-only — **open the cited path; a paraphrase is never the ruling** |

Escalation ladder: **STOP** (wrong branch or wrong worktree — ask) · **DOWNGRADE** (a `CHANGED`
path is gone — verify every claim independently) · **WARN** (HEAD moved, dirty differs, cache
hazard) · **OK**.

Two rules that override convenience:

- **`VERIFIED` never survives a SHA change.** Re-run the gate or drop the claim. Inheriting a stale
  PASS launders an unverified claim into a starting premise.
- **A packet that fails verification is downgraded to a hypothesis, never silently used** — and
  never discarded wholesale because one field drifted. The response is proportionate.

## After orienting

Report what you measured, what drifted, and what remains UNKNOWN — then proceed with the task.
Do not narrate fields that are unremarkable. Surface hazards, contradictions, and UNKNOWNs.

## Capability preservation (binding)

⛔⛔ Never read *currently unused*, *unreachable*, *disconnected*, *imperfectly governed*, or
*difficult to verify* as **unwanted capability**. Historical existence is evidence, not
authorization; current absence is evidence, not prohibition; current architecture is evidence, not
a ceiling. Where the competent witness was not consulted, capability state is `UNKNOWN` — never a
negative value.

## Proof

`node scripts/builder/__tests__/orient-proof.mjs` — 32 assertions, every expected value derived
independently from the probe (nothing about this workspace is hard-coded), including a deliberately
falsified packet whose claims must be contradicted and a truthful packet that must not escalate.
