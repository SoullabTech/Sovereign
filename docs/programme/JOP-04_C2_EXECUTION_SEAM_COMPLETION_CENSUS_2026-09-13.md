# JOP-04 · C2 — Execution-Seam Completion Census

**Run:** 2026-09-13 · **Method:** read-only at `e1c6f527` · **Evidence class:** E
⛔ **No repair. No spec implementation. No write capability. Nothing designed.**

---

## Headline

```text
THE REGISTRY IS THE AUTHORIZATION ON ONE LIVE PATH.

router.mjs:33   membership in CAPABILITIES  →  execution_lane 'C0'
main.js:751     lane 'C0'                   →  runCapability(...)

No gate. No packet. No permission envelope. No actor. No work unit.
```

⭐ **Securing `runCapability` alone is insufficient — the grant happens one step
earlier.** `route()` confers C0 *because the name is in the registry*. Adding an effect-bearing
capability would therefore grant it ungoverned execution **at registration time**, before any seam
could refuse it.

⛔ This makes the founder's standing prohibition **tighter than stated**: not only "while
`runCapability` can execute from `name + args + cwd` alone", but **while `route()` treats registry
membership as an execution grant and `jarvis:submit-task` executes C0 without governance.**

## 1 · Completed execution call graph

```text
                    ┌──────────────────────────────────────────┐
                    │  jarvis-desktop/src/main.js (main proc)   │
                    └──────────────────────────────────────────┘
                         │                              │
   ipcMain 'jarvis:run-work-unit' :699      ipcMain 'jarvis:submit-task' :727
                         │                              │
   packet + lane pinned to                    route(task)  router.mjs:32
   MECH.AUTHORIZED_LANE ('local-native')                  │
                         │                     ┌─────────┴──────────┐
   MECH.runWorkUnit(root, packet, {})       C0 (registry hit)    C1 / C3
   builder-mechanism.js:161                    │                  │
                         │                     │            model lanes
   ── GOVERNED LANE ──   │                     │            (C3 not auto-run)
   checkAuthority(packet)                      │
   validatePacket                              ↓
   packet guard / partition            runCapability(task.capability,
   runtime store receipts                       task.args || {},
                                                currentRoot())      main.js:750-751
                                                │
                                        ── UNGOVERNED LANE ──
                                        name + args + cwd only
```

The source states the split itself (`main.js:723-726`): *"this is no longer the ONLY execution
surface: the governed work-unit mechanism above is a second one, on a different lane vocabulary…
The two do not overlap, and neither is a route into the other."*

⭐ **Accurate, and load-bearing in the opposite direction from how it reads.** Two non-overlapping
execution surfaces means **governing one governs nothing about the other.**

**Production callers of `runCapability`: exactly one** — `main.js:751`. All other references are
tests (`deterministic-registry-proof.mjs`, `router-alpha-proof.mjs`, `desktop-c0-explorer-proof.mjs`)
or a non-executing manifest reader (`capability-form.js`, `main.js:655` `jarvis:capabilities`).
Nothing in `lib/`, `app/` or `scripts/` outside `scripts/builder/` reaches it.

## 2 · The twelve questions

| # | Question | Answer |
|---|---|---|
| 1 | Call paths reaching `runCapability` | **One production path**: `jarvis:submit-task` → `route()` → C0 → `runCapability` (`main.js:727-751`). Tests aside, no other. |
| 2 | Does any path carry actor/session/execution identity farther than C1 saw? | ⛔ **No.** `submit-task` receives `(_evt, task)` and discards `_evt`; no actor, session or principal travels. `run-work-unit` carries a packet but never reaches `runCapability`. |
| 3 | Object representing **resolved authority**, bindable to an invocation? | ⛔ **No.** `resolveGovernanceGate` returns a gate record; `derivePermissionEnvelope` returns booleans; `checkAuthority` returns `{ok}` / `{failure_class}`. **None names an invocation.** |
| 4 | Object representing a **separate execution decision**? | ⛔ **No.** Execution follows routing with no intervening decision — `if (decision.execution_lane === 'C0') { … runCapability(…) }`. |
| 5 | Canonicalized invocation representation before execution? | ⛔ **No.** `name`, `args`, `cwd` are supplied independently; `cwd` is `currentRoot()`, not part of the request; `task.args \|\| {}` is passed through raw. |
| 6 | `objectiveDigest` lifecycle | **Created** `jarvis-governance-gate.mjs:91`. **Checked** `:153-154` (claim vs run objective), `:173` (scope objective). **Emitted** into the gate `:196`, projected `:296`. ⛔ **Never propagated to execution** — it terminates at the gate boundary and `runCapability` has no parameter that could receive it. |
| 7 | Can a digest / authority result be replayed or transferred? | 🔴 **Structurally yes.** `objectiveDigest` is `sha256(objective_text)` and binds **nothing else** — not capability, args, path, subject or identity. Because no execution path ever compares a gate result to an invocation, **the same gate result is equally "valid" for any invocation.** ⚠️ Not an exploit claim: today no gate result reaches execution at all. It is a statement about the primitive's binding power. |
| 8 | Does `epistemic-guard` participate in execution eligibility? | ⛔ **Neither — it is claim/evidence admissibility.** It *"adjudicates ONE claim record at a time and REFUSES promotion when the cited evidence cannot carry the requested epistemic status"* (`:1-22`). Explicitly *"not a fact checker… not a ratifier… not a linter of code."* ⭐ Relevant to JOP-04 as **form**, not as a gate. |
| 9 | Can Desktop invoke `CAPABILITIES`/`runCapability` outside the C1 governance composition? | 🔴 **Yes — and it is the only way it is invoked.** `jarvis:submit-task` is outside the governed lane by design and by comment. |
| 10 | Parallel execution mechanisms that would escape a future seam | **Yes, three.** (a) the governed `run-work-unit` lane — separate and already authority-checked; (b) `route()`'s C1 lane, which materializes packets and verifies evidence but executes a model, not a capability; (c) ⭐ **`route()` itself** — the C0 grant is made *before* the seam, so a seam placed only inside `runCapability` is downstream of the decision that authorized it. |
| 11 | **D1 / D4 verdicts** | see below |
| 12 | **CANONICALITY** | see §4 |

## 3 · D1 and D4, resolved

**D1 — confirmation masquerading as authorization: ⛔ ABSENT.**
Both `dialog.showMessageBox` sites in `main.js` (`:343`, `:415`) concern **repository binding** —
*"That folder is not a Sovereign checkout"*, *"JARVIS has not been told which repository to use"*.
Neither authorizes an act. **No human-confirmation-of-an-effect path exists anywhere in the
substrate.**

⭐ **This is a favourable finding, precisely stated:** D1 cannot be present because the system has
never asked a human to authorize an execution. JOP-04 builds that from zero and can therefore build
it correctly, rather than having to break an existing *"Are you sure?"* habit.

**D4 — retry duplication: ⚠️ PARTIAL, and split across the two lanes.**
`recordAttempt` / `max_attempts` (`work-unit.mjs:187`, `:274`, `:346`) is a **retry budget in the
governed lane** — it counts attempts, it does not deduplicate effects. ⛔ **The `submit-task` path
has neither**: no attempt record, no idempotency key, no dedupe, no request identity. A repeated IPC
call is simply a second execution. Harmless for reads; **exactly D4 for an effect.**

## 4 · CANONICALITY — what is normalized, by whom

| Step | Normalization |
|---|---|
| `task.capability` | none — exact string match against registry keys |
| `task.args` | **validated, not canonicalized** — type, `maxLength`, `min`/`max`, `enum`, and an unexpected-key refusal |
| path-shaped args | containment **checked** via `resolve(cwd, value)` — ⚠️ **only when the value starts with `/` or contains `../`** |
| `cwd` | `currentRoot()` — supplied by the host, never by the request ⭐ |

⭐ **Two findings a future binding step must inherit:**

1. **Containment is verified against the resolved form; the handler receives the unresolved form.**
   `validatedArgs[argName] = value` is assigned in the validation loop; the later path loop computes
   `resolve(cwd, value)` **only to test it** and never writes back. So `./foo/../bar` and `bar` reach
   the handler as two different strings denoting one object. ⛔ **An invocation digest taken today
   would bind the spelling, not the act** — exactly the canonicality precondition the founder named.
2. **`fullPath.startsWith(cwd)` is a string-prefix test**, so a sibling path sharing a prefix with
   `cwd` satisfies it. ⚠️ Recorded as a **containment-primitive observation**, not an exploit: the
   guarded branch is only entered by absolute or `../` values, every capability is read-only, and
   `cwd` is host-supplied. It is named because a future seam must not inherit prefix-matching as its
   scope test.

**Answer to Q12:** equivalent invocations do **not** receive one stable representation. ⛔ There is
no canonical invocation form to bind to.

## 5 · Existing primitives a future seam must inherit

| Primitive | Where | Why it is worth inheriting |
|---|---|---|
| **Closed-set admission** | `runCapability` — unknown name, unknown arg, wrong type, oversize, unlisted enum all `throw` | already the strictest thing in the substrate |
| **Host-supplied `cwd`** | `main.js:751` `currentRoot()` | scope root is not caller-controlled — ⭐ the one place authority already outranks the request |
| **argv-array execution** | `execFileSync`, no shell | proven against injection (`deterministic-registry-proof.mjs:53`) |
| **Lane pinning** | `main.js:706` lane pinned to `AUTHORIZED_LANE`, not taken from the caller | the pattern an `ExecutionPermit` needs |
| **Fail-closed materialization** | `main.js` C1 branch — an unresolvable selector must not degrade into "no evidence required" | the right refusal posture |
| **Append-only receipts** | `jarvis-runtime-store.mjs` `EVENTS_LOG` | receipt substrate exists; binding does not |
| **Discovery ≠ execution proof** | `desktop-c0-explorer-proof.mjs:235`, `desktop-preload-allowlist.mjs:42` | ⭐ an existing, enforced separation of *seeing* from *doing* — the read-side twin of the law JOP-04 needs |
| **`epistemic-guard` form** | refuses *promotion* when cited evidence cannot carry the requested *status* | the same shape an execution decision needs: a claim is not its own warrant |

## 6 · The bypass that makes securing `runCapability` alone insufficient

> **`route()` grants C0 on registry membership (`router.mjs:33`), and that grant is made before any
> seam inside `runCapability` could examine it.**

A seam that sits only at execution can refuse an invocation. It cannot refuse a **grant already
made by registration**. Any future design must therefore address **two** boundaries:

```text
REGISTRATION BOUNDARY      what may enter CAPABILITIES, and what that entry confers
EXECUTION BOUNDARY         what may be executed, on what constituted permission
```

⛔ C2 designs neither.

## 7 · Smallest next specification act

> **Specify the registration boundary before the execution seam.**

Because the grant precedes the seam, the first specifiable object is not `ExecutionPermit` but the
answer to: **what does membership in the capability registry confer, and what must a capability
declare about its own effect in order to be admitted at all?** ⭐ That question is answerable from
C1 + C2 evidence alone, requires no new primitive, and is a **precondition** for classifying,
canonicalizing or binding anything.

⛔ **Not authorized here. Named as the next act, not begun.**

## 8 · What C2 did not read

`session.mjs` beyond its header (concurrency governance — no execution path found by grep);
`epistemic-guard.mjs` beyond its header and guard list; `rate.mjs`; the bodies of
`resolveGovernanceGate` / `validateWorkerGate` beyond the `objectiveDigest` call sites;
`builder-mechanism.js` beyond its lane constants and `runWorkUnit` signature; `jarvis-context.mjs`;
the renderer/preload surface beyond the two cited proofs.

⛔ Unread is **not** absent. Q2, Q3 and Q4 answers are negative **for the paths traced**, which are
the only ones reaching `runCapability`.

---

```text
D1   ABSENT      no confirmation-of-act exists — build from zero
D4   PARTIAL     retry budget in the governed lane; nothing in the executing lane
Q3   ABSENT      no resolved-authority object is bindable to an invocation
Q4   ABSENT      no separate execution decision exists
Q5   ABSENT      no canonical invocation form
Q12  ABSENT      equivalent invocations get different representations

BYPASS           route() grants C0 at registration, upstream of any seam
NEXT             specify the REGISTRATION boundary first

NOTHING BUILT · NOTHING DESIGNED · NO CAPABILITY ADDED
```
