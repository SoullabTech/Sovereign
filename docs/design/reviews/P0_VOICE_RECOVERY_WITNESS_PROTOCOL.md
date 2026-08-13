# P0 — voice recovery: live witness protocol

> **Gate:** P0 closes only when all 9 cases pass on **both** witnesses. Safari and installed PWA are
> **two witnesses, not one** — a Safari pass says nothing about standalone safe areas, keyboard, or
> audio lifecycle.
> **Scope shipped in this unit:** Text→Speak state repair · tappable/recoverable talk affordance ·
> photosensitivity mechanics · four-cell modality semantics. **Nothing else.**

## What shipped

**The four-state contract.** Reload is no longer part of the interaction model:

```
Tap to Speak  →  Preparing to listen…  →  Listening
                        ↓ (6s, no listening)
                  Tap to try again
```

**Root defect for the record:** the caption sat inside a `pointer-events-none` container, so the one
piece of copy that *named* the recovery action could not receive it. Combined with a stalled
operational transition, that is what made it a trap rather than an ordinary mode-switch bug.

**Architectural restraint:** the button forwards to the existing holoflower handler. No second call
into `startListening` — the repair makes the existing path recoverable rather than proliferating
voice-entry paths.

## Record per case

For every case, on each witness:

```
tap registered → UI switched → mic active → listening active → member speech detected
```

Note the **caption state at each step**. A caption reading `Tap to Speak` while an activation is in
flight is a FAIL even if voice eventually works.

## The 9 cases

| # | Case | Pass condition |
|---|---|---|
| 1 | Speak → Text → Speak | listening restored, no reload |
| 2 | Speak → Text → **send typed message** → Speak | listening restored (this is the case the consent flag broke) |
| 3 | Text → Speak **while keyboard open** | listening restored; no layout trap |
| 4 | Text → dismiss keyboard → Speak | listening restored |
| 5 | Background Safari/PWA while in text → return → Speak | listening restored after resume |
| 6 | **Deny/interfere with mic once** → recover | full chain: `Tap to Speak` → `Preparing to listen…` → `Tap to try again` → **tap retry** → `Listening`. Graceful failure is only half; the walk must prove **recovery from** failure, not merely arrival at the retry button. No reload. |
| 7 | Rapid Text ↔ Speak transitions | no stuck state, no double-arm |
| 8 | Long MAIA response → switch to Speak immediately after | listening restored |
| 9 | **Modality independence** (see below) | axes provably independent |

### Case 9 — the four-cell proof

> MAIA voice **Off** → enter Speak → speak to MAIA → **confirm MAIA responds silently** → return to
> Text → **confirm Voice Off is still Off** → turn it **On** → Speak again → **confirm spoken output
> resumes.**

This proves the axes are independent *behaviourally*, rather than proving each branch in code. It is
the only case that can catch a streaming or fallback path ignoring the preference.

⚠️ **Expected and harmless:** entering Speak calls `enableAudio()` even when MAIA will stay silent.
That unlocks the iOS audio context (a permission step), it is not playback. If iOS shows any
audio-session activity here it is not a failure of case 9 — the test is whether **speech** is emitted.

## Log markers

```
🎤 [mode] Speak tapped — mic armed              # atomic transition succeeded
🎤 [mode] Speak tapped but canStartListening=false   # capability refused (≠ handler never ran)
🎤 [P0] mic activation did not reach listening within 6s — offering retry
```

The warn branch is diagnostic: it distinguishes *handler never ran* from *capability refused*.

## Photosensitivity — the only question to ask

Not "does it look nicer." Ask **only**:

> Is there any abrupt luminance pulse, threshold flicker, or speech-syllable flashing remaining?

If no, the safety unit succeeded. Aesthetic refinement is a later unit. Also confirm
`prefers-reduced-motion` stills the reactivity **without removing** the who-is-speaking signal.

## Observation to make, not tune

The **6-second** failure timeout is a failsafe, and **passing it must not become the definition of
correctness.** Immediate perceptual acknowledgment already comes from `Preparing to listen…`. Witness
whether 6s feels *reassuringly patient*, *strangely long*, or *unnecessary because a real mic failure
is detectable earlier*. **Do not tune it in this unit** — record the impression.

## Still held (do not touch while walking)

composer consolidation · voice-output row relocation · SOULLAB/privacy/navigation recession ·
`thinking` relocation · field/viewport ownership · typography and colour redesign · full aurora
identity treatment · six-state grammar.

## After a clean pass

Close P0, then proceed to the **six-state grammar + single-owner viewport boundary** — where the
crowding witnessed in Witness 001 finally gets addressed coherently.

> **Sequence:** first make it impossible to get trapped; then make it beautiful and spacious.

## Known non-blocker

`npm run typecheck` fails on `app/api/focus/draft-message/route.ts:109` — a file **untouched** in this
working tree (last changed by `5f5b5ac5e`), surfaced because 61 new files entered the ship program.
Errors attributable to `components/OracleConversation.tsx`: **0**. This unit did not repair it
(deliberately — separate bounded unit), but the gate is not green, so that error must be cleared by
its owner before this branch lands.

---

## Amendments after the local dev witness (2026-08-13)

### Case 6 must be RE-witnessed — the footprint edit came after the first proof

`Tap to try again` was verified under a genuine denied-mic in the browser pane, and the
**footprint edit landed after that proof**. The edit was presentation-only (className +
margins, no logic), but presentation-only is not the same as re-established. Treat the
contract as unproven until case 6 runs end-to-end on device, **including the final
`tap retry → Listening` step.**

### The experiential question — ask it with your thumb

Do not stop at "is it technically tappable." Reach for it naturally and ask:

> **Do I know instinctively that I can touch those words?**

**Acceptance rule — narrow on purpose, so the walk cannot drift into aesthetic tweaking:**

**PASS** — all three:
- the words are **legible at a glance**;
- the region **invites touch without hunting**;
- **one natural thumb tap reliably activates it.**

**FAIL** — any one:
- you **hesitate**;
- you find yourself **aiming at the Holoflower instead**;
- the copy still **reads like passive caption text**.

**If it fails:** change **contrast / wording / affordance cues ONLY.** Keep the 44px hit
target and the current reclaimed footprint. The geometry is settled (44px measured); the
open variable is legibility of intent, and nothing else is licensed by a failed thumb test.

⛔ Judge this **by instinct, not pixel math.** Accessibility math permitting a larger or
brighter control is not a reason to make one.

### The two required captures

**Voice-ready** — Holoflower visible · `Tap to Speak` or `Listening` clearly legible ·
enough surrounding screen to judge geometry and vertical cost.

**Text + keyboard** — keyboard open · composer visible · the `Speak` / `MAIA voice`
controls visible · enough transcript to show how much usable conversational territory
remains. This second capture also becomes baseline evidence for the viewport unit.

### Measured before the walk (local dev, 374×974)

| | Trunk `52a3b924b` | Patched |
|---|---|---|
| Recovery affordance element | `SPAN` | `BUTTON` |
| Height | 15px | **44px** (hit) / ~24px (layout) |
| `pointer-events` | **`none`** | **`auto`** |
| Glow centre | 187,120 | 180,123 |
| Document scrolls | **yes** | yes |

Pre-existing and explicitly NOT in this unit: the dual-centre Holoflower geometry
(80px image at a different centre from every other layer) and the vertical scrollbar —
both reproduce on unpatched trunk.

## The two decisive contracts

Everything else in the walk is diagnostic. These two are the gate.

### Case 6 — recovery, not merely truthful failure

```
Tap to Speak → Preparing to listen… → Tap to try again → retry → Listening
```

> **If the first failure state is truthful but the retry still strands you, P0 is NOT closed.**

Arriving at `Tap to try again` proves the interface stopped lying. It does not prove the
member can get out. Only the final `retry → Listening` does.

### Case 9 — the architectural contract

> **Does switching input modality leave MAIA's output preference unchanged, in BOTH
> directions?**

Both directions matter: text→speak *and* speak→text. This protects the architecture well
beyond the present bug — it is the behavioural form of the standing invariant that changing
how the member communicates must never silently change how MAIA responds.

## Scope discipline for this walk

⛔ **Do not fix the residual 7px horizontal offset.** It is trace #4 evidence, not P0 debt.
The moment it gets repaired here, this bounded unit dissolves into the viewport-owner
problem — which is precisely the merge this sequence exists to prevent.

## Inducing case 6 honestly

Safari may already hold microphone permission for the LAN build, making a natural failure
hard to produce.

> ⛔ **Do not manufacture a different failure just to make the protocol pass.**

Instead: revoke microphone permission for that site in iOS/Safari settings → run the denied
path → restore permission → verify **retry reaches `Listening`**. Both halves must be real:
**the failure genuine, and the recovery genuine.** A simulated failure proves nothing about
the state machine, and a recovery that only works because the failure was fake proves less.

## Optional but unusually valuable capture

Beyond the two required gate captures, grab one during **`Preparing to listen…`** or
**`Tap to try again`** if convenient. The entire P0 exists to repair *what happens between
idle and listening* — so an image of the transitional state is the most direct evidence this
unit could possibly have, and there is currently none on device.

## P0 closure checklist

P0 closes only when **all** of these hold:

- [ ] all normal Text ↔ Speak journeys operate **without reload**
- [ ] caption states **tell the truth** during activation (never idle-looking mid-activation)
- [ ] **real** failure is recoverable **through retry** → `Listening`
- [ ] the 44px affordance **passes the thumb test** (all three pass conditions)
- [ ] **Voice Off survives entering/leaving Speak**, and Voice On does likewise
- [ ] **no abrupt flashing/flicker** returns
- [ ] **Safari and installed PWA witnessed independently** — two witnesses, not one
