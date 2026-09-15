# JARVIS-KP-01 · ACT 6 — PROOF-BOUNDARY PROPAGATION CENSUS

**Lane:** `JARVIS-KP-01` — Shared Operational Knowledge Plane
**Act:** ACT 6 — propagation census, discovery only (opened by founder act, 2026-09-15)
**Date:** 2026-09-15
**Performed by:** Claude (agent)
**Predecessors:** ACT 1 `cc902341` · Dispositions `4baf1c2e` · ACT 2 `7940e252` · ACT 3 `8a6bc0bbd` (principal reading **superseded by ACT 4**) · ACT 4 `cd6969aa6` · ACT 5 `7c1a334ad`

---

## 0. Standing, custody, and the operating constraints

**Question:** *When evidence is reused downstream, what presently causes — or fails to cause — its
declared `DOES NOT ESTABLISH` boundary to travel with it?*

```
ACT CUSTODY ........ ⚠️ NONCONFORMING — branch refused by committed policy; core.hooksPath unset
AUTHORITY STANDING . ⛔ not increased by this commit or push
```

### ⛔ Two constraints governing every classification below

1. **Missing repetition of a boundary is NOT a violation.** The test is: **did standing widen?**
   If yes — *what new evidence authorized the widening?*
2. **Repetition is not additional proof.** A conclusion does not strengthen because it was restated.

⭐ Constraint 1 turned out to be load-bearing in an unexpected way: the clearest retention case in
the corpus retains its boundary **without repeating it** (§2.3). Had repetition been the test, that
case would have been scored a loss.

---

## 1. Method

Traced specific evidence objects that carry a declared boundary, forward into every later record
citing them. Classified each propagation event as **retained · narrowed · widened · absent · no
event**. ⛔ No record was scored by keyword presence alone.

⚠️ **Sample, not survey.** Five evidence objects traced. Findings are about these traces.

---

## 2. Traced propagation events

### 2.1 ⭐⭐⭐ `S3-F1` — the complete operator, both halves in one paragraph

| | |
|---|---|
| **Origin boundary** | *"S3-F1 passing here is NECESSARY AND NOT SUFFICIENT; real atomicity must be proved against a database."* Single-threaded JS double; race modelled by an `await`, not a real one. |
| **Downstream** | `S3-M_PHASE_DISPOSITIONS_2026-09-14.md` §20–25, after the W-A witness |
| **Classification** | ⭐ **DISCHARGED — correctly, with the discharging evidence named** |

> *"**S3-F1 was necessary and not sufficient; it is now sufficient.** The physical mechanism
> establishes what the single-threaded double could only model."*

⭐ The discharge names *what* supplied the missing evidence — 8 independent PostgreSQL connections
racing one opportunity — rather than asserting sufficiency. **This satisfies the test exactly:
standing widened, and the new evidence authorizing the widening is named in the same sentence.**

⭐⭐ And in the *next* sentence the same record **declares the next boundary and names its discharge
condition**:

> *"zero receipts before and after is a **substrate** claim. ⛔ It does not pretend to prove that a
> future integrated route cannot cross incorrectly — that is what route [integration must prove]."*

**One paragraph performs the whole operator: discharge the old boundary with named evidence, declare
the new one, and name what would discharge *it*.** This is the strongest propagation instance found.

### 2.2 ⭐⭐ Co-Lab `33` — repetition mistaken for proof, then repaired

| | |
|---|---|
| **Origin** | the number `33` circulated in docs as the gate's check count |
| **Boundary loss** | ⭐ **the total had been repeated until it read as established.** `CLAUDE.md`: *"a total quoted without a run behind it is a **claim, not evidence**."* Compounded by a gate filename (`verify-colab-boundaries.ts`) that never existed — so the quoted total had no runnable instrument behind it |
| **Discharge** | `docs/ops/COLAB_RELEASE_GATE.md:57` — *"a production run of the gate on runtime `ca5fdff44` printed `33 passed · 0 failed · 0 warned`. **33 is now measured, not derived.**"* |
| **Boundary after discharge** | ⭐ **explicitly re-stated, not dropped**: *"The gate remains the `failed` column, never the total."* Plus a scope note: *"read-only and executed in-session via the founder's connected host."* |
| **Classification** | **WIDENED without authorization → later DISCHARGED → boundary RETAINED after discharge** |

⭐⭐ **This is the repository catching its own boundary-loss event and repairing it — and it is a
direct instance of constraint 2.** The number did not become true by being repeated; it became
established by being run. ⛔ Found by the project, not by this census.

### 2.3 ⭐⭐ Typecheck — retention **through citation form**, not repetition

| | |
|---|---|
| **Origin boundary** | `CLAUDE.md`: *"`npm run typecheck` green is not proof that everything typechecks — it is proof that nothing got **worse**."* |
| **Downstream** | 19 citations across programme records |
| **Classification** | ⭐ **RETAINED — structurally** |

The convention is `229 vs baseline 239 · 0 regressions`, not bare `0 regressions`. ⭐ **The absolute
count travels with the delta, so every citation makes the non-establishment visible: 229 errors still
exist.** Measured: **19 citations, 17 carrying the absolute counts; the 2 apparent exceptions are
line-wrap artifacts of the search, not bare citations.**

⭐⭐ **No downstream record restates the boundary, and none needs to.** The evidence format carries
it. Had "did the record repeat the limitation?" been the test, this would have scored 19 losses —
which is precisely why constraint 1 exists.

### 2.4 `I0.5` probe — boundary retained, never discharged

| | |
|---|---|
| **Origin boundary** | *"the 63/63 evidence is from a disposable probe, not a run of a committed SHA; **a probe is not the record**."* Discharge condition named: the full verifier from the committed SHA against a disposable shadow |
| **Downstream** | multiple records + the anchor |
| **Classification** | ⭐ **RETAINED across every citation** |

Every later mention preserves `⛔ CANONICAL VERIFY NOT YET ACCEPTED`. ⭐ The 63/63 result travelled
widely and **never once shed its qualifier**, including through a founder acceptance ruling that
explicitly declined to let it satisfy the canonical requirement.

### 2.5 ⚠️ `CRP-001` 38/40 — no propagation event at all

| | |
|---|---|
| **Origin boundary** | the strongest instrument in the corpus: six separately-named unestablished links |
| **Downstream citations** | ⛔ **zero**, outside this lane's own ACT 5 record |
| **Classification** | ⚠️ **NO EVENT — neither retention nor loss** |

⛔ **Absence of citation is not evidence of anything about propagation.** The most rigorous
proof-boundary instrument in the repository produced a result **that was never reused**, so it has
never been tested by travel. ⚠️ It is also therefore **not evidence that the form works** — a form
that has never been stressed is untested, not proven.

---

## 3. Boundary-discharge practice — does it exist as a recognized move?

⭐ **Yes, and it is performed with the required precision in both discharge cases found:**

| Discharge | Old boundary | New evidence supplied | Named? |
|---|---|---|---|
| S3-F1 → W-A | model ≠ database atomicity | 8 independent connections racing one opportunity | ✅ |
| Co-Lab 33 | derived total ≠ measured total | production run on runtime `ca5fdff44` | ✅ |

⛔ In neither case was the boundary discharged by **repeating the original evidence**. Both required
a *different kind* of evidence than the one that was refused. ⭐ That is the distinction between
proof completion and mere repetition, observed in practice.

---

## 4. ⭐⭐ Chained proofs — the practice exists well beyond CRP-001

ACT 5 found the chain form in one instrument. It is in fact widespread.

**Inequality chains** — each link separately establishable:

```
Built ≠ wired ≠ surfacing ≠ verified          (multiple records + anchor)
Merged ≠ walked ≠ accepted
REGISTERED ≠ ROUTABLE ≠ AUTHORIZED ≠ EXECUTABLE
Registration ≠ Connection ≠ Integration
observation ≠ interpretation ≠ recognition
```

**Arrow chains** — each transition independently evidentiary:

```
RETRIEVED → SELECTED → ASSEMBLED → FINAL MODEL REQUEST → USED → OBSERVABLE → EXPERIENCED CONTINUITY
ADMITTED → USED → EXPERIENCED AS CONTINUITY
ASSEMBLED → REACHES PROMPT → USED
ABLATE → COMPARE → CORRECT
ADJUDICATE → CODIFY → DEPLOY
```

⭐⭐ **The memory/context domain independently expresses the same chain at least three times**, in
different records, with different granularity. ⛔ They are **not cross-referenced** — nothing
indicates the three describe one chain, and this census does not assert that they do; it records
that they were authored separately.

⚠️ ⛔ **Not formalized here.** The practice is reported as discovered, and `CRP-001-UNIT-RETURN-SCHEMA-v1`
is **not** promoted to a repository-wide standard. It is the strongest instrument found in one
domain; that is a finding about the corpus, not authority over any other domain.

---

## 5. ⛔ Agent-facing inheritance — the absence, recorded

Searched every instruction surface an agent actually encounters.

| Instruction sought | `CLAUDE.md` | `AGENTS.md` | `.claude/**` |
|---|---|---|---|
| inherit a boundary when relying on evidence | **0** | 0 | 0 |
| carry forward a limitation | **0** | 0 | 0 |
| `does not establish` as an instruction to the reader | **0** | 0 | 0 |
| non-establishment / discharge obligation | **0** | 0 | 0 |

⛔⛔ **Nothing anywhere tells an agent that when it relies on evidence, it inherits that evidence's
declared non-establishments unless later evidence explicitly discharges them.**

⭐ Every retention observed in §2 was produced by an author who already knew the rule — from the
lane, from the record in front of them, or from the citation convention. ⛔ **None of it is
transmitted to a reader who arrives without that knowledge.** ⛔ The instruction is **not invented
here**; its absence is recorded.

---

## 6. Did standing widen anywhere unauthorized?

| Trace | Widened? | Authorizing evidence |
|---|---|---|
| S3-F1 → W-A | ✅ yes | ✅ named (physical mechanism) |
| Co-Lab 33 | ✅ yes, **before** discharge | ⛔ **none at the time** — caught and repaired by the project |
| Typecheck | ⛔ no | n/a — boundary carried in citation form |
| I0.5 probe | ⛔ no | n/a — never discharged, qualifier preserved |
| CRP-001 38/40 | ⛔ no | no event |

**One unauthorized widening found in the sampled traces, and it had already been detected and
repaired by the project before this census existed.**

⚠️ ⛔ **This does NOT establish that unauthorized widening is rare.** Five evidence objects were
traced. The four with clean results are all objects from lanes with unusually strong evidence
discipline — S3, I0.5, the typecheck gate. **A sample drawn from the most disciplined lanes cannot
estimate the population.**

---

## 7. ⛔ What this census does NOT establish

- ⛔ That boundaries generally survive reuse. **Five objects is a sample, not a rate.**
- ⛔ That the two discharges found are the only ones, or that discharge is common.
- ⛔ That absent citations (CRP-001) indicate any propagation property whatsoever.
- ⛔ That citation-form retention (§2.3) generalizes beyond the typecheck convention — **it is one
  convention, in one gate, that happens to encode its own limit.**
- ⛔ That the three memory-domain chains describe the same chain.
- ⛔ That any instruction should be added. §5 records an absence, not a requirement.
- ⛔ That `CRP-001`'s form works. It has never been stressed by downstream reuse (§2.5).

---

## 8. Standing

```
JARVIS-KP-01 · ACT 6 — PROOF-BOUNDARY PROPAGATION CENSUS ........... COMPLETE

Evidence objects traced ........................................... 5
  retained ........................................................ 2 (typecheck · I0.5 probe)
  discharged with named new evidence .............................. 2 (S3-F1 · Co-Lab 33)
  widened without authorization ................................... 1 (Co-Lab 33, pre-discharge;
                                                                      project-detected, repaired)
  no propagation event ............................................ 1 (CRP-001 38/40)
Chained-proof practice ............................................ WIDESPREAD (5 inequality · 5+ arrow)
Agent-facing inheritance instruction .............................. ⛔ ABSENT (0 across all surfaces)

⭐ Retention observed WITHOUT repetition — via citation form
⭐ Discharge observed as a distinct, correctly-performed move
⭐ Repetition-mistaken-for-proof observed once, self-caught by the project

⛔ NO proof schema · NO registry · NO parser · NO classifier · NO CI enforcement
⛔ NO agent-instruction change · NO .ain expansion · NO governance substrate
⛔ NO frontmatter · NO new epistemic terminology · NO retroactive rewriting
⛔ CRP-001 NOT promoted to a repository-wide standard
⛔ .ain/ UNTOUCHED · NO source file modified outside this record

ACT CUSTODY ....................................................... ⚠️ NONCONFORMING, DISCLOSED
EMBEDDED SYSTEM CLAIM IN GOVERNANCE ACT ........................... ⏳ REMAINS UNRULED
GRAMMAR / ENFORCEMENT ............................................. ⛔ UNOPENED

STOP CONDITION: census returned. Awaiting founder adjudication.
```

⭐ **The answer to the lane's question, as far as five traces can carry it.** Evidence *can* move
through this repository without its limits falling off — and in the traced cases it mostly did,
by three different mechanisms: an author restating the boundary, a citation format that encodes it,
and a discharge that names what replaced it.

⛔ **But none of those mechanisms is available to an agent that did not already know the rule.**
Every success in §2 depended on a human who understood the boundary carrying it deliberately. ⭐ The
one case where a number travelled without a human attending to it — a total repeated until it read
as measured — is the one case where standing widened without authorization.

⛔ Whether that asymmetry warrants a mechanism is not a question this act opens.
