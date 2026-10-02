# FIRST ARRIVAL — CAPABILITY AUDIT (§3 of the operating manual)

Canon: `FIRST_ARRIVAL_AND_ONBOARDING_CANON_v1.md` (FLAGSHIP EXPERIENCE AUTHORITY).
Head `59e673a02`. Read-only. ⛔ Nothing built by this document.

---

## 1. ⭐ THE CANON RESOLVES A DEFECT ALREADY IN THE CANDIDATE

`NAV_DESTINATIONS` and `MOBILE_PRIMARY` both carry `home`. `StudioChrome`
renders it as a named button with an icon in every room, on every viewport.
⛔ **There is no Home room** — no component, no phase, no render state.

⭐ That is a capability-false destination: the same defect class as a nav item
promising a surface that does not exist. It has been shipping in every render
since the rail was built, and I did not see it until the canon asked what
belongs there.

⭐ **§5 and O1 now answer it.** Behind `home` belongs: Work identity · current
place · manuscript · a quiet invitation. ⛔ Not a dashboard, ⛔ not a tour.

---

## 2. Six arrival states required (§4) · candidate has ZERO

| State | Canon | Candidate |
|---|---|---|
| Existing Work | §5 | ⛔ absent |
| New Work | §6 | ⛔ absent |
| Returning Work | §7 | ⛔ absent · ⚠️ needs persistence |
| Imported / incomplete | §8 | ⛔ absent |
| Changed since MAIA read | §7 | ⚠️ the *disclosure* exists (V15); the *arrival* does not |
| No MAIA reading yet | §9 | ⚠️ `8-review-not-read` covers a lens, ⛔ not a Work |

⭐ The distinction in the last two rows is not pedantry. V15 governs a stale
reading **inside Review**; §7 asks for the same truth **at the front door**,
where the member has not yet chosen to look at findings at all.

---

## 3. What the candidate already satisfies

| Gate | Standing | Evidence |
|---|---|---|
| O5 no expertise test | ✅ | `FACET_FORBIDDEN_FRAMINGS`; L6e |
| O8 scope consent | ✅ | commission law; V15 16/16 |
| O9 reversible | ✅ | matrix-lethal, F10-undo-appends |
| O11 empty is honest | ✅ | `LENS-read-nothing-is-not-not-read` 44/44 |
| O13 accessible first run | ⚠️ partial | scaling/targets/hover pass; contrast + tab order ⛔ not automated |
| O15 curiosity | ⛔ human | §23. Not mine to mark |

⭐ D-O2 (choose a writing level) and D-O6 (*Your voice is strong*) are **already
dead** against the candidate — the first by `FACET_FORBIDDEN_FRAMINGS`, the
second by the verdict scan, which would refuse that sentence as member copy.
⚠️ Recorded as *already dead*, ⛔ not as *proved by a suite that does not exist
yet*: the distinction is the whole point of the lethality discipline.

---

## 4. ⚠️⚠️ ONE TENSION INSIDE THE CANON, RAISED NOT RESOLVED

**§13's fifth first-discovery example:**

> "You named belonging as part of this Work, but it doesn't appear until
> Chapter 6."

⭐ The first clause is lawful and good — it restates the member's **own
declaration** back to them, which §3 expressly allows and the Compass law
expressly permits (*"you said the book does X"* ✅).

⛔ The second clause is a claim about the text: **an absence across
Chapters 1–5.** Under the ratified reading law an absence claim is
`across-unread-span` unless those chapters are covered at body depth. So the
sentence carries a coverage precondition its plain reading hides.

⭐⭐ **And that precondition collides with the canon's own D-O4**, which kills
*"MAIA auto-reads the whole manuscript during onboarding without consent."*
To say *it doesn't appear until Chapter 6* at first arrival, MAIA must already
have read Chapters 1–5 — which at first arrival she has not lawfully done.

⭐ The example is not wrong; it is **not a first discovery**. It is a lawful
observation *after* a commissioned multi-chapter reading. ⛔ Using it as
onboarding copy would require exactly the silent expansion D-O4 forbids.

⚠️ This is the subtlest kind of defect: the sentence **sounds humble**. It
credits the member, hedges nothing, and reads as care. ⭐ That is why it is
worth catching in a canon review rather than in a render.

**⛔ Not resolved here.** The founder owns the canon. The two lawful repairs
are: move the example out of §13 into a post-commission context, or keep it
and state its coverage precondition beside it.

---

## 5. ⭐⭐ PERSISTENCE, THE THIRD ARRIVAL — NOW THE PROGRAMME'S BINDING CONSTRAINT

§7 asks for *last member action*. §29 states outright: **"The system must
remember that onboarding has already happened."** O14 makes it a gate.

⛔ None of that is composable. A returning writer is a **durable fact**, and
the candidate holds none.

⭐ This is now the **fourth** stage blocked by the same unopened lane:

```
R5   find my observation again          → persistence
R9   a seeded session environment       → persistence
O14  returning writer is not re-onboarded → persistence
§7   last member action                 → persistence
```

⭐ Four stages, three canons, one ruling. `OBSERVATION-ADDRESS-01` is no longer
a constraint on R5; it is the **critical path of the flagship**. ⛔ No amount
of composition work moves any of the four.

⚠️ And a trap worth naming before someone steps in it: *returning* is easy to
fake from `localStorage`. ⛔ That would be **UI-only state masquerading as
durable authorship** in the operating manual's exact words — and it fails in
the one direction that matters, because a member on a second device would be
onboarded again as a stranger to their own book.

---

## 6. What is buildable NOW, and where the line falls

⭐ **BUILDABLE** (composition; B0 authorizes it):
§5 Existing Work · §6 New Work · §8 Imported · §9 No reading yet · §10 first
trust moment in context · §11 first question · §12 Keep writing as a primary
action everywhere · §14 discovery card · §15 *Why are you showing me this?* ·
§21 first revision · §22 first undo · §23 empty states · §24 error states ·
§25 mobile arrival · §27/§28 no-carousel and the optional orientation.

⛔ **BLOCKED**: §7 Returning Work · §29 experienced re-entry · O14 — all four
on persistence.

⚠️ **HUMAN-ONLY**: §37's ten questions · §38's success language · O15.

---

## 7. Method for the build (§0 of the operating manual)

⭐ The canon supplies **ten defeat candidates already written** (D-O1…D-O10).
That is unusual and valuable: the laws and the machines that must die by them
arrive together, so the suite cannot be quietly shaped around an implementation.

Order, per the ratified Class-B discipline:
1. author O1…O15 as mechanical laws where they CAN be mechanical, ⛔ naming
   the ones that cannot rather than proxying them;
2. build D-O1…D-O10 as disposable wrong machines;
3. prove each dies on its named law — ⛔ a survivor repairs the SUITE;
4. only then build the arrival states.

⛔ Two of the fifteen gates are ⛔ NOT mechanically testable and will be
reported as such, never as passed: **O15 curiosity** and the felt half of
**O10 trust in context** (*where it matters* is a judgment about a moment).
