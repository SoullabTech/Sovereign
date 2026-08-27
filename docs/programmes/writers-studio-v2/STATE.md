# WRITERS-STUDIO-V2 — STATE

> Short by design. This is what JARVIS reconstructs from — not the conversation.
> Update it in the same commit as the work that changes it.

```text
PROGRAMME       WRITERS-STUDIO-V2 · ACTIVE
LANE            claude/writers-studio-organization-wxpb7q
CANONICAL       644d4f2c5

PRODUCTION      c9b0574db  deployed 2026-08-27 · VERIFIED TWO WAYS (D-007)
                  env var  — printenv GIT_COMMIT == c9b0574db
                  artifact — canvas client chunk page-5548396c41e9eeee.js,
                             was page-fbd9167f5560c402.js at 1feec9b1d;
                             the chunk was rebuilt, so the reactive read is
                             in the running image and not only in the stamp
                predecessor 1feec9b1d was also verified two ways (refusal-panel
                string present in both client chunk and server render)

CURRENT         WS2-00 — product contract
                BLOCKED on the reference images reaching the repository
                (DESIGN-CONTRACT.md §0 / DECISIONS.md D-006)

OPEN            WS2-01 — work/manuscript/content identity
                  deployed artifact            PASS
                  negative identity probe      PASS
                  full read-path audit         PASS  (1f836d1a7)
                  observed click defect        WITNESSED — FAILED
                  F-1 fixed                    eb89917ec · undeployed
                  F-2/F-3 contract corrected   eb89917ec · undeployed
                  F-4 drift points pinned      eb89917ec · undeployed
                  F-5 (legacy Press ingress)   eb89917ec · undeployed
                  D-008/D-010 regression pin   eb89917ec · undeployed
                  production proof             REQUIRED

                WITNESS RESULT, 2026-08-27, founder, on c9b0574db:
                clicking a work opened "Transcription" under the line
                "The most recent of your 4 manuscripts is on the table."
                That sentence renders ONLY on the no-id path, so the URL
                carried no `?m=` at all. This is F-1 — the producer emitting
                a bare href — not a failure of c9b0574db's reactive read.

                One failure was enough; no second click was collected.

IMPORT-READ-01  OPEN — supported manuscript upload cannot be read in
                production. DOCX and text both round-trip correctly in the
                repo, and the image copies full node_modules, so this is
                environment- or file-specific. The 422 no longer blames the
                member's file; it names the recognised format and emits
                `[MAIA/press] INGEST READ FAILURE { … reason: … }`.
                Next step is that log line, not another upload.

                  90f447cd8  refuse to substitute a manuscript not asked for
                             ✅ PROVEN IN PRODUCTION — negative probe passed:
                             bogus id → explicit refusal naming the id → ZERO
                             substitute content. D-008 holds on that path.
                  1feec9b1d  mount-time re-read — INEFFECTIVE, wrong mechanism
                  c9b0574db  read the URL reactively (useSearchParams), so the
                             click path and the direct path behave identically
                             LIVE AND VERIFIED IN THE IMAGE; behaviour on the
                             click path NOT YET WALKED — deployed ≠ observed
                Governing rule is D-010 — identity custody at the emitting
                control: a control that claims to open a particular writing
                must either emit that writing's exact identity or refuse to
                open. Absence, loss and invalidity must never collapse into
                "open something else."

                D-008 binds the consumer, D-010 binds the producer. The audit
                (WS2-01-READ-PATH-AUDIT.md) located the defect class: data
                ownership is sound; client identity custody is not.

                Fixes are held until the witness is walked, so the click path
                being measured does not move mid-measurement.

BLOCKED         WS2-04 — editor storage decision (rich text format + migration)

ACCEPTED        none

ROOT CAUSE      RESOLVED 2026-08-27 — and NOT what was inferred.
                Observed, not deduced: the console chain showed
                  asked    == dca75052…      returned == dca75052…
                  API resolution CORRECT, title correct, and yet the page had
                  fetched 094d0a2a… and printed the no-id fallback sentence.
                The page never asked the API for the id in the URL.

                Cause: every entry into the Canvas is a CLIENT-SIDE navigation
                (router.push from Studio Home, <Link> from HomeView), so `?m=`
                was not on window.location when the mount-time read ran. The
                read returned null, `asked` was false, and the room fell back
                to manuscripts[0] — the most recent — under the title of
                whatever was clicked.

                This is why the negative probe PASSED while clicking failed:
                a DIRECT load has the param in hand at mount; a CLICK does
                not. Same code, two paths, one of them blind.

                My earlier inference — "statically prerendered, so the
                initializer returns null" — named the right symptom and the
                wrong mechanism, and the mount-only re-read I added to fix it
                could not work, because the param arrives after mount.
                Recorded because a fix that works for the wrong reason is a
                defect waiting to return (D-009).

NEXT ACTION     0. deploy eb89917ec, then: click a work → it opens THAT work
                   or refuses; a work with no writing is inert and says so;
                   and read the INGEST READ FAILURE marker for IMPORT-READ-01
                1. founder: commit the 8 reference screens to reference/  → closes WS2-00
                2. founder: capture the resolution chain for TWO distinct
                   writings ON THE CLICK PATH (the path that was broken —
                   the direct-load probe already passed at 1feec9b1d).
                   Deliberately choose one that is NOT manuscripts[0].
                   Decisive assertion:  A ≠ B
                                        asked_A === returned_A === rendered_A
                                        asked_B === returned_B === rendered_B
                   (ACCEPTANCE.md § WS2-01 — screen alone is not acceptance)
                3. CC: owner → work → manuscript → section → content audit
                   across every read path, then pin D-008 as a regression test

HOLD            WS2-02 · WS2-03 · companion 404 (quarantined for WS2 outcomes)

CARRIED FORWARD WS-01 formal acceptance still outstanding (founder's act)
                STRUCTURE-02 held; redefinition carries into WS2-07 (D-005)
                SHELL-01 withdrawn; absorbed by WS2-02 + WS2-03

QUARANTINED     CADDY-CUSTODY-01 · Resend/auth:email-code · dependency audit debt

LAST UPDATED    2026-08-27
```
