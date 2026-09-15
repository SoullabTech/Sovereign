# WS-02 · ACT 5 — THE CHAPTER 10 WALK

**The ACT-4 Studio, walked against a real writing session.** Read-only,
analytical. ⛔ No implementation, no source edits, no retirement, no adoption
execution.

*Kelly worked on Chapter 10 of Elemental Alchemy yesterday. She closed the
Studio. It is tomorrow.*

---

## 1 · Before she does anything — what does the Studio know?

⭐ Everything it needs, and **all of it already durable**:

| | source |
|---|---|
| the Work | `living_works` + `member_manuscripts` |
| where she last wrote | `manuscript_draft_sections.updated_at` |
| which chapters have editorial relationships | `proposal_chains.target_section_id` |
| the threads on them | `ask_threads.proposal_chain_id` |
| when each last moved | `ask_turns.created_at` |
| what was authored there | `proposal_versions` (succession-ordered) |
| which readings exist, of which revision | `developmental_readings (draft_id, revision_number, scope)` |

⛔ It knows **nothing** about "where the cursor was" — and it does not need to.
*A chapter is a place; a cursor is not.*

---

## 2 · The walk

| Step | Kelly's decision | Continuity | Object identity | Relational | Interrupted? |
|---|---|---|---|---|---|
| **Return** | writing | Home names the Work **and the chapter** | one Work | — | no |
| **Restore Chapter 10** | writing | locus restored from an unambiguous fact | Chapter 10 everywhere | — | no |
| **Open relationships surfaced** | writing (*which conversation*) | ⭐ shown, **never chosen for her** | each names its own passage | one presence | no |
| **Resume writing** | writing | she is already there | — | — | no |
| **Ask MAIA about the chapter** | writing | same seat, same room | the passage | live scope | no |
| **Consult the frozen reading** | writing (*a lens, not a room*) | the reading names its revision | the same Work | frozen scope | no |
| **Author alternatives** | writing | composer opens on a version she clicks | versions of this passage | — | no |
| **Compare** | writing | passage-as-opened vs one exact version | — | — | no |
| **Choose** | writing | — | — | — | no |
| **Adopt** | writing (*a decision about the book*) | §5 | ⭐ she is told exactly what changes | — | no |
| **Manuscript changes** | — | provenance visible | one canonical draft | — | no |
| **Continue** | writing | she never left | — | — | no |
| **Leave / return again** | — | same as step 1 | — | — | no |

---

## 3 · Stress test 1 — two legitimate editorial threads on Chapter 10

⭐ **They are not duplicates, and the substrate proves it.** Each conversation
opens its **own** `proposal_chain`, and a chain freezes `expected_text` at open.
So two threads on Chapter 10 are two relationships **about different states of
the same passage** — genuinely distinct objects with distinct provenance.

What Kelly sees:

```
Chapter 10 — open work

  “Before the water, there was a sound.”      3 versions   · yesterday
  “The spiral is not a circle.”               1 version    · last week
```

⛔ No default. ⛔ No most-recent. The passage each began from is the
discriminator, and it is the honest one — *she recognizes her own sentence long
before she would recognize a timestamp.*

**Survives.** And it is why the ACT-4 return rule had to be phrased as *restore
what is unambiguous, present choice where plural* rather than *restore the last
thing*.

---

## 4 · Stress test 2 — the reading is of revision 14; the draft is at 18

⭐⭐ **The strongest result in the walk.** `assess.ts` already answers this
**per observation**, not per reading (INV-20/21): each observation is
`current` · `superseded (say WHICH)` · `unmeasured`, scoped to *what its own
evidence depends on*.

So the reading does not present as stale or broken. It presents as **partly still
true**:

```
MAIA's reading of Chapter 10 · revision 14        (you are now at 18)

  · the chapter opens on summary rather than scene      still stands
  · the water image arrives before it is earned         superseded — you
                                                        rewrote that passage
  · the ending withholds the turn                       not measured since
```

⭐ That is the two-scope model becoming **legible rather than merely honest**:
the live conversation is about *this passage now*; the reading is about *this
Work at a moment*, and it tells her which of its observations survived her own
work. ⛔ Nothing is silently refreshed; ⛔ nothing is silently discarded.

**Survives — and this is the case that makes the distinction worth keeping.**

---

## 5 · Stress test 3 — section scope · ⭐⭐ THE OPEN QUESTION, RESOLVED

ACT 3 flagged this as the possible *second* genuinely-new capability. **It is
not new. It is not even a connector. It already exists end to end.**

```
ReadingScope       'whole' | 'section' | 'unit' | 'range'     ✅ contract
resolveScope()     resolves each, refuses unknown targets      ✅ pure
readings route     WS-DEV-SCOPE-01 accepts `scope` in the body ✅ route
DevelopRoom        already sends one (kind: 'range')           ✅ caller
developmental_readings.scope                                    ✅ persisted
```

⭐ A developmental reading **of Chapter 10** is already commissionable. What is
wrong is only **where it is commissioned from** — a separate address that does
not know which chapter she is in.

> **ADD → CONVERGE.** The ACT-3 "possible second ADD" is withdrawn on evidence.
> **The genuinely-new count stays at ONE.**

⚠️ One honest caveat: DevelopRoom sends `range`, so *section* and *unit* are
supported by the substrate but **unexercised by a caller today**. That is a
wiring risk to verify in ACT 6 sequencing — ⛔ not a capability gap.

---

## 6 · Stress test 4 — adoption, the hardest checkpoint

The writer must never meet `authorizeVersion()`. She must meet a sentence she
can check:

```
ADOPT THIS VERSION

  In        Elemental Alchemy · Chapter 10
  Replacing  “Before the water, there was a sound.”
  With       “There was only the sound, and then the water.”
  Authored   by you · Version 2 of 3

  This changes the manuscript. Your other versions are kept.

  [ Adopt this version ]              [ Not yet ]
```

Every line of that is already a durable fact: the chain's locus names the
section; `expected_text` is the *replacing*; the version's formulation is the
*with*; `author` and succession position give the attribution.

⭐ **And the refusals are already writable in her language**, because
`evaluateExecutionFit` names them exactly:

| substrate reason | what she is told |
|---|---|
| `stale_base` | *You've written here since this version was made.* |
| `different_place` | *This passage has moved.* |
| `expected_text_absent` | *The sentence this answers is no longer in the chapter.* |
| `expected_text_ambiguous` | *That sentence now appears more than once here.* |

⛔ None of these is an error message about the system. Each is a true statement
about **her book**.

⭐⭐ **The load-bearing point:** the writer is not asked to trust an adoption.
She is shown *what will change, from what, to what, by whom* — and the system
independently re-checks that the Work still fits before executing. **No magical
overwrite, no silent adoption, and no promise without a control.**

**Survives**, and it is the one place ACT 6 must actually build something.

---

## 7 · Stress test 5 — materials · collections · emerging · structure · prepare

Standing at Chapter 10, are the relationships obvious?

| | one sentence at the locus | verdict |
|---|---|---|
| **materials** | *what you brought into this Work* | obvious — Work-scoped |
| **collections** | *what you gathered on purpose* | obvious — member-authored containers of keeps |
| **emerging** | *lines worth keeping, found in this chapter* | ⭐ obvious **only because it is section-scoped** — member-pulled, verbatim-verified, right here |
| **structure** | *where this chapter sits in the book* | obvious |
| **prepare** | *how this Work leaves the Studio* | obvious — Work-scoped, a mode not a room |

⚠️ **One translation survives, and ACT 4 did not remove it:** *keeps* and
*marked lines* are still two names for one gesture. Spatial convergence alone
does not fix a naming collision — ⭐ **this is a rename, and ACT 4 should say so
explicitly rather than leave it as a CONVERGE.**

---

## 8 · Product-navigation decisions remaining

| moment | decision | kind |
|---|---|---|
| return with **plural** open threads | *which conversation* | ⭐ **writing** — she is choosing a passage, not a product |
| section vs whole view | *what scale am I working at* | ⭐ **writing** — *provided the room says why it gave her one* (§9) |
| everything else | — | — |

```
product-navigation decisions remaining:  0
```

⚠️ Conditional on §9. Today the Worktable/Section/Whole choice is made
server-side and unexplained, which is a product decision **hidden** rather than
eliminated.

---

## 9 · Changes ACT 4 needs before the roadmap is frozen

1. ⭐ **Withdraw the possible second ADD.** Section-scoped developmental reading
   exists end to end. It is a CONVERGE, and the genuinely-new count is **one**.
2. ⭐ **Promote *keeps / marked lines* from CONVERGE to RENAME.** One gesture,
   one name, chosen deliberately.
3. ⭐ **The unconverted-draft state must announce itself.** "Worktable is the
   whole view's unconverted state" is only true for the writer if the room says
   *this Work isn't in chapters yet* — otherwise a product decision is merely
   concealed.
4. ⚠️ **Record the wiring risk:** `section` and `unit` reading scopes are
   supported but have no caller today. To be verified when wired, not assumed.

⛔ Nothing in the walk asks for a new subsystem, a new table, or a new
architecture.

---

## 10 · The four judgments

```
ACT-4 model survives Chapter 10 walk?     YES, WITH CHANGES  (four, §9 — all
                                          reductions or clarifications; none
                                          adds architecture)

developmental section scope required?     NO — it already exists, end to end.
                                          The ACT-3 second ADD is WITHDRAWN.

adoption model understandable to writer?  YES — every line of the confirmation
                                          is a durable fact, and every refusal
                                          is a true sentence about her book.

remaining product-navigation decisions    0, conditional on §9.3
```

⭐⭐ **She can stay in Chapter 10.** The one place the walk stops is adoption —
and that stop is a missing control in front of finished machinery, not a missing
idea.

---

## 11 · Standing

**WS-02 · ACT 5 COMPLETE · MODEL SURVIVES WITH FOUR CHANGES · SECOND ADD
WITHDRAWN ON EVIDENCE · ⛔ NOT IMPLEMENTED · HOLDING FOR FOUNDER READING BEFORE
ACT 6.**
