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
