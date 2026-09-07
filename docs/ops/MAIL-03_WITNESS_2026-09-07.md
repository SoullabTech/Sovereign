# MAIL-03 — Production Witness Record

Run 2026-09-07T16:06:16Z from the Mac Studio via
`scripts/witness/mail-03-witness.sh`, against production on minisforum.

```
CODE          ee612602
DEPLOY        e535e6246   (contains ee612602)
MEMBER        4fdbb023-4fca-42f3-9810-8f4da88b21fc
```

**Status: machine checks PASS. Acceptance PENDING three mailbox confirmations
(§4). Closure is a separate founder act and is NOT implied by this record.**

## 1 · Provenance — three independent confirmations

| Evidence | Kind | Result |
|---|---|---|
| `git merge-base --is-ancestor ee612602 e535e6246` → exit 0 | history | PASS |
| `destination_mismatch` present in `.next/server/.../send-verification/route.js` | artifact | PASS |
| `auth:verification` in `email_delivery_attempts` @ 12:37:24Z | **runtime** | PASS |

The third is the strongest and was incidental. `auth:verification` is emitted by
exactly one site in the codebase — `send-verification/route.ts:147` — and that
line *is* the containment change; the pre-containment build emitted
`auth:email-verification` and cannot produce the new string. Runtime behaviour,
not inspection, therefore places the containment build in production.

## 2 · Ledger control

10 attempts in the preceding 7 days, most recent 12:37:24Z. The instrument is
alive, so an empty witness interval is a true absence rather than a dead gauge.
It is instrumented on the P0 path specifically, which is the path under test.

## 3 · Cases

### W1 — normal signup and verification (incidental, unstaged)

```
12:35:22Z  auth:email-code    P0  accepted  msg-id  gmail.com
12:37:24Z  auth:verification  P0  accepted  msg-id  gmail.com
```

A complete signup-then-verification on the containment build, produced by
ordinary use rather than staged for the witness — which makes it better evidence
than a rehearsed registration. Provider accepted both and issued ids.
**Delivery unconfirmed** (§4).

### W2 — the relay test · PASS

```
POST /api/members/send-verification
  { memberId: <member>, email: "attacker@notyourdomain.example" }
→ 409 {"error":"Email address does not match our records.",
       "reason":"destination_mismatch"}
```

- `members.email` before: `soullab1+mail03-20260907123522@gmail.com`
- `members.email` after:   unchanged — the account-takeover primitive is gone
- **No ledger row for `notyourdomain.example`** — the route refused BEFORE
  reaching the provider. This is what distinguishes *we refused* from *we tried
  and the provider refused*, and it is the sharpest single fact in this record.

### W3/W4 — recovery delivers, then throttles · PASS

```
attempts 1-4 → 200
attempts 5-9 → 429
```

Ledger over the same interval: exactly **4** `auth:passkey-recovery` / P0 /
`accepted` rows, all `gmail.com`.

The correlation is the result, not the status codes: four allowed requests
produced four sends, and the five refused requests produced none. The meter and
the ledger agree without being wired to one another. (Predicted 5 allowed; the
limiter blocks ON the fifth attempt, not after it. Behaviour correct, prediction
off by one.)

### W5 — enumeration parity · PARTIAL

Both bodies byte-identical:

```json
{"success":true,"message":"If an account exists with this email, recovery instructions have been sent."}
```

**Weaker than it appears, recorded as partial.** The operator IP was already
blocked, so the unknown-address request was probably refused at the IP gate
rather than reaching the member lookup — the comparison was likely
throttled-vs-throttled, not throttled-vs-genuinely-unknown. The property still
holds by construction (both paths return the same literal in
`recover/route.ts`) and is pinned by `email-code/__tests__/delivery.test.ts`.
Non-blocking; re-runnable from an unblocked IP or after the window expires.

### Emergency ceiling — NOT witnessed in production, by design

Evidenced by the 7 pinned cases in
`lib/auth/__tests__/emergency-ceiling.test.ts`. The production rate-limit
database was not broken to exercise it: a witness establishes externally
observable properties, it does not manufacture an outage.

## 4 · Operator confirmations still required

A script cannot see a mailbox. Acceptance additionally requires:

- [ ] **W1** — verification email from the 12:35 signup arrived
- [ ] **W3** — ~4 recovery messages arrived at the member address
- [ ] **W2** — **nothing** arrived at `attacker@notyourdomain.example`

W2's confirmation carries the most weight: the ledger shows no attempt, so a
message appearing there would mean mail leaving by a path the ledger does not
observe.

## 5 · Record

```text
MAIL-03
CODE          ee612602
BUILD         PASS
DEPLOY        e535e6246
VERIFY        PASS (machine) · PENDING (mailbox)
RELAY         CLOSED IN PRODUCTION
RECOVERY      METERED IN PRODUCTION
CAUSATION     UNPROVEN
MAIL-04       HOLD
```

`CAUSATION UNPROVEN` stands. Containment closes a real surface; it does not
establish that this surface was the vector for the 2026-08 overage. Normal
volume is ~10 attempts/week, against which that overage is orders of magnitude
out of band — which sharpens the question rather than answering it. The ledger
begins 2026-08-25; earlier traffic may exist only in the provider's own history.

## 6 · Deliberately not in this act

Credential rotation · Postal/transport · Dependabot census · MAIL-04. Each has
its own blast radius; combining any of them would make this witness ambiguous
about what it witnessed.
