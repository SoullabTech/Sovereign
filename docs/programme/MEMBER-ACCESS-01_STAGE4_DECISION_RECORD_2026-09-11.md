# MEMBER-ACCESS-01 · STAGE 4 — ARCHITECTURE DECISION RECORD

**Opened** 2026-09-11 by founder act. **Architecture-class level, not vendor choice.**

> **Which architecture can make Soullab feel like one effortless door while
> preserving one durable member identity, retiring the current multiplicity,
> migrating existing members without pain, and keeping identity sovereignty inside
> Soullab?**

⛔ **Stage 4 does NOT start migration or implementation.** It returns a decision
record and stops.

---

## 1 · The threshold belongs to MAIA — founder ruling 2026-09-11

```
MAIA ARRIVAL      who is MAIA · why enter · what kind of relationship   ← relational
      ↓
MEMBER ACCESS     who are you · what can you actually use · recovery    ← should vanish
      ↓
MAIA              conversation · memory · practices · rooms · work      ← where they were going
```

Signup, signin, onboarding, authentication and MAIA entry have been treated as five
technical experiences. **The member experiences one: *I am trying to get to MAIA*.**
That becomes the product truth.

The arrival page has four responsibilities — **orientation · trust · entry ·
recognition** — and almost nothing else. Returning members are *returned to*, not
re-registered.

**New invariant, added to the Stage 3 register:**

> **I-13 · A threshold may initiate entry; it may never create identity semantics.**
> MAIA's arrival page calls the one Member Access system. It does not invent a MAIA
> account, a MAIA session, or a MAIA signup path.
> *Violated by:* an eleventh door wearing a nicer coat.

**This is a requirement on the architecture, not decoration.** The returning member
sees `Welcome back · [Continue]`, and resolution — live session → passkey → best
available credential → recovery — happens **invisibly**. A door that must ask
*"which method did you use?"* cannot produce that page. **Any candidate that cannot
resolve the path without asking fails the lane's own product goal.**

## 2 · What every candidate must answer about email

Each architecture must place all five roles **separately**, or it reproduces the
collapse with nicer APIs:

```
IDENTIFIER    how someone names / finds their account
CONTACT       where communications go
BOOTSTRAP     how initial control is verified
AUTHENTICATOR when possession of email proves access
RECOVERY      when email may restore an existing identity
```

> **Changing contact information must never silently change the key by which
> external authenticators are joined to identity.**

⚠️ Live today: OAuth joins identity on `members.email`
(`auth/signin/google/callback:170`). **Any candidate that keeps a mutable address as
the identity join key is rejected**, however good its APIs.

## 3 · The four candidates

### A — Consolidate in-house

| | |
|---|---|
| **Retirement power** | **Permitted, not forced.** Soullab may delete all ten creators; nothing *prevents* an eleventh. Every Stage 3 invariant is enforced only by Soullab's own tests |
| **Migration** | ⭐ **Best of the four.** Identity never moves. `members.id` stays the FK root for spiral state, atoms, memory, Co-Lab, manuscripts. M-1…M-7 are all reachable in-place |
| **Sovereignty** | ⭐ **Maximum.** Nothing new enters the path |
| **D1 recovery** | Built from scratch. Not from zero — `lib/auth/webauthnServer.ts` already does real RP/origin binding and counter verification |
| **Operational burden** | ⭐ **Lowest.** No new service. Stack stays at seven containers |
| **Honest risk** | **A is the architecture that already produced ten doors.** Mitigated but not removed by Stage 3: it never previously had a distinction register or invariants. The residual risk is that discipline is the only enforcement |

**SURVIVES — conditionally.** Only if the Stage 3 invariants get **machine
enforcement**, in the verifier style this project already uses well (I-2 and I-4 as
executable checks, not review habits).

### B — Embedded auth framework (Better Auth class)

| | |
|---|---|
| **Retirement power** | ⭐ **High and structurally assisted.** `user · account · session` with credentials as records makes `has_webauthn`-style flags **unrepresentable** (I-2 by construction). Still requires deliberate retirement of the ten — D3 stands |
| **Migration** | **Good, conditional.** `SOURCE-READ`: per-model `modelName` and per-field `fieldName` overrides (`packages/core/src/db/get-tables.ts`) let it be pointed at existing tables — so `members.id` can plausibly remain the identity id. ⚠️ **If it cannot, M-1 fails and B is out** |
| **Sovereignty** | High — self-hosted, in-process, own Postgres, no new party. Cost is a dependency in the auth path |
| **Native** | ✅ `bearer` plugin — passes corrected D5 |
| **D1 recovery** | Passkey plugin + email OTP; recovery is app-supplied. **D1 is not answered by adoption** |
| **Operational burden** | ⭐ **Lowest of the framework options.** No new container, same process, same database — decisive for a seven-container stack maintained by one person |
| **Known caveat** | `schema.ts` FIXME: plugin authority fields are input-by-default. Now known, therefore guardable |

**SURVIVES — conditional on the member-id preservation test.**

### C — Self-hosted identity core (Kratos class)

| | |
|---|---|
| **Retirement power** | ⭐⭐ **Highest, and the only *structurally forced* one.** Identity leaves application code, so the application **cannot** create a member by a side door. `idfirst` supplies §1's doorway as a supported flow |
| **Migration** | 🔴 **Weakest.** Identity must leave `members`, which is the FK root of nearly every Soullab domain table. Two systems coexist throughout, so **M-5 — no intermediate state strands a member — is hardest exactly where it matters most** |
| **Sovereignty** | High — self-hosted, no third party. But *locality* changes: "who the member is" moves out of Soullab's database into a service. Preserved, not lost — and worth naming plainly |
| **D1 recovery** | ⭐ Strongest built-in story: recovery is a first-class flow |
| **Operational burden** | 🔴 Eighth container, own database, migrations, config and upgrade cycle — **a new failure surface whose operator is Kelly**, in a lane whose acceptance criterion is *no need for Kelly* |

**ELIMINATED — on eliminator 2, migration experience.** Not because Kratos is weak;
it is the strongest identity model read in Stage 2. Because **the migration it
requires is the one thing this lane said it would not spend**: moving the identity
root out from under every FK in the system, with a long two-authority interval that
M-5 cannot be held across. ⚠️ **Recorded as elimination-by-context, not by quality.**

### D — Hybrid (external credential/session engine, narrow Soullab identity boundary)

| | |
|---|---|
| **Retirement power** | Moderate — retires session minters and credential paths; the **ten creators still touch `members`**, so the largest multiplicity survives |
| **Migration** | Better than C, worse than A/B: identity root stays, FKs survive |
| **Sovereignty** | Adequate |
| **Operational burden** | 🔴 **C's cost** — the extra service — **without C's forcing function** |
| **Structural objection** | 🔴 **D is a compatibility bridge promoted to an architecture.** It institutionalises **two authorities** over credentials and sessions in a lane whose purpose is to have **one** (I-1, I-3), and **I-12 says a bridge without a declared retirement condition is permanent architecture acquired by inertia** |

**ELIMINATED — on principle, not cost.** D pays C's operational price for A's
retirement weakness, and it is the one candidate that **violates a Stage 3 invariant
by construction**.

## 4 · D1 — the recovery decision

**Test:** *an existing member returns six months later on a completely new device and
gets back inside easily, without Kelly.*

| mechanism alone | six-month / new-device walk |
|---|---|
| **Device-bound passkey** | 🔴 **FAILS.** The credential is on the previous phone. Not viable alone — at any sovereignty level |
| **Synced passkey** | ✅ Passes beautifully on the same ecosystem. 🔴 Fails on ecosystem switch or lost vendor account; and rents recovery from Apple/Google |
| **Email code** | ✅ Passes, and is the **only mechanism requiring no prior enrolment** — so it is the only one that works for someone who enrolled in nothing. Cost: mail becomes security-critical (FR-B) |
| **Recovery secret** | ✅ Passes in principle. 🔴 Realistically nobody retains it six months; and it is only honest if established at enrolment (I-7) |

### RECOMMENDED — for founder ruling, not self-adopted

```
PASSKEY PREFERRED        for return, synced or device-bound AT THE MEMBER'S CHOICE
EMAIL CODE               universal bootstrap and recovery — the floor that needs no enrolment
RECOVERY SECRET          optional, offered to members who want independence from both
```

⭐ **The load-bearing point is the phrase *at the member's choice*.** Soullab
mandating device-bound is paternalistic and strands people; Soullab mandating synced
imposes a vendor on someone who rejected one. **Both are Soullab deciding a member's
sovereignty posture for them**, which this project's vows already refuse. Offer the
choice, explain the trade in one honest sentence, let the member rule.

⚠️ **This makes email the floor, so FR-B becomes structural, not incidental.** The
mitigation is not a better vendor (charter §12): it is **I-6** — recovery may never
report progress it has not observed — plus MAIL-xx owning delivery truth. **D1 and
the mail lane are therefore coupled: email recovery is only acceptable if the mail
contract is honest.**

## 5 · Existing members, weighted above new-signup polish

| population | A | B |
|---|---|---|
| existing password member | keeps working — no change to `password_hash` | keeps working if pointed at the existing column |
| existing OTP member | unchanged | unchanged |
| Google / Apple member | `oauth_accounts` already links by `member_id` | maps onto `account` — the native shape |
| existing passkey member | `webauthn_credentials` unchanged | maps onto the passkey table |
| ⭐ **the 8 broken `has_webauthn`** | repaired by **deriving** capability (I-2) | **state becomes unrepresentable** |
| partially onboarded member | I-4 makes lifecycle door-independent | same |
| member with changed email | ⚠️ **requires the §2 decomposition in both** | ⚠️ same |
| new iPhone / six-month return | D1 recommendation | D1 recommendation |
| original authenticator gone | recovery, per D1 | recovery, per D1 |
| half-failed migration | in-place, so no two-system interval — **the strongest argument for A and B over C and D** | same |

**Every cell must end: same human → same Soullab identity → same history → safely
inside.** No *"create a replacement account and merge later"* in any candidate.

## 6 · Recommended architecture

> **B — embedded auth framework, conditional on the member-id preservation test,
> with A as the fallback.**

The decisive argument is **not** features. A and B target **the same shape**; they
differ in what enforces it. **A's invariants are enforced by discipline, and
discipline has a two-year record of not composing here. B makes several invariants
structurally unrepresentable** — a capability flag has nowhere to live, a second
identity root has nowhere to live.

**The conditional is a real gate, not a formality:**

```
TEST   can the framework be pointed at the existing members table
       with members.id preserved as the identity id?
PASS → B.   FAIL → A, with the Stage 3 invariants given machine enforcement.
```

⚠️ **A is not a consolation prize.** If the test fails, A is correct — and A also
keeps the lowest operational burden, which matters for a solo-operated stack.

⭐ **The real decision was Stage 3.** The invariants are the architecture; A and B
are two ways to hold them. That is why this record recommends a class and a test
rather than a product.

## 7 · Unresolved tradeoffs — named, not hidden

1. **D1 awaits founder ruling.** §4 is a recommendation.
2. **Whether social login is retained** — undecided. *That it must LINK and never
   CREATE* is settled (Stage 3).
3. ~~**Whether passwords ultimately retire** — undecided~~ → ⭐ **RULED, founder,
   2026-09-11T01:5xZ (2026-09-10 18:5x local). PASSWORDS FADE OUT; THEY ARE NOT
   ABOLISHED.**

   ```
   NEW MEMBERS      passkey preferred · email code = universal bootstrap + recovery floor
                    password NOT required and NOT the primary path

   EXISTING         existing password keeps working THROUGHOUT migration
                    passkey may become preferred · email code added where verified
                    retirement ONLY once that member is proven to have another
                    working way back into the SAME identity
   ```

   **No mass reset. No forced account recreation. No "everyone must set up a passkey
   now."** Long term a password is a **legacy authenticator**, not part of the
   ordinary Soullab experience: the returning member sees *Welcome back → Continue*.

   ⛔ **Password removal is NOT authorized.** Stage 7A establishes trustworthy
   evidence and nothing else. **A password retires per-member, on evidence, never
   per-population** — M-4 and M-8 unchanged and now naming the credential.

   ### 3.1 · ⚠️ Consequence — today's new members already have an invisible password

   `UnifiedAuth.completeSignup` calls `generatePassword()` and `register-email`
   **requires** one (`if (!email || !username || !password) → 400`). So an
   email-code account is created **with a password the member never sees.**

   That is not a detail. **It is the artifact that made the password door a trap**:
   Stage 5 B1 stranded an operator holding a valid code at a form asking for a
   credential that existed, belonged to them, and had never been shown to them.

   ⭐ Under this ruling the generated-invisible password is **itself a legacy
   artifact the target removes** — new members should have *no* password rather than
   an unseen one. ⛔ Not authorized here; recorded so it is not mistaken for the
   target state it currently imitates.
4. **`x-member-id` retirement** — the target is one session authority with two
   representations; the retirement path is not designed.
5. **Framework dependency** in the auth path under B — self-hosted and MIT, but a
   supply-chain surface A does not have.
6. **Neither survivor gives layer-2 delivery truth.** By design — MAIL-xx.
7. **The email-role decomposition is specified but not designed.** §2 states the
   requirement; the schema that separates identifier from contact is Stage 5+.
8. **C's elimination is contextual.** Were Soullab's domain data less entangled with
   `members`, C would likely win on retirement power. Worth re-reading if that
   entanglement is ever undone.

## 8 · Standing

```
STAGE 4   COMPLETE — decision record returned
  ELIMINATED    C (migration experience) · D (two authorities by construction)
  SURVIVORS     A · B
  RECOMMENDED   B, conditional on member-id preservation; A as fallback
  D1            recommendation made, FOUNDER RULING REQUIRED
  NEW INVARIANT I-13 — a threshold may initiate entry, never create identity semantics

⛔ NOT STARTED  migration · implementation · schema · vendor commitment
⛔ UNCHANGED    production · the door · WebAuthn state · social auth · x-member-id
```
