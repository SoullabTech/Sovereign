# TestFlight Help In-App Manual

## Purpose

The TestFlight Help sheet is a **1-minute ritual checklist** to quickly answer:

1. "Did the build update?"
2. "Is voice stable through the Talk → MAIA speaks → Talk again loop?"
3. "If not, what's the fastest fix?"
4. "If still broken, how do I report it in a way the team can reproduce?"

## Where to find it

In MAIA, tap the **TF** button (next to the **?** Voice Help button) to open the TestFlight Quick Test sheet.

## The 60-second TestFlight ritual

### Step 1 — Update (30 seconds)

* TestFlight → MAIA → pull to refresh → **Update**
* If no update appears:
  * close TestFlight completely
  * reopen and pull down again

### Step 2 — Voice Loop (main test)

Do this exactly:

1. Tap **Talk** → say: "Testing one two three"
2. Let MAIA respond (MAIA speaks)
3. Tap **Talk again** → say: "Second test after MAIA spoke"

**Pass =** both attempts transcribe + MAIA responds.
**Fail =** "Listening..." with no capture, no transcript, or the *second* Talk breaks.

### Step 3 — UI Checks (10 seconds)

* `? Voice Help` opens and text is readable
* `Show Text / Hide Text` toggle is visible and works

## If it fails: the "fast fixes" ladder (in order)

Do **one change at a time**, then rerun the Voice Loop.

### Fix A — Force close

* Force close MAIA (swipe up)
* Reopen MAIA
* Retry Voice Loop

### Fix B — Bluetooth off

Bluetooth routing is the sneakiest source of "it's listening but not hearing."

* Turn Bluetooth OFF
* Retry Voice Loop
  (If it works, note what device was connected: AirPods, car, etc.)

### Fix C — Permissions (only if relevant)

If you recently installed/reinstalled, updated iOS, or see any "not allowed" behavior:

* Settings → Privacy & Security
  * Microphone → MAIA → ON
  * Speech Recognition → MAIA → ON
* Force close MAIA → reopen → retry Voice Loop

## How to report bugs so they're fixable (the non-negotiables)

When reporting, include:

* **Device** (e.g., iPhone 14 Pro)
* **iOS version**
* **MAIA build number** (from TestFlight)
* **What happened** (one sentence)
* **Steps to reproduce** (numbered)
* **Frequency** (Every time / Often / Sometimes / Once)
* **Bluetooth state** (Off / On / AirPods / Car)
* **10–20 sec screen recording** if possible

### Great bug report example

> iPhone 15 Pro, iOS 17.3, build 128.
> Voice Loop fails: first Talk transcribes, MAIA speaks, second Talk shows "Listening..." forever.
> Steps: 1) Open MAIA 2) Tap Talk, say "testing one two three" 3) Let MAIA speak 4) Tap Talk again.
> Frequency: Every time. Bluetooth: AirPods Pro connected. Video attached.

## How the team triages reports (so testers know it's not ignored)

Every issue gets:

* `P0 / P1 / P2` priority (auto from severity)
* cause bucket labels like `voice`, `bluetooth`, `permissions`, `ui`, `crash` (auto + human refinement)
* `needs-repro` if the steps/info aren't enough yet

## What to test after a fix lands (regression checklist)

After any voice fix, always test:

1. Voice Loop on **Bluetooth OFF**
2. Voice Loop on **AirPods**
3. Voice Loop after:
   * locking/unlocking phone
   * backgrounding MAIA and returning
4. `? Voice Help` opens and is readable
5. `Show/Hide Text` toggle still visible and functional

## Maintaining the sheet (keeping it useful)

When updating the help content:

* Keep the main loop **exactly the same** across releases (consistency beats cleverness)
* Add fixes only if they're:
  * fast,
  * safe,
  * and frequently relevant
* Avoid adding advanced troubleshooting that requires developer tools (link out to a Pro/Team doc instead)

---

*Last updated: 2026-01-06*
