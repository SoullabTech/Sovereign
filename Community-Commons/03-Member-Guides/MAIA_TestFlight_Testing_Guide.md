# MAIA TestFlight Testing Guide (Members + Testers)

Thanks for helping test MAIA. This guide keeps reports consistent so we can fix issues fast.

---

## 1) Update to the latest build
1) Open **TestFlight**
2) Tap **MAIA**
3) Pull down to refresh
4) Tap **Update** (if available)

---

## 2) What to test (the core loop)
Please run this loop **3 times**:

1) **Talk mode** → say one sentence (confirm it transcribes)
2) Let **MAIA respond** (confirm audio plays)
3) **Talk again** immediately (confirm mic/transcription works again)

Also test:
- Tap the **? Voice Help** button → confirm the help sheet opens
- Toggle **Show Text / Hide Text** → confirm it actually hides/shows transcript

Optional (helps catch edge cases):
- Try once with **Bluetooth OFF** (AirPods/car audio can reroute the mic)
- Background app for 10 seconds → return → try Talk again

---

## 3) If voice doesn't work (quick self-fix)
If MAIA says "Listening…" but doesn't hear you:

### Step 1 — Permissions (most common)
iPhone **Settings → Privacy & Security**
- **Microphone → MAIA → ON**
- **Speech Recognition → MAIA → ON**

Then fully close MAIA (swipe up) and reopen.

### Step 2 — Try without Bluetooth
Turn Bluetooth off temporarily and try again.

### Step 3 — Reinstall (last resort)
1) Delete MAIA
2) Reinstall from TestFlight
3) Accept permissions again

---

## 4) How to report an issue (preferred)
Please file a GitHub issue using the TestFlight bug template:

```text
https://github.com/SoullabTech/Sovereign/issues/new/choose
```

If GitHub isn't convenient, you can message the team — but include the same details.

---

## 5) Severity (choose one)

* **P0** — Crash or voice unusable (you can't reliably talk to MAIA)
* **P1** — Voice flaky (works sometimes, fails sometimes)
* **P2** — UI/minor issue (layout, button visibility, text toggle confusion)

---

## 6) Include this info (copy/paste)

**Device model:**
**iOS version:**
**MAIA build number (TestFlight):**
**Severity:** P0 / P1 / P2
**What happened:** (1–2 sentences)

### Steps to reproduce (numbered)
1.
2.
3.

### Expected
What you thought should happen.

### Actual
What actually happened.

### Frequency
Every time / Often / Sometimes / Once

### Attachments
Screenshot or screen recording (best).

*Last updated: 2026-01-06*
