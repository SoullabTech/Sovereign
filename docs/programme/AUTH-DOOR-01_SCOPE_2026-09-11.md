# AUTH-DOOR-01 — SCOPE, AND WHAT MEMBER-ACCESS-01 ALREADY RULED

**2026-09-11T02:0xZ (2026-09-10 19:0x local).** Lane OPEN.

Written because AUTH-DOOR-01's scope, as stated by the founder, **overlaps rulings
MEMBER-ACCESS-01 already made.** Two records answering one question differently is
the drift this project guards against, so the overlap is mapped rather than left to
be discovered.

## 0 · The governance rule this lane inherits

> **An operational incident may revoke or replace a credential. It may not silently
> redesign the authentication architecture.**

*(Founder, 2026-09-11, from the exposed-password incident.)* It generalises: **a
decision taken by a mechanism is not a ruling.** The 2026-09-07 schema drift — a
deploy applying another lane's migration — is the same failure in a different unit.

## 1 · The six questions, against the record

| # | question | status |
|---|---|---|
| 1 | Should password remain an **offered** authenticator at all? | ⚠️ **PARTLY RULED.** *Disposition* is settled: legacy authenticator, retired per member on evidence, **new members create none**. **Still open:** whether the door *offers* it, and when the last one goes |
| 2 | Should `/signin` open **password-first**? | 🔴 **OPEN — and REFRAMED.** Email-first was ruled, implemented and withdrawn unreleased. Stage 6 supersedes the binary: the threshold resolves **method** invisibly (I-13), so the live question is no longer *which form opens* but *what identifies the member* |
| 3 | Should **usernames** remain visible anywhere operationally? | 🔴 **OPEN — and NEW.** R-B1 ruled username is a migration-compatibility path, not the public doorway. **Operational surfaces were never in scope.** The admin tool printing `wbp` is the first evidence |
| 4 | When may an existing member's password be retired? | ✅ **RULED.** M-4 and M-8: only once that member has a **proven replacement AND a proven recovery path**, or has explicitly chosen the reduced-recovery posture. Per member, never per population |
| 5 | What is the **canonical identification step** before authentication? | ⚠️ **RULED IN SHAPE, NOT IN SCHEMA.** R-B1: a **nameable-contact set** attached to the identity. Stage 5 B1 showed I-13 is met for *method* and not for *identifier*. The schema is undesigned (P-2) |
| 6 | How do email code, passkey, recovery and legacy password **converge**? | ✅ **RULED IN SHAPE.** Stage 6 §6 target: authenticators · contacts · recovery → one authentication authority → one session authority → one lifecycle |

> **Genuinely open: #2 (reframed) and #3 (new).** The rest are ruled in shape and
> await implementation. ⛔ **AUTH-DOOR-01 may not re-open 4, 5 or 6 without
> superseding the MEMBER-ACCESS-01 ruling explicitly** — the discipline this project
> already applies to entry-intent and to the Circles I0.5 record.

## 2 · Why the two new observations matter — and they matter differently

### 2.1 · The admin-tool username leak — a SCOPE finding

`admin-reset.ts` printed `wbp` / `Wbp` for a member whose intended door is email.

> **Legacy identity semantics are not confined to the member UI.**

⭐ **Consequence:** the census must widen. Stage 0 enumerated `/signin`, registration,
recovery and the API surface. It did **not** enumerate **operational and admin
surfaces**, and those carry the same model — scripts, admin routes, support tooling,
anything that names a member to an operator. **A door redesigned while the admin
tooling still speaks the old model leaves the model alive.**

### 2.2 · Password-first `/signin` — a MEASURABLE liability

Not an aesthetic objection. **Every member whose intended route is email code must
first reject the default door before reaching the correct one.**

⭐ **Consequence:** this becomes an **acceptance metric** for the redesigned entry
flow, not a matter of taste — count the members who need the extra instruction. The
target is zero, and it is checkable.

## 3 · What the incident established factually

`scripts/admin-reset.ts:43` writes `bcrypt.hash(password, 12)`. **The rotation
preserved a conventional password verifier** and did not alter password semantics
while replacing the credential. Confirmed in source; previously an assumption.

## 4 · Standing

```
AUTH-DOOR-01   OPEN
  owns         password door · identifier · operational-surface redesign
  open         Q2 (reframed) · Q3 (new)
  ruled        Q4 · Q6 (shape) · Q5 (shape, schema undesigned) · Q1 (disposition)
  inherits     "an operational incident may not silently redesign the architecture"

⛔ no repair authorized · no door changed · production untouched
```

> **Membership is durable identity. Passwords, passkeys, email codes and other
> credentials are replaceable authenticators attached to it.**

That is the stable centre, and it deliberately does **not** decide how quickly the
remaining password door disappears.
