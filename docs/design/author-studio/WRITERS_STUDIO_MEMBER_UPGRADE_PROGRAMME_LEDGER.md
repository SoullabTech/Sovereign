# Writer's Studio Member Upgrade — Programme Ledger

> **The one durable state record for this programme.** Session narration is not state.
> If a fact about programme state is not in this file, it is not established.
> Update this file as part of the work it describes — never afterwards, never elsewhere.

```text
PROGRAM ............ WRITERS-STUDIO-MEMBER-UPGRADE-2026-08-14
OBJECTIVE .......... full member-facing Writer's Studio upgrade
OPERATOR ........... JARVIS
FOUNDER AUTHORITY .. Kelly
LANE ............... feature/writers-studio-member-upgrade-2026-08-14
FINAL STATE ........ deployed, witnessed, recoverable member experience
```

**Endpoint, stated so it cannot drift**: a creator returning to production, recognizing the
Work, arranging it, writing within it, and deliberately carrying an immutable expression of
it into Press Editor. Not a branch that contains that.

---

## Phase 0 — Referent binding

Re-run before **every** act of writing, testing, merging, or deploying. When a referent
moves, dependent evidence is stale: mark it and re-run it. Never carry an old conclusion
forward silently.

| Referent | Value | Bound at |
|---|---|---|
| Canonical tip | `c8bab43aa` | 2026-08-14 |
| Lane head | *(see git; last recorded `8874a1ecd`)* | 2026-08-14 |
| Lane vs canonical | 0 behind / 6 ahead | 2026-08-14 |
| Production SHA | `b14d96ed8` — **14 commits behind canonical** | 2026-08-14 |
| Main checkout | `feature/labtools-redesign` @ `d41b8b355`, **500 dirty** — unrelated lane, never read from | 2026-08-14 |
| Parallel lanes | 20+ live worktrees on this repo — assume concurrent writers | 2026-08-14 |

**Bound artifact identities** (blob hashes; `==#995` means byte-identical to the prototype):

```text
bb6eca6ea ==#995  components/canvas/CanvasShell.tsx
9904419c9 ==#995  components/canvas/registry.ts
e94105319 ==#995  components/canvas/__tests__/registry.test.ts
f37305f49 ==#995  app/writers-studio/canvas/WritingSurface.tsx
9bf42445b ==#995  docs/design/author-studio/WRITING_CRAFT_CAPABILITY_RECORD_2026-08-05.md
a7f7d9396 ==#995  docs/design/author-studio/WRITER_CANVAS_AND_PRESS_EDITOR_DIVISION_2026-08-05.md
9809e1b14         docs/canon/WRITER_STUDIO_AUTHOR_STUDIO_DISTINCTION_2026-08-04.md
```

---

## Programme state

```text
CUSTODY / DESIGN BINDINGS ........ COMPLETE
C1 HOUSE NAMING .................. RULED 2026-08-14
C1 COPY CORRECTION (4 strings) ... AUTHORIZED / BLOCKED_ON_GATE
EXPERIENCE CONTRACTS ............. AUTHORIZED 2026-08-14 (contracts only)
  · Writer Canvas ................ APPROVED IN PRINCIPLE → WALK
  · Manuscript Room .............. PURPOSE RULED → DRAFT → WALK
AUTHENTICATED WALK ............... ⛔ BLOCKED — JARVIS cannot obtain a session
CANVAS RECONCILIATION ............ BLOCKED_ON_GATE (same cause)
WRITER'S DESK .................... NOT STARTED
ARRANGEMENT ...................... DESIGN ESTABLISHED / BUILD NOT STARTED
PRESS EDITOR SUBSTRATE ........... BOUND / IMPLEMENTATION NOT STARTED
RETURN ........................... ACCEPTANCE CONTRACT REQUIRED
W1–W8 ............................ OPEN
CANONICAL ADMISSION .............. PENDING
PRODUCTION DEPLOYMENT ............ PENDING
POST-DEPLOY MEMBER WITNESS ....... PENDING
PROGRAMME CLOSURE ................ PENDING
```

### Custody / design bindings — COMPLETE

| Act | Commit | What it established |
|---|---|---|
| Writer's Desk + Press Editor division rulings preserved | canonical `81f5b75ae` (PR #1044) | Two founder rulings existed only on the #995 branch |
| Ecology anatomy preserved as derived synthesis | canonical `c8bab43aa` (PR #1045) | Subordinate reconstruction; never authority |
| Press Editor bound to the sovereign render substrate | lane `9575da6ab` | Six binding rulings; no migration required |
| Writer's Studio ⊥ Author Studio canon preserved | lane `8874a1ecd` | **Third** custody rescue; governs C1 itself |

> **Standing observation, three instances deep**: this programme's design record has
> repeatedly existed only on unmerged branches while canonical code cited it. Before
> concluding any Studio capability or ruling is absent, search the preserve branches.

### C1 — RULED 2026-08-14 (Kelly)

Record: `docs/design/author-studio/C1_STUDIO_NAMING_RULING_SURFACE_2026-08-14.md` §7.

```text
WRITER'S STUDIO ... practice environment · /writers-studio · RULED (7076f785d, 2026-08-05)
PRESS EDITOR ...... edition-making specialization · RULED
AUTHOR STUDIO ..... retired as a member-facing NAME; architecture NOT collapsed
BOOK STUDIO ....... unchanged by C1
```

**Rename-in-place, never collapse-in-place.** "Rename nothing" is superseded for this one
naming correction only — not for routes, consolidation, Book Studio, schema, mass symbol
cleanup, or rewriting historical documents. Historical records keep the name where that is
what they ruled at the time.

⚠️ **Correction absorbed**: the surface's §2 claim that Writer's Studio had no ruled route
was wrong. `7076f785d` settled it on 2026-08-05. A `⏳ UNRULED` marker states its own date,
not the present — search forward for the ruling that closed it.

#### PROGRAMME BLOCKER — no Experience Contract exists for these rooms

Discovered 2026-08-14 while landing the authorized four-string copy correction.

`scripts/check-design-canon.ts` is a **blocking** pre-commit gate (`process.exit(1)`). It
refuses any commit touching a member-facing surface that no Experience Contract governs:

```
Member-facing surfaces with no Experience Contract:
  · app/press/manuscript/page.tsx
  · app/writers-studio/canvas/page.tsx
```

`docs/design/contracts/` contains exactly one contract — `journal-room.md`. **Neither the
Writer's Studio nor the Manuscript Room has one.**

**Scope of the block**: not specific to the copy correction. It blocks *every* member-facing
change to these surfaces — the four-string fix, Phase 2 Canvas reconciliation, Phase 3
Writer's Desk, Phase 4 Arrangement, Phase 5 Press Editor UI. The programme cannot reach a
member through these files until contracts exist.

**Why this is above the implementation boundary.** A contract declares *what this room is
for · arrival state · gestures · the House/Room split · governing law · screenshot evidence*.
That is the experiential floor plan `docs/design/INHABITABLE_ARCHITECTURE.md` requires to be
agreed **before** component mapping. Authoring it is a design act about what the rooms are —
new scope from an unexpected finding, which JARVIS does not own.

**Two workarounds were available and both refused.** `--no-verify` launders a gate.
`change_class: structural` ("not experiential… screenshots not required") would be a false
claim: a member reads a different word, which is the definition of experiential.

**Held**: `AUTHORIZED / BLOCKED_ON_GATE` — blocked work, not an open question. The four
referents are verified and the edits are deterministic; they were reverted rather than
committed, so nothing is stranded.

#### C1 copy correction — AUTHORIZED, blocked above

All four member-visible "Author Studio" strings were mechanically verified. **Zero refer to
the edition-making specialization**; all four are back-links or thresholds into the Writer's
Studio house, mislabeled with the retired name. The authorized *Press Editor* replacement
therefore applies to none of them, and nothing was changed. Correct replacement is
"Writer's Studio" — a different act from the one authorized. Detail: ruling record §7.5.

### Return — ACCEPTANCE CONTRACT REQUIRED

The longitudinal acceptance criterion, not a unit test:

> **When a creator returns, do they recognize their own relationship with the Work?**

Restoration must cover the correct Work · location · materials · arrangement · revision
context · recent relationship with MAIA. **A technically persisted document is not enough if
the creator returns to a dislocated experience.**

Ten-step walk: open a Work → write → bring in materials → arrange → revise → leave → return
in a new session → recover the Work and working relationship → create an Edition → continue
writing without altering that Edition.

### W1–W8 — OPEN

```text
Original defects ........ repaired in code
Authenticated walk ...... never restarted from W1
W8 release gate ......... OPEN
Evidence of live defect . NOT ESTABLISHED
```

⛔ Never resume at W8. Restart from W1 after any material repair. Bind each result to the
tested SHA. Record failures without laundering them. An ordinary defect stays inside the
authorized remediation loop and is **not** a request for a new founder decision.

---

## The six member-facing organs

Governing object: **the Work**. Canvas, MAIA, materials, craft, arrangement, and publication
all serve it. None becomes the product's centre of gravity.

```text
1. SOURCE / MATERIALS ...... transcripts, notes, imported text, fragments, references
2. WRITER'S DESK / CANVAS .. sustained composition and revision without replacing the Work
3. MEMORY / CONTINUITY ..... recovery of materials and writing context without presumed intimacy
4. CRAFT ................... optional, explicit capabilities supporting the writer's own act
5. ARRANGEMENT ............. spatial/structural manipulation through which form can emerge
6. PRESS EDITOR ............ an immutable revision becomes an edition and a render
```

**Arrangement invariant**: *Make structure perceivable and manipulable; never decide it.*
It must function without generative AI. MAIA may witness, reflect, or offer an explicitly
requested observation; the arrangement remains the creator's.

**Desk invariant**: *deployments change the Desk, never the Canvas.* Software changes must
not silently mutate the creator's authored object.

---

## Authority boundary

JARVIS owns: referent binding · corpus reconstruction · programme state · unit decomposition ·
worktree and lane control · implementation sequencing · test execution · failure diagnosis ·
remediation loops · admission preparation · deployment mechanics · production verification ·
closure records.

JARVIS does **not** own: the C1 founder ruling · changes to member authority or consent ·
relaxation of release gates · reinterpretation of failed evidence as passed · new scope
created by an unexpected finding.

> **JARVIS automates the work, not Kelly's authority.**

### Stop conditions

Founder authority required · a decision appears above the implementation boundary · member
consent, privacy, or ownership standing cannot be established · the tested referent cannot be
reconstructed · a release gate remains failed after ordinary remediation · deployment
provenance or rollback cannot be proven.

⛔ Not a stop condition: a document, commit, PR, test suite, or implementation unit being
complete.

---

## Flow

```text
bind → reconstruct → obtain authority → design → build → test → remediate
     → restart the member walk → admit → deploy → witness → close
```


---

## Experience Contract unit — 2026-08-14

**Authorized**: a bounded design unit creating Experience Contracts for the two blocked
rooms. Contracts only — not the copy correction, not Phase 2, not Desk, Arrangement, Press
Editor implementation, or deployment. ⛔ No exemption, no `--no-verify`, no false structural
classification.

### Writer Canvas — DRAFT

`docs/design/author-studio/WRITER_CANVAS_EXPERIENCE_CONTRACT_DRAFT_2026-08-14.md`

Every clause recovered from governed sources with inline citation; nothing redesigned.
Deliberately **not** installed in `docs/design/contracts/` — the gate parses every file there
and existence-checks screenshots, so installing a contract without them would break the gate
for **every lane in the repository**.

Remaining: founder review → live walk (desktop + mobile screenshots, real
`experience_verification`) → move frontmatter into `docs/design/contracts/writer-canvas.md`.

⚠️ **Walk dependency**: these routes are `minTier: 'free'` — authentication required before
the door. A real member session against a running dev server is not yet established, and no
contract may be installed with an invented walk.

### Manuscript Room — STOP

`docs/design/author-studio/MANUSCRIPT_ROOM_IDENTITY_CONTRADICTION_2026-08-14.md`

Two governed sources give incompatible answers to *what human activity does
`/press/manuscript` serve* — the field a contract exists to fix:

- **Three-Layer Ruling (2026-07-30, ratified)**: Layer 3 = *close work inside one
  manuscript*, owning Working Draft **and** Export/Your Book.
- **Writer Canvas ⊥ Press Editor (2026-08-05, founder)**: composition and edition-production
  are two fields, deliberately separated.

The room's contents straddle the division line drawn six days after it was assembled. Neither
text repeals the other. Surfaced, not reconciled, per the authorization. Recommendation
carried in the file (Option 2). `/press/manuscript` stays blocked for member-facing changes
until ruled; Writer Canvas surfaces are unaffected.


---

## The authenticated walk — blocked on JARVIS's side, ready for a founder-performed witness

**Authorized** (founder, 2026-08-14): a dedicated test member or founder-authenticated dev
session against the exact code referent, synthetic content, authentication through the normal
UI. ⛔ No credentials, cookies, session tokens, or member identifiers in evidence files.
*"The witness may be Kelly-performed and JARVIS-recorded if JARVIS cannot itself obtain an
authenticated browser session."*

### Why JARVIS cannot obtain one

`lib/auth/getMemberFromRequest.ts` accepts **only** a verified `maia_session` cookie or an
`x-session-token` resolved against `auth_sessions`. A bare `x-member-id` is explicitly
rejected — its header comment records that a previous version trusted it and that doing so
let any caller impersonate any member.

**There is no dev or test bypass.** Grepped for `DEV_MEMBER_ID`, `TEST_MEMBER`, `DEV_BYPASS`,
`ALLOW_DEV_AUTH`, `devSession` across `lib/**`, `middleware.ts`, `config/**` — none exist.

⚠️ **A partial path exists and must be refused.** `middleware.ts` `isAuthenticated()` returns
true on a bare `x-member-id` header — that is the *route* gate ("who may enter the door"),
deliberately distinct from *API* authorization ("which data operations are permitted"), a
split the Three-Layer Ruling §3 states explicitly. Walking in that way would render an
unauthenticated room whose data calls 401. It would produce screenshots of an empty room and
call them a walk. **Refused.**

The only remaining routes to a session are entering a password — which JARVIS does not do
under any circumstances — or minting an `auth_sessions` row directly, which is changing
runtime and fabricating an authentication. Both refused.

**Therefore**: `STOP`, per the founder's own condition.

### The walk script, ready to perform

Same protocol for both rooms. Referent: the lane commit under contract; record it exactly.

```text
ROUTES     /writers-studio  →  /writers-studio/canvas      (Writer Canvas)
           /press/manuscript                                (Manuscript Room)
VIEWPORTS  desktop 1280×800   ·   mobile 375×812
CONTENT    synthetic / non-sensitive only
CAPTURE    commit + runtime referent · route · timestamp · arrival state ·
           gestures actually exercised · any visible contract violation
FILES      docs/design/contracts/screenshots/writer-canvas-{desktop,mobile}.png
           docs/design/contracts/screenshots/manuscript-room-{desktop,mobile}.png
EXCLUDE    ⛔ credentials · cookies · session tokens · member identifiers
```

**Gestures to exercise, drawn from the drafts' own claims** — each is a clause the walk
tests, not a feature tour:

*Writer Canvas* — arrive and confirm the work appears mid-motion, named by its becoming (not
a blank pane, not a capability inventory) · confirm both edges are folded on arrival · open
the Work drawer and tend identity · bring a material in with a sentence · confirm Structure
is **absent**, not empty, when no structure exists · open the Window and confirm MAIA is
invited rather than present.

*Manuscript Room* — arrive and confirm the manuscript opens where it was left · confirm the
way back up is visible from every state · write and confirm autosave holds · keep a version ·
attempt to leave with unsaved words and confirm the exit guard fires.

⚠️ Expected and correct to observe: the return links still read **"Author Studio"**. The copy
correction that fixes them is `AUTHORIZED / BLOCKED_ON_GATE` — blocked by the very gate these
contracts exist to open. Record it as observed; it is not a contract violation, it is the
known blocked unit.

**JARVIS will record**: transcribe the witness into each contract's `experience_verification`,
move both frontmatters into `docs/design/contracts/`, and run the gate to confirm it passes
naturally — no exemption, no `--no-verify`.
