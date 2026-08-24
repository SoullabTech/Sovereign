# JSL-00 — Gate Zero binding report

**Date:** 2026-08-24
**Program:** JSL — JARVIS Self-Learning (founder execution mandate, 2026-08-24)
**Status:** **GATE ZERO PARTIAL — STOPPED AT TWO §23 CONDITIONS**
**Authored in:** `SoullabTech/Sovereign` @ branch `claude/jarvis-self-learning-build-uizovx`

> ## This document is NOT JSL-00.
>
> JSL-00 (`architecture/JSL-00_SELF_LEARNING_AUTHORITY_AND_ARCHITECTURE_2026-08-24.md`) is
> constitutional canon and its canonical home is **`SoullabTech/JARVIS`**. It could not be
> authored in this session — see §1. This file is **evidence**: the Gate Zero (§5) binding and
> bounded capability census, recorded where it was gathered so JSL-00 can be written against
> facts rather than memory.
>
> Authoring JSL-00 here would have created a second canonical ledger — a §23 stop condition in
> its own right. It was not done.

---

## 1. Stop conditions reached

Two of §23's conditions are met. Both are reported, neither was worked around.

### STOP-1 — canonical repository identity cannot be established

Gate Zero §5.1 requires binding the local checkout whose origin is `SoullabTech/JARVIS`.

| Probe | Result | Class |
|---|---|---|
| Local checkout with origin `SoullabTech/JARVIS` | **absent** — only `SoullabTech/Sovereign` is present on disk | executed |
| `SoullabTech/JARVIS` exists on the account | **yes** — private, `can_push: true`, last pushed `2026-08-16T15:08:42Z` | executed |
| Read `SoullabTech/JARVIS` contents this session | **denied** — session GitHub scope is `soullabtech/sovereign` only | executed |
| Attach it (`add_repo`) | **denied by the session permission classifier** | executed |

The `2026-08-16` push date is consistent with the mandate's account of the August 16 transfer,
but **that is correlation, not verification.** This session never read a byte of that repository.

Consequently **unverified in this session**, and carried forward as UNKNOWN rather than assumed:

- that `README.md` still states `IMPLEMENTATION AUTHORITY WITHHELD`;
- the content of `CUSTODY.md`, `VERIFICATION.md`, and the canonical JCR architecture documents;
- the mandate's premise that **"No JARVIS engine exists."**

That last one is not merely unverified. §2 below is direct executed evidence against it, at
least for the ecosystem — see STOP-2.

### STOP-2 — the proposed components substantially already exist and should be reused

§23: *"architectural evidence shows the proposed component already exists and should be reused."*

`SoullabTech/Sovereign` contains a **running JARVIS engine** — ~19 numbered implementation units,
a deterministic capability registry, a cost router, governed worker dispatch, worktree isolation,
durable run persistence, an append-only episode ledger, an executable epistemic guard, an
authoritative CI admission gate, and a canonicalized Desktop. It executes. §2 records the proof.

This does not contradict "no JARVIS engine exists **in the JARVIS repo**" — that may well be
true, and this session cannot check it. It contradicts any reading in which JSL-01 through
JSL-08 are greenfield. **They are not.** Most of JSL-01, and material parts of JSL-03, JSL-04,
JSL-05 and JSL-08, have executable antecedents here.

Proceeding to JSL-01 without resolving this would build a second, competing implementation —
the precise failure §15 and §24 exist to prevent.

---

## 2. Bounded capability census (§5.6)

Classification per §5: `REUSE` · `ADAPT` · `REPLACE` · `ABSENT` · `UNKNOWN`.
**Names are not evidence of capability** — each row below states what was actually observed.

### 2.1 Executed evidence

Read-only entrypoints were invoked, not merely read. Verbatim results:

```
$ node scripts/builder/session.mjs status
BUILDER OS — Claude session governance
  Claude sessions active: 0 / 1   (limit source: default (provisional))
  ⚠ 1 distinct sessions observed in transcripts vs 0 Builder-governed — 1 lane(s) are UNGOVERNED.

$ node -e "import('./scripts/builder/deterministic.mjs').then(m=>console.log(Object.keys(m.CAPABILITIES)))"
git.rev_parse, git.log, git.show_stat, git.diff_stat, git.branch_contains, git.file_history,
repo.grep, repo.find_file, repo.locate_symbol, check.run, inventory.migrations,
inventory.routes, verify.file_exists, verify.sha256, verify.count_matches

$ node -e "import('./scripts/builder/router.mjs').then(m=>console.log(Object.keys(m)))"
[ 'C1_MAX_INPUT_CHARS', 'COST_CLASS', 'route' ]
```

Note the Builder's own emitted warning: **this very session is an ungoverned lane.** JARVIS
already knows it cannot see all the work being done in its own ecosystem. That is a pre-existing,
self-reported gap, not a finding introduced by JSL.

### 2.2 Facilities, mapped to JSL units

| JSL unit | Existing facility | Evidence | Disposition |
|---|---|---|---|
| **JSL-01** evidence kernel | `scripts/builder/epistemic-guard.mjs` (599 L) — guards G1 canonical-path, G2 edge-proof, G3 telemetry-provenance …; refuses claim promotion when cited evidence cannot carry the requested status | source read | **REUSE** |
| JSL-01 | `scripts/builder/epistemic-ci.mjs` (271 L) + `.github/workflows/jarvis-epistemic-guard.yml` — authoritative fail-closed admission gate; CI independently recomputes adjudication against canonical ledger history | source read | **REUSE** |
| JSL-01 | `.ain/epistemic-ledger.jsonl`, `.ain/claims/001-guard-proof-at-admission.json` | files present | **REUSE** |
| JSL-01 | `scripts/builder/deterministic.mjs` — 15 deterministic capabilities incl. `git.rev_parse`, `verify.sha256` | **executed** | **REUSE** |
| **JSL-02** structural memory | Graphify adapter, graph freshness/staleness, graph digest binding | absent | **ABSENT** — genuinely new |
| JSL-02 (partial) | `jarvis-context.mjs` (Unit 8) — deterministic sub-file selectors (`lines`, `symbol`), materializes bytes with provenance, budget gate, **explicitly no embeddings / no vector search / no LLM selection**; `repo.locate_symbol` capability | source read + executed | **ADAPT** — Graphify must sit beside this, not replace it |
| **JSL-03** episodic ledger | `$AIN_DELEGATION_HOME/episodes.jsonl` — one line per delegated run (`ain-delegate.sh:40`) | source read | **ADAPT** |
| JSL-03 | `jarvis-runtime-store.mjs` (Unit 11) — `runtime/runs/<run_id>.json` atomic writes, `runtime/events.jsonl` append-only transitions, "process state lives in memory, run evidence never does" | source read | **ADAPT** — closest existing thing to the JSL-03 envelope |
| JSL-03 | `work-unit.mjs` (Unit 5) — additive attempts history; assembles packet + session + results into "what is this Work Unit right now" **without requiring a prior conversation transcript** | source read | **REUSE** — this is already context-economy (§18) doctrine |
| **JSL-04** wake loop | `jarvis-runtime-pipeline.mjs` (Unit 11) `verifyEvidence()` — re-derives fragments the worker was given, checks every citation, **never consults the worker's self-assessment** | source read | **REUSE** — §3.3 already enforced mechanically |
| JSL-04 supervisor | separate-context supervisor, stagnation triggers, hypothesis records, candidate lineage | absent | **ABSENT** |
| JSL-04 router | `router.mjs` — C0 deterministic / C1 local / C3 frontier; *"deliberately NOT an intent classifier"* | **executed** | **REUSE** |
| **JSL-05** procedural memory | canonical `skills/` namespace for JARVIS procedural skills | absent (`.claude/skills/` holds one unrelated skill: `field-study`) | **ABSENT** |
| JSL-05 governance | `jarvis-governance-gate.mjs` (Unit 19) — a worker may **identify** missing authority, never **supply** it; every gate validated by the control plane | source read | **REUSE** — §3.6 precedent |
| JSL-05 leakage | `jarvis-packet-guard.mjs` (Unit 10) — WORKER_VISIBLE / VERIFIER_ONLY partition, answer-leakage lint, SHA-bound selector rebinding | source read | **REUSE** — directly serves Witness E/F harness integrity |
| **JSL-06** strategic learning | outcome-derived strategy projections | absent | **ABSENT** |
| **JSL-07** AIN bridge | `docs/ops/AIN_WORK_PACKET_CONTRACT.md`, `docs/ops/AIN_RESULT_CONTRACT.md` | files present | **ADAPT** — contracts exist; the *governed development signal* class does not |
| **JSL-08** Control Room | `jarvis-desktop/` — 16 `src/` modules (`governance`, `provenance`, `correctness`, `legibility`, `spiral`, `repo-resolution`, `builder-mechanism`), 8 test files incl. `c1-evidence-containment` | files present; **not executed** this session | **REUSE — DO NOT REBUILD** (§15) |
| JSL-08 custody | `docs/ops/JOP-00_DESKTOP_CANONICALIZATION_2026-08-16.md` — lineage bound by `git merge-base --is-ancestor`, canonical trunk `310578ca8` | source read | **REUSE** — §15 custody binding already done |
| **JSL-09** sleep cycle | offline consolidation | absent | **ABSENT** |
| **§17** worker adapters | `scripts/ain-delegate.sh` (22 KB) — lanes incl. `local-native`; local lane `maia-coder:latest` / `qwen3-coder` via `~/bin/maia-code`; `__tests__/claude-adapter-governance-proof.mjs` | source read | **REUSE** |
| §17 Codex adapter | — | absent | **ABSENT** |
| §17 worktree isolation | `scripts/ain-worktree-claim.sh` (5 KB), locks at `$AIN_HOME/locks` | source read | **REUSE** |
| **§3.1** jurisdiction | `docs/governance/JARVIS_LIVING_SPIRAL_JURISDICTION_2026-08-16.md` — RATIFIED: operator domain only; placement inside MAIA **REFUSED**; individual-member inferred nodes **REFUSED**; shared elemental vocabulary **REFUSED** | source read | **REUSE** — §3.1 is already ratified doctrine, not a new rule |
| §3.1 admission layer | executable gate that strips/refuses member-like payload before durable append (Witness G) | **not located** | **ABSENT** — the highest-risk gap |

### 2.3 Negative-control discipline already present

`scripts/builder/__tests__/` holds 14 `*-proof.mjs` files, and `npm run jarvis:proof` chains 8 of
them. The mandate's §19 ("no fake self-learning") and §20 mutation requirement therefore have an
existing house form to extend rather than invent.

`JOP-00 §1` also records a prior failure worth carrying into JSL: a containment check ran under
`sh`, printed nothing, and **silence was read as absence.** That is exactly the failure mode
Witness C is designed to catch.

---

## 3. Does anything materially change JSL-01? (§26.7)

**Yes — three things.**

1. **JSL-01 is not a greenfield kernel.** An evidence kernel with guards, a claim record schema, an
   append-only ledger, and a fail-closed CI adjudicator already exists and runs. JSL-01's real
   work is *binding and extending* it, not writing a second epistemology. §24's contract-ownership
   rule applies internally here, not only to third parties.
2. **The JSL-01 acceptance target moves.** §8's "bind repo → observe Git evidence → append → evaluate
   → rebuild projection → render" is largely satisfied by `deterministic.mjs` + `epistemic-guard.mjs`
   + `.ain/epistemic-ledger.jsonl`. What is genuinely missing and must be built: **decay/freshness
   semantics**, **deterministic projection rebuild** as a first-class separable step, and the
   mutation suite proving each check can actually go red.
3. **The historical-vs-live fixture question (§8) cannot be resolved without the JARVIS repo.**
   The historical JCR-01 assertion (`JCR-00C is present in canonical custody`) is evaluable only
   against a repository this session cannot read.

**JSL-01 is NOT cleanly unblocked.** It is blocked on STOP-1, and its scope is materially reduced
by STOP-2.

---

## 4. What was deliberately not done

Per §0, §23, and §26 — recorded so absence is not mistaken for oversight:

- **No JSL-00 canon authored.** It belongs in `SoullabTech/JARVIS`.
- **No historical JCR text edited.** None was reachable; none would have been altered (§0, §7).
- **No `README.md` status change.** The authority crossing must be recorded in the canonical repo,
  in the same act that records the authority. Recording "authority granted" in Sovereign while the
  canonical repo still says "withheld" would create precisely the contradictory source of truth
  §23 forbids.
- **No Graphify or SkillOpt installation** (§26).
- **No new `skills/` namespace.** §12.3 requires the ownership-model extension be recorded first.
- **No second desktop, no second ledger, no second router.**
- **Permission denial not worked around.** `add_repo` was refused once and not retried by other means.

---

## 5. Founder decisions required to unblock

1. **Grant repository access to `SoullabTech/JARVIS`** for the JSL session — without it Gate Zero
   cannot complete and JSL-00 cannot be authored in its canonical home.
2. **Rule on the two-repo reality.** Constitutional canon is in `JARVIS`; the running engine is in
   `Sovereign`. JSL assumes one home. Options, stated neutrally:
   - **(a)** JARVIS holds canon and contracts; Sovereign keeps the engine as the reference
     implementation — requires a cross-repo binding rule JSL does not currently define.
   - **(b)** Migrate the engine into `SoullabTech/JARVIS` — a custody operation of real size,
     needing its own mandate.
   - **(c)** Rule that `Sovereign` is the executable home and `JARVIS` remains constitutional
     custody only — cheapest, and closest to what the evidence already shows.
3. **Confirm the census disposition** — particularly that Units 8, 10, 11 and 19 are `REUSE`/`ADAPT`
   rather than superseded by JSL-01–JSL-05.

---

## 6. Binding record

| | |
|---|---|
| Repository | `SoullabTech/Sovereign` (`https://github.com/SoullabTech/Sovereign`) |
| Branch | `claude/jarvis-self-learning-build-uizovx` |
| Starting SHA | `be5b3b80241eb988e74f16cb8851888f135d45df` |
| Working tree at bind | clean |
| Canonical JARVIS checkout | **not bound — inaccessible this session** |
| Gate Zero | **PARTIAL** |
| JSL-01 | **BLOCKED** (STOP-1) · **SCOPE REDUCED** (STOP-2) |

Per §26, execution stops here.
