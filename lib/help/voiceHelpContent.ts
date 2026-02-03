/**
 * Voice Help Content
 * In-app help for voice troubleshooting
 */

export const VOICE_HELP_MD = `# Voice Help (Quick Fix)

If MAIA says **"Listening…"** but doesn't hear you:

## 1) Permissions (most common)
Go to iPhone **Settings → Privacy & Security**
- **Microphone → MAIA → ON**
- **Speech Recognition → MAIA → ON**

Close MAIA completely (swipe up) and reopen.

## 2) Update MAIA
Open **TestFlight → MAIA → Update**
(Pull down to refresh if you don't see Update.)

## 3) Remove Bluetooth (quick test)
Turn **Bluetooth OFF** temporarily (AirPods/car can reroute the mic).
Try again in **Talk** mode.

---

## Still not working? Send support this:
- **iPhone model + iOS version**
- **MAIA build # (TestFlight)**
- **Mic ON? / Speech Recognition ON?**
- **Bluetooth ON?**
- Screenshot/screen recording if possible
`;

export const VOICE_HELP_MICRO = `**Voice not working?**
1) Settings → Privacy & Security → **Microphone + Speech Recognition → MAIA ON**
2) TestFlight → MAIA → **Update**
3) Turn **Bluetooth OFF** and retry

**Send support:** iPhone+iOS, MAIA build#, mic/speech ON, bluetooth ON, screenshot/video`;

// Structured version for programmatic use
export const VOICE_HELP_STEPS = [
  {
    title: 'Permissions (most common)',
    description: 'Go to iPhone Settings → Privacy & Security',
    items: [
      'Microphone → MAIA → ON',
      'Speech Recognition → MAIA → ON',
    ],
    note: 'Close MAIA completely (swipe up) and reopen.',
  },
  {
    title: 'Update MAIA',
    description: 'Open TestFlight → MAIA → Update',
    note: 'Pull down to refresh if you don\'t see Update.',
  },
  {
    title: 'Remove Bluetooth (quick test)',
    description: 'Turn Bluetooth OFF temporarily (AirPods/car can reroute the mic).',
    note: 'Try again in Talk mode.',
  },
] as const;

export const VOICE_HELP_SUPPORT_TEMPLATE = {
  fields: [
    'iPhone model + iOS version',
    'MAIA build # (TestFlight)',
    'Mic ON? / Speech Recognition ON?',
    'Bluetooth ON?',
    'Screenshot/screen recording if possible',
  ],
};
