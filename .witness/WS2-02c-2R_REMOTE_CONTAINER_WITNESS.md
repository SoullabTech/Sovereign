# WS2 02c-2R — Remote-Container Runtime Witness (evidence record)

**This branch is an instrument and evidence carrier. It is never the runtime
object being witnessed.** Nothing here is application code, and no witness run
may be hosted from a checkout of this branch. The witnessed product SHA is
`58ac95a779278bda427fb869aa188e618442d756` and only that SHA.

---

## Classification (as adjudicated)

```text
02c-2R IMPLEMENTATION VERDICT      PASS — repair verified at runtime
02c-2R CANONICAL SUCCESSOR WITNESS NOT YET EXECUTED — the Mac Studio charter
                                   target was not the host of this run
REMOTE CONTAINER WITNESS           PASS — independent cross-host corroboration
                                   at 58ac95a77; NOT substituted for the
                                   Mac Studio charter witness
```

The custody deviation is recorded, not laundered. The chartered successor
witness object at `/private/tmp/ws2-02c-2r-runtime-witness` on the Mac Studio
was never run. This record corroborates the repair from a second host; it does
not stand in for that run.

---

## The instrument

| file | sha256 |
|---|---|
| `.witness/seed.ts` | `7c7988745011b52058be4a51f4b96a710971e723d28eadeffd902a76c16bdbe1` |
| `.witness/browser-witness.mjs` | `8ac90d297c5f1eaec3cf5f5e38de29bc3e86733759cf332d037d6aa492d58364` |

`seed.ts` creates a synthetic member, an `auth_sessions` row, a manuscript, a
section-addressable working draft with 14 sections, and ONE
`manuscript_structure_proposals` row carrying `adversarialReading`, through the
repo's own `proposalStore.createProposal`. It reads no real member's Work.

`browser-witness.mjs` drives real Chromium at the real
`/writers-studio/review?m=&p=` route, sets a real `maia_session` cookie, lets
the real `GET /api/sovereign/manuscripts/{m}/structure/proposals/{p}` answer,
captures console/pageerror verbatim, then clicks the first
`[data-mark-question]` — the gesture that runs `takeUpMark`, the callback the
defect had misplaced. It observes only.

Nothing in the surface, its client, or its server route is stubbed.

---

## Reproducing on the Mac Studio (confirmation run)

The witness worktree stays detached at the product SHA with a clean tracked
tree. Fetch the instrument branch; **do not switch to it.**

```bash
cd /private/tmp/ws2-02c-2r-runtime-witness
mkdir -p .witness

git fetch origin claude/ws2-02c-2r-witness-ltdfvw

git show origin/claude/ws2-02c-2r-witness-ltdfvw:.witness/seed.ts \
  > .witness/seed.ts
git show origin/claude/ws2-02c-2r-witness-ltdfvw:.witness/browser-witness.mjs \
  > .witness/browser-witness.mjs

shasum -a 256 .witness/seed.ts .witness/browser-witness.mjs
git rev-parse HEAD          # must be 58ac95a779278bda427fb869aa188e618442d756
git status --porcelain      # tracked must be clean; .witness/ untracked only
```

Required shape for the canonical witness:

```text
HEAD      58ac95a779278bda427fb869aa188e618442d756
detached  YES
tracked   CLEAN
instrument bytes match the two sha256 values above
```

Then:

```bash
export DATABASE_URL=...            # a scratch database, migrations applied
npx tsx .witness/seed.ts           # prints m / p / sessionToken as JSON
npx next dev -p 3100
node .witness/browser-witness.mjs http://127.0.0.1:3100 <m> <p> <sessionToken>
```

`browser-witness.mjs` pins `executablePath` to the container's Chromium; on the
Mac Studio point it at that host's Chromium. That is the one line expected to
differ, and it is a host binding, not a change to what is witnessed.

---

## Result of the remote-container run

Host: remote Sovereign container. Worktree: `/home/user/ws2-02c-2r-witness`,
detached at `58ac95a779278bda427fb869aa188e618442d756`, tracked tree clean
(`git status --porcelain` excluding untracked = 0).

```text
http_status                 200
structure_review_present    true      data-form="mixed"
loading_state_present       false     (loading -> loaded completed)
mark_question_count         3
mark_open_count             8
review_map_present          true
inspector_present           true
marker click                inspector "p3", [data-ask-maia] mounted = 1
hook_faults                 []
page_errors                 []
console_errors              only the dev-server HMR websocket
```

Marks carried the 02c-2 label, e.g.
`Talk with MAIA about her question: Where does the first element begin?`

### Negative control — same instrument, same database row, same browser

Host: same container. Worktree detached at `17c8a3d29` (the repair's parent).
Only `StructureReview.tsx` differs.

```text
structure_review_present    false
mark_question_count         0
body text                   "Something Went Wrong / An unexpected error has occurred."
hook_faults                 React has detected a change in the order of Hooks
                            called by StructureReview ...
                              19. useState   useState
                              20. useMemo    useMemo
                              21. undefined  useCallback
console_errors              "The above error occurred in the <StructureReview>
                             component. It was handled by the
                             <ErrorBoundaryHandler> error boundary."
```

The control is what makes the positive result discriminating: the instrument
reproduces the predecessor failure exactly when pointed at the pre-repair tree.

### Secondary gate, in the pinned tree

```text
PASS app/writers-studio/canvas/__tests__/structureReviewLifecycle.test.ts
Tests: 3 passed, 3 total
```

---

## Standing instruction for adjudicating the Mac Studio run

A Mac Studio FAIL is **not** pre-classified. The remote PASS establishes that
`58ac95a77` can behave correctly under one real runtime; it does not exclude a
platform-dependent implementation defect. A failure there must be classified
from its own evidence, and implementation behaviour stays on the table
alongside host-environment behaviour and witness-object divergence.
