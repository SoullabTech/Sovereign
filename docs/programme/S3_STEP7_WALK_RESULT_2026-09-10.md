# S3 · Step 7 — acceptance walks · result

**Date:** 2026-09-10 · **First run:** `48 passed · 2 failed` · **After the F1/F2 repair:** `51 passed · 0 failed`
**Both failures are findings in the recognition layer. Neither is an authority defect.**
**Nothing was repaired during the walk.**

## W0 — the subject of this record

```
application SHA   : 25cd830890ad32838c3633e7743a6af23186fe4d   (working tree clean)
database          : maia_consciousness as soullab on :5433 · UTF8 · 464 migrations
fixture           : tag e2b18d03 · work 2fc6ee6c… · reading ae7d241d…
server            : http://127.0.0.1:3100 · /api/health ok
work geometry     : dc8a779ad8a9d3d8fda358d0d1601b49
```

Qualification of the database: `docs/programme/S3_STEP7_WALK_DB_QUALIFICATION_2026-09-10.md`.
Scope: a repository-derived database sufficient for the Writer's Studio / S3
path; no claim is made about the 16 unrelated migration lanes.

## What passed

| | |
|---|---|
| **structure-only Ask** | no pause, no `pendingAskRef`, no sections offered |
| **body Ask** | pauses at `BODY_AUTHORITY_REQUIRED`, names exactly the required section, resumable ref, **crosses nothing** |
| **the act** | accepted, resumes the SAME thread, one receipt, section-scoped, `crossed`, on `writers_studio.ask->maia_developmental` |
| **double press** | same `actId` → `ACT_ALREADY_PROCESSED` with a truthful `completion`; **no second crossing** |
| **a different act on a spent claim** | `ALREADY_CONSUMED` — the two are distinguished, and both refuse identically |
| **partial authorization** | `BODY_SCOPE_INCOMPLETE`, outstanding section named, **nothing crossed — not even the section that WAS authorized**, ref not spent |
| **multi-section** | one act → **two receipts sharing ONE `request_ref`**, each `scope_kind='section'` with its own `section_ref`, both `crossed` |
| **client display metadata** | a client-asserted section, heading, label, `bodyRequired:false` and `allowBody:true` changed nothing; the server re-derived the required set and refused |
| **continuity failures** | unknown → **404 `unknown`** · expired → **410 `expired`** · malformed act **not** downgraded to an ordinary Ask · another member → **404 `not_found`** |
| **the sixth state** | consent substrate made genuinely unavailable → `DISCLOSURE_UNAVAILABLE`, `actSpent: true`, **no receipt crossed**, and the claim really is spent in the record |
| **no structure unit** | `heading: null` — the server invents nothing — and `label: "Section 5"` |
| **never a UUID** | no label anywhere is or contains one |
| **R1 · Work geometry** | `dc8a779a…` at open, `dc8a779a…` at close — opening, pausing, authorizing, double-pressing, failing and completing moved nothing |

The single-consumption law held under every shape it was pressed on: the same
act twice, a different act on a spent claim, a partial act, an expired claim, an
unknown ref, and a boundary failure after the claim was taken.

## Finding F1 — two sections in one structure unit are indistinguishable

**Walk 7e.** An authorization request for two distinct sections that live inside
the same structure unit:

```
c070de10-c181-4403-aa23-3f253201cf39  =>  "Before the water"
cabae9c4-7351-4404-82cc-af1012a1c97e  =>  "Before the water"
```

`recognizeSections` titles a section by the unit that contains it
(`u.title AS heading`), which is deliberate and documented: `source_section_id`
is provenance only and never a source of text, so the authored title comes from
the structure lane. The consequence was not carried through. A **unit** names a
division of the Work; **sections** are finer than units, so N sections inside one
unit receive N identical labels.

The member is asked to authorize two things that read the same. *A member asked
to authorize a string they cannot tell apart from another string has been asked
to consent to something they cannot identify* — the same failure the recognition
metadata exists to prevent, one level up from the UUID case it already solves.

Visible in three walks (2d, 7e, 12c); only 7e fails, because only 7e puts two
same-unit sections in one request.

⛔ Not repaired. Repair is a design question — position-qualified labels
(`"Before the water · Section 2"`), the section's own authored heading if one can
be reached without turning provenance into content authority, or something else —
and it belongs to whoever rules on it.

## Finding F2 — the order shown is the order of the ids

**Walk 6c.** Two required sections, presented in this order:

```
shown     : 7ba786af…  cabae9c4…
work order: cabae9c4…  7ba786af…
```

The recognition query ends `ORDER BY s.position ASC`, but `recognizeSections`
re-keys the result by the **input** order (`sectionIds.map(...)`), and the input
is `requirement.requiredSections` = `[...required].sort()` — a lexicographic sort
of UUIDs. The `ORDER BY` is therefore dead, and the member is shown their own
sections in an order derived from identifiers they never see, which changes if
the identifiers change.

This is not an authority defect: the *set* is correct and all-or-none is enforced
against the re-derived set. It is a recognition defect — the request does not read
as the Work reads.

⛔ Not repaired.

## Two instrument errors, recorded rather than hidden

1. The first draft of walk 2d asserted the **source section's** heading
   (`'Arrival'`). The design never promised that; it promises an authored title
   from the structure lane. The expectation was the instrument's, not the
   system's, and was corrected. What the arrangement actually costs is measured
   at 7e instead.
2. The first draft of walk 11b tried to age a claim with
   `UPDATE pending_ask_claims SET expires_at = …`. `pending_ask_claims_forward_only()`
   **refused it** — lifetime is immutable. That refusal is the substrate behaving
   correctly. The expired claim is now seeded with both timestamps in the past,
   since `expires_at > created_at` is a lifetime invariant, not a freshness one.

## One limit of this environment

No `ANTHROPIC_API_KEY` is present, so the model call at the end of ACT 3 cannot
run. Every constitutional act — claim, boundary, W2 enforcement, receipts,
completion — happens before it and was walked. The terminal `BODY_AUTHORIZED`
payload with MAIA's answer text was **not** observed, and no walk claims it was.
The walks assert that the protocol *leaves* the authorization states and that the
crossings are recorded correctly, which is exactly what is decidable here.


---

# Addendum — F1 / F2 repaired, 2026-09-10

Recognition-layer repair only, on founder ruling. No authority, protocol, act
identity, cardinality or geometry behaviour was touched.

## F1 — every offered section is distinguishable

`labelFor` now qualifies the authored title with the section's canonical place.
`heading` is unchanged: authored-or-null, never invented.

```
heading = "Before the water"   label = "Before the water — Section 1"
heading = "Before the water"   label = "Before the water — Section 2"
heading = "After"              label = "After — Section 4"
heading = null                 label = "Section 5"
```

The qualification is **unconditional**, not applied only when a request happens
to contain a collision: the label is a pure function of `(heading, position)`, so
a section reads the same whatever else is in the request. A section whose name
depended on its company would not have a name.

Distinctness is **structural**: `manuscript_draft_sections` holds
`UNIQUE (draft_id, position)`, so two sections of one draft cannot yield one
label. The falsifier asserts the constraint in the migration, not merely the
behaviour.

## F2 — the displayed order is the Work's order

`recognizeSections` now builds its result by walking the query rows, which are
already `ORDER BY s.position ASC`, and uses the input set for **membership only**.
The previous `sectionIds.map(...)` re-keying discarded that ordering, and the
input is `[...required].sort()` — a lexicographic sort of UUIDs, lawful for
normalizing a set and with no authority over how a Work is presented.

## F3 — found by the F2 falsifier, in the branch nobody looks at

The obligation *"no label anywhere asserts a canonical position derived from an
input ordinal"* failed on the **fallback** path, not the main one. When the
structure lane is unreadable the function has no canonical positions at all, yet
it labelled sections `Section 1…N` from their ordinal in the requested set —
telling the member a place it did not know. It now labels them
`Section N (unrecognized)`. Same law, same function, same construction as F2; not
a separate scope.

## Falsification

`lib/manuscript/ask/bodyGate/__tests__/sectionRecognition.test.ts` — **23 passed**.
Against the pre-repair implementation (`git show HEAD:…`), **7 fail**: the label
composition, all three F1 distinctness obligations, and all three F2 ordering
obligations. Source restored byte-identical afterwards.

`__tests__/askRouteBodyGate.test.ts` — **18 passed**. Eleven of these were red
**before** this repair and not because of it: they built authorization acts
without an `actId`, stale since that field became required. Confirmed
pre-existing by running them at `HEAD` with the repair stashed. They now supply
an act identity, and the suite asserts that an act without one is not an act.

`npm run typecheck` — no regressions.

## Step 7 walks, re-run

**`51 passed · 0 failed`**, including 6c and 7e. R1 geometry unchanged.

## Standing

```
authority / protocol walk      PASS
R1 geometry                    PASS
recognition                    PASS  (F1 · F2 · F3 repaired and falsified)
terminal model continuation    NOT WITNESSED — environment has no model credential

overall                        OPEN — one gate remains
```

The remaining gate is a real authorized Ask running through the model, with
`BODY_AUTHORIZED` returning into the same MAIA conversation. It needs a model
credential this environment does not have.

---

# Addendum 2 — the terminal gate, and where Step 7 stops

## Standing

```
STEP 7

authority / protocol            PASS
single / multi-section          PASS
act identity / replay           PASS
continuity truth                PASS
recognition                     PASS   F1 · F2 · F3
Work ordering                   PASS
R1 geometry                     PASS

terminal cognition gate         NOT WITNESSED — no model credential here

walk result                     51 passed · 0 failed · 1 NOT WITNESSED
overall                         OPEN
```

**Step 7 stops here.** No provider bypass was added, no seam was mocked, and the
final obligation was not turned green.

## Walk 13 exists and is unwitnessed, which is not the same as absent

The gate is written and committed. It runs only when a real model credential is
present in the environment. Without one it reports **NOT WITNESSED** — carried
separately from passes, named in the summary, and never simulated. An instrument
that can satisfy its own question by declining to ask it has tested nothing, so
an unwitnessed obligation never discharges, and `--require-cognition` makes it an
exit failure.

```
model credential : ABSENT
provider call    : not attempted
inference mode   : primary (default)
credential value : NOT RECORDED
```

## What it will observe — three things, not HTTP 200

| | |
|---|---|
| **real cognition happened** | MAIA's turn carries `answerProvenance` from the canonical model path, with a model named; the answer is her own words, not an echo of the question |
| **the protocol finished truthfully** | `BODY_AUTHORIZED`, carrying the `disclosedSections` and `withheldSections` it actually used, and `unverifiableEvidence: 0` |
| **the writer stayed in the same conversation** | the same `threadId` returns — no second Ask, no new destination, no reset — and the thread has grown by the author's question and MAIA's answer |

Plus: it pauses for authority first, and the crossings that carried it are
recorded as `crossed`.

## To run it

Requires, through the normal environment/secret mechanism:

- `ANTHROPIC_API_KEY` — a legitimate development credential. `new Anthropic()`
  in `lib/ai/structured/anthropicStructuredAdapter.ts` reads it from the
  environment. **Never** committed, never in the fixture, never in this record.
- `MAIA_INFERENCE_MODE` unset or `primary` (`lib/ai/structured/policy.ts`).
  `local_only` refuses: there is no local structured provider.

```bash
# one terminal — the real server, pointed at the walk database
DATABASE_URL=postgresql://…/maia_consciousness npx next dev -p 3100

# another — seed a fresh fixture, then walk, with the credential in the env
DATABASE_URL=…  npx tsx scripts/witness/s3-step7/seed.ts fixture.json
DATABASE_URL=…  ANTHROPIC_API_KEY=…  \
  npx tsx scripts/witness/s3-step7/walk.ts fixture.json --require-cognition
```

The database must first be qualified —
`docs/programme/S3_STEP7_WALK_DB_QUALIFICATION_2026-09-10.md`.

## A note on the eleven repaired tests

The eleven `askRouteBodyGate.test.ts` failures repaired alongside F1/F2 were
**pre-existing**, caused by ACT 3 fixtures omitting the now-required `actId`,
and confirmed as such by running them at `HEAD` with the repair stashed. They are
**not** discrimination evidence for the recognition repair and must not later be
cited as such. The evidence for F1/F2 is the **seven** obligations in
`sectionRecognition.test.ts` that fail against the pre-repair implementation.

---

# Addendum 3 — the terminal gate PASSED

**Run:** founder's machine, 2026-09-10 · **`59 passed · 1 failed`**

## W0 — the subject

```
application SHA   785dab0de1ef274cee55c632e6c3fab1fee4a9ab
database          maia_consciousness · soullab@:5432 · UTF8 · 526 migrations
qualification     VERDICT: QUALIFIED · 0 failed migrations · 16 closure relations
fixture           tag fc1e90b6 · work d56a7d93… · reading a2721e14…
server            real `next dev` on :3100 · /api/health ok
work geometry     5f763add36bd4f35e2c1ab17ad67d9ec
model credential  PRESENT via development environment
provider call     REAL
inference mode    primary (default)
credential value  NOT RECORDED
```

## Walk 13 — every obligation met

```
13a it pauses for authority first                                  PASS
13b the protocol reaches BODY_AUTHORIZED                           PASS
13c it reports the disclosed and withheld scopes it actually used  PASS
13d no evidence went unverified                                    PASS
13e MAIA's turn carries answer provenance from the canonical path  PASS
13f the answer is MAIA's own words, not an echo                    PASS
13g the answer returned into the SAME thread                       PASS
13h the thread grew: author's question AND MAIA's answer           PASS
13i the crossings that carried it are recorded as crossed          PASS
```

The three things the gate existed to observe, all three observed: **real cognition
happened** (provenance from the canonical model path, words that are not an echo),
**the protocol finished truthfully** (`BODY_AUTHORIZED` with the scopes it actually
used, zero unverified evidence), and **the writer stayed in the same conversation**
(same thread id, thread grown by both turns).

Walks 1–12 and R1 passed in the same run, on the same database and server.

## The one failure, stated precisely

`W0 the working tree is clean` — FAILED. Every entry in the reported list carries
git's `??` prefix: `.jarvis/`, `data/vault/`, `maia-jest-cache/`, a stray `55`,
`scripts/witness/local-fonts-production-witness.mjs`,
`scripts/ws2-07d-seed-v2-decline-fixture.ts`, one docs file. **All untracked. No
tracked file differs from `785dab0de`**, so the application that ran is that
commit.

The check is correct to fail — it cannot distinguish untracked scratch from a
modified source file, and a check that guessed would be worse than one that is
strict. Recorded as a hygiene failure, not a protocol one, and the SHA
attribution stands on the tracked-file fact rather than on the check.

## What it took to get here — three environment defects, none in the protocol

1. **Two `ANTHROPIC_API_KEY` lines in `.env.local`.** `grep … | cut` glued them
   with a newline into a 217-character header value; curl refused it (error 43)
   and the SDK failed the same way. One line, 108 characters, fixed it.
2. **`read -p` is bash syntax.** macOS runs zsh, where it means something else —
   the prompt never appeared.
3. **The qualification witness shells out to `psql`**, which reads `PG*`, not
   `DATABASE_URL`. It should read the connection string.

## A finding that stands regardless

While diagnosing (2), the failure was invisible from outside: `router.ts` captures
the provider's real error into `detail`, and `developmentalAskReader.ts:207`
discards it — `if (!outcome.ok) return { ok: false, refusal: 'unreachable' }` —
with a bare `catch` below it and no logging. A genuine terminal-cognition failure
surfaces as one word with no cause. **The last boundary is the one that cannot be
diagnosed.** Not repaired; recorded.

## Also recorded: the witness damaged a live database

Walk 12 tests the sixth state by renaming `runtime_consent_state` and renaming it
back in a `finally`. Written for a disposable cluster; run, on this session's
instructions, against the founder's working dev database. An interrupted run left
the table renamed and every request 503-ing until repaired by hand. Nothing was
lost, but the fault injection is not crash-safe and should not point at a database
anyone uses. Repair not authorized here.

## Standing

```
authority / protocol walk      PASS
R1 geometry                    PASS
recognition                    PASS   F1 · F2 · F3
terminal cognition gate        PASS   real model, BODY_AUTHORIZED, same thread

walk result                    59 passed · 1 failed (untracked-files hygiene)
```
