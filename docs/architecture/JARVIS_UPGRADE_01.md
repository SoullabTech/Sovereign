# JARVIS-UPGRADE-01 — External Primitive Census

**Status:** Preserved direction / architecture census. **No implementation authorization.**
**Authored:** 2026-08-27
**Canonical at authoring:** `7f8886962f3b1b4ae766dc0a401349d7ef025b0f`
**Scope:** Jarvis / Claude Code agent procedure. Does not touch MAIA runtime.

---

## Purpose

Identify mature external primitives that may strengthen Jarvis without replacing
Jarvis or weakening Soullab custody.

This is a census, not a queue. Nothing below is scheduled, and the ordering of
sections carries no priority. The operational voice programme
(`VOICE-CAPTURE-01B`) remains ahead of every item here.

---

## Evidence rule

Every external capability in this document carries exactly one label. The label
describes **how the claim was established**, not how promising it is.

| Label | Meaning |
|---|---|
| `FIRST-PARTY VERIFIED` | Read directly from the primary source (vendor docs, model card, or this repository) by a named party on a named date. |
| `THIRD-PARTY CLAIM` | Asserted by a vendor or blog post about their own product. True as a report of what they said; not independently confirmed. |
| `INFERRED FIT` | Our reasoning that a verified capability maps onto a Soullab problem. The capability may be verified while the fit is not. |
| `UNVERIFIED` | Encountered in search results only. No primary source read by either party. |

A vendor benchmark is a `THIRD-PARTY CLAIM` even when the model card stating it
has been `FIRST-PARTY VERIFIED`. The card's *existence and contents* are
verifiable; the *number's transferability to MAIA* is not.

---

## Verification ledger

Attribution is recorded on five axes. "Someone in the programme checked it" is
not the same fact as "the authoring agent reproduced it", and the ledger must
not collapse the two.

```
CLAIM
SOURCE
VERIFIER
VERIFICATION METHOD
INDEPENDENTLY REPRODUCED BY AUTHORING AGENT?
```

### Repository claims

| Claim | Label | Verifier | Method | Reproduced by authoring agent |
|---|---|---|---|---|
| `.claude/skills/field-study/SKILL.md` exists in canonical, carrying `name`/`description` frontmatter | `FIRST-PARTY VERIFIED` | Claude Code (authoring agent) · Kelly | `find` / `ls` against the canonical working tree at `7f88869`; Kelly read the file | YES — this is the agent's own first-hand read |

### External claims

| Claim | Label | Verifier | Method | Reproduced by authoring agent |
|---|---|---|---|---|
| LangGraph `interrupt()` persists graph state via checkpointer, waits indefinitely, resumes the same checkpoint by persistent `thread_id` | `FIRST-PARTY VERIFIED` | ChatGPT web retrieval (JARVIS programme session, 2026-08-27) | Retrieval against LangGraph first-party documentation | **NO** |
| LiveKit turn-detector operates on transcribed text as a semantic complement to VAD; uses recent conversational context; ships INT8 ONNX for CPU inference; 14 languages | `FIRST-PARTY VERIFIED` | ChatGPT web retrieval (JARVIS programme session, 2026-08-27) | Retrieval against the LiveKit / Hugging Face model card | **NO** |
| LiveKit turn-detector English benchmark: 99.3% TP / 87.0% TN | `THIRD-PARTY CLAIM` | ChatGPT web retrieval (JARVIS programme session, 2026-08-27) | Model card read; the number is the vendor's own benchmark | **NO** — and no MAIA transferability established |
| LiveKit turn-detector license + runtime footprint satisfy Soullab deployment vows | `UNVERIFIED` | — | — | NO |
| smolagents API surface (`final_answer_checks`, `step_callbacks`, `planning_interval`, `managed_agents`, `max_steps`) | `UNVERIFIED` | — | Search results only; no primary source read by any party | NO |
| `hf` CLI `skills` subcommand (`add`/`list`/`preview`/`update`) | `UNVERIFIED` | — | Search results only | NO |
| LiveKit `agent-skills` repository contents | `UNVERIFIED` | — | Search results only | NO |
| HF `tiny-agents` (JS/Python), MCP-centric, `AGENTS.md` support | `UNVERIFIED` | — | Search results only | NO |
| HF agent-traces-as-memory / Buckets pattern | `UNVERIFIED` | — | Search results only | NO |
| Serge (HF GitHub-native reviewer) | `UNVERIFIED` | — | Search results only | NO |

**Why the "reproduced" column is not decoration.** `curl`, `wget` and
`WebFetch` are blocked in the Claude Code execution environment, so the
authoring agent read **no** external source. Every external row above rests on
retrieval performed elsewhere in the programme and reviewed by Kelly. That is
sufficient to record the claim; it is not sufficient to describe the claim as
independently reproduced, and a later reader must be able to tell the difference
without reconstructing this conversation.

---

## Typology placement

By the six-category typology (`docs/architecture/STATE_AND_ROADMAP_2026-05-24.md` §8):

**Everything below is Cat 1 — preserved direction, held — by default.**

**One exception.** Agent Skills expansion is *eligible* for Cat 6 because the
repository already runs the same `SKILL.md` pattern. It is an extension of an
existing practice, not the adoption of a new framework, and therefore requires
no framework decision.

> **Eligibility is not execution authorization.**

---

## Cat 1 — Preserved direction (held)

### 1. Agent Skills expansion — *Cat 6 eligible*

`FIRST-PARTY VERIFIED` that the pattern is already in use.

```
EXISTING
    field-study

PRESERVED DIRECTION
    deploy-custody
    evidence-language
    pr-adjudication
    runtime-witness
    canonical-state
    test-falsification
    voice-investigation
    testflight-custody
```

The value is that a procedure is loaded **when relevant** rather than carried in
every context window. `deploy-custody` and `evidence-language` are the two whose
absence has cost the most this programme.

Risk: near zero. Changes agent procedure, not MAIA runtime.

### 1a. Hugging Face `hf` CLI skill installer

`UNVERIFIED`. Reported to provide `hf skills add / list / preview / update`,
with the `hf-cli` skill auto-generated from the installed CLI so an agent reads
the current command surface instead of guessing at it.

The generation-from-the-installed-binary property is the interesting part, and
it generalizes past Hugging Face: a skill that is *derived* from the tool it
describes cannot drift from that tool. Several of the skills listed in item 1
describe commands in this repository (`pre-deploy-gate.sh`, `deploy-lock.sh`,
`verify-colab-boundaries.ts`) and would carry the same drift risk if written by
hand.

A vendor blog reports the skill reduced average tool calls from roughly ten to
seven in their own tests. `THIRD-PARTY CLAIM`; no transferability to this
programme established, and not a reason on its own to install anything.

Grouped with item 1 rather than numbered separately because it is the same
question — how procedural knowledge is packaged — not a distinct capability.

### 2. Acceptance semantics harvested from smolagents

`UNVERIFIED` as an API. The **semantics** are what we want; the library is not.

Direction: harvest `final_answer_checks`, `step_callbacks` and
`planning_interval` as *concepts*. Do not import smolagents.

See **Final-state acceptance invariants** below — that section is the actual
finding, and it stands independently of whether the smolagents API is as
described.

### 3. Durable pause/resume for the Jarvis HOLD loop

`FIRST-PARTY VERIFIED` primitive (LangGraph `interrupt()` + checkpointer +
`thread_id`). `INFERRED FIT` to the Jarvis problem.

The Jarvis App's actual shape:

```
CHECK BUILD
    ↓ still running
HOLD
    ↓ app closes / process dies / hours pass
condition changes
    ↓
resume EXACT state
    ↓
re-read reality
    ↓
advance
```

A real upstream primitive exists for this. **That does not authorize LangGraph
adoption.** If it is ever taken up, the bounded shape is one workflow only:

```
JARVIS-DURABLE-POC
    PR checks → HOLD → persist → resume → adjudicate
    → READY_TO_MERGE → human authorization → STOP
```

### 4. Append-only agent execution traces

`UNVERIFIED` as an external pattern. `INFERRED FIT`, and strong.

```
run_id/
    events.jsonl
    request.md
    result.md
    evidence.json
    artifacts/
```

**Custody note:** member conversations do not leave Soullab infrastructure under
any circumstance. If this is ever built, it uses Soullab-controlled object
storage, and it holds *engineering execution traces only* — never member
content. The architecture is interesting; the vendor dependency is not required.

### 5. LiveKit Agent Skills + Docs MCP — engineering knowledge only

`UNVERIFIED`. Installing voice-agent expertise into Claude Code is distinct
from moving MAIA onto LiveKit Agents. Only the former is ever in scope here.

### 6. `tiny-agents` as a bounded Jarvis executor

`UNVERIFIED`. Would address `route → routed_not_executed`. If ever tried:
read-only, no writes, no deploy, no credentials beyond read scope.

### 7. Serge as a manual, read-only reviewer experiment

`UNVERIFIED`. The repository already runs Covenant Gates, Sovereignty checks and
the JARVIS Epistemic Guard. **Do not add another automatic reviewer.** Any trial
is manual-trigger, draft-only, never approving, on a single PR, scored against
our own adjudication.

### 8. Pipecat / Graphiti / replacement agent runtimes

`UNVERIFIED`. Research only. No evaluation scheduled.

---

## Voice: what this document does NOT authorize

### LiveKit semantic end-of-utterance detection

`FIRST-PARTY VERIFIED` capability. `INFERRED FIT`. **Held.**

The distinction that must not collapse:

```
semantic turn detection   ≠   duplication repair
```

They are different defects on different clocks. Semantic EOU changes
*endpointing quality*; it does nothing to a turn that was dispatched twice.

Placement:

```
BELONGS UNDER   VOICE-LATENCY / TURN-ENDPOINTING research

BLOCKED BEHIND  baseline speech→silence→commit timing
                current VOICE-CAPTURE-01B evidence collection
```

The baseline is a prerequisite, not a formality: without it there is no quantity
against which an improvement could be measured, and the vendor benchmark
(`THIRD-PARTY CLAIM`) is not a substitute for a MAIA measurement.

**Sovereignty condition, if it is ever prototyped:** the model consumes
transcript text to decide turn boundaries. Local INT8 ONNX on CPU is what keeps
that inside the vows. A hosted turn-detector is out of scope permanently —
transcript text does not leave Soullab infrastructure. Its license and runtime
footprint require their own review before any experiment begins.

---

## Final-state acceptance invariants

The most immediately valuable finding in this census. These convert corrections
that are currently made conversationally into machine-checkable acceptance.

```
1. no claim without evidence_class

2. no CLOSED where runtime witness is required,
   unless runtime_witness exists

3. if state == DEPLOYED:
       deployed_sha == authorized_sha

4. if state == HOLD:
       blockers.length > 0

5. authorization based on canonical SHA expires
   when canonical tip changes

6. last_verified_value and freshly_observed_value
   are distinct states
```

Invariants 5 and 6 were derived from failures observed during this programme,
not from external research. Every correction issued to the agent during the
2026-08-27 session was an **evidence-class violation** rather than a code error:
promoting `INFERRED` to `OBSERVED`; treating a source-defined constant as a
hypothesis; calling a case structurally unreachable when it was only
unwitnessable; asserting three surfaces shared an origin when one was
unresolved; claiming a heuristic guard would make a class of defect impossible.

These six are worth more to Jarvis right now than any model or framework in this
document.

---

## Nomenclature discipline

Two sources, two vocabularies. They must not be merged:

```
smolagents semantics          LangGraph
    final_answer_checks           durable state
    step_callbacks                checkpoint
    planning_interval             interrupt
                                  resume
```

`final_answer_checks` belongs to the smolagents item. The distinction matters
because the direction is explicitly *harvest the acceptance semantics without
importing smolagents*, while LangGraph is a candidate **dependency** under a
bounded POC. Conflating them would misrepresent one as the other.

---

## What this document does not authorize

- No skills created.
- No LangGraph dependency.
- No smolagents dependency.
- No LiveKit model downloaded.
- No change to MAIA runtime, voice pipeline, or deploy path.

The operational programme remains ahead of all of it:

```
PWA   dispatchId 1 → 2 → 3
  ↓
fresh canonical read
  ↓
TestFlight / native evidence
```

This record exists so that what was learned is preserved without letting a
promising architecture derail the defect we are one observation away from
understanding.
