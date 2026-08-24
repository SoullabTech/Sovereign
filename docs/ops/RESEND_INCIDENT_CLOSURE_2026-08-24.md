# RESEND INCIDENT CLOSURE

**Authorized scope:** reconciliation / deploy / witness only. No new provider, no email
abstraction migration, no fallback, no queue work. STOP after the witness is recorded.

**Status: steps 1–3 COMPLETE AND VERIFIED. Steps 4–6 BLOCKED — no deploy path from the
evaluation environment.**

---

## 1. Bind current production line — DONE

| | |
|---|---|
| Repository | `SoullabTech/Sovereign` |
| Production branch | `clean-main-no-secrets` |
| Production HEAD | `be5b3b80241eb988e74f16cb8851888f135d45df` (`be5b3b8`) |
| Fix branch | `origin/fix/email-send-result-unchecked` |
| Fix tip | `0e7b8ce0e20d3f341a0f3b0299eb20bf361f38e8` (`0e7b8ce`) |
| Open PR for the fix | **none** |

Production has **not moved** since JARVIS-COMMS-01 bound it.

## 2. Reconcile the `0e7b8ce` delta onto the production line — DONE, NO WORK REQUIRED

```
git merge-base --is-ancestor origin/clean-main-no-secrets 0e7b8ce  →  YES
git merge-tree --write-tree  origin/clean-main-no-secrets 0e7b8ce  →  exit 0, no conflict
```

`0e7b8ce`'s parent **is** the current production HEAD. Reconciliation is a **pure
fast-forward**: no rebase, no conflict, no delta reconstruction. No commit was
manufactured — creating a duplicate cherry-pick would be exactly the duplicated work the
ruling forbids.

No other commit on the production line has touched the four routes since `be5b3b8`.

### Delta verified by reading, not by trusting the commit message

5 files, +220/−8. Each of the four routes changes from

```ts
await getResend().emails.send({ ... });
```

to

```ts
const { data: sendResult, error: sendError } = await getResend().emails.send({ ... });
if (sendError) {
  console.error('[<ROUTE>] Resend rejected the send:', sendError);
  return NextResponse.json({ error: '<that route's existing failure copy>' }, { status: 500 });
}
```

plus the Resend message id appended to the success log line.

Confirmed present and correct in all four: `email-code`, `magic-link`, `recover`,
`reset-password`. Confirmed **absent**: any auth redesign, token-semantics change, Resend
configuration change, or new email abstraction. `trackOnboarding` now sits after the
`sendError` return, so it can no longer record a send the provider refused. Provider
reasons go to the server log only; client responses stay generic.

## 3. Failing-before / passing-after + existing auth gates — DONE

Dependencies installed from the committed lockfile (`npm ci`, exit 0).

**Failing before** — the new test run against the *currently deployed* route code:

```
Tests: 10 failed, 2 passed, 12 total

● a resolved { data: null, error } is a failure, and never claims success
    Expected: 500
    Received: 200          ← the incident, reproduced against production code
```

**Passing after** — same test against the `0e7b8ce` routes:

```
Tests: 12 passed, 0 failed
```

**Existing auth gates** — full `app/api/members/` suite:

| | Suites | Tests |
|---|---|---|
| Baseline `be5b3b8` | 1 failed, 5 passed | **1 failed**, 42 passed, 43 total |
| With `0e7b8ce` | 1 failed, 6 passed | **1 failed**, 54 passed, 55 total |

The single failure is `register-local`, which **passes 3/3 in isolation** and fails
identically at baseline — pre-existing cross-suite interference, untouched by and
unrelated to this fix. The fix adds 12 passing tests and introduces **zero** new failures.

**Other gates:**

- `npm run check:no-supabase` → ✅ No Supabase detected.
- `npm run typecheck` (no-regression gate) → ✅ No TypeScript regressions.
  173 errors vs 239 baseline; 66 fixed since baseline; **not** re-baselined here.

Working tree restored clean. No route file was modified on the working branch.

---

## 4–6. Deploy and witness — BLOCKED, NOT PERFORMED

This evaluation environment is a remote cloud container. **`ssh`, `scp`, and `rsync` are
not installed**; minisforum is unreachable. The governed deploy path and the live signup
witness both require a host with SSH access to minisforum — the Mac Studio, not here.

Nothing was deployed. No test communication was sent to any member or address.

### Steps 4–6, to be run from the Mac Studio

**Step 4 — land the fix, then deploy the exact SHA.**

Land it first (fast-forward, or via PR if review is wanted):

```bash
git fetch origin fix/email-send-result-unchecked clean-main-no-secrets
git push origin 0e7b8ce0e20d3f341a0f3b0299eb20bf361f38e8:clean-main-no-secrets
```

Then deploy by explicit SHA through the governed lane:

```bash
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'
```

Verify provenance — this must return the deployed short SHA, not `unknown`:

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
ssh soullab@minisforum 'docker inspect maia-sovereign --format "{{.Created}}"'
```

**Step 5 — one real signup-code attempt** at `/signin` (or `POST /api/members/email-code`).
One address, one attempt.

**Step 6 — record the provider's actual answer.** The fix makes exactly one of these
appear; before it, neither could:

```bash
ssh soullab@minisforum \
  'docker logs maia-sovereign --since 10m 2>&1 | grep -E "EMAIL-CODE|Resend rejected"'
```

- **Accepted** → `[EMAIL-CODE] Code sent to <addr> (existing: <bool>, resendId: <id>)`
  → record the `resendId` and confirm the matching row exists in the Resend dashboard.
- **Rejected** → `[EMAIL-CODE] Resend rejected the send: { statusCode, name, message }`
  → record the provider's verbatim reason.

### Witness record — TO BE FILLED IN

```text
deployed SHA        : ____________________
GIT_COMMIT verified : ____________________
attempt timestamp   : ____________________
outcome             : ACCEPTED / REJECTED
resend message id   : ____________________
provider reason     : ____________________
```

**Then STOP.**

---

## Provider plan — do not pre-empt the witness

JARVIS-COMMS-01 marked `monthly_quota_exceeded` **INFERRED, never proven**, and that
stands. Resend's free tier is 3,000/month *and* 100/day, and paid plans carry
pay-as-you-go overage — so quota exhaustion is structurally a free-plan failure mode.
That makes the inference plausible; it does not make it true.

**Verify the actual plan and quota state, and read the witness, before changing billing.**
The rejection could equally be an API-key/account mismatch, a domain-verification lapse,
or rate limiting. Upgrade only if the provider's own reason names quota as the blocker.
The point of this deploy is to stop guessing.

---

## Recorded, deliberately not touched

- The same discarded-result defect at `team/invite:58,118`, `build/alert:64`,
  `feedback:28` (the last not even awaited), and `lib/team/notifications.ts`,
  `lib/masters/partnerNotifications.ts`, `lib/security/alertEngine.ts`.
  These belong to COMMS-02's enforcement slice, not to incident closure.
- The plaintext recovery-passkey exposure in `app/api/members/recover/route.ts` —
  its own bounded account-security lane, per the ruling.

## Not done

No provider change. No email abstraction migration. No fallback provider. No queue work.
No webhook. No delivery-record system. No marketing/transactional separation. No billing
change. No DNS/MX/SPF/DKIM/DMARC inspection or change. No secret read or printed. No test
communication sent.

---

# ADDENDUM 2026-08-24 — THE PRODUCTION LINE MOVED. THE AUTHORIZED ACT IS NOT EXECUTABLE AS WRITTEN.

The re-fetch that the authorized act opens with **fails at its own steps 2 and 3.**

```text
clean-main-no-secrets   be5b3b8  ->  e01d4a7e97b999f08fa4125e3836f5f28aeaf300
  e01d4a7e9  Merge pull request #1072 from SoullabTech/fix/email-send-result-truthfulness
  aae10b014  fix(signup): never report a code as sent when the provider refused

step 2  "confirm it is still be5b3b8"                  -> FAILS, it is e01d4a7
step 3  "confirm 0e7b8ce is still its FF successor"    -> FAILS, no longer an ancestor
```

**PR #1072 is already merged.** The instruction not to merge it arrived after it had
landed. `0e7b8ce` is not on the production line and is no longer fast-forwardable onto it.

## Landing `0e7b8ce` whole would now do the forbidden thing

```
git merge-tree origin/clean-main-no-secrets 0e7b8ce
  -> CONFLICT (content): app/api/members/email-code/route.ts
```

The two sibling implementations collide on exactly the route they both fix. Resolving that
conflict **is** combining both. Do not land `0e7b8ce` whole.

## What is actually true on the production line now

The landed implementation is **sound for signup**. Verified, not assumed:

- `app/api/members/email-code/__tests__/route.test.ts` at `e01d4a7`: **16 passed, 0 failed**.
- Against the chosen implementation's incident test, it returns **502, not 200** — it
  refuses to report success the provider never gave. The two behavioural "failures" in that
  cross-run are a status-code convention difference (`502` vs `500`); the structural
  assertions fail because #1072 routes through `sendEmail()` instead of calling
  `getResend()` inline — by design, not defect.
- On refusal it emits a distinct failure telemetry event carrying `providerCode`, logs
  `[EMAIL-CODE] Provider REFUSED the send …`, and never emits `Code sent`.

**But its coverage is narrower than the chosen implementation's.** On the current
production line:

| route | state at `e01d4a7` |
|---|---|
| `email-code` | ✅ fixed via `sendEmail()` (PR #1072) |
| `magic-link` | ❌ **still a bare discarding `await` — still lies** |
| `recover` | ❌ **still a bare discarding `await` — still lies** |
| `reset-password` | ❌ **still a bare discarding `await` — still lies** |

`0e7b8ce` covered all four. What landed covers one.

## The non-overlapping remainder applies cleanly

The `0e7b8ce` delta for **only** the three still-broken routes applies to the current
production line with **no conflict and no overlap with #1072**:

```
git diff 0e7b8ce^ 0e7b8ce -- app/api/members/{magic-link,recover,reset-password}/route.ts
  -> git apply --check against e01d4a7 : APPLIES CLEANLY
```

That is one implementation per route — not a combination.

## Witness commands CORRECTED

The grep recorded earlier looks for `Resend rejected the send`, which is the **chosen**
implementation's marker. The **landed** implementation prints a different line. On
`e01d4a7`, use:

```bash
ssh soullab@minisforum \
  'docker logs maia-sovereign --since 10m 2>&1 | grep -E "EMAIL-CODE.*(Code sent|Provider REFUSED)"'
```

- **Accepted** → `[EMAIL-CODE] Code sent to <addr> (existing: <bool>, id: <resend-id>)`
- **Rejected** → `[EMAIL-CODE] Provider REFUSED the send for <addr> — status=… providerCode=… error=…`
  — `providerCode` is the field that answers the billing question. Record it verbatim.

The HTTP status on refusal is **502** on this implementation, not 500.

## Decision required before the Mac Studio act can run

1. **Deploy `e01d4a7` as-is now.** Signup becomes truthful and the witness proceeds
   immediately. `magic-link` / `recover` / `reset-password` keep lying until a separate act.
2. **First reconcile the three-route remainder of `0e7b8ce` onto `e01d4a7`, then deploy
   that SHA.** All four account-access routes truthful at the witness. Costs one small
   commit — verified clean-applying above — before deploying.

Either way, `0e7b8ce` is not landed whole and PR #1072 is not un-merged. Billing stays
UNKNOWN until the witness reports `providerCode`.

**Nothing further executed. No deploy, no push to `clean-main-no-secrets`, no PR action.**

---

# ADDENDUM 2 — CANONICAL IS `e56e502f`. BOTH SIBLINGS ARE HISTORICAL.

PR #1073 landed the three-route remainder on top of #1072. The option 1 / option 2
decision point in Addendum 1 is **superseded** — neither sibling is a deploy target.

```text
e56e502ff  Merge PR #1073   <- CANONICAL, current clean-main-no-secrets tip
7c3b13ad9    the other three account-access routes stop claiming refused sends
e01d4a7e9  Merge PR #1072
aae10b014    signup: never report a code as sent when the provider refused
be5b3b802  (base)
```

## Verified at `e56e502f`

**All four account-access routes are truthful. Zero bare discarding awaits:**

| route | bare discarding `await` | result inspected |
|---|---|---|
| `email-code` | 0 | ✅ via `sendEmail()` (#1072) |
| `magic-link` | 0 | ✅ (#1073) |
| `recover` | 0 | ✅ (#1073) |
| `reset-password` | 0 | ✅ (#1073) |

**#1073 preserves #1072.** `7c3b13ad9` touches only the three routes plus one new test
file — it does not touch `email-code`, which still routes through `sendEmail()`.

**Gates:**

- New suite `app/api/members/__tests__/account-access-send-truthfulness.test.ts`:
  **24 passed, 0 failed.**
- Full `app/api/members/` suite: **76 passed, 1 failed, 77 total.**
- The single failure is `delete-account` › *"the delete request body carries no memberId"*.
  It fails **in isolation** and **identically at baseline `be5b3b8`** — pre-existing, and
  unrelated to any communications work. Not introduced here, not fixed here.
- Test count across this line: **43 → 77.** Zero new failures.

`0e7b8ce` is now **historical evidence only**: it proved the defect and reproduced the
incident, and its three-route delta has been superseded by the canonical `7c3b13ad9`.
Do not deploy it. Do not create another reconciliation commit.

## Remaining act — production side only, still not executable from here

`ssh` remains absent from this environment. Unchanged.

```bash
# 1. Let any legitimate deploy lock finish. Do NOT delete the lockfile.
ssh soullab@minisforum 'fuser -v ~/MAIA-SOVEREIGN/.deploy.lock'

# 2. What is actually live
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'

# 3. If not e56e502f or a descendant containing it, deploy canonical
ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
  && git fetch origin clean-main-no-secrets \
  && scripts/pre-deploy-gate.sh deploy-maia "$(git rev-parse --short origin/clean-main-no-secrets)"'
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'   # must equal it
```

### Witness A — while quota is still exhausted

One signup request. Required outcome: a **truthful non-200 refusal** carrying the actual
provider code, and **no `Code sent` line**.

```bash
ssh soullab@minisforum \
  'docker logs maia-sovereign --since 10m 2>&1 | grep -E "EMAIL-CODE.*(Code sent|Provider REFUSED)"'
```

- Expect `[EMAIL-CODE] Provider REFUSED the send for <addr> — status=… providerCode=… error=…`
- HTTP **502** on this implementation, not 500.
- A `Code sent` line here means the deploy did not take. Re-check `GIT_COMMIT`.
- Record `providerCode` verbatim. It is the only thing that turns the quota inference into
  a fact. **Do not retry blindly.**

### Witness B — after Resend capacity is restored

Second signup request. Required outcome: `[EMAIL-CODE] Code sent to <addr> (… id: <msg-id>)`
**and** the code actually arriving in the test inbox. Acceptance is not delivery — the
inbox check is the half that makes it end-to-end.

```text
WITNESS A   deployed SHA ______  refusal? ______  providerCode ______
WITNESS B   deployed SHA ______  message id ______  inbox arrival ______
```

Billing stays UNKNOWN until Witness A reports `providerCode`.

**Still closed:** COMMS-02 enforcement · `messages@soullab.life` sender switch · Proton
transport · waitlist cleanup · JARVIS.app · recovery-passkey review.
