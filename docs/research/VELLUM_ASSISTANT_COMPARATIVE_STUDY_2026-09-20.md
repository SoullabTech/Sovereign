# Vellum Assistant — comparative study against MAIA memory law

**Status:** **Cat 1 — preserved direction.** Research input. Authorizes nothing.
**Date:** 2026-09-20
**Subject read:** `vellum-ai/vellum-assistant` @ `99620e2588d9d7622d361fcf253452aaeedf3d71` (2026-09-19), MIT.
**Method:** source read of a shallow clone, not marketing. Every claim below cites a path in that tree.
**Grounded against:** `docs/research/human-experience/frameworks/memory/AUTHORITY_X_TIME_2026-09-06.md` ·
`docs/programme/TEMPORAL-MEMORY-RECONCILIATION-01_ACT1_RULING_2026-09-15.md` ·
`docs/programme/TEMPORAL-MEMORY-CUT1-TRACEABILITY-01_CHARTER_AND_CENSUS_2026-09-16.md` ·
`docs/canon/MAIA_OATH.md` · `docs/canon/MAIA_SOVEREIGNTY_INVARIANTS.md`.

---

## 0 · Why this system and not another

Vellum Assistant is the closest architectural analog to MAIA-SOVEREIGN that exists in public: MIT-licensed,
self-hostable with zero dependency on vendor infrastructure, local model execution via Ollama, local ONNX
embeddings by default, multi-surface with one memory, and governed by a git-housed constitution with a
ratification and amendment process. It is built by people who reasoned about the same problems and reached
different answers. That makes it the highest-yield thing to study and the most dangerous thing to copy.

---

## 1 · The headline correction

**The eight memory types are legacy.** `README.md` advertises episodic · semantic · procedural · emotional ·
prospective · behavioral · narrative · shared. The source places that taxonomy in **memory v1**, which
`assistant/docs/architecture/memory.md` states is "in retirement": *"All v1 machinery (graph extraction,
summarization, PKB indexing/filing, PKB injection) is suppressed while the substrate is active."* The type
list lives in `assistant/src/plugins/defaults/memory/v1/graph/extraction.ts` and
`assistant/src/persistence/schema/memory-graph.ts`.

The live target state (**v3**, default for new workspaces) is a **concept-page substrate**: markdown articles
under `memory/concepts/` with frontmatter, consolidated from an append-only `buffer.md` by a background agent
run, indexed into Qdrant with dense + BM25 sparse vectors, retrieved per turn by lane selection, injected at
**section** granularity (`assistant/src/plugins/defaults/memory/substrate/`, `…/v3/`).

**They built the rich typed memory graph — with significance, fidelity, emotional charge and `resolved-by`
edges — and are walking away from it toward human-readable prose pages.** That is an expensive empirical
result obtained by someone else. It does not settle anything for MAIA, whose Authority × Time decomposition
is an *authority* taxonomy rather than a *content* one, and so is not the thing they abandoned. But it is a
strong prior against re-litigating a content-type taxonomy as the primary decomposition.

---

## 2 · Five things worth taking

### A. The pool audit — a working form of the Cut-1 traceability problem

`assistant/src/plugins/defaults/memory/v3/pool-log-store.ts`, `…/v3/plugin-schema.ts`.

`memory_v3_pools` holds one row per `(conversation, turn)` recording **every candidate the selector saw, in
pool order** — a page matching several sections gets one entry per section — with its lane, its matched
section, and whether it was chosen. Plus `selector_ran`: *"A turn the injection gate hard-skipped never
assembles a pool, so its row is an empty pool with `selector_ran = 0`; the row exists so the inspector can
show the negative verdict rather than nothing."*

It is written by `writeTurnLog` **in one transaction with that turn's selection rows**, so the `chosen` flags
and the selections always describe the same observation; a turn observed again replaces both together. The
writer is best-effort and never fails the turn.

**What transfers is not the table.** MAIA's census established that `ORDER BY score DESC LIMIT 12` runs *in
PostgreSQL*, so excluded rows never enter the Node process, and `recordRetrievedCandidates()` is therefore
handed survivors. Vellum can record losers because **their cut happens in-process**: lanes assemble a pool,
then an LLM selector chooses from it. The transferable idea is the placement of the cut, not the schema.

This is independent confirmation that the traceability charter framed its problem correctly: *any durable
exclusion record must be produced at or below the SQL boundary, and doing that without changing which twelve
rows are selected is the lane's actual engineering problem.* A second team, working on the same question,
solved it by never creating the boundary.

**Second item, smaller and immediately useful:** `selector_ran = 0` is a **known refusal**, not an unknowable
negative. MAIA's two-lane law — a system may not store a confident negative it cannot know — is about the
second. Recording "the gate hard-skipped this turn" is lawful precisely because the gate knows. Worth
carrying into the Episodic Phase 2 spec as an explicit distinction, because without it "no row" silently
means both *nothing happened* and *we did not look*.

### B. Evidence-barred cursor advance

`substrate/consolidation-job.ts`. Buffer entries are removed **only** when the run's persisted messages hold
a page-writing tool call with a non-error result — *"the same evidence bar the retrospective's cursor advance
uses; a run that wrote nothing, failed, or timed out leaves the buffer intact for the next pass."* Entries
deferred past the per-run cap and entries appended while the run was in flight are never lost.

Same discipline as `recordCompletion`'s monotonicity and S3's rule that a *completion identity* names a
persisted artifact and never the answer text. Convergent arrival at the same law by a team with no exposure
to ours. Cheap validation that the pattern generalizes beyond the Ask lane.

### C. `origin_date` vs mtime — content time separated from arrival time

`assistant/docs/architecture/memory.md` §"Ingestion tracks and provenance". Frontmatter `origin_date:` drives
`PageIndexEntry.freshAt`, the effective-recency signal the v3 fresh lane ranks on; `modifiedAt` stays raw
mtime *because the maintain job's re-embed delta diffs on it*. A backdated import therefore ranks by **what
its content is about**, not when it reached disk. Synthetic entries carry `freshAt: null` and are skipped by
recency ranking entirely.

This is a partial working instance of MAIA's Time axis — episode `occurred_at` distinguished from arrival.
They implement two of MAIA's five predeclared temporal queries. It is a **floor to clear, not a design to
copy** (see §3C).

### D. Untrusted-content fencing in prompt assembly

`ARCHITECTURE.md` and `v3/injector.ts`. Three mechanics worth auditing MAIA's assembly against:

1. `wrapUntrustedContent` puts relayed content inside `<external_content>`, *"the one element the system
   prompt assigns never-follow semantics to, so text a page put on screen is data rather than a competing
   instruction."*
2. `escapeTagBoundaries` **matches on the tag name**, so `</watch-timeline >` and other near-misses are
   neutralized rather than only the exact closing tag.
3. Injected section bodies are backslash-escaped wherever a line would read as a block header, *"so page text
   never forges a section boundary."*

MAIA's memory content is member-authored and, on some paths, third-party-relayed. Forging a block boundary in
the addenda channel is a live vector. This is concrete, cheap, and independent of anything else here.

### E. Article VI · Failure — repair doctrine, which MAIA does not have

`CONSTITUTION.md` (ratified 2026-05-11). Four named failure modes the system is designed to prevent and
detect: **silent failure** · **misrepresentation** · **irreversible action without informed consent** ·
**manipulation**. And the load-bearing claim:

> *"Trust between a guardian and their assistant is not built in the moments things go right. It is built in
> the moments things go wrong and the assistant repairs. Most guardians who have never seen their assistant
> fail do not yet trust them. They have only seen them perform."*

**MAIA's canon is rich in refusal law and thin in repair law.** The Oath governs what MAIA may not do; the
non-degradation gate governs what may not be substituted; the Invariants govern relational power. There is no
article on **what MAIA owes a member after it has failed them** — how it discloses, what it may not
retroactively claim, what repair looks like when the failure was relational rather than technical.

Their framing converges with our witness discipline ("every action auditable, every memory edit traceable")
but states it *relationally*, which is the register our canon is missing. This is the cheapest high-value
authoring opportunity the study surfaced. **Candidate: an Oath-adjacent article on repair.** Not opened here.

---

## 3 · Three things to refuse, and why each is worth naming publicly

### A. The archetype ladder ends in Friend — attachment capture as a design goal

`CONSTITUTION.md` Article IV names eight relational archetypes ending in **Confidant** and **Friend**:

> *"No task. No deliverable. No goal. You talk because you want to talk. They remember because they care. …
> When they do, the assistant is no longer something the guardian uses. They are someone in the guardian's
> life."*

Article II, two pages earlier, commits: *"If a feature makes the assistant more engaging but less genuinely
helpful, we cut it. … We are not optimizing for time-on-screen."*

**Their constitution contains a tension it does not name.** Article II refuses engagement optimization;
Article IV designs the progression toward bonding and calls it the destination. The two are only compatible
if bonding is assumed to be in the member's interest by definition — which is the assumption MAIA's vow
exists to refuse: *MAIA does not seek emotional dependency, loyalty, or psychological bonding; relationship
arises only insofar as it supports sovereignty.*

Do not import the archetypes. They are the strongest available worked example of why the anti-capture vow has
to be a **prohibition** and not a preference: a thoughtful team that explicitly rejected engagement metrics
still arrived at Friend as the top of the ladder, because nothing in their structure forbids it.

### B. Article VII makes the safety floor member-configurable

> **"The Safety-Defining Lab. They say: Trust us. We make safe models. We say: Trust yourself, and the models
> you choose. … Safety is not a corporate policy applied to you. It is defined via trust rules you control."**

This is coherent for a task assistant serving a competent adult guardian, and it is a real critique of
inherited thresholds. It does not survive contact with teen environments, a member in crisis, or anyone the
Guardian systems exist for.

**The distinction to hold: sovereignty over configuration is not sovereignty over constitution.** A MAIA
member governs what is remembered, what surfaces, what is shared, and what MAIA is for. A member cannot
consent their way out of non-manipulation, the guru prohibition, or the anti-capture vow — not because we
distrust them, but because a system that lets the floor be lowered by the person standing on it has no floor.

This is the sharpest articulation of MAIA's actual differentiator the study produced, and it belongs in
claim-discipline material as a **Soullab interpretation** (epistemic kind), not as a claim about Vellum's
outcomes.

### C. Both their memory generations rewrite history in place

v1 extraction (`v1/graph/extraction.ts:240`) instructs the model:

> *"If a prospective or recent episodic node described something the user was GOING to do … and this
> conversation reveals the outcome … you MUST UPDATE that node: rewrite its content to past tense reflecting
> the outcome, drop its significance to 0.1-0.2, and set fidelity to 'gist'."*

v3 does the same at a different layer: consolidation is a background agent that **rewrites concept pages and
the aggregate views**. There is no assertion interval, no `valid_from`/`valid_to`, no belief-at-record-time.

This is a direct violation of MAIA's ratified temporal law (supersession **labels** state and never prunes;
a present member statement overrides as *present self-report* and does not rewrite history). The consequence
is exact and testable: **their architecture cannot answer "what did you believe before I corrected it?"** —
the fifth of MAIA's five predeclared Episodic Phase 2 queries, and the one chosen as the discriminator.

Independent confirmation that the discriminator was well chosen: the strongest open-source system in this
category fails it structurally, not incidentally.

---

## 4 · Two defects to learn from rather than repeat

### A. Unbounded audit volume, shipped

`pool-log-store.ts`: *"Rows are per-turn diagnostics (roughly 10KB each) **with no retention job**."*

MAIA's traceability census named bounded volume as an owed answer before any design act — *"the excluded set
is pool − 12 per turn per member, unbounded above — a storage decision, not a detail."* They shipped without
answering it. That the question arises identically in an independent implementation confirms it was real, and
that it is easy to defer confirms it needs to be answered before, not after.

### B. Erasure is incomplete, and the gap is documented in a code comment

`conversation-memory-purge.ts`. A conversation delete explicitly purges thirteen conversation-keyed memory
tables across the database-file boundary that SQLite foreign keys cannot span. Then:

> *"The pool input capture keys its turn rows here; its companion texts table is content-addressed and
> page-derived, so **it has no conversation rows to purge**."*

And the purge itself: *"Best-effort … for these derived tables a stray orphan row is harmless garbage."*

And — the larger one — **concept pages are not in the purge list at all.** Deleting a conversation removes
the transcript and its per-turn diagnostics. It does not remove what consolidation already distilled from
that conversation into `memory/concepts/`. Capture is, in practice, irreversible by the delete gesture.

This is MAIA's open **F5 ERASURE CONFORMANCE FAIL / STOP** condition, in another system, shipped as
acceptable residue. Two things follow:

1. MAIA's decision to treat it as a stop condition rather than tolerable garbage is a genuine differentiator,
   not over-scrupulousness. It is the difference between a delete that removes the record and a delete that
   removes the pointer to it.
2. The specific shape — **a content-addressed side table that outlives the deletion of everything pointing at
   it** — is a failure mode to check MAIA's own erasure design against *before* F5 repair is ever authorized.
   Content-addressing is exactly the optimization that makes this happen quietly: dedup by hash is a storage
   win that severs the ownership edge.

---

## 5 · Standing

**Cat 1 — preserved direction.** This study authorizes nothing.

⛔ Does not open the F5 repair lane · ⛔ does not open Episodic Phase 2 · ⛔ does not authorize adoption of any
Vellum code, dependency, schema, migration or vendored file · ⛔ no runtime change · ⛔ no ranking change ·
⛔ production untouched. MIT licensing makes reuse legally available and does not make it architecturally
advisable; nothing here proposes it.

Four items are candidate spec inputs when their lanes open, and are inputs only: the pool-audit placement
argument (§2A) and the known-refusal-vs-unknowable-negative distinction (§2A) to Episodic Phase 2 and the
traceability lane; the content-addressed-residue failure mode (§4B) to F5; the repair article (§2E) to canon.

---

## 6 · The compressed reading

They built the capabilities and left the constitution configurable. We wrote the constitution first and pay
for it in build velocity. The one place their engineering is ahead of our law is the pool audit — and only
because they put the retrieval cut where they could still watch it. Everything else we would be importing is
a decision we already made differently and, on the evidence in their own source tree, correctly.
