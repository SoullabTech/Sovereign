# MAIA TestFlight Feedback (Tester Page)

Thanks for helping test MAIA. This page tells you:
1) what to test, and
2) how to report issues so we can fix them fast.

---

## 1) Update to the latest build
1) Open **TestFlight**
2) Tap **MAIA**
3) Pull down to refresh → tap **Update**
4) Open MAIA and run the quick test loop below

---

## 2) Quick test loop (takes 60–90 seconds)
Please test in this order:

1) **Talk → Transcribe**
   - Enter **Talk**
   - Speak a short sentence
   - Confirm your words transcribe (if Show Text is on)

2) **MAIA speaks → Talk again**
   - Let MAIA respond with audio
   - Immediately try **Talk** again
   - Confirm transcription works again

3) **? Voice Help**
   - Tap the **?** button in the mode row
   - Confirm the help sheet opens and is readable

4) **Show/Hide Text toggle**
   - Toggle **Show Text / Hide Text**
   - Confirm transcript visibility changes as expected

---

## 3) Common gotchas to check (before reporting)
- **Bluetooth/AirPods/Car audio** can hijack the mic route
  → Temporarily turn Bluetooth OFF and re-test.
- **Permissions** (both matter):
  - iPhone **Settings → Privacy & Security → Microphone → MAIA → ON**
  - iPhone **Settings → Privacy & Security → Speech Recognition → MAIA → ON**
  Then fully close MAIA (swipe up) and reopen.

---

## 4) How to report a bug (copy/paste template)
Send this in the feedback channel / email / GitHub issue:

**Build:** (TestFlight → MAIA → build number)
**Device + iOS:** (e.g., iPhone 14 Pro, iOS 17.2)
**Bluetooth/AirPods?** (Y/N)
**Permissions ON?** Microphone (Y/N), Speech Recognition (Y/N)

**What you expected:**
**What happened instead:**

**Steps to reproduce (1–5):**
1.
2.
3.
4.
5.

**How often:** (Every time / Sometimes / Once)

**Attachment:** screenshot or screen recording (best)

---

## 5) Severity (helps us prioritize)
- **P0** = Crash / voice unusable
- **P1** = Voice flaky but usable
- **P2** = UI / layout issue, minor UX

*Last updated: 2026-01-06*
