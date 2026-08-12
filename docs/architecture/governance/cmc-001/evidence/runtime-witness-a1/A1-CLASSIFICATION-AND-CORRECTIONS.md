# A1 — Classification and Corrections

Founder classification, 2026-08-12, on the live-route controlled synthetic witness.

**Referent**: production `minisforum` · `/api/sovereign/app/maia/list` · image `sha256:7a2289024d2d…` · `GIT_COMMIT=3d1e27348` · DB `maia_consciousness`

---

## Classification

| Dimension | Verdict |
|---|---|
| **CORE continuity-to-generation** | **PASS** |
| **Provider on live CORE** | **RESOLVED** — Claude primary; Ollama appears **post-response** on this path |
| **Telemetry / health coherence** | **FAIL — CONTRADICTED** |
| **Authorized write-footprint model** | **INCOMPLETE** — must be corrected before any further controlled encounter |

---

## The headline

> **MAIA is not relationally amnesic on CORE. She is relationally under-governed and partially mis-observed.**

That is a materially better starting position than the one the static census implied, and it moves the rehabilitation entry point.

## What was proven

`🔄 [Conversation History] Included 1 exchanges in prompt` — **1 occurrence** across the container's entire lifetime, against the unconditional CORE denominator (`⚡ [CORE] Parallel fetch complete`) firing **twice**. Turn 1 no marker; Turn 2 marker. The append precedes the log inside a single guard, so it fires **iff** text entered the prompt. **Absence was readable and the signal is real.**

Provider, both turns: `🧠 Using Claude (Anthropic) as primary` → `✅ Claude (sonnet)` at lines 381→387 and 805→811. Both `🔮 Using local Ollama` lines occur **after** Claude completion (478, 902) — post-response processing, not generation. **This resolves Unit 5's Ollama-hardwire claim on the live path.**

Both turns routed CORE, including a **115-character** Turn 1 — so the `textLength > 150` heuristic is not the whole routing story.

## What was NOT proven — the ceiling held

- Injected **content** is `INFERRED`. The marker logs counts, not text.
- Whether the memory/significance rows were written **before or after** generation, or read at all: `UNRESOLVED`. **Their existence is not evidence of influence.**
- **Influence itself remains `NOT_OBSERVABLE` by design.**
- **FAST is untested** — `🧠 [FAST/MemoryDebug]` fired zero times.

> A1 proves continuity **reaches** CORE generation. It does not prove that continuity is good, relevant, properly authorized, or beneficial. **The next phase inspects standing, not recall.**

---

## COR-A · Telemetry contradicts behaviour — FAIL

Turn 2 reported `conversational:"empty"`, `continuityConfidence:"low"`, `Turns: 0 (same-session: 0, cross: 0)` — **while continuity was demonstrably entering the prompt** via a second channel (CORE `crossSessionTurns`).

**The health surface reports only the channel that failed.**

Consequence: any prior conclusion drawn from those health fields describes **one broken path, not the system**. This is the label-semantics hazard, now demonstrated live rather than inferred — and it means the next interpretive move is *not* "build more memory" but:

> **Reconcile the continuity observability model against final prompt assembly.**

## COR-B · The authorization under-described the route — an instrument failure

The A1 authority named **7** write classes. Normal `/list` operation wrote to **11 further tables**, including `conversation_turns` (the actual primary turn store), `agent_runs` (17 rows), `maia_decisions`, and `relationship_essences`.

Adjudicating count by member identity: `agent_runs` 17 · `memory_transition_records` 8 · `conversation_turns` 4 · `relationship_essences` 1 · `developmental_memories` 1 · `breakthrough_moments` 1 · **`maia_turns` 0 · `maia_sessions` 0**. The executor reported rows 173850/173851 in `maia_turns`; those key differently from the member-id filter used here, and the discrepancy is itself unresolved.

**This is a failure of the instrument, not of the witness.** The authorized class list was built from a footprint discovery that named fewer tables than the route touches. The executor flagged it under the stop condition; the two-turn encounter had already completed, so nothing further ran.

**It does not invalidate the witness.** The encounter completed, the central criterion was proven, and FKs were re-verified — still none to `members` except `auth_sessions`, so the retention reasoning holds and all rows are retained.

**Required before any further controlled encounter: a corrected runtime-write inventory** for `/list`, established empirically rather than from static discovery.

## COR-C · `conversationHistory` is client-supplied

Server-side retrieval is **gated on it being empty**. Turn 2 deliberately sent none — otherwise A1 would have tested client echo rather than memory. Any future witness must preserve that discipline, and any production client that sends history is bypassing server retrieval entirely.

---

## Where rehabilitation now begins

Not *"restore continuity into ordinary generation."* One level higher:

> **What continuity is reaching MAIA, with what authority, and how faithfully do our observability surfaces describe it?**

The open questions are about **standing**, not plumbing:

- which memories and history get **admitted** into the prompt
- whether stale or **rejected** understandings can still influence
- whether **accumulated member models outrank present perception**
- whether health/continuity telemetry describes the **actual assembly path**
- how **temporal provenance** distinguishes *known before* from *learned after*
- whether momentary **awareness attunement** has the right standing relative to accumulated scoring
- whether **field-preserving elemental perception** can remain concurrent rather than collapsing to labels or winners

## Still needed

FAST-path continuity · cross-session continuity with a distinct `sessionId` · why the MemoryBundle channel returns 0 while the CORE channel succeeds · the corrected write inventory (COR-B).

Production healthy. `RestartCount=0`. No configuration touched. **All synthetic rows retained; no cleanup authority exercised.**
