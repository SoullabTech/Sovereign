# WS2-07 · BUILD-07D — DEVELOP SURFACE · witness record

> **⚠ AMENDED 2026-09-04 — MERGED / NOT ACCEPTED.** This candidate reached canonical as
> `e0803660` (PR #1192, merged by the founder 2026-09-04T19:24Z) **before** the closure rule below
> was satisfied. The merge is placement, not adjudication: BUILD-07D is **not accepted**, and
> canonical presence does not confer acceptance. All eight 07D surface blobs on canonical
> `cf6ce3cef` are byte-identical to `d005d59eb`, so Gate A carries unchanged; Gate B remains
> UNPROVED. Full reconciliation, forward blockers and the path to a lawful acceptance:
> **`WS2-07-BUILD-07D_MERGE_RECONCILIATION_2026-09-04.md`**. The record below is preserved as
> written at candidate time and is not rewritten.
>
> **Candidate `d005d59eb` on `claude/writer-author-studios-roadmap-b2tqf5`, built against canonical
> `376daae06` (BUILD-07C merged, PR #1191). Opening record `3ed788b3b` is the first commit on the
> branch. Gate A PASS — 22 checks · 0 failures on the candidate checkout. Gate B PENDING — the
> founder's live walk. NOT CLOSED.**

```text
UNIT        BUILD-07D DEVELOP SURFACE
LANE        JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01 (dated 07D block, 2026-09-04)
CANDIDATE   d005d59eb  (feat: Develop surface — the writer encounters a frozen reading)
AGAINST     376daae06  (07C reading unit; its blobs unchanged since 8a26a8971)
GATE A      scripts/ws2-07d-develop-gate-a.ts  → 22 / 0 on checkout d005d59eb   PASS
GATE B      scripts/ws2-07d-develop-gate-b.ts  + founder browser walk (§3)     PENDING
STATE       STRUCTURALLY PROVED · NOT CLOSED
```

## 1 · What was built — the enumerated unit

The founder's 07D act authorizes a member-facing surface over **already frozen** readings and the
wiring strictly necessary for it. The candidate is exactly that, and the invariant it must keep is
the one the opening names: *the surface encounters an already durable reading; identity does not
originate in UI and does not disappear when UI closes.*

```text
app/api/sovereign/manuscripts/[id]/readings/route.ts
    GET   the member's readings of this Work — summaries, newest first (07C listReadings)
    POST  ONE commission under ONE lens. The body may carry `lens` and nothing else; a
          body naming scope, sections, text or an observation is refused (400 foreign_field).
          The server derives the scope: every section of the addressable draft at body
          depth; authored structure supplied iff any authored unit exists. A refusal at any
          stage returns {refusal, stage, detail} with a status by stage (404 · 409 · 422 ·
          503 · 500) and stores nothing (07C). 201 returns {readingId, outcome,
          observationCount, frozenAt} — never the reading.
app/api/sovereign/manuscripts/[id]/readings/[readingId]/route.ts
    GET   the reading AS STORED (07C loadReading, member-scoped; the path's Work must be
          the reading's own) + the three-state assessment (07C assessReading over 07A
          loadLiveWork — nothing re-anchored) + the current sections' ids and headings for
          labels. GET only; no PUT, PATCH or DELETE exists on a reading anywhere.
    Ownership is IN every query. Both routes issue SELECT only.
lib/writersStudio/developPresentation.ts   pure — the words beside a reading
    section numbers from the FROZEN topology (never the current order); the member's
    heading only where the section still exists; divisions from the frozen structure
    context inline in the readState; every EvidenceRef kind and every `moved` kind
    described; limits = non-conclusion name + its ratified meaning; observation text
    carried VERBATIM (`observation: o.observation,` — asserted by pattern); CURRENT /
    SUPERSEDED / UNMEASURED with their own sentences; a missing assessment row is
    UNMEASURED, never current; nothing filtered, sorted or ranked.
lib/writersStudio/developClient.ts         three calls; the commission sends {lens} only;
                                           no poll, no timer, no refetch on focus
app/writers-studio/develop/{page,DevelopRoom}.tsx   the room
    ?m=<manuscript>&r=<reading> — the reading's identity is in the URL and survives the
    room. Ledger of readings (lens · when · count / "nothing to report"); the selected
    reading: lens + meaning, when · version · coverage · structure supplied, provenance
    (reader version · model · classifier version), reading state; each observation in
    its own place with key, phenomenon, state chip, VERBATIM text (pre-wrap), "Rests on",
    "Does not establish", and — when superseded — what moved. `none` renders as a
    complete reading. The invocation: one lens (seven, each with one line), one button,
    the sentence "Nothing changes unless you change it." States: signed-out door · loading
    · none yet · not found · error · refusal (member sentence + the code, small).
    Desktop: ledger beside the reading. Mobile: stacked.
app/writers-studio/canvas/page.tsx         a Develop drawer that is only a door (by identity)
app/writers-studio/studioMap.ts            DEVELOP_HREF
```

**Absent by construction** (07D DOES NOT AUTHORIZE): interpretation · questions / possibilities ·
dialogue · accept / reject / hold · revision · manuscript mutation · re-anchoring · automatic
refresh · BUILD-07E+. There is no control on the surface that changes a manuscript and none that
changes a reading; the gate `developSurfaceCannotAct` asserts each absence by text.

**Product rule, kept:** a superseded observation stays in its place, marked *Superseded*, with what
moved, in the words MAIA wrote then. It is never hidden, never re-read against the current
manuscript, never rewritten.

## 2 · Gate A — structural (2026-09-04)

Environment: this remote session's UTF-8 scratch database (`maia_07c`, baseline + canonical chain
through `20260904000001`), seam **refusing** (`MAIA_INFERENCE_MODE=sovereign`), adapter never
loaded, real route handlers called in-process with a real `auth_sessions` token, fixture member +
manuscript + section-addressable draft + two authored parts, removed afterwards. The durable
reading the surface encounters is frozen through the 07C store from a **real capture** of that
draft with a fixture reader result standing in for the reader.

```text
E0  server_encoding = UTF8
E1  the ledger opens only to a verified member (401)
E2  another member sees this Work's readings as not found (404) — no existence leak
E3  the owner's ledger is empty before any reading — "none yet", not an error
E4  a commission carries the lens and nothing else: foreign lens · client scope · client
    observation → 400
E5  seam refusing → 503 structured_inference_unavailable at stage read; nothing stored, no
    manuscript row moved, adapter never loaded; another member cannot commission (404)
E6  the ledger lists the durable reading by the id the store minted — summary only
E7  GET by identity returns the reading byte-identical to the store's own load, with a
    three-state assessment per observation and the current section labels
E8  presented: text VERBATIM (leading/trailing spaces kept); evidence named through the
    FROZEN readState with the member's headings ("Section 1 · “Arrival”, the whole section
    as read" · "Section 3 · “Tomas”, characters 0–30 as read" · "Sections 2–4, in the order
    they were read" · "The part “Before the water” and the part “After”, as they stood in
    your structure"); limits carry the ratified meaning; coverage from the frozen coverage;
    reader and classifier provenance apart
E9  another member 404 · another Work's path 404 · absent 404
E10 the writer edits Section 1 through the draft route
E11 SUPERSEDED scoped per observation: o1 (Section 1) superseded · o2 (Sections 2–4)
    current · o3 (structure) current; presented in place, VERBATIM, marked, with
    "the text of Section 1 · “Arrival” has changed"; nothing filtered
E12 the reading retained byte-identical after the edit; UNMEASURED reachable, its own state
E13 identity stable across encounters and in the ledger (INV-1, INV-3)
E14 exactly one reading row, unchanged — the surface issued no INSERT, UPDATE or DELETE

22 checks · 0 failures · checkout d005d59eb (clean tree)
```

Also green on the candidate: jest — `developPresentation` (11) · `developSurfaceCannotAct` (11) ·
readings route tests (10) · the 07A/07B/07C gates and the Studio suites unchanged (19 suites, 209
tests across `lib/writersStudio`, the readings routes, `app/writers-studio`, the reader and the
reading units); `npm run typecheck` → no regressions (the new routes and room are inside
`tsconfig.ship.json`); `tsconfig.scripts.json` → 0 errors in `ws2-07d-*`; governance checks
(no-supabase · no-direct-anthropic · provider-governance · phi-gate · design-canon) green. There is
no ESLint configuration in the repository, so lint is not a gate here.

**Two witness defects, fixed in the witness, not the candidate:** the fixture's `createUnit`
result is `status === 'ok'`, not `ok`; and E14's first form compared the row's JSONB against the
in-memory observations, which JSONB re-orders by key — it now compares against the store's own
first load, which the same check had already proved byte-identical.

## 3 · Gate B — the founder's live walk (PENDING)

Gate A proves the surface over a durable reading. It cannot prove that the writer's gesture on
the surface reaches MAIA and comes back as one. Two acts close that, both the founder's:

**(a) Headless, through the surface's own routes** — `scripts/ws2-07d-develop-gate-b.ts`, pinned
by blob id to the candidate's six surface files and the 07C unit. The script lives ABOVE the
candidate (`f2eb733ad`), so the checkout is the branch tip, not `d005d59eb`: the pins (P0) are what
bind the run to the candidate, and the run refuses if any pinned blob has drifted. Run from the Mac
worktree, the key in the shell env only, against the Mac scratch database (already at
`20260904000001`):

```bash
cd "/Volumes/T7 Shield/maia-07c-gate-b" || exit 1
git fetch origin claude/writer-author-studios-roadmap-b2tqf5 || exit 1
git checkout -q dd4783668 || exit 1          # branch tip carrying the witness; P0 pins d005d59eb
echo "HEAD: $(git rev-parse --short HEAD)"
test -n "${ANTHROPIC_API_KEY:-}" || { echo "STOP: no ANTHROPIC_API_KEY in this shell"; exit 1; }
DATABASE_URL="postgresql://soullab@localhost:5432/maia_07a_witness" \
  npx tsx scripts/ws2-07d-develop-gate-b.ts --out /tmp/ws2-07d-gate-b.json
```

*Witness-instruction defect, 2026-09-04:* the first form of this command checked out `d005d59eb`,
where the script does not exist (`ERR_MODULE_NOT_FOUND`, founder's terminal). Corrected here; the
candidate is untouched.

```text
P0  surface + reading unit + migration byte-identical to d005d59eb
F1  POST /readings (development) → 201; no manuscript row moved; ≤ 2 provider calls per act
F2  listed, newest first, as a summary
F3  loaded by identity AS STORED, every observation CURRENT; presented verbatim with every
    ref named and every limit given a meaning   (MAIA's observations are printed)
F4  Section 1 edited through the draft route
F5  SUPERSEDED scoped to observations with a TEXTUAL ref on Section 1, the rest CURRENT;
    presented in place; reading byte-identical
F6  POST /readings (voice) → a NEW reading; the first retained and listed
F7  provider calls counted where they leave the process; rows = readings frozen
```

A reader or classifier refusal (422 at `read` / `classify`) is **lawful** and is a refusal state
the surface must carry, not a defect: the witness records it and permits exactly one further
commissioned act for that slot (the 07C D11b ruling); two refusals leave the live path UNPROVED
and the run is classified, never tuned around. The record JSON carries every act.

### Run 1 — 2026-09-04, founder-run, checkout `dd4783668` — UNPROVED (lawful), classified, not rerun

```text
P0  PASS  surface + reading unit + migration byte-identical to d005d59eb
F1  act 1: 422 classifier_unclassifiable at classify   (lawful refusal — one further act permitted)
    act 2: 422 classifier_unclassifiable at classify   (lawful refusal — slot exhausted)
    ✗ UNPROVED — no reading froze, so F2–F7 could not run
F1  PASS  the surface's own commission moved no manuscript row
stopped: F1 unproved · 3 checks · 1 failure · record /tmp/ws2-07d-gate-b.json (Mac)
```

**The record's own `history`, kept as the founder asked:**

```json
[
  {"slot": "F1", "act": 1, "status": 422,
   "body": {"refusal": "classifier_unclassifiable", "stage": "classify",
            "detail": "claim 7 does not fit the v1 phenomenon family; the freeze is refused rather than a category invented"}},
  {"slot": "F1", "act": 2, "status": 422,
   "body": {"refusal": "classifier_unclassifiable", "stage": "classify",
            "detail": "claim 7 does not fit the v1 phenomenon family; the freeze is refused rather than a category invented"}}
]
```

Both acts named **claim 7** — the reader's last claim of eight. WS2-07C-F1 later recovered what a
claim in that slot says, and why it is refused: see that lane's run 1.

**Classification.** Not a 07D defect. Everything 07D owns behaved as proved in Gate A: the gesture
reached the commission through the surface's route; the refusal came back typed with its stage
(`classify`, 422); nothing was stored; no manuscript row moved. What did not happen is the thing
Gate B (a) exists to witness — a reading freezing through the surface — and it did not happen
because the 07C classifier returned `unclassifiable` on both permitted acts. That is the finding
07C's closure left open (`WS2-07-BUILD-07C_READING_WITNESS_2026-09-04.md` §3, "reliability ·
coverage · variance"), now measured a third and fourth time on the same invented fixture:

```text
07C Gate B run 3   act 1 frozen (7 obs) · act 2 unclassifiable · act 3 frozen     lens development
07D Gate B run 1   act 1 unclassifiable · act 2 unclassifiable                      lens development
                   → 3 of 5 commissioned acts on The Lantern Road refused at classify
```

**One structural difference is on record, not a diagnosis.** 07C Gate B read four sections at
body depth (w1 w2 w3 w5); the 07D route derives the scope the opening act names — the WHOLE
addressable draft, six sections, structure supplied. More sections → more claims → and 07C
refuses the whole freeze if ANY claim is unclassifiable (never a ninth phenomenon). Whether that
amplifies the refusal rate is a question for the 07C finding, and the refusal detail in the record
JSON (the claim index the classifier could not place) is the evidence to read first. Nothing in
07D may touch the classifier prompt, the phenomenon family, or the refuse-whole rule; nothing was
tuned around.

**Standing — founder ruling, 2026-09-04.**

```text
Gate A       PASS · STRUCTURALLY PROVED
Gate B(a)    BLOCKED BY 07C classifier-unclassifiable
Gate B(b)    NOT YET EXECUTABLE to completion for the same reason
STATE        NOT CLOSED
```

*"That is not a 07D failure. But it is also not enough evidence to close 07D, because the unit's
defining claim is that a writer can ask through the surface, receive a durable reading, encounter it
again by identity, and see it remain truthful after the Work changes. Gate A proves the surface
around a reading; Gate B has to prove the living path actually produces one."*

Ruled: **adjudicate the 07C finding first, then rerun Gate B (a).** Gate B (a) is not weakened, and
Gate A plus the browser walk is not substituted for a live developmental reading. Gate B (b) meets
the same wall by construction — the walk needs a reading to exist. The diagnosis is bounded in its
own lane, `WS2-07C-F1_PHENOMENON_CLASSIFICATION_COVERAGE_2026-09-04.md`. No rerun was made.

**(b) In the browser** — the member experience, which no headless run can stand in for. On the
Mac dev stack at the candidate, with the key in the shell env and `DATABASE_URL` pointing at a
database that carries `20260904000001` and a member of the founder's own with a section-addressable
draft:

```text
D1  Writer Canvas → drawer "Develop" → "Open Develop" → the room, ?m= in the URL;
    "MAIA has not read this work developmentally yet."
D2  choose a lens → "Ask MAIA to read this developmentally" → "MAIA is reading…" →
    the ledger gains one entry, the reading opens: lens + meaning · when · version ·
    coverage · provenance · state CURRENT; each observation at its key with phenomenon,
    verbatim text, "Rests on", "Does not establish"          (or: the none sentence)
D3  copy the URL (now carrying &r=) → new tab → the SAME reading, same id, same keys
D4  back in the Canvas, edit a section MAIA's observation rests on → return to Develop →
    that observation is marked Superseded with what moved, in its place, text unchanged;
    observations resting elsewhere stay Current; the reading's date and version unchanged
D5  ask again under a different lens → a second ledger entry; the first still opens
D6  sign out → the Develop URL shows the sign-in door, not an empty room
D7  narrow the window (or a phone): ledger above, reading below, everything reachable
D8  one refusal state seen honestly — e.g. with the key absent from the env, ask: the
    sentence "MAIA cannot read just now. Nothing has changed." and the small code line
```

What to bring back: the Gate B JSON, the D2 and D4 observations as shown (a screenshot each is
enough), the two URLs from D3, and anything that read wrong.

## 4 · Closure

**NOT CLOSED**, and blocked on WS2-07C-F1 rather than on anything 07D owns:

```text
Gate A       PASS · STRUCTURALLY PROVED
Gate B(a)    BLOCKED BY 07C classifier-unclassifiable   (run 1 recorded above, not rerun)
Gate B(b)    NOT YET EXECUTABLE to completion — the walk needs a reading to exist
STATE        NOT CLOSED · PR #1192 open, NOT to be merged, mentor line not written
```

The path to closure: WS2-07C-F1 diagnosis → founder determines A / B / C → repair or ruling in its
own act → rerun Gate B (a) → browser walk (b) → **CLOSED / ACCEPTED** → PR → gates → merge on green
pinned to the exact head → verify canonical → STOP. BUILD-07E is not opened by this unit's closure.

## 5 · What this record does not do

It does not claim the member experience is right — that is what §3(b) is for. It does not claim
MAIA's readings are good; 07D shows what she noticed, and the quality of the noticing is 07B's and
07C's question, still open under the `unclassifiable` finding. It does not open 07E, and it adds
no interpretation, question, decision or revision path — the surface ends where the writer's own
judgment begins.
