# MAIA TestFlight Triage Runbook (Team)

This runbook defines how we process TestFlight feedback consistently.

---

## 0) System overview
Testers submit issues via GitHub Issue Form:
- Auto-applies: `testflight`, `bug`
- Auto-priority: `P0` / `P1` / `P2` (from Severity dropdown)
- Auto-cause buckets (optional): `voice`, `ui`, `permissions`, `bluetooth`, `crash`, `needs-repro`

Team then verifies labels, reproduces, assigns owners, and closes the loop.

---

## 1) Labels (definitions)
### Priority (mutually exclusive)
- **P0** — Crash or voice unusable
- **P1** — Voice flaky but usable
- **P2** — UI / minor UX

### Cause buckets (can combine, but keep it tight)
- **voice** — STT, mic start/stop, restart after MAIA speaks, no transcript
- **permissions** — missing/denied Mic or Speech Recognition permissions
- **bluetooth** — AirPods / car audio routing problems
- **ui** — buttons hidden, toggle placement, layout overlap
- **crash** — app crash / force close
- **needs-repro** — unclear steps; can't reproduce yet

Rule of thumb:
- Aim for **1–2 cause labels** max (unless truly necessary).
- Keep `needs-repro` until a reproducible path is documented.

---

## 2) Triage workflow (the standard pass)
### Step A — Intake
1) Confirm priority label is correct (P0/P1/P2)
2) Add/adjust cause label(s)
3) If steps are weak, keep `needs-repro` and ask tester for:
   - exact steps
   - screen recording
   - frequency
   - Bluetooth on/off
   - permissions status

### Step B — Reproduce
Try in this order:
1) iPhone with Bluetooth OFF
2) Run core loop 3x: Talk → MAIA speaks → Talk again
3) Toggle Show/Hide Text
4) Background/foreground and retry

### Step C — Assign + track
- Assign an owner
- Add a short "Repro confirmed" note (or "Cannot repro yet")
- Link the relevant code area if known

---

## 3) Where to look in code (quick map)
Common hotspots:
- Talk mode UI + Voice Help button: `app/maia/page.tsx`
- Voice help sheet: `components/help/VoiceHelpSheet.tsx`
- Help content: `lib/help/voiceHelpContent.ts`
- Speech start/stop + state flags: `components/voice/ContinuousConversation.tsx` (or equivalent)

Typical failure patterns:
- **Mic fails after MAIA speaks** → audio session timing/state gating
- **"Listening…" but nothing transcribes** → permission gating + "don't show listening unless start succeeds"
- **Works only when Bluetooth off** → input route mismatch

---

## 4) Automation behavior (so the team trusts it)
### Priority auto-labeling
Workflow: `.github/workflows/auto-label-priority.yml`
- Reads the issue's Severity field (P0/P1/P2)
- Ensures **only one** of P0/P1/P2 is applied

### Cause auto-labeling (keyword-based)
Workflow: `.github/workflows/auto-label-cause-buckets.yml`
- Adds likely cause labels based on keywords
- Team can remove incorrect labels during triage

Recommended team habit:
- Treat auto cause labels as **suggestions**, not truth.

---

## 5) Saved triage views (bookmark these)
```text
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:P0+label:testflight
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:P1+label:testflight
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:P2+label:testflight
https://github.com/SoullabTech/Sovereign/issues?q=is:open+label:testflight
```

---

## 6) Release loop (every TestFlight push)

1. App Store Connect → paste "What to Test" (from templates doc)
2. Assign build to Internal + External groups
3. Send testers the core loop to run (Talk → MAIA speaks → Talk again)
4. Triage daily:
   - clear P0 first
   - batch similar P1s
   - ship P2s when convenient

---

## 7) Definition of done (for a fix)

A fix is "done" when:

* Core loop succeeds 3/3 on:
  * iPhone with Bluetooth OFF
  * iPhone with AirPods (Bluetooth ON)
* ? Voice Help opens reliably
* Show/Hide Text toggle is visible and works
* Background/foreground does not break Talk mode

*Last updated: 2026-01-06*
