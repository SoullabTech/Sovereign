# Mobile Device Test Harness — Device Gates for PR #703 and PR #707

**Who this is for:** Kelly (or anyone) — no engineering background needed.
**What this is:** A checklist for running two device acceptance gates in a single
real-iPhone session, using Safari's Remote Web Inspector. No code changes to the
running app, no simulated or faked conditions, no new telemetry.

Two PRs are open, and each needs a **real device observation** before merge.
Project principle, already ruled on: *measure, don't assert; force the state
rather than reason about it.* The structural and unit tests in each PR are not
sufficient proof by themselves — this harness is how the missing device evidence
gets collected.

- **Gate A — PR #703** (`fix/conversation-geometry-invariant`): the conversation
  composer sat below the visible viewport because of a CSS containing-block bug
  (an animated `filter` on the shell element). The fix removes that filter. The
  gate measures the geometry of the live page with a plain JS snippet.
- **Gate B — PR #707** (`fix/voice-service-not-allowed-fallback`): on some
  Safari builds, iOS speech recognition is refused at start
  (`service-not-allowed`), and the app used to show "LISTENING" forever even
  though recognition had already failed silently. The fix makes the app notice
  and fall back to text. The gate watches the real failure happen and checks
  six required observations.

Plan on one sitting: set up the Web Inspector connection once, then run Gate A,
then attempt Gate B, then fill in the results table at the bottom of this file.

---

## 1. Setup — seeing the iPhone's console from a Mac

"Remote Web Inspector" lets Safari on a Mac show the live internals of a web
page that is open on the iPhone — including its **console**, a scrolling panel
of messages the page prints, with a prompt at the bottom where you can type and
run small pieces of JavaScript against the live page. Both gates use it: Gate A
runs one pasted snippet there, Gate B watches the messages that appear there.

You need: the real iPhone, a Mac with Safari, and a USB cable that connects
them.

### On the iPhone (one-time)

1. Open **Settings**.
2. Go to **Safari** (on iOS 18: **Settings → Apps → Safari**).
3. Scroll to the bottom and tap **Advanced**.
4. Turn on **Web Inspector**.

### On the Mac (one-time)

5. Open **Safari** on the Mac.
6. Look at the menu bar at the top of the screen. If you see a **Develop** menu,
   skip to step 8.
7. If there is no **Develop** menu: go to **Safari → Settings…** (or
   **Preferences…** on older macOS) → **Advanced**, and turn on **Show Develop
   menu in menu bar** (on newer Safari versions this reads **Show features for
   web developers**). A **Develop** menu appears in the menu bar.

### Connecting (every session)

8. Unlock the iPhone and connect it to the Mac with the USB cable. If the iPhone
   asks whether to **Trust This Computer**, tap **Trust** and enter the phone's
   passcode.
9. On the iPhone, open **Safari** and navigate to the page you want to inspect
   (for these gates: `https://soullab.life/maia`).
10. On the Mac, in Safari, click the **Develop** menu → hover over the iPhone's
    name → click the name of the open tab.
11. A Web Inspector window opens on the Mac. Click the **Console** tab in it.

You are now looking at the iPhone page's live console. Messages the page prints
appear here as they happen, and the prompt at the bottom runs JavaScript on the
iPhone's page — not on the Mac. Keep this window open for both gates.

---

## 2. Gate A — PR #703: conversation geometry

**What you are proving:** on the real device, the composer (the text box you
type in) sits fully inside the visible viewport, and the transcript does not
overlap it — and this stays true no matter what size the phone's screen is.

1. On the iPhone, in Safari, go to `https://soullab.life/maia` and let the page
   fully load (you should see the conversation and the composer).
2. In the Mac's Web Inspector window, open the **Console** tab.
3. Copy this entire block, paste it at the console prompt, and press **Return**:

```js
(function () {
  const bx = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
  };
  const conv = [...document.querySelectorAll('div')].find((d) =>
    /fixed top-44/.test(d.className || '')
  );
  const ta = document.querySelector('textarea');
  let comp = null,
    p = ta;
  while (p && p !== document.body) {
    if (getComputedStyle(p).position === 'fixed') {
      comp = p;
      break;
    }
    p = p.parentElement;
  }
  const C = bx(comp),
    V = bx(conv);
  const oc = document.querySelector('.oracle-conversation');
  const result = {
    viewportHeight: innerHeight,
    shellFilter: oc ? getComputedStyle(oc).filter : 'not found',
    conversationArea: V,
    composer: C,
    gapBelowComposer: C ? innerHeight - C.bottom : null, // must be >= 0
    transcriptOverlap: C && V ? V.bottom - C.top : null, // must be <= 0
  };
  console.log('[GATE A — #703 geometry]', result);
  return result;
})();
```

4. The console prints a line starting with `[GATE A — #703 geometry]` followed
   by an object. Expand it if needed and find two numbers:
   - **`gapBelowComposer`** — pixels of empty space between the bottom of the
     composer and the bottom of the screen.
   - **`transcriptOverlap`** — how many pixels the transcript area reaches past
     the top of the composer (negative means there is separation, which is good).

   If the values show as `null`, the page had not finished loading — wait a few
   seconds and run the snippet again.

### Reading the result

- **PASS:** `gapBelowComposer` is **0 or greater**, **and** `transcriptOverlap`
  is **0 or less**. For reference, a healthy measurement after the fix is
  **gap 44, overlap −79**.
- **FAIL:** `gapBelowComposer` is negative, **or** `transcriptOverlap` is
  positive. The known-bad baseline from before the fix is **gap −4, overlap 57**
  — numbers like those mean the bug is present.
- **The property that matters most:** gap and overlap should come out as the
  **same numbers** regardless of the phone's screen size or orientation. If the
  numbers change when the device height changes, something is still wrong —
  record that as a FAIL even if both values happen to be in range on this
  phone.

Optional, not part of the formal pass condition: rotate the phone once to
landscape (or back), run the snippet again, and eyeball whether the numbers
still make sense.

Record the printed `viewportHeight` value in the results table's viewport-size
column, along with the device model.

---

## 3. Gate B — PR #707: voice `service-not-allowed` fallback

**What you are proving:** when Safari refuses to start speech recognition with
the `service-not-allowed` error, the app notices immediately and recovers to
text — instead of showing "LISTENING" forever.

**Read this first — the gate can only run on a Safari build that actually
fails.** The only known way to force the `service-not-allowed` error today is
**Safari 26.5.2 on iOS 18.7** (confirmed failing in production telemetry).
**Safari 26.6 and Chrome on iOS are both confirmed NOT to trigger it.** There
is no way to simulate or fake this error, and no workaround will be offered
here — a faked failure would defeat the purpose of a device gate. If the device
under test is not on a failing Safari build, Gate B **cannot be completed this
session**; record it as **NOT EXERCISED** (neither a pass nor a fail) and move
on.

While attempting this gate, do **not** use the Web Inspector's network
throttling or any other simulated-condition feature. This must be the real,
unmodified device behavior.

### Steps

1. On the iPhone, in Safari, go to `https://soullab.life/maia` and let the page
   fully load.
2. In the Mac's Web Inspector window, open the **Console** tab and keep it
   visible.
3. On the iPhone, tap the **voice / flower button** to start voice input.
4. Watch what happens, on the phone screen and in the console, over the next
   several seconds.

### If voice starts normally

The error did not trigger on this build — which is expected on anything other
than a failing Safari version. Note the Safari version shown in the iPhone's
Settings (**Settings → Safari**, or **Settings → Apps → Safari** on iOS 18),
and record Gate B as **NOT EXERCISED** in the results table. This is not a pass
and not a fail; the gate simply could not be exercised on this device in this
session.

### If voice fails to start

Good — the failure state is happening for real. Now check each of the six
required observations below as **observed** or **not observed**:

1. **Error telemetry fires.** A console line appears starting with
   `[voice-diag] voice_transcribe_error` followed by `{...}`. (This is emitted
   by `lib/voice/voiceDiagnostics.ts`'s `logVoiceEvent`, which already logs to
   the console on every voice event, unconditionally — nothing needs to be
   enabled for this.)
2. **The on-screen "LISTENING" state disappears immediately** — not after a
   delay, not eventually.
3. **The text composer becomes available** so the member can type instead.
4. **The member sees exactly this recovery message, word for word:**
   "Voice couldn't start in this browser. Try opening MAIA in Chrome, or updating Safari."
5. **No message claims the microphone was denied.** That would be the WRONG
   message — it belongs to a different, unrelated failure code.
6. **All five things above happen even though the browser never fires the
   normal "recognition ended" cleanup event.** This is the actual defect being
   fixed, so it is the most important thing to watch for: the app must recover
   on its own, without the browser's usual cleanup signal.

**PASS:** all six observations are checked **observed**.
**FAIL:** any one of the six is **not observed** — note which one in the table.

---

## 4. Results

Fill in one row per gate during the device session. This table is a template —
leave it empty in the file; it is completed by a human on the device, not in
advance.

| Gate | Date | Device model | iOS version | Safari or Chrome version | Viewport size | Result (PASS / FAIL / NOT EXERCISED) | Notes |
| ---- | ---- | ------------ | ----------- | ------------------------ | ------------- | ------------------------------------ | ----- |
| Gate A — PR #703 | | | | | | | |
| Gate B — PR #707 | | | | | | | |

---

## 5. Closing caveat

This harness only observes. It does not decide whether a PR is ready to merge — that judgment, and the actual merge, remain with Kelly and the reviewing human. A synthetic or devtools-simulated failure is not a substitute for the real device state; if this harness ever grows a way to fake Gate B's error condition, that is a regression in what the gate proves, not an improvement in convenience.
