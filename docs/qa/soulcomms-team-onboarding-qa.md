# SoulComms — Team Onboarding QA Worksheet
**Date:** 2026-03-20
**Build:** PRs #179, #180, #181 + team_admin grant
**Tester:** _______________

---

## Setup
1. Open the **live production Admin Panel** at `soullab.life/team/admin` → Members → + Invite
2. Send invite to a test email address (genuinely unused — not previously registered)
3. Copy the invite link from the email
4. Use that token for invite flow tests below

**Test execution order** (fastest signal on loop closure):
A1 → A2 → A3 → A4 → B1 → B2 → C1 → C2 → C3 → D

**A3 environment requirements:**
- Fresh incognito / private browser window (no Soullab cookies)
- A genuinely unused email address
- A username not previously registered
- Test against `soullab.life`, NOT localhost — production token lives in production DB only

**Highest-risk paths** (pay closest attention here):
1. **A3** — new user registration: session, token consumption, redirect, DB state
2. **B1** — DM thread creation: first-time creation + post-reload persistence
3. **Access control edge** — unauthenticated invite routes open; rest of /api/team still protected

---

## A. Invite Flows

### A1 — Signed-in existing member
| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Open invite link while signed in as existing member | Invite card shows with "Accept & join workspace" button | |
| 2 | Click "Accept & join workspace" | Button shows "Accepting..." | |
| 3 | After accept | Green checkmark + "Welcome to Soullab" message | |
| 4 | After 1.5s | Redirected to /team | |
| 5 | Admin Panel → Members → Pending Invites | Invite no longer in list | |

**State verification:**
- [ ] Invite `accepted_at` is set (visible as "consumed" in pending list)
- [ ] Reopening the same link shows "Already accepted" (not an error, not a blank page)

**Retry / edge:**
- [ ] Reopen the accepted link → "Already accepted" state, no broken page

**Notes:** _______________

---

### A2 — Signed-out existing member
| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Sign out, open invite link | Invite card shows with "Sign in to accept" + "New to Soullab?" buttons | |
| 2 | Click "Sign in to accept" | Redirected to /signin?next=/team/invite/[token] | |
| 3 | Sign in with credentials | After sign-in, redirected back to invite page at /team/invite/[token] | |
| 4 | Click "Accept & join workspace" | Invite accepted | |
| 5 | After accept | Redirected to /team | |

> **Requires a fresh (unused) invite token — create a second invite**

**State verification:**
- [ ] Invite removed from pending list
- [ ] Reopening same link shows "Already accepted"
- [ ] No residual token reuse possible (try link again after step 5)

**Retry / edge:**
- [ ] Use same link a second time after acceptance → clean rejection, no loop

**Notes:** _______________

---

### A3 — Brand-new user (no Soullab account)
| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Open invite link in incognito / signed-out browser | Invite card shows with two buttons | |
| 2 | Click "New to Soullab? Create account" | Inline form expands: Name, Username, Password fields | |
| 3 | Enter: name, unique username, password ≥8 chars | Form accepts input | |
| 4 | Click "Create account & join" | Button shows "Creating account..." | |
| 5 | After submit | Green checkmark + "Welcome to Soullab" | |
| 6 | After 1.5s | Redirected to /team | |
| 7 | Admin Panel → Members | New member appears in list | |
| 8 | Admin Panel → Pending Invites | Invite consumed, no longer pending | |
| 9 | Sign out, sign back in with new credentials | Sign-in works | |

**A3 critical success chain** (every step must hold):
- [ ] Invite page loads — no redirect to sign-in, no 401
- [ ] Inline registration form appears on "Create account" click
- [ ] Account creates successfully (no error message)
- [ ] Session established immediately (no manual sign-in required after submit)
- [ ] Invite consumed (`accepted_at` set)
- [ ] User lands in /team
- [ ] User appears in Admin → Members with `onboarded: true`
- [ ] Invite gone from Admin → Pending Invites
- [ ] No duplicate member created (check Members list for doubled entry)

**State verification (DB-level, run after A3):**
```sql
-- Run via: docker exec maia-postgres psql -U soullab maia_consciousness
SELECT username, onboarded, created_at FROM members WHERE username = '<new-username>';
SELECT accepted_at, accepted_by FROM team_invites WHERE email = '<invite-email>';
```
Expected: `onboarded = true`, `accepted_at` is set, exactly one row per query.

**Retry / edge:**
- [ ] Refresh the /team page after landing — stays in /team, no redirect loop
- [ ] Try submitting the same registration form again (back button after success) → "invite already used" or clean error, no duplicate account

**Notes:** _______________

---

### A4 — Invalid / expired / revoked invite
| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Admin Panel → Pending Invites → click Revoke | Invite removed from list | |
| 2 | Open the revoked invite link | "Invite not found" state (not 401, not blank page) | |
| 3 | Expire an invite via DB: `docker exec maia-postgres psql -U soullab maia_consciousness -c "UPDATE team_invites SET expires_at = NOW() - INTERVAL '1 day' WHERE email = '<email>';"` | — | |
| 4 | Open the expired invite link | "Invite expired" state with clear message | |
| 5 | Use an already-accepted invite link | "Already accepted" state | |
| 6 | Navigate to /team/invite/completely-fake-token | "Invite not found" state | |

**State verification:**
- [ ] All four error states render without auth loop or blank page
- [ ] None of the error states trigger a redirect to /signin

**Notes:** _______________

---

## B. DM Flows

### B1 — DM thread creation and persistence
| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Click a member name in the roster (right sidebar) | DM view opens for that member | |
| 2 | Send a message | Message appears in thread | |
| 3 | Hard refresh (Cmd+Shift+R) | Same DM thread loads, message persists | |
| 4 | Click a different member | New DM thread opens or creates | |
| 5 | Return to first member | First thread still intact | |

**State verification:**
- [ ] After step 2, exactly one DM thread exists for this pair (check Admin or DB — no duplicates)
- [ ] After hard refresh, thread ID in URL is the same thread

**Retry / edge:**
- [ ] Click same member twice rapidly → only one thread created, no duplicate

**Notes:** _______________

---

### B2 — DM profile cards
| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Open DM with member who has full profile (name, bio, timezone) | Profile card above messages: avatar, name, presence, bio, timezone visible | |
| 2 | Open DM with member who has minimal profile (only username) | Profile card renders, missing fields absent but no broken layout | |
| 3 | Open DM with a member who has no bio or timezone set | No blank panels, no JS errors visible in browser console | |

**Notes:** _______________

---

## C. Admin Panel

### C1 — Members tab
| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Open /team/admin as Kelly or Jondi | Admin panel loads (not 403) | |
| 2 | Navigate to Members tab | Member list shows with search, message counts | |
| 3 | Toggle team_admin on a member | Role updates, badge appears | |
| 4 | Toggle team_admin off | Role removed | |

**State verification:**
- [ ] After toggle on: refresh page — badge still present
- [ ] After toggle off: refresh page — badge gone

**Notes:** _______________

---

### C2 — Pending Invites
| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Create an invite via + Invite in sidebar | Invite appears under Pending Invites in admin | |
| 2 | Click Revoke next to invite | Invite disappears from list | |
| 3 | Refresh admin page | Revoked invite still absent | |
| 4 | Try the revoked link | "Invite not found" state | |

**Notes:** _______________

---

### C3 — Channels tab
| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Open Channels tab | All 8 channels listed | |
| 2 | Edit a channel name/description | Save works, channel updates in sidebar | |
| 3 | Archive a channel | Channel shows as archived in list, disappears from sidebar | |
| 4 | Unarchive | Channel returns to sidebar | |

**Notes:** _______________

---

## D. Private Channels

> Skip if no private channels exist yet — create one first via Admin → Channels → Create with "Private" toggle on

| Step | Action | Expected | Pass/Fail |
|------|--------|----------|-----------|
| 1 | Create a private channel | Lock icon shows in sidebar | |
| 2 | Sign in as member NOT added to channel | Channel not visible in their sidebar | |
| 3 | Sign in as member IN channel | Channel visible, accessible | |
| 4 | In ChannelPurposeHeader, click Members (N) | Members panel slides in | |
| 5 | Add a member via search | Member added, can now see/access channel | |
| 6 | Remove a member | Member removed from panel | |

**State verification:**
- [ ] Non-member cannot reach channel URL directly (try navigating to /team/[private-channel-slug] while signed in as non-member)

**Notes:** _______________

---

## Summary

| Section | Pass | Fail | Blocked | Notes |
|---------|------|------|---------|-------|
| A. Invite flows | | | | |
| B. DM flows | | | | |
| C. Admin panel | | | | |
| D. Private channels | | | | |

**Open issues to file:**

1. _______________
2. _______________
3. _______________

---

*QA completed:* _______________
*Tester:* _______________

---

## Release Readiness Summary

> Fill in after worksheet is complete. Use this as the handoff artifact.

**Build tested:** PRs #179, #180, #181 — deploy date: 2026-03-20

### Passed
-
-

### Failed
-
-

### Blocked (could not test)
-
-

### Follow-up fixes required before wider rollout
| # | Issue | Severity (blocking / high / low) | Owner |
|---|-------|----------------------------------|-------|
| 1 | | | |
| 2 | | | |

### Verdict
- [ ] **SHIP** — all critical paths pass, no blockers
- [ ] **SHIP WITH NOTES** — minor issues, safe for internal team use
- [ ] **HOLD** — blocking issue must be fixed before inviting external members

**"Green" conditions** (all must hold to SHIP):
- All 4 invite paths pass
- No duplicate users or orphaned invites
- DM threads create + persist reliably
- Admin panel reflects real state (no drift from DB)
- Private channel visibility enforced

**Notes for next milestone (private channel enforcement + polish):**
