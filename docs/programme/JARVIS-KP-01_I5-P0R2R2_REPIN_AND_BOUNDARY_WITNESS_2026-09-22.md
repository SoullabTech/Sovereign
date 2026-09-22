# JARVIS-KP-01 / I5-P0R2R2 — RE-PIN EXECUTED · DRY-RUN BOUNDARY WITNESSED

STATUS: RECORD (⛔ not an authorization)
**Date**: 2026-09-22
**Disposition**: `I5-P0R2R2 DRY-RUN BOUNDARY WITNESSED` — stopped for founder adjudication.
⛔ **And a new production blocker is named in §3 that the re-pin cannot clear.**

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. Founder disposition (a) executed

`EXPECT_FULL` re-pinned `195b16bc…` → `b828400c…`, with the reason recorded inline:
the only movement in the declared full seam was `c6744f66` (Serving Identity
F2-IQ), reviewed and disjoint from the shadow launch.

⛔ **Equality was not weakened.** The whole serving route remains inside the strict
boundary; a future byte change anywhere in it must still stop loudly. Review-only
semantics were **not** introduced, the seam was **not** narrowed, and no digest was
relaxed.

**F5a now allows exactly ONE delta, keyed by name and by both values**, on the S3
substrate-typecheck discipline: anything else in the invariant set still fails, a
mis-keyed allowance **fails** rather than passing, and an allowance that **stops
firing** is reported so it gets removed rather than standing forever. It fired:
`EXPECT_FULL re-pin fired=1`, residual invariant diff **empty**.

## 2. Matrices after the re-pin

| matrix | result |
|---|---|
| seam identity | **12/12 falsifiers · 5/5 candidates DEAD · 0 unclassified** |
| §II ceiling repair | **6/6** |
| §VI/§VII dry-run boundary | **9 PASS · 0 FAIL · 0 NOT ESTABLISHED** |

D1 · D2 · D7 · D8 · D9 are all now resolved, and D3–D6 stand.

## 3. ⛔⛔ THE RE-PIN CANNOT MAKE THE PRODUCTION RUN PASS

`checkBinding` requires the expected full digest to match at **both** ends. The two
ends now disagree:

| | full scope | image scope |
|---|---|---|
| production running SHA `4c097b4c` | `195b16bc…` | `a63cf931…` |
| canonical `4ef9a198` | **`b828400c…`** | `a63cf931…` |

- pin `195b16bc…` → `SEAM_MOVED_AT_CANONICAL` (the refusal already adjudicated)
- pin `b828400c…` → **`SEAM_MOVED_AT_PRODUCTION`** (what the real run will now hit)

⭐ **No single full-scope value satisfies §I.2 while production predates
`c6744f66`.** The only two exits are a deploy — prohibited by §VII and a separate
act — or a change to the readiness law, which is not authorized.

### ⭐⭐ Why the two scopes behave differently, which is the substance

The full scope contains the **one path that cannot be witnessed in the running
image** — the compiled-only serving route. That is the **ENTAILED** half. The image
scope is the **WITNESSED** half, and it is **identical at both ends**.

So §I.2 and §I.3 are not two strengths of the same claim. **§I.3 asserts seam
integrity** — the container's bytes are the authorized bytes. **§I.2 asserts
production freshness** — production was built from a commit whose seam matches
canonical's *current* seam. Freshness is a legitimate thing to require; it is
simply not satisfiable without deploying, and a seam edit by any lane makes
production stale by definition the moment it lands.

⛔ No disposition proposed. The founder said not to weaken equality, and naming the
distinction is not a licence to act on it.

## 4. ⭐⭐ THE BOUNDARY MATRIX FOUND A REAL DEFECT IN THE INSTRUMENT

D8 failed, and the stub was innocent. Three sites counted list entries as:

```
printf '%s' "$VALUE" | tr ',' '\n' | sed '/^…$/d' | wc -l
```

`printf '%s'` emits **no trailing newline** and `wc -l` counts newlines, so **a
correctly configured single-identity allowlist counted as ZERO.**

Consequences, had this reached production:

1. Phase 4's B1 block is `if [ "$CURRENT_COUNT" = "1" ]`, so it would have been
   **skipped** — the operator would never have seen `match=YES|NO`, i.e. the very
   fact the act exists to establish.
2. ⭐ Worse: the final gate uses the same counts. After a **successful `--apply`**,
   `COUNT_AFTER=0` and `MODEL_COUNT=0` would fail the gate and the instrument would
   announce **`I5-P0 NOT READY — allowlist or model set did not reach the required
   state`** for a remediation that had in fact worked correctly.

Repaired with one `csv_count()` helper, verified: `""`→0 · `"one-id"`→1 · `"a,b"`→2
· `"a, b ,c"`→3 · `","`→0.

⚠️ The failure direction was **fail-closed** (ready reported as not-ready), which is
the safe side — but it would have produced a false NOT READY on success and
invited a repeat mutation. ⭐ **It was found by the boundary matrix before any
`--apply` was ever authorized, which is exactly what that matrix was built for**,
and it had never been exercised because every prior run stopped in Phase 1.

## 5. ⚠️ What the boundary witness does NOT establish

- It ran against **stubbed** `docker` and `psql`. It proves the script's control
  flow and no-mutation boundary, ⛔ **not** any production fact.
- The stub **claims production runs canonical's tip**, a labelled **fixture** whose
  only role is to make Phases 1–5 reachable. ⛔ It is not a relaxation of the
  binding: the binding executed for real against real git objects, and §3 records
  what it will do on the real host.
- ⚠️ **D7 was a vacuous pass first**: with the run dying in Phase 1, *"the raw
  identifier did not appear"* is trivially true. It now requires the fingerprint
  line only Phase 4 can emit, and reports **VACUOUS** otherwise. *An absence is
  evidence only if the thing that would have produced the presence actually ran.*

## 6. Custody — bytes changed by this act

```
i5-p0r2-remediation.sh                    <see commit>   RE-PINNED + csv_count repair
i5-p0r2-ceiling-falsifiers.sh             <see commit>   one named authorized delta
i5-p0r2-dryrun-boundary-falsifiers.sh     <see commit>   stub fix + D7 precondition
i5-host-plane-probe.sh                    a96de5c447c5f9aea14203768694ebaa057f2f31  unchanged
seam-identity.mjs                         b86a7e3982a0bf809022c2fdfe2b7f28c203d223  unchanged
seam-identity-container.mjs               85bdba16753cceb4d5991ca4c8c69b57f79f1585  unchanged
```

⛔ The remediation instrument is **no longer** `1ecf0cbd…`. The `csv_count` repair is
a **substantive behavioural fix**, not observability, so §I custody must be
re-accepted before the instrument runs against production again.

## 7. Standing

founder disposition (a) **EXECUTED** · equality **NOT WEAKENED** · seam **NOT
NARROWED** · seam matrix **12/12 · 5/5** · ceiling **6/6** · dry-run boundary
**9/9, 0 failed** · §VI/§VII boundary **WITNESSED against stubs** · ⛔ production
full-scope binding **UNSATISFIABLE without a deploy — reported, not resolved** ·
instrument **RE-PINNED + one substantive repair, custody re-acceptance OWED** ·
`--apply` **NOT RUN** · `.env.production` **UNMUTATED** · recreation **NONE** ·
flags **ALL OFF** · rows **NONE** · B1 **UNREPAIRED** · B2 **UNREPAIRED** ·
instrument **NOT FROZEN** · ⛔ I5-P1 NOT OPENED · **PRODUCTION UNTOUCHED.**

⭐ *The busy route was allowed to be inconvenient, and the inconvenience paid for
itself twice: once by forcing a human read of a serving-seam change, and once by
making a matrix run that found a defect which would have called a successful
remediation a failure.*
