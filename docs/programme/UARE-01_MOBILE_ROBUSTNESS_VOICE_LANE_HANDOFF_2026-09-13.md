# MOBILE ROBUSTNESS — INSTRUMENT DEFECTS — CROSS-LANE FINDING

**From:** `UARE-01` (U1 coverage survey) · **Date:** 2026-09-13
**Authorized by:** founder ruling 2026-09-13 — *hand the two instrument defects over now; further
survey cannot make these less true.*
**File:** `lib/voice/__tests__/mobile.robustness.test.ts` · **Status on `7f52f587`: PASSING.**
**Standing:** ⛔ **FINDINGS ONLY. NO TEST CHANGED. NO ORACLE CHOSEN. NO VOICE BEHAVIOR DEFINED.**

---

## 0 · What is and is not claimed

> **SUPPORTED.** Three named tests pass without establishing the behavior their names claim.

> ⛔ **NOT SUPPORTED, and nowhere claimed.** That the underlying behaviors are absent, broken, or
> inverted. **Nothing here is a statement about the runtime** — only about what these instruments can
> and cannot discriminate.

⚠️ **The file is not condemned; named tests are.** Two of its describe blocks — *Battery Management*
and *Wake Word False Positives* — assert on real returned values (`config.vadSensitivity`,
`config.alwaysOn`, `config.maxSessionMinutes`, `result.valid`) and **do** discriminate. The defects
are confined to *Interruption Handling* and *Background Mode Compliance*.

## 1 · Finding A — `should pause on incoming call`: assertion cannot discriminate the claim

Constructs a real `MicSession`, starts it, asserts it is listening, simulates the interruption
(`visibilitychange` → `visibilityState: 'hidden'`), then:

```js
// In real implementation, would pause/resume
expect(session).toBeDefined();
```

⚠️ **Precision (founder correction, 2026-09-13).** The earlier wording *"a test that cannot fail"* was
too broad — this test can still fail if setup or event handling throws. **What cannot fail as a
function of the claimed pause behavior is its decisive assertion.** The exact finding:

> **The assertion cannot discriminate the named behavior.**

That distinction separates *a useless behavioral oracle* from *an unexecutable test*. This is the
former. The file states the gap itself, in the comment.

## 2 · Finding B — `should handle Bluetooth handoff`: no-op compatible

```text
claimed        Bluetooth handoff is handled
asserted       isListening() remains true after `devicechange`
counterexample the devicechange handler does nothing at all
               → isListening() remains true → test passes
```

It executes real code, and **a no-op satisfies the supposed behavioral proof.** The assertion can
fail only if the event *stops* listening — the opposite of the claim.

## 3 · Finding C — `should configure iOS audio background mode`: asserts over its own literal

⚠️ **Discovered after the ruling that authorized Findings A and B**, and handed over with them
because it is the same class and the same lane. ⛔ Strike it if it should travel separately.

```js
const requiredCapabilities = ['audio', 'fetch'];
// In real app, these would be in Info.plist
expect(requiredCapabilities).toContain('audio');
```

The array is defined three lines above the assertion. **The test touches no application code, reads
no `Info.plist`, and would pass in an empty repository.** It is independent of the system entirely —
a stricter case than A, where at least `MicSession` is exercised.

## 4 · The criterion these were found by

Founder, 2026-09-13 — generalizing A1's mutation probes without requiring mutation testing everywhere:

> **A test cannot discharge a behavioral row merely because it executes real modules.** For a claim of
> the form *"the system handles X"*: **would the test fail if the relevant handling were replaced with
> a no-op, or the claimed boundary inverted?**

Behavioral tests then fall into three conditions — **no-op compatible** · **wrong grain** (decides a
narrower property than the row claims) · **decisive** (can support the row). ⛔ These are conditions,
not a new taxonomy.

**A working example already exists in this repository**, which is why no oracle is proposed here:
`lib/voice/__tests__/webSpeechLifecycle.test.ts` carries a test named *"control: the OLD reuse pattern
zombies within a few turns (documents the bug)"* — the inversion performed rather than described, the
same discipline as `voice-non-degradation`'s ⛔ cases.

## 5 · What the voice lane owns

⛔ Listed as the option space, not as a recommendation. **UARE-01 does not follow these across.**

- Whether each test should gain a deciding oracle, be marked pending, or be removed.
- What the deciding oracle would be — and whether jsdom can host it at all, or whether these belong
  in an iOS/Capacitor integration layer instead.
- Whether the named behaviors exist in the runtime. **This survey did not look.**
- Urgency, and whether the passing status of these tests has ever been cited as coverage.

**Companion finding, same survey:** `docs/programme/UARE-01_A4_VOICE_LANE_HANDOFF_2026-09-13.md`.
**Full survey:** `docs/programme/UARE-01_U1_COVERAGE_SURVEY_2026-09-13.md`.
