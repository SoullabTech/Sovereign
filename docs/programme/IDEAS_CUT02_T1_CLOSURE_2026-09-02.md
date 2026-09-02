# IDEAS Cut 0–2 · T1 Fault Localization — closure record

**Specification**: `docs/specs/IDEAS_CUT02_FAULT_LOCALIZATION_INSTRUMENT.md`
**Base**: `2c7f7e329a9bd8df3f50f5a83c410e683dcb4744` — the named base, verified present
**Branch**: `feature/ideas-cut02-t1-fault-localization`, cut **from that commit**
**Status**: contract repairs applied (adjudication 2) · **T1 NOT CLOSED · may not ship while preflight is red · real-member witness not yet run · T2 unauthorized · reproduction held**

---

## 0 · What this re-cut corrects

The prior candidate `d2a2aa7` was cut from `90f401c16`, a **diverged lineage** —
merge base `4b8b34bc`, 41 ahead / 37 behind relative to `2c7f7e3` (verified in
this repository, not taken on report). The wrong base masked three contract
drifts, each of which destroyed a distinction the instrument exists to preserve:

| | Ratified at `2c7f7e3` | Prior candidate | Now |
|---|---|---|---|
| Stage vocabulary | 15 stages, incl. `model_client_init` / `model_call` / `model_parse` and four separate `context_read_*` | 11 seams; "context assembly is one seam, not three" | **15 ratified stages** |
| Correlation | UUIDv4, `x-idea-attempt-id`, malformed → **server mints replacement** + `attempt_id_source` | bounded token, `x-ideas-attempt-id`, malformed → `null` | **ratified contract** |
| Runtime provenance | composite: `git_commit`, `source_state`, `build_digest`, `source_digest`, `digest_scope`, `digest_subject`, `digest_alg` + `taxonomy_version` | `runtime_revision: string` from `GIT_COMMIT` | **composite + taxonomy_version** |

The collapse mattered most at the model boundary: `model_client_init`,
`model_call` and `model_parse` **are** INV-2's ranked candidates C1, C2 and C3.
A single `model_call` seam cannot rank them, which is the whole reason the lane
was authorized.

`claude/ideas-cut02-t1-fault-localization-rlfash` is **preserved untouched** at
`d2a2aa7` as custody of the failed candidate. Nothing was force-pushed or
rewritten. Its zero-diff and sanitization test *ideas* were carried across and
rewritten against the ratified contract; none of its code was.

## 1 · What was built

- `lib/ideas/attemptInstrument.ts` — closed stage and error-class vocabularies,
  the two-identifier contract, the composite `runtime_revision`, the
  admissibility ladder, sanitized stack evidence, upstream field extraction,
  allowlist-only record construction, one JSON line under `[ideas/attempt]`.
- Seams wired at all fifteen stages across four files:
  `page.tsx` (`attempt_open`, `attempt_close`) ·
  `blocks/route.ts` (`autosave_write`) ·
  `ask-maia/route.ts` (nine) ·
  `maiaThreadReflection.ts` (`model_client_init`, `model_call`, `model_parse`).

Two decisions worth naming:

**C1/C2/C3 are bracketed by hand, inside the primitive.** The route hands the
context down rather than wrapping `generateThreadReflection` in a fourth seam —
a wrapper would re-collapse the three from the outside, which is the drift that
failed the last candidate.

**C3 is observed, not repaired (P4).** The original expression
`response.content[0]` followed by `content.type` is left byte-for-byte intact,
so an empty `content` array still raises the same `TypeError` it raises today.
An earlier version of this work added a `content === undefined` guard; that was
a fix smuggled in under an observability change, and it was reverted.

## 2 · Proof obligations

**83 tests, 3 suites, all passing.**

| | |
|---|---|
| **P1** | one `entered` + one resolution per seam; none silent, none doubled; closed vocabulary only; `entered` never carries a duration |
| **P2** | each induced failure yields the correct class; **the four `context_read_*` seams are proven not to blame one another** |
| **P3** | C1/C2/C3 mutually distinguishable — each failure names one seam and rules the others out |
| **P4** | empty `content` → `model_parse`, **still a 500 with the same body, no reflection persisted** |
| **P5** | `upstream_status` · `upstream_request_id` · `upstream_error_type` · `retryable` captured; a non-retried class records `retryable: false` |
| **P6** | one `attempt_id` joins the **succeeded autosave** and the **failed reflection** across two requests — the witnessed shape |
| **P7** | malformed/absent header never fails the request; server id minted and marked; rejection reaches no body or header |
| **P8** | 201/401/400/404/500 bodies byte-identical; no stage, class, or id leaks; no response header added on any path |
| **P9** | no member text, title, framing, model output, or secret in any record — asserted over the **serialized** record, on success and on every failure path; no field outside the §3 shape |
| **P10** | no partial `maia_reflection`, no touch, when the model fails |
| **P14** | throwing sink and disabled instrument both leave status, body, and side effects unchanged |
| **P15** | forged/foreign `attempt_id` selects, authorizes and mutates nothing — SQL parameters proven identical either way; `idea_id` recorded only after ownership |
| **P16** | composite + `taxonomy_version` on every event; ladder enforced; unstamped runtime reads `unknown`, never fabricated |
| **P17** | `stack_fingerprint` stable across messages and message-free; `source_frames` repo-relative only; un-normalizable stack → `null`, never a partial dump |
| **P18** | `disk_tree` capped at diagnosis-only under hot replacement; `process_start` capped on dev; **negative case** — a *stable* runtime capped at disk-tree claims only, because absence of module replacement proves stability, not equivalence |
| **P19** | `digest_alg` names a pinned hash and an **enumerated** input set; reproducible, order-independent, byte-exact (CRLF ≠ LF), path-bound; refuses on a missing input; **negative case** — dependency claims refused, and a lockfile would not lift the refusal |

**P12** — the T1 half holds *unconditionally*: no record carries content under
any configuration, so there is nothing for Sanctuary to suppress. The T2 half
(durable tier not written under Sanctuary) is T2's.

**P11 and P13 are T2 obligations and are NOT claimed.** P13 in particular — the
unresolved `entered` that names an interrupted seam — is the property T1
structurally cannot provide, because the process death takes stdout with it.

## 3 · Acceptance gate — honest status

| Gate | Result |
|---|---|
| P-obligations under `jest` | ✅ 103/103 (T1 obligations only) |
| `npm run typecheck` | ✅ no regressions (231 vs 239 baseline; baseline deliberately not re-recorded) |
| `npm run check:no-supabase` | ✅ clean |
| `npm run preflight` | ❌ **red at the pristine base** — see below. **NOT WAIVABLE** |
| Co-Lab release gate | n/a — no migration (T2 only) |
| Member-facing diff empty | ✅ proven per P8/P10/P14 |

**Two gate caveats, neither hidden:**

1. **`npm run preflight` fails on the untouched base.** `check-dark-text-opacity`
   flags `app/studio/field/page.tsx` and `app/studio/layout.tsx`;
   `check:no-direct-anthropic` also exits non-zero. Both were verified by
   stashing this lane entirely and re-running against pristine `2c7f7e3` — they
   fail identically with zero changes, and neither names a file this lane
   touches. Fixing them is out of this lane's scope. The remaining six preflight
   steps were run individually and all pass.

   **Adjudicated: the red is not waivable.** `preflight clean` is a shipment
   gate; a pre-existing failure is not permission to weaken it.

   ```
   T1 caused the red?           NO
   T1 authorized to repair it?  NO
   May the red be waived?       NO
   T1 may ship while red?       NO
   ```

   So T1 does not ship, and does not proceed to its real-member witness, until
   the red is cleared by a separately authorized act outside this lane.

2. **`npm run typecheck` does not cover two of the four wired files.**
   `tsconfig.ship.json` includes `app/**` but only named `lib/` subdirectories —
   `lib/ideas/**` and `lib/team/**` are outside the program. A green gate here
   is therefore *not* evidence that the instrument or the model primitive
   typecheck. `tsconfig.t1.json` was added to check them explicitly; both are
   clean. This is the same class of coverage gap named in
   `TYPECHECK_GATE_COVERAGE_AUDIT_2026-07-30`, and it is worth a separate
   decision about whether `lib/ideas` and `lib/team` should enter the ship
   program.


## 3a · Contract repairs (adjudication 2, 2026-09-02)

Four defects were found by reading the implementation against the contract
rather than against its test suite. Each had passing tests that did not assert
the property the defect broke — which is the failure mode worth naming: a green
suite proved the happy path while the invariant went unchecked.

**1 · P1 double-resolved semantic refusals.** `session_resolve` and `idea_fetch`
fail by RETURNING — a null session, a zero-row ownership query — not by
throwing. `runStage` therefore resolved them `completed`, and the route then
emitted `failed`: one seam, **two resolutions**. That breaks the property T2
depends on, where an `entered` with no resolution localizes an interrupted seam.

Repaired structurally rather than at the call sites: `runStage` now takes a
`refusal` classifier that resolves the seam as `failed` **instead of**
`completed`, never in addition. Negative controls assert `1 entered · 1 failed ·
0 completed` at both seams, plus a sweep proving **no seam on any path** carries
two resolutions.

**2 · `recognition` was partly outside its own seam.** `getRecentRecognitionEvents()`
ran before the boundary, so a throw there landed at the outer catch while the
seam stayed silent about a fault entirely its own; and the disabled path emitted
nothing at all. The whole phase, prerequisite read included, is now inside the
seam, and the closed-gate case resolves `completed` — "the gate was closed" is a
real observation, distinguishable from an absent record. No recognition behavior
changed.

**3 · Two `attempt_close` records per member act.** The server closed on the ask
route and the client mirrored it. The precision is now frozen as ruled:

```
BEFORE the ask request is dispatched → the client may terminally close an
                                       act that aborts during autosave
ONCE dispatched                      → the server owns attempt_close;
                                       the client does not mirror it
```

The precise claim, which is narrower than "one close per act":

```
exactly one attempt_close on every covered path
transport loss after dispatch remains deliberately unclassified
```

⛔ A response lost in transport after dispatch is deliberately **not** given a
taxonomy. That is a separate observability question and must not acquire
semantics as a side effect of this repair — so the hole is stated rather than
papered over. A whole-act test drives both real routes and asserts one
`attempt_close` per act on the covered paths; the client half is a structural
guard, stated as such, because the handler is an unrendered React component.

**4 · P18 promoted a label as though it were an attestation.** `admissibility()`
reached `deployed_runtime` whenever `build_digest !== null`, even with a
`disk_tree` subject — and the test that blessed it supplied only the string
`sha256:img`, calling it "attested" while establishing nothing. A build digest
is a **build-arg label**: it proves the image was tagged with that identity, not
that its bytes derive from the digested tree, and the post-swap deploy verify
compares that same label so it cannot supply the binding either.

Now fails closed:

```
disk_tree + build_digest only   → disk_tree_only
loaded_modules                  → may promote
verified build attestation      → may promote, once such a proof exists
```

No `attested=true` flag was added — that would move the unsupported assertion
one field over.

**4b · The replacement rule moved the same defect one level over
(adjudication 3).** Promotion was then gated on `digest_subject ===
'loaded_modules'` — with no requirement that a loaded-modules digest existed.
`digest_subject` is a **label** exactly as `build_digest` is: a record can claim
any subject, and a claimed subject is not a digest of loaded modules. The test
that blessed it supplied no `source_digest`, no `digest_scope` and no
`digest_alg`. T1 has no loaded-modules digest implementation at all; its only
mechanism digests five enumerated source files on disk.

Promotion is now gated on a registry of the mechanisms this build **actually
implements**, keyed by the `digest_alg` each one stamps. A digest counts as
evidence only when a value is present, its `digest_alg` names an implemented
mechanism, **and** the record's `digest_subject` matches what that mechanism
digests — a record claiming a subject its algorithm does not produce is
*describing* a mechanism rather than reporting one, and is disregarded per
§3.3.6 (a digest that cannot be recomputed is an identifier, not evidence).

The honest consequence, stated plainly:

```
T1 HAS NO PATH TO deployed_runtime ADMISSIBILITY.
```

`DEPLOYED_RUNTIME_REACHABLE` is **derived** from that registry rather than
asserted, so it flips on its own the day a real mechanism lands and not one
moment before. Four controls: the bare-subject case named in the adjudication;
a `loaded_modules` subject paired with a hand-supplied digest under the
disk-tree algorithm; an unrecognized `digest_alg`; and an exhaustive sweep over
the whole field space (972 combinations × both runtime classes) asserting that
**no combination of self-reported fields reaches the top row**. That is what
makes the ceiling structural rather than a chain of individually-correct
branches.

## 4 · Held, as ruled

```
BASE / CUSTODY       PASS
AUTHORIZED BRANCH    PASS
PRIOR SPECIMEN       PRESERVED at d2a2aa7, untouched
15-STAGE MAP         PASS — single-resolution and recognition defects repaired
ATTEMPT-ID CONTRACT  PASS
COMPOSITE REVISION   PASS — promotion gated on implemented mechanisms;
                     deployed_runtime is UNREACHABLE in T1, by derivation
OUTER BRACKET        PASS — one attempt_close on every covered path; ownership
                     frozen at dispatch; transport loss after dispatch is
                     deliberately unclassified and stated as open

T1 IMPLEMENTATION    NOT CLOSED — awaiting adjudication of these repairs
T1 MAY SHIP          NO — preflight red, and the red is not waivable
T1 REAL-MEMBER WALK  NOT YET
REPRODUCTION         HELD
T2                   UNAUTHORIZED — no schema, no migration, no durable tier
C3 / C5              UNTOUCHED — C3 observed and left standing (P4)
FAULT INJECTION      none added; §6 forbids it and no injection surface exists
CUTS 3–4             untouched
```

**The defect is not closed.** T1 closes stage-localization. Durability — the
half that matters when the process dies before the retry — is T2's, and this
document must not be cited as having closed it.

## 5 · For adjudication

1. **Does the implementation match the contract** at the three points the last
   candidate drifted: the 15-stage vocabulary, the attempt-id replacement
   semantics, and the composite `runtime_revision`?
2. **The digest's input set** is five enumerated files (§3.3.6 requires
   enumeration, not "the repo"). It is opt-in via `IDEAS_ATTEMPT_SOURCE_DIGEST=1`
   and computed once per process, so it is honestly labelled
   `digest_scope: process_start`, `digest_subject: disk_tree` — which under
   §3.3.4 caps it at diagnosis-only on the dev runtime where the witnessed 500
   occurred. That is the correct ceiling, and it means the digest does not yet
   buy admissibility. Whether to pursue a `loaded_modules` digest or a verified
   build attestation is a decision this lane deliberately did not take.
3. **The preflight and typecheck-coverage findings** in §3, neither of which
   this lane created or fixed. The preflight red now blocks shipment and the
   real-member witness, per the gate ruling.

4. **The real-member witness, when authorized**, should be deliberately boring:
   one normal Ideas act on this exact SHA — write → choose Distill → Ask MAIA —
   with **no attempt to reproduce the 500**. It verifies that one `attempt_id`
   crosses the autosave and Ask records, that distinct server `request_id`s
   exist, that every reached seam resolves exactly once, that nothing
   instrument-related appears in the UI or any HTTP response, and that the
   runtime evidence reports its admissibility ceiling correctly (on a dev
   runtime that ceiling is `diagnosis_only`, and it should say so). Note that
   **no runtime can currently reach `deployed_runtime`**, so the witness should
   confirm the ceiling is reported honestly, not look for admissibility it
   cannot have.
