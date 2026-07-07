# Private Beta Allowlist — Spec (before code)

**Status:** SPEC for approval (touches live auth — no code until Kelly signs off). 2026-07-07.
**Posture:** private beta with simple auth. Keep email-code; add a quiet allowlist gate + waitlist. *Open registration ≠ public discoverability* — containment as an ethical property (first MAIA encounter is a reflective relationship; admit deliberately, in small groups). No passkeys (retired). Individual emails only — **no approved domains yet**.

## Non-goals
- No passkeys / no `/test-elemental` revival.
- No approved-domain rules yet (individual admission keeps it personal).
- No change to how the sign-in link is shared (that's a promotion choice, out of scope).
- No change to existing members' ability to sign in (see the guard below — this is load-bearing).

## Schema (two new tables — one migration)

```sql
CREATE TABLE beta_allowlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,                 -- stored lowercased/trimmed
  note        TEXT,                          -- "Larry Closs — practitioner pilot", etc.
  added_by    TEXT,                          -- founder/admin identifier
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX beta_allowlist_email_key ON beta_allowlist (LOWER(email));

CREATE TABLE beta_waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INT NOT NULL DEFAULT 1,      -- bumped on repeat attempts, not duplicated
  admitted_at TIMESTAMPTZ                     -- set when later moved to allowlist (audit trail)
);
CREATE UNIQUE INDEX beta_waitlist_email_key ON beta_waitlist (LOWER(email));
```

Seed in the same migration: `INSERT INTO beta_allowlist (email, note, added_by) VALUES ('larry@dynamichappy.com', 'Larry Closs — What Now? practitioner pilot', 'founder');`

## Gate logic — at code-send (`app/api/members/members/email-code` route)

On `POST /api/members/email-code { email }`:
1. Normalize email (lowercase/trim).
2. **Admit if EITHER:**
   - the email belongs to an **existing member** (`SELECT 1 FROM members WHERE LOWER(email)=$1`) — *load-bearing: existing members must always be able to sign in, allowlist or not*; **OR**
   - the email is in `beta_allowlist`.
3. **Admitted →** proceed exactly as today (send the 6-digit code). No behavior change for admitted users.
4. **Not admitted →** do **not** send a code. Upsert into `beta_waitlist` (insert, or bump `request_count` on conflict). Return a distinct, non-error response (e.g. `{ status: "waitlist" }`, HTTP 200) so the UI shows the warm message rather than a failure.

**Defense-in-depth (optional but cheap):** `register-email` also checks admission (existing-member-or-allowlisted) before creating the account. Since a non-admitted email never receives a code, this is belt-and-suspenders, not the primary gate.

## UI — `components/auth/UnifiedAuth.tsx`

On the `waitlist` response from the email step, render the warm message in place (not an error toast):

> **"We're welcoming people in small groups so we can give each person careful attention. Join the waitlist and we'll reach out as we expand."**

The waitlist capture happens server-side on the gated send (they already entered their email), so the copy is honest as shown — no extra button required. (If you'd prefer an explicit "Join the waitlist" confirm step, that's a small addition — flag it.)

## Consent / security notes
- **Existing-member guard is the critical correctness item** — without it, the gate would lock out `michael.demo`, `info` (Kelly), `jondi`, etc. Verify explicitly.
- **Waitlist storage = keeping an email to contact later.** The message states "we'll reach out," so capture is transparent and consistent with what's shown. No other data stored.
- **Enumeration:** the differing response (code-sent vs waitlist) does reveal admission status for a probed email. For a private beta that is *intended* (we're telling people their status), and it exposes nothing sensitive. Acceptable for this posture; note it, don't over-engineer.
- No passkeys, no PII beyond the email the person typed.

## Migration + deploy
- Migration file: `database/migrations/<timestamp>_beta_allowlist_and_waitlist.sql` (creates both tables + seeds Larry).
- **Schema and reader ship together:** the migration + the gate code + the UI land in one change.
- Ships via the **full `scripts/deploy-production.sh`** path (runs migrations, tags for rollback) — not the quick maia-only rebuild. Coordinate-first w.r.t. the parallel session, as before.

## Verification plan (post-deploy)
1. **Existing member** (e.g. an email already on a `members` row) → code sent ✓ (not locked out).
2. **Larry** `larry@dynamichappy.com` (seeded) → code sent ✓.
3. **Random non-admitted email** → no code; `beta_waitlist` row created; UI shows the warm message ✓.
4. **Repeat non-admitted attempt** → `request_count` bumps, no duplicate row ✓.
5. Add an email to `beta_allowlist` → that email now gets a code ✓ (dynamic admission works without a deploy).

## Live / Designed / Vision
- Tables + gate + UI message: **Designed** (this spec) → **Live** after the migration deploy + verification.
- Founder-managed allowlist via SQL: Live at ship. Admin UI to manage allowlist/waitlist: **Vision** (later).

## Decisions locked (Kelly, 2026-07-07)
New `beta_allowlist` + `beta_waitlist` tables (not invites) · individual emails only, no domains · capture waitlist · message verbatim · seed Larry · spec-before-code.
