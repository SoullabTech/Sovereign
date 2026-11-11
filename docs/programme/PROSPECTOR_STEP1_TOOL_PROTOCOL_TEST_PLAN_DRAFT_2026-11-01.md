# Prospector step 1 — does the tool protocol help existing local models? (TEST PLAN, DRAFT, 2026-11-01)

**Status:** PROPOSED. Not authorized to execute. Companion to `PROSPECTOR_READONLY_INTAKE_NOTE_DRAFT_2026-11-01.md`.
**Question (single):** Over a small public knowledge graph, does letting an already-installed local model call `find` / `expand` / `connect` answer checked questions better than plain retrieval? If yes, Prospector's weights and any training are unnecessary for this purpose.
**Hypothesis it can fail:** the tool protocol adds nothing for 7B–32B local models, in which case Prospector's trained adapters are the only route and step 2 becomes the live question.

## Machine facts (read 2026-11-01)

- Mac Studio, 48 GB RAM.
- **Data volume 97% full, 16 GB free.** Step 1 needs well under 1 GB. **Step 2 (≈27 GB) does not fit** until storage is relieved (see `docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md`; internal free space acts as a memory metric on this machine).
- Installed Ollama models usable as subjects: `gpt-oss:20b`, `qwen3:32b`, `llama3.1:8b`, `qwen2.5:7b`, `deepseek-r1:8b`. Embedding model for the retrieval arm: `nomic-embed-text`. No download needed.

## Design

| Piece | Choice | Note |
|---|---|---|
| Corpus | ≤ ~30 public documents about Elemental Alchemy-adjacent and consciousness-research sources, chosen by the founder | ⛔ No member content, Works, sessions, Sanctuary, or unpublished Soullab canon. Public text only. |
| Graph | Entities and typed edges, each edge carrying the source doc id and the verbatim sentence it came from | Built once, frozen, hashed. Extraction method (manual or model-assisted) recorded. |
| Arm A | Closed book | Control. |
| Arm B | Plain retrieval: top-k chunks by `nomic-embed-text` | The baseline we already could build. |
| Arm C | Tool traversal: the same model calls `find`/`expand`/`connect` (tool descriptions copied from the Prospector README, Apache-2.0) | Turn cap fixed in advance. |
| Subjects | `qwen2.5:7b`, `llama3.1:8b`, `gpt-oss:20b`, `qwen3:32b` | Same prompts per model across arms. |
| Questions | 30–40, written **before** any run, in three tiers: single fact, 2-hop, 3+-hop. Each with a gold answer and gold source sentence | Written and checked by a human; a held-out 10 never used while tuning prompts. |

## Scoring (fixed now)

1. **Answer correct** against gold.
2. **Citation valid**: every cited edge was returned by a tool (Arm C) or every cited chunk was retrieved (Arm B).
3. **Citation faithful**: a human checks that the cited source sentence actually supports the claim. This is the check Prospector's own gate does not make.
4. Also record tool calls per question, wall time, peak memory.

Report per tier and per model. Seeds: 3 runs each; report spread. A difference smaller than the spread is reported as no difference.

## Pre-declared outcomes (so the result cannot be reinterpreted)

- **C beats B by more than the spread on 2-hop and 3+-hop, with faithful citations** → tool protocol helps; recommend step 2 only if a gap remains between small models and `qwen3:32b`/`gpt-oss:20b`.
- **C ≈ B** → protocol adds nothing at this scale; hold Prospector, no training.
- **C beats B on correctness but citations unfaithful** → report as an evidence-provenance finding, not a win.
- **Small models cannot follow the tool protocol at all** → that is evidence *for* trained adapters; record it and stop; do not conclude Prospector helps.

## Containment

- Local models only; no API provider, no repository text or canon to any outside service (2026-09-20 interim hold untouched).
- Work in a scratch directory outside the MAIA checkout; no `lib/`, `app/`, `database/` changes; nothing wired to MAIA.
- Graph and questions are public-source artifacts; the run records no member data because none is read.

## Not authorized by this plan

Downloading Prospector or any weights · installing packages · training · using non-public text · any MAIA/AIN integration · deployment.

## Owed from the founder before execution

1. Approve executing this plan, and the public document list (≤ ~30).
2. Who writes and checks the 30–40 questions (they must not be authored by the system being tested).
3. Which owner record this is filed under (project ID unresolved in this session).
