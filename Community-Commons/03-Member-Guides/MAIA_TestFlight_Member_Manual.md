# MAIA TestFlight Member Manual

Thanks for helping test MAIA. This guide keeps feedback consistent so we can fix issues fast.

## 1) Update to the latest build

1. Open **TestFlight**
2. Tap **MAIA**
3. **Pull down** to refresh
4. Tap **Update**

If you don't see Update: wait a bit and refresh again (builds can take time to appear).

---

## 2) The main test loop (do this first)

This is the most important check for voice reliability:

### Voice Loop

1. Tap **Talk**
2. Say: "Testing one two three"
3. Let MAIA respond (so MAIA speaks)
4. Tap **Talk again** and say: "Second test after MAIA spoke"

**Expected:** both attempts transcribe and work normally

**Report if:** the second Talk doesn't hear you, doesn't transcribe, or gets stuck on "Listening…"

---

## 3) Extra checks (quick)

### A) "?" Voice Help

* Find the **?** button near the Talk/Care/Note/Start row
* Tap it
* Confirm the help sheet opens and looks readable

### B) Show/Hide Text toggle

* Tap **Show Text / Hide Text**
* Confirm it's visible (not hidden behind the top bar) and works

---

## 4) If voice fails, try these quick fixes (before reporting)

### Quick Fix 1 — Force close + reopen

* Swipe up to fully close MAIA
* Reopen MAIA
* Try the Voice Loop again

### Quick Fix 2 — Check permissions (only if voice is dead)

On iPhone:

1. **Settings → Privacy & Security**
2. **Microphone → MAIA → ON**
3. **Speech Recognition → MAIA → ON**

Then force close MAIA and reopen.

### Quick Fix 3 — Bluetooth check

If you're using **AirPods / car audio**:

* Try once with Bluetooth **ON**
* Then try again with Bluetooth **OFF**

Tell us whether Bluetooth changes the outcome.

---

## 5) How to report a bug (copy/paste template)

If something breaks, send a report using this format:

**Title (1 line):**
(Example: "Talk works first time, fails after MAIA speaks")

**Device + iOS:**
* iPhone model:
* iOS version:

**MAIA Build #:**
(From TestFlight → MAIA → build number)

**What happened (short):**
(Example: "Second Talk gets stuck on Listening and no transcription.")

**Steps to reproduce (numbered):**
1.
2.
3.

**Expected:**
(What you thought would happen)

**Actual:**
(What happened instead)

**Frequency:**
Every time / Often / Sometimes / Once

**Bluetooth:**
Off / On / AirPods / Car audio

**Attachments:**
Screen recording is best (10–20 seconds is enough)

---

## 6) What makes a report "perfect"

The fastest-to-fix reports include:

* the **Voice Loop** steps
* device + iOS + build number
* whether **Bluetooth** was connected
* a short **screen recording**

---

## 7) Quick "micro" report (if you're busy)

If you only have 30 seconds, send this:

**iPhone + iOS + build #:**
**Issue:**
**Voice Loop result:** (Talk → MAIA speaks → Talk again)
**Bluetooth:** On/Off
**Video:** (if possible)

---

*Last updated: 2026-01-06*
