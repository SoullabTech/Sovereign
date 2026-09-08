# SEL-0 · R1 · R2 · R3 — acceptance instrument · **FROZEN**

**FROZEN by founder act, 2026-09-08.** Q9 · Q10 · Q11 ratified. No threshold or analytic
choice may change from this point; see the rerun bar in R3 and the contamination rules below.

**Governing contract**: RATIFIED at `ebcb46d0d`. Not reopened; no contradiction found.
**Preserved**: lawful `n = 19` · top-k DISCHARGED · full-set rank correlation · founder blind
INTACT · Manifest B NOT OPENED · selector NOT IMPLEMENTED · threshold UNSET.

Nothing ranked. No provider called. Manifest B, Manifest C and the source snapshot not
opened. All numbers below are from **synthetic tier structures**, never from the corpus.

---

## R1 · Statistical decision rule

### R1.1 The statistic — and why the raw one does not work

The predeclared direction is full-set rank correlation. The founder responds in **ordered
tiers** (R2), the selector emits a **total ordering**, so the tie-aware member of that
family is **Kendall's tau-b**.

⚠️ **Raw tau-b cannot carry an absolute effect floor, and this is not a matter of taste.**
Its maximum attainable value depends entirely on the founder's tier structure:

```text
tau_max = sqrt(U / n0)          n0 = 171 pairs      U = founder-untied pairs

tiers      U     tau_max
1/3/15    63      0.607
2/4/13    86      0.709
3/5/11   103      0.776
5/6/8    118      0.831
6/7/6    120      0.838
8/8/3    112      0.809
```

A perfect selector scores 0.607 under one founder response and 0.838 under another. Any
fixed tau-b threshold would therefore be a different test depending on how the founder
happened to tier — decided *after* the threshold was frozen, which is precisely what the
freeze exists to prevent.

**Proposed primary statistic — tau-b normalised by its attainable maximum:**

```text
D = tau_b / tau_max = (C - D_pairs) / U
```

This is exactly **Somers' D** with the founder's tiers as the tie-adjusted variable. It is
not a departure from the predeclared family — it is tau-b divided by a constant fixed by the
founder's own response — and it has a plain reading:

> **Of the pairs where the founder actually expressed a preference, what net fraction did
> the selector order correctly?**

Ceiling is always 1.0, so an effect floor means the same thing under every tier structure.
Raw tau-b is reported alongside, never as the decision variable.

⛔ NDCG, top-k overlap and precision@k are **not** proposed and were not substituted.

### R1.2 Why it measures the frozen construct

The construct is *which lawful observations are worth raising first*. Top-weighting is
carried by **R2's response protocol, not by the statistic**: the founder is never asked to
discriminate in the tail, so tail pairs are tied and contribute nothing. A weighted tau
(hyperbolic, Vigna) was considered and rejected — it would impose a second, arbitrary
weighting on top of the founder's own refusal to discriminate, and its tie handling at
n=19 is not well characterised. **Putting the emphasis in the response rather than the
metric keeps the statistic simple and the judgment where the authority is.**

### R1.3 Null hypothesis, tail, exact rules

```text
H0   the selector's ordering is independent of the founder's tiering
H1   positively associated                       ONE-SIDED, upper tail
     (a negative result is not "anti-selection" evidence at n = 19;
      it is failure, and the sign is not separately interpreted)

null distribution   PERMUTATION, conditioned on the REALISED tier structure
                    permute the selector ordering; hold founder tiers fixed
                    -> tie structure preserved exactly
```

Conditioning is **mathematically required, not a convenience**: D's null varies with
structure (p95 from 0.367 at 6/7/6 to 0.524 at 1/3/15). A tabulated null would be wrong.

```text
PASS          p <= 0.05  AND  D >= 0.60  AND  U >= 60
INCONCLUSIVE  p <= 0.05  AND  D <  0.60          significant but weak
              or  0.05 < p <= 0.20
              or  U < 60                          insufficient founder dispersion
FAIL          p > 0.20   AND  U >= 60
```

### R1.3a What `D >= 0.60` actually means — recorded so it cannot be misread

With a **total** selector ordering every founder-discriminated pair is concordant or
discordant, so `C + Dp = U` and therefore

```text
D = (C - Dp)/U = 2(C/U) - 1        =>   concordance C/U = (D + 1)/2

D 0.50  ->  75% of founder-discriminated pairs ordered correctly
D 0.60  ->  80%
D 0.70  ->  85%
```

⚠️ **`D >= 0.60` is NOT "right 60% of the time." It is at least 80% concordance on the
comparisons the founder actually chose to make.** Verified numerically, not asserted.
Recorded here because a future reader seeing `0.60` will otherwise assume the weaker claim.

**Measured joint PASS power**, against a synthetic "genuinely good selector" (tier signal
plus noise, sd 0.75), 40 000 draws per cell:

```text
tiers     floor .50   .60   .70
1/3/15         0.85  0.75  0.60
2/4/13         0.92  0.83  0.62
3/5/11         0.95  0.85  0.67
5/6/8          0.97  0.89  0.68
6/7/6          0.97  0.88  0.68
8/8/3          0.93  0.81  0.57
```

Floor 0.70 costs roughly a quarter of the power at n=19; floor 0.50 licenses a selector
that gets only half the discriminated pairs net-right. **0.60 is the proposed balance and
is the single number most in need of founder judgment — see Q9.**

⚠️ **Honest power statement, recorded so it cannot be forgotten at reveal.** At n=19 this
instrument can separate *clearly good selection* from *no evidence of selection*. It
**cannot** establish that selection is moderately good. INCONCLUSIVE is a likely and
legitimate outcome and must not be read as either success or failure.

### R1.4 Treatment of `DECLINE_TO_SELECT` — adjudicated, never scored

A decline yields no ordering, so no correlation exists. Folding it into D would require
inventing ranks — manufacturing the data the freeze exists to prevent.

```text
founder NONE_WARRANTS_RAISING_NOW  +  selector DECLINE    CONCORDANT RESTRAINT
founder tiers (T1 or T2 non-empty) +  selector DECLINE    MISSED
founder NONE_WARRANTS_RAISING_NOW  +  selector ORDERING   OVER-EAGER
founder tiers                      +  selector ORDERING   -> run the statistic
```

⚠️ **CONCORDANT RESTRAINT is not a PASS of SEL-0.** It passes the restraint contract and
leaves the ranking question **unanswered** — one run, one bit. The primary result in that
case is INCONCLUSIVE. MISSED and OVER-EAGER are contract failures and are reported as such,
not converted into a score.

### R1.5 Uninformative founder response

```text
U = 0            every observation in one tier — no preference expressed
                 D undefined -> INCONCLUSIVE, no statistic computed
U < 60           too few discriminated pairs for the power above
                 INCONCLUSIVE (predeclared now, before any response exists)
T1 and T2 empty  == NONE_WARRANTS_RAISING_NOW -> R1.4 decline table
```

`U >= 60` is predeclared **now** precisely so it cannot be adjusted once a response exists.

### R1.6 The two deterministic gates are not in the statistic

```text
NO_LAWFUL_CANDIDATE                     contract test, deterministic
NO_REMAINING_CANDIDATE_THIS_COMMISSION  contract test, deterministic
```

Verified by asserting the gate fires on a constructed empty / fully-offered candidate set.
Neither enters D, the null, or the decision rule.

---

## R2 · Response protocol

### R2.1 Ordered tiers, never a forced total order

```text
T1  raise now          — clearly worth opening with
T2  worth raising      — but not first
T3  not worth raising now
```

Every lawful observation goes in exactly one tier. **No ordering within a tier.** The
founder is never asked whether item 14 beats item 15; that distinction would be
manufactured, and manufacturing it would attenuate the correlation and bias the result
toward "no ability".

### R2.2 Empty tiers

Permitted, and informative. Forcing a non-empty T1 would manufacture the very preference
the instrument is supposed to detect.

### R2.3 `NONE_WARRANTS_RAISING_NOW` is derived, not a separate control

```text
NONE_WARRANTS_RAISING_NOW  ==  T1 empty AND T2 empty
```

Derived rather than offered as a second button, so one state has exactly one encoding —
two encodings of one state is how the roadmap §2/§4 divergence happened.

### R2.4 Declared response-format asymmetry

```text
FOUNDER    3 ordered tiers · ties within tier · empty tiers permitted
SELECTOR   total ordering + confidence, OR DECLINE_TO_SELECT
```

**This asymmetry is declared here, before Manifest B is opened, and does not inherit
legitimacy from the already-ruled stimulus asymmetry.** It is lawful on its own terms
because: tau-b/D are defined for exactly this shape (ties on one side); the null is
permuted against the realised structure, so the asymmetry is inside the null rather than
unmodelled; and the comparison is over founder-discriminated pairs only, so the selector is
never charged with distinctions the founder declined to make.

The selector is **not** asked to tier. Forcing symmetry would either cripple the selector's
output or force founder distinctions — both worse than a declared asymmetry.

---

## R3 · Reproducibility freeze

```text
statistic        D = (C - Dp) / U   over founder-untied pairs
                 C  = concordant pairs, Dp = discordant pairs
                 U  = pairs with distinct founder tiers = n0 - n2
                 n0 = n(n-1)/2 = 171          n2 = SUM_t |t|(|t|-1)/2
                 tau_b = D * sqrt(U / n0)      reported, not decisive
n                19
response         R2.1 · three tiers · ties within · empty permitted
tie handling     founder-tied pairs contribute 0 and are excluded from U
weighting        NONE — emphasis lives in R2, not the metric
permutation      permute selector ordering; founder tiers HELD FIXED
draws            1 000 000
RNG              numpy PCG64, seed 20260908           (frozen here, before any response)
tail             one-sided upper
p-value          (1 + #{D_perm >= D_obs}) / (draws + 1)
                 add-one Monte Carlo permutation p-value — VALID / CONSERVATIVE,
                 never reports zero. NOT an unbiased estimator of the true p;
                 it is slightly upward-biased, which is why it is conservative.
MC tolerance     +/- 0.0005 at p = 0.05; a p within tolerance of a boundary
                 resolves to the LESS favourable side
extraction       R1.3 verbatim
reference impl   the closed forms above are normative. scipy 1.17.1
                 kendalltau(variant='b') is a CROSS-CHECK only; if it disagrees
                 with the normative formula, STOP and report — do not pick one
```

⛔ **One run. One seed. One draw count.** A rerun with a different seed or draw count
because the first result was inconvenient is forbidden, and any rerun for any reason must
be disclosed with both results. Neither thresholds nor analytic choices may change after
the ranking is seen.

---

## Anti-contamination sequence — frozen

```text
1  acceptance instrument frozen                    <- founder act, not yet taken
2  selector implemented and locked, WITHOUT access to founder answers
3  founder ranking performed ONCE and locked
4  locked selector measured ONCE
5  compare under the frozen rule
```

### After a failed or inconclusive first run

⛔ **The corpus is spent as a blind instrument the moment Manifest B is opened.** Any later
run against the same 19 observations measures fitting to a known answer, not selection, and
may not be called a fresh blind acceptance run whatever is changed in between.

Retesting after implementation changes requires **new independent evidence**:

```text
a new frozen corpus from a later developmental reading — new observations,
  new Step-0 freeze, new F-7 adjudication
a fresh founder response, blind, under this same frozen instrument
the instrument itself unchanged, or changed only by a recorded founder act
  that predates seeing the new corpus
```

Diagnostic re-runs against the spent corpus are permitted **only** when labelled
DIAGNOSTIC and explicitly barred from closing the product gap.

---

## Internal adequacy review

```text
statistic defined for the declared response shape        yes — ties one side
null matches the exact protocol                          yes — conditioned, permuted
effect floor structure-independent                       yes — ceiling always 1.0
decline representable without manufacturing data         yes — adjudicated, R1.4
gates excluded from the statistic                        yes — R1.6
degenerate response handled predeclared                  yes — R1.5
power measured, not assumed                              yes — R1.3 table
seed and draws fixed before any response exists          yes — R3
multiplicity                                             none — one test, one run
```

**One adequacy limit, stated rather than hidden:** a single run at n=19 gives no replication
and no variance estimate on the selector itself. A PASS licenses *acceptance eligibility*,
which is what the contract asks of it — not a claim that the capability is robust.

---

## Founder rulings — Q9 · Q10 · Q11 · RATIFIED 2026-09-08

**Q9 — RATIFIED.** Somers' D is the decisive full-set rank-correlation statistic. Kendall
tau-b is reported alongside diagnostically but does not decide acceptance. D is used because
it normalises the attainable ceiling created by founder ties while remaining inside the
predeclared rank-correlation construct.

**Q10 — RATIFIED.** Effect floor `D >= 0.60`; minimum founder dispersion `U >= 60`. At
`D = 0.60` a total selector ordering is concordant on **80%** of founder-discriminated
pairs. `U < 60` yields INCONCLUSIVE — *the founder is not required to manufacture additional
distinctions to satisfy the statistic.* The instrument serves the judgment; the judgment
does not serve the instrument.

**Q11 — RATIFIED.** Significance is `p <= 0.05`, one-sided, under the frozen conditional
permutation null. Not tightened to 0.01: this is a precommitted acceptance test for a
bounded product capability with non-founder and multi-Work validation still ahead, not a
publication claiming a universal law, and at n=19 the stricter level would mostly buy false
negatives. **PASS requires the conjunction of significance, effect floor and dispersion
floor — significance alone can never close the capability gap.**

---

## Final consistency review — one finding, resolved, not escalated

### The instrument depends on the selector emitting a total order, and the contract never said so

`R1.3a`'s 80% reading and R3's normative formula both assume **no selector ties**
(`C + Dp = U`). The ratified contract §2.6 says only `ORDERING`; tie-permissibility was
left open. Read carelessly, the instrument would silently close an open product question —
the exact failure the founder named: *the benchmark fixture does not get to define the
product architecture by accident.*

**It does not, and here is why.** Q4 already forces a total order independently of SEL-0:
Studio surfaces **one** observation at a time and advances to the next on `"what else?"`.
Picking one, and then the next, requires a deterministic total order over the candidates
regardless of whether any benchmark exists. R2.4 therefore **reflects** a constraint Q4
already imposes rather than adding one.

Recorded because the chain `Q4 -> total order -> 80% reading` is not obvious and a later
reader could unpick it.

**One consequence, and its bias direction.** If the selector's internal judgment contains
genuine ties it must still break them deterministically to surface one. Those arbitrary
tiebreaks are measured and count against it, attenuating D. That biases the instrument
toward **FAIL**, never toward PASS — acceptable in an acceptance test, and stated rather
than discovered at reveal.

### Checks clean

```text
D defined for the declared response shape                 yes
C + Dp = U identity verified numerically                  yes
concordance mapping (D+1)/2 verified                      yes
null conditioned on realised structure                    yes
effect floor ceiling-independent                          yes
decline adjudicated, never scored                         yes
gates excluded from the statistic                         yes
degenerate response predeclared                           yes
seed, draws, tail, tolerance fixed before any response    yes
p-value characterisation corrected                        yes — valid/conservative
multiplicity                                              none — one test, one run
contract reopened                                         NO — no contradiction found
```

**No genuine contradiction remains. The instrument is frozen at this act.**

---

## Post-freeze note — Q12 does NOT reopen this instrument

The Q12 amendment adds `SELECTION_BOUNDARY_UNMEASURED` to the product contract's gate set.
**The frozen instrument is unaffected, and the reason is structural rather than convenient:**
the overlay ABORTS when supersession is `unmeasured`, so no fixture is ever frozen in that
condition and no acceptance run can encounter the state. It cannot appear in R1.4's
adjudication table because it cannot appear in a run.

```text
contract gates      3 (boundary · no-lawful-candidate · none-remaining)
instrument gates    2 — the boundary gate is discharged UPSTREAM, at fixture lock
```

Recorded so a later reader does not mistake the frozen instrument for stale. Digest and
decision rule unchanged; no threshold or analytic choice moved.

---

## Standing

```text
R1 · R2 · R3           FROZEN — founder act, 2026-09-08
Q9 · Q10 · Q11         RATIFIED
selector contract      RATIFIED · ebcb46d0d · not reopened
threshold              UNSET
founder ranking        NOT STARTED · Manifest B NOT OPENED
selector               NOT IMPLEMENTED
MERGE / DEPLOY         NOT AUTHORIZED
```
