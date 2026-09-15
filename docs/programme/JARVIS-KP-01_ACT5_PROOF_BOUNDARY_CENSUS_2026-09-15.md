# JARVIS-KP-01 · ACT 5 — PROOF-BOUNDARY CENSUS

**Lane:** `JARVIS-KP-01` — Shared Operational Knowledge Plane
**Act:** ACT 5 — proof-boundary census, discovery only (opened by founder act, 2026-09-15)
**Date:** 2026-09-15
**Performed by:** Claude (agent)
**Predecessors:** ACT 1 `cc902341` · Dispositions `4baf1c2e` · ACT 2 `7940e252` · ACT 3 `8a6bc0bbd` (principal reading **superseded by ACT 4**) · ACT 4 `cd6969aa6`

---

## 0. Standing, custody, and the operating constraint

**Question:** *Where does the existing repository explicitly distinguish what evidence establishes
from what the same evidence does not establish?*

```
ACT CUSTODY ........ ⚠️ NONCONFORMING — branch refused by committed policy; core.hooksPath unset
AUTHORITY STANDING . ⛔ not increased by this commit or push
```

### ⛔ The constraint governing every row below

> The census **fails** if it converts *"this evidence does not establish X"* into *"therefore Y is
> the required evidence for X"* — **unless an existing source already says so.**

⭐ A proof boundary may tell us `A does not prove B` without telling us `C proves B`. Manufacturing
acceptance criteria from negative knowledge is the failure mode. **Every `DOES NOT ESTABLISH` cell
below is quoted or paraphrased from its source. Where a source also names required evidence, that is
marked `† source-named`; nowhere else is required evidence supplied.**

---

## 1. Method and scale

Searched `docs/` · `scripts/` · `tests/` · `CLAUDE.md` by linguistic form rather than by topic.

| Form | Instances |
|---|---|
| `does not establish` | **87** |
| `is not evidence` | **51** |
| `does not prove` | **22** |
| `does not imply` | **18** |
| `never evidence` | **12** |
| `necessary and not sufficient` | **9** |
| `never sufficient` | **7** |
| `is not an acceptance` | **1** |
| **Total** | **~207** |

⭐ Documents carrying a *section heading* of the form **"What this does / does NOT establish"**: **19**.

---

## 2. ⭐⭐ Principal finding

**Proof-boundary discipline is the most developed epistemic practice in this repository.** It is
pervasive (~207 statements), it has evolved a **recurring documentary form** (a named section), and
in one place it has been elevated to a **required, non-empty field**.

⛔ **And it is almost entirely prose.** Executable enforcement exists in roughly five places, all
inside the guard/gate machinery ACT 3 and ACT 4 censused.

⭐ This is the same inverse correlation ACT 3 recorded at the signal level (P7), now observed one
layer down at the **proposition** level: *the project knows precisely how far its evidence reaches,
and almost none of that knowledge is machine-available.*

---

## 3. ⭐⭐⭐ The strongest existing instrument

`docs/architecture/governance/crp-001/CRP-001-UNIT-RETURN-SCHEMA-v1.md` §2.1 — **`what is NOT
established` is a field that may never be omitted.**

> *"Three fields may never be omitted, abbreviated, or filled with a bare negation. A return
> violating this section is incomplete, not merely terse."*
> **Purpose: *"Prevents a bounded mechanism result from widening into a system claim."***

And its worked example expresses the boundary as an **inferential chain with each link named
separately**:

```text
ESTABLISHES:
  RETRIEVED → SELECTED — load-bearing memory survived selection in 38/40 benchmark cases.

DOES NOT ESTABLISH:
  - SELECTED → ASSEMBLED
  - ASSEMBLED → FINAL MODEL REQUEST
  - FINAL MODEL REQUEST → USED
  - USED → OBSERVABLE IN RESPONSE
  - OBSERVABLE IN RESPONSE → EXPERIENCED CONTINUITY
  - behavior of memory classes outside the benchmark
```

⭐⭐ **This is the `evidence → excess conclusion` ladder, already written down, as six separately
unestablished links.** It refuses the leap from *a benchmark passed* to *the member experiences
continuity* not by denying it but by **enumerating every link the evidence does not carry**.

⛔ **Enforcement: none executable.** No script, test, CI job or guard references the field. Verified:
zero references under `scripts/`, `tests/`, `.github/`. It is a schema honoured by authors.

---

## 4. The census — discovered boundaries by species

⚠️ Families below are **observed groupings of discovered instances**, not a proposed ontology.

### 4.1 Instrument / gate boundaries — *what a green result means*

| Evidence | Establishes | Does NOT establish | Source | Enforcement |
|---|---|---|---|---|
| `npm run typecheck` green | nothing got **worse** | ⛔ *"not proof that everything typechecks"* | `CLAUDE.md` | ✅ **gate script** (for the narrow proposition) |
| Co-Lab verifier run | the `failed` column is 0 | ⛔ the **total** — *"a total moves whenever checks are added, and a total quoted without a run behind it is a claim, not evidence"* | `CLAUDE.md` | ⚠️ exit code enforces `failed`; boundary is prose |
| `Deployment complete!` | the deploy script ran to its end | ⛔ *"a green deploy is not evidence a migration ran"* — a failed migrate only `log_warn`s | `CLAUDE.md` | ⛔ prose (the defect is itself unenforced) |
| Epistemic-guard green run | Axis 1 enforced against submitted, well-formed claims | ⛔ *"that claims are true"* · ⛔ *"that fabricated evidence was detected"* · ⛔ *"that inadmissible claims cannot enter by any other route"* | `jarvis-epistemic-guard.yml`, `epistemic-ci.mjs` | ✅ CI for the narrow claim; boundary stated in-file |
| Verifier coverage total | the named obligations discharged by PASS | ⛔ FR-14: *"an instrument can satisfy all of its remaining questions by forgetting to ask the difficult ones"* | `CLAUDE.md` (FR-14) | ⚠️ named floor; prose |

### 4.2 Absence boundaries — *what silence proves*

⭐ The most disciplined family in the corpus.

| Evidence | Does NOT establish | Source | Enforcement |
|---|---|---|---|
| No holder record in `.deploy.lock` | ⛔ nothing — *"its absence carries ZERO information and is evidence for nothing"* (overwritten by every acquisition) | `CLAUDE.md` 2026-09-07 | ⛔ prose |
| No branch-policy refusal | ⛔ *"absence of the branch hook is never evidence of branch-policy compliance"* | `CLAUDE.md` 2026-09-13 | ⛔ prose — **this lane runs under that absence** |
| Instrument reports nothing | ⛔ *"absence of evidence from the instrument is not evidence of absence in the object"* | architecture corpus | ⛔ prose |
| No recorded objection | ⛔ *"the absence of evidence is not evidence of refusal"* | architecture corpus | ⛔ prose |
| Act not found in history | ⛔ absence of the act — **two horizons must be established first** (clone depth; secrets-scrubbed root) | ACT 3 `8a6bc0bbd`, ratified as lane doctrine | ⛔ prose |
| No confirmation-of-an-act path | ⛔ *"that does not prove a person…"* | governance corpus | ⛔ prose |

### 4.3 Chain boundaries — *prerequisite is not acceptance*

| Evidence | Establishes | Does NOT establish | Source | Enforcement |
|---|---|---|---|---|
| `18/18 persistence gates pass` | a prerequisite for feature acceptance | ⛔ *"is **not** an acceptance of it"* | `THREE_AUTHORITY_CHAINS.md` | ⛔ prose (⏳ document itself unratified) |
| Evidence for chain N | prerequisite for chain N+1 | ⛔ may not **substitute** for chain N+1's own evidence | ibid. | ⛔ prose |
| `RETRIEVED → SELECTED` in 38/40 | that one link | ⛔ five further links, each named | CRP-001 §2.1 | ⛔ prose |
| Verdict `INVALID` | ⛔ **nothing in either direction** — *"not a soft PASS and not a FAIL"* | `CLAIM_STATE_AUTHORITY.md` | ✅ ratified canon; ⛔ prose |

### 4.4 Model / reality boundaries — *the double is not the thing*

| Evidence | Establishes | Does NOT establish | Source | Enforcement |
|---|---|---|---|---|
| `S3-F1` passing in a JS double | the law is modellable | ⛔ database atomicity — *"NECESSARY AND NOT SUFFICIENT"* † **source names the required evidence: proof against a real database in B-iv's own witness** | `CLAUDE.md`, S3 records | ⛔ prose |
| `63/63` on a disposable probe | the obligations can pass | ⛔ *"a probe is not the record"* — acceptance requires a run of the **committed SHA** † source-named | `CLAUDE.md` I0.5 | ⛔ prose |
| Byte identity of a file | the bytes match | ⛔ *"the installed substrate, launch path, profile, permissions, or runtime"* | architecture corpus | ⛔ prose |
| Author's own tests green | a claim about **code** | ⛔ *"Deployed ≠ demonstrated"* — a claim about **MAIA** | `CLAUDE.md` voice fix | ⛔ prose |
| Hairpin-NAT probe `HTTP 000` | the probe failed | ⛔ *"does not imply external traffic is broken"* | `CLAUDE.md` | ⛔ prose |

### 4.5 Scope boundaries — *this subject, not the next one*

| Evidence | Establishes | Does NOT establish | Source | Enforcement |
|---|---|---|---|---|
| Zero receipts before and after (S3 W-A/W-B) | a **substrate** claim | ⛔ *"it does not pretend a future integrated route cannot cross incorrectly"* | S3 records | ⛔ prose |
| Ratification of a corpus | the document governs | ⛔ *"any runtime capability, retrieval status…"* | `MAIA_SOUL_CORPUS.md` | ✅ canon; ⛔ prose |
| Interface renders a capability | the interface reveals it | ⛔ *"it never creates architectural truth"* | Interface Humility | ✅ canon; ⛔ prose |
| `LIVE` state | exists and verified | ⛔ *"LIVE must never imply perfection"* | `VERIFICATION_STATES.md` | ✅ ratified canon; ⛔ prose |
| A 5-turn cohort observation | that cohort | ⛔ *"never evidence about the path most members are on"* | research corpus | ⛔ prose |
| One declined case | that case | ⛔ *"not evidence that the eight-phenomenon family is inadequate"* | research corpus | ⛔ prose |

### 4.6 Evidence-kind boundaries — ⭐ the executable family

| Evidence | Does NOT establish | Source | Enforcement |
|---|---|---|---|
| `code_comment` · `filename` · `naming_convention` · `import_graph` · `architecture_doc` · `historical_assertion` · `project_memory` · `worker_claim` | ⛔ never sufficient **alone** for a claim about what the running system does — *"an assertion about the system, not an observation of it"* | `epistemic-guard.mjs` `WEAK_KINDS` | ✅✅ **blocking CI** |
| A liveness word without scope | ⛔ must distinguish `deployed_exercised` from `in_use_by_members`; the latter needs a production observation of member rows † source-named | `G7 LIVENESS-SCOPE` | ✅✅ **blocking CI** |
| Two `endpoint_proof`s | ⛔ *"explicitly do not suffice"* for an edge claim † source names `edge_trace` | `G2 EDGE-PROOF` | ✅✅ **blocking CI** |

### 4.7 Transfer boundaries — *a gain here is not a gain there*

| Evidence | Does NOT establish | Source | Enforcement |
|---|---|---|---|
| Improvement on a practiced task | ⛔ *"a gain on the practiced task is never, by itself, evidence of a gain in life"* | programme doctrine (brain-training rule) | ⛔ prose |
| Prose documenting a prohibition | ⛔ must not read as the prohibited behaviour returning — the C21 false positive: a file failed a scan **because it documented its own compliance** | `CLAUDE.md` I0.5 | ✅ repaired in the instrument (comment-stripping) |

---

## 5. Forms in which boundaries are carried

| Form | Observed | Machine-locatable? |
|---|---|---|
| Named section heading — *"What this does NOT establish"* | **19 documents** | ⚠️ by heading text only |
| Required schema field — `what is NOT established` | **1** (CRP-001 §2.1) | ⛔ no validator |
| Inline sentence — *"X is not evidence of Y"* | ~200 | ⛔ no |
| Executable evidence-kind classification | `WEAK_KINDS`, G2, G7 | ✅✅ yes |
| Scope block in an executable file's header | `epistemic-ci.mjs`, workflow | ⚠️ present, unparsed |

⭐ **Finding — the discipline has a form and the form has no reader.** Nineteen documents write the
same section; one schema requires it; ~200 sentences state it inline. Nothing reads any of them.

---

## 6. ⛔ What this census does NOT establish

Applying §0's constraint to itself:

- ⛔ **That the ~207 statements are consistent with one another.** Not tested; instances were located
  and quoted, never cross-checked for conflict.
- ⛔ **That the counts are exhaustive.** Eight linguistic forms were searched. Boundaries expressed
  in other phrasings — or as diagrams, tables, or refusals without these words — are **not counted
  and not absent**.
- ⛔ **That prose-only enforcement means the boundaries are not honoured.** ACT 4 found the opposite
  pattern: S3-O1's WITNESSED/ENTAILED split is finer than the executable `G7`. **Unenforced is not
  unobserved.**
- ⛔ **That any of these boundaries is correct.** This act locates rules; it does not adjudicate them.
- ⛔ **That required evidence exists for any refused proposition**, except the four marked
  `† source-named`, where the source itself supplies it.
- ⛔ **That the CRP-001 form should be generalized.** It is the strongest instrument found; that is
  a finding about the corpus, not a recommendation.

---

## 7. Standing

```
JARVIS-KP-01 · ACT 5 — PROOF-BOUNDARY CENSUS ....................... COMPLETE

Proof-boundary statements located ................................. ~207
Documents with a named "does NOT establish" section ............... 19
Required non-empty field instruments .............................. 1 (CRP-001 §2.1, unenforced)
Species families observed ......................................... 7
Boundaries with executable enforcement ............................ 3 (WEAK_KINDS · G2 · G7) + 2 partial
Boundaries carried in prose only .................................. the remainder
Sources naming required evidence .................................. 4, marked † and not generalized

⛔ NO proof ontology · NO evidence schema · NO claim grammar · NO classifier
⛔ NO ledger expansion · NO registry · NO authority class · NO V6 resolution
⛔ NO embedded-claim jurisdiction ruling · NO transition-authority ruling · NO enforcement repair
⛔ NO required evidence manufactured from a refusal
⛔ .ain/ UNTOUCHED · NO source file modified outside this record

ACT CUSTODY ....................................................... ⚠️ NONCONFORMING, DISCLOSED
EMBEDDED SYSTEM CLAIM IN GOVERNANCE ACT ........................... ⏳ REMAINS UNRULED
GRAMMAR / SCHEMA .................................................. ⛔ UNOPENED

STOP CONDITION: census returned. Awaiting founder adjudication.
```

⭐ **What ACT 5 establishes.** The repository already practises, at scale and with unusual precision,
exactly the discipline an agent most needs and most lacks: it states how far each piece of evidence
is entitled to carry a conclusion, and where it must stop. It has done so ~207 times, evolved a
section form for it, and once made it a field that may not be left empty.

⛔ **What it does not establish is why that knowledge is unreadable** — and the answer is not
missing vocabulary. Each boundary is written beside the evidence it constrains, in the record that
produced it. Nothing gathers them, and nothing checks a later conclusion against the boundary its own
evidence already declared. ⛔ Whether anything should is not a question this act opens.
