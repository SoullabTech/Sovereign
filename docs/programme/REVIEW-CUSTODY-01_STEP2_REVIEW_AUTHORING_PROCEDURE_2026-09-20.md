# REVIEW-CUSTODY-01 · STEP 2 — REVIEW-AUTHORING PROCEDURE (DERIVED COVERAGE)

**Date** 2026-09-20 · **Status** STEP 2 COMPLETE · COVERAGE MATRIX **LETHAL + DISCRIMINATING**
**Founder directive** mechanically derived coverage is **mandatory**; self-reported coverage refused
⛔ **STEP 3 NOT OPENED** · ⛔ **INSTRUMENT STILL UNWIRED — no surface requires a bound review**
**Predecessors** `…_STEP1_FALSIFIER_MATRIX_2026-09-20.md` · `…_SUITE_FREEZE_2026-09-20.md`

---

## ⭐⭐ The architectural correction Step 2 forced

The directive reads naturally as *"make `admit` check the trace."* **It cannot be that**, for
three reasons, and the third is decisive:

1. `scripts/review-custody-core.ts` — which holds `admit` and `STRICT` — is **frozen**.
2. Coverage witnessing and record admissibility are **different questions**, and merging
   them is the class of conflation this lane exists to refuse.
3. ⭐ **All fourteen frozen falsifiers call `admit` without a trace.** Had `admit` required
   one, every one of them would have been refused for a missing trace *before reaching its
   named refusal* — **the law would have died for the wrong reason while the matrix still
   reported fourteen kills.**

So coverage is a **third boundary**, above `admit`:

```text
witness   refuses an UNWITNESSED COVERAGE CLAIM      scripts/review-custody-coverage.ts
admit     refuses THE RECORD                         (frozen)
check     refuses THE CONTINUED APPLICABILITY        (frozen)
```

The CLI composes them: `witness → admit`. `admit` now **requires `--trace`** at the shell,
and the frozen core is untouched — `verify:review-custody-freeze` exit 0 after Step 2.

---

## ⚠️⚠️ What a derived coverage set is, exactly

- **It bounds coverage FROM ABOVE.** The reviewer cannot have inspected a file it never read.
- ⛔ **It does NOT bound from below.** A read event proves a file was **opened** — never that
  it was understood, and never "thoroughness."
- The trace is emitted by the reviewer's **harness**, not by the model's prose. Strictly
  stronger than self-report; ⛔ **still not a kernel witness.**
- ⭐⭐ **The bound holds only if EVERY read channel is witnessable.** A shell is not: `cat`,
  `sed -n`, pipes, globs and variables cannot be soundly reduced to a file set. A trace
  containing one is therefore **REFUSED, not partially credited** — *coverage derived from a
  partial view of reads is not a bound; it is a guess wearing a bound's clothes.*
- Classification is **FAIL-CLOSED**: an unrecognised tool is an unwitnessable channel, never
  ignored.
- ⛔ `Grep` and `Glob` **witness nothing** and are recorded as SCOPES. A search over a
  directory does not establish that any particular file's content was inspected.

---

## The procedure

### 1. The reviewer's tool surface is part of the law, not a preference

Because an unwitnessable channel voids the bound, the reviewer **must** run with reads
restricted to witnessable tools:

```text
ALLOWED     Read · NotebookRead          (witnessable — one file each, named in input)
ALLOWED     Grep · Glob                  (scope only; contribute no coverage)
⛔ DENIED   Bash and any shell           (unwitnessable read channel → trace REFUSED)
⛔ DENIED   Write · Edit · any mutation  (a reviewer that can edit is not a reviewer)
```

### 2. ⚠️ The reviewer must be a SEPARATE PROCESS whose stream is captured

⛔ **An in-process subagent cannot satisfy this.** A subagent returns its final report; its
tool-call trace is not available as a file. The reviewer therefore runs as a separately
invoked CLI process with its event stream written to disk. **Whoever builds Step 3 must not
substitute a subagent for it** — the review would be self-reported again, and the refusal
would never fire because there would be no trace to refuse.

### 3. The review the reviewer emits

```jsonc
{
  "verdict": "APPROVED | REVISE | BLOCKED",
  "plan_sha256": "<the plan it read>",
  "trace_id": "<the reviewer run's session id — binds the trace to this review>",
  "reviewer": "<who>",
  "summary": "<non-empty>",
  "findings": [{ "id": "…", "severity": "high|medium|low", "path": "…", "evidence": "…", "fix": "…" }],
  "coverage": { "files": ["…"] },   // ATTESTATION — checked against the trace, never trusted
  "limitations": ["…"]              // must be PRESENT; asserting none is a claim, omitting it is not
}
```

### 4. Admission

```bash
npm run review:custody -- bind  --plan PLAN.md --out .review/rec.json
npm run review:custody -- admit --record .review/rec.json --review review.json --trace trace.ndjson
npm run review:custody -- check --record .review/rec.json
```

---

## The eight coverage laws

| Falsifier | Law | Defeat candidate |
|---|---|---|
| RC-C1 | An attested file with no witnessing read is refused — the trace is a **gate**, not an audit artefact | DC-C1 *the trace is for audit, not gating* |
| RC-C2 | An unwitnessable read channel **voids the trace**; unrecognised tools are unwitnessable (fail closed) | DC-C2 *a shell is just another reader* |
| RC-C3 | Matching is **exact** after normalization: `a.ts` may not witness `lib/a.ts`; spelling may never decide | DC-C3 *suffix match is close enough* |
| RC-C4 | An empty trace — or none at all — against a non-empty attestation is refused | DC-C4 *nothing to contradict the claim* |
| RC-C5 | `TRACE_UNREADABLE` is distinct from `TRACE_EMPTY`: instrument failure is not a finding about the reviewer | DC-C5 *unparseable means no events* |
| RC-C6 | Undisclosed reads are **RECORDED, not refused** — reading more than you report is legitimate | DC-C6 *undisclosed reads are a coverage lie* |
| RC-C7 | Trace provenance is **external**: a review may not witness itself | DC-C7 *use the review's own trace* |
| RC-C8 | The trace must carry the review's declared identity — a spliced trace witnesses nothing | DC-C8 *a trace is a trace* |

```text
COVERAGE MATRIX: LETHAL + DISCRIMINATING
  8/8 candidates died on their named falsifier
  STRICT_COVERAGE satisfies 8/8 laws
  all collateral CLASSIFIED · exit 0
FROZEN MATRIX unchanged: 14/14 · FREEZE INTACT
```

**One classified collateral.** `DC-C1` also defeats RC-C3: an implementation that does not
gate on the witness set has no comparison to be exact about. Narrowing it would require it
to gate — i.e. to stop being the error it models.

---

## ⭐ The matrix again found a defect in the INSTRUMENT, not a candidate

`DC-C7` **survived** its first run. The cause was in the module, not the corpus: I had
hard-coded the inline-trace refusal *inside* `witnessCoverage`, so a candidate that tried to
witness a review with the review's own trace was refused **by the core rather than by the
law** — the falsifier passed while the error went unmodelled.

Repaired by **removing the structural block** and letting `STRICT_COVERAGE.traceSource`
ignore `inlineTrace` outright, so external provenance is enforced **by the decision**. The
candidate then genuinely uses the inline trace and dies.

⭐ *Step 1's defect was in a fixture; this one was in the module a suite was written to
protect. Both were found only because the wrong implementations exist — and neither would
have been found by running the suite against the conforming implementation alone.*

---

## ⚠️ Owed — trace-shape provenance is NOT verified

The parser accepts newline-delimited JSON or a JSON array, walks nested structures, and
extracts `{type:"tool_use", name, input}` plus `session_id`/`trace_id`. That shape is
**asserted from documentation, ⛔ not witnessed in this container** — there is no CLI here.

**Owed before Step 3 relies on it:** one run on a host with the CLI confirming that the
chosen invocation writes a stream carrying (a) `tool_use` entries with the tool name and its
input, and (b) a stable session identity. ⛔ **If the real stream differs, the parser is
wrong and the fix is the parser — never the law.** RC-C5 exists precisely so a shape
mismatch surfaces as `TRACE_UNREADABLE` rather than as a silent empty coverage set.

---

## ⚠️ A near-miss worth recording: `.gitignore` swallowed the whole suite

The Step 2 suite was first written to `tests/constitutional/review-custody/coverage/`.
`.gitignore:54` carries `coverage/` — a rule for **test-coverage output** — so `git add -A`
silently added nothing. Every matrix ran green locally while **the suite did not exist in the
repository**: a probe, not a record, arrived at by a completely different route from Step 1's.

⛔ **Not repaired by `git add -f`**, which leaves the directory ignored and the next file added
there silently dropped. Repaired by **renaming to `coverage-witness/`**, which matches no
ignore rule — bounded, and it does not edit a repo-wide rule for a local convenience.

⭐ The general shape, and the reason it is recorded rather than quietly fixed: *a pattern meant
for generated output can capture authored law that happens to share its name, and the failure
is silent in exactly the direction that matters.* Verified after the rename:
`git check-ignore` exits 1 (not ignored) and all three files are staged.

---

## Standing

**STEP 2 ✅ COMPLETE · COVERAGE WITNESS LANDED AS A THIRD BOUNDARY · CLI REQUIRES `--trace` ·
COVERAGE MATRIX ⭐ LETHAL + DISCRIMINATING (8/8 · STRICT_COVERAGE 8/8 · collateral CLASSIFIED) ·
FROZEN MATRIX 14/14 UNCHANGED · ⭐ FREEZE INTACT — ZERO FROZEN BYTES EDITED · TYPECHECK EXIT 0
(strict · noUncheckedIndexedAccess) · END-TO-END CLI WITNESS VERIFIED (lawful admit · over-claimed
coverage refused · shell-in-trace refused · missing trace refused) · ⚠️ TRACE SHAPE ⛔ NOT VERIFIED
AGAINST A REAL CLI · ⛔ REVIEWER MUST BE A SEPARATE PROCESS, ⛔ NOT AN IN-PROCESS SUBAGENT ·
⛔ STEP 3 NOT OPENED · ⛔ INSTRUMENT UNWIRED · ⛔ PROJECT GATES NOT RUN IN CONTAINER ·
⛔ FOREIGN-PROVIDER HOLD UNCHANGED · PRODUCTION UNTOUCHED.**
