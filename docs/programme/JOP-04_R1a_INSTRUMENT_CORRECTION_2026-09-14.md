# JOP-04 · R1a — Instrument correction (instrument-only)

**Status:** ⭐ **SEALED.** ⛔ **Product code untouched. Product diff since `2d3a39904`: 0.**
**Authorized purpose:** the seven corrections named in the R1 adjudication, and nothing else.

```text
SEMANTIC SUBJECT    2d3a399043d7ef36984bd56b9de8448f79e9af29
R0                  668cf8870      reconciled design · 9/9
R1                  e7b18699f      spec + first judge · evidence retained in history
R1a                 this seal      instrument-only correction
REPAIR SHA          ⛔ DOES NOT EXIST
```

> **The first D1 defect proved the method: known defect GREEN → strengthen the judge, never touch
> the product. This adjudication is the same act one level later** — and it caught five ways a wrong
> repair could have passed, plus two ways a correct repair could never have turned the matrix green.

---

## The seven corrections

### 1 · D2.6 advanced-JSON was a **false RED**

`validateSubmission()` reads **`advancedText`**; the instrument passed **`rawJson`**. So the advanced
arm was submitting **blank** input, which parses to `{}`, which is **valid** — it reported RED for
accepting an empty submission, **never testing `format` at all.**

⭐ **A false RED is more dangerous than a false GREEN here**: it would have turned green the moment a
repair did anything at all, certifying a boundary that was never exercised.

### 2 · "not solicited" is now **enforced**, not noted

`solicits` was a `note`. A repair could leave the Desktop manifest **visibly soliciting `format`**,
special-case refusal downstream, and pass — **D2-F2 exactly.** Required post-repair, all four:

```text
manifest solicits format        FALSE
structured format submission    REFUSED
advanced format submission      REFUSED
runCapability format            REFUSED
```

The structured arm is kept deliberately: `validateSubmission` **is** an admission boundary, and
silently discarding stale or malicious structured input **reproduces D2.6's accept-and-erase failure.**

### 3 · ⭐ The judge is now **read-only and fail-closed** — a custody defect

The sealed R1 judge **created** `pinned-gitlog-output.json` when missing and **overwrote**
`unrepaired-matrix.json` under `--json`. ⛔ **A post-repair checkout missing its pin could therefore
manufacture a new baseline from the repair it is supposed to judge. That is fail-open.**

```text
missing D2.3 pin         → HARD FAILURE   exit 2, verified
missing out-of-scope pin → HARD FAILURE   exit 2, verified
changed pin              → HARD FAILURE   (D2.3 / check.run / verify.* arms breach)
--json into the sealed directory → REFUSED  exit 2, verified
normal run               → writes nothing  exit 0, verified
```

Re-sealing is now a **separate deliberate act** — `scripts/jop04/r1/seal-pins.mjs` — which **refuses
to overwrite existing pins** (exit 2, verified) and requires `--force` under an explicit custody
ruling. ⛔ `unrepaired-matrix.json` is gone from the sealed directory entirely: the colour matrix is
a **record**, not a pin, and lives in this document and in git history at `e7b18699f`.

### 4 · D1 now tests **namespace annexation**, not only selection injection

D1 covers glob spelling **and** Git magic (`:(exclude)`, `:(glob)`, `:(literal)`, `icase`…). A repair
could have special-cased globbing while leaving magic fully executable and passed all five arms.

A second literal subject was added — a real file **literally named** `:(literal)app/a.ts`, committed
alone — beside the ordinary `app/a.ts` control. The discriminator is exact:

```text
git ls-files ':(literal)app/a.ts'                    → app/a.ts            ⛔ ANNEXATION
git --literal-pathspecs ls-files ':(literal)app/a.ts' → :(literal)app/a.ts  ✔ identity
```

Every one of the five PATH fields must now prove **both** vectors, and — because **D1 forbids
rejection as well as annexation** — each arm carries a **positive control**: it must *reach* its
literal subject, or it reports *"did not reach the literal subject — REJECTED it instead"* rather
than passing.

### 5 · D6 now proves **whole-symbol**, not merely literal

ARM 1 as sealed would have accepted `git grep -F 'alpha.beta'`: it finds the subject and rejects
`alphaXbeta`. **But a raw substring search is not whole-symbol lookup.** Two embedded-literal
controls were added, and D6.4 ambient-independence exercised across two dialects:

```text
alpha.beta           MATCH        the subject
alphaXbeta           NO MATCH     regex-authority control
prefixalpha.beta     NO MATCH     left boundary — fails a fixed-string repair
alpha.betaSuffix     NO MATCH     right boundary — fails a fixed-string repair
ambient basic ≡ extended          same invocation, same semantics (D6.4)
```

⚠️ The two boundary controls and D6.4 **already hold on the unrepaired substrate** — they guard a
*future* bad repair, not a present defect. They sit inside the RED D6 boundary rather than inflating
the matrix.

### 6 · ⭐⭐ D4 could have been satisfied by a **decorative** `describeInvocation()`

The most consequential hole. The judge checked `caller_terms` and `host_terms` but **never
`effective_terms`**, despite requiring that shape — and the protected H1 behaviour test covered only
**three** of the eight defaults. **A repair could have added a beautiful, truthful-looking
`describeInvocation()` while handlers continued to derive defaults independently, and the judge would
have certified documentation about an execution plan rather than execution-plan truth.**

Now, for **all eight** defaults:

```text
OMITTED            caller_terms[f] ABSENT · host_terms[f] {value: D, source: host_default}
                   effective_terms[f] = D
EXPLICIT DEFAULT   caller_terms[f] = D · host_terms[f] ABSENT · effective_terms[f] = D
```

plus a **dynamic correspondence** arm proving `execution(omitted) == execution(explicit effective
default)` across seven invocation pairs covering all eight fields — **both `git.diff_stat` defaults
and `git.branch_contains` included.** ⛔ This dictates nothing about how the implementation works; it
proves the **described plan corresponds to the act actually performed.**

### 7 · `check.run` is now actually protected

The GREEN boundary verified only the `test_type` enum — **the handler could have been rewritten
entirely and the boundary would have stayed green.** ⛔ It is deliberately **not executed**: running
it would itself cross the delegated-execution boundary R1 is told to stay out of.

Instead its **declaration and handler source** are digest-pinned, alongside the three `verify.*`
handlers.

> **Out of jurisdiction means UNCHANGED, not merely still named the same thing.**

This is the one place source pinning is the right instrument rather than a behavioural one.

---

## Corrected unrepaired matrix — same substrate, every colour now capable of turning

```text
  D4             RED    no describeInvocation() seam · (correspondence arm already green)
  D1             RED    10/10 arms breach — 5 fields × {wildcard SELECTION, magic ANNEXATION}
  D5             RED    'ZEBRA\|QUAGGA' matched [] under ambient 'extended' — the config decided
  D6             RED    'alphaXbeta' matched: the caller's '.' authored matcher syntax
                        (boundary controls held · D6.4 ambient-independence held)
  F-D            RED    ordinary absence THREW — absence collapsed into failure
  F-D.5          GREEN  a non-repository propagated a genuine failure
  D3             RED    the bound was ignored (max_results 1 → 12 records, 3 → 12)
  D3/D4          RED    identical output indistinguishable from identical authorship
  D2.6           RED    4/4 arms breach — runCapability · manifest SOLICITS · structured · advanced
  D2.3           GREEN  byte-identical to the sealed pin
  H1-effective   GREEN  effective equivalence across 7 pairs covering all 8 defaults
  check.run      GREEN  declaration AND handler byte-identical to the sealed pin
  verify.*       GREEN  three handlers source-pinned and behaving

  ---- 8 RED · 5 GREEN · 0 mismatches against the predeclared matrix ----
```

⭐ **The semantic colours are unchanged from R1, exactly as predicted. The difference is that every
colour can now turn — or stay — green for the right reason**: D2.6's advanced arm actually submits
`format`, D1 cannot be satisfied by a glob-only fix, D6 cannot be satisfied by fixed-string search,
D4 cannot be satisfied by documentation, and `check.run` cannot be quietly rewritten.

---

## Custody rules that now bind

```text
SPEC                   SEALED (R1) · corrections sealed (R1a)
ACCEPTANCE INSTRUMENT  SEALED · contains NO product repair · READ-ONLY · FAIL-CLOSED
UNREPAIRED RUN         8 RED · 5 GREEN · 0 mismatches
PRODUCT DIFF           0
INSTRUMENT CUSTODY     FROZEN for the eventual repair
```

⛔ **A mismatch is never a licence to change the product.** Protected invariant RED → the instrument
widened its jurisdiction. Known defect GREEN → the witness cannot judge that repair.
⛔ **If the instrument needs changing after seeing an implementation, that implementation is NOT
accepted against the revised judge without a new custody ruling.**
⛔ **The historical D1/D5/D6/D3/D2 evidence witnesses are not rewritten into acceptance tests.**
Some correctly prove the defect and must cease matching after repair. **History stays history.**

```text
R1a                    ✅ SEALED
PRODUCT REPAIR         ⛔ BLOCKED — awaiting the founder's implementation-authority ruling
RB-6B mechanism        ⛔ OUT        check.run  ⛔ OUT
```
