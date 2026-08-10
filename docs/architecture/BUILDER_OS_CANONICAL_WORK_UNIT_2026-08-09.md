# Builder OS — Canonical Work Unit Reconciliation (MVJ Unit 5)

**Date:** 2026-08-09 · **Authority:** founder directive, MVJ Unit 5 · **Precondition:**
non-Claude closed loop PROVEN (`docs/ops/AIN_DELEGATION_PROVING_CASE_2026-08-09.md`).

**Scope discipline:** no worker proving cases rerun, no local-inference repair, no new
worker, no Claude adapter, no model routing, no conversational Founder Input Resolution,
no desktop UI, no MAIA/JARVIS field cooperation, no MAIA product code, no deployment.

---

## 0. Headline

JARVIS maintained the same piece of work in two places that could silently drift: the
execution **packet** (`AIN_WORK_PACKET_CONTRACT.md`, read by `ain-delegate.sh`) and the
Builder **session/claim** (`session.mjs`, the runtime attempt) — connected only by a
shared `work_unit_id` string, with no query layer able to say what either meant together.

**Resolution: the packet file becomes the canonical Work Unit**, extended with optional,
defaulted fields. No new storage location, no migration, no second ontology. A thin query
layer (`scripts/builder/work-unit.mjs`) assembles packet + session + result(s) into one
deterministic answer. **`ain-delegate.sh` and `session.mjs` were not modified** — their
proven Horizon III / Kimi-closed-loop behavior is not reopened by this unit.

---

## 1. Field-by-field reconciliation

Classified per the directive's own categories. **SAME** = identical name+semantics ·
**ALIAS** = different name, same semantic · **PACKET-ONLY** = correctly stays in the
execution artifact · **SESSION-ONLY** = correctly stays attempt-scoped · **DERIVED** =
computed, never stored · **RESULT-ONLY** = correctly stays outcome-scoped · **CONFLICT** =
genuinely incompatible · **UNKNOWN** = not represented anywhere.

| Concept | Packet | Session | Result | Classification | Disposition |
|---|---|---|---|---|---|
| **Identity** | | | | | |
| id | `work_unit_id` | `work_unit` | `work_unit_id` | **ALIAS** (3 spellings, 1 semantic) | Left as-is — renaming three proven, working consumers is out of scope; the query layer normalizes on read. |
| project | — | — | — | **UNKNOWN** | New optional field, defaults `null`. |
| capability | — | — | — | **UNKNOWN** | New optional field, defaults `null`. |
| title | `title` | — | — | **PACKET-ONLY** | Correctly stays (human label, attempt-invariant). |
| **Intent** | | | | | |
| objective | `objective` | — | — | **PACKET-ONLY**, WU-level | Correct as-is — attempt-invariant. |
| task_class | — | — | — | **UNKNOWN** | `execution_lane` conflates "intended worker" with classification; new optional `task_class` added, distinct. |
| risk_class | `governing_authority` (textual proxy) | — | — | **CONFLICT-adjacent** | New optional `risk_class`, default `"mechanical"`; `governing_authority` remains the authority *citation*, not a structured risk tier. |
| priority | — | — | — | **UNKNOWN** | New optional field, defaults `null`. |
| **Authority** | | | | | |
| governing authority | `governing_authority` | — | — | **PACKET-ONLY**, WU-level | Correct as-is. |
| authorized acts | authority-firewall text (constant, not data) | — | — | **CONFLICT** — hard-coded prose, not structured | New `authorized_acts[]`, structured, optional, defaulted. |
| prohibited acts | `prohibited_files_actions` | — | — | **PACKET-ONLY**, WU-level | Correct as-is; new `not_authorized_acts[]` adds the *non-file* authority dimension. |
| autonomy ceiling | — | — | — | **UNKNOWN** | New optional `autonomy_ceiling`, default `"LEVEL_2_IMPLEMENT"`. |
| integration actor | — | — | — | **UNKNOWN** — this is the exact gap the Kimi closure exposed | New optional `integration_actor`, default `"jarvis"`. |
| **Dependency** | | | | | |
| prerequisites/blockers | — | — | — | **UNKNOWN**, entirely | New `dependencies[]` (informational, non-recursive) + `blockers[]` (drives lifecycle). See §4 for why they're treated differently. |
| **Workspace** | | | | | |
| repository | implicit (`PROJECT_DIR`) | implicit | — | **DERIVED** | Not stored; correct as-is. |
| starting SHA | `canonical_sha` | `baseline.head_sha` | `starting_sha` | **ALIAS** (3 spellings — the most fragmented field in the system) | Left as three names; each is correct in its own layer's vocabulary. Documented here so a future reconciliation doesn't rediscover it as three separate bugs. |
| branch | `branch` | `branch` | — | **SAME** | Already aligned — no change needed. |
| worktree | `worktree` | `worktree` | — | **SAME** | Already aligned (and canonicalized via `realpathSync` since Horizon III). |
| owner | — | `owner` | — | **SESSION-ONLY** | Correct — ownership is who is running *this* attempt, not a WU property. |
| claim type | — | `mode` (write/read-only) | — | **SESSION-ONLY** | Correct as-is. |
| dirty fingerprint | — | `baseline.dirty_count/digest` | — | **SESSION-ONLY** | Correct — attempt-level measurement. |
| **Execution** | | | | | |
| intended worker | `execution_lane` | — | — | **PACKET-ONLY** | Pre-declaration of intended lane; correct as-is. |
| actual worker | — | `model` | `lane`, `model` | **ALIAS**-adjacent (intended vs actual, correctly distinct) | No change — the asymmetry (packet declares *lane*, result records *model*) is intentional per directive §6: model is a worker-adapter decision, not pre-declared. |
| provider | — | — | (implicit in `model` string) | **DERIVED** | Not separately stored; inferable from model+lane. Not worth a field yet (§14 — keep it small). |
| allowed/prohibited scope | `allowed_files`/`prohibited_files_actions` | — | — | **PACKET-ONLY**, WU-level | Correct as-is. |
| max attempts | `max_attempts` | — | — | **PACKET-ONLY**, WU-level (governs across ALL attempts) | Correct as-is; becomes meaningful now that attempts are actually plural (§5). |
| **Proof** | | | | | |
| acceptance criteria | `acceptance_criteria` | — | — | **PACKET-ONLY**, WU-level | Correct as-is. |
| verification spec vs record | `verification_commands` (spec) | — | `tests_run` (record) | **DERIVED-related, not aliased** | Two different lifecycle stages of one concept — spec (WU) vs execution record (result). Left distinct on purpose. |
| negative controls | — | — | — | **UNKNOWN** — genuine gap | Not added in this unit (§14 — no schema field invented without a concrete near-term consumer; recorded as an open gap, not silently filled). |
| evidence | — | — | `evidence`, `log_path` | **RESULT-ONLY** | Correct as-is. |
| **Lifecycle** | | | | | |
| attempt state | — | `state` (active/queued/closed+substate) | — | **SESSION-ONLY, a DIFFERENT grammar than WU lifecycle** | See §4 — this is the load-bearing distinction of the whole unit. |
| WU lifecycle | — | — | — | **UNKNOWN as stored data** | Computed by `deriveLifecycle()`, never stored (§4). |
| timestamps | — | `opened_at`/`closed_at`/`last_heartbeat` | `duration_s` only | **SESSION-ONLY** + minor gap (result lacks absolute timestamps) | Not fixed — noted, not blocking (§14). |
| attempt identity | — | `session_id` | — | **SESSION-ONLY**, correctly | A session id is inherently an attempt identifier, never a WU identifier. |
| result linkage | — | — | filename convention only | **DERIVED (implicit)** | Worked, but was a real latent bug: single-file `results/<id>.json` meant a **second attempt silently overwrote the first, destroying retry evidence** — directly contradicting "a Work Unit must survive retry." Fixed additively (§5). |

---

## 2. Work Unit vs execution attempt — preserved, not merged

> A **Work Unit** is the durable, attempt-invariant definition of bounded intended work.
> An **execution attempt** is one governed try at that Work Unit — a Builder session/claim,
> one delegate run, one result.

```text
WORK UNIT  (packet file, extended — the durable identity)
│  identity · objective · authority · dependencies · scope · acceptance criteria
│
├── EXECUTION ATTEMPT 1   (session s-36dd53b0 → result attempt #1, lane=kimi)
├── EXECUTION ATTEMPT 2   (a future retry → result attempt #2, any lane)
└── EXECUTION ATTEMPT N
```

The Kimi proving case is the concrete evidence this distinction is real, not aspirational:
the SAME `work_unit_id` (`proving-case-add-fn`) survived a local-lane harness failure, a
local-lane runtime failure, a permission-mode fix, and a worker change to Kimi — four
attempts, one Work Unit, proven by U4/U5 below against exactly that historical fixture.

---

## 3. Authority vs capability — preserved, not merged

> Worker capability does not imply authority. Model selection does not grant authority.

`authorized_acts` / `not_authorized_acts` / `integration_actor` are **Work-Unit-level**
facts — they do not change when the worker changes (U6, below). Kimi had the *capability*
to mutate files; it never had *authority* to integrate them — `integration_actor: "jarvis"`
is not a Kimi limitation being worked around, it is the Work Unit's own declared authority,
which any worker (including a future Claude adapter, Unit 6) inherits identically.

`derivePermissionEnvelope()` renders this as a **provider-agnostic capability envelope** —
`repo_write_scope`, `execute_checks`, `integration_actor`, `production_read/write`, `deploy`
— containing no vendor-specific string. Translating `repo_write_scope: 'worktree'` into a
specific harness's actual invocation flag (Claude Code's `--permission-mode`, or any future
provider's equivalent) is an **adapter's** job. This boundary is enforced, not just stated:
`work-unit-proof.mjs` U6 asserts the envelope never contains `"permission-mode"` or
`"bypassPermissions"`.

---

## 4. Lifecycle — reconciled, not proliferated

Two **different, correctly separate** grammars already existed:

- **Session/attempt lifecycle** (`session.mjs`, unmodified): `active → queued → completed |
  handed-off | paused | abandoned`. This governs one attempt.
- **Work Unit lifecycle** (directive §10's full vocabulary): `proposed, ready, blocked,
  needs_founder, claimed, running, verifying, review_required, ready_to_integrate,
  integrated, deployment_required, deployed, live_verification_required, closed, failed,
  superseded, contended`. **This was never stored as data anywhere** — it is now
  **derived**, not stored, by `deriveLifecycle({workUnit, session, result})`.

**Documented folds** (honesty over false precision — three files on disk cannot always
distinguish every named state):

| Folded together | Reported as | Why |
|---|---|---|
| `proposed`, `ready` | `ready` | Packets today are authored ready-to-run; nothing represents a lighter "idea" stage. |
| `claimed`, `running` | `claimed` | An active session with no result yet could be either — not observable from disk. |
| `verifying`, `review_required`, `ready_to_integrate` | `ready_to_integrate` | All three collapse to "a passing result exists, not yet integrated." |
| `deployment_required`, `deployed`, `live_verification_required`, `superseded` | *(preserved in vocabulary, unreachable)* | Nothing in this delegation system tracks deployment yet — the states are named, never produced. |

**`dependencies` do not recursively drive lifecycle.** Only explicit, human-authored
`blockers[]` do. Recursive dependency resolution would need each dependency's own
lifecycle resolved first — unbounded complexity for a unit whose mandate is "keep this
small" (directive §14). `dependencies` remain recorded and queryable, not load-bearing.

---

## 5. Result → attempts, additively

**Real bug found and fixed while implementing this (not by inspection — by the U4 proof
failing on its first run):** `recordAttempt`'s attempt-counter used `loadAttempts()`,
whose backward-compatibility fallback synthesizes an implicit "attempt 1" from
`result.json` when no history file exists yet — exactly the result about to be recorded.
Counting through that fallback double-counted the very first attempt as already-attempt-1,
producing attempt numbers `2, 3` instead of `1, 2`. Fixed by counting only real lines
already in `attempts.jsonl`, never through the read-time compatibility path.

`results/<id>.json` (single latest attempt) is **untouched** — `ain-delegate.sh` still
writes and reads exactly that file, unaware this unit exists. `results/<id>.attempts.jsonl`
is **additive**: `work-unit.mjs record-attempt` appends the current `result.json` as the
next attempt. If no `.attempts.jsonl` exists, a Work Unit with only a `result.json` reads
as one implicit attempt — **zero migration** for every result written before today.

---

## 6. Queryability (§9) — proven against real evidence, not just a fixture

```bash
node scripts/builder/work-unit.mjs status proving-case-add-fn
```

```
WORK UNIT  proving-case-add-fn
  lifecycle        integrated
  title            Proving case: trivial pure function + test, delegated to local lane
  risk/task class  mechanical / UNSET
  authority        none — mechanical task, proving case for the delegation control plane itself
  integration by   jarvis
  blockers         (none)
  active execution (none)
  latest result    pass via kimi
  attempts         1
  this Work Unit predates the Unit 5 schema extension — all missing fields defaulted, nothing migrated
```

This is the **real, unmodified, historical** `proving-case-add-fn.json` — not a synthetic
fixture. `lifecycle: integrated` is correctly derived from `result.integration.commit_sha
= 837f20bcf`, the actual commit from the Kimi closure. No conversation transcript,
no re-derivation, no prior session context was consulted to produce this answer.

---

## 7. Compatibility (§8) — proven, not assumed

- `ain-delegate.sh`: **zero lines changed.** Every packet it has ever written or will write
  remains a fully valid canonical Work Unit — new fields default; nothing is required.
- `session.mjs`: **zero lines changed.** Concurrency/ownership/collision governance,
  proven in Horizon III (54/54) and exercised for real in the Kimi closure, is untouched.
- `/orient`, `/continue`, founder status, Kimi lane, local lane: **zero lines changed.**
- The existing `proving-case-add-fn` packet: resolves correctly through the reconciled
  representation with no edits (U11).

---

## 8. Executable proofs

```bash
node scripts/builder/__tests__/work-unit-proof.mjs
```

| Proof | Assertion | Result |
|---|---|---|
| U1 | Canonical Work Unit creates/loads deterministically | **PASS** |
| U2 | Packet projection derivable, excludes WU-only fields | **PASS** |
| U3 | Session projection shares identity, creates no second WU | **PASS** |
| U4 | Second execution attempt belongs to the same Work Unit | **PASS** (after the counter-bug fix) |
| U5 | Worker change (kimi→local) creates no new Work Unit | **PASS** |
| U6 | Authority unchanged across worker/provider change; envelope provider-agnostic | **PASS** |
| U7 | Active execution reports correct worktree/claim state | **PASS** |
| U8 | Worker claim and independent verification remain distinct fields | **PASS** |
| U9 | Verified/integrated result advances lifecycle correctly | **PASS** |
| U10 | Fresh process reconstructs full state, no transcript | **PASS** |
| U11 | Real, unmodified `proving-case-add-fn` packet resolves, zero migration | **PASS** |
| U12 | Projected packet exactly matches the documented contract schema | **PASS** |

**37/37**, 0 failed.

**Full regression** (`npm run jarvis:proof` + this unit's suite), run from the **main
checkout**, not from this unit's own actively-claimed worktree — running the full suite
from inside a worktree that itself holds a live Builder claim makes `/orient`'s own
ownership check (correctly) report that worktree as claimed, which is self-collision from
location, not a code regression. Documented as a lesson for future units, not fixed by
weakening `/orient`'s governance:

| Suite | Result |
|---|---|
| session-proof | 54/54 |
| orient-proof | 33/33 |
| continue-proof | 27/27 |
| rate-proof | 24/24 |
| loop-governance-proof | 28/28 |
| incident-scenario-proof | 18/18 |
| run-check-proof | 15/15 |
| delegate-workspace-convergence-proof | 20/20 |
| work-unit-proof (this unit) | 37/37 |
| **Total** | **256/256, 0 failed** |

---

## 9. Known limitations — stated, not solved

1. Three spellings of "starting SHA" (`canonical_sha`/`baseline.head_sha`/`starting_sha`)
   remain three spellings. Unifying them means touching three proven, working consumers —
   out of scope for "reconcile," in scope for a future dedicated unit if it ever matters.
2. `dependencies[]` is recorded but not load-bearing — no recursive dependency resolution.
3. Negative controls have no schema field yet — a real gap, left open rather than filled
   speculatively.
4. Result timestamps are relative (`duration_s`) only; no absolute start/end captured.
5. The lifecycle folds in §4 are real information loss, documented rather than hidden.
6. `derivePermissionEnvelope()` is designed for a future adapter to consume — no adapter
   exists yet (Unit 6, founder-gated, not started here).

## 10. Not done, deliberately

No worker proving case rerun · no local-inference repair · no new worker · no Claude
adapter · no model routing · no conversational Founder Input Resolution · no desktop UI ·
no MAIA/JARVIS field cooperation · no MAIA product code · no deployment.
