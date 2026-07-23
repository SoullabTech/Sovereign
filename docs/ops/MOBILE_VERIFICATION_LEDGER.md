# Mobile verification ledger

**Governing sequence (Kelly, 2026-07-23):**
*measured defects first → observed fleet verification → explicit unverified perimeter.*

The ledger exists now, before the fixes land. **No cell may be marked ✅ until the
relevant fix is deployed AND tested on a real device.** Desktop emulation cannot verify
anything involving the software keyboard — measured: `100dvh === 100vh === innerHeight`
in the browser pane, and there is no keyboard to shrink the visual viewport.

Legend: ✅ verified on-device · ⬜ not yet · ⛔ blocked by an open defect · — not applicable

---

## Why this fleet and not a browser matrix

48h of `voiceDiagnostics` telemetry — every event carries a UA:

| environment | events |
|---|---|
| iOS · Chrome 150 | 86 |
| iOS · Chrome 151 | 42 |
| iOS · Safari 26.6 | 14 |
| iOS · Safari 26.5.2 | 10 |

**100% iOS. 84% Chrome-on-iOS.** Verification targets the fleet that exists, not a
hypothetical one. (Caddy access logs over the same window are dominated by bots, dev
traffic and the measurement sessions of 2026-07-23; they are not a fleet picture and are
excluded deliberately.)

---

## Stage 1 — measured defects (must close first, in this order)

| # | defect | acceptance proof | state |
|---|---|---|---|
| [#706](https://github.com/SoullabTech/Sovereign/issues/706) | false `LISTENING` after recognition refused | force `service-not-allowed`; 6-step device test on [#707](https://github.com/SoullabTech/Sovereign/pull/707) | containment PR open, **blocked** |
| [#703](https://github.com/SoullabTech/Sovereign/issues/703) | composer below viewport, overlaps transcript | gap ≥ 0 and overlap ≤ 0 at all three viewports | not started |
| [#704](https://github.com/SoullabTech/Sovereign/issues/704) | Arrival crops holoflower with keyboard | holoflower fully visible, device-only | not started |
| [#705](https://github.com/SoullabTech/Sovereign/issues/705) | concurrent Arrival mount | exactly one holoflower in DOM | investigation first |

#706 is first by ruling: it is the only one where **MAIA asserts something false about
itself**. The others are layout and rendering defects; that one is a member-trust failure.

---

## Stage 2 — observed fleet verification

### A. Interaction states per browser

Rows are the four observed environments. ⛔ marks cells gated by a Stage-1 defect.

| environment | Arrival · kbd closed | Arrival · kbd open | Conversation · kbd closed | Conversation · kbd open | voice path | text send |
|---|---|---|---|---|---|---|
| iOS Safari 26.6 | ⬜ | ⛔ #704 | ⛔ #703 | ⛔ #703 #704 | ⬜ | ⬜ |
| iOS Safari 26.5.2 | ⬜ | ⛔ #704 | ⛔ #703 | ⛔ #703 #704 | ⛔ #706 | ⬜ |
| iOS Chrome 150 | ⬜ | ⛔ #704 | ⛔ #703 | ⛔ #703 #704 | ⬜ | ⬜ |
| iOS Chrome 151 | ⬜ | ⛔ #704 | ⛔ #703 | ⛔ #703 #704 | ⬜ | ⬜ |

### B. Viewport geometry (measurable without a device; device confirms)

Per #703, the failure is device-height-independent — it must be **constant** across all
three, or the fix is wrong for the same reason the bug was.

| viewport | device class | gap ≥ 0 | overlap ≤ 0 |
|---|---|---|---|
| 375×667 | SE | ⬜ (now −4) | ⬜ (now 57) |
| 393×852 | 15 / 16 | ⬜ | ⬜ |
| 430×932 | Pro Max | ⬜ (now −4) | ⬜ (now 57) |

### C. Voice path per browser

| environment | mic granted | recognition starts | transcript returns | failure surfaced honestly |
|---|---|---|---|---|
| iOS Safari 26.6 | ✅ observed | ✅ observed | ✅ observed | — no failure to surface |
| iOS Safari 26.5.2 | ✅ observed | ❌ refused at start | ❌ | ⛔ #706 |
| iOS Chrome 150/151 | ✅ observed | ✅ observed | ✅ observed | — |

The ✅s here are the only ones in this ledger, and they are marked because production
telemetry recorded complete chains — `mic_granted → listening_started → audio_started →
speech_started → transcribe_result → recognition_ended` — not because anyone asserted it.

---

## Stage 3 — the unverified perimeter

Stated explicitly rather than swept. Dormant code is not evidence of support.

```
Verified:
- observed iOS Safari fleet
- observed iOS Chrome fleet

Unverified:
- Android Chrome
- Samsung Internet
- iPad Safari
- desktop mobile modes
```

⚠️ **Android carries code with zero measured usage.** `lib/voice/androidVoiceFallback.ts`
and the bounded-recovery counter were built from a trace dated 2026-05-14. No Android
appears in 48h of telemetry. That code may be correct; nothing currently exercises it, so
nothing verifies it. Do not cite its existence as support.

Whether these platforms justify dedicated device testing is a later decision, made on
actual use or product intent — not on the presence of code.

---

## The claim this ledger is allowed to support

Once Stage 1 closes and Stage 2 fills in:

> MAIA has been verified on the currently observed iOS voice fleet across Safari and
> Chrome, at the tested viewport sizes and interaction states.

Nothing broader. Per `docs/canon/MARKETING_CLAIM_DISCIPLINE.md`, the claim's centre of
gravity must sit on what was measured — and the unverified perimeter above travels with
it wherever it is quoted.
