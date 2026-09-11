# MEMBER-ACCESS-01 · STAGE 7A — P-1 CONTACT CONTROL PROOF

**Authorized** 2026-09-11 by founder act, bounded to evidence capture.
**Status: IMPLEMENTED · FALSIFIED · NOT DEPLOYED.**

> **Purpose:** when an existing authentication ceremony already proves control of a
> contact, record that fact durably **without changing whether the member is
> admitted, what they see, or how they authenticate.**

> ⏱ **Timestamp convention.** All dates in this record are **UTC**, matching this
> repository's commit timestamps. The founder's local clock is UTC−7, so a reading
> stamped `2026-09-11T01:2xZ` occurred on the evening of **2026-09-10 local**. Both
> are the same moment. ⛔ Do not "correct" these to the local date — that would
> desynchronise the prose from the commits it describes, which is the discrepancy
> the convention exists to prevent.

---

## 1 · Why this is the first migration task

The census returned **0 of 92** members carrying verification evidence, while
members receive and use email codes daily. Every successful code sign-in proves
control of an address **and records nothing.**

> **The first migration task is not moving members. It is learning what the system
> already knows when they successfully prove who they are.**

## 2 · Classification — a bounded ledger, NOT the contact substrate

Stage 6 requires this be classified explicitly. **It is a bounded evidence ledger.**

It records `member_id` + a keyed **contact fingerprint**, so it can later be migrated
to reference a contact id when P-2 designs one — **without ever having been an
identity authority.** It does not settle the contact-set model, and it creates **no
new truth field on `members`.**

⭐ The fingerprint is the same keyed HMAC the delivery ledger uses
(`lib/email/ledger/fingerprint.ts`). **That shared key is P-2's join point, arrived at
without inventing a contact id** — a verification event and a delivery event about
one address become correlatable, and this table still stores no address.

## 3 · What it records

```
member proved control of contact
  at observed_at
  by mechanism        email_code | magic_link | email_verification_token
  under version       mechanism_version
  observed by         route
```

**Mechanism is recorded because `members.email_verified` is the worked example of
omitting it** — one route's meaning silently became the name of a universal fact.

⛔ **No `verified` boolean. No `recoverable` flag.** Verification is *derived by
asking this table a question.* `has_webauthn = true` with zero credentials is why
(I-2). And per **I-18**, control proven at a time is not reachability now — there is
no validity window here, only an observation time.

## 4 · Write sites — exactly where control is actually proven

| route | moment | why that line |
|---|---|---|
| `email-code/verify` | after the atomic `used = false → true` claim, after the null-member exit | the claim **is** the proof; a wrong or abandoned code never reaches it |
| `magic-link` GET | inside the successful-claim guard | the same statement redeems the link and stamps `used_at` |
| `verify-email` (×2) | after the verification UPDATE lands | the flow has completed |

⚠️ **Known gap, deliberately not closed:** a NEW member proves control **before a
member row exists**, so that proof is not recorded. Closing it means writing at
registration, which is a different seam than Stage 7A authorises. **Named so the
next census is read knowing it under-counts new joiners.**

## 5 · The three merge conditions — asserted and falsified

`lib/access/__tests__/contactControlProof.test.ts` — **17 passed, 0 failed.**

| condition | how it is held |
|---|---|
| **1 · no auth decision reads it** | recorder resolves to `Promise<void>` so nothing can branch on it · contains no `SELECT` · no call site references the table · the schema says so in its own comment |
| **2 · a failed ceremony writes nothing** | ordering assertions: the call sits **after** the atomic claim and **after** the null-member exit at each site |
| **3 · behaviour unchanged** | every call site is `void`, never `await`ed, so it cannot add latency · the recorder never throws · failures are counted, not hidden · no raw address or raw member id reaches a log |

Plus **F4** (no capability flag) and **F5** (no retrofit of `email_verified`, no raw
address stored).

### 5.1 · The falsifiers were proved to bite, and the instrument failed first

⭐ **Injecting `await` at one call site turned F3 red** (2 tests failed) — the gate
bites rather than merely passing.

⚠️ **And the first run failed three ordering tests against correct code.** Cause:
`indexOf('recordContactControlProof')` finds the **import statement**, so every
ordering assertion compared against position ~100. **The instrument was wrong, not
the code** — the same shape as Circles C21, where a scan matched a file's own
documentation of its compliance. Fixed by matching the call (`void record…`), and
the reason is recorded in the test so it cannot silently return.

⚠️ **One self-inflicted incident, recorded rather than hidden:** `git checkout --`
was used to undo a probe edit and instead reverted the file to its last *commit*,
destroying the uncommitted wiring at that site. Caught immediately by the falsifiers
going red, and re-applied. **The lesson is the one the deploy lane already
knows — never use a revert whose baseline you have not checked.**

## 6 · Gates

```
falsifiers        17 passed · 0 failed
typecheck         229 errors vs baseline 239 · 0 regressions · ✅ no regressions
check:no-supabase ✅ clean
census SQL        read-only · 0 mutating statements · Census C added for the re-run
```

## 7 · The passive-learning loop this enables

```
member signs in normally  →  existing ceremony succeeds  →  P-1 records the proof
      →  member does nothing new  →  future census has real evidence
```

**Census C** was added to the census script and is **empty until deployment**. It is
the number expected to rise **with nobody asked to act** — the operational form of
*the system migrates around the member.*

⚠️ **Proof writes are best-effort and under-report.** Any count from this table must
travel with `proofWriteFailuresTotal()`, or be reported as a **floor**. That is the
same honesty the delivery ledger states about itself, and for the same reason:
observability must never be able to stop authentication.

## 8 · Standing

```
STAGE 7A   IMPLEMENTED · FALSIFIED · NOT DEPLOYED
  migration      20260911000001_contact_control_proofs.sql   (additive; touches no existing table)
  module         lib/access/contactControlProof.ts
  sites          email-code/verify · magic-link · verify-email ×2
  falsifiers     lib/access/__tests__/contactControlProof.test.ts  17/17
  census         Census C added

⛔ NOT AUTHORIZED   deploy · migration of members · re-enrollment · legacy retirement
                    new login or recovery UX · passkey changes · social-auth changes
                    email-first · account merging · M-9 classification · vendor adoption

NEXT (founder act)  deploy → let evidence accumulate → re-run census → then classify
```

⚠️ **Deploy is a founder act and carries a known lane hazard:** merging a migration
to the production branch makes it deployable by whoever deploys next (the 2026-09-07
schema-drift finding). This migration is additive and touches no existing table, but
**that property is what makes it safe, not the merge.**
