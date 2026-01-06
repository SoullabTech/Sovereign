# MAIA TestFlight Voice + "Show Text" Toggle Runbook
**Audience:** Team + builders (with a member-facing section at the top)
**Purpose:** Fix "Listening…" but not hearing, fix the hidden text toggle UI, and ship to TestFlight with reliable debugging.

---

## 0) Quick Context (What's Happening)
Sometimes MAIA shows **"Listening…"** but no transcript appears. On iOS this usually means:
- Speech Recognition permission is OFF (separate from Microphone), or
- Native speech plugin isn't actually starting (even though UI says it is), or
- Audio route is hijacked (Bluetooth), or
- After MAIA speaks, mic restart conflicts with iOS audio session (crash or silent failure).

---

# Part A — Member / Tester Guide (send this first)

## A1) Quick Fix Checklist (2 minutes)
If MAIA says **"Listening…"** but doesn't hear you:

1) **Settings → Privacy & Security → Microphone → MAIA → ON**
2) **Settings → Privacy & Security → Speech Recognition → MAIA → ON**
3) Fully close MAIA (swipe up) and reopen
4) Open **TestFlight → MAIA → Update** (if available)
5) Try again in **Talk** mode

If "Speech Recognition" doesn't show MAIA:
- Delete MAIA from your phone
- Reinstall from TestFlight (forces the permission prompts again)

## A2) Common Gotchas
- **Bluetooth/AirPods/Car mic:** turn Bluetooth off temporarily and test again.
- **Show Text / Hide Text toggle is OFF:** you might be talking, but text display is hidden.

## A3) If Still Broken, Send Support This Template
**Device model:**
**iOS version:**
**MAIA build number (TestFlight):**
**What happens:** (Listening but no words / crash after MAIA speaks / etc.)
**Orange mic dot visible?** (Yes/No)
**Mic permission ON?** (Yes/No)
**Speech Recognition permission ON?** (Yes/No)
**Bluetooth on?** (Yes/No)
**Screenshot / screen recording:**

---

# Part B — Team / Builder Runbook

## B1) Fast Diagnosis Matrix

### Symptom: "Listening…" but hears nothing
Most likely causes:
- Permissions not granted (Speech Recognition is OFF)
- Native plugin fails to start (see Xcode console)
- Wrong speech path (web speech recognition on iOS)
- Audio input routed to Bluetooth device incorrectly

### Symptom: Crash when mic restarts after MAIA speaks
Most likely causes:
- iOS audio session not fully released after TTS
- Recognition restarted while `isSpeaking` / `isProcessing` still true
- Listener accumulation (multiple event listeners firing)

---

## B2) Get Real Logs (Stop Guessing)

### Option 1 (Best): Xcode Device Console
1) Plug iPhone into Mac
2) Xcode → **Window → Devices and Simulators**
3) Select iPhone → **Console**
4) Filter by:
- `SpeechRecognition`
- `ContinuousConversation`
- `Native`
- `Error`

This reveals permission failures, "not available" results, and audio session issues.

### Option 2: Safari Web Inspector (JS logs)
1) iPhone: Settings → Safari → Advanced → **Web Inspector ON**
2) Mac Safari: Develop → (Your iPhone) → MAIA webview
3) Watch console while tapping mic and speaking

---

## B3) UI Fix: Move the Hidden "Show Text / Hide Text" Toggle

### Where
`components/OracleConversation.tsx`
Section: `/* Text Display Toggle for Voice Mode */`

### Quick Fix (Tailwind)
Move from behind the top mode row:

**Before**
```tsx
<div className="fixed top-20 md:top-20 right-4 md:right-8 z-below-nav">
```

**After**
```tsx
<div className="fixed top-36 md:top-36 right-4 md:right-8 z-below-nav">
```

### Recommended "Never Hides Again" Fix (Safe-Area Aware)

Use iOS safe area + consistent offset:

```tsx
<div
  className="fixed right-4 md:right-8 z-50"
  style={{ top: 'calc(env(safe-area-inset-top, 0px) + 9rem)' }}
>
```

Notes:
* `env(safe-area-inset-top)` accounts for notch/Dynamic Island
* `z-50` prevents it from sitting beneath nav layers
* Adjust `9rem` up/down to taste (8–10rem range typically)

---

## B4) Voice Reliability: Permission-Gated Native Start (Required)

**Goal:** Never show "Listening…" unless native speech recognition successfully starts.

**Where:** `components/voice/ContinuousConversation.tsx` (native branch)

### Requirements
* Call `available()`
* Call `checkPermissions()`
* If needed call `requestPermissions()`
* If not granted → set listening false + show user guidance (don't pretend)

Also: ensure iOS never falls back to `webkitSpeechRecognition`.

---

## B5) Shipping to TestFlight (Team Checklist)

### 1) Commit UI / Voice fixes
```bash
git add components/OracleConversation.tsx
git commit -m "ui: move voice text toggle below mode row"
git push
```

### 2) Build for Capacitor
```bash
CAPACITOR_BUILD=1 \
MAIA_AUDIT_FINGERPRINT_SECRET=build-placeholder \
NODE_OPTIONS="--max-old-space-size=8192" \
npm run build
```

### 3) Sync iOS
```bash
npx cap sync ios
```

If pods fail:
```bash
rm -rf ios/App/build
npx cap sync ios
```

### 4) Deploy to TestFlight
```bash
APPSTORE_ISSUER_ID='2f3ea491-8e65-4769-b503-3c50172f10ab' ./scripts/deploy-testflight.sh
```

---

## B6) App Store Connect: Why Builds Don't Show for Testers

If upload succeeds but testers can't see it, check:

1. Build is still **Processing**
2. **Missing Compliance** (Export Compliance / encryption questions)
3. Build not added to **Test Group(s)**

Fix:
* App Store Connect → App → TestFlight → Build → finish compliance → assign to group(s)

---

## B7) QA Definition of Done

After each TestFlight build:

- [ ] Toggle is visible & tappable (not under the mode row)
- [ ] Talk mode transcribes consistently
- [ ] MAIA speaks and mic resumes without crash
- [ ] Background → foreground works
- [ ] Bluetooth scenario tested (AirPods + no Bluetooth)
- [ ] Permissions OFF → app fails gracefully (no fake "Listening…")

---

*Last updated: 2026-01-06*
