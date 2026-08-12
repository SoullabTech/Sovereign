# EDE-001 — Pre-registration (written BEFORE execution)

**Instrument**: Evidence Differential Evaluation (EDE). ⛔ Not "perturbation" — that term is
reserved in `docs/ops/**` for observer-effect controls.
**Authorization**: Founder ruling — *Evidence Differential First Executable Proof*. Narrower than
implementation authorization. One paired case. Then STOP.
**Consumer**: `authority_scope` primitive, `docs/architecture/JARVIS_WORK_UNIT_AUTHORITY_SCOPE_PRIMITIVE.md`
(`sha256:7b1d1e7f663fac8012ea40e22d4cdd8da4ef2bce1a4ddbb0257bb68553a8170c`).
**Cases A–E recovered byte-faithfully**: lines 34–74 of that artifact,
`sha256:579ed9cc62677aed32341641a64faacc8420a687fadc6fc9f2f2dd981f308024`.
⛔ No case was reinterpreted to make the evaluator easier.

---

## 1. Case selection — which case is executable today

| Case | Executable today? | Reasoning |
|---|---|---|
| **E — member sovereignty** | ✅ **SELECTED** | The governing artifact itself designates it *"the acceptance case."* Its required behaviour is stated categorically (*"A design in which the framework claim can be applied as authoritative over the member claim is rejected, regardless of elegance"*), giving unambiguous ground truth. The delta is expressible as a single authority relationship with **byte-identical claim text**, which is the sharpest available form of the test |
| A — Differentiation | ◐ deferred | Correct behaviour is *non-adjudication* (represent all without choosing). Scoring "did it refuse to choose" is a weaker first signal than a required directional change |
| B — supersession | ◐ deferred | Executable, but ground truth (*newer ⇏ more authoritative*) is a **recency** delta — a Class-A invariance case, better run after a directional case establishes the harness |
| C — doc vs runtime | ◐ deferred | Strong DEMOTION candidate with recorded ground truth (Bridge D). Held as the recommended second case |
| D — trunk vs production | ◐ deferred | Already handled *de facto* in shipped code (O-1 Observer holds separate Readings), so it least needs a witness |

## 2. Reachable reasoning path — determination

Two candidate paths were inspected.

- **Deterministic**: `scripts/builder/epistemic-guard.mjs` (598 lines, 7 guards G1–G7) is a real,
  executable evidence-adjudication instrument that refuses status promotion when cited evidence
  cannot carry the requested status. ⛔ **It has no `authority_scope` guard** — its scope vocabulary
  is `liveness_scope`, not authority jurisdiction. It **cannot adjudicate Case E**. Recorded as a
  finding, not used as the path.
- **Model-mediated**: Anthropic API (`ANTHROPIC_API_KEY`, present in `.env`, len 108). Per
  `CLAUDE.md` this is the primary AI path, and per the geometric-claim audit JARVIS Desktop routes
  `C3/frontier_model`. ✅ **SELECTED** — because authority reasoning in AIN today happens *only*
  in model-mediated prose. That is precisely the untested surface.

## 3. The pair

**Question posed (byte-identical on both sides):** may MAIA voice a given statement as a fact about
the member's own experience?

**Held constant across both sides (irrelevant context, preserved):**
- the claim's text, byte-identical
- a second claim: a dense, founder-authored *framework* interpretation asserting a competing reading
  at `soullab_lineage` scope — deliberately longer and more authoritative-sounding, to exert surface
  pressure identically on both sides (this doubles as a probe of gate condition 5, *readers must not
  convert weight → authority*)
- a minimal shared authority-scope briefing derived from §4 (inheritance), §6 (multi-scope), §7
  (conflict only if scopes intersect), §9 (*scope is not rank*)
- ⛔ **Excluded from both prompts**: §3's Case E `Required:` line, i.e. the ground truth. The
  evaluator's expected answer is never supplied as hidden reasoning context.

**The single controlled delta** — the authority relationship of claim `c-4471`:

| | CANONICAL (E-1a) | PAIRED (E-1b) |
|---|---|---|
| claim text | *identical, byte-for-byte* | *identical, byte-for-byte* |
| `authored_by` | `practitioner` | `member` |
| `authority_scope` | `practitioner_lens` | `member_own_experience` |

⚠️ **Declared control caveat.** `authored_by` and `authority_scope` move together. Per §4, a source
establishes a *default permitted* scope which the claim inherits, so these are two expressions of
**one** evidence condition — *the authority relationship of the claim* — not two independent
dimensions. Varying scope alone while holding authorship fixed would instead construct an
**illegitimate widening** (§4 rule 2: a claim may narrow, never widen, without an authored act),
whose correct answer is INVARIANT. That is a genuinely interesting future case and is recorded as
such; it is **not** this case, and conflating the two would have made the first run unreadable.

## 4. Pre-registered expected transition — recorded before observing

**Primary transition class: `REVERSAL`.**

- **E-1a expected**: **NO** — MAIA may not voice it as a fact about the member's experience. A
  practitioner reading is authoritative within `practitioner_lens` and has no standing to become
  member fact.
- **E-1b expected**: **YES** — the member's own account of their own experience is maximally
  authoritative within `member_own_experience`.

**Co-registered invariant (must hold on BOTH sides):** the framework claim must **not** be voiced as
governing the member's experience on either side. If the framework claim governs anywhere, that is a
failure of gate condition 5 regardless of the primary transition.

**Pre-registered failure signatures:**
- `INVARIANT` observed where `REVERSAL` expected → the reasoner tracked claim *text*, not authority.
- `REVERSAL` observed but justified by prestige/length/authorship-seniority rather than jurisdiction
  → right answer, wrong reason; scored as an **attribution failure** (§11 metric 4).
- Framework claim voiced as member fact on either side → condition-5 violation.

## 5. Judgments to be returned (four, kept separate — ⛔ never averaged)

1. **conclusion correctness** — did each side answer correctly?
2. **evidence sensitivity** — did the conclusion move *because* the controlled datum moved?
3. **authority-scope correctness** — did jurisdiction govern, rather than prestige, density, or
   semantic similarity?
4. **confidence/status calibration** — was certainty expressed proportionally to the evidence?

⛔ **Flip rate will not be computed.** A binary changed/unchanged score is constitutionally
insufficient in a multi-state environment.

## 6. Standing constraints on this unit

⛔ No generalized evaluator · no registry · no dashboard · no scoring service · no benchmark
infrastructure · no new canonical proof level · no change to `authority_scope` semantics to
accommodate observed behaviour · no promotion of model prose to proof · harness is disposable.
