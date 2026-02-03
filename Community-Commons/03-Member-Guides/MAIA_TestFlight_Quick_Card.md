# MAIA TestFlight Quick Test Card

## 1) Update (30 seconds)

**TestFlight → MAIA → pull to refresh → Update**

---

## 2) The 60-second Voice Loop (the main test)

1. Tap **Talk**
2. Say: "Testing one two three"
3. Let MAIA respond (MAIA speaks)
4. Tap **Talk again**
5. Say: "Second test after MAIA spoke"

**Pass** = both transcribe + respond
**Fail** = stuck on "Listening…", no transcription, or 2nd Talk breaks

---

## 3) Two UI checks (10 seconds)

* Tap **? Voice Help** → sheet opens + readable
* Tap **Show Text / Hide Text** → visible + works (not hidden)

---

## 4) If voice fails (try in this order)

1. **Force close MAIA** (swipe up) → reopen → try Voice Loop again
2. **Bluetooth OFF** (AirPods/car can hijack mic) → try Voice Loop again
3. **Permissions check** (only if voice is dead):
   * Settings → Privacy & Security → **Microphone → MAIA → ON**
   * Settings → Privacy & Security → **Speech Recognition → MAIA → ON**

   Then force close MAIA → reopen

---

## 5) Report a bug (fast template)

**Device + iOS:**
**MAIA build #:** (TestFlight)
**What happened:**
**Steps (numbered):** 1…2…3…
**Frequency:** Every time / Often / Sometimes / Once
**Bluetooth:** Off / On / AirPods / Car
**Video:** (best: 10–20 sec screen recording)

Where to submit: **GitHub Issues → "MAIA TestFlight Bug Report"** (template)

---

## Micro version (in-app help panel)

**Quick Test:** Talk → MAIA speaks → Talk again.
If broken: force close → try w/ Bluetooth off → check Mic + Speech Recognition permissions.
Report with device + iOS + build # + steps + short video.

---

*Last updated: 2026-01-06*
