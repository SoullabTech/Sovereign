# WRITERS-STUDIO-V2 — STATE

> Short by design. This is what JARVIS reconstructs from — not the conversation.
> Update it in the same commit as the work that changes it.

```text
PROGRAMME       WRITERS-STUDIO-V2 · ACTIVE
LANE            claude/writers-studio-organization-wxpb7q
                ONE LANE. Consolidated 2026-08-28. A Writer's Studio document
                that exists on another branch and not on this one is NOT
                governing.
LANE HEAD       eeb0cbba6  before this reconciliation commit
CANONICAL       644d4f2c5

GOVERNING SET   seven documents, jointly controlling. None overrides another.
                  DESIGN-CONTRACT.md              FROZEN
                  CAPABILITY-COVENANT.md          BINDING
                  DESIGN-DEVELOPMENT-PROTOCOL.md  BINDING
                  WS2-02-03-AUTHORITY-AUDIT.md    ACTIVE PRE-BUILD HOLD
                  PROGRAMME.md · CAPABILITY-MAP.md · ACCEPTANCE.md
                An implementation is acceptable only when it conforms to the
                frozen design language, preserves the covenant, AND was
                developed under the protocol.
                  visual fidelity      cannot justify capability loss
                  legacy capability    cannot justify abandoning the composition
                  implementation convenience cannot silently alter meaning
                Arrived by three authorized cherry-picks (407d2f543, 4e73182a6,
                eeb0cbba6), each recording its source with -x. No other lane's
                ancestry was merged.

FROZEN STATE    founder, 2026-08-28
                  WS2-00              CLOSED
                  D-017               SATISFIED by image reading
                  D-018 / D-019       RECORDED
                  WS2-SUBSTRATE-01    NEXT · bounded migration/object-model
                                      repair · DEFINED, NOT STARTED
                  WS2-02 / WS2-03     HELD behind substrate truth

WS2-SUBSTRATE-01
                Authorized 2026-08-28 (D-021). Stands between WS2-00 and
                WS2-02 so the design units implement against a substrate that
                already tells the truth. Four repairs, no more:
                  1 Work↔Manuscript as a real persisted relation  LOAD-BEARING
                  2 a real provenance model, incl. imported-source identity,
                    replacing the one-value placeholder
                  3 persisted adoption/disposition — Belongs/Maybe/Not now
                    and Discuss/Keep/Unresolved/Dismiss are NOT UI states
                  4 referential integrity on
                    studio_companion_turns.manuscript_id
                It does NOT invent the full future schema. Exactly enough for
                the settled architecture to be representable without loss.
                Packet: WS2-SUBSTRATE-01.md

WS2-02          HELD on four predicates AND behind WS2-SUBSTRATE-01.
                HELD is not "next".
                  A  OBJECT MODEL      Work / Manuscript / Material distinct
                  B  MAIA RELATIONSHIP MAIA Exchange belongs to a Work without
                                       becoming manuscript content
                  C  PROVENANCE        exists architecturally NOW; presentation
                                       may wait for WS2-06
                  D  ONTOLOGY          Mode ≠ Creative Distance ≠ Functional
                                       Owner; navigation may privilege
                                       distances, never collapse or hide them
                A/B/C/D are all RULED (founder, 2026-08-28). The rulings state
                what must be BOUND; the binding is the act that lifts the hold.
                Governing line on C: **provenance presentation may remain
                WS2-06; provenance architecture may not.**
                "MAIA region" is retired as an architectural definition — a
                region is presentation. The architecture needs
                MAIA-in-relation-to-a-Work.

WS2-03          HELD behind the same four rulings AND behind
                WS2-SUBSTRATE-01. "Persistent work context" is semantically
                false until repair 1 lands: the system can know whose
                manuscript it is, but not which Work it belongs to.

NEXT UNIT       WS2-ARCHITECTURE-DEFINITION.md — DRAFTED 2026-08-28, awaiting
                founder review. Binds A–D in words and types. No code, no
                migration, no UI.
                The hold is NOT "we do not know the architecture." The
                reference pack already carries it — verified by reading 04 and
                05, not their filenames. The hold is: write down the
                architecture the pack already implies, so implementation
                cannot accidentally simplify it.

SUBSTRATE       three facts WS2-02/03 must be planned around. Read from the
                migrations, not assumed:
                  1 member_manuscripts has NO work_id / living_work_id.
                    The Work↔Manuscript edge DOES NOT EXIST. Persistent work
                    context cannot be built correctly without it.
                    (Work↔Material DOES exist — living_work_materials, and it
                    is already a declared writer act.)
                  2 member_manuscripts.provenance is
                    CHECK (provenance = 'member_uploaded') — ONE permitted
                    value. It is a constant, not a model. Meanwhile 05 already
                    draws a Provenance tab. Design is AHEAD of substrate.
                  3 studio_companion_turns ALREADY carries living_work_id +
                    manuscript_id with a CHECK refusing a homeless turn —
                    better than the audit assumed. But no adoption state, and
                    manuscript_id has no FK.
                Whether these are repaired inside WS2-02/03 or in a preceding
                migration unit is a founder decision, NOT TAKEN.

PRODUCTION      0d66a5a27  deployed 2026-08-27 · VERIFIED TWO WAYS (D-007)
                  env var  — GIT_COMMIT == 0d66a5a27 (gate-verified at swap)
                  artifact — /writers-studio/canvas grew 8 kB → 19.9 kB and
                             /writers-studio 5.47 → 6.01 kB in the build
                             manifest: the refusal states, the "which writing"
                             chooser and the inert cards are in the image
                contains eb89917ec — the five custody fixes and the pin

PREDECESSOR     c9b0574db  deployed 2026-08-27 · VERIFIED TWO WAYS (D-007)
                  env var  — printenv GIT_COMMIT == c9b0574db
                  artifact — canvas client chunk page-5548396c41e9eeee.js,
                             was page-fbd9167f5560c402.js at 1feec9b1d;
                             the chunk was rebuilt, so the reactive read is
                             in the running image and not only in the stamp
                predecessor 1feec9b1d was also verified two ways (refusal-panel
                string present in both client chunk and server render)

WS2-00          CLOSED 2026-08-27. Reference screens under repository custody
                in 1493c28c0; DESIGN-CONTRACT.md is FROZEN, not DERIVED.
                  · filenames recorded against screens, verified by READING
                    the images rather than trusting the names
                  · 04-writing-field-wide.png confirmed CANONICAL for WS-WRITE
                  · 06 and 07 are byte-identical duplicates of 03 (one md5,
                    three copies) — SIX distinct references, not eight
                  · capture contract confirmed: capture-studio-field.mjs,
                    1680x1050@2x fixed inside the script, waits for the draft
                  · a description of 04 earlier in this programme was WRONG —
                    the bottom Materials strip is 08. Corrected in place.

⚠ PRODUCTION REGRESSED FOR THIS PROGRAMME
                production is now 92bc2a9df (clean-main-no-secrets, PR #1111
                transcribe middleware). cc3ef9cbe is NOT an ancestor of it —
                verified, not assumed. A + B + C are NO LONGER LIVE.
                The WS2-01 acceptance walk cannot be run against production
                until the candidate is redeployed or merged to the deploy lane.
                Nothing was lost: the work is on this branch. But the walk is
                blocked, and a walk run now would test a build without the
                fixes and read as a regression that isn't one.

CURRENT         WS2-01 — identity / content correctness
                Corrected 2026-08-28: this line previously said WS2-01 was
                blocked on the reference images reaching the repository, while
                the WS2-00 entry above recorded them IN CUSTODY. The declared
                reconstruction point was arguing with itself. The images landed
                in 1493c28c0; D-006 is satisfied; nothing is blocked on them.

                WS2-01 acceptance recovery is still OUTSTANDING wherever
                runtime/Mac evidence is required. Source and candidate work is
                complete on this lane; that is NOT acceptance. Do not report
                WS2-01 accepted because the code exists.
                  Phase 0  capture recovery      requires the Mac
                  Phase 3  deploy the candidate  requires Mac/runtime
                  Phase 4  production probes     requires runtime
                  Phase 5  member walk           requires the founder
                  Phase 6  adjudication          can be done from the repo
                A remote Claude Code session cannot produce Phases 0/3/4/5 — no
                database, no env files, no member session, no deploy host — and
                must not hand back provenance it did not observe (D-017).

OPEN            WS2-01 — work/manuscript/content identity
                  deployed artifact            PASS
                  negative identity probe      PASS
                  full read-path audit         PASS  (1f836d1a7)
                  observed click defect        WITNESSED — FAILED
                  F-1 fixed                    LIVE (0d66a5a27)
                  F-2/F-3 contract corrected   LIVE (0d66a5a27)
                  F-4 drift points pinned      LIVE (0d66a5a27)
                  F-5 (legacy Press ingress)   LIVE (0d66a5a27)
                  D-008/D-010 regression pin   LIVE (0d66a5a27)
                  production proof             REQUIRED — one click, one import

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

WS2-01C ROOT CAUSE, 2026-08-27 — found in code, not on a screen:
                lib/manuscript/ingest/segment.ts cut at EVERY heading-shaped
                line, flat. A print manuscript is full of capitalised lines
                that are not chapters — subheads, front matter, appendix
                labels — so a 212-page book arrived as a hundred-plus parts,
                each "~1 page", and "Chapter 10: The Living Spiral" held
                nothing but its own epigraph because the chapter's first
                subhead cut immediately after it. The mapper was innocent:
                every region it drew was the true size of the section it was
                given. Two further defects fell out of the same read —
                the MAX_SECTIONS loop TRUNCATED the manuscript instead of
                absorbing the remainder, and an unnamed part (the preamble
                every import produces) was filed under "NOT FOUND IN THE
                DRAFT" — a false statement about text that is in the draft.

                FIX: cut at the strongest heading level the document itself
                declares (markdown depth · "Chapter N" · ALL-CAPS), skipping
                a level only when it would produce one section. Nothing is
                inferred; subheads are carried verbatim inside their chapter.

WS2-01B NOTE    my earlier reading — "zero ingest log lines, therefore the
                request never reached the route" — was not supported. Of the
                ingest route's exit paths, only three logged anything: 401,
                400, 413 and over-text-cap all answered the screen and told
                the record nothing. Every refusal now names itself
                (INGEST ARRIVED / INGEST REFUSED, counts and reasons only),
                so the next attempt is self-diagnosing. Root cause still OPEN.

OPEN (cont.)    WS2-01A identity custody     LIVE (0d66a5a27) · proof required
                WS2-01B import intake        ONE PATH FIXED in lane
                WS2-01C section mapping      FIXED in lane
                  ⚠ C takes effect at IMPORT only. Manuscripts already saved
                    keep their old cuts until re-imported — including
                    book-print-kdp-final. C is invisible until B works.

WS2-01B FINDING, 2026-08-27 — D-009, third instance, second in one file:
                "Import writing" is a deep link (/press/manuscript?import=1).
                The Press room read that parameter in a LAZY useState
                initializer — a mount-time read. Forty lines above it, the
                same file explains at length why a mount-time read of the URL
                is wrong on a client-side navigation. So `importing` stayed
                false and the link delivered the member into the Room around a
                book they already had. Now observed reactively, latched as
                state, still spent on a successful save. Pinned from the
                Studio side, which owns the link.
                It was not the only path. Three more, same class — a failure
                that reaches the member as nothing at all:
                  · requestPreview threw into a catch whose only act was
                    setPreview(null). saveError is reset false three lines
                    above and never set true there, and the one place it
                    renders is inside the confirm-cuts panel the member has
                    not reached yet. A refused preview showed NOTHING — the
                    button was pressed and the room did not move.
                  · the save step answered "Could not save. Please try again."
                    over the server's own words. "too many sections (max 400)"
                    is actionable; the generic line is not.
                  · the import's closing redirect into the Canvas hand-wrote
                    `?m=${id}` — F-4, in the one navigation that matters most,
                    in a file the F-4 pin did not list. That is how F-4
                    survived F-4. The pin now covers it.
                The refusal instrumentation stands until a real attempt names
                its own exit.

CANDIDATE       24faae89f · A+B+C · NOT DEPLOYED
                  A  identity custody          included (from 0d66a5a27)
                  B  intake refusals           4 defects repaired + contract
                  C  structure segmentation    included
                Everything after 24faae89f is documentation and a script
                docstring — no runtime code. Deploying the pinned SHA and
                deploying the branch tip are the same running image.

GATE RESULTS    run 2026-08-27
                  typecheck (no-regression)     PASS · 227 vs baseline 239
                  jest, whole repo              33 suites / 72 tests fail,
                    IDENTICAL with and without this branch (stash-compared).
                    Pre-existing debt, mostly vitest imports under a jest
                    runner. This branch ADDS 11 passing: 4175 → 4186.
                  omission control              PASS (print book + cap case)
                  identity regression pins      PASS
                  check:no-supabase             PASS
                  Co-Lab boundaries             PASS — OBSERVED
                    host    minisforum, from Kellys-Mac-Studio
                    command scripts/pre-deploy-gate.sh colab
                    result  33 passed · 0 failed · 0 warned (floor 31)
                            verifier exit 0; [gate:ok]
                    read    the raw matrix was also run and printed all 12
                            sections green — ownership, cross-ownership,
                            membership isolation, people, DMs, sessions,
                            files, atoms, admin workspace, no-one-stranded,
                            switching, practitioner notes encrypted
                    note    33, not 31. The floor is 31 and the suite has
                            grown to 33. Record the number observed, not
                            the number the doc predicted.

EVIDENCE LABEL  the intake-refusal proof is CONTRACT-LEVEL. intakeMessage is
                a pure function, exhaustively returned, and the pins show
                every call site produces it AND renders it — proof through
                the value the client renders. It is NOT a mounted-DOM proof
                and NOT a pixel proof: no component was rendered, no browser
                was driven. Legitimate evidence of what it is; not evidence
                of what was never collected.

                B's production root cause remains UNCLAIMED. Four real
                defects are fixed and any one could explain what was seen.
                A successful deploy does not adjudicate which mattered.

PRODUCTION      cc3ef9cbe  deployed 2026-08-27 · VERIFIED THREE WAYS (D-007)
                  env var  — GIT_COMMIT == cc3ef9cbe (gate-verified at swap)
                  lane     — DEPLOY_LANE == deploy-lane
                  artifact — three strings that exist ONLY in this candidate,
                             found in BOTH client chunks and server bundles:
                               "Carried without a heading"     → WS2-01C rail
                               "reading the cuts in that text" → WS2-01B intake
                               "not on your shelf"             → WS2-01A refusal
                             and the canvas client chunk moved
                               page-5548396c41e9eeee.js  (c9b0574db)
                             → page-aa2819994ea12707.js  (cc3ef9cbe)

                ⚠ WHY THE ARTIFACT LEG EARNED ITS KEEP HERE. Every builder
                layer in the deploy log reported CACHED, including `COPY . .`
                and `npm run build`. GIT_COMMIT is a build-arg consumed in the
                RUNNER stage, so it stamps the container without busting the
                builder cache: printenv proves the STAMP, never the CODE. The
                cache hits turned out benign — a second run of the same deploy
                — but that was established by the artifact grep, not assumed
                from the stamp. Carry this forward: on any deploy whose build
                log is all-CACHED, the env var alone is not evidence.

PREDECESSOR     0d66a5a27  (A only) · c9b0574db · 1feec9b1d — all verified two ways

DEPLOY          DONE — cc3ef9cbe. One candidate, not three.
                A + B + C ship together; C alone gives no verification path
                and would force a second deploy immediately after.
                  ssh soullab@minisforum 'cd ~/MAIA-SOVEREIGN \
                    && git fetch origin claude/writers-studio-organization-wxpb7q \
                    && scripts/pre-deploy-gate.sh deploy-maia <SHA>'
                verify two ways (D-007):
                  env var  — docker exec maia-sovereign printenv GIT_COMMIT
                             must equal the SHA deployed
                  lane     — docker exec maia-sovereign printenv DEPLOY_LANE
                             must read deploy-lane
                  artifact — /writers-studio and /press/manuscript route
                             sizes must move in the build manifest

WITNESS         one walk proves all three (founder, after the single deploy):
                1. import book-print-kdp-final again
                2. open it from Studio Home
                3. title and manuscript are the ones clicked          → A
                4. click Chapter 10
                5. it holds the chapter BODY, subheads included —
                   not a one-page fragment                            → C
                6. spot-check one earlier and one later chapter       → C
                (the import completing at all is B)

NEXT ACTION     1. CC: exhaust WS2-01B — the caps chain, the save step, and
                   anything else that can refuse an import
                2. assemble A+B+C as one candidate; typecheck + suites +
                   Co-Lab gate green before it is named
                3. deploy once, verify two ways (D-007)
                4. founder: the six-step walk above
                5. founder: commit the 8 reference screens to reference/
                   → closes WS2-00

HOLD            WS2-02 · WS2-03 · companion 404 (quarantined for WS2 outcomes)

CARRIED FORWARD WS-01 formal acceptance still outstanding (founder's act)
                STRUCTURE-02 held; redefinition carries into WS2-07 (D-005)
                SHELL-01 withdrawn; absorbed by WS2-02 + WS2-03

QUARANTINED     CADDY-CUSTODY-01 · Resend/auth:email-code · dependency audit debt

LAST UPDATED    2026-08-28
```
