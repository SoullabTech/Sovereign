# MAIL-03 — Production Witness Record

Run 2026-09-07T16:06:16Z from the Mac Studio via
`scripts/witness/mail-03-witness.sh`, against production on minisforum.

```
CODE          ee612602
DEPLOY        e535e6246   (contains ee612602)
MEMBER        4fdbb023-4fca-42f3-9810-8f4da88b21fc
```

**Status: ACCEPTANCE ESTABLISHED · MAIL-03 CLOSED 2026-09-07.** All machine
checks pass and both observable positive-delivery confirmations are recorded
(§4). Founder closure was performed only after acceptance was established.

**Closure is a separate founder act. Acceptance licensed it; acceptance did not
perform it. The founder act is recorded in §7.**

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
- **No ledger row for `notyourdomain.example`**

W2 is proven MACHINE-SIDE and needs no mailbox evidence. The ledger row is
opened BEFORE the provider is contacted — `lib/email/sendEmail.ts:439`, whose
comment states the reason: *"opened BEFORE the provider call so a crash mid-send
leaves evidence rather than nothing"*:

```
openAttempt(...)      ← row written here
provider.send(...)    ← provider contacted after
```

So zero rows for that domain proves the request never reached `sendEmail` at
all, which is stronger than proving the provider refused. `openAttempt` is
best-effort and swallows its own failures, so in principle a send could occur
with no row — but the 4↔4 correlation in W3/W4 shows it writing successfully
throughout this same window, which excludes a silent ledger failure confined to
the W2 request.

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

A script cannot see a mailbox. Acceptance required two POSITIVE deliveries to a
mailbox under observation. Both are now CONFIRMED in the observed Gmail inbox:

- [x] **W1 · PASS** — verification email received at
      `soullab1+mail03-20260907123522@gmail.com`, **12:37:24Z**
- [x] **W3 · PASS** — exactly **four** recovery emails received at the same
      alias, all **16:06:17Z**

### The three-layer correlation

The confirmations do more than tick boxes: they complete an end-to-end
correspondence across three layers that are instrumented independently of one
another.

W3/W4:

```
4 admitted (HTTP 200)  ↔  4 accepted ledger rows  ↔  4 delivered messages
5 refused  (HTTP 429)  ↔  0 ledger rows           ↔  0 delivered messages
```

Ledger rows at 16:06:16.729 / .942 / 17.061 / 17.192Z; mail observed at
16:06:17Z. W1 likewise: ledger `auth:verification` at 12:37:24Z, message
observed at 12:37:24Z.

The limiter decides admission, the ledger records attempts, and the mailbox
receives delivery — three different parts of the path, agreeing exactly. The
metering claim is therefore not "the endpoint returned the expected status
code"; it is that admission through the ceiling corresponded one-to-one with
recorded sends AND with actual deliveries, while every refusal produced neither.

### W2 needs no mailbox confirmation — and could not have one

An earlier draft of this record listed *"nothing arrived at
attacker@notyourdomain.example"* as a third required confirmation and called it
the weightiest. That was wrong twice over.

It is **not observable**. `.example` is a reserved TLD and the address is not
under our observation, so there is no mailbox to inspect. A confirmation that
cannot be obtained is not a pending item; listing it as one would leave
acceptance permanently and falsely incomplete.

It is also **not needed**. Non-arrival at an external destination is proving a
negative at a location we cannot see. The machine evidence above — refusal
before the outbound-mail boundary, with the ledger opened ahead of the provider
call — is the stronger claim, and it is complete on its own.

The general rule: **acceptance may depend on positive evidence at locations we
observe; it must not depend on proving a negative at locations we do not.**
Corroboration from an observed mailbox is welcome where available. Here it is
not available, and the machine evidence does not need it.

## 5 · Record

```text
MAIL-03
CODE          ee612602
BUILD         PASS
DEPLOY        e535e6246
VERIFY        PASS (machine) · PASS (mailbox: W1, W3)
ACCEPTANCE    ESTABLISHED 2026-09-07
CLOSURE       CLOSED 2026-09-07 — founder act
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

## 7 · Founder closure act — 2026-09-07

Founder closure is **PERFORMED** on the acceptance evidence recorded above.
This act changes no code, deployment, witness result, provider credential, or
transport state. It records the founder decision that the accepted MAIL-03
containment is closed.

```text
MAIL-03       CLOSED
ACCEPTANCE    ESTABLISHED
CAUSATION     UNPROVEN
ROTATION      REQUIRED — separate next act with its own witness
MAIL-04       HOLD — opens only after rotation
```

W5 remains recorded as partial/non-blocking; closure does not rewrite that
limitation into a stronger production claim. Credential rotation, Postal,
Dependabot, and MAIL-04 remain outside this act.
