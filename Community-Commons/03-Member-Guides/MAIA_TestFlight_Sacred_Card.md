# TestFlight Quick Test (1 minute)

### Update
TestFlight → **MAIA** → pull to refresh → **Update**

---

### Voice Loop (the main test)
1) Tap **Talk** → say: "Testing one two three"
2) Let MAIA respond (MAIA speaks)
3) Tap **Talk again** → say: "Second test after MAIA spoke"

**Pass:** both transcribe + respond
**Fail:** stuck "Listening…", no text, or 2nd Talk breaks

---

### UI Checks (10 sec)
- Tap **? Voice Help** → opens + readable
- Tap **Show Text / Hide Text** → visible + works

---

### If Voice Breaks (fast fixes)
1) **Force close** MAIA → reopen → retry Voice Loop
2) **Bluetooth OFF** (AirPods/car) → retry
3) Settings → Privacy & Security:
   - **Microphone → MAIA → ON**
   - **Speech Recognition → MAIA → ON**

   Then force close → retry

---

### Report a Bug (copy/paste)
**Device + iOS:**
**MAIA build #:**
**What happened:**
**Steps:** 1) 2) 3)
**Frequency:** Every / Often / Sometimes / Once
**Bluetooth:** Off / On / AirPods / Car
**Video:** (10–20 sec screen recording)

---

*Last updated: 2026-01-06*
