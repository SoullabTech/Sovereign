# JOP-04 · D2 — `git.log.format`: Provenance + Usage Census

**Status:** 🔎 **CENSUS COMPLETE. ⛔ D2 IS NOT RULED — the census returns UNDETERMINED.**
**Custody subject:** `2939d0ee83dcd01eea373f87cbd339dbc6572abe`
**Instrument:** `scripts/jop04/d2-gitlog-format-census.sh` — read-only · **6 passed · 0 failed**

> ⚠️ **Two self-contamination guards were built in before this record was committed**, the species
> having now cost this programme four incidents (C21 · the `Symbol.for` canary · the D6-F1 probe ·
> and this, caught before sealing). **P3 is PINNED to the named commit `f2b453be3` rather than
> searched** — a `--grep` over all commit messages would have been satisfied by *this census's own
> commit message*, which quotes the phrase. That is the same species in the **commit-message
> channel** rather than the tree, and it was the more dangerous form: it would have passed. **U1
> excludes this instrument by name** — a probe that discusses a capability must not be counted as a
> caller of it.
**Authorized scope observed:** provenance and usage only. ⛔ **No handler, schema, registry,
canonicalizer or production code changed. Handlers touched: 0. The field was not deleted.**

---

## 0 · ⚠️ Custody finding that had to be resolved before any archaeology was admissible

**This clone was SHALLOW.** `git blame` on the `git.log` block returned:

```text
^66da58b4 (Kelly Nezat 2026-09-06) format: { type: 'string', required: false, maxLength: 1000 },
```

`66da58b4` is a **merge commit dated 2026-09-06 whose subject is *"Journal owns its MAIA threshold:
House eligibility is not ambient affordance"*** — a change with no relationship to `git.log`
whatsoever. The `^` marks a **graft boundary**, not an author.

⭐ **A shallow clone does not report "unknown". It reports a confident, specific, wrong answer** — and
every one of the six "commits touching the file" was in fact a grafted root. Had the census been run
as-found, it would have attributed the field to a commit **26 days later than its real introduction,
authored for an unrelated subsystem.**

The clone was therefore deepened (`git fetch --unshallow --filter=blob:none`) before any provenance
claim was formed: **325 → 6228 commits.** That act adds objects to the local store and changes no
file, no schema and no handler — read-only with respect to the subject. **The instrument now refuses
to run in a shallow clone rather than produce a truncated answer.**

---

## 1 · Provenance

**P1 — One introducing commit, never edited since.**

```text
696f3241e  2026-08-11  feat(builder-os): Route A deterministic capability registry — custody adoption
```

`scripts/builder/deterministic.mjs` has **exactly one content-bearing commit in the whole history.**
`format` was present at the file's first appearance and **has never been modified, discussed, or
touched again.**

**P2 — ⭐ The introducing commit is an explicit custody DISCLAIMER, not an authorship claim.**

> *"preserved byte-identical from a rejected delegation attempt (`jarvis-route-a-sub-a-registry`:
> delegate exited 1 before delivering its required proof file — **the file existed, was never tested,
> was never accepted**)."*
>
> *"**This unit does NOT assert the file originated under this claim.**"*

The schema was **adopted**, not designed. The adopting act deliberately declines to say anything about
why any field exists.

**P3 — ⭐⭐ The authoring act is unrecoverable BY RECORD, not merely unfound.**

The trunk-admission commit `f2b453be3` states the lineage, *"deliberately not collapsed"*:

```text
HISTORICAL SUBJECT A   f021f0e4… · 264 lines · 9189 bytes · 0 commits anywhere
                       bytes unavailable; known historical subject only
```

⭐ **The artifact in which `format` was first written has no commit in any repository and its bytes do
not survive.** This is the load-bearing provenance fact of the entire census: **the absence of a
statement of intent is EXPLAINED, not merely unobserved.** No amount of further archaeology can reach
it, because the record itself says the bytes never entered version control.

**P4 — The security acceptance pass never examined consumption.**

The adoption ran 20 controls (shell-injection via filesystem side-effect marker, path escape,
type/oversize rejection, argv-only `execFileSync`) and found **two** bounded defects: `repo.grep`
throwing on zero matches, and `check.run`'s structurally dead enum. ⭐ **Both are
*declared-but-not-enforced* defects — exactly the family `git.log.format` belongs to — and it was not
among them.** The acceptance was an *injection and admission* audit, not a *consumption* audit. So
acceptance did not rule on `format` either, in either direction.

**P5 — The hard-coded format has no separate authoring event.** `--pretty` appears in the history of
`scripts/builder` and `jarvis-desktop` **only** in the two custody commits. The fixed
`--pretty=format:"%H %an %ad %s"` arrived in the same unauthored bytes as the `format` field it
ignores. ⛔ **Neither can be used as evidence about the other.**

---

## 2 · Usage

**U1 — Declared once, read never.** `format:` is declared exactly once in the registry; `args.format`
has **zero readers** anywhere in `scripts/` or `jarvis-desktop/`.

**U2 — No caller, current or historical.** A scoped pickaxe over the full history of
`scripts/builder` and `jarvis-desktop` returns four commits that reference `'git.log'` — the two
custody commits and two desktop commits. **None supplies `format`.** The single live caller,
`scripts/builder/__tests__/desktop-c0-explorer-proof.mjs:102`, supplies `max_count` only.

**U3 — ⭐⭐ NEW FINDING · F-E — the field is SOLICITED FROM A HUMAN today.**

`jarvis-desktop/src/capability-form.js` builds the Desktop C0 explorer's form from the registry's own
declared `args`. Observed, read-only, at the custody subject:

```text
git.log manifest        args: [ format (string, ≤1000), max_count (number), path (string) ]
validateSubmission      { format: '%H%n%s' }  →  ok: true
resulting task          { capability: 'git.log', args: { format: '%H%n%s' } }
handler                 drops it
```

⭐ **A human is shown a `format` box, types a pretty-format string into it, the system validates it,
accepts it, carries it into the task — and the output is identical to having left it blank.** This is
hazard class **H3** (declared + validated, then not executed), **live and user-facing**, not latent.

**U4 — The UI is a faithful mirror, and that is why the schema is load-bearing.** The explorer commit
`727c6d3af` states its own discipline: *"argument inputs are generated from each capability's declared
schema"* and *"**Invents no descriptions, categories, argument semantics, or defaults**"*; where the
registry declares nothing, *"the UI reports that absence instead."*

⛔ **This is NOT independent evidence of intent** — the UI asserts nothing about `format`; it only
refuses to invent. ⭐ **But the mirror is total, and that has a consequence the D2 question must
carry: in this system, DECLARING a field IS SOLICITING it.** A schema entry is not inert
documentation. It is an affordance offered to a person.

---

## 3 · Verdict against the pre-declared rubric

```text
D2-A  SCHEMA WRONG    format was never part of the intended act, or provenance POSITIVELY
                      shows it vestigial/dead
D2-B  HANDLER WRONG   format was intended to control log formatting; consumption was
                      omitted, lost or broken
```

| Rubric item | Found? |
|---|---|
| **Strong B** — a caller, test, doc, design note or earlier implementation supplying a format and expecting it to alter output | ⛔ **NONE** |
| **Strong B** — provenance from the introducing change describing caller-selectable formatting | ⛔ **NONE** — the introducing change describes only *custody*, and disclaims origin |
| **Strong A** — provenance showing the argument was abandoned, accidentally copied, superseded by a fixed canonical output contract, or intentionally left outside caller control | ⛔ **NONE** |

⚠️ **The accidental-copy reading is tempting and must be refused.** The bytes *were* adopted
wholesale from a rejected delegate — but *"the file was adopted without an authorship claim"* is not
*"this field was copied by accident."* The record deliberately declines to assert anything about
origin (P2), and reading a disclaimer as a finding would be manufacturing the evidence the disclaimer
exists to withhold.

> ### ⭐ D2 — UNDETERMINED
>
> ```text
> schema declares it          ✓ observed
> handler ignores it          ✓ observed
> no caller found             ✓ observed, full history, scoped
> no statement of intent      ✓ observed — AND POSITIVELY EXPLAINED (P3)
> ```
>
> This is the founder's pre-declared legitimate census outcome. ⛔ **A ruling was not manufactured
> because D2 was next.** ⛔ **Absence of evidence was not scored as A.**

⭐ **What distinguishes this from an ordinary "we couldn't find it":** P3 establishes *why* nothing
will ever be found. The authoring bytes have **0 commits anywhere**. D2 is not undetermined pending
more archaeology — **it is undetermined because the evidence class required to settle it does not
exist.** Any future ruling must therefore be an **act of constitution** (deciding what the act *shall*
be), not an act of discovery (recovering what it *was*). That is a founder decision of a different
kind than D1, D5 and D6, each of which had substrate to read.

---

## 4 · ⭐ The finding that does not depend on D2

**F-E is decidable now and points the same way under BOTH branches.**

```text
if D2-A (schema wrong)     the field must not be SOLICITED from a person — today it is
if D2-B (handler wrong)    the field must WORK — today it silently does not
```

⭐ **Both possible rulings agree that the current state is wrong.** The present behaviour — *ask a
human for a value, validate it, accept it, discard it* — is not licensed by either reading of the
history. **That is the useful output of this census**, and it is available without settling D2.

⛔ **No repair is authorized here.** F-E is recorded as a finding, not a work item.

---

## 5 · Boundary frozen before any future B ruling

⛔ **Even if B is later proven, this census does not decide the accepted format language.**
`git --pretty=format:<string>` is itself a language of placeholders and modifiers. Evidence that *"the
field should work"* is **not** authority for *"all git pretty-format syntax is allowed."*

```text
IF B IS EVER PROVEN
  B PROVEN            format consumption intended
  NEW QUESTION        authorized format language still unresolved
```

⛔ **Do not quietly inherit everything git accepts.** The D5/D6 law applies with full force: the
caller authors a value; the capability contract authors the language; ambient state authors neither.

---

## 6 · Standing

```text
D4   ⭐ RATIFIED     D1   ⭐ RATIFIED     D5   ⭐ RATIFIED     D6   ⭐ RATIFIED

D2   🔎 CENSUS COMPLETE → ⭐ UNDETERMINED, positively explained (P3)
     a future ruling would be CONSTITUTION, not discovery
D3   repo.grep.max_results                        OWED  ← next

F-D  no-match: outcome vs error                   OPEN
F-E  NEW · format is solicited from a human,
     validated, accepted, and discarded (H3 live) OPEN · decidable independently of D2

LANE OPEN · IMPLEMENTATION ⛔ BLOCKED · HANDLER CHANGES ⛔ NOT AUTHORIZED · HANDLERS TOUCHED 0
```

⚠️ **Note for D3.** `repo.grep.max_results` is the *third* shape again: unlike `format` it **is**
read by the handler (`args.max_results || 200`) and then **never applied to the command** — validated,
defaulted, bounded, and still inert. Its provenance shares P2/P3 exactly (same unauthored bytes, same
custody disclaimer), so **D3 should not expect provenance to settle it either.** ⛔ That is an
observation about where to look, not a prediction of the ruling.
