# JOP-04 · R1b — Two temporal phases, and valid D4 probes (judge only)

**Status:** ⭐ **SEALED.** ⛔ **Judge only. Fixture unchanged. Sealed pins unchanged. Product diff
since `2d3a39904`: 0.**

```text
SEMANTIC SUBJECT   2d3a39904     R0 ✅ 668cf8870     R1 ✅ e7b18699f     R1a ✅ ef126d109
R1b                this seal     acceptance.mjs + this record ONLY
REPAIR SHA         ⛔ DOES NOT EXIST
```

---

## Defect 1 — the judge had only a **pre-repair** pass condition

Every boundary carried its unrepaired colour as `predeclared`, and the process exited success when
actual equalled that prediction. So after a **correct** repair turning the eight obligations
`RED → GREEN`, the sealed judge would have reported **8 mismatches, exit 1.**

> ⛔ **A fully repaired system literally could not make the acceptance instrument pass.**

That is not presentation. **The artifact whose whole purpose is to become the repair judge had no
encoded post-repair acceptance state at all.**

### Repair — two explicit phases, neither derived from the other

```text
--phase pre     D4 RED · D1 RED · D5 RED · D6 RED · F-D RED · F-D.5 GREEN · D3 RED
                D3/D4 RED · D2.6 RED · D2.3 GREEN · H1-effective GREEN
                check.run GREEN · verify.* GREEN

--phase post    ALL THIRTEEN BOUNDARIES GREEN
```

⭐ **`post` is written out in full, not computed by inverting `pre`.** A mechanically inverted
postcondition encodes *"whatever pre was not"* — a restatement of the defect rather than a statement
of the law. **The acceptance state is stated as what it is: every boundary green.**

⭐ **The semantic observations are byte-identical in both modes.** Only the expected custody state
differs. The judge measures the same things and compares them to a different declared moment.

### The phase is **mandatory**

```text
no --phase        → exit 2
unknown --phase   → exit 2
```

⛔ **A judge that defaults to a temporal mode can be run in the wrong one and have its exit status
treated as authority.** It will not guess.

Two further instrument guards travel with it: a boundary with **no target in either phase table**
aborts (exit 2), and a declared boundary that **never ran** aborts (exit 2) — so the judge cannot
silently shrink its own jurisdiction.

---

## Defect 2 — two D4 observation probes were **not valid invocations**

```text
describe('git.branch_contains', {})   ← requires `branch`
describe('repo.grep', {})             ← requires `pattern`
```

The dynamic correspondence arm already supplied those terms correctly; **the `describeInvocation()`
arm did not.** Demonstrated against the live registry:

```text
git.branch_contains {}                    INADMISSIBLE — Missing required argument: branch
git.branch_contains { branch: 'main' }    ADMISSIBLE
repo.grep {}                              INADMISSIBLE — Missing required argument: pattern
repo.grep { pattern: 'REPETEND' }         ADMISSIBLE
```

⛔ **A proper observation seam that refuses inadmissible invocations could therefore have stayed RED
forever — or been forced to describe request shapes that are not invocations at all.** That would
have made the **instrument** author a new semantic requirement: *"describeInvocation must accept
invalid partial requests."* **Nothing in D4 authorized that.**

### Repair — base caller terms

Each H1 entry now carries whatever **other required caller terms** make the probe a valid invocation:

```text
git.branch_contains.commit   base { branch: 'main' }
repo.grep.max_results        base { pattern: REPETEND }
the other six                base {}     (no unrelated required field)
```

```text
OMITTED    describe(cap, base)                  caller_terms[f] absent · host_terms[f] default+host_default · effective_terms[f] default
EXPLICIT   describe(cap, {...base, [f]: dflt})  caller_terms[f] default · host_terms[f] absent · effective_terms[f] default
```

⭐ **The required law is unchanged. This repairs the probe, not D4.**

⚠️ **Honest limit:** the fix is structural and **cannot be exercised until the seam exists** — the
probe short-circuits on `typeof describe !== 'function'` today. What *is* demonstrated now is the
defect it removes: the old probe shapes are inadmissible, shown above.

---

## Both temporal states, proven against the same unrepaired substrate

```text
--phase pre     8 RED · 5 GREEN · 0 mismatches · exit 0
--phase post    8 RED · 5 GREEN · 8 mismatches · exit 1
                D4 · D1 · D5 · D6 · F-D · D3 · D3/D4 · D2.6
```

⭐ **The second run is the load-bearing one: it proves the future acceptance state is currently
unreachable, and unreachable for exactly the eight known defects — no more, no fewer.**

After repair the frozen target becomes `--phase post → 13 GREEN · 0 mismatches · exit 0`, with **no
reinterpretation required.**

A `post`-phase mismatch now reads as what it is — **an undischarged repair obligation. Fix the
product, never the judge; the instrument is frozen custody.**

---

## Not reopened

Everything R1a fixed stands and is not under reconsideration: D2.6 genuinely submits `advancedText`,
enforces non-solicitation and checks all four refusal surfaces · the D2.3 and out-of-scope pins are
read-only and fail-closed · D1 covers wildcard selection **and** magic-path namespace annexation ·
D6 covers literal text, both whole-symbol boundaries and ambient independence · all eight host
defaults with dynamic execution correspondence · `check.run` source-pinned and never executed.

```text
R1b                ✅ SEALED
PRODUCT REPAIR     ⛔ BLOCKED — awaiting the founder's bounded implementation authority
RB-6B              ⛔ OUT        check.run repair  ⛔ OUT
```
