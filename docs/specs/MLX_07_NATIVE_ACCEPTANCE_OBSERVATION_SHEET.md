# MLX-06 Unit 7 — Native Acceptance Observation Sheet

**Candidate SHA:** `ec4d399` (branch `claude/maia-onboarding-orientation-djtoii`)
**Reconciled onto canonical:** `ed48767` · merge-base `950ea33`
**App:** `life.soullab.maia` · `MARKETING_VERSION 1.2.0` · bump `CURRENT_PROJECT_VERSION` 2511 → **2512**

> This is an **acceptance candidate**, not a deploy. Building it on the Mac Studio
> installs to a phone. It does not touch minisforum, and nothing here authorises
> `deploy-production.sh`.

---

## Before you start

Fill these in first. If any is wrong, stop — you are testing the wrong binary.

| | Value | Confirmed |
| --- | --- | --- |
| Installed build number | `2512` expected | ☐ |
| Device (model / iOS version) | | ☐ |
| Test member (new) | | ☐ |
| Test member (returning, has ≥1 conversation + ≥1 kept atom) | | ☐ |
| Date / tester | | ☐ |

**Mark every row.** `PASS` · `FAIL` · `BLOCKED` · `NOT OBSERVED`.
"Couldn't test" is never PASS.

---

## Read this before judging absence

Four rooms are **deliberately withheld on native**. They are `nativeReady: false`
— not in the Capacitor bundle, not in the runtime allowlist — so the House hides
them rather than showing a door that leads nowhere. **Their absence is the
correct behaviour. Seeing them would be the defect.**

| Destination | Web | **Native (this walk)** |
| --- | --- | --- |
| MAIA | native | **native** |
| Journal | native | **native** |
| Astrology | native | **native — must NOT open Safari** |
| Settings | native | **native** |
| Living Field | native | **HIDDEN** |
| Anchor | native | **HIDDEN** |
| Ideas | native | **HIDDEN** |
| Keeps | native | **HIDDEN** |
| **Kept row** (House continuity) | shown | **ABSENT — follows Keeps** |
| Relational Field | web | **web bridge → `/open-web`** |
| Pro Studio · Writer's Studio · Wisdom · Co-lab | web | **web bridge** |
| Changes | sheet | **sheet, opens in place** |

---

## Founder expectation matrix

| Device check | Expected | Result | Note |
| --- | --- | --- | --- |
| New signup | New Arrival, **not** legacy lenses/birth flow | | |
| Arrival → MAIA | Arrival-shaped first contact visible | | |
| Refresh | Arrival does not regenerate | | |
| House | Continue present where data exists | | |
| Kept | **Absent on native** | | |
| Keeps room | **Absent on native** | | |
| Living Field | **Absent on native** | | |
| Anchor | **Absent on native** | | |
| Ideas | **Absent on native** | | |
| Journal | Available | | |
| Astrology | Native, no Safari | | |
| Relational Field | Web-policy handoff | | |
| Return to MAIA/House | Works without browser Back | | |
| Voice | Starts/listens normally | | |
| Text | Works normally | | |
| Voice ↔ text | No stuck-state regression | | |
| Safe areas | No notch/home-indicator collision | | |

---

## Walk A — new member

| # | Step | Expected | Result | Note |
| --- | --- | --- | --- | --- |
| A1 | Launch from a cold install | App opens; no white screen | | |
| A2 | Real auth surface | Sign-up reachable | | |
| A3 | Complete signup | Lands in-app, not Safari | | |
| A4 | First screen after signup | **"What is asking for your attention?"** — six doorways + "I don't know where to begin". **NOT** lenses, birth data, or elemental orientation | | |
| A5 | Type into the attention field | Keyboard opens; field visible above it | | |
| A6 | Choose one doorway | Moves to MAIA | | |
| A7 | MAIA's first message | Visibly shaped by A5/A6 — echoes what was brought, or asks the doorway's own question. Not a generic greeting | | |
| A8 | Count MAIA's opening messages | Exactly **one** | | |
| A9 | Open the House | Sheet opens from the top-left doorway | | |
| A10 | House groups | "Your Center", "My Life", "My Contribution", "Rooms" | | |
| A11 | My Life contents | Relational Field, Journal **only** (Living Field + Anchor hidden) | | |
| A12 | My Contribution contents | Changes **only** (Ideas + Keeps hidden) | | |
| A13 | Enter Journal | Opens in-app | | |
| A14 | Return from Journal | `← MAIA` works; **no browser Back needed** | | |
| A15 | Force-quit and reopen | Goes to MAIA. **Arrival does not replay** | | |

## Walk B — returning member

| # | Step | Expected | Result | Note |
| --- | --- | --- | --- | --- |
| B1 | Sign in | Succeeds in-app | | |
| B2 | After sign-in | Arrival **bypassed** | | |
| B3 | MAIA loads | Conversation surface, House doorway top-left | | |
| B4 | Open House | Sheet opens | | |
| B5 | Continue row | Present; reads "Your last conversation · <when> · N exchanges" | | |
| B6 | Tap Continue | Sheet closes, MAIA resumes. No new blank session | | |
| B7 | Kept row | **ABSENT** (Keeps is hidden on native) | | |
| B8 | Keeps in My Contribution | **ABSENT** | | |
| B9 | Open Astrology | **Native, in-app. Safari must NOT open** | | |
| B10 | Astrology content | The Astrology room — **not** the Journey threshold | | |
| B11 | Return from Astrology | Back to MAIA/House without browser Back | | |

> **B7/B8 are the Unit 7A repair under test.** Before it, the Kept row would have
> offered a room the native build does not ship. If Kept appears here, that is a
> **FAIL** and the repair regressed.

## Walk C — navigation edge cases

For each: does it dispatch as expected · is there a way back · is anything under
the notch or home indicator · is browser Back ever required · is there duplicate nav?

| Route | Expected on native | Result | Note |
| --- | --- | --- | --- |
| `/astrology` | In-app, no Safari, no left rail, full width | | |
| Journal | In-app, `← MAIA` present | | |
| Settings | In-app | | |
| Relational Field | **Web bridge** — leaves to the web deliberately | | |
| Keeps / Living Field / Anchor / Ideas | **No door in the House at all** | | |
| Changes | Sheet opens in place, no navigation | | |

## Voice / text

| # | Check | Expected | Result | Note |
| --- | --- | --- | --- | --- |
| V1 | Type and send | Reply arrives | | |
| V2 | Start voice | Mic permission, then listening | | |
| V3 | Speak one turn | Transcribed and answered | | |
| V4 | **Speak a second turn** | Turn 2 reachable — no stuck mic | | |
| V5 | Voice → text | Composer takes over cleanly | | |
| V6 | Text → voice | Mic re-arms | | |
| V7 | Interrupt mid-reply | Recovers, no dead state | | |

> V4 specifically exercises canonical's P0 restart-authority fix (`c2ffe29`),
> which this candidate is the first native build to carry.

## Geometry / safe areas

| # | Check | Expected | Result | Note |
| --- | --- | --- | --- | --- |
| G1 | House doorway | Fully below the status bar / Dynamic Island; tappable first try | | |
| G2 | Global MAIA button | Reachable above the home indicator | | |
| G3 | Composer with keyboard open | Not covered | | |
| G4 | Keyboard dismissal | Layout settles, nothing stranded off-screen | | |
| G5 | `← MAIA` in each room | Fully visible, not clipped | | |
| G6 | Horizontal scroll | **None anywhere** | | |
| G7 | Touch targets | Nothing important under ~44pt | | |

**Known, already recorded — do not let it block acceptance:** the global floating
"Open your conversation with MAIA" control measures **82×38** (under the 44pt
floor). Record if it causes trouble; otherwise it stays parked.

---

## Verdict

- [ ] **NATIVE SPINE ACCEPTED** — every row PASS, or only the parked 38px item outstanding
- [ ] **NOT ACCEPTED** — list P0/P1 below

**P0/P1 defects:**

| # | Where | What happened | Expected | Repro |
| --- | --- | --- | --- | --- |
| | | | | |

---

## Evidence class of this sheet

Everything above is **expectation** derived from source and automated tests on
`ec4d399`, plus browser-runtime proof at 390px and 1440px. **Nothing in it is
physical-device evidence until this sheet is filled in.** That is the entire
purpose of the walk.
