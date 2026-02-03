# MAIA TestFlight Issue Auto-Labeling Manual

**Purpose:** Make TestFlight feedback easy to report, easy to reproduce, and easy to triage — with automation that helps without creating label noise.

## What this system does

When a tester submits a bug via the **"MAIA TestFlight Bug Report"** issue form:

1. The issue is created with base labels (e.g. `testflight`, `bug`)
2. A workflow auto-applies **priority** (`P0` / `P1` / `P2`) from the **Severity** dropdown
3. A second workflow auto-applies **cause buckets** (`voice`, `bluetooth`, `permissions`, `ui`, `crash`) using **keyword detection**
4. If repro steps are missing/insufficient, it auto-applies **`needs-repro`**
5. When the issue is edited later (e.g. steps added), the workflow can **remove `needs-repro`** automatically

---

# 1) Labels: what they mean and how to use them

## Priority labels (mutually exclusive)

* **`P0`** — Crash / voice unusable / blocks core use
* **`P1`** — Voice flaky but usable / major friction
* **`P2`** — UI / minor / cosmetic / nice-to-have

**Rule:** Every TestFlight bug should have exactly **one** of `P0/P1/P2`.

## Cause bucket labels (can stack, but keep it tight)

* **`voice`** — transcription, mic start/stop, listening state, speech pipeline
* **`bluetooth`** — AirPods, car audio, input route hijack
* **`permissions`** — mic/speech recognition permissions, Settings paths, denied access
* **`ui`** — layout, hidden buttons, mode row, toggle placement
* **`crash`** — app crash (also typically P0)
* **`needs-repro`** — steps/info missing; cannot reliably reproduce yet

**Rule:** Prefer **1–2 cause buckets max**.
If it's unclear, use **`needs-repro`** instead of guessing 4 labels.

---

# 2) What "good" tester reports look like

A good report makes reproduction boring.

## Minimum required fields (for *usable* triage)

* iPhone model
* iOS version
* MAIA build number (TestFlight)
* Exact steps (numbered)
* Expected vs actual
* Frequency (every time / often / sometimes / once)
* Screen recording (best) or screenshot

### Best practice: include a "tight loop"

For voice issues, always include:

* **Talk → MAIA speaks → Talk again**

This isolates the most common iOS audio-session failure.

---

# 3) The key automation behaviors

## A) Priority auto-labeling

**Source:** Severity dropdown in the issue form.

### "Correct" behavior

* Tester picks "P1 — Voice flaky…" → issue gets `P1` label
* Tester edits issue and changes severity to P0 → label switches to `P0`

### If this fails

Check:

* Is the severity field still using the expected format (e.g., "P1 - …")?
* Did the workflow trigger on `issues: edited`?

---

## B) Cause bucket auto-labeling (keyword based)

The workflow scans the issue body for strong signals.

### Correct behavior

* Mentions "AirPods" → adds `bluetooth`
* Mentions "crash"/"app closes" → adds `crash`
* Mentions "Listening…" / "transcription" → adds `voice`

### Avoiding label noise

Your strict `permissions` rule is the right idea:

* don't add `permissions` unless:
  * it explicitly mentions Settings → Privacy & Security, **or**
  * it explicitly says permission denied/not allowed **and** mentions mic/speech/transcription/dictation

This keeps "permissions" from being slapped on every "voice doesn't work" issue.

---

## C) `needs-repro` auto-add and auto-remove

This is the part that saves the most time.

### When `needs-repro` should be added

* Steps are empty
* Steps are vague ("it doesn't work", "voice broken")
* Missing key environment info (device/iOS/build)

### When it should be removed

When the issue body contains **real reproduction steps**, such as:

* a "Steps to reproduce" section with numbered actions, AND/OR
* a clear loop that allows a teammate to replicate

---

# 4) How to use `needs-repro` well (team + testers)

## For testers: fastest way to help

If you got `needs-repro`, copy/paste this and fill it:

**Steps to reproduce**
1.
2.
3.

**Expected**
…

**Actual**
…

**Frequency**
Every time / Often / Sometimes / Once

If they add that and save, the label should disappear on the next workflow run.

## For team: what to do when `needs-repro` appears

1. Don't guess. Don't "pre-debug."
2. Ask for exactly **one missing thing**, not five.
3. Use the smallest prompt:
   * "Can you add numbered steps and tell us if Bluetooth/AirPods were connected?"

---

# 5) Verifying the workflows are behaving correctly

## The "golden test"

Create a test issue with missing steps:

* confirm it gets `needs-repro`

Then edit the issue and add a real steps block:

* confirm `needs-repro` is removed
* confirm it **does not get re-added** in the same run

## What to paste when something looks wrong

If you ever see "remove needs-repro" *then it re-adds*, paste the **github-script step logs** around:

* detection flags (e.g., `hasRepro`, `hasSteps`)
* `labelsToAdd`
* `labelsToRemove`
* API calls for add/remove

That chunk is enough to pinpoint the exact condition mismatch.

---

# 6) Triage workflow (the "always do this" checklist)

## Step 1 — Confirm priority

Is it truly:

* P0: blocks core use / crash
* P1: major impairment
* P2: minor

If unclear → ask one question → add `needs-repro`.

## Step 2 — Confirm cause bucket

Pick the smallest explanation label:

* voice vs bluetooth vs permissions vs ui vs crash

If multiple: pick the **primary** and add the secondary only if it changes debugging direction.

## Step 3 — Decide next action

* **Reproducible + P0/P1** → assign owner + create fix plan
* **Not reproducible** → leave `needs-repro` + request specific info
* **Known duplicate** → link and close as duplicate (keep the better report open)

## Step 4 — Confirm verification target

Every fix must list:

* "how we'll confirm it's fixed" (the specific loop)

For voice: **Talk → MAIA speaks → Talk again** + Bluetooth off/on.

---

# 7) Saved triage views (bookmark these)

Use GitHub search filters:

```
# Priority queues
is:open label:testflight label:P0
is:open label:testflight label:P1
is:open label:testflight label:P2

# Cause buckets
is:open label:testflight label:voice
is:open label:testflight label:bluetooth
is:open label:testflight label:permissions
is:open label:testflight label:ui
is:open label:testflight label:crash

# Needs attention
is:open label:testflight label:needs-repro
is:open label:testflight no:assignee

# Combo views (most useful)
is:open label:testflight label:P0 label:voice
is:open label:testflight label:P1 label:bluetooth
is:open label:testflight label:permissions -label:voice
```

---

# 8) Customizing the keyword rules safely

Keyword automation should be **conservative**.

## Principles

* Auto-add labels only on **strong signals**
* Always let humans override
* Never add `permissions` on weak wording ("mic doesn't work")
* Never label-slam: avoid adding 5 cause buckets from one paragraph

## Good "strong signals"

* `AirPods`, `Bluetooth`, `car audio` → bluetooth
* `Settings → Privacy & Security` → permissions
* `Speech Recognition permission` / `Microphone permission` → permissions
* `Listening…` + `transcribe` / `dictation` → voice
* `crash`, `force quit`, `app closes` → crash

---

# 9) Common failure modes and what they usually mean

## "Mic doesn't restart after MAIA speaks"

Usually:

* audio session timing conflict
* recognition restart called while `isSpeaking` or `isProcessing` still true
* listener accumulation (multiple listeners firing)

Cause labels:

* `voice` (sometimes `crash` if it hard crashes)

## "It works on speaker but not with AirPods"

Usually:

* audio input route is wrong or stuck
* mic source switched to a device with different permissions/state

Cause labels:

* `bluetooth` + `voice`

## "It says Listening but no text appears"

Could be:

* transcription not starting
* UI text display is hidden
* permissions not granted

Cause labels:

* `voice` (and only `permissions` if Settings/permission denial is explicit)
* `ui` if it's a hidden toggle issue

---

# 10) Team rituals that keep this system clean

* **Weekly**: close duplicates + consolidate root causes
* **After each release**: link all fixed issues to the build
* **If `needs-repro` sits >7 days**: ping once, then close politely

---

# Appendix: "One-line guard" concept (when needs-repro re-adds)

If your system ever removes `needs-repro` and then re-adds it in the same run, the fix is almost always:

> Ensure the script computes "hasRepro" **once**, then uses that same truth value for both add/remove decisions.

The guard looks like:

* "If hasRepro → do not add needs-repro"
* "If !hasRepro → do not remove needs-repro"

(If you paste the workflow step, I'll point to the exact line where the truth splits.)

---

*Last updated: 2026-01-06*
