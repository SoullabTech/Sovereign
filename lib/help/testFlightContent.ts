/**
 * TestFlight Quick Test Card Content
 * For use in Sacred UI sheets and in-app help
 */

export const TESTFLIGHT_QUICK_CARD_MD = `# TestFlight Quick Test (1 minute)

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
`;

export const TESTFLIGHT_TOAST_MICRO =
  "New build ready — TestFlight → MAIA → pull to refresh → Update. Please run the 1-minute Voice Loop.";

export const TESTFLIGHT_BUG_TEMPLATE = `Device + iOS:
MAIA build #:
What happened:
Steps: 1) 2) 3)
Frequency: Every / Often / Sometimes / Once
Bluetooth: Off / On / AirPods / Car
Video:`;

/**
 * Structured sections for SacredCard components
 */
export const TESTFLIGHT_SECTIONS = {
  update: {
    title: 'Update',
    content: 'TestFlight → MAIA → pull to refresh → Update',
  },
  voiceLoop: {
    title: 'Voice Loop',
    subtitle: 'the main test',
    steps: [
      'Tap Talk → say: "Testing one two three"',
      'Let MAIA respond (MAIA speaks)',
      'Tap Talk again → say: "Second test after MAIA spoke"',
    ],
    pass: 'both transcribe + respond',
    fail: 'stuck "Listening…", no text, or 2nd Talk breaks',
  },
  uiChecks: {
    title: 'UI Checks',
    subtitle: '10 sec',
    items: [
      'Tap ? Voice Help → opens + readable',
      'Tap Show Text / Hide Text → visible + works',
    ],
  },
  fixes: {
    title: 'If Voice Breaks',
    subtitle: 'fast fixes',
    steps: [
      'Force close MAIA → reopen → retry Voice Loop',
      'Bluetooth OFF (AirPods/car) → retry',
      'Settings → Privacy & Security: Microphone → MAIA → ON, Speech Recognition → MAIA → ON. Then force close → retry',
    ],
  },
  report: {
    title: 'Report a Bug',
    fields: [
      'Device + iOS',
      'MAIA build #',
      'What happened',
      'Steps: 1) 2) 3)',
      'Frequency: Every / Often / Sometimes / Once',
      'Bluetooth: Off / On / AirPods / Car',
      'Video: (10–20 sec screen recording)',
    ],
  },
} as const;
