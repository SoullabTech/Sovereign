# THE WORK IS THE DURABLE OBJECT — MAIA meets the person where the Work actually is

**Founder ruling · 2026-09-12.** ⛔ **Writer's Studio may not be designed around the assumption that
the person arrives with a manuscript.**

> ⭐⭐ **MAIA meets the person where the Work actually is and helps it become what it is capable of
> becoming.**

A finished-ish manuscript is **one starting condition. It is not the product model.**

---

## 1 · Seven starting realities, one process

| arrives with | what MAIA helps them do |
|---|---|
| **an idea** | discover what wants to be made · articulate intent · find form · begin |
| **notes / fragments** | understand what is there · find relationships · organize without flattening |
| **years of journals or essays** | discover themes · possible books, collections, sequences, series |
| **partial manuscript** | structure · gaps · repetitions · undeveloped ideas · voice · trajectory |
| **complete first draft** | developmental editing · structural revision · craft |
| **nearly finished manuscript** | language · pacing · reader experience · coherence · impact |
| **an existing body of work** | identify multiple Works · series · derivative pieces · future directions |

⭐ **These are not seven products. They are states of the same living Work process.**

## 2 · ⛔ NO WIZARD — orientation, not classification

⛔ **Do not ask "are you writing a book, article, memoir, course or collection?" before MAIA knows
what they have.**

> ⭐ Someone may upload 300 pages thinking they have a book and discover, after working together,
> **"there are actually three books in here."** Someone may have thirty unrelated-looking essays
> that reveal a coherent Work only after MAIA has spent time with them.

**The first intelligence is orientation:** *"What do you have right now?"* · *"What are you hoping it
might become?"* — ⭐ **and both answers are provisional.** Then she encounters the material.

## 3 · The four objects

```text
MATERIAL   things the person has written or gathered
WORK       something that is becoming a coherent expression
FOCUS      what the writer and MAIA are attending to now
FORM       book · essay · series · course · …
```

> ⭐⭐ **MATERIAL DOES NOT AUTOMATICALLY BELONG TO A WORK.**

⛔ **187 journal entries, 34 essays, 12 transcripts, 5 unfinished chapters, voice notes, research,
poems — MAIA does not dump these into "Manuscript."** She helps the person **see what they have**.

```text
Theme A          → possible book
Theme B          → essay collection
Theme C          → future course
several pieces   → uncertain
```

⭐ **Those remain HYPOTHESES until the person decides. That is sovereignty applied to creative
organization.**

## 4 · ⭐⭐ CENSUS FINDING — THE ONTOLOGY IS ALREADY IN THE SCHEMA, AND BUILT CORRECTLY

**Checked against the tree rather than assumed.** `database/migrations/20260801000001_living_works.sql`
and its successors already model three of the four objects, with the sovereignty properties this
ruling now names:

```text
living_works                         THE WORK
  title, purpose                     ⭐ "The member's own words. Never generated, never inferred."
  ⛔ deliberately NOT unique per member
                                     ⭐ "a member may steward multiple Living Works"

living_work_expressions              FORM
  expression_type, expression_id     ⭐ open by design — manuscript, essay, course, series
  declared_by NOT NULL               ⭐⭐ "this row IS the member's declaration. It cannot be
                                        written without saying who declared it and when."

living_work_materials (20260805)     MATERIAL, belonging to a Work
living_work_material_considerations  what has been considered about it
living_work_visual (20260907)        the Work's own visual identity
```

⭐⭐ **`declared_by NOT NULL` is `suggestion ≠ addition` made STRUCTURAL, a month before it was
ruled.** A Work cannot acquire an expression without a named member act. **The Focus Set ruling's
`Add to Focus / Not now` is the same law at a different scale.**

⭐ **A member stewarding several Works is already representable** — so *"there are actually three
books in here"* has a home in the schema today.

### 4.1 🔴 THE ONE REAL GAP — MATERIAL WITH NO WORK

**`living_work_materials.living_work_id` is `NOT NULL`.** ⛔ **So material that does not yet belong to
any Work — the pile-of-writing case, which §5 says may be the platform's most distinctive part —
HAS NO HOME.**

> ⭐ **That is a small, well-shaped schema question, not an architecture question.** The ontology is
> right; it currently requires a Work to exist before material may be held, and the arrival case is
> exactly the one where no Work exists yet.

⛔ **Not authorized. Named so it is not discovered again.**

## 5 · ⭐ THE PILE OF WRITING — creative cartography

**Most tools assume `blank page → write document`.** A great many people actually have **twenty years
of thinking scattered across files, notebooks, talks, posts, recordings and unfinished drafts.**

⛔ **The problem is not generating more words.** It is: **what is here?** — and then: **what wants to
become something?**

```text
pieces ↕ themes ↕ questions ↕ relationships ↕ possible Works ↕ possible series
```

⭐ **The person can move pieces, reject MAIA's interpretation, merge possibilities, split them again.**
Eventually something is coherent enough to declare: **this is a Work.** Then the fuller developmental
machinery applies.

⭐ **Help someone discover that WITHOUT PREMATURELY SYNTHESIZING IT** — which is the same restraint
`F-ABSENCE` and the non-conclusion vocabulary already enforce, applied to organization rather than to
reading.

## 6 · MAIA's role changes with the stage of becoming

```text
AN IDEA        highly conversational — what keeps pulling you back? who are you
               speaking to? is there a question underneath the idea?
               ⛔ forcing an outline may kill something that has not found its shape
FRAGMENTS      archaeological — these seven circle the same question · these three
               contradict one another interestingly · this idea appears over six years
A DRAFT        developmental — this arrives before the reader has the foundation ·
               chapter four is doing two jobs · the experiential material is all late
A MANUSCRIPT   the mature collaborative revision loop
```

> ⭐ **Same MAIA. Different relationship to the Work.**

## 7 · ⛔ WRITE DOES NOT MEAN "OPEN A MANUSCRIPT EDITOR"

**The five rooms survive. What changes is what WRITE means:**

> ⭐⭐ **WRITE = bring the Work further into form.**

Sometimes a sentence. Sometimes moving six essays together. Sometimes discovering one chapter is the
seed of another book. **Sometimes deleting nothing and simply realizing what you are making.**

```text
ARRIVE    what exists?
   ↓
FIELD     ideas · notes · material · drafts · existing Works
   ↓
A WORK BEGINS TO FORM
   ↓
WRITE · DEVELOP · FOCUS · REVIEW · PUBLISH
```

## 8 · ⭐⭐ THE GOVERNING PRINCIPLE — near the top of the programme

> **MAIA MUST NEVER CONFUSE COMPLETION WITH DEVELOPMENT.**

⛔ **Her job is not to push every person through `idea → outline → draft → edit → publish`. That is a
manufacturing pipeline, and creative lives are not that clean.**

> ⭐ **At every point: help the person see more clearly what they have, what they are trying to bring
> into being, what capacities would help, and what next act would deepen the Work — without taking
> authorship away from them.**

⭐ **That serves the person with one sentence and the person with a 400-page manuscript without
making either conform to the other's process.**

⚠️ **And it composes with the central sentence already ratified in the D9 charter** — *a successful
developmental encounter returns the writer to the Work with more possibility, not to MAIA with more
dependency.* **Completion-as-success would be that drift wearing a deadline.**

---

## 9 · ⛔ STANDING

```text
the Work is the durable object      RULED
MATERIAL / WORK / FOCUS / FORM      RULED
material ≠ automatically a Work     RULED
orientation, not classification     RULED · ⛔ no wizard
WRITE = bring further into form     RULED
completion ≠ development            RULED — governing principle

living_works · expressions ·
  materials · considerations        ⭐ ALREADY IN THE SCHEMA, correctly shaped
declared_by NOT NULL                ⭐ suggestion ≠ addition, already structural
unattached material                 🔴 GAP — living_work_id is NOT NULL
cartography                         ⛔ NOT BUILT
arrival / orientation surface       ⛔ NOT BUILT
deploy                              HELD
```
