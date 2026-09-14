# JOP-04 · R1 — Bounded Repair Specification + Predeclared Acceptance Instrument

**Status:** ⭐ **SPEC + INSTRUMENT SEALED. Pre-repair run recorded. ⛔ NO PRODUCT REPAIR INSIDE.**

```text
SEMANTIC SUBJECT    2d3a399043d7ef36984bd56b9de8448f79e9af29
RECONCILED DESIGN   668cf8870                    (R0 · 9/9)
INSTRUMENT          this seal
REPAIR SHA          ⛔ DOES NOT EXIST YET
```

---

## 0 · ⭐ Standing rule — authority order

> **Authority order:** sealed semantic rulings → R0 reconciliation → current capability contract →
> current product substrate. **Earlier `DESCRIPTION ONLY` census/contract artifacts remain historical
> evidence and do not regain implementation authority where later rulings supersede them.**

⛔ This matters concretely: the older semantic-input description still contains **pre-D1/D2/D3
language**. It needs no further reconciliation lane — **it simply may not be cited as normative
authority.** The instrument encodes this rule in its own header.

---

## 1 · Scope

**One scope:** canonical invocation / execution-plan truth, plus conformance of the **registered read
capabilities** to **D4 · D1 · D5 · D6 · D3 · D2 · F-D**.

**R1 produced:** this specification · `scripts/jop04/r1/acceptance.mjs` (the judge) ·
`scripts/jop04/r1/fixture.mjs` (hermetic fixture) · `scripts/jop04/r1/pinned-gitlog-output.json`
(D2.3 pin) · `scripts/jop04/r1/unrepaired-matrix.json` (the pre-repair colours).

```text
⛔ EXPLICITLY OUTSIDE R1
check.run · RB-6B host execution-decision primitive / Arms A–D · main.js authority implementation
receipts / audit logging · effect classification · idempotency · write capabilities · confirmation UX
provider / voice work · database & schema work · git.log output redesign · new path-containment policy
new symbol identifier grammar · grep ranking / scoring / sampling / deduplication
```

---

## 2 · ⭐ Hermetic Git fixture — an R1 REQUIREMENT, not a suggestion

⛔ **D1 · D2.3 · D3 · D5 · D6 are never exercised against the JOP repository.** The instrument builds
a temporary Git repository with deterministic commits, authors, timestamps, filenames and contents.

```text
instrument prose changes · new commits · new matching documentation · branch history growth
      ⟶  CANNOT change the behavioural fixture being judged
```

⭐ **This retires the self-documentation species (five incidents) by construction rather than by
discipline.** Determinism is verified: repeated builds produce identical commit SHAs, so the D2.3 pin
is an exact byte value rather than a shape.

**Fixture content, and why each piece exists:**

```text
app/a.ts · app/b.ts            ordinary files · ZEBRA and QUAGGA for the D5 alternation probe
app/*.ts                       a REAL file literally named like a glob — the D1 subject,
                               committed ALONE so commit-level capabilities can discriminate
src/sym.ts                     literal `alpha.beta` AND the lookalike `alphaXbeta` (D6 ARM 1)
many.txt                       12 lines carrying REPETEND — the D3 bound and prefix law
database/migrations/…          a real dir for the inventory.* default-bearing capabilities
grep.patternType = extended    ⭐ the fixture repo deliberately declares a NON-BRE ambient dialect
a separate NON-repository dir  the F-D.5 genuine-failure arm
```

---

## 3 · Predeclared acceptance matrix

| Boundary | Pre-repair | Post-repair requirement |
|---|---|---|
| **D4 · host defaults / authorship** | 🔴 RED | caller omission preserved; host default separately recorded with `source=host_default`; explicit default remains caller-authored |
| **D1 · literal path identity** | 🔴 RED | all five D1 path fields treat glob/magic-looking spelling literally, never as Git selection authority |
| **D5 · BRE pinning** | 🔴 RED | changing ambient `grep.patternType` cannot change `repo.grep.pattern` meaning |
| **D6 · literal symbol** | 🔴 RED | punctuation in `symbol` is sought literally and cannot author matcher syntax |
| **F-D · absent symbol** | 🔴 RED | a valid no-match succeeds with zero records |
| **F-D.5 · genuine failure** | 🟢 GREEN | genuine Git/tool failure continues to propagate; never normalized to zero |
| **D3 · `max_results` behaviour** | 🔴 RED | global bound honoured; `results(N)` is a prefix of `results(M)` |
| **D3/D4 · `200` authorship** | 🔴 RED | omitted → host `200`; explicit `200` → caller `200`; identical execution does not collapse invocation identity |
| **D2.6 · `format` admission** | 🔴 RED | `git.log {format:…}` **refused**, not stripped or ignored |
| **D2.3 · `git.log` output** | 🟢 GREEN | exact existing observable output remains pinned |
| **H1 effective behaviour** | 🟢 GREEN | adding authorship truth does not alter the current effective result for omitted/default-equivalent valid calls |
| **`check.run` boundary** | 🟢 GREEN | untouched |
| **unrelated `verify.*`** | 🟢 GREEN | untouched |

⭐ **One test per falsifiable boundary, not one per ruling.** D6 and F-D share a three-arm witness;
D2.3 and D2.6 share one fixture with two opposite assertions; D3 and D4 share the authorship seam.

---

## 4 · The boundaries that close two opposite bad repairs at once

### D6 + F-D · three arms

```text
ARM 1  LITERAL PUNCTUATION   symbol='alpha.beta' against a fixture holding both `alpha.beta`
                             and `alphaXbeta` → ONLY the literal whole-symbol occurrence qualifies
ARM 2  VALID ABSENCE         valid repository, symbol definitely absent → SUCCESS · zero records
ARM 3  GENUINE FAILURE       invoked against a directory that is NOT a git repository
                             → execution failure propagates · MUST NOT become zero records
```

⭐ ARM 3 is deliberately **not** the old `rc=128` malformed-regex specimen: a correct D6 repair should
make caller punctuation **incapable of producing that parser error at all**, so a witness built on it
would decay. A non-repository is a failure D6 cannot repair away.

Together the arms refuse both wrong repairs: **escaping/literalization that is still wrong** (ARM 1)
and **a broad catch that swallows genuine failure** (ARM 3).

### D2 · one fixture, two opposite assertions

```text
valid    git.log { max_count: 3 }   → EXACT pinned output (fields, order, dates, quoting, record order)
invalid  git.log { format: '%H' }   → REFUSED
```

Refusal is tested at **both admission layers that exist today** — `runCapability(…)` and the Desktop
`validateSubmission(…)`, in **structured and advanced-JSON** modes. ⛔ *"`format` no longer appears in
the schema"* is **not** sufficient. The form is a faithful schema lens, so removing `format` from the
authoritative registry should remove the ordinary affordance **with no second UI repair** — but
advanced submission must still reject it as an unexpected argument.

### D4 · a pure observation seam — the law, not the mechanism

The repair must expose enough **pure, read-only** structure to distinguish caller from host **without
executing the capability**. ⛔ **No permit, authority object, digest, receipt or RB-6B decision shape
is prescribed.**

```text
repo.grep {}                      caller_terms.max_results  ABSENT
                                  host_terms.max_results    200
                                  host_terms.source         host_default

repo.grep { max_results: 200 }    caller_terms.max_results  200
                                  host default for that field  ABSENT
```

Both may yield the **same effective grep operation**. They remain **different canonical invocations.**
The instrument's minimum contract is `describeInvocation(name, args) → { caller_terms, host_terms,
effective_terms }`, table-driven across **all eight** existing H1 defaults — **one authorship
boundary, not eight invented concepts.**

---

## 5 · ⚠️ Instrument defect found and fixed during the pre-repair run

The first run reported **0 mismatches** — and was **wrong about two arms.**

```text
D1 first run    repo.find_file · inventory.migrations · inventory.routes   ✘ breached
                git.log · git.file_history                                 "literal identity held"
```

⛔ **Those two passed vacuously.** The discriminator was a filename regex, but `git.log` and
`git.file_history` return **commits, not filenames** — the check could never fire. Worse, the fixture
put the literal `app/*.ts` file in the **same commit** as the ordinary files, so commit-level output
could not have discriminated even with the right regex.

**By the standing rule — *a known defect already GREEN means the witness cannot judge that repair* —
the instrument and fixture were fixed, never the product:**

```text
fixture      the literal wildcard-named file now has its OWN commit
instrument   each arm uses a discriminator appropriate to WHAT THAT CAPABILITY RETURNS
             + a POSITIVE CONTROL per arm: it must reach the literal subject at all,
               otherwise the arm reports "not discriminating" instead of passing
```

After the fix **all five D1 arms breach**, each having first proven it can see its subject.

---

## 6 · Pre-repair run — the colour matrix

```text
  D4             RED    no describeInvocation() seam exists at all
  D1             RED    all five PATH fields let the spelling act as SELECTION
  D5             RED    'ZEBRA\|QUAGGA' matched [] under an ambient `extended` dialect —
                        the ambient config, not the contract, decided the meaning
  D6             RED    'alphaXbeta' matched: the caller's '.' authored matcher syntax
  F-D            RED    ordinary absence THREW — absence collapsed into failure
  F-D.5          GREEN  a non-repository propagated a genuine failure
  D3             RED    the bound was ignored (max_results 1 → 12 records, 3 → 12)
  D3/D4          RED    identical effective output cannot be distinguished from identical authorship
  D2.6           RED    accepted at runCapability, at structured submission, and at advanced JSON
  D2.3           GREEN  observable output pinned, byte-identical across runs
  H1-effective   GREEN  effective equivalence preserved for 3 default-bearing capabilities
  check.run      GREEN  declaration unchanged
  verify.*       GREEN  file_exists · sha256 · count_matches all behave

  ---- 8 RED · 5 GREEN · 0 mismatches against the predeclared matrix ----
```

⭐ **The judge can see every defect it will be asked to certify, and the protected invariants are
already green.** Both colours are present, which is the point: *if everything were green before
repair, the judge would not be judging the repair.*

---

## 7 · Custody rules that now bind

```text
SPEC                    SEALED
ACCEPTANCE INSTRUMENT   SEALED · contains NO product repair
UNREPAIRED RUN          known obligations RED · protected invariants GREEN · 0 mismatches
PRODUCT DIFF            0
INSTRUMENT CUSTODY      FROZEN for the eventual repair
```

⛔ **A mismatch is never a licence to change the product.**

```text
protected invariant RED before repair   → the instrument widened its jurisdiction; fix the instrument
known defect GREEN before repair        → the witness cannot judge that repair; strengthen it
```

⛔ **If the instrument needs changing after seeing an implementation, that implementation is NOT
accepted against the revised judge without a new custody ruling.**

⛔ **The existing D1/D5/D6/D3/D2 evidence witnesses are NOT rewritten into acceptance tests.** They
are historical evidence instruments; some correctly prove the defect and must **cease matching** after
repair. **History stays history.**

---

```text
JOP-04 semantic lane     ✅ CLOSED
R0                       ✅ SEALED · 668cf8870
R1 specification         ✅ SEALED
R1 pre-repair witness    ✅ SEALED · 8 RED · 5 GREEN · 0 mismatches

PRODUCT REPAIR           ⛔ STILL NOT AUTHORIZED
RB-6B decision mechanism ⛔ OUT
check.run                ⛔ OUT
```

**Next founder act:** adjudicate whether this judge is strong enough to authorize implementation.
