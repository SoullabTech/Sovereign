# Builder OS — Consolidation & Falsification (Step 3)

**Date**: 2026-08-09 · **Mode**: READ-ONLY. No design, no implementation, no repair, no new
architecture surface. **Nothing was fixed.**

**Inputs reconciled**
- [`docs/ops/CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md`](../../ops/CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md) — read in full
- [`docs/ops/AIN_HANDOFF_RECORD_CONTRACT.md`](../../ops/AIN_HANDOFF_RECORD_CONTRACT.md) — read in full
- [`BUILDER_OS_MEMORY_MECHANISM_MAP_2026-08-09.md`](./BUILDER_OS_MEMORY_MECHANISM_MAP_2026-08-09.md)

**Purpose**: consolidation and falsification. Three questions (A routing integrity · B supersession
integrity · C witness order), then stop.

---

## 0. The headline of this step

> **The instrument that detects the dominant memory defect already exists, already classifies that
> exact defect by name, and has never been run.**

`scripts/memory/audit-memory.py` (`npm run memory:audit`) declares these finding classes:

```python
ERROR_CLASSES = {"broken_index_links", "broken_subindex_links", "duplicate_ids",
                 "ambiguous_wikilinks", "index_over_hard_ceiling",
                 "parked_new", "parked_modified"}
WARN_CLASSES  = {"parked_inherited", "baseline_stale", "closed_plain",
                 "index_over_target", "overlong_index_lines", "large_topic_files",
                 "unresolved_wikilinks", "wikilink_md_suffix", "prefix_omitted_wikilinks",
                 "missing_frontmatter", "missing_description"}
```

`unresolved_wikilinks` **is** the 1,075-reference defect measured in Step 2. `prefix_omitted_wikilinks`
is its named sibling. `closed_plain` is a lifecycle check on index entries. The instrument binds its
findings to `index_sha256` + `corpus_manifest_sha256`, reports only, and never mutates the corpus.

This reframes the whole step. Step 2 said *"the instrument for the dominant defect exists and its
findings have not been acted on."* Step 3 establishes something sharper: **the finding taxonomy was
authored before the defect was measured, and the measurement was then done by hand, twice, without
running it.** The gap is not analysis. It is **invocation**.

---

## 1. Reconciliation — what the two `docs/ops/` documents already settle

| Step 2 finding / Builder OS assumption | Status after reading CCA + Handoff Contract |
|---|---|
| "Zero AIN-authored hooks; context-mode intercepts Bash/Read/Grep/WebFetch" | **REFINED, and it matters.** CCA §1 measured the hooks: PreToolUse/Bash = *hard interception*; PreToolUse/**Read = matcher registered but `pretooluse.mjs` contains no Read policy**. The Read hook is a **stub**. My Step 2 statement "the boundary is already instrumented" is **half true** — instrumented for Bash and WebFetch, **not** for Read. |
| Step 1 gap #2 (tool-boundary hooks) is "a content gap, not infrastructure" | **CONFIRMED and given a causal law**: *"The tool with a hook is 12× cleaner per call than the tool with a paragraph."* Bash: 258 tok/call under interception. Read: 3,169 tok/call under prose with a carve-out. **"Enforcement works, instruction does not."** |
| `CLAUDE.md` split for context savings | **FALSIFIED — and CCA independently reaches the same conclusion**: *"the knowledge kernel is not [the operational variable]."* Two documents, two methods, same result. |
| Step 1/2 gap: `/continue` missing | **SOLVED ON PAPER.** `AIN_HANDOFF_RECORD_CONTRACT.md` is a complete contract: schema, field rules, `/ain-resume` verification table, worked example. Status: *"proposal. Not installed as a skill. No harness change."* |
| Step 2 I1: `.ain/current-state.md` risks becoming a stale fourth truth surface | **ALREADY SOLVED BY THE CONTRACT, better than my framing.** The contract's `/ain-resume` table **verifies before trusting**: branch, `head_sha`, `dirty`, CHANGED paths exist, VERIFIED gates re-runnable, `production_sha` vs live `GIT_COMMIT`. Its governing rule — *"A record that fails verification is downgraded to a hypothesis, never silently used… inheriting a stale PASS launders an unverified claim into a starting premise"* — **is the exact control `.ain/current-state.md` would need.** Builder OS does not need to invent it. |
| Step 2 I7: instrument register (L10) is the highest-leverage gap | **CONFIRMED, and the contract half-implements it**: the `VERIFIED` field requires naming the gate, how it was run, and when — plus *"do not inherit PASS across a SHA change."* That is instrument memory as a schema field. What is still missing is the **register** (which instruments exist), not the discipline for citing one. |
| Subagents as a Builder OS pattern | **MEASURED, and stronger than assumed.** Subagent starting context 22,841 vs main 72,434; returns to parent p50 **279 tok**, max **4,010** across 451 calls. CCA's caveat is load-bearing: *"the bound is a property of how they were prompted, not a guarantee the harness enforces."* |
| Model routing / local tier | **REFRAMED.** Lane B infrastructure is **complete and working** (`~/bin/maia-code` → `ANTHROPIC_BASE_URL=localhost:11434`, `maia-coder`, `CLAUDE_CODE_SUBAGENT_MODEL=deepseek-r1:8b`; Ollama live). *"Nothing needs building for Lane B."* The open question is whether a small model returns **compact-and-correct** or **compact-and-silently-incomplete** evidence. |
| Step 2's `ctx_execute` framing | **CORRECTED BY MEASUREMENT.** ~40% of tool-result flood is **images** (iOS `control` 21.2%, browser `computer` 14.2%, screenshots 4.5%) which `ctx_execute` structurally cannot compress. `ctx_execute_file` has **108 calls against Read's 4,681**. |

### 1.1 Conflicts between the documents — one, and it is real

**`docs/handoff/` vs `docs/handoff*` naming.** The contract writes records to
`docs/handoff/<branch>_<date>_<slug>.md`. That directory **does not exist**; `docs/handoffs/`
(plural) is referenced by the Step 1 inventory. A trivial detail that becomes a referential-integrity
defect of exactly the class §2 is about — **filed, not fixed.**

**No architectural conflict was found.** The two `docs/ops/` documents and the memory map are
consistent; they were produced by different investigations and converge. That convergence is itself
evidence the diagnosis is stable.

### 1.2 What is genuinely *not* covered by either document

Both `docs/ops/` documents are about **context economics** — tokens per session, per request, per
tool. Neither addresses **memory integrity**: naming, cross-links, canonical identity, supersession,
or witness order. Those are the Step 2 findings, and they remain unowned by any existing architecture
document. **The two investigations are complementary, not overlapping.**

---

## A. Memory routing integrity

### A.1 Does the existing architecture specify any of it?

| mechanism | specified anywhere? |
|---|---|
| how memory files are named | ⚠️ **partially — in the assistant system prompt**, not in any repo document |
| how cross-links are generated | ⚠️ same — `[[name]]` where `name` is the target's `name:` slug |
| how canonical identity is assigned | ❌ **no rule.** `name:` is the declared identity; the filename is the actual one; nothing reconciles them |
| how links survive renames | ❌ **nothing.** A rename silently breaks every inbound `[[link]]` |
| how broken references are detected | ✅ **`audit-memory.py`** — `unresolved_wikilinks` (WARN), `ambiguous_wikilinks` (ERROR), `prefix_omitted_wikilinks` (WARN) |
| how references are repaired | ❌ **nothing**, by ruling: *"No automated compaction yet… must only ever propose a reviewable patch — never apply one"* (2026-07-28) |

**Detection is built. Identity, generation, rename-survival and repair are unspecified.**

### A.2 Why the references are broken — the exact causal chain

The memory protocol (assistant system prompt) states two things:

1. frontmatter `name: <short-kebab-case-slug>`
2. *"link to related memories with `[[name]]`, where `name` is the other memory's `name:` slug"*

Files are **stored** as `<prefix>_<snake_case>.md`. So a session that follows the protocol **exactly**
emits `[[project-system-census-codex]]` pointing at a file stored as
`project_system_census_codex.md`. **The link is correct by the protocol and unresolvable on the
filesystem.**

Measured across 1,428 files:

| | resolving | broken | broken rate |
|---|---|---|---|
| **`[[wikilink]]`** (body / associative network) | 4,290 | **1,075** | **20.0%** |
| **`[text](file.md)`** (indexes / routing layer) | 1,277 | **13** | **1.0%** |

Of the 1,075 broken wikilinks:
- **839** resolve under hyphen→underscore normalization
- **611** resolve by looking up another file's `name:` field
- the remainder are genuinely absent targets

And the `name:` field itself has no single convention across 1,417 files:

| `name:` form | count |
|---|---|
| contains hyphens | 556 |
| contains underscores | 656 |
| **≠ filename stem** | **760 (53.6%)** |
| == filename stem | 657 |

…including free-text titles that are not slugs at all: `Continuity Without Display`,
`Reality Review Protocol`, `Transparent Enchantment — canon-level doctrine`.

**The conclusion is precise and not about search quality:**

> **The memory network has a referential-integrity defect caused by a two-namespace design with no
> resolver. Identity is declared in kebab-case (`name:`), storage is snake_case (filename), links are
> emitted from identity and resolved against storage.**

Note the diagnostic asymmetry, which is the strongest evidence for the mechanism:

> **The routing layer (markdown links, real paths) is 99% intact. The associative layer (wikilinks,
> declared names) is 80% intact. Same corpus, same authors, same session — the failure tracks the
> reference *syntax*, not the content.**

This is why Step 2 concluded semantic retrieval would paper over it: embeddings would recover
*similar* documents while the corpus's own explicit, authored assertion *"this memory relates to
that one"* stays severed 1,075 times.

### A.3 Smallest structural repair that prevents recurrence

⛔ **Not applied. Identified only, per instruction.** Three candidates, ranked by blast radius:

| # | repair | changes | prevents recurrence? | risk |
|---|---|---|---|---|
| **R1** | **A resolver**: `[[X]]` resolves by (1) exact filename → (2) `name:` lookup → (3) hyphen/underscore normalization | **zero files mutated**; resolution logic only | ✅ — new links resolve regardless of convention | lowest; read-time only |
| R2 | Enforce `name:` == filename stem at write time | new writes only; 760 existing files still divergent | ✅ forward, ❌ backward | medium |
| R3 | Rewrite 1,075 links and/or rename files | mutates ~1,000 files with no git history and Time Machine as sole backup | ✅ | **highest** — the corpus is unversioned |

**R1 is the smallest repair that prevents recurrence**, because it makes the *existing* convention
divergence harmless rather than requiring convention agreement. It is also the only one that is
non-destructive on a corpus with no `git revert`.

**Cheapest next act (still not a repair): run `npm run memory:audit`.** It emits a timestamped
report bound to a corpus hash, and it already classifies every defect above. **Every number in this
section was derived by hand from a corpus that has a purpose-built, unrun instrument pointed at it.**

---

## B. Supersession integrity

### B.1 A lifecycle vocabulary exists — for index entries, not for memories

`audit-memory.py` implements a **real lifecycle**, and it is the only one in the system:

| state | where enforced |
|---|---|
| **parked** | `parked_new` / `parked_modified` (ERROR without a reopening observation) · `parked_inherited` (WARN, migration backlog via `parked-baseline.json`) |
| **closed** | `closed_plain` (WARN — closed entries still sitting plainly in the live index) |
| **reopened** | requires an explicit *reopening observation* |
| **baseline-stale** | `baseline_stale` |

This is a genuine `current → parked → closed → reopened` lifecycle with **two-phase ratification**
(inherited violations are warnings; new/modified ones are errors). It is more sophisticated than
"missing metadata."

**But its subject is the index entry, not the memory file.** Of the 44 files carrying hard
supersession markers and still index-linked, **0 carry a frontmatter `status:` field.** Structural
supersession exists on **37 of 1,429** files (2.6%), via ad-hoc frontmatter, not a defined vocabulary.

### B.2 Correction to my own Step 2 finding — the "44" was over-claimed

Step 2 §2.5 reported *"44 files carry a hard supersession marker and are still linked from an index
as current"* and called it the stale-masquerade surface. Refined by position analysis:

| | count |
|---|---|
| marker in the **first 1,200 chars** — likely about **this record** | **5** |
| marker **deeper in the body** — likely about a **thing the record discusses** | 39 |

The five: `project_strfry_deploy_lane_fix.md` · `project_jondi_field.md` ·
`reference_project_typecheck_narrow_scope.md` · `_referent_pass_report_2026-08-02.md` ·
`project_author_studio_route_identity_ruling.md`.

**Corrected claim: the confirmed masquerade surface is ~5, with 39 unclassified pending individual
reading — not 44.** The distinction matters because *"this record is retired"* and *"this record
describes something that was retired"* are opposite facts, and **no machine-readable field
distinguishes them.** That indistinguishability is the actual defect, and it survives the
correction — a smaller measured surface, same structural cause.

### B.3 Why superseded artifacts are still presented as current

Not one cause. **Four, compounding:**

| # | cause | evidence |
|---|---|---|
| 1 | **Missing metadata** | 0/44 have `status:`; 37/1,429 have any structural supersession |
| 2 | **Missing index-generation logic** | **1 of 10 index files carries a "generated" marker; no script writes `MEMORY.md`.** Indexes are hand-maintained, so a hook is only as current as the last session that thought to revisit it |
| 3 | **Missing validation** | `audit-memory.py` validates the **index-entry** lifecycle (`closed_plain`), never the **file** lifecycle — there is no field for it to check |
| 4 | **Competing vocabularies** | `parked`/`closed`/`reopened` (instrument) vs `SUPERSEDED`/`RETIRED`/`OBSOLETE`/`VOID`/`overturned` (prose, 61 files) vs `stale`/`no longer`/`CORRECTION` (soft, 219/190/57 files) vs `Ruled→Designed→Built→Wired→Surfacing→Verified→Operational` (maturity ladder) vs `Merged≠Activated≠Verified≠Accepted` (acceptance states) — **five vocabularies, none mapped to another** |

**Cause 2 is the root.** Metadata without generation is inert: even a perfect `status:` field would
not change an index hook, because nothing regenerates hooks from file state. The Step 2 root-index
observation — *"a hook that reads settled when the topic file says otherwise is the failure this
index exists to prevent"* — names the exact failure, and mitigates it by **instructing the reader**.
Per CCA §1's measured law, that is the weakest available control: *enforcement works, instruction
does not.*

### B.4 Does a new lifecycle ontology need to be introduced?

⛔ **Per instruction, the existing structures were tested first. Finding: they are sufficient in
vocabulary and insufficient in placement.**

`parked / closed / reopened` is a working, ratified, two-phase lifecycle with an instrument that
enforces it. It does not need replacing. It needs to be **applicable to a file, not only to an index
line** — and something must **derive** the index from file state rather than restating it.

**No new ontology is proposed here.** Whether to extend the existing one to files is a governed act,
not an audit finding.

---

## C. Witness-order investigation

⛔ **No hierarchy is invented here.** Conflict cases, then the structural question.

### C.1 Searched vocabulary

`source of truth` · `authority` · `precedence` · `evidence` · `witness` · `runtime truth` ·
`production truth` · `accepted` · `verified` · `merged` · `ratified` · `canonical` — across
`docs/canon/`, `docs/governance/`, `docs/ops/`, `docs/architecture/`, and all 1,429 memory files.

**Result: 55 memory files and 4 canon files use the vocabulary. Zero define an ordering across
witness classes.** A direct grep for runtime/production outranking documentation returns nothing.
The Step 2 finding stands: **the ordering is practised, never written.**

### C.2 Five conflict cases from this repository

| | conflict | witnesses | who won | authority exercised |
|---|---|---|---|---|
| **1** | Daily Anchor consent gate documented **"verified LIVE"** since 2026-07-03 | `CLAUDE.md` + memory hook `project_anchor_consent_gate_live` ⟷ production `count(*) = 0` on `member_daily_anchors` | **production observation** | *"Verified LIVE overstated what was proved… the record follows reality, not the reverse."* Explicit refusal to reconcile by populating the table. Established: *"LIVE means code + schema deployed and exercised; not in use by members."* |
| **2** | *"typecheck passes"* cited as validation across many lanes | claim ⟷ `tsconfig` scope: **one file, 409 files in graph, zero `.tsx`, zero `components/**`** | **the instrument's actual scope** | Retroactive invalidation of every prior citation: *"any pre-2026-07-30 lane citing 'typecheck passes' was citing that entrypoint smoke, not application validation."* |
| **3** | Boundary reported unguarded from a working tree | local checkout ⟷ deployed SHA | **deployed SHA** | *"falsely reported unguarded **TWICE** from working tree"* → standing rule: verify canonical **and** deployed SHA |
| **4** | Two lanes each held a `detectRelationalSignal` test suite | committed 592-line suite (trunk `5e8f8a5bb`) ⟷ uncommitted 42-test/22-mutation suite | **the committed one; the other was lost** | *"a commit is the only durable act"* — the uncommitted suite had no standing regardless of quality |
| **5** | System description omitted a live substrate | written architecture narrative ⟷ `agent_runs` production rows (Corpus Callosum, 2,382 lifetime turns/voice) | **production rows** | *"inverse drift"* — *"any substrate generating production rows must be named explicitly"*; the description was **under-reporting** reality |
| **6** | *(supporting)* Migration files read as evidence of deployed state | repository declaration ⟷ deployed reality | **deployed reality** | *"treating migration files as measurements"* named as a category error |
| **7** | *(supporting)* `--verify` output read as verifying the product | instrument's checkout ⟷ deployed referent | **deployed referent** | *"`--verify` measures the observer's checkout, NOT the deployed referent"* |

**Consistent pattern across all seven: the more *executable* and the more *deployed* a witness, the
more authority it carried in a factual dispute.** Documentation lost every time it disagreed with
runtime. This has never been written as a rule, and it has been applied at least seven times.

### C.3 Is a single total ordering valid? — the evidence says no

Case 1 contains **both directions in one paragraph**:

- Production `count(*) = 0` **defeated** the documented "LIVE" claim → *runtime > documentation*, on
  **what is**.
- The founder then **forbade** populating the table to make the sentence true → the record must
  follow reality. Here the ruling governs **what may be done about** the discrepancy — production
  observation has **no authority whatsoever** over that question.

Two witnesses, two questions, two different winners. **A total order cannot express this.** Mapped
onto the corpus's own ratified orthogonality — **Measurement ⊥ Governance ⊥ Implementation** — the
ordering appears to be **per-axis**:

| question being asked | strongest witness observed | overruled |
|---|---|---|
| *what currently exists?* (measurement) | production observation / runtime | schema → source → design doc → memory hook |
| *what may exist?* (governance) | founder ruling / ratified canon | production has **no standing** |
| *how does it become?* (implementation) | executable gate + committed artifact | prose procedure |
| *does the evidence support the claim?* | the instrument, **with its scope named** | the claim citing it |

**Provisional structural finding (⛔ not a proposal): the ordering is a lattice, not a ladder — a
witness class is authoritative *within an axis*, and axes do not rank each other.** Every observed
error was a **cross-axis substitution**, which is precisely what the ratified Measurement ⊥
Governance ⊥ Implementation rule already forbids.

That yields a genuine question for founder ruling, which this document does **not** answer:

> **Is the missing witness-order rule actually missing — or is it a corollary of Measurement ⊥
> Governance ⊥ Implementation that has never been stated as one?**

If the latter, the correct act is *stating a corollary of ratified canon*, not *ratifying new canon*
— a materially smaller constitutional act, and one the Direction of Authority would treat
differently.

---

## D. Consolidated status

| problem | exists? | overlaps? | conflicts? | solved? |
|---|---|---|---|---|
| Context economics | ✅ 3 docs + re-runnable instrument | — | no | **diagnosed, experiment proposed, unapproved** |
| `/continue` handoff | ✅ full contract + verification pass | supersedes any `.ain/current-state.md` | no | **designed, uninstalled, untracked** |
| Memory referential integrity | detection ✅ / identity, rename, repair ❌ | — | no | **detected-but-unrun; cause now proven** |
| Supersession lifecycle | ✅ for index entries only | 5 competing vocabularies | **yes — vocabularies unmapped** | **partial; generation is the root gap** |
| Witness order | ❌ no explicit rule; 7 consistent precedents | possible corollary of ratified canon | no | **unruled — founder question posed** |
| Instrument register (L10) | ❌ no register; `VERIFIED` field is a partial | — | no | **unsolved** |
| Tool-boundary enforcement | Bash/WebFetch ✅ · **Read hook = stub** | — | no | **causal law established (12×)** |
| Model routing / local tier | ✅ infrastructure complete and live | — | no | **built; efficacy untested** |

### Confirmation of the revised priority

The founder's ranking (1 referential integrity · 2 supersession · 3 instrument discoverability ·
4 witness semantics · 5 `/continue` · 6 retrieval · 7 deeper memory) is **supported by every
measurement in this step**, with one qualification: **items 1 and 3 are the same act.** Running
`memory:audit` is simultaneously the referential-integrity measurement and the first entry in the
instrument register. That collapse makes the first move smaller than the ranking implies.

---

## E. Stop — for founder ruling

Four questions. ⛔ None answered here.

1. **Witness order** — is it a new rule, or an unstated corollary of Measurement ⊥ Governance ⊥
   Implementation? Ladder or lattice? *(§C.3)*
2. **Supersession** — extend `parked/closed/reopened` from index entries to memory files, and let
   something derive index hooks from file state? Or hold, and keep supersession as authored prose?
   *(§B.4)*
3. **Referential integrity** — is a read-time resolver (R1) authorized as the repair shape, given
   the standing 2026-07-28 ruling that repair may only ever *propose a reviewable patch*? *(§A.3)*
4. **Invocation** — may `npm run memory:audit` be run? It is read-only against the corpus but
   **writes** a timestamped report + findings JSON to `memory-audit-reports/`. Under a strict
   read-only mandate that is a write, so it was **not** run.

**Recommended first act, pending (4):** run the audit. It converts every hand-derived number in this
document into an instrument-produced, hash-bound finding — and it is the cheapest possible test of
the deepest conclusion in this step, that **AIN's memory problem is invocation, not analysis.**

---

## F. Unknowns still open

1. `CLAUDE_CODE_ROUTING_AND_COST_AUDIT_2026-08-09.md` and `CONTEXT_CONTROL_EXPERIMENT_PROTOCOL.md`
   remain unread in full.
2. The **39 unclassified** supersession-marker files (§B.2) need individual reading.
3. The 169 genuinely-absent link targets (~228 refs) are still untriaged: never-written vs deleted
   vs renamed. **Deleted-with-inbound-links would be actual memory loss.**
4. `docs/handoff/` vs `docs/handoffs/` — unresolved (§1.1).
5. Canon reachability (~90 files, ~8 cited) still unmeasured; the orphan analysis run on L3 has not
   been run on L1.
6. Whether `_`-prefixed archival snapshots can surface as current truth through any retrieval path —
   **untested, same masquerade class as §B**.
7. Week-one context experiment (CCA §"Smallest safe experiment") — **decision requested, still
   pending.** It is unrelated to Builder OS architecture and should not be blocked behind it.
