# JARVIS-GOVERNED-KNOWLEDGE-FLOW-01 — lane charter

**Date opened:** 2026-09-17
**Class:** Governance flow lane. Defines the crossing law for knowledge entering AIN. Not itself an ingestion act.
**Authorization:** Founder act, 2026-09-17 — formalize the sequence already being executed by `CORPUS-AUTHORITY-01` → `CORPUS-CLASSIFICATION-EA-01` → `CORPUS-BUILD-EA-01` → `CORPUS-INGEST-EA-01` as one named, reusable governed flow.
**First witness subject:** Elemental Alchemy (Kelly Nezat), source SHA-256 `f57f17e6…`, chunk-set SHA-256 `87b0cbaa…`.

---

## 1 · Purpose

Establish the single lawful path by which any body of knowledge may become something MAIA can retrieve, represent, or speak from.

The flow exists to refuse one specific failure: **material becoming knowable because it was reachable.** Presence in a folder, a bucket, a vector store, or a prior import is not authority.

## 2 · Governing question

> By what authority may MAIA know this, in exactly which revision, and what has been *proved* about each step of its crossing — as opposed to inferred from the success of a later step?

## 3 · The flow

| Gate | Question it answers | Discharged by |
|---|---|---|
| **J0 · Subject** | What exact body of knowledge is under consideration? | A named subject bound to an exact source path |
| **J1 · Authority** | Whose material is it, and what right does MAIA have to use *this revision*? | A rights-holder authorization naming the exact source digest |
| **J2 · Admission** | Does this exact source qualify for the corpus, and what is excluded alongside it? | An admission verdict: `N admitted / M excluded / K refused`, with the candidate population counted |
| **J3 · Build witness** | What exactly will the source become? | A deterministic chunk set with a frozen chunk-set digest |
| **J4 · Ingest contract** | Can it enter production atomically, verifiably, and reversibly? | A fail-closed write path: prepare-then-transact, read-back verify, rollback on any mismatch, no truncate escape |
| **J5 · Deploy** | Is the governed mechanism in production? | Running SHA equals the authorized SHA, verified at the container |
| **J6 · Production witness** | Does production see exactly the same governed subject? | The non-writing witness, run where the act will run, reproducing J2 and J3 identically |
| **J7 · Execute ingestion** | Do the governed rows now exist? | Committed row/source/embedding counts plus the chunk-set digest |
| **J8 · Retrieval witness** | Can MAIA retrieve the intended knowledge — and only it? | Controlled queries returning subject chunks, with zero foreign sources |
| **J9 · Representation / provenance** | May MAIA use it, and can it say where it came from? | Attribution bound to source identity, and the refusal rules for what it may not do with it |
| **J10 · Adjudicate** | What was proved, what was not, and what opens next? | A closure record separating proved from unproved |

## 4 · Laws

1. **No gate is discharged by a later gate's success.** A committed ingestion is not evidence of lawful authority; a green retrieval is not evidence of lawful representation.
2. **These are five different states and are never collapsed:**
   `AUTHORIZED` ≠ `INGESTED` ≠ `RETRIEVABLE` ≠ `RETRIEVED` ≠ `APPROPRIATE TO REPRESENT`.
3. **Unresolved is excluded.** No classification from filenames, folder location, or plausibility. `735 excluded` is a standing state, not a backlog.
4. **Identity is a digest, not a name.** Authority attaches to an exact revision. A changed source is an unauthorized source until re-authorized.
5. **A refusal is not an occasion to disclose.** A refused crossing reports that it refused, not what it was refusing to hand over.
6. **Withdrawal must remain possible.** A subject that cannot be removed from the corpus was never lawfully admissible.
7. **⭐ One crossing, or none.** A pathway that can produce retrievable rows without passing J1–J4 defeats the flow entirely — not partially. The existence of a second, ungoverned ingestion route makes J1–J4 optional in practice regardless of how rigorously they were executed.
8. **The crossing executable is governed too.** Corpus digests bind what may cross; they do not by themselves bind the code that interprets and writes it. J6 and J7 must run from a clean execution tree whose adjudicated ingestion implementation hashes and governed corpus identity match the crossing record. A corpus-hash match never excuses executable drift.

## 5 · Why law 7 is load-bearing for the current run

More than one knowledge pathway exists today (AIN corpus · Living Library · wisdom architecture). Until every pathway answers to this flow, the Elemental Alchemy run proves that **a governed crossing is possible**, not that **all crossings are governed**.

Therefore: **J10 for Elemental Alchemy may not close while an alternate ungoverned ingestion route exists.** J8 and J9 may close on their own evidence; J10 additionally requires the pathway census.

⛔ This charter does not open that census and does not authorize any change to the Living Library.

## 6 · Current position — Elemental Alchemy

```
J0 ✅  J1 ✅  J2 ✅  J3 ✅*  J4 ✅*  J5 ✅  J6 ✅  J7 ✅  J8 ⛔ STOP  ·  J9  ·  J10
```

- Canonical reviewed mechanism: `78a85f652` (merge of PR #1337).
- **J5 direct production witness, 2026-09-17:** `maia-sovereign` healthy and reporting `GIT_COMMIT=78a85f652`.
- Build host (`minisforum`) direct disk witness at J5/J6 control-lane open: **137 GB free** on `/`; the earlier ~23–24 GB reading was from the wrong host and is not the production build-host state.
- **J6 production witness: PASS.** The isolated witness reproduced `736 → 1 admitted / 735 excluded / 0 refused`, source SHA-256 `f57f17e6…`, 1,238 chunks, and chunk-set SHA-256 `87b0cbaa…`; no embeddings were generated and no database connection was opened.
- J6 evidence: `docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J6_PRODUCTION_WITNESS_2026-09-17.md`.
- **J7 governed ingestion: PASS.** The final transaction committed `1,238 rows / 1 source / 1,238 embeddings`; an independent post-commit read proved contiguous chunk indexes `0–1237`, exactly 768-dimensional vectors, the single authorized source, and chunk-set SHA-256 `87b0cbaa…`.
- J7 evidence, including both fail-closed precursor attempts: `docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J7_GOVERNED_INGESTION_EVIDENCE_2026-09-17.md`.
- **J8 retrieval witness: STOP.** The governed vectors are searchable and eligible-mode retrieval returns only Elemental Alchemy, but the canonical `/api/sovereign/app/maia/list` member route does not produce or pass `ainKnowledgeContext` / `ainKnowledge`; its enabled Knowledge Gate supplies source-weighting instructions only. A secondary finding shows all rows auto-classified `domain=somatic`, causing `talk`-mode retrieval to return zero, and the frozen chunk-set digest does not bind retrieval metadata.
- J8 STOP evidence: `docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J8_RETRIEVAL_WITNESS_STOP_2026-09-17.md`.
- J9 is not open. `*` J8 exposed an attestation question affecting J3/J4 retrieval semantics; their historical evidence remains valid for the contract they proved, but a repaired crossing must reconcile what retrieval-relevant metadata is governed and frozen.
- The packaging finding is dispositioned host-side: `data/ain/source` is build-and-authority material, not runtime serving material. J6/J7 execute on `minisforum` from a clean governed worktree against production services; the 736-file source population is not shipped into the runtime image merely to prove exclusion.
- Law 8 execution bind and the live host-side evidence are recorded in `docs/programme/JARVIS-GOVERNED-KNOWLEDGE-FLOW-01_J5-J6_HOST-SIDE_DISPOSITION_2026-09-17.md`.

## 7 · Scope of this charter

⛔ Not authorized by this document: any deploy · any production read · any embedding generation · any corpus write · any change to the Living Library or the wisdom architecture · any classification of the 735 excluded files · any change to `EA_INGEST_CONTRACT`.

This charter names the flow. Each gate still requires its own act.

## 8 · Reuse

The flow is subject-agnostic. Authored work, licensed work, public-domain material, organizational material, practitioner material, and member-created material all cross by the same gates. What differs per subject is the **J1 authority basis** and the **J9 representation rights** — never the sequence, and never whether a gate may be skipped.
