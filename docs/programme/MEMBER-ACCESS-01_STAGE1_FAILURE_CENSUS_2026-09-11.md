# MEMBER-ACCESS-01 · STAGE 1 — FAILURE CENSUS

**Built from the repository and programme record, not from recollection.**
Every row carries a citation. Founder memory is requested only in §6, for what
the record cannot recover.

**Three classifications, never merged:**
`FAILURE` — witnessed or attributable · `RISK` — documented structural hazard, no
incident evidence · `UNVERIFIED` — never proven either way.

**Boundaries:** IDENTITY · CREDENTIAL · SESSION · LIFECYCLE · DELIVERY · RECOVERY ·
ROUTING · TRUTH.
**Rescue cost:** SELF-RECOVERED · GUIDED · OPERATOR REPAIR · ENGINEERING REPAIR ·
ABANDONED · UNKNOWN.

---

## 1 · FAILURES — witnessed or attributable

### F1 · Quota refusal reported as retryable — 2026-08-24
**Boundary** DELIVERY + TRUTH · **Rescue** ENGINEERING REPAIR · **Visibility** misleading
Resend returned `429 monthly_quota_exceeded`; the product told the member the code
was sent and the error was retryable. **One person made six attempts against a
boundary that could not move.**
> `lib/email/sendEmail.ts:165` · `lib/email/__tests__/sendEmail.test.ts:7` ·
> `app/api/members/email-code/route.ts:230` · route tests §"PROVIDER-REFUSAL TESTS
> — the 2026-08-24 signup incident"

### F2 · Account creation succeeded while mail was globally unavailable — Aug 2026
**Boundary** DELIVERY + LIFECYCLE · **Rescue** ENGINEERING REPAIR · **Visibility** technically visible, unintelligible to member
An account existed that could not complete authentication. **The first
half-born-account case in the record.**
> `docs/ops/AUTH_THREAD_LEDGER_2026-08-27.md` ("RESEND / RUNTIME RESOLVED —
> pay-as-you-go enabled; email-code auth working; no code change was required")

### F3 · Returning email-code member routed through `/signup` — Aug 2026
**Boundary** ROUTING + TRUTH · **Rescue** GUIDED · **Visibility** visible confusion
Sign-in succeeded while the interface said *Begin*, as though they were new.
> `components/auth/UnifiedAuth.tsx` header, 2026-08-24 passes

### F4 · Eight members offered a ceremony that cannot succeed 🔴
**Boundary** CREDENTIAL + TRUTH · **Rescue** UNKNOWN (unrepaired) · **Visibility** silent
**8 confirmed member accounts carry `has_webauthn = true` with zero credentials.**
`webauthn/authenticate/options` gates on the member flag, not the credential store,
so these members are offered Face ID / Touch ID that can never complete. The state
is **not attributable to any writer in the current tree**. All 8 read
`preferred_auth_method = 'password'` — narrowing, not adjudication.
AUTH-BIOMETRIC-01B is **merged and not deployed**, and by its own record *would not
help these eight anyway*, because it reads the flag and the flag is what is wrong.
> `docs/specs/AUTH_BIOMETRIC_01A.md` §6.1 Q3 · `docs/ops/AUTH_THREAD_LEDGER_2026-08-27.md`

### F5 · Password-first door refuses a valid code — 2026-09-11
**Boundary** CREDENTIAL + ROUTING + TRUTH · **Rescue** GUIDED · **Visibility** visible failure, hidden cause
An operator holding a valid 6-digit code entered it on the password form and was
refused. Email-code members hold a generated password they have never seen.
> this session · `components/auth/UnifiedAuth.tsx` AUTH-DOOR-01 note

### F6 · Account semantics differ by creation route
**Boundary** LIFECYCLE · **Rescue** OPERATOR REPAIR · **Visibility** invisible
`register-email` writes `onboarding_step='faq'`; `register-local` writes
`onboarded: true`. **Two equivalent people enter in different lifecycle states, by
a door neither of them chose.** The member cannot reason about the hidden state, so
diagnosis falls to the operator.
> Stage 0 census §2

### F7 · ~$200 of unauthorised sends, undetected until the invoice — 2026-09-07
**Boundary** DELIVERY + IDENTITY + RECOVERY · **Rescue** ENGINEERING REPAIR · **Visibility** invisible; **the bill was the detector**
Founder-reported and witnessed. The *vector* remains code-shape reasoning (see R5).
> `docs/ops/MAIL_ABUSE_INCIDENT_2026-09-07.md`

### F8 · Raw provider JSON rendered to the member — 2026-09-11
**Boundary** TRUTH · **Rescue** GUIDED · **Visibility** visible, incomprehensible
The literal string `{"error":"Invalid username or password"}` shown in the card.
Repaired `b8e17336`, **undeployed**.

---

## 2 · RISKS — documented, no incident evidence. Do not report as failures.

- **R1 · Onboarding completion lives in two places.** Server `members.onboarded` and
  client `localStorage`; the sync is fire-and-forget with catch-and-continue
  (`app/onboarding/page.tsx`). Divergence is possible; **no incident is recorded.**
- **R2 · `/api/members/progress` POST is unauthenticated.** `memberId` from the
  request body, no session check; `onboarded`, `onboarding_step`, `youth_onboarded`
  writable by any caller holding a member UUID.
- **R3 · Merged ≠ deployed, demonstrated.** AUTH-BIOMETRIC-01B merged `df4029aec`
  (PR #1131) with production running an older image. **A fix believed to govern
  production may not.**
- **R4 · Auth audit substrate unconfirmed.** The 2026-08-27 ledger records
  `audit_logs` as absent in production with ten `logAuthEvent` callers lacking
  durable substrate. A migration `20260828000001_audit_logs.sql` now exists in the
  repository; **whether it is applied in production is UNVERIFIED.**
- **R5 · Open-relay / takeover primitive.** `send-verification` accepts
  `{memberId, email}` unauthenticated, writes the caller-supplied address onto the
  member row, then sends to it — arbitrary destination **and** an email-rewrite
  takeover primitive. Code-shape; the running state is unread here.

---

## 3 · UNVERIFIED — never proven either way

- **U1 · Password → session → correct member → MAIA, end to end.** Never witnessed
  in production. **Recorded as UNVERIFIED, not as a failure.**
- **U2 · Why the stalled cohort stalled.** 5 of 7 sit at the step straight after
  account creation. SESSION / LIFECYCLE / ROUTING are all candidates; **no evidence
  selects one.** Do not infer from R1.
- **U3 · Are the four OAuth account-creation paths reachable in production?**
- **U4 · Is `auth/dev-login` gated in production?**

---

## 4 · 🔴 META-FINDING — this census is structurally under-evidenced

Auth events have **no confirmed durable substrate in production** (R4). Therefore
*"there is no record of X failing"* carries **almost no information** — it is the
`NOT OBSERVED` state, never `OBSERVED EMPTY`. Two consequences:

1. Silent failures are systematically under-counted here, and silent failure is
   precisely the class this lane exists to eliminate.
2. **Stage 8 cannot demonstrate improvement against an un-instrumented baseline.**
   Instrumentation is therefore a Stage 7/8 prerequisite, not a nicety.

The ledger's own rule applies: *a failed read is not a zero.*

---

## 5 · CLUSTERING — four fractures, not twenty bugs

Boundary tallies across F1–F8: **TRUTH 5 · DELIVERY 3 · ROUTING 3 · CREDENTIAL 2 ·
LIFECYCLE 2 · IDENTITY 1 · RECOVERY 1 · SESSION 0.**

```
FR-A  TRUTH          the surface reports intent as outcome        F1 F3 F4 F5 F8
FR-B  DELIVERY       one vendor is a single point of access       F1 F2 F7
FR-C  MULTIPLICITY   account state depends on the door used       F6 · stalled cohort
FR-D  UNPROVEN       merged ≠ deployed; no audit substrate        R3 R4 U1
```

**FR-A is the dominant fracture and the one that answers the two-year question.**
The recurring shape is not "login broke" — it is *the system telling the member
something untrue about what just happened*: mail that never left reported as sent,
a ceremony offered that cannot complete, *Begin* shown to a returning member, a
valid credential refused by the wrong form, a provider's JSON shown as guidance.

**Stage 0's multiplicity is confirmed as a cause, but a secondary one.** It surfaces
as FR-C and as the ROUTING half of FR-A: with ten doors, the surface cannot know
which door this member came through, so it guesses — and a guess stated confidently
is exactly an FR-A failure.

### The rescue-cost number

Of eight witnessed failures: **SELF-RECOVERED 0 · GUIDED 3 · OPERATOR REPAIR 1 ·
ENGINEERING REPAIR 3 · UNKNOWN 1 · ABANDONED 0 (see caveat).**

> **Zero of the failures in this census were recovered by a member unaided.**

⚠️ `ABANDONED 0` is an artifact, not a result. An abandoning member files no report
and leaves no audit row (§4). The stalled cohort is the visible edge of that
population, and its cause is U2.

---

## 6 · Gaps that need the founder — specific, not a two-year history

1. **F4 — the eight.** Do you recognise them? Did any report Face ID failing, or did
   they silently switch to password? Was any rescued, and how?
2. **F2 — the mail outage.** Roughly how many members were mid-signup, and were they
   contacted or did they simply not return?
3. **ABANDONED.** Any beta member you know of who never got in and stopped trying —
   the row the record structurally cannot produce.
4. **Rescue frequency.** Over the beta, roughly how often did you personally have to
   intervene for someone to get in — weekly, monthly, a handful of times?
5. **F7 — the abuse window.** Were sign-in codes slow or failing for members during
   it, or was the invoice the only symptom?
6. **Pre-August history.** Any access failure before 2026-08 that the repository
   would not have recorded — the record thins sharply before the MAIL lanes opened.

Anything not answerable stays `UNKNOWN`. **An unanswered question is a finding about
the record, not a gap in your memory.**
