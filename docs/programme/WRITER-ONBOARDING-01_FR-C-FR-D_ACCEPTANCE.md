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
PROJECT TYPECHECK   NOT ESTABLISHED
                    environment changed from empty node_modules →
                    installed dependency tree mid-session
                    prior "clean" result WITHDRAWN
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
