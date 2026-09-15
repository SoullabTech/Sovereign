# JARVIS-KP-01 · ACT 8 — `CLAIM_STATE_AUTHORITY §6` CONFORMITY CENSUS

**Lane:** `JARVIS-KP-01` — Shared Operational Knowledge Plane
**Act:** ACT 8 — §6 conformity census (opened by founder act, 2026-09-15)
**Date:** 2026-09-15
**Performed by:** Claude (agent)
**Predecessors:** ACT 1 `cc902341` · Dispositions `4baf1c2e` · ACT 2 `7940e252` · ACT 3 `8a6bc0bbd` (principal reading **superseded by ACT 4**) · ACT 4 `cd6969aa6` · ACT 5 `7c1a334ad` · ACT 6 `8adca3d2c` · ACT 7 `a8ef26db3`

---

## 0. Standing, custody, and the authority this act runs under

```
ACT CUSTODY ........ ⚠️ NONCONFORMING — branch refused by committed policy; core.hooksPath unset
AUTHORITY STANDING . ⛔ not increased by this commit or push
```

### The founder adjudication of `CLAIM_STATE_AUTHORITY §6`, recorded

> A downstream reuse of evidence constitutes **movement of the claim** under §6 when the later
> carrier relies on that evidence to **preserve, assert, or increase** the epistemic standing of the
> same proposition or a proposition **materially dependent** upon it.
>
> In such movement, the evidence provenance required by §6 travels with the claim, **including the
> actual result and its invalidity conditions.**
>
> **The boundary need not be repeated verbatim. It must remain recoverable and operative.**
>
> A later carrier may exceed the earlier boundary **only where it supplies additional evidence
> sufficient to discharge that boundary.** Repetition, citation, merge, recency, or accumulation of
> carriers does not itself widen standing.

⭐ This is an **interpretation of already-ratified canon**, not a new doctrine. ⛔ ACT 8 applies it;
it does not extend it.

### Scope distinction, as ruled

```
REFERENCE   "this earlier record discussed X"              → §6 does not apply
MOVEMENT    "because that evidence established X, this      → §6 applies
             conclusion may rely on X"
PROMOTION   "that evidence established X, therefore         → §6 applies AND new evidence is
             we now assert stronger Y"                        required beyond X's boundary
```

### ⛔ Two acceptance rules governing every score below

1. ⛔ **A later record is not scored as violating §6 merely because it fails to repeat the original
   limitation.** The test is whether the limitation remains **recoverable and operative**.
2. ⛔ **Movement is not inferred from citation.** Epistemic reliance must be demonstrated.

---

## 1. Rule 2 in action — the case that proves it is necessary

`docs/ops/COLAB_RELEASE_GATE.md:70` reads:

> `PASS  Co-Lab boundary gate (33 passed · 0 failed · 0 warned)` — release is safe

A citation of the number, with no provenance and no boundary. A keyword scan flags it.

⛔ **It is not movement.** Line 69 immediately above reads: *"The deploy script **will emit**:"* —
the line documents **future output format**, and nothing relies on it as evidence that any run
occurred.

⭐ **REFERENCE. §6 does not apply.** Two further bare citations (`[RUNBOOK OK] …`, a table row) are
the same species. **Three of the eleven `33 passed` occurrences would have been scored as violations
by a mechanical scan, and none of them is one.**

---

## 2. The conformity census — nine traced reuse events

| # | Source evidence | Source boundary | Downstream carrier | Relation | Boundary status |
|---|---|---|---|---|---|
| **E1** | S3-O1 production witness | ⭐ two evidence classes: **WITNESSED** vs **ENTAILED**, with seven items named as *"Entailed, ⛔ NOT witnessed"* | `CLAUDE.md` priority thread | **MOVEMENT** | ✅ **RETAINED — explicit.** The anchor carries the complete not-witnessed list verbatim, including *"calling it witness is the one move this lane spent the week refusing"* |
| **E2** | Corpus Callosum substrate rows | *"member-facing experiential effect unmeasured"* | `MAIA_WHOLE_ORGANISM_MAP/02_…` | **MOVEMENT** | ✅ **RETAINED AND STRENGTHENED** — restates the limit and adds *"Human evidence. None (class C)"* |
| **E3** | Temporal memory audit F2 | prompt impact *"unmeasured"*; retrieval-stage only | `CLAUDE.md` DIRECTION bullet | **MOVEMENT** | ✅ **RETAINED** — carries *"whether it propagates … into the prompt is **unmeasured** (open question for Phase 2)"* |
| **E4** | Voice-fix gates + live verify | *"NOT YET FALSIFIED BY A MEMBER … Deployed ≠ demonstrated"* | `CLAUDE.md` headline | **MOVEMENT** | ⭐⭐ **STRUCTURALLY RETAINED** — the headline itself reads `VERIFIED LIVE (member falsifier still owed)`. The limit is **inside the assertion**, not appended to it |
| **E5** | WS2-08A production witness | *"deploy established by state evidence; transcript not recovered, non-blocking"* | `CLAUDE.md` closure claim | **MOVEMENT** | ✅ **RETAINED** — parenthetical survives verbatim into the acceptance sentence |
| **E6** | I0.5 disposable-probe `63/63` | *"a probe is not the record"*; canonical verify owed | `CLAUDE.md` (2 citations) | **MOVEMENT** | ✅ **RETAINED AND OPERATIVE** — one citation restates the boundary; the bullet holds `⛔ CANONICAL VERIFY NOT YET ACCEPTED` throughout, so the limit governs both. ⛔ Not scored a loss for non-repetition (rule 1) |
| **E7** | `npm run typecheck` | *"not proof that everything typechecks — proof that nothing got worse"* | 19 programme records | **MOVEMENT** | ⭐ **STRUCTURALLY RETAINED** — the `229 vs baseline 239 · 0 regressions` form keeps the absolute count visible; 17/19 carry it, 2 apparent exceptions are search line-wraps |
| **E8** | W5 Gate B run | vacuity risk (a pass count alone proves nothing about lethality) | `W5-LANDING-02_GATE_B_LANDING` | **MOVEMENT** | ⭐ **STRUCTURALLY RETAINED** — cited as `88 passed · 0 failed · **3 mutants, 3 kills**`, plus cluster and `server_encoding`. The discriminating evidence travels with the count |
| **E9** | Co-Lab check count `33` | ⛔ **derived, never measured** | multiple records, pre-2026-09-06 | ⛔ **PROMOTION** | ⛔⛔ **UNLAWFULLY WIDENED, THEN DISCHARGED.** See §3 |

### E9 in full — the one violation found

```
derived 33 → repeated across records → reads as measured → production run → measured
```

| | |
|---|---|
| **Widening** | ⛔ standing moved from *derived* to *measured* with **no new evidence**. `CLAUDE.md`: *"a total quoted without a run behind it is a **claim, not evidence**"* |
| **Aggravating fact** | the gate named as mandatory (`verify-colab-boundaries.ts`) **never existed**, so the quoted total had no runnable instrument behind it |
| **What licensed the widening** | ⛔ **nothing.** Precisely the repetition/accumulation §6 excludes |
| **Discharge** | ✅ `COLAB_RELEASE_GATE.md:57` — production run on runtime `ca5fdff44`: *"**33 is now measured, not derived**"* |
| **Boundary after discharge** | ✅ **re-declared** — *"the gate remains the `failed` column, never the total"* + scope noted (*read-only, executed in-session via the founder's connected host*) |
| **Verdict** | **§6 violated, then satisfied by evidence of a different kind, with the outer boundary re-stated.** ⭐ Detected and repaired by the project before this lane existed |

### One near-violation, caught pre-publication

⭐ `S3-O1` observations, internal draft: *"An earlier draft said 49, assuming every file on disk was
in the ledger — **the exact assumption this observation exists to question**."* A draft inferred a
figure past the boundary the observation was about; caught before the record was published. ⛔ Not
scored as an event — it never left the record — but it is direct evidence of §6-shaped attention
operating at draft time.

---

## 3. Findings

### F1 · ⭐⭐ Compression did not strip the boundaries

Five of the nine events (E1, E3, E4, E5, E6) move evidence into **`CLAUDE.md`** — the most
compressed, most-read, most-rewritten carrier in the repository, and the one a fresh agent reads
first. **All five preserved the boundary.** E1 carried a seven-item not-witnessed list verbatim into
a summary bullet.

⭐ Counterintuitive and worth stating plainly: **the anchor is where boundaries would be expected to
fall off, and in this sample they did not.**

### F2 · ⭐⭐ The surviving boundaries are *inside* the assertion, not appended to it

`VERIFIED LIVE (member falsifier still owed)` · `229 vs baseline 239 · 0 regressions` ·
`88 passed · 0 failed · 3 mutants, 3 kills` · `(deploy established by state evidence; transcript not
recovered)`.

⭐ In every structural case, the limit is **grammatically inseparable from the claim**. It cannot be
quoted without being quoted. ⛔ This is an observation about the form these boundaries took, ⛔ not a
proposal that any form be adopted.

### F3 · The single violation is the single case with no author attending

⭐ E9 is the only event where the evidence travelled **as a bare number between documents**, with no
author carrying its status. Every compliant case had a human who knew the limit and wrote it
forward — the same asymmetry ACT 6 recorded, now under a ruled standard.

### F4 · Rule 2 was decisive, not decorative

⭐ **3 of 11** `33 passed` occurrences are non-reliant references (runbook output format). A
mechanical scan would have produced a 27% false-violation rate on a single number. ⛔ The
reference/movement distinction is not a refinement; without it the census is wrong.

### F5 · Rule 1 was also load-bearing

E6 and E7 would both have scored as losses under a repetition test — E7 nineteen times over. Both
are compliant: the limitation is recoverable and operative.

---

## 4. ⛔ What this census does NOT establish

- ⛔⛔ **That §6 conformity is high in general.** ⚠️ **The sample is biased and knowably so:** five of
  nine events terminate in `CLAUDE.md`, the most deliberately curated carrier in the repository, and
  the source lanes (S3, I0.5, WS2, W5, the typecheck gate) are those with the strongest evidence
  discipline. **A sample drawn from the best-tended carriers cannot estimate the population.**
- ⛔ **That the one violation rate (1 of 9) is a rate.** Nine events is not a sample frame.
- ⛔ **That uncurated carriers behave the same way.** The 212 root-level files and the 159-document
  architecture corpus were **not sampled**; ACT 1 found 59 root filenames asserting completion with
  no standing metadata at all.
- ⛔ **That agent-authored reuse conforms.** ⭐ **Every event traced was human-authored.** This
  census contains **zero** observations of an agent reusing evidence under §6 — which is the case
  the lane actually cares about.
- ⛔ **That the structural forms in F2 work in general.** Four instances, four different authors,
  no common convention.
- ⛔ **That E9's repair generalizes.** It was caught because a person went and ran the gate.

---

## 5. Standing

```
JARVIS-KP-01 · ACT 8 — §6 CONFORMITY CENSUS ........................ COMPLETE

§6 transfer scope .................................................. ✅ FOUNDER-ADJUDICATED, recorded §0
Reuse events traced ................................................ 9
  retained (explicit) .............................................. 4  (E1 E2 E3 E5)
  retained (structural) ............................................ 3  (E4 E7 E8)
  retained and operative without repetition ........................ 1  (E6)
  unlawfully widened, later discharged ............................. 1  (E9)
Non-reliant references correctly exempted .......................... 3 of 11 on one number
Near-violations caught pre-publication ............................. 1 (S3-O1 draft)
Agent-authored reuse events observed ............................... ⛔ 0

⛔ NO registry · NO parser · NO CLAUDE.md instruction · NO CI checker
⛔ NO .ain extension · NO claim classifier · NO schema · NO citation-format change
⛔ NO record scored for non-repetition · NO movement inferred from citation
⛔ NO source file modified outside this record

ACT CUSTODY ........................................................ ⚠️ NONCONFORMING, DISCLOSED
EMBEDDED SYSTEM CLAIM IN GOVERNANCE ACT ............................ ⏳ REMAINS UNRULED
MECHANISM NEED ..................................................... ⛔ NOT ADJUDICATED

STOP CONDITION: census returned. Awaiting founder adjudication.
```

⭐ **What ACT 8 establishes.** Under the ruled standard, the traced reuse events conform — including
through the anchor, where compression would most plausibly strip a limit. The one violation is the
one case where a figure moved between documents with no author carrying its status, and the project
detected and repaired it by running the instrument.

⛔ **And what it conspicuously does not reach.** Every event traced was written by a person who knew
the boundary. ⭐ **The lane's animating question — whether evidence keeps its limits when an *agent*
reuses it — has now been asked for eight acts and remains unobserved, because no instance of it was
found to observe.** ⚠️ That is not evidence that agents conform, and not evidence that they do not.
⛔ Whether to create the conditions under which it could be observed is not a question this act opens.
