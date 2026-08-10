# JARVIS Unit 15 — Verified Delegation Issuance + Authentication

**Status:** implemented and proved. **The MAIA bridge remains unimplemented.**
**Work unit:** `jarvis-unit-15-verified-delegation`
**Branch:** `chore/jarvis-unit-15-verified-delegation`
**Base:** `dcee1f37f` (Unit 14 — principal identity + public run objective)
**Date:** 2026-08-10

This record stands without conversation context.

---

## 1. The gap this closes

Unit 14 gave the runtime a truthful place to *put* a principal and validated a
delegation's shape, scope, ceiling and expiry. Its own §14 recorded the limit:

> **Delegation is validated, not authenticated.** The runtime checks a
> delegation's *shape, scope, ceiling and expiry* — it does not yet verify a
> signature or consult an issuing authority.

Concretely, `authority_source` was checked for **presence only** — a non-empty
string. A caller could construct its own envelope and name its own authority.

> **self-asserted delegation metadata ≠ verified delegated authority**

Unit 15 supplies the missing antecedent:

```
authorized issuer → legitimate issuance → integrity → verification
                  → (then, unchanged) Unit 14 admission → runtime governance
```

Unit 14's downstream checks were **not redesigned**. They were already sound
*conditional on the envelope being genuine*; this unit supplies that condition.

---

## 2. Architecture chosen: server-side authoritative record (§5 option A)

Issuer and verifier are the same process on the same host, with a durable local
store already in use. So a delegation is an **authoritative record held by the
runtime**, and the caller holds only an opaque `dlg-<12 hex>` id.

With no cryptography this yields:

| Property | How |
|---|---|
| Integrity | The caller never holds the authority content, so it cannot alter it — strictly stronger than *detecting* tampering |
| Revocation | A status flip, effective immediately, with no token lifetime to wait out |
| Privacy | Subject scope and issuer never leave the runtime |
| Audit | The record *is* the audit trail |

A MAC or signature would add ceremony without adding a property we lack. §5 warns
against choosing cryptography for appearance; the honest smallest architecture
here is the reference.

**If issuance ever moves off-host, this becomes a hybrid** (reference +
integrity proof). Recorded, not pre-built.

---

## 3. Files

| Path | Role |
|---|---|
| `scripts/builder/jarvis-delegation.mjs` | **New.** Issuer registry, issuance, verification, revocation, target classes, public projection |
| `scripts/builder/jarvis-runtime.mjs` | Verification seam before Unit 14 admission; `bridgeMode`; audit + `publicRun` projection |
| `scripts/builder/jarvis-principal.mjs` | Control-character hygiene fix only (§11) — no behaviour change |
| `scripts/builder/__tests__/jarvis-delegation-proof.mjs` | **New.** 45 cases — D1–D9, A1–A6, V1–V12, W1–W8, M1–M10 |
| `package.json` | `jarvis:delegation:proof` |

---

## 4. The five things kept separate (§2)

| Concept | Meaning |
|---|---|
| **Principal claim** | Who the request says the requester is |
| **Issuer** | The authority that minted the delegation |
| **Delegation** | The bounded authority the issuer granted |
| **Authentication / verification** | Proof the delegation genuinely came from a trusted issuer, unmodified |
| **Admission** | The Unit 14 decision that the *verified* delegation permits this operation |

Never collapsed into one "authorized" boolean.

---

## 5. Authority root and issuer registry (§3, §7)

The smallest real root already on the host. No IAM system invented.

| Issuer | May grant to | Classes | Targets | Subject scope |
|---|---|---|---|---|
| `local-operator` | MAIA, SYSTEM_AUTOMATION, PRACTITIONER, MEMBER | R1A, R2 | all five | yes |
| `member-session` | MAIA | R1A | RUNTIME_STATE, DEPLOYMENT_SHA | **own subject only** |
| `practitioner-session` | MAIA | R1A | RUNTIME_STATE | **no** |
| `system-automation` | SYSTEM_AUTOMATION | R1A | RUNTIME_STATE, DEPLOYMENT_SHA | no |

Three structural facts:

- **No issuer may grant to `OPERATOR`.** Operator authority comes from local
  possession (Unit 11/12), never from a delegation — so a delegation can never
  manufacture an operator. Proved by A2.
- **MAIA is absent from the registry.** A future MAIA client may *carry*
  authority; it may not *manufacture* it. Proved by A3.
- **A practitioner cannot grant subject-scoped authority over a member.** That
  needs member consent, and practitioner standing never substitutes. Proved by A4.

An issuer is additionally bounded by the Unit 14 principal ceiling — two
independent bounds that must both hold, neither redundant (A6).

---

## 6. Target binding (§11)

`R1A_SYSTEM_READ` alone is far too broad: *read the deployment SHA* and *read
secrets* are not the same authority. Targets are a **closed, structured
vocabulary**, never interpreted from prose:

`REPO_SOURCE` · `RUNTIME_STATE` · `DEPLOYMENT_SHA` · `RUN_HISTORY` · `WORKER_LOGS`

**There is deliberately no secrets target class.** Unreachable beats prohibited:
a class that does not exist cannot be granted by an over-broad delegation, a
future registry edit, or a typo.

---

## 7. Purpose (§12) — resolved: audit metadata only

Operation class + target class bind authority sufficiently. Enforcing `purpose`
would mean comparing prose, which is brittle and would invite semantic
interpretation of caller-supplied text. `purpose` is retained for audit and
intent, and is **not** part of the enforceable boundary.

---

## 8. The integrity seam

`delegationToUnit14()` rebuilds the delegation object Unit 14 reasons about
**from the authoritative record**. Nothing the caller sent survives into it.

That makes two guarantees true *by construction* rather than by check:

- **§13** a caller cannot extend expiry — its claimed expiry is not an input
- **§16** a caller cannot strip prohibitions — the list is read from the record

Proved by V10 and V11, including a request that supplies empty prohibition lists.

---

## 9. Refusal semantics (§20)

Internally the runtime distinguishes ten reasons: `DELEGATION_REQUIRED`,
`DELEGATION_UNKNOWN`, `DELEGATION_INVALID`, `DELEGATION_EXPIRED`,
`DELEGATION_REVOKED`, `DELEGATION_PRINCIPAL_MISMATCH`,
`DELEGATION_SCOPE_MISMATCH`, `DELEGATION_OPERATION_DENIED`,
`DELEGATION_TARGET_DENIED`, `DELEGATION_ISSUER_UNAUTHORIZED`.

The **public surface is coarse**: `AUTHORITY_NOT_ESTABLISHED`. A caller learns
authority was not established, not which of ten checks caught it. The exact
reason is retained internally for audit. Proved by W2.

---

## 10. Bridge mode (§18, §19)

`createRuntime({ bridgeMode: true })`, or `JARVIS_BRIDGE_MODE=1`. Off by default.

In bridge mode there is **no fallback to `LOCAL_OPERATOR`**: a bare packet is
refused, and an envelope carrying inline self-asserted delegation metadata is
refused. Only a verified `delegation_id` is honoured. Proved by W7.

> **`LOCAL_OPERATOR` compatibility is a compatibility path, not the trust
> mechanism for a future MAIA bridge.**

Outside bridge mode the Unit 11/12 operator path is untouched, and any request
that *does* present a `delegation_id` is still verified — there is no silent
bypass.

---

## 11. Defect fixed in the Unit 14 module

`jarvis-principal.mjs` line 93 contained **literal `NUL`, `0x1F` and `DEL` bytes**
inside the control-character regex, which made the file binary to `grep`/`diff`
and invisible to review. Replaced with escaped equivalents
(`/[\u0000-\u001f\u007f]+/g`). Behaviour is identical — the Unit 14 suite passes
unchanged at 25/25.

---

## 12. Tests

```
npm run jarvis:delegation:proof   →  45 passed, 0 failed
npm run jarvis:principal:proof    →  25 passed, 0 failed   (Unit 14, exactly as committed)
node .../jarvis-runtime-proof.mjs →  15 passed · 0 failed  (Unit 11)
node .../jarvis-desktop-proof.mjs →  20 passed, 0 failed   (Unit 12)
```

Hermetic; ephemeral ports; the delegate is stalled and never invoked, because
every case is decided at verification or admission, before dispatch. No live
runtime process was disturbed.

| Group | Coverage |
|---|---|
| **D1–D9** | issuance: trusted issuer, stable id, principal/subject/operation/target/expiry/prohibition recording, durable audit |
| **A1–A6** | issuer authority: cannot grant to ungoverned types, cannot mint OPERATOR, MAIA cannot self-issue, practitioner cannot grant member scope, member grants only own scope, cannot exceed Unit 14 ceiling |
| **V1–V12** | verification: valid, unknown, caller cannot mutate, expired, revoked, wrong principal, wrong subject, wrong operation, wrong target, cannot extend expiry, cannot remove prohibition, **untrusted issuer** |
| **W1–W8** | real-socket walks: admission, self-asserted string refused, principal replay refused, READ↛WRITE, cross-subject, revocation walk, bridge-mode fail-closed, publicRun privacy |
| **M1–M10** | mutation proofs — each weakens the logic and requires a real assertion to FAIL |

### V12 — the load-bearing case

A structurally perfect, internally consistent, genuinely stored delegation record
whose only defect is an issuer holding no authority is **invalid**. Issuer
legitimacy is re-checked at *verification*, not only at issuance — so a record
written by another path, or one whose issuer's registry entry later narrows, is
refused.

> **A perfectly authentic delegation from an unauthorized issuer is invalid.**

This is what stops *"cryptographically valid"* from quietly becoming
*"constitutionally authorized."* V12 also covers a *trusted* issuer whose record
claims more than its registry entry permits.

---

## 13. What is still NOT true

- **No MAIA caller exists.** No bridge endpoint, no conversational route change,
  no member context, no JARVIS invocation from MAIA.
- **No member data retrieval.** `R1B_MEMBER_READ` remains above every principal's
  ceiling. Subject scope is *representable and bindable*, not *readable*. All
  subjects in tests are synthetic (`member-A`, `member-B`).
- **No WRITE authority.** `R4/R5/R6` refused at issuance, verification and admission.
- **No production change**, no deploy, no migrations, no feature flags.
- **Founder-input authentication is open** — see §14.
- **Revocation is not retroactive.** A run already admitted stays admitted; the
  audit shows both the prior admission and the later revocation. That is
  deliberate — retroactive invalidation of completed evidence would be a
  different and much larger claim.
- **No `CONSUMED` / one-shot semantics.** Not added without evidence of need.

---

## 14. Next architectural dependency — founder-input authentication (§32)

**Recorded, not implemented.**

A conversational statement such as *"Founder ruling: allow X"* arriving through
MAIA has **conversational input standing only**. It must not be elevated to
founder authority because the text says "founder ruling."

Unit 15 establishes authenticated delegation *issuance*. The next authority unit
must determine how authenticated founder/operator input is bound to an authorized
channel and elevated from **conversation content** to **founder-authorized
instruction**.

This connects to two things already recorded: Unit 13's **T1** (prompt injection
causes system action, ranked CRITICAL) and Unit 13 **§11/§28** input standing,
where a conversationally-arriving premise carries `MAIA-inferred` standing and is
a *question for verification*, never an authority. Founder-input authentication is
therefore a **standing-elevation mechanism**, not a new authority type.

---

## 15. Next bounded unit

**Founder / operator input channel authentication** — binding authenticated
operator instruction to an authorized channel, so a ruling can be distinguished
from a sentence that describes one.

After that, and only then, a **shadow bridge**: the verified-delegation path
exercised end to end with synthetic principals and scopes, zero member data, and
no member-visible effect.
