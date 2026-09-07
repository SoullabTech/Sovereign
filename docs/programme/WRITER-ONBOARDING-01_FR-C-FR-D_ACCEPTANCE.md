# FR-C + FR-D — ACCEPTANCE

```text
FR-C   IMPLEMENTED · UNWITNESSED
FR-D   IMPLEMENTED · UNWITNESSED
CODE   HOLD
NEW EDITS  NONE
```

> **The build has reached the point where looking at it is more valuable than
> changing it.** (founder, 2026-09-07)

```text
761d5ec9   FR-C / state legibility
227e4e63   FR-D / object-local meaning
```

---

## 1 · Evidence, stated exactly — including what is NOT established

```text
TESTS               91 suites · 1546 tests · PASS
LOCAL SCOPE         app/writers-studio · 0 TypeScript diagnostics
PROJECT TYPECHECK   ✅ ESTABLISHED — see §2 result (clean worktree, npm ci)
                    the mid-session result stays WITHDRAWN and is NOT the
                    basis for this; it was replaced, not explained away
RENDERED ACCEPTANCE NOT YET RUN
```

### ⚠️ The withdrawal, and why it is not repaired by an explanation

`761d5ec9`'s message cited a clean project gate. **That citation is withdrawn.**

`node_modules` was empty when this session began. TypeScript was installed, then
Jest and `@types/jest`, taking the tree from 0 to ~1359 packages *between gate
runs*. The same tree reported "no regressions" on one run and four new
diagnostics on a later one.

Those four were attributed by stashing to `761d5ec9`: they sit in
`app/wisdom-keepers` and `components/focus`, which this branch has never
touched. **That establishes attribution and nothing more.**

⛔ **Attribution is not a green gate.** Proving four diagnostics are unrelated
does not prove the project gate is clean, and the explanation must not be
allowed to stand in for the run. A trustworthy result requires the project's
normal dependency installation on a clean checkout, which is proof act A below.

---

## 2 · Proof act A — clean-toolchain gate

```text
QUESTION, and only this one
  Does 761d5ec9 + 227e4e63 introduce a project-level typecheck regression
  under the project's actual toolchain?

METHOD
  clean checkout · npm ci · npm run typecheck
  ⛔ no repairs mixed into the verification
  ⛔ if unrelated canonical failures remain, establish the baseline cleanly
     and compare against that
```

### RESULT — 2026-09-07 · PASS

```text
subject          227e4e63 · working tree clean · fresh git worktree
install          npm ci · exit 0 · no --no-save, no ad-hoc packages
typescript       5.9.3, resolved from the lockfile (not npx)
program files    4237
errors           230   (baseline 239)
fixed            9 since baseline (7 identities gone, 0 reduced)
regressions      NONE
exit             0
```

**Answer to the question, and only that question:** `761d5ec9 + 227e4e63`
introduce **no project-level typecheck regression** under the project's actual
toolchain. No repairs were mixed into the verification.

⭐ **The four diagnostics that appeared mid-session are absent from this run
entirely** — zero occurrences of `wisdom-keepers` or `components/focus` in the
output. They were artifacts of a partial dependency tree assembled by ad-hoc
`npm i --no-save`, not latent findings. This is what a clean toolchain was for:
the earlier result is REPLACED by a reproducible run, not rescued by an
argument.

⚠️ Note for anyone repeating this: `npx tsc` in a container with empty
`node_modules` fetches whatever is current (6.0.2 at the time), which hard-errors
on this project's `downlevelIteration` and `moduleResolution: node10` before
checking a single file — and the gate then reports a nonsense "239 fixed". Always
run the lockfile-resolved compiler.

---

## 3 · Proof act B — founder rendered walk

⛔ **CI cannot substitute for this, and a PR must not be used as a stand-in.**
Automated gates cannot answer whether the second line reads naturally, whether
disabled state is emotionally legible, whether touch help works, whether the
Studio now feels cluttered, or whether the writing surface still has presence.
Those are the acceptance questions.

### The single founder criterion

> **Did Writer's Studio become more intelligible without becoming more
> instructional?**

That is FR-D.

### The witness sheet

```text
 #  WITNESS                  MUST BE TRUE                                RESULT
 1  Desktop / pointer        an unfamiliar object explains itself
                             when meaning is sought                      ______
 2  Keyboard                 same meaning reachable without a mouse      ______
 3  Touch / iPhone           same meaning available without hover        ______
 4  Unavailable destination  reads clearly as NOT AVAILABLE YET —
                             not broken, empty or unauthorized           ______
 5  DEVELOP with no Work     says why it cannot act · no silent press    ______
 6  Known destinations       Studio is not littered with explanatory UI  ______
 7  Writing surface          help recedes; writing remains visually
                             primary                                     ______
 8  Develop                  still good; no gratuitous added explanation ______
 9  GOALS pattern            unavailable-state language feels coherent
                             with the rail                               ______
10  Keeps                    NO help bandage over the naming issue       ______
```

### ⭐ Two things to put under direct visual pressure

**One slot, never both.** The rail's second line carries *either* state *or*
orientation. That is elegant in principle and untested in the eye. A
destination may legitimately want both — an orientation sentence saying what
the room is for, AND a state saying it cannot be entered.

If the shared slot makes orientation vanish whenever state appears, that may
still be correct — **state outranks help under FR-C/FR-D** — but the walk
decides whether the resulting surface stays understandable. ⛔ Do not solve
this theoretically; look at it.

**"Open a work first" must be heard as STATE.** Not as chastisement, not as an
error message about something the writer did wrong. The wording is judged in
context, on the screen, not in this document.

---

## 4 · Sequence

```text
1  clean-toolchain verification        ← proof act A
2  rendered founder witness            ← proof act B
3  record findings
4  repair ONLY if the witness produces findings
5  re-prove
6  PR / merge custody
```

⛔ No code until the witness runs. A draft PR may eventually carry the clean
automated gates; it may not carry §9.

---

## 5 · ⛔ CORRECTION OF RECORD — the 2026-09-07 founder view was NOT an FR-D failure

```text
PRIOR FOUNDER VIEW
Not an FR-D failure.
The viewed environment did not contain the implementation.

No acceptance inference may be drawn from that view.
```

The founder reported, walking the Studio:

> *"I see no difference from what I've been looking at for days."*

**That report is valid, and it is not evidence about FR-C or FR-D**, because the
served subject could not contain them.

```text
implementation   761d5ec9 + 227e4e63
branch           origin/claude/writers-studio-onboarding-ek7p06 — the ONLY ref
                 containing 227e4e63; not on clean-main-no-secrets, never deployed
production       e535e6246
walked subject   did NOT contain FR-C / FR-D

FOUNDER WITNESS  INVALID FOR FR-C / FR-D ACCEPTANCE · reason: wrong subject
PRODUCT RESULT   UNKNOWN
```

⚠️ **This correction exists so that "no difference" can never later be quoted as
evidence against a build the founder had literally never seen.** Classified as an
environment/subject mismatch, not a failed product witness.

### What the render-path proof eliminated

A second ambiguity is closed: this is **not** a case where the branch carries the
code but the UI never consumes it. The path
`StudioShellRail → StudioRailChrome → StudioBand → StudioRailItem` was traced,
and `StudioBand` is where state is passed.

Running the shipped logic for the exact screen walked — Canvas, Work declared —
produces **eleven** state lines and two orientation lines:

```text
Notes · Versions · Goals · Conversations · Discover · Insights ·
Suggestions · Find/Replace · Statistics · Timeline · Word Web
                                              → "Not available yet"
Manuscript  → "The room where your work develops."
Export      → "Take your writing out."
```

If the correct subject is served, the difference is plainly visible. It is not
something a founder should have to hunt for.

### ⭐ HYPOTHESIS to test in the witness — do not act on it now

> Eleven repetitions of *"Not available yet"* may satisfy FR-C semantically while
> creating a new visual problem: the rail could become dominated by everything
> the Studio cannot yet do.

⛔ **Hypothesis, not a finding.** This is precisely what the rendered witness is
for — whether explicit state produces clarity, or whether its aggregate weight
starts competing with the useful rooms. **Do not change it in anticipation.**

### Witness pre-condition

⛔ Before beginning the walk, verify ONE obvious marker — `Notes → Not available
yet` — to prove the intended subject is finally being served. A walk that begins
without that check can repeat this same mismatch.

⚠️ `DEVELOP → "Open a work first"` cannot be witnessed on a Canvas that has a
Work. It needs the no-Work condition, and its absence on the wrong screen must
not be read as a failure.

## 6 · Sequence, restated

```text
1  clean-worktree typecheck finishes · record the ACTUAL result
2  serve 227e4e63 from the correct worktree, clean tree
3  verify the marker: Notes → "Not available yet"
4  run the founder walk (§3 sheet)
5  test the no-Work DEVELOP condition separately
6  judge the FR-D question:
     did Studio become more intelligible without becoming more instructional?
```

⛔ No code changes.

---

## 7 · FOUNDER WITNESS — RESULT (2026-09-07)

```text
SUBJECT     227e4e63b served at localhost:3100 from a clean worktree
MARKER      verified before the walk — Notes → "Not available yet"
WALKER      Kelly, as a writer
```

### The governing question

> **Did Writer's Studio become more intelligible without becoming more
> instructional?**

**Founder verdict, verbatim:**

> *"it has. I'm looking forward to the unavailable functions to be added. this
> is feeling better somehow"*

```text
FR-C   WITNESSED · PASS
FR-D   WITNESSED · PASS  (partial — see coverage below)
```

### ⭐ What this resolves, and it resolves it the other way

The founder's own hypothesis before the walk:

> *"Eleven repetitions of 'Not available yet' may satisfy FR-C semantically while
> creating a new visual problem: the rail could become dominated by everything
> the Studio cannot yet do."*

**It did not.** The witness reports the opposite reaction:

> *"I'm looking forward to the unavailable functions to be added."*

Explicit state turned a rail that read as *broken, empty, or inaccessible* into
one that reads as **a Studio with rooms still to open**. That is precisely the
FR-C deeper ruling working in the lived case:

> *A Studio may reveal its larger architecture before every room is usable, but
> it must distinguish intentional incompleteness from malfunction or lack of
> access.*

⭐ Before FR-C, the same rail produced *"very few options in Work Space are
present and useful."* After it, the same absence produces anticipation. **Nothing
about what the Studio can do changed. Only what it says about what it cannot.**

### ⭐ "somehow" is the FR-D success condition, met

The flow's own success test:

> *The strongest implementation will feel like the Studio simply knows when
> something needs explaining. It should not feel like Help has been added.*

The founder reports feeling better **without being able to name what changed**.
That is the intended quality, not a vagueness in the report. A witness who could
point straight at the help would have been evidence of the failure mode FR-D was
written to avoid.

### Coverage — what this verdict does and does not carry

```text
WITNESSED
  3  unavailable rooms read as not-yet, not broken/empty      PASS
  4  the whole rail — clarifying, not mostly-unfinished       PASS
     the governing question                                  PASS

NOT YET REPORTED — the verdict does not carry these
  1  pointer hover on "This work"
  2  keyboard focus parity
  5  writing surface — does help recede
  6  GOALS coherence with the rail
  7  Keeps — naming problem left undisguised
  ·  touch / iPhone
  ·  DEVELOP with no Work → "Open a work first"
  ·  Develop room unchanged and still good
```

⛔ **FR-D is witnessed on the rail and on the governing question. It is not yet
witnessed on the object-local help (StudioHint), which is the part rows 1, 2, 5
and 7 test.** The two `?` affordances were rendered and available during this
walk but are not reported on. Do not read this PASS as covering them.

### Environment note, so the result is not over-read

This walk ran on a local dev instance whose database was significantly behind —
structure contiguity, proposals, adoption provenance, working-draft revision
partition, developmental readings, standing, and heading depth were all missing
and applied during setup. That was environment drift, not product state, and it
cost the first two attempts at this walk. The verdict above was given only after
the schema was current and the Canvas loaded normally.

### ⭐ Addendum — the state lines do positive work

Founder, on the Develop room's rail, where nearly every destination is
unavailable (Materials · Structure · Notes · Versions · Goals · the entire MAIA
band · four of five Tools):

> *"these would all help to ground the work ahead"*

This goes beyond FR-C's requirement. The ruling asked only that intentional
incompleteness be distinguishable from malfunction — that the rail stop reading
as broken. What the witness reports is that the named-and-stated rooms now
function as **a legible map of the Studio the work is heading toward**, useful
for orientation rather than merely inoffensive.

⛔ Recorded as a witnessed reaction, not promoted into a design principle. It is
one walk, by the architect, on one runtime.

Also confirmed in the same view: `note` renders for available destinations —
Export shows *"Take your writing out."* — so the orientation channel and the
state channel are both live and visibly distinct.

### ⚠️ One observation for a later look — NOT acted on

The same destination says different things in different rooms. In the Canvas,
Materials, Structure and Versions are actionable panels; in Develop they render
*"Not available yet"* — because they are genuinely not reachable from that room.

Under FR-C's own logic this is correct: state is per-room reachability, and
`shellDestinations` derives it from the room's actual options. But a writer who
sees `Versions 1` in one room and `Versions — Not available yet` in the next may
read the product as contradicting itself rather than as describing two rooms.

```text
STATUS   observation only · no defect claimed · nothing changed
NEEDS    a look during a later walk, in both rooms in sequence,
         to see whether it reads as precision or as inconsistency
```

⛔ Not to be repaired in anticipation. The same discipline that governed the
aggregate-weight hypothesis governs this: the walk decides, not the reasoning.
