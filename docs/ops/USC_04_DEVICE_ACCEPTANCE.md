# USC-04 — iPhone device acceptance protocol

**Gate:** PR #1093 is not merge-eligible until this passes on a real device.
**Status:** ⬜ NOT RUN — requires physical hardware; cannot be executed in CI or a container.

USC-04's DB and queue layers are proven (44 automated tests + PostgreSQL 16 migration
proofs). What remains unproven is the thing those layers exist to serve: that a capture
made on a phone, in a room, with a flaky connection, actually survives. Until this sheet is
filled in, USC-04 is **BUILT + DB GREEN + DEVICE UNVERIFIED** — not GREEN.

---

## Record before starting

| Field | Value |
|---|---|
| Device | |
| iOS version | |
| Build (Capacitor / PWA / Safari) | |
| App build id | |
| Deployed `GIT_COMMIT` | |
| Branch SHA under test | |
| Member id (test account) | |
| Tester / date | |

Confirm the deployed commit **before** testing:

```bash
ssh soullab@minisforum 'docker exec maia-sovereign printenv GIT_COMMIT'
```

Surface under test: `/maia/capture`

---

## Verification helpers

```bash
# All captures for the test member, newest first
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
 "SELECT id, source, modality, session_id IS NULL AS unbound, client_capture_id, captured_at \
    FROM session_captures WHERE member_id = '\''<MEMBER_ID>'\'' \
   ORDER BY captured_at DESC LIMIT 20;"'

# Duplicate check — the single most important query on this sheet
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -c \
 "SELECT client_capture_id, count(*) FROM session_captures \
   WHERE member_id = '\''<MEMBER_ID>'\'' GROUP BY 1 HAVING count(*) > 1;"'
```

A capture never carries readable content in the database — `content_enc` is ciphertext. Verify
content through the app surface, not via SQL.

---

## Required proofs

### 1. MARK saves immediately
Open `/maia/capture` with a good connection. Tap **MARK** once.

- [ ] Haptic fires
- [ ] Confirmation names the destination ("Saved to …")
- [ ] Confirmation appears without a spinner or perceptible wait
- [ ] Exactly one row appears in `session_captures` with `source='iphone'`, `modality='marker'`

**Result:** ⬜ PASS ⬜ FAIL — notes:

---

### 2. Offline MARK survives reconnect
Enable Airplane Mode. Tap **MARK** twice.

- [ ] Both taps acknowledge immediately (no error, no spinner)
- [ ] Banner shows offline state and "2 waiting to sync"
- [ ] No new rows in the database yet

Disable Airplane Mode. Wait up to 20s or foreground the app.

- [ ] Pending count returns to zero
- [ ] Exactly **two** new rows appear — not one, not three

**Result:** ⬜ PASS ⬜ FAIL — notes:

---

### 3. Replay produces one capture
While offline, tap **MARK** once. Then, before reconnecting, force-quit and reopen the app.
Reconnect.

- [ ] The capture still delivers after the relaunch
- [ ] Duplicate-check query returns **zero rows**

This is the proof that `clientCaptureId` is minted at capture time and survives a process
death — the guarantee the Watch will depend on.

**Result:** ⬜ PASS ⬜ FAIL — notes:

---

### 4. Active-session resolution lands correctly
Start a Session Room session on the desktop and **confirm consent**. Then, on the phone,
open `/maia/capture`.

- [ ] Banner shows the session and a running elapsed timer
- [ ] Tap MARK → confirmation names the session, not "your captures"
- [ ] The capture appears in Session Room's timeline (`GET /api/capture/timeline`)
- [ ] `session_id` is populated and `session_offset_ms` is plausible

**Result:** ⬜ PASS ⬜ FAIL — notes:

---

### 5. No-active-session capture lands in the inbox
End the Session Room session (or start from none). On the phone, tap **MARK**.

- [ ] Banner reads "Your captures"
- [ ] Confirmation reads "Saved to your captures"
- [ ] Row has `session_id IS NULL`
- [ ] **No new `scribe_sessions` row was created** — this is the consent boundary; a capture
      must never manufacture a session

Also verify with a session that is active but consent **not** confirmed: the capture must
still land unbound.

**Result:** ⬜ PASS ⬜ FAIL — notes:

---

### 6. Voice and text capture reach the same canonical timeline
With a consented session running, capture one **Type** note and one **Speak** note.

- [ ] Text capture stores and appears in the session timeline
- [ ] Speak transcribes on-device and appears in the same timeline
- [ ] Both sit in one ordered timeline beside desktop markers — not a separate list
- [ ] If speech recognition is unsupported, the Speak control is visibly disabled rather
      than appearing to listen

**Result:** ⬜ PASS ⬜ FAIL — notes:

---

### 7. Backgrounding immediately after capture does not lose it
Tap **MARK** and background the app within ~1 second (home gesture). Wait 30s. Reopen.

- [ ] The capture is present
- [ ] No duplicate

Repeat while offline, then reconnect **while still backgrounded**, then reopen.

- [ ] Capture delivered exactly once

**Result:** ⬜ PASS ⬜ FAIL — notes:

---

## Acceptance

| Proof | Result |
|---|---|
| 1 MARK immediate | ⬜ |
| 2 Offline survives reconnect | ⬜ |
| 3 Replay → one capture | ⬜ |
| 4 Active-session binding | ⬜ |
| 5 Inbox fallback + no session created | ⬜ |
| 6 Voice/text → canonical timeline | ⬜ |
| 7 Backgrounding safe | ⬜ |

**USC-04 DEVICE:** ⬜ GREEN ⬜ AMBER ⬜ RED

Any FAIL on 2, 3, 5, or 7 is RED, not AMBER: those are the capture-loss, duplication, and
consent-boundary guarantees. A failure there means the contract is not what the code claims.

Paste the completed sheet into PR #1093 before merge.
