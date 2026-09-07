# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## GOALS v1 — LOCAL WITNESS

**Subject** `6d644ae37` (clean tree) **Migration** local only **Deploy** HOLD
**Environment** ephemeral PostgreSQL 16.13 in this session's container.
⛔ **Production untouched.**

---

## ⚠️ A DEFECT THE UNIT TESTS COULD NOT REACH

The first run failed. `GET /goals` returned **500**:

```text
[goals] list failed  error: column reference "id" is ambiguous
```

Every goals SELECT joins `member_manuscripts`, which also has an `id`, and the
shared column list was unqualified. **690 passing tests could not see it** —
it is only true when the statement meets a real database.

> **This is the case for product witnesses stated better than any argument:
> the suite tested what the code says; the witness tested what Postgres does.**

Repaired by splitting the column list into a `g.`-qualified form for reads and
an unqualified form for `INSERT … RETURNING`, replacing a regex that
re-qualified one at runtime.

## CASE 1 · MEASURABLE — PASS

```text
writer explicitly chooses "something countable"   ✅ default is intention
target field appears only for measurable          ✅
empty target refused                              ✅ "needs a whole number above zero"
progress where the count is known                 ✅ 2,140 / 3,000 words
forbidden language anywhere on the page           ✅ none
```

No pace, behind/ahead, per-day, projection or streak — and none is renderable,
because no function in `goalsClient.ts` computes one.

## CASE 2 · INTENTION — PASS

```text
"Finish Chapter 7"
target field                 ✅ absent
figure / percentage / bar    ✅ absent  (data-goal-progress="none")
writer marks it themselves   ✅ met · set aside · reopen · release
numerical proxy invented     ✅ none
```

## CASE 3 · UNCOUNTED — PASS, and corroborated

```text
"3,000 words in this manuscript"  →  "3,000 words — not counted here"
                                     NOT "0 / 3,000"
```

**Independent corroboration** (INSTRUMENT READ step 4): in the same room the
lower band's Statistics reports `—` for words. Two surfaces, one truth — the
room does not know the count, and neither of them invents a zero.

## CASE 4 · ANCHOR LOSS — PASS

A measurable goal anchored to "The Nature of Change"; that section then deleted.

```text
database   section=NULL   anchor="The Nature of Change"   target=3000   rows=1

surface    "3,000 words in the Torus chapter"
           "3,000 words — the section this counted is gone"
           "Previously in “The Nature of Change”"

target silently moved to the manuscript   ✅ NO — never reads 2,140 / 3,000
database vocabulary exposed               ✅ NO
```

The goal survived, the history remains, measurement stopped, and the writer's
declared terms were not rewritten.

## CASE 5 · TWO DOORS, ONE OBJECT — PASS

The rail panel and the lower band render the same two goals from **one read**
(`useManuscriptGoals`). Not two synchronised systems — one object with two
doors, which is what Q-D required so EXPLORE can later take a third with no
migration.

## CASE 6 · THE EXPERIENTIAL QUESTION — answered under the AMENDED test

The founder amended the falsifier mid-witness (FR-13): the question is not only
*"does Studio avoid managing productivity?"* but

> *Does Goals feel like something in service of the writer's chosen relationship
> to their work — supportive when invited, quiet when not?*

**Against the amended question, v1 passes only its first half, and should be
said so plainly.**

What v1 is: **quiet.** It holds what the writer said, shows what is genuinely
countable, says "not counted here" rather than guessing, and never speaks first.
Nothing pressures, nothing urges, nothing infers. *"I said what I intend; Studio
remembers it and can show me what is actually measurable."*

What v1 is **not**: capable of the invited half. There is no support grant and
**no MAIA path to Goals at all** — so a writer who wants *"help me stay
connected to why I'm writing this"* or *"I'm stuck, inspire me"* has nowhere to
say so.

> **v1 implements only the "Just track it" posture — and implements it as the
> absence of an option rather than as a choice the writer made.** Under FR-13
> that is the correct default and an incomplete capability, not a finished one.

## STANDING

```text
GOALS v1
build             ✅ 6d644ae37 (+ the ambiguous-column repair)
cases 1–5         ✅ PASS
case 6            ✅ PASS on the quiet half · ⛔ INCOMPLETE on the invited half
migration         ✅ local witness cluster only — NOT production
deploy            HOLD
production        untouched

OWED (FR-13)      the support grant, structurally — see the FR-13 record
```
