# Journey ledger (slice 1)

An executed member-journey harness for Writer's Studio. A scripted persona walks the real product in a real browser, and
every step ends in exactly one of three states:

| Status | Meaning |
| --- | --- |
| **PASS** | It was exercised and what it led to was rendered (page with real text, dialog, changed state, successful request). The row quotes the evidence. |
| **DEAD END** | It was exercised and led nowhere: blank page, 4xx/5xx, dead link, bounce to sign-in, a click nothing could receive, or nothing happened. |
| **NOT RUN** | It was not exercised, or could not be decided: the walk stopped, the control needed a MAIA reply (this slice has no MAIA step), it points off the product, the harness could not press it. |

**The rule, enforced in code** (`lib/ledger.mjs`, the one function `decide`): a journey "works" and the process exits 0 only
if it has at least one row, **every** row is PASS, **and the walk did not stop on a harness error**. Any DEAD END or NOT RUN row,
an empty ledger, or a walk that crashed exits 1 and the report says `VERDICT: does NOT work` (the verdict line names the crash).
Every planned row starts NOT RUN, so a crash, a timeout or a script that forgets a row cannot produce a green report; and a crash
*after* the last planned row went PASS, which leaves no NOT RUN row behind, is its own signal to `decide`: the rows of a walk that
stopped are not the whole walk, whatever they say. Unobservable is not pass.

Why this exists: defects have been reaching the founder when they *use* the product, and earlier review read code. This
instrument presses the doors.

## Run it

```bash
bash tests/e2e/journey-ledger/run.sh --report /path/to/ledger.md
```

Needs: a checkout with `node_modules` (a symlink works), PostgreSQL 16 server binaries under `/usr/lib/postgresql/*/bin`,
Node 22, a Chromium that Playwright can drive (`JL_CHROMIUM=/path` to point at one; otherwise Playwright's own, then
`/opt/pw-browsers`), about 3 GB free disk for the `next dev` cache, and the ports below free (it refuses if they are not).
Running as root works (the database server then runs as the `postgres` user; Chromium gets `--no-sandbox`).

Flags: `--persona p1` (default) · `--defeat MODE` (run the committed WJ-1 spec with one of its four defeat modes on this stack; a NON-ZERO exit is the expected result) · `--wj1-only` (WJ-1 on this stack, no ledger walk) · `--hold` (bring the stack up and wait; harness development only) · `--flag K=V` (repeatable, overrides the flag matrix below) · `--max-trials N` (default 120;
rows beyond it are NOT RUN, never dropped) · `--wj1` (also run the committed WJ-1 spec on the same stack; the run exits non-zero if either the ledger or WJ-1 failed) · `--keep` (leave the
run directory) · `--app-port` (3651) · `--pg-port` (55691) · `--stub-port` (55692).

Exit codes: `0` works · `1` does NOT work (read the report: a DEAD END or NOT RUN row, a walk that crashed, or a failed WJ-1 when `--wj1` was
given; with `--wj1` the code is non-zero if **either** part failed) · `64-79` the harness could not run, so nothing is claimed. A `--report`
path must be in a directory that **already exists**: otherwise it is refused (64) and nothing is created or written.

The report header's **`Subject`** is the short HEAD SHA and branch, followed by `+ uncommitted changes (...)` whenever a tracked **or untracked**
file under `tests/e2e/journey-ledger` differs from HEAD (the instrument that produced the report is not the code at that SHA: it is
counted by file), or any other tracked file is modified (the product under test is not). Read before `next dev` starts, because
Next rewrites `AGENTS.md` and `next-env.d.ts`. Untracked files elsewhere and ignored files are not looked at. A report whose Subject
carries the marker cannot be reproduced from the SHA alone.

Unit tests of the rule and the classifier (no browser, no database, a few seconds):

```bash
node --test tests/e2e/journey-ledger/lib/*.test.mjs      # or: npm run test:journey-ledger (also runs the shell helpers and the README-vs-code check; none of it starts a stack)
node tests/e2e/journey-ledger/lib/mutants.mjs            # breaks one line at a time in ledger.mjs / classify.mjs / trial.mjs (settleKey) / run-lib.sh / run.sh / the persona / the README; every mutant must be killed
node tests/e2e/journey-ledger/lib/fixture-check.mjs      # the press harness in a real browser against a tiny local page that misbehaves (needs a Chromium, no database; ~45 s)
```

`fixture-check.mjs` exists because the unit tables cannot see WHEN the harness pressed or WHICH requests it credited: those depend on
timing in a browser. Each scenario is a page that reproduces a fault of the run of record (a Work still being made when Home is
pressed; a page's own request landing late; an unrelated beacon after the click; a request that never finishes), plus two controls
that must stay PASS (a button whose own handler navigates, a button whose only effect is a request), plus disabled controls whose
`title` repeats their own name (must stay NOT RUN, whatever the length of the name) or says something else (PASS), and a check, on every press, that the harness records a
click as *delivered* only when it was (`obs.pressed`). Exit 0 = all judged as
expected, 1 = misjudged, 64 = no browser (nothing is claimed). It is run by hand, like the walk; it is not in `npm run test:journey-ledger`.

The suites also carry **defeat candidates**: deliberately wrong rules (NOT RUN ignored, any PASS suffices, an empty
journey "works", a report or exit code that decides on its own), wrong classifiers (status-only, inert-is-fine, a model call
scored as the page working, a blocked click hidden as NOT RUN, text-only so a 404 page with words passes, every request in the window
credited to the press, a press on a moving page credited with what lands next) and a wrong wait (a key that ignores the address). Each must make the
suite fail; a suite that cannot fail proves nothing.

## What `run.sh` starts, and always stops

1. **PostgreSQL 16 shadow**: its own data directory under `$TMPDIR/jl-run.*`, own port, trust auth, `127.0.0.1` only. Schema =
   `database/baseline/0001_baseline_2026-09-01.sql` with the `CREATE EXTENSION vector` line neutralised and applied **without**
   `ON_ERROR_STOP` (pgvector is not installed), the migration ledger stamped from the baseline manifest, then each pending
   migration applied one at a time. About 621 of 634 baseline tables exist and one migration is refused (it needs a vector table).
   The Writer's Studio routes the walk touches work; the vector-backed tables do not exist. The exact counts are printed in the
   report header.
2. **Model stub**: a loopback server that refuses every call and logs a count. The app is started with `ANTHROPIC_BASE_URL` pointed
   at it, so a call made through the Anthropic SDK reaches the stub, never a real provider, and no provider credential is passed to
   the app at all (see "What is and is not isolated" below: that is not network isolation). A control that triggers a model call is
   NOT RUN with the reason stated.
3. **`next dev --webpack`** on `http://localhost:PORT` (Turbopack fails with a symlinked `node_modules`). Use **`localhost`, not
   `127.0.0.1`**: Next blocks its dev resources from the 127.0.0.1 origin, so pages return 200 and render blank. The app server is
   started with an allowlisted environment (below); its network is **not** isolated. The browser blocks any request that leaves
   localhost (the blocked hosts, if any, are listed in the report).
4. A fresh **fictional rostered member per press** (a member row plus `ops_contacts.metadata.writers_studio_beta`, as WJ-1 does),
   so pressing "Just let me write" (which makes a Work) cannot change the Home the next control is tried from.

On exit (pass, fail, signal) it stops the app's process group, the stub and the database, removes the run directory, removes the
`.next` and `test-results` directories it created, and restores `AGENTS.md` and `next-env.d.ts`, which `next dev` rewrites.
Note: the first time Next 16 runs under an agent (it recognises one from environment variables such as `CLAUDECODE` or `AI_AGENT`) it prints
an upgrade notice and exits, and it edits `AGENTS.md`; the harness retries the same command once and takes no other action on that text.
The app server no longer receives those variables (allowlist, below): in the one capped walk run after that change the notice did not
appear and `AGENTS.md` was not touched (`next-env.d.ts` still was, and is restored). The retry and the restore stay as a safety net.

## What is and is not isolated (read before running it from a machine that holds credentials)

**Isolated, and checked** (`lib/run-lib.test.mjs` runs the real Next env-file loader and a poisoned caller environment against
`jl_build_app_env`; the environment of the app-server process of a capped walk was read from `/proc/<pid>/environ`):

- **The app server's environment is an allowlist** (`env -i`): `PATH`, a throwaway `HOME` and `TMPDIR` under the run directory,
  `NODE_ENV`, `NEXT_TELEMETRY_DISABLED`, `PORT`, `NODE_OPTIONS` (the harness's heap limit only: `--max-old-space-size=8192`, or `JL_APP_HEAP_MB`), the shadow `DATABASE_URL`,
  `PGOPTIONS`, the model-stub base URL with a fictional key, and the flag matrix. Nothing the caller exported reaches it: no proxy
  variable, token, cloud credential, agent marker, `NODE_OPTIONS` or `NODE_PATH`. It is started through the checkout's own `next`
  binary, not through `npx`, so npm's configuration and registry are not consulted either.
- **The checkout's Next env files are blanked.** In development Next loads `.env.development.local`, `.env.local`,
  `.env.development` and `.env` from the checkout root, and never overrides a variable that is already defined. `run.sh` asks Next's
  own loader (`@next/env`) which names those files hold and passes each one as the empty string, so what the files hold cannot reach
  the app (a file's own `DATABASE_URL`, `PORT` or key cannot displace the harness's either). Cost: code that reads such a name sees
  `""`, not `undefined`. If one of those files exists and the loader cannot be run, the run is refused (exit 71) rather than guessed.
  `.env.production`, `.env.docker` and the like are not loaded by a development server and are not touched.

**NOT isolated, and not claimed:**

- **The network.** Nothing stops the app server opening a connection wherever this machine allows. No proxy variable only means no
  proxy is configured, which on a machine with direct egress is a direct route out. The app server does try: its log in a capped walk
  shows it attempting to fetch a web font from Google Fonts (`next/font/google`) and failing on a certificate error. The only network
  control is the browser's: requests the *browser* makes off localhost are blocked and listed in the report.
- **The harness's own process** (the walker, Chromium, WJ-1's Playwright run) runs with the caller's environment; it needs it.
- **Files the app can read by path** stay readable, `HOME` and `TMPDIR` aside. Run it on a machine, or as a user, that holds nothing you
  would not hand to a development server.

## The flag matrix the harness boots

**Production's flag values are not in the repository** (not in `.env.example`, compose or CI), so this is the repository's documented
defaults plus the switches the Studio rooms need to open. **They may differ from production**, and a walk under different flags can
find different doors. Override with `--flag K=V`; the values in effect are printed in every report.

| Flag | Value | Source |
| --- | --- | --- |
| `NEXT_PUBLIC_WS_DEVELOP_STAGE` | `1` | compose default (founder ruling 2026-11-09) |
| `NEXT_PUBLIC_WS_AUTO_READ` | `1` | compose default (founder ruling 2026-11-12) |
| `WRITERS_STUDIO_EDITORIAL_ENABLED` | `1` | editorial routes answer 404 without it |
| `WRITERS_STUDIO_FOCUS_ENABLED` | `1` | focus route is off without it |
| `WRITERS_STUDIO_REVIEW_DISCUSS_ENABLED` | `1` | review-discuss routes are off without it |
| `WS_BETA_GRANT_MODE` | `legacy` | `.env.example` default (roster boolean admits) |
| `WS_PRO_GATE_ENABLED`, `WS_FREE_WORK_LIMIT_ENABLED`, `WS_FREE_ADMISSION_ENABLED`, `WS_PRO_TASTE_ENABLED`, `WS_PRO_ASK_ENABLED`, `STUDIO_HOLDINGS_ENABLED` | `false` | `.env.example` defaults |
| `WS_MAIA_METER_MODE`, `WS_STANDING_ENABLED`, `NEXT_PUBLIC_WS_STANDING_ENABLED` | unset | off by default |

`NEXT_PUBLIC_*` values are inlined by the dev server at compile time; `run.sh` sets them before the server starts.

## Persona P1: the first-timer (`personas/p1-first-timer.mjs`)

An adult with an idea and no manuscript, newly invited. Rows:

- `P1-01` signs in through the **real sign-in form**. Every per-press member signs in the same way (not by calling the API alone):
  the form also writes the client-side session cache (`localStorage.memberId`), and some of the product, such as the "Report a
  bug" launcher, appears only when it is set, so an API-only sign-in would walk a different page from a real member's.
- `P1-02` Studio opens (not bounced to sign-in or the invitation page) and Home renders real text.
- `P1-03` zero Works, from the server's own list endpoints, and Home shows no Works list.
- `P1-04` every control visible on Home is listed (buttons, links, disclosures, switches).
- `P1-05.*` each control pressed by a new member. Depth 1 is Home itself. If a press opens a menu or changes the studio view, the
  controls it revealed are pressed too (depth 2, replaying the parent press), and the contents of a menu opened at depth 2 or
  deeper are pressed (depth 3 and 4, only through menus). Each row names its path, for example
  `Home › button “I already have pages” › disclosure “Writing preferences” › disclosure “About Studio access”`.
- `P1-06` every control given a row is **accounted for**: pressed, or listed with why it was not (disabled, points off the product, could not
  be found again, its click was refused, the trial cap was hit). The report header says how many controls were **pressed** (a click was
  delivered to them: `Controls pressed`) and, separately, how many were found and not pressed (`Controls found, not pressed`) and how many
  controls a press revealed that never got a row at all (`Revealed by a press, never given a row`): because of the depth limit, or because the walk descends only into a press that opened a disclosure, or at depth 2 into one that revealed three or more controls. The row
  says "each ... was pressed" only when that is true.
- `P1-07` the study's `/writers-studio/plans` link (“Free and Pro”, under Writing preferences) leads to a page that renders.
- `P1-08` the four mode buttons (Write, Develop, Review, Publish) each lead somewhere from the zero-Works studio view.

How a press is judged (`lib/classify.mjs`, pure and unit-tested): HTTP status is never enough. A link to a page that answered 200
but rendered under 40 characters, or rendered the framework's "This page could not be found", is a DEAD END. A link whose target
answers 4xx/5xx is a DEAD END even if the client rendered something. A press that changes no URL, text, aria state, dialog, control
count and starts no request of its own within about three seconds is a DEAD END (unless it is the already-selected choice of a toggle, or it opens
the browser's own file chooser, which changes no DOM). A press that sends a request which fails is a DEAD END.

**A press is credited only with what it caused.** Before a control is pressed the page is waited on until it is *still*: same address,
text and controls for 0.8 s and no same-origin fetch/xhr in flight (the persona's tracker watches from the first request, so one an
earlier press started is still known; the longest wait is 20 s). If it never settles the press is made anyway and the row is **NOT RUN**
("pressed while the page was still moving"), never PASS and never DEAD END, because whatever lands next may be the earlier press's.
And a request counts as the press's only if it **started** after the press began and no more than 500 ms (`ATTRIBUTION_MS`) after the
click was delivered. A request the page made on its own (started before the press, started long after it, or whose start the harness
did not see) is set aside; a DEAD END row names what was set aside. Why: in the run of record the same inert button was PASS in one
replay (the import room's own fetch answered during the window) and DEAD END in the next, and "Home" was credited with the
navigation of the "Just let me write" press that preceded it (row P1-05.09.01).

After the press the walk keeps watching while a request is still in flight (a cold `next dev` compiles an API route on its first call): a screen that says "listening…" is not an
outcome, and a request still pending after 60 s leaves the row NOT RUN. A **disabled** control is NOT RUN (its precondition is unknown to
the harness; "disabled until you choose" is not a defect) unless it states why, which is a PASS: some text on it (its `title`, an
`aria-description`, a described-by element) that is **not merely its own name**. The text is compared, ignoring case and spacing, with
the control's label, `aria-label`, visible text and value, each **whole** (the 80 characters of a label that a row shows are for reading, not
for comparing: a title repeating a longer name would otherwise look different from it); a `title` that repeats any of them explains
nothing and the control stays NOT RUN. (A text that merely *contains* the name, "Save is available once you have written something", does count as an explanation.)
A disabled control is not pressed, so it counts under `Controls found, not pressed`. A control that needs a model is NOT RUN.

## Limits (read before trusting a PASS)

- **A PASS means "it led somewhere that rendered", not "it was good, honest or kind".** The harness cannot judge MAIA's conduct,
  the felt experience, or whether where a door leads is right. A DEAD END may be an intended "not yet" state; the row stays DEAD
  END until the product says so in a way a person can read. That question is the product's, not the harness's.
- **Slice 1 has no MAIA step.** No model is called; a control that needs one is NOT RUN. Writing, saving, adopting an edit,
  revision, undo, export and publishing are not walked.
- **One persona, first-visit Home only**, up to four presses deep (`MAX_DEPTH` is 4 in `personas/p1-first-timer.mjs`; `lib/readme.test.mjs`
  fails if this number and the code differ). Controls a press reveals beyond that depth, or that the walk does not descend into (see P1-06), are counted in the report header, not pressed. Nothing about a returning member, a member with Works, a
  novelist or a memoirist.
- **Development server, not a production build.** Compile-on-first-request makes the first presses slow, and dev-only behaviour
  can differ from `next start`. The harness removes Next's `<nextjs-portal>` dev element (it sits over the bottom-left corner and
  swallows clicks on whatever is under it, including the "Beta journey" button); a click intercepted by anything else is scored as
  the product's.
- **Attribution is by time, not by cause.** A request that the page makes on its own *and that starts within 500 ms after the click*
  (a poll that happens to tick then) is still credited to the press; the harness cannot see which code issued a request. Conversely
  a handler whose only visible effect is a request that starts more than 500 ms after the click reads as DEAD END, with the request
  named in the evidence: a false DEAD END is loud and gets a human look, a false PASS would hide a dead door. A navigation that
  lands more than 0.8 s after everything else has been quiet, with nothing in flight, is not detectable either.
- **Replaying a path can fail.** Each press replays its parent presses from a fresh Home. Once in 95 presses of the run of record a parent
  control did not reappear in time; that row is NOT RUN with the reason, never PASS, and never a DEAD END. A re-run decides it.
- **Schema is not the production schema**: pgvector-backed tables are absent, so any surface that reads them is not exercised.
- **Flags may differ from production** (see above).
- **Fictional data only**, one fixed fictional password for throwaway members whose database is destroyed.
- Not wired into CI: it needs a PostgreSQL server and a browser. Run it by hand on a Studio-path change.
- The existing `tests/e2e/writers-journey` (WJ-1) is separate and still not referenced by any CI workflow. `--wj1` runs it on this
  stack so it can be re-greened here; its own `run-journey.sh` (Docker + production build) is unchanged.
