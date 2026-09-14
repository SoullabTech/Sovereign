# EW-F2 · Step 2 — proposal work mode · witness result

**Status** EVIDENCE PRESENTED. Closure is a founder act and is not asserted here.
**Database** `maia_focus_witness` only. Production untouched; `maia_consciousness` untouched.
**Proposal** `a734677d-bba9-4981-83ae-8b00d67d1a22` · base v40 · `inspection_only` ·
`", fixated"` in §23 · fixture, **not** an editorial recommendation.

---

## What was proved

### EW-F1a · structural inspection authority — DATABASE WITNESS

Founder-run, against a row that existed, with both mutations reaching the
intended protection and each protection naming itself:

```
UPDATE … SET accepted_at = now(), resulting_version = base_version + 1
  ERROR  violates check constraint "mrp_inspection_only_never_accepted"
  DETAIL failing row carries resulting_version 41 ALONGSIDE accepted_at,
         so mrp_acceptance_whole cannot have been what refused

UPDATE … SET execution_authority = 'member_acceptance'
  ERROR  execution_authority is immutable (inspection_only -> member_acceptance);
         a proposal that may cross into the Work is a new proposal,
         not a relabelled one
```

Custody after both attacks: `40 · inspection_only · NULL · NULL`, draft still 40.

⛔ **The earlier `UPDATE 0` runs are not part of this evidence.** They matched no
rows, because no inspection-only proposal existed yet. *A constraint that was
never reached did not hold.*

### Runtime obligations

```
PW-1   §23 mounts no manuscript-writing control            WITNESSED, both views
PW-3   exactly one section suspended                       WITNESSED (caret in a
                                                           neighbouring section)
PW-5   the reason is stated, not inferred                  WITNESSED
PW-8   stated in Whole view too                            WITNESSED
PW-9   Whole view locates the exact range                  WITNESSED
PW-12  the mark survives the target becoming proposal-owned WITNESSED
PW-13  Whole view carries no accept, no staged authoring   WITNESSED
PW-14  the body is rendered exactly once                   WITNESSED
PW-15  the change sits at the exact locus                  WITNESSED
PW-17  text proposed to leave is visibly distinguished     WITNESSED
PW-19  surrounding prose stays in normal reading flow      WITNESSED
EW-F1a the accept control is ABSENT                        WITNESSED
```

The visual specimen, in both views:

> Elemental alchemy connects us with wisdom beyond the reactive**[**~~, fixated~~**]** mind.

with the bracketed locus crossing a line wrap in Section view — the harder
geometry, chosen deliberately for that reason.

---

## What this cost, and what it taught

⭐⭐ **Two acceptances happened that nobody authorized.** v34→v35 and v35→v36, the
second with no corresponding authorial act anywhere in the record. Classified by
the founder as **system acceptance record REAL · authorial ratification
UNRESOLVED**, and left standing rather than rewritten.

The finding is architectural. Every other constraint in this lane was
structural — the write flag, the staging script's refusal to touch a database
without `witness` in its name, the exactly-once guard, the one-live-proposal
guard. *"This one is for inspection only"* was the single constraint held by
discipline alone, and it is the one that gave way. **A rule that exists only in
a conversation is not a constraint.**

⭐ **Three defects in this step were mine, and two were invisible to my own
instruments.**

- The proposal renderer was declared at three hops and passed at one. PW-1
  asserted what the surface does WHEN CALLED and nothing asserted that anything
  calls it. *A link is not a binding.*
- Scoping the proposal to Section view silently retired the EW-F1 mark in Whole
  view. *Authority may differ by mode; truth about that authority may not.*
- PW-16 used `scrollIntoView`, banned in this room since 2026-09-11 — and my own
  obligation asserted the banned call BY NAME, so it would have stayed green on
  it forever. *Naming an API is not naming a property.*

⚠️ **And one instrumentation failure.** PW-3 was put to the founder as "did a
caret appear". The Studio's editors are transparent and borderless by design, so
a writable section and a suspended one are pixel-identical; a screenshot cannot
carry that answer. Repaired with `scripts/witness/ew-f2-authority-census.ts`,
which asks the server the same two questions the route asks.

---

## Standing

```
EW-F1a                  BUILT · database-witnessed · three independent refusals
proposal work mode      BUILT · runtime-witnessed in both views
PW-1 … PW-19            WITNESSED
manuscript              v40 · untouched by this witness
a734677d                open · inspection_only · accepted_at NULL
972adae6                open · base 34 · stale
b18272d5 · 42ff8f5c     accepted · NOT rewritten · ratification UNRESOLVED
--executable            UNUSED, and staying unused
production              UNTOUCHED
```

⛔ **Held, per the ruling:** editable staged proposal · successor-version chain ·
`replace_exact_text` · Ask MAIA to revise · multi-change sets · MAIA's editorial
rationale. All of it waits on staged-version succession, which is step 3.

> *The Work is the comparison surface. The proposal is rendered into it without
> yet becoming it.*
