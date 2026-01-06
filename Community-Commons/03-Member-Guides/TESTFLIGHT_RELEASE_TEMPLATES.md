# TestFlight Release Templates

Reusable templates for every TestFlight push.

---

## App Store Connect — "What to Test"

Paste this into App Store Connect → TestFlight → Build → What to Test:

```
**Focus:** Voice + UI reliability (Talk mode), Help, and text visibility

1. **Update build**
   - TestFlight → MAIA → pull down to refresh → **Update**

2. **Voice capture sanity**
   - In **Talk** mode, tap mic and speak a short sentence.
   - Confirm MAIA **transcribes** and responds.

3. **Post-response mic behavior**
   - After MAIA speaks, confirm mic/voice flow **does not crash** and can capture the next utterance.

4. **Voice Help UI**
   - Confirm **? help button** is visible in the mode row.
   - Tap **?** → Voice Help sheet opens and is readable.

5. **Text visibility toggle**
   - Confirm **Show Text / Hide Text** toggle is accessible (not hidden behind top UI).
   - Toggle on/off and confirm behavior matches label.

**If anything fails, report**
- iPhone model + iOS version
- MAIA build number (TestFlight)
- What happened (Listening but no text / crash after MAIA speaks / etc.)
- Screenshot or screen recording if possible
```

---

## Internal Team — QA Checklist

Paste this in release notes or team channel:

### Smoke Test (2–3 minutes)

- [ ] TestFlight update succeeds (pull-to-refresh works)
- [ ] Talk mode transcribes 1st utterance
- [ ] MAIA responds with audio
- [ ] Talk mode transcribes 2nd utterance (after MAIA speaks)
- [ ] No crash when returning to mic after TTS
- [ ] ? button visible (mobile + desktop layout if applicable)
- [ ] VoiceHelpSheet opens/closes cleanly
- [ ] Show/Hide Text toggle visible + tappable
- [ ] Toggle actually hides/shows transcript text

### Permissions & Routing Edge Cases (quick)

- [ ] Speech Recognition permission OFF → app fails gracefully (no fake "Listening…")
- [ ] Microphone permission OFF → app fails gracefully
- [ ] Bluetooth ON (AirPods/car) → can still capture, or guidance is clear

### Report Template

```
- Device / iOS:
- Build #:
- Steps to reproduce:
- Expected vs actual:
- Logs (if available):
- Screenshot/video:
```

---

## Tester Message (paste to testers)

```
Open **TestFlight → MAIA**
Pull down to **refresh**
Tap **Update**
If you don't see an update: quit TestFlight, reopen, refresh again

**If the build still doesn't appear**
- The build is still **Processing**, or
- It's not assigned to your **Test Group**, or
- It's blocked by **Missing Compliance** (encryption questions)

**After updating, please verify**
- You see a **?** button in the Talk/Care/Note/Start row (near Start/End)
- Tapping **?** opens **Voice Help**
- The **Show Text / Hide Text** toggle is visible (not hidden behind the top row)

**If anything fails, send**
- iPhone model + iOS version
- MAIA build number (TestFlight)
- screenshot/screen recording
```

---

## Release Summary Templates

One-paragraph summaries for App Store Connect. Pick the flavor that fits.

### Option A — Ultra short (best default)

```
**Release Summary:** This build improves **{WHAT IMPROVED}**, fixes **{WHAT WAS BROKEN}**, and adds **{WHAT'S NEW}**. Please specifically test: **{TOP 3 TESTS}**. If anything fails, send **device + iOS + build # + screenshot/screen recording**.
```

### Option B — Voice-focused (great for MAIA)

```
**Release Summary:** This build improves **voice reliability**, specifically **{e.g., mic restart after MAIA speaks / transcription consistency / permission handling}**, and updates UI for **{e.g., ? Help button / Show Text toggle position}**. Please test: **(1) Talk mode transcribes**, **(2) MAIA speaks then mic works again**, **(3) ? opens Voice Help**, **(4) Show/Hide Text toggle works**. Report issues with **device + iOS + build # + steps + video**.
```

### Option C — Member-friendly tone

```
**Release Summary:** This build is meant to make MAIA feel smoother and more dependable. It updates **{FEATURE/FIX}** and adds **{FEATURE}** so troubleshooting is easier. Please try a quick **Talk → MAIA speaks → Talk again** loop, then check the **? Voice Help** and **Show/Hide Text** toggle. If anything feels off, share **your iPhone model, iOS version, build number, and a screenshot/video**.
```

### Example (filled in)

```
**Release Summary:** This build improves voice reliability by reducing mic restart failures after MAIA speaks, and adds an in-app **? Voice Help** sheet plus a safer position for the **Show Text** toggle. Please test: (1) Talk transcribes, (2) MAIA speaks then Talk works again, (3) ? opens help, (4) Show/Hide Text works. Report issues with device + iOS + build # + steps + video.
```

---

*Last updated: 2026-01-06*
