# Builder OS — Instrument Reconciliation & Witness-Corollary Falsification (Step 4)

**Date**: 2026-08-09 · **Mode**: investigation only. **Nothing repaired, extracted, moved, or
generalized.** Executed under Ruling 1 (instrument execution authorized).

**Instrument run**: `npm run memory:audit` → `memory-audit-reports/audit-20260809-184526.{md,json}`
(hash-bound: `index_sha256` + `corpus_manifest_sha256` in the JSON).

---

## 1. The 10× discrepancy — fully explained, and the explanation is the finding

### 1.1 What each measurement counted

| dimension | Step 2 manual | `memory:audit` |
|---|---|---|
| population | all 1,428 `.md` files incl. `MEMORY.md` + `_` archival | **1,426 topic files** — excludes `MEMORY.md` and `ARCHIVE_PREFIX` (`_`) files |
| unit | reference occurrences | reference occurrences |
| "resolved" means | **target exists as an exact filename** | target resolves under the instrument's resolver (below) |
| result | 1,075 broken wikilinks | 100 unresolved + 65 prefix-omitted + 3 md-suffix |

### 1.2 The instrument's resolver (read from source, `audit-memory.py:82–142`)

```
norm(slug)   = lowercase, hyphen→underscore
slug_map     = norm(filename stem) ∪ norm(frontmatter name:)   ← BOTH identities indexed
resolve(raw) = 1. exact hit in slug_map           → "exact"
               2. try PREFIXES + slug              → "prefix"   (project_/feedback_/reference_/user_)
               3. no hit                           → unresolved
ambiguity    : >1 hit → ambiguous_wikilinks (ERROR class) — surfaced, never selected
```

**Answers to the eight questions:**

1. **Populations** — differ by 3 files (`MEMORY.md` + archival); immaterial.
2. **"Resolved"** — manual used filesystem-exact; instrument uses normalized dual identity.
3. **Consumer semantics** — see §2; this is the open architectural question, not a resolver property.
4. **Mechanism** — canonical filename **and** `name:` identity, both normalized, plus prefix
   omission. Exactly the R1 resolver Step 3 proposed as "the smallest repair."
5. **Does it guess?** — **No.** Normalization is deterministic; prefix expansion collects *all*
   candidates.
6. **Ambiguity surfaced?** — **Yes, as ERROR**, a class stricter than unresolved. It never picks one.
7. **Why does the instrument know what the operational path doesn't?** — see §2.
8. **Zero ambiguity / zero duplicates scope** — verified on the **full** corpus: I recomputed over
   all 1,432 files including the ones the instrument excludes: **5,369 occurrences → 5,202 exact ·
   65 prefix · 102 unresolved · 0 ambiguous · 0 duplicate identities.** Instrument said 100; the
   +2 are in files it deliberately excludes. **The two measurements agree exactly once semantics
   are aligned.**

### 1.3 Verdict on the baseline

Neither measurement was wrong. They measured **different resolution regimes**:

| resolution regime | broken references |
|---|---|
| filesystem-exact (weakest possible reader) | 1,075 (20.0%) |
| instrument semantics (normalized dual identity + prefix) | **102 (1.9%)** |

> **The corpus's referential integrity is reader-dependent.** Under a competent resolver the memory
> network is **98.1% intact**; under a naive one it is 80% intact. The corruption is not in the
> corpus — it is in the *unspecified contract about how references are to be resolved.*

The authoritative baseline is now the instrument's, hash-bound: **102 unresolved occurrences · 59
distinct missing targets · 0 ambiguous · 0 duplicates.**

### 1.4 What the 102 residual actually are (triaged)

| class | count | note |
|---|---|---|
| **meta-vocabulary** — quoted examples *about* linking (`[[wikilinks]]`, `[[link]]`, `[[refs]]`, `[[name]]`, `[[slug]]`) | ~20 occ | false positives; mostly in the referent-pass report — a document *about* broken links whose examples are counted as broken links. Same masquerade class as §F.6 |
| **truncated slug** | 5 occ | `[[project_six_category_artifact_typolo]]` — a *write-time truncation* defect, distinct from convention drift |
| **genuinely absent targets** | remainder (~77 occ / ~50 targets) | led by `project_constitutional_methodology` (13 refs) and `project_recognition_first_development` (5) — files referenced repeatedly that were **never written**. These are promised-but-unauthored memories, not lost ones |
| location | 85% in live topic files, 15% in archival | |

**No evidence of deleted-with-inbound-links memory loss was found.** The absent targets pattern as
never-written, not as vanished.

---

## 2. The architectural question: missing capability, or disconnected capability?

**Disconnected. Definitively.**

The resolution capability exists, is correct, is deterministic, refuses to guess, and surfaces
ambiguity as an error. It lives in exactly **one** place — a diagnostic instrument that had never
been run — while every consumer that actually *follows* references at recall time has no access to
it:

| reference consumer | has the resolver's semantics? |
|---|---|
| `audit-memory.py` | ✅ — the only one |
| a session following `[[name]]` during recall | ❌ unspecified — depends on the model's improvised fuzzy matching, per session, per moment |
| the memory-writing protocol (system prompt) | ❌ — still *generates* divergent identities (`name:` kebab vs filename snake) |
| the Step 2 manual audit (me) | ❌ — used filesystem-exact and over-reported corruption 10× |
| index reachability / BFS analyses | ❌ same |

Step 2's manual audit is itself the cleanest demonstration: **an agent inspecting the memory system
without the resolver concluded the network was 10× more broken than it is.** Any operational
consumer without those semantics misreads the corpus the same way.

**Classification: continuity/disconnection failure, not missing-capability failure.** Filed as the
second confirmed instance of the pattern Ruling 4 named:

> **Dormant Instrument Failure (instance 2, refined): the capability existed, was encoded once, in
> the one component that is only as useful as its invocation — and the contract it implements
> (what does a reference mean?) was never stated anywhere the writing protocol or the reading
> sessions could see.**

The 2026-07-16 Jeeves finding (*"most already exists; one broken seam"*), the M0 lost-wiring
archaeology, the auth-boundary audit, and now this: the recurring systemic phenomenon is
**capability alive locally, disconnected globally**. The resolver is not missing. Its *sharing* is.

⛔ Per instruction: the resolver was **not** extracted, duplicated, or generalized. What its
existence changes is the remediation question — from *"build R1"* to *"where does the
already-existing resolution contract get stated so that writer, reader, and instrument share it?"*
That is a design question for after founder ruling.

---

## 3. Witness-corollary falsification (Ruling 2)

**Candidate corollary tested**: *A witness has authority only over the kind of claim it is
competent to establish. Measurement witnesses what is observed; implementation witnesses what is
encoded; governance witnesses what is permitted/required/intended. No witness class dominates
outside its jurisdiction; conflicts are adjudicated by first classifying the claim.*

### 3.1 Against the seven conflict cases

| case | claim in dispute | jurisdiction | does the corollary predict the observed winner? |
|---|---|---|---|
| 1a — anchors "LIVE" vs `count(*)=0` | *are anchors in use?* | measurement | ✅ production observation beat documentation |
| 1b — forbidden to populate the table | *may we make the sentence true?* | governance | ✅ founder ruling; production had no standing |
| 2 — "typecheck passes" | *what did the gate establish?* | measurement **of the instrument's own scope** | ✅ with refinement (§3.3) |
| 3 — unguarded-from-working-tree | *is the boundary deployed?* | measurement | ✅ deployed SHA beat checkout — refinement (§3.3) |
| 4 — lost test suite | *what is encoded?* | implementation | ✅ committed artifact is the only competent witness; quality of the uncommitted suite was jurisdictionally irrelevant |
| 5 — Corpus Callosum inverse drift | *what exists?* | measurement | ✅ production rows beat the narrative that omitted them |
| 6 — migration files as measurements | *what is deployed?* | measurement | ✅ named category error = cross-jurisdiction substitution |
| 7 — `--verify` on observer checkout | *what does the deployed referent do?* | measurement | ✅ refinement (§3.3) |

**The corollary survives all seven cases.** Every error in the record is a cross-jurisdiction
substitution — which is what the ratified Measurement ⊥ Governance ⊥ Implementation rule already
forbids. **The witness-order rule is a corollary, not new canon.** (Today's live demonstration:
Step 3 nearly proposed building a resolver — an implementation act — to answer what was actually a
measurement defect in the Step 2 baseline.)

### 3.2 Counterexample search — one candidate fourth jurisdiction

The corpus contains a witness class the three jurisdictions do not cleanly absorb:
**experiential acceptance.**

- `feedback_render_tests_cannot_replace_the_walk`: *"code can say how a relationship is stored;
  only the interaction can say what relationship is felt… an experiential criterion fails even
  when the database links everything correctly."* Coverage *"reduces implementation uncertainty,
  never upgrades an experiential acceptance."*
- `feedback_merged_verified_accepted_states`: **Accepted** is a state whose authority is a walk,
  not a gate — *"never let a green check stand in for a walk."*
- `feedback_three_layers_of_review_evidence`: evidence layers = **experienced** / governed /
  historical.

Two readings, both compatible with the record:

- **(a) Fourth jurisdiction** — *experience witnesses what is lived*; its competent witness is a
  walk by the person whose experience is claimed; no instrument, artifact, or ruling can establish
  it.
- **(b) Refinement within measurement** — "what is" splits by referent: system-state claims
  (competent witness: production observation) vs lived-experience claims (competent witness: the
  walk). The corollary's logic already implies this; it just needs the referent named.

The corpus leans (a) in vocabulary (three *layers*; Accepted as a distinct authority) but has never
ruled it. **This is the one open point requiring founder ruling; the corollary is not falsified
either way — the question is its arity.**

### 3.3 One genuine refinement the corollary needs

Cases 2, 3, 6, 7 were **within-jurisdiction** conflicts: both witnesses were measurement-class, and
the deployed/actual-scope witness beat the checkout/claimed-scope witness every time. The corollary
as stated only adjudicates *between* jurisdictions. The record's consistent within-jurisdiction
principle is:

> **Within a jurisdiction, authority increases with proximity to the claim's referent** — the
> deployed system outranks the observer's checkout as a witness of deployment; an instrument's
> actual scope outranks the claim citing it.

This is descriptive of seven-for-seven observed practice, stated here for falsification, **not
ratified**.

---

## 4. Independent CCA decision packet (Ruling 5 — surfaced separately)

**Not part of the memory remediation sequence. No dependency on Builder OS was found.**

**Decision requested** by `docs/ops/CONTEXT_CONTROL_ARCHITECTURE_2026-08-09.md` §"Smallest safe
experiment" — one week, three reversible changes, none enforced:

1. **Route Read-for-analysis** — amend the CLAUDE.md carve-out so `ctx_execute_file` is the default
   for any file not about to be edited. Addresses the measured #1 flood source (Read = 31.0% of
   tool-result tokens; 3,169 tok/call vs `ctx_execute`'s 497; `ctx_execute_file` used 108× vs
   Read's 4,681).
2. **Subagent-first for verification** (browser / simulator / logs / builds) — parent receives
   ≤500 tokens. Addresses the ~40% of flood that is images and structurally unroutable through
   `ctx_execute`. Measured subagent return: p50 279 tok, max 4,010 across 451 calls.
3. **Observe only** — daily `scripts/audit-session-context-cost.py --days 1`; no thresholds, no
   forced handoff.

**Evidence base**: 314 sessions · 94,203 requests · `r(cache_read, requests)=+0.955` vs
`r(initial_context)=-0.010`. **Risk noted by the CCA itself**: item 1 is instruction-without-
enforcement, the pattern its own §1 proved fails (the 12× law) — expect partial adoption, measure
anyway. **Ruling needed**: approve / amend / decline the week-one experiment.

---

## 5. Stopped. Awaiting founder ruling on

1. **§2** — where the resolution contract should live so writer, reader, and instrument share one
   semantics (design question; no design started).
2. **§3.2** — jurisdictional arity: is experiential acceptance a fourth jurisdiction or a named
   referent-split within measurement?
3. **§3.3** — the within-jurisdiction proximity principle: state as part of the corollary, or hold?
4. **§4** — the CCA week-one experiment, as its own lane.

Also available for a later triage pass: the ~50 genuinely-absent targets (promised-but-unauthored
memories, led by `project_constitutional_methodology` ×13), and the 5-occurrence truncated-slug
write defect.
