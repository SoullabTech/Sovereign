# CROSS-SURFACE-THREAD-ADOPTION-01 — Witness E1

**web → Desktop live thread re-adoption · ACCEPTED 2026-08-28**

Companion to `CROSS-SURFACE-THREAD-ADOPTION-01-WITNESS-A.md` (web ↔ web, accepted at `64bc7b7b`).

---

## 1. Candidate

```
candidate SHA   1377e8b435195e345129e1196ceb629ec536d5f0
branch          claude/cross-surface-thread-adoption-01
desktop tree    maia-desktop/ AS IT EXISTS ON THIS SHA — the MAIA-D01 voice shell,
                not the platform-composition shell on claude/desktop-platform-composition-1wmu2y
electron        v28.3.3, matching the tree's "electron": "^28.0.0" pin
                (verified out-of-band: ./node_modules/.bin/electron --version)
target          http://127.0.0.1:3110  (same isolated witness runtime as Witness A)
member          witness1377e8b4 — the same disposable member Witness A created
```

The candidate was not modified. See §10.

## 2. Acceptance rule

An **already-open** Electron Desktop, signed in and settled on canonical thread X,
must notice that the member's canonical conversation became Y — authored on a
different surface — and join it without relaunch, sign-in, or member action.

```
PASS = E1_Y_CREATED ∧ E1_DESKTOP_ADOPTED ∧ E1_HISTORY ∧ E1_MEMBER_STABLE ∧ E1_NO_FORK

E1_X                Desktop adopted a thread at launch and was settled on it
E1_Y_CREATED        web /maia authored a NEW canonical thread Y, and Y ≠ X
E1_DESKTOP_ADOPTED  Desktop adopted Y, untouched, within 40 000 ms
                    (two full THREAD_POLL_MS=15000 cycles plus margin)
E1_HISTORY          Y's turns are rendered in the Desktop transcript
E1_MEMBER_STABLE    the same member throughout
E1_NO_FORK          Desktop only ever held X or Y — never a thread of its own
```

Adoption was read from **Desktop's own `maia:thread` broadcast** (`main.js:427`),
recorded through `window.maia.onThread` installed before sign-in — not inferred
from pixels. Desktop was never clicked, focused, reloaded or scripted after
sign-in; the harness only read `__threads` and `innerText`.

## 3. Substrate

Identical to Witness A and unchanged for this witness — see that record's §3 for
the full bootstrap ledger. In summary:

```
empty isolated witness DB + complete production-derived schema-only transplant
+ production schema_migrations ledger only (500 rows)
+ canonical migration chain NOT exercised
+ candidate web runtime at 127.0.0.1:3110
+ Electron Desktop from the same pinned worktree, MAIA_BASE_URL=http://127.0.0.1:3110
```

Language providers remained unavailable throughout (`SUBSTRATE-INFERENCE-01`),
so every assistant half is the durable fail-closed response. Adoption is
content-agnostic, so this does not weaken the result — and it is not repaired.

## 4. Final run — measured evidence

```
RUN=MTDJL1OF   CANDIDATE=1377e8b4   TARGET=http://127.0.0.1:3110   EXIT=0
NONCE_Y=WITNESS_E1_1377e8b4_MTDJL1OF

desktop: found a persisted session (witness1377e8b4) — signing out for a clean start
desktop: signed in as witness1377e8b4
E1_X=PASS old_session=session_1787956964833

web: member 31276ae6...
web: switch-to-text attempt=1 dispatched=true
web sent: WITNESS_E1_1377e8b4_MTDJL1OF
E1_Y_CREATED=PASS new_session=session_1787957254532 (X=session_1787956964833)
               exchange=17dc4658-c9fd-47de-91db-7aafb5e04061
  web authored in 314 ms

-------- VERDICT --------
E1_X=PASS               old_session=session_1787956964833
E1_Y_CREATED=PASS       new_session=session_1787957254532
E1_DESKTOP_ADOPTED=PASS elapsed_ms=13858 rejoined=true from=session_1787956964833
E1_HISTORY=PASS
E1_MEMBER_STABLE=PASS   member=witness1377e8b4
E1_NO_FORK=PASS         threads_held=["session_1787956964833","session_1787957254532"]
WITNESS_E1=PASS

-- desktop maia:thread events --
  t=1787957253625  session_1787956964833  resumed=true  rejoined=undefined  turns=2
  t=1787957268649  session_1787957254532  resumed=true  rejoined=true       turns=2
```

The second event is the whole witness: the Desktop's own watcher reporting that
it left `session_1787956964833` for `session_1787957254532`, naming where it came
`from`, **15 024 ms** after the first — one watcher cycle, unattended.

## 5. Repetition

```
run         X                        Y                        adopted   rejoined  from named
MTDJEU4X    session_1787955565084    session_1787956964833    ~15030ms  true      yes
MTDJL1OF    session_1787956964833    session_1787957254532     13858ms  true      yes
```

Both runs PASS, both within a single 15 s cycle, both holding exactly two threads.

Two details worth keeping:

- **MTDJEU4X's X was the Witness A thread itself** (`session_1787955565084`, 4
  turns) — a conversation authored entirely from a headless browser, later
  rendered by the Electron companion. Cross-surface continuity across two
  witnesses, not merely within one.
- **MTDJL1OF's X was MTDJEU4X's Y.** The second run began where the first ended,
  which is the behaviour the design claims and also confirms the Desktop kept
  what it adopted rather than reverting on restart.
- Independent corroboration for MTDJEU4X from the saved evidence:
  `nonce_in_desktop_before = False`, `nonce_in_desktop_after = True`.

## 6. What this witness establishes

An already-open Electron Desktop, holding a canonical thread, detects that the
member's canonical conversation has changed on another surface and joins it —
without relaunch, without sign-in, without any member action — rendering the new
thread's history and forking nothing.

Specifically exercised:

- launch-time adoption (`joinMemberThread`, `main.js:507` for a restored session,
  `main.js:449` after sign-in)
- the 15 s watcher (`THREAD_POLL_MS`, `main.js:369`, `startThreadWatch`)
- `threadWatch.observe()` returning `adopt` on a genuine change, and its
  member gate — `currentMemberId()` returns `username`, not display name
  (`main.js:386`), so adoption cannot cross members
- re-adoption through the single shared path (`conversation.adoptMemberThread()`),
  history refetch, and the `maia:thread { rejoined, from }` broadcast
- the direction-of-authority invariant: Desktop **observed and conformed**. It
  never pushed a thread state outward and held none of its own.

## 7. Explicit non-claims

```
Desktop authoring          NOT witnessed. E2 (Desktop → web) is DEFERRED: the
                           maia-desktop on this SHA has no maia:send-text, so its
                           only authoring path is voice capture. That is gated by
                           transcription, by Kokoro's absence, and by D01's ruling
                           that physical microphone behaviour is a separate
                           founder-device witness synthetic evidence cannot replace.

Platform-composition shell NOT witnessed. The BrowserView two-authority-domain
                           shell, DESKTOP-TEXT-01, capture release and the Go menu
                           live on claude/desktop-platform-composition-1wmu2y and
                           are not part of this candidate or this record.

Provider qualification     Language providers unavailable; assistant halves were
                           the durable fail-closed response. Valid for adoption,
                           which is content-agnostic. Does NOT witness normal
                           conversation.

Database qualification     Production-derived schema transplant.
                           MIGRATION-BOOTSTRAP-01 remains FAILED / OPEN.

Voice, TTS, capture        Unwitnessed. Start listening was never pressed.

Excluded from the record   A separate window titled "MAIA Desktop — Journey",
                           running the desktop-branch shell and signed in as the
                           founder's own account, was open on the machine during
                           this period. It is a different build, a different
                           member, and not the subject of any assertion here.
```

## 8. Disclosed accommodations

Beyond Witness A's substrate ledger, two specific to E1:

```
Desktop profile isolation NOT achieved. --user-data-dir did not take effect
  (Electron consumed it as an app argument), so the witness member's Desktop
  session persisted in the default profile rather than a /tmp one. The harness
  therefore signs out any persisted session through the product's own
  maia:sign-out path and signs in fresh, which is what makes each run
  deterministic. Housekeeping: ~/Library/Application Support/maia-desktop holds a
  disposable witness identity and should be cleared.

The harness launched its OWN Desktop instance. Playwright cannot attach to a
  running Electron process. A separately launched Desktop window observed by the
  founder is baseline/visual evidence only and carries no assertion.
```

## 9. Disposition

```
WITNESS_A  = PASS · ACCEPTED   (web ↔ web, durable at 64bc7b7b)
WITNESS_E1 = PASS · ACCEPTED   (web → Desktop)
WITNESS_E2 = DEFERRED          (Desktop → web; blocked on branch convergence)
WITNESS_B  = DEFERRED          (midnight boundary, natural rollover)
WITNESS_C/D= GATED             (streaming voice; Kokoro absent)
```

## 10. Integrity of the acceptance

No candidate implementation change was made to obtain this pass. The candidate
stayed pinned at `1377e8b4`; the database was not altered; no credential was
repaired. Only the external harness (`~/witness/witness-e1-1377e8b4.mjs`, outside
the repository) was corrected, twice, as its own assumptions were falsified:

```
argument order        --user-data-dir was passed after the app path, where
                      Electron treats it as an app argument. Corrected; profile
                      isolation still did not take effect (see §8), which is
                      disclosed rather than worked around.

recorder ordering     the harness installed its maia:thread recorder after
                      waiting for the sign-in form. For a RESTORED session,
                      main.js:507 adopts on did-finish-load — before that point —
                      so X would have been missed. Corrected to install the
                      recorder first, then sign out and in for a clean start.
```

One cosmetic harness defect, uncorrected and noted so the log is not misread:
the run prints `electron=0.0.1-d01`, which is `app.getVersion()` — the
application's own version from `package.json`, not the Electron runtime version.
The Electron version was established separately as **v28.3.3**.
