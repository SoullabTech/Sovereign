# EDITORIAL-LEGACY-LOCUS-DISPOSITION-01 — READ-ONLY

**Canonical** `212f417da`. ⛔ No mutation · ⛔ no repair · ⛔ no deletion ·
⛔ no `expected_text` touched · ⛔ no adoption merge.

> **THE QUESTION:** how can the system distinguish a chain opened under the old
> stored-text producer from a genuinely stale projected-text chain, **without
> mutating the chain itself**?

---

## 0 · THE ANSWER

⭐⭐ **Yes — reliably, and the discriminator is not invented.** It is the
projection authority already in the codebase, asked a different question:

```
given a chain and the heading of its target section,

    splitStoredSection(expected_text, heading) !== null
    AND its headingPrefix is non-empty

⟺  the frozen locus is a STORED slice, not a projected passage
```

⛔ **No new heuristic, no date rule, no shape guess.** `splitStoredSection` is
the single definition of what the member's editable body is; a legacy chain's
`expected_text` is `headingPrefix + body` **by construction**, so the same
function that defines the coordinate space recognises the text that was written
into the wrong one.

---

## 1 · THE POPULATION IS NARROWER THAN IT LOOKS

⭐ **Only chains on sections that HAVE a heading are at risk.** Where the heading
is `NULL` or blank, `splitStoredSection` returns `{ headingPrefix: '', body: text }`
— stored and projected coincide — so a pre-repair chain there is **already
correct** and there is no legacy/valid distinction to draw.

```
heading NULL / blank   → pre-repair chain is VALID, indistinguishable because
                         there is nothing to distinguish
heading present        → pre-repair chain is MALFORMED, and detectably so
```

## 2 · RELIABILITY, STATED HONESTLY IN BOTH DIRECTIONS

**⭐ No false negatives, by construction.** Every pre-repair chain on a headed
section was frozen as `heading + '\n\n' + body` (or `heading` alone), so it
satisfies the predicate exactly. ⛔ There is no legacy row the predicate misses.

⚠️ **One dependency, named: heading stability.** The predicate reads the
heading as it is **now**. If a heading could be renamed, a legacy chain frozen
under the old heading would stop matching. Today it cannot:

```
UPDATE manuscript_sections … SET heading   →  ⭐ NO SUCH STATEMENT ANYWHERE
                                              in lib/, app/ or database/
rename as a command                        →  WS2-08C, ⛔ UNOPENED
```

⛔ **So the discriminator is sound today and degrades the day 08C ships.** That
is a constraint 08C inherits, not a reason to reject the predicate now.

⚠️ **False positives are possible, rare, and fail SAFE.** A *valid* post-repair
chain would match if the writer literally repeated the heading as the first line
of the body — the projected body would then begin `Chapter Ten\n`. Authored,
uncommon, and the consequence is **a refusal to adopt**, never a false statement
about her manuscript. ⭐ That is the correct direction for an error to fall.

**⛔ A date rule is REFUSED, and not for style.** It would need an attributable
boundary — the moment the repaired producer reached production — and the
2026-09-07 finding established that this deployment lane keeps **no durable
record of completed deploys**: `deploy-lock.sh` overwrites its holder metadata on
every acquisition, so an acquisition record is gone hours later. ⛔ Inferring
from `opened_at` against a boundary nobody can evidence is exactly *"infer from
date unless proven"*.

**⭐ A second, stricter test exists for the common case**, offered as
corroboration and ⛔ not as the rule: a legacy chain whose section has not been
edited since satisfies `expected_text === <the section's current stored text>`
exactly. It is conclusive when it fires and silent when the section has moved,
so it can only strengthen the structural predicate, never replace it.

---

## 3 · IS THERE ANY DATA? — ⭐ THE DECISIVE QUESTION IS ONE COUNT

⛔ **No production database was read.** This container has no access, and none
was authorized.

⭐⭐ **But the question collapses to a single count, because `proposal_chains`
has exactly one live producer.** §Phase A established it:

```
INSERT INTO proposal_chains   exists in exactly ONE place
                              (proposalChain/store.ts:197)
reached by                    openChainWithExecutor
called by                     openEditorialRelationship   ← the editorial door
                              openChainWithInsight        ← ⭐ ZERO CALLERS
no migration inserts rows
```

So every row in that table came through the editorial door — and that door is
**off by default**:

```
WRITERS_STUDIO_EDITORIAL_ENABLED === '1'    read in 4 places
set in docker-compose*.yml                  ⛔ nowhere
set in Dockerfile*                          ⛔ nowhere
set in scripts/deploy*.sh                   ⛔ nowhere
set in .env.example                         ⛔ nowhere
```

⭐ **The only way it is on in production is a hand-edited `.env.production`,
which cannot be read from here.** Therefore the whole disposition turns on two
readings a founder can take in one connection:

```sql
SELECT count(*) FROM proposal_chains;
-- and, if non-zero, the malformed population:
SELECT c.id, c.opened_at
  FROM proposal_chains c
  JOIN manuscript_draft_sections ds ON ds.id = c.target_section_id
  JOIN manuscript_sections ms       ON ms.id = ds.source_section_id
 WHERE ms.heading IS NOT NULL
   AND btrim(ms.heading) <> ''
   AND c.expected_text LIKE btrim(ms.heading) || E'\n%';
```

⚠️ **The second query is the predicate expressed in SQL for a count only.** It is
⛔ not a refusal mechanism and ⛔ not a repair; the refusal point belongs in
application code (§5) where `splitStoredSection` itself can be the authority
rather than a `LIKE` that approximates it.

⭐ **If the first count is 0, there is no legacy population and the forward
repair is the whole fix.** That is the likeliest state and it should be
established rather than assumed.

---

## 4 · ⛔ REWRITING IS NOT MERELY FORBIDDEN — IT IS IMPOSSIBLE

```sql
CREATE TRIGGER proposal_chains_immutable
  BEFORE UPDATE OR DELETE ON proposal_chains
  FOR EACH ROW EXECUTE FUNCTION refuse_proposal_chain_mutation();
```

⭐ The database refuses **UPDATE and DELETE** on the whole row — *"the chain does
not evolve, only its versions do."* So "close the relationship" cannot be a
delete either, and any disposition must be **a decision about how the chain is
READ**, never about what it contains.

---

## 5 · THE NARROWEST NON-MUTATING REFUSAL POINT

⭐⭐ **A pure predicate, consulted by the adoption seam BEFORE it authorizes.**

```
adoptVersion
  ├─ derive chain from the owned thread
  ├─ ⭐ read the target section's heading · project · ask the predicate
  │     malformed → system_refusal          ⛔ RETURN HERE
  ├─ authorizeVersion          ← never reached for a malformed locus
  └─ executeAuthorization
```

Why **there** and nowhere else:

| candidate site | verdict |
|---|---|
| `authorizeVersion` | ⛔ changes authorization semantics for every caller |
| `evaluateExecutionFit` | ⛔ this is the `stale_base` classifier; putting it here IS reclassifying |
| `openEditorialRelationship` | ⛔ too late — the malformed rows already exist |
| a migration | ⛔ mutation, and refused by the trigger |
| ⭐ the adoption seam, before act 1 | **the malformed locus never reaches the classifier and no permission is minted** |

⭐ **This is not reclassifying `stale_base`.** It prevents a malformed historical
locus from ever being presented to the stale-base classifier as though it were
valid projected evidence. `stale_base` keeps its meaning exactly.

**What the member would see, per the ruling's preferred outcome:**

```
adoption            unavailable · system_refusal
the sentence        "The Studio can't safely adopt from this older editorial
                     relationship."
the relationship    ⭐ still readable · still comparable
manuscript claim    ⛔ none — and ⛔ never "you've written here since"
the chain           ⛔ untouched
```

⚠️ **And the read surface needs the same fact**, or the writer meets the refusal
only after choosing a version. The thread read already derives the target
section; the same predicate there would let the panel say adoption is
unavailable **before** she picks. ⛔ Named, not designed — and it is the only
place besides the seam that would need to know.

---

## 6 · WHAT THIS ACT DID NOT DO

```
⛔ no chain mutated, closed or deleted
⛔ no expected_text repaired
⛔ no date heuristic adopted
⛔ no refusal built
⛔ no production read
⛔ no adoption merge
```

## 7 · STANDING

```
detectable without mutation     ✅ YES — splitStoredSection on the frozen text
false negatives                 ⭐ none, by construction
                                ⚠️ depends on heading stability; WS2-08C would
                                   break it, and inherits that constraint
false positives                 ⚠️ rare, authored, and they FAIL SAFE
date-based discrimination       ⛔ REFUSED — no attributable boundary exists
population at risk              headed sections only
does any exist?                 ⚠️ UNKNOWN — one count answers it, and the door
                                   is off by default in every checked-in config
narrowest refusal point         ✅ the adoption seam, before act 1
read surface                    ⚠️ would need the same fact — named, not designed

implementation                  ⛔ NOT AUTHORIZED
adoption merge                  ⛔ NOT AUTHORIZED
production                      UNTOUCHED
```

---
---

# PHASE B — THE COMPATIBILITY GUARD

Built on the integrated Adoption candidate: new canonical `b9301bb12` (carrying
the forward locus repair) **+** ADOPTION-01 Phase B.
⛔ No merge · ⛔ no deploy · ⛔ not one chain row touched.

> **THE LAW:** a historically malformed locus must be identified **before**
> authorization, so it can never be mistaken for evidence that the member
> changed the Work.

## B0 · RESULT

```
integrated witness A–H     73 passed · 0 failed
predicate truth table       9 passed · 0 failed   (pure, permanent suite)
MU-G · guard removed        ⭐ dies, and dies into the false sentence
ship typecheck             229 vs baseline 239 · 0 regressions
WS + manuscript suites     4 failed / 16 tests — IDENTICAL to canonical
check:no-supabase          clean
```

## B1 · WHAT WAS BUILT — ONE PREDICATE, TWO CONSUMERS

`lib/manuscript/proposalChain/legacyLocus.ts` — pure, no database, no member:

```ts
locusSpaceOf(expectedText, heading): 'projected_section_body' | 'legacy_stored_section'
locusIsAdoptable(expectedText, heading): boolean
```

⭐ The discriminator is `splitStoredSection` — the single authority on what the
member's editable body is — asked a different question: *does this frozen text
carry a heading prefix?* ⛔ No date rule, no deploy boundary, no shape guess.

**Consumer 1 — the adoption seam, before act 1:**

```
adoptVersion
  ├─ derive chain from the owned thread ─┐ ⭐ the locus and its heading ride
  │                                      │    in the SAME statement
  ├─ ⭐⭐ locusIsAdoptable? ──── NO ──────┴─▶ legacy_locus · RETURN
  ├─ authorizeVersion                        ⛔ never reached
  └─ executeAuthorization
```

⛔ **The position is the whole repair.** Inside `evaluateExecutionFit` it would
**be** reclassifying `stale_base`; inside `authorizeVersion` it would change
authorization semantics for every caller. Here the malformed locus never reaches
the classifier and no authorization row is written — ⭐ `stale_base` keeps its
meaning exactly.

**Consumer 2 — the read surface**, so she learns it *before* she chooses:
`EditorialThreadView.legacyLocus`, from the same pure predicate, so the panel
and the act can never disagree.

**Member-facing, in system and historical language:**

> This older editorial relationship can't be safely adopted into the manuscript.
> You can still read and compare it.

⛔ No *"you changed the text."* ⛔ No *"conversion failed."* ⛔ No suggestion that
the relationship is corrupt or lost — it is neither.

## B2 · ⭐⭐ FOUR TRUTHS, AND THE MEMBER NEVER RECEIVES ONE FOR ANOTHER

```
untouched modern headed section   →  ADOPTABLE          F1–F4
genuinely edited section          →  work_moved         C3–C11
historical stored-space chain     →  legacy_locus       G1–G10
the Studio cannot execute         →  system_refusal     E1a–E1f
```

`legacy_locus` is its **own outcome family** and carries
`permission: { established: false }` **by construction** — the refusal precedes
the authorizing act, so it cannot be false.

## B3 · THE WITNESS — A–H, 73/0

```
F · MODERN HEADED SECTION
  F1 ⭐⭐ a headed section is ADOPTABLE
  F2 the heading survives exactly once
  F3 ⛔ and it is NOT reported as the Work having moved

G · HISTORICAL MALFORMED HEADED CHAIN
  G1  ⭐⭐ its own outcome family — ⛔ not work_moved, ⛔ not a system failure
  G2  ⛔ NO permission was established
  G3  ⭐⭐ ZERO authorization rows exist — the refusal precedes act 1
  G4  the manuscript is untouched
  G5  the draft did not advance
  G6  ⛔ stale_base was never consulted — no fit reason is reported
  G7  the read surface says so BEFORE she chooses
  G8  ⭐ the exchange is still readable
  G9  ⭐ and still comparable — its versions are all there
  G10 ⛔ the chain itself was not touched

H · HISTORICAL UNHEADED CHAIN
  H1 ⭐ a pre-repair unheaded relationship is STILL adoptable
  H3 ⛔ and the read surface does not call it legacy
```

⭐ **H is the guard's own falsifier**: it must not withhold adoption from
relationships that were never malformed.

### ⚠️ THE FIXTURE WAS WRONG AND THE DATABASE SAID SO

A first attempt opened a modern relationship and re-pointed the thread at a
legacy chain:

```
ask thread … is immutable in ownership, anchor, reading reference, canonical
baseline and editorial parent: a thread cannot be re-pointed at a reading or a
proposal it was not about
```

⭐ **The guard was right and the fixture was wrong — and the refusal made the
fixture more faithful, not less.** A legacy relationship was BORN legacy, so the
witness now performs the historical act: one chain INSERT carrying the stored
slice, one thread INSERT naming it, `anchor` NULL.

## B4 · ⭐ FALSIFIED

**MU-G — the guard removed.** The witness dies exactly where it must, and dies
**into the false sentence** this act exists to prevent:

```
G1  want [legacy_locus]  got [work_moved]
G6  want [null]          got [expected_text_absent]
```

⚠️ G7 still passes under MU-G, and that is correct rather than a weakness: the
read surface holds the same predicate independently. The predicate itself is
falsified directly by the permanent truth table below, which is the instrument
both consumers depend on.

**The truth table — `lib/manuscript/proposalChain/__tests__/legacyLocus.test.ts`, 9/9.**
⭐ Pure, so the law is falsifiable without a database, and it asserts the
documented failure rather than hiding it:

```
headed · stored slice / heading alone / single-newline form  → legacy
headed · projected passage                                    → current
unheaded (null · blank) — and text that merely LOOKS stored   → current
⚠️ the body repeating its own heading                          → legacy
   the writer's rare choice refuses an adoption; it NEVER asserts something
   false about her manuscript — the correct direction for an error to fall
```

## B5 · ⚠️ THE DEPENDENCY, PINNED IN SOURCE

The predicate reads the heading **as it is now**. No statement anywhere updates
`manuscript_sections.heading`, and rename is WS2-08C, unopened. The constraint
is written into `legacyLocus.ts` itself, not only here:

> ⛔ **WS2-08C may not open without accounting for immutable editorial loci** — a
> rename would make today's reliable discriminator unreliable tomorrow.

## B6 · ⛔ AND THE PRODUCTION COUNT IS NOT ARCHITECTURE

The guard is **not** conditional on finding rows. Immutable historical data
travels between environments, and the cost of letting one malformed chain
through is a false statement plus an authorization that could only fail.

```
count = 0   → no known member impact; the guard remains compatibility law
count > 0   → same code; we now also know which relationships will surface
              as readable and comparable but non-adoptable
```

The two founder queries stand in §3. ⛔ Still unread from here.

## B7 · STANDING

```
predicate                   ✅ pure · 9/9 · permanent suite
seam refusal                ✅ before act 1 · zero authorization rows
read surface                ✅ the same predicate, one implementation
four truths                 ✅ discriminated · 73/0 across A–H
falsified                   ✅ MU-G dies into the false sentence

⛔ UPDATE proposal_chains          none
⛔ DELETE proposal_chains          none
⛔ expected_text rewritten         none
⛔ date heuristic                  none
⛔ stale_base semantics            unchanged
⛔ splitStoredSection              unchanged
⛔ heading rename work             none
⛔ production deployment           none

adoption merge              ⛔ NOT AUTHORIZED
production                  UNTOUCHED
```
