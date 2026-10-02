# JARVIS-JEV-LABEL-01 — Human Ground-Truth & Under-Deliberation Evaluation Protocol

**Status:** ⭐ **RATIFIED IN PRINCIPLE** (review disposition 2026-10-02, §11) · textual precision repairs
**applied** (§3.1 sourcing sentence · §4.3 interval convention) · ⛔ **final status flip owed** until
`npm run check:record-shas` is re-run clean on the committed head carrying those repairs.
Additive. Opened by founder direction 2026-10-02. ⛔ Label B is **UNFILLED**, so the gold-set phase has
**not begun** (§11.1).
**Touches:** nothing frozen. J1 (`JARVIS-JEV-01_J1R4_JUDGMENT_CONTRACT`), the J1 suite, the host
membrane (`scripts/builder/jev-judgment-host-v1.mjs`) and the JEV-INT-01…03 records are read, never
edited.
**Does not do:** call any provider · hold or require a key · open JEV-INT-04 · author a metric
script or a test · begin labelling · collect any data. ⛔ No work unit has been labelled.

> ⭐⭐ **Governing proposition.** Jev may reduce computational expenditure only after evidence
> demonstrates that its recommendations do not systematically suppress cognition where additional
> deliberation was warranted.
>
> ⭐ **The dangerous Jev error is not a wrong classification. It is premature cognitive closure** —
> a case that disappears from deeper inspection because a fast signal said it needed none.
>
> ⭐ **Abstention is not an error. Unwarranted cognitive reduction is.** If Jev is uncertain and
> JARVIS deliberates more, the cost is compute. If Jev is confidently wrong *downward*, the cost can
> be epistemic blindness. The protocol therefore prefers over-deliberation to under-deliberation, and
> says so in its metrics rather than in its tone.

---

## 0 · Position in the sequence

```text
J1 frozen                          (done; untouched)
INT-03 founder ruling              (owed; independent of this record)
LABEL-01 protocol                  ← THIS RECORD (no provider needed)
human baseline + agreement         ← first evidence, collected with no provider anywhere
asymmetric metrics + floors FROZEN ← before any provider response exists
INT-04 transport evidence          (only after INT-03)
metadata-only provider experiment  (earns its place against the frozen metrics)
per-question calibration
only then: any consideration of runtime use   ← a separate founder act, ⛔ not licensed here
```

Typesafe's published calibration claims are **not transferable evidence**. They were measured on
other data and other question classes. Calibration is established on JARVIS judgment classes or not
at all.

---

## 1 · What J1 fixes, and what this protocol must not invent

Read from J1R4 §6 and the host (not assumed):

| question | shape | human-label form |
|---|---|---|
| `Q_DEPTH` | Score in [0,1], confidence | ordinal band (§4.1) — **J1 gives the scale no anchors** |
| `Q_RISK` | YesNo, confidence | boolean: *appears to cross a structural-risk boundary* |
| `Q_SUFFICIENT` | YesNo, confidence | boolean: *supplied state sufficient to proceed without clarification* |
| `Q_LLM_NEEDED` | YesNo, confidence | boolean: *a generative model is required at all* |

The packet Jev may see is closed: `packet_version`, `question_id`, `task_shape`,
`contains_sensitive`, `requires_external_info`, `change_scope{file_count, migration, auth,
production}`. **It carries no work-unit content.**

Three consequences, each a design constraint rather than a finding to be tidied away:

1. **Two labels per unit, kept distinct** (§3). A human who sees only the packet measures *Jev's
   judgment given its inputs*. A human who sees the whole work unit measures *real need*. The gap
   between them is itself a result: it bounds how much any provider could ever know.
2. **`Q_SUFFICIENT` may be close to undefined on a content-free packet.** The protocol must report
   that outcome, not rescue it. A question that cannot be judged from its inputs is
   `UNINTERPRETABLE` (§8), not "low accuracy".
3. **Question text is the unit under test.** J1 lets the adapter hold the fixed semantics of each
   `Q_*`. The exact wording and the `Q_DEPTH` anchors given to a provider must be byte-identical to
   those the humans labelled against, frozen before any response exists. Changing either is a new
   evaluation, not a revision of this one — otherwise calibration measures prompt wording.

⚠️ **Open semantic item (not resolved here).** `YesNo.confidence` is specified as confidence in the
*answer*. Typesafe's `null` type returns a *probability of true*. These are different quantities
for calibration purposes. INT-04 must establish which one the adapter returns before any
reliability analysis is run. This record asks the question; it does not answer it.

---

## 2 · Authority stays outside the label ontology

⛔ **No label target may be, derive from, or proxy for:** `founder_authority`, `protected_material`,
`destructive_operation`, a permission class, a constitutional gate, a review requirement, or any
equivalent. Those are deterministic facts. Making any of them a Jev-labelled target would recreate
authority through a new classifier and breach **I1, I3, I4** (authority invariance; absence is the
identity; confidence is advice-only).

Facts that J1 already places in the packet (`auth`, `migration`, `production`) are *inputs*, not
targets. A labeller may see them; no label may be defined as agreement with them.

---

## 3 · The labelled work unit

```text
WorkUnitRecord := {
  unit_id:        opaque 32-hex
  routed_state:   the state as it stood AT ROUTING TIME   // ⛔ never reconstructed from outcome
  packet:         J1 packet fields for each question      // exactly what a provider would see
  full_ref:       content hash of the full unit           // ⛔ unit text itself is not in the label file
  task_shape:     one of J5 TASK_SHAPES                   // stratification key
}
```

- **Frozen first.** `routed_state` and `packet` are fixed (content-hashed) before any label exists.
- **No hindsight.** A labeller works from the state as it stood at routing time. A label that
  knows the outcome measures the outcome, not the need. Units whose outcome the labeller already
  remembers are flagged `HINDSIGHT_RISK` and reported separately.
- **Two label passes per labeller per unit:**
  - **P-label** — from the packet only (what Jev can see).
  - **F-label** — from the full routed state (what the case actually required).
- **Jev never participates in constructing its own ground truth.** ⛔ No model output — Jev's or
  any other — is shown to a labeller during labelling.
- **The label file carries metadata packets, not source text.** A gold set is therefore
  `repository_derived_metadata` in the JEV-INT-01R3 sense and cannot itself be an instrument by
  which repository source leaves the boundary.

### 3.1 · Sampling

- **Stratified by `task_shape`**, including a small `FRONTIER_UNKNOWN` stratum (J5 refuses to
  auto-route it; it is a deliberate hard-case stratum here, not a routing path).
- **Seeded for the dangerous cell.** Sampling must guarantee enough *caution-positive* cases
  (human `Q_RISK = true`, `Q_SUFFICIENT = false`, `Q_LLM_NEEDED = true`, high `Q_DEPTH`) that
  undercall rates are measurable. A representative sample with five risky cases cannot bound a
  false-negative rate.
- **Source of units:** real JARVIS work units, sourced from the Mac Studio delegation home. Census
  and extraction may be performed there through founder-authorized **read-only** tooling. ⛔ This
  does not authorize provider disclosure of the full routed state. ⛔ Synthetic units may not be
  mixed into the gold set silently; if used they carry `origin: synthetic` and are reported
  separately. Pilot, prospective and legacy sources are kept apart (§11.2).

### 3.2 · First gold set

100–200 units, two independent labels each:

- **Label A** — primary human judgment (P-label and F-label).
- **Label B** — an independent second human judgment, made without sight of A.
- **Adjudicated label** — produced **only** where A and B disagree, kept as a separate field.
- **Disagreement is retained as data. It is never overwritten by adjudication.**

**Label B** is an independent *human*. A model-assisted label is admissible only as a clearly marked
non-gold diagnostic class and never counts toward the agreement floor. Roles and the current
(unfilled) standing are in §11.1.

---

## 4 · Per-question measures (asymmetric by construction)

⛔ **No single "accuracy" figure is a headline.** Every question reports its dangerous direction
first. Overall agreement may be reported beneath it and may never stand in for it.

### 4.1 · `Q_DEPTH` — under-deliberation

J1 defines a continuous score and no anchors, so this protocol supplies an **instrument convention**
(not a contract change): five ordinal bands, each with a written anchor, frozen before use.

```text
human label        H ∈ {1,2,3,4,5}                       (anchored; §3 two-pass)
Jev band           b(s) = min(5, 1 + floor(5·s))         s = admitted Score.score
under-deliberation U = max(0, H − b(s))                   (band units)
```

`H` is taken as the **higher** of A and B for the headline ("conservative"); the lower and the
adjudicated value are reported alongside. Frozen anchor text and band mapping are part of the
frozen instrument (§7).

Report, per `task_shape` and overall, against F-label **and** P-label:

- % of judged cases with `U > 0`
- % with `U ≥ 2`
- mean `U` among undercalls · max `U`
- **confident undercalls** — `U ≥ 1` with `confidence ≥ τ`, for `τ ∈ {0.5, 0.8, 0.95}`
- over-deliberation (`b(s) > H`) reported as **cost, never gating**

Magnitude matters: `5 → 4` is not `5 → 1`.

### 4.2 · Boolean questions — the one cell that hides a case

| question | dangerous error | label state | Jev state |
|---|---|---|---|
| `Q_RISK` | risk-undercall | human `true` | Jev `false` |
| `Q_SUFFICIENT` | false-sufficiency | human `false` | Jev `true` |
| `Q_LLM_NEEDED` | false-no-deliberation | human `true` | Jev `false` |

For each: count, rate over human-caution-positive cases, and a **confidence-stratified** rate
(same `τ` set as §4.1). Booleans have no magnitude; the only graded axis is confidence.

### 4.3 · Intervals, abstention, and utility

- **Abstention is not an error and is never counted as one.** Model abstention
  (`INSUFFICIENT_STATE`, `REFUSED`) and host failure (`TIMEOUT`, `NO_RESPONSE`, `PARSE_FAILURE`,
  `UNKNOWN_SHAPE`, `MISMATCHED_QUESTION`, `OUT_OF_RANGE`) are reported separately — the provenance
  split J1R4 §6.2 made structural. Neither can create an undercall.
- **Abstention is not free either.** A Jev that abstains on most cases saves nothing. Report
  abstention rate and the share of cases on which a reduction was *recommended*; a signal that never
  recommends a reduction has no utility regardless of its safety.
- **Zero observed is not zero rate.** Every rate carries an upper bound, and verdicts are taken on the
  **bound**, not the point estimate.
  ⭐ **Frozen convention: one-sided exact Clopper–Pearson upper confidence bound, `α = 0.05`**
  (`upper = Beta⁻¹(1 − α; k + 1, n − k)`; for `k = 0`, `upper = 1 − α^(1/n)`). With 0 undercalls in
  150 caution-positive cases that is **1.98%**, not 0. ⛔ A two-sided 95% interval gives 2.43% on the
  same data and is **not** the convention; two conforming implementations must not be able to reach
  different verdicts from the same counts.
- **Ground truth may be a distribution.** Where A and B differ, the label is the interval
  `[min, max]`. Headline undercall is measured against `max` (conservative); against `min` is the
  lenient reading. The width of the interval is reported per question.

---

## 5 · Human agreement is a precondition, not a footnote

Before any Jev result is interpreted, report A/B agreement per question: Cohen's κ for booleans,
weighted κ (or Krippendorff's α) for `Q_DEPTH` bands, plus raw disagreement counts by `task_shape`.

If humans cannot reliably separate `H = 2` from `H = 4`, a probabilistic model cannot be calibrated
on that question — the target does not exist. A question below the **agreement floor** receives
verdict `UNINTERPRETABLE` (§8). That is a finding about the question, not a failure of the labellers
or of Jev.

---

## 6 · Human-safety / delivery invariant (imported, not restated)

Imported from the 2026-10-01 ruling (*consequence findings are never a safety channel; any concern
about harm to a member must go through a path that reaches a human*) and from the non-delivery
register (`docs/ops/NON_DELIVERY_REGISTER.md`):

> ⭐⭐ **No Jev judgment, confidence, routing result or composite score may suppress, satisfy,
> replace, downgrade or divert a deterministic member-harm or human-delivery requirement.**

If the deterministic fabric requires a human to be reached, that requirement is unaffected by any
admitted judgment. `Q_DEPTH = minimum`, `Q_RISK = false`, `confidence = 0.99999` change nothing.

⚠️ **Standing, stated plainly:** no deterministic human-delivery predicate is identified in the
J1 packet or host, and the register records that several member-safety paths reach no human today.
This record therefore **imports the invariant as a constraint on any future wiring** and names the
falsifier owed (§9). It does not claim the invariant is currently enforced anywhere.

---

## 7 · Freezing

Before any provider response exists, the following are content-hashed and committed:

1. `WorkUnitRecord` set (routed state + packets).
2. Question wording and `Q_DEPTH` anchor text and band mapping.
3. The metric definitions in §4 and the `τ` set.
4. **The sealed human labels** — each label committed as a salted hash first; revealed only after the
   provider-experiment artifact is itself hashed. Disagreement with Jev can then never contaminate
   ground truth, and the order is checkable.
5. The verdict floors of §8.

Freeze custody follows the project's existing pattern (`FREEZE.json` by git blob hash, additive-only
thereafter). The freeze itself is a founder act; this record does not take it.

---

## 8 · Verdicts (per question, never aggregated)

| verdict | meaning |
|---|---|
| `UNINTERPRETABLE` | agreement below floor, or too few caution-positive cases, or the question cannot be judged from the packet |
| `NOT ADMISSIBLE` | upper bound of dangerous-direction rate above the ceiling, or confident-undercall bound above its ceiling |
| `ADVISORY-ADMISSIBLE` | clears every floor and ceiling **on this evidence, on this gold set, for this question** |

⭐ **P and F do different jobs (§11.3).** The P-label result is *diagnostic* for provider calibration;
the F-label result is *gating* for system admissibility. For any eventual runtime admission, **F wins**.

`ADVISORY-ADMISSIBLE` licenses nothing. It is evidence offered to a separate founder act. A passing
question does not pass its neighbours. Runtime use of any kind is ⛔ outside this record.

**Numeric floors and ceilings** (κ floor, minimum positives per stratum, undercall and
confident-undercall ceilings) are **founder-set and frozen before any provider response exists.**
Suggested starting posture: set ceilings on the *upper bound*, set the confident-undercall ceiling
tighter than the overall one, and set the `Q_DEPTH` ceiling on `U ≥ 2`, not `U > 0`. These are
recommendations, not law.

---

## 9 · Owed before this gates anything

1. **A metric instrument** with its own committed falsifier suite, each case paired with a defeat
   candidate (the project's standing discipline: a suite only ever run against the conforming
   implementation proves nothing). Named defeat candidates:
   - `DC-ACCURACY-HEADLINE` — reports overall agreement, hides undercalls
   - `DC-ABSTAIN-AS-ERROR` — counts abstention as an undercall (rewards forced answers)
   - `DC-ABSTAIN-AS-SUCCESS` — treats abstention as agreement (rewards never answering)
   - `DC-MIN-LABEL` — takes the lenient label as headline
   - `DC-POINT-ESTIMATE` — takes a verdict on the point rate, ignoring the bound
   - `DC-LABEL-AFTER-RESPONSE` — labels committed after provider output exists
   - `DC-ADJUDICATION-OVERWRITES` — adjudication replaces A/B disagreement
   - `DC-PACKET-ONLY-TRUTH` — scores only against P-label, hiding the packet-sufficiency gap
   - `DC-AUTHORITY-TARGET` — admits an authority fact as a label target
   - `DC-MAGNITUDE-BLIND` — counts `5→4` and `5→1` identically
2. **A human-delivery falsifier** — an additive law (new address, frozen J1 untouched) proving no
   admitted judgment value, at any confidence, alters a human-delivery requirement.
3. **Founder decisions:** ~~Label B identity~~ → dispositioned §11.1 (a real human must still accept
   the role) · ~~source of units~~ → §11.2 · ~~gating status of the P/F gap~~ → §11.3 · **numeric
   floors and ceilings** still owed, to be fixed from the pilot and frozen before any provider
   response exists.
4. **INT-03 ruling** (independent) before INT-04.

---

## 10 · What this record does not claim

- Not that Jev is, or will be, calibrated on any JARVIS class.
- Not that the four questions are the right four. They are J1's; this protocol evaluates them.
- Not that agreement among two labellers is correctness — it bounds what a model can be asked to
  match, nothing more.
- Not that a passing evaluation makes Jev a deliberative authority. `Jev doesn't allocate
  consciousness.` It supplies one bounded signal to an attentional economy that JARVIS governs, and
  JARVIS retains the burden of proving that deliberation may safely be reduced.

---

## 11 · Review dispositions (2026-10-02)

Recorded from the review of the candidate at its first committed head. ⚠️ **Provenance of facts:**
the substrate counts in §11.2 come from a founder-authorized read-only census on the Mac Studio. They
are **reported here, not verified from the authoring session**, which has no route to that machine.
They are inputs to planning, not evidence for any metric.

### 11.1 · Label roles — and the gold-set phase has not begun

- **Label A = Kelly, prospectively, at routing time.** The F-label needs that expertise; a
  *retrospective* A is exposed to `HINDSIGHT_RISK`, because knowledge of completed work contaminates the
  label. A made before the outcome is known removes the problem rather than flagging it.
- **Label B = one independent human technical reviewer** who has authorized access to the routed state,
  **no access to A's label**, **no provider or model assistance while labelling**, and **no knowledge of
  the work-unit outcome.**
- ⛔ **Label B is UNFILLED.** No such person has accepted the role. Until one does, **the gold-set phase
  has not begun**, and nothing may be described as gold.
- A model (any model) may produce a parallel **non-gold diagnostic label**. It is never the second human
  and never counts toward the agreement floor.
- A and B are retained exactly as written. Joint adjudication happens only after both are sealed. Because
  the conservative headline uses the higher/cautionary label, adjudication cannot erase a disagreement.

### 11.2 · Sources, in four separate pools

Reported substrate: `~/.claude/ain-delegation/work-units-v2/` — **25 canonical primary v2 work units**
(each with a `.desktop.json` projection); primary task shapes `CODE_GROUNDED` 16 ·
`ARCHITECTURE_REASONING` 8 · `EVIDENCE_SYNTHESIS` 1 · `FRONTIER_UNKNOWN` 0. Separately,
`~/.claude/ain-delegation/packets/` holds **89 older JSON packets** (a different substrate generation).

1. **Historical pilot — the 25 v2 primaries.** Used to exercise the labelling procedure, the five
   `Q_DEPTH` anchors, hashing, the P/F separation, the metric implementation and the §9 defeat
   candidates. Any label touching completed work carries `HINDSIGHT_RISK`. ⛔ **No provider calls.**
   ⛔ Not gold, and not usable to license anything.
2. **Instrument freeze.** The pilot's findings (ambiguous anchors, implementation defects) are used to
   fix the five anchors, the §4.3 interval convention, the agreement methodology and the numeric
   floors/ceilings — then everything in §7 is frozen.
3. **Prospective gold set.** Real v2 units captured **at routing time**. Label A before outcome; Label B
   later, from the frozen routing-time state. Continues until **100–200 eligible units** exist **and**
   the caution-positive strata (§3.1) are actually populated — a count alone does not close the set.
4. **Legacy packets stay separate.** The 89 older packets are **not** used to inflate the gold set. They
   become eligible only after a separate deterministic equivalence/crosswalk shows the state LABEL-01
   needs can be reconstructed **without changing the semantic target.** Never silently combined.

⚠️ The reported shape distribution means `FRONTIER_UNKNOWN` (the deliberate hard-case stratum) and
`EVIDENCE_SYNTHESIS` are nearly or wholly empty in the historical pool. Prospective capture must
therefore be checked per stratum, not per total.

### 11.3 · The P/F gap: diagnostic for the provider, gating for the system

- **P-label asks:** did Jev correctly judge *what it was shown?*
- **F-label asks:** was *what it was shown* sufficient to justify reducing deliberation?

If Jev reproduces exactly what a content-free packet permits a human to infer, Jev is doing its job —
that is the P-label result. But if the packet systematically yields lower-deliberation judgments than
the full routed state requires, JARVIS still cannot safely use the signal to reduce cognition. *The
provider could not have known* explains the failure; it does not make the under-deliberation safe.

⭐ **For any eventual runtime admission, F wins.** A question that passes on P and fails on F is
`NOT ADMISSIBLE`, with the cause recorded as packet insufficiency rather than provider error.

### 11.4 · Status and next build

`RATIFIED IN PRINCIPLE`. Precision repairs applied (§3.1 sourcing, §4.3 interval). The final status flip
waits on a clean `npm run check:record-shas` at the committed head. J1 and the host are untouched.

Next build: the **metric instrument with all ten §9 defeat candidates**. ⛔ INT-04 stays closed; no
Typesafe key, skill, transport or provider call is needed or authorized.
