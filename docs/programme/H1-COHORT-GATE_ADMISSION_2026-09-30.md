# H1 Cohort Gate — Canonical Admission Witness

**Programme day:** 2026-09-30
**Witnessed:** 2026-10-01
**Governing law:** `H1-EXPOSURE_CENSUS_AND_RULINGS_2026-09-30.md` §4
**Implementation PR:** #1551
**Canonical witnessed:** `3421a2096c3afcce617a394bca1ffe246171f39f`
**Origin witnessed:** `http://localhost:3100`
**Standing:** ✅ H1 ADMITTED TO CANONICAL · production deployment is separate

> H1 governs only explicit Work-context arrival from the House into Writer's
> Studio. It does not gate Writer's Studio, Works, manuscripts, H1-R2 choice,
> or the House threshold generally.

## 1 · Candidate identity

PR #1551 merged the exact H1 cohort-gate candidate:

```text
base       cc1c5b4d79793dd7911d6aea0054e8c678d01bcb
PR head    ad7b2d3ea2fe38bee85b3671ffd5fae6ba4cdc96
merge      3421a2096c3afcce617a394bca1ffe246171f39f
canonical  3421a2096c3afcce617a394bca1ffe246171f39f
```

All current required PR checks were green at merge. An earlier covenant-gate
failure on the same head was procedural — classification was absent — and was
superseded by successful reruns after the PR was classified Class A.

## 2 · Why the earlier H1 witness is not this admission

An older unmerged docs commit, `62dc1d0a6`, recorded a post-#1540 browser
walk at canonical `89f7876e8` and called H1 admitted.

That walk remains useful evidence that #1540 repaired the failed-read hang and
duplicate-on-Begin risk. It is **not sufficient admission evidence under the
later canonical #1544 law**, because `89f7876e8` had no H1 cohort boundary.

This record supersedes that admission claim. The governing question now has
two populations, and both are witnessed below.

## 3 · Witness environment

The walk used a fresh detached worktree at the exact canonical merge SHA.

Before the walk:

- the #1539 server on port 3139 was stopped;
- port 3100 was the only H1 witness server;
- each population used a new isolated Playwright browser context;
- each context began with zero `localhost` cookies;
- authentication used the repository's development-only
  `/api/auth/dev-login` path;
- no production credential, cookie or member identifier was extracted or
  recorded in this evidence.

The local database schema check reported 554 migrations and all expected
columns/tables present.

The H1 server authority was configured locally with the switch enabled and one
existing local member explicitly admitted. A second existing member with a
Living Work was deliberately absent from the cohort. No member ids are
preserved in this record.

A fresh worktree reused an existing dependency installation by filesystem
symlink. Turbopack rejected that out-of-root symlink before serving the app, so
the exact same canonical source was served with Next's Webpack dev bundler.
No source, configuration law, database content or H1 implementation was
changed to obtain the witness.

## 4 · Server-authority precheck

Before the browser walk, authenticated requests established the two states:

```text
admitted witness member      → {"admitted":true}
non-admitted witness member  → {"admitted":false}
```

Both answers came from `GET /api/house-studio/admission` on the same running
canonical build.

## 5 · Two-population admission matrix

| Boundary | Admitted member | Non-admitted member |
|---|---|---|
| Visibility | House `Writing →` emitted `/writers-studio?from=house&work=…` | House `Writing →` emitted plain `/writers-studio` |
| Non-exposure | contextual H1 arrival was available | plain Studio had no H1 arrival; a manually typed valid own `work=` claim also produced no H1 arrival |
| Crossing | House carried only `from` + `work`; Studio resolved the declared Work and required an explicit open gesture | server stayed `admitted:false`; supplied Work identity had no arrival authority |
| Return | House membrane remained through Write → Develop → Review; Return Home landed on plain `/home` | ordinary Studio/return behavior remained available |

## 6 · Admitted-member browser witness

The admitted member had one living Work with one declared manuscript.

1. Home rendered the real WHAT'S ALIVE doorway.
2. Its Writing link contained exactly two claims: `from=house` and `work`.
3. Following it settled as `data-arrival="one"`.
4. The arrival did **not** enter the manuscript automatically. The member-facing
   `Open Writing Studio` gesture was present and required.
5. After that gesture, Write carried the same `from=house`, `work` and
   manuscript identity.
6. Develop preserved them.
7. Review preserved them.
8. The House return membrane remained present.
9. `Return Home →` landed on `/home` with an empty query string.

The crossing therefore carried the Work the member pointed at and nothing
interpretive. Visibility conferred orientation, not meaning-making authority.

## 7 · Non-admitted-member browser witness

The non-admitted member also had a real local Living Work.

1. `GET /api/house-studio/admission` returned `{"admitted":false}`.
2. Home emitted plain `/writers-studio`, with no `from=house` and no
   `work=`.
3. Following the real House link reached ordinary Writer's Studio with no H1
   arrival surface.
4. A stronger bypass attempt then manually supplied the member's **own valid
   Work id** in a House-shaped Studio URL.
5. The URL claim could remain visible as inert address text, but the Studio
   produced no `data-arrival` state and the server still returned
   `{"admitted":false}`.

That distinguishes URL cosmetics from authority: a non-admitted member cannot
mint H1 context by typing a valid Work claim.

## 8 · H1-R2 / no-silent-choice standing

The local corpus did not contain a single Work with two or more declared
manuscripts. No synthetic relationship was created merely to make the browser
fixture fit that case.

The browser witness therefore makes only the narrower direct claim: even the
one-manuscript H1 arrival required the member's explicit `Open Writing Studio`
gesture before entering the manuscript.

The universal multi-manuscript law remains carried by #1538 and the H1
regression set that passed before #1551 merged. This admission does not weaken
or replace that evidence.

## 9 · Admission ruling

**H1 is admitted to canonical at `3421a2096`.**

The evidence now supports both sides of #1544 §4:

- admitted members may carry explicit Work context from House to Studio;
- non-admitted members receive plain Studio entry and cannot acquire H1 Work
  authority by typing `work=`;
- Writer's Studio and member material remain universal;
- the server is the admission authority;
- the client reflects that answer and fails closed;
- return remains a doorway, never a content-carrying reverse channel.

This is an **admission claim, not a production deployment claim**. At the time
of this witness production still reports `cc1c5b4d7`. Advancing production to
the H1-gated canonical SHA requires its own environment and runtime provenance
witness.

#1539 also remains a separate obligation on
`http://127.0.0.1:3139`; this admission does not consume or replace it.
