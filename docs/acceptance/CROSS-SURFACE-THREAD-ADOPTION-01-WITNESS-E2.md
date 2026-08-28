# CROSS-SURFACE-THREAD-ADOPTION-01 — Witness E2

**Desktop → web live adoption · ACCEPTED 2026-08-28**

Completes the live-direction set alongside
`…-WITNESS-A.md` (web ↔ web) and `…-WITNESS-E1.md` (web → Desktop).

---

## 1. Candidate

```
converged candidate C   ddb08a43  claude/desktop-adoption-convergence-01
                        = 53c162bf (frozen adoption evidence, implementation 1377e8b4)
                        + d0db24b7 (platform composition, 5 commits) — merged, not rebased

desktop source          /tmp/witness-C/maia-desktop at ddb08a43
                        includes DESKTOP-TEXT-01: maia:send-text
electron                ^28 pin honoured
web artifact            the existing 1377e8b4 runtime on 127.0.0.1:3110
member                  witness1377e8b4, the same disposable member as A and E1
```

**Web-runtime equivalence, verified before the witness rather than assumed:**

```
git diff --name-only 1377e8b4..ddb08a43 -- . ':(exclude)maia-desktop/**' ':(exclude)docs/**'
count=0
```

C changed nothing the web runtime serves, so the running container is
byte-equivalent to C across all non-doc, non-`maia-desktop` source. No rebuild
was performed and none is claimed; this is an equivalence claim, not "the
container was built from C".

## 2. Acceptance rule

```
PASS = E20 ∧ E21 ∧ E22 ∧ E23 ∧ E24 ∧ E25 ∧ E26

E20  web observer had the SEED exchange rendered strictly before the Desktop send
E21  the Desktop typed turn became ONE canonical user+assistant exchange
E22  web adopted it with no reload and no interaction, ≤ 5000 ms from canonical completion
E23  it appears exactly once
E24  canonical ordering preserved (seed before Desktop turn)
E25  member identity stable on both surfaces
E26  no forked thread — Desktop wrote into the SHARED canonical thread
```

**E26 is the sharpest assertion here.** Desktop mints a private
`desktop-<timestamp>` conversation id at sign-in (`main.js:447`) and only then
adopts the member's canonical thread. Asserting that the Desktop-authored
exchange's `sessionId` equals the thread the web seeded is therefore a direct
test that Desktop wrote into the member's one conversation rather than a
parallel realm of its own — the failure this programme exists to prevent.

Desktop authored through `window.maia.sendText` → `maia:send-text`, which main
validates and hands to the **same** `deliverToMaia` the voice path uses
(`main.js:387`). The renderer supplies text and nothing else: not the member,
not the thread, not the route.

## 3. Convergence regression check (E1 on C)

Before E2, E1 was replayed once on C — not as a new acceptance campaign, but to
establish that the merge had not broken already-accepted behaviour:

```
RUN=MTDK7X9E  CANDIDATE=ddb08a43
E1_X=PASS               old_session=session_1787957254532
E1_Y_CREATED=PASS       new_session=session_1787958323998
E1_DESKTOP_ADOPTED=PASS elapsed_ms=12363 rejoined=true from=session_1787957254532
E1_HISTORY=PASS · E1_MEMBER_STABLE=PASS · E1_NO_FORK=PASS
WITNESS_E1=PASS  EXIT=0

corroboration: nonce_in_desktop_before=False, nonce_in_desktop_after=True,
               threads_held = exactly [X, Y]
```

## 4. Final run — measured evidence

```
RUN=MTDKJD7N   CANDIDATE=ddb08a43   TARGET=http://127.0.0.1:3110   EXIT=0
NONCE_S=WITNESS_E2_SEED_ddb08a43_MTDKJD7N
NONCE_D=WITNESS_E2_DESK_ddb08a43_MTDKJD7N

desktop: persisted session (witness1377e8b4) — signing out for a clean start
desktop: signed in as witness1377e8b4
desktop: sendText bridge present=true
web: seeded shared thread session_1787958855459 (exchange=c530f3a6-…)
desktop: joined shared thread session_1787958855459
E20 · web settled at 1787958872158
desktop sendText -> {"ok":true,"stoppedCapture":false}
E21 · desktop turn canonical after 209 ms exchange=572135da-… session=session_1787958855459

-------- VERDICT --------
E20=PASS seed_visible_before_send_ms=2220 settle_delta_ms=0
E21=PASS desktop_to_canonical_ms=209
E22=PASS elapsed_ms=1313 adopted_before_A1=false
E23=PASS occurrences=1
E24=PASS canonical_order=true
E25=PASS desktop_member=witness1377e8b4
E26=PASS desktop_wrote_into=session_1787958855459 shared=session_1787958855459
WITNESS_E2=PASS

-- desktop maia:thread events --
  t=1787958854743  session_1787958819546  rejoined=undefined
  t=1787958869769  session_1787958855459  rejoined=true
-- desktop maia:turn phases --
  t=1787958872160 phase=heard
  t=1787958872160 phase=thinking
  t=1787958872363 phase=answered
  t=1787958872363 phase=no-voice
```

The `heard → thinking → answered → no-voice` sequence is the typed turn moving
through the shared delivery path. `no-voice` rather than an audio phase is
correct and expected: this is a typed turn with speech out of scope.

## 5. Repetition

```
run         E20                E21     E22                    E23  E24  E25  E26  verdict
MTDKFH26    PASS (delta 1ms)   258ms   PASS 1471ms            PASS PASS PASS PASS PASS
MTDKG0TB    FAIL (tie, 0ms)    226ms   PASS 1299ms            PASS PASS PASS PASS FAIL
MTDKIKPX    PASS (2217ms)      261ms   PASS 0ms (early)       PASS PASS PASS PASS PASS
MTDKJD7N    PASS (2220ms)      209ms   PASS 1313ms            PASS PASS PASS PASS PASS
```

Three passes; one run failed **only** on the E20 formulation described in §10 —
a strict comparison that could fail on a clock tie and did. E21–E26 passed in
all four runs, including that one.

Two details worth keeping:

- **`MTDKIKPX` adopted before canonical completion was confirmed**
  (`elapsed_ms=0 adopted_before_A1=true`). Per the acceptance contract this is
  recorded, not penalised: the ≤5000 ms bound is an upper bound on eventual
  adoption, not a requirement that adoption begin only after the harness
  observes completion.
- **Desktop-to-canonical latency was 209–261 ms across all four runs**, while
  web adoption ran 0–1471 ms. The two are reported separately and only the
  second is bounded by the contract.

## 6. What this witness establishes

A member typing into the Electron Desktop produces a turn in the member's one
canonical conversation, and an already-mounted web `/maia` — never touched,
never reloaded — renders that exchange exactly once, in canonical position,
within the same envelope Witness A established for web ↔ web.

Together with A and E1, the ordinary live-direction set is complete:

```
web → web       PASS   Witness A   (adoption 898 ms)
web → Desktop   PASS   Witness E1  (adoption 12.4 s, within one 15 s watcher cycle)
Desktop → web   PASS   Witness E2  (canonical 209 ms, adoption 1.3 s)
```

Specifically exercised by E2: the `maia:send-text` bridge and its main-side
validation; `turnBusy` as one shared turn gate across typed and spoken paths;
`deliverToMaia` as the single delivery implementation; and — through E26 — the
direction-of-authority invariant, that Desktop writes into the member's
canonical conversation rather than one of its own.

## 7. Explicit non-claims

```
Voice, capture, transcription, TTS   UNWITNESSED. "Start listening" was never
                                     pressed in any run. D01's ruling stands:
                                     physical microphone behaviour is a separate
                                     founder-device witness that synthetic
                                     evidence cannot substitute.

Provider qualification               Language providers unavailable throughout;
                                     every assistant half is the durable
                                     fail-closed response. Valid because
                                     synchronization is content-agnostic. Does
                                     NOT witness normal conversation.

Database qualification               Production-derived schema transplant.
                                     MIGRATION-BOOTSTRAP-01 remains FAILED / OPEN
                                     and is untouched by this pass.

Platform shell                       The BrowserView two-authority-domain shell
                                     merged from d0db24b7 is PRESENT in C but is
                                     NOT exercised here. E2 drives the local MAIA
                                     renderer only. DS01's containment evidence
                                     stands on its own record.

Web artifact                         Byte-equivalent to C, not built from C.

Witness B                            DEFERRED to natural day rollover.
Witnesses C/D                        GATED — KOKORO_TTS_URL absent.
```

## 8. Disclosed accommodations

```
Desktop profile isolation not achieved (carried over from E1): --user-data-dir
  does not take effect, so the harness signs out any persisted session through
  the product's own maia:sign-out path and signs in fresh each run. Cleanup, when
  the witness lane closes, is product sign-out or removing session.bin
  specifically — NOT deleting the whole Desktop profile directory.

The harness launches its own Desktop instance; Playwright cannot attach to a
  running Electron process. Any window opened separately by the founder is
  visual baseline only and carries no assertion.

A seed exchange is authored by the web before the Desktop send, to establish
  both the shared thread and a known ordering predecessor for E24.
```

## 9. Disposition

```
WITNESS_A  = PASS · ACCEPTED    web ↔ web        (64bc7b7b)
WITNESS_E1 = PASS · ACCEPTED    web → Desktop    (53c162bf)
WITNESS_E1 = PASS · REGRESSION  replayed on C    (MTDK7X9E)
WITNESS_E2 = PASS · ACCEPTED    Desktop → web    (this record)

CROSS-SURFACE-THREAD-ADOPTION-01 — substantially complete for the ordinary
live-direction pair set. The witness lane closes here.

WITNESS_B   = DEFERRED   midnight boundary, natural rollover
WITNESS_C/D = GATED      streaming voice, Kokoro absent
```

Next: full-platform Desktop development on C, around the preserved spine — same
MAIA, same member, same canonical conversation, same memory and intelligence,
with House and platform places reachable from Desktop.

## 10. Integrity of the acceptance

No candidate implementation change was made to obtain this pass. C stayed at
`ddb08a43`; the database was untouched; no credential was repaired; no Docker
rebuild was performed. Only the external harness (`~/witness/witness-e2-C.mjs`,
outside the repository) was corrected, once:

```
E20 formulation   Written as `t20 < tSendStart` — two timestamps captured in
                  program order with nothing awaited between them, so the check
                  could only fail on a clock tie, and did once (MTDKG0TB,
                  delta 0 ms). This is the SAME defect that failed Witness A's A0
                  three times; having repaired it there, I reintroduced it here.
                  Replaced with the substantive assertion — the seed exchange was
                  RENDERED on the web surface strictly before the Desktop send —
                  which is a stronger claim than the one it replaced, not a
                  relaxed one. E21–E26 were unaffected and passed in all four runs.
```
