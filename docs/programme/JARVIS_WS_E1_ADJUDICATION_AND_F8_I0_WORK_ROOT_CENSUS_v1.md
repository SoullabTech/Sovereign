# JARVIS — WRITER'S STUDIO FLAGSHIP FLOW 01
# E1 Adjudication + F8-I0 Work-Root Current-Runtime Census v1

Programme: `JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01`

Current canonical verified:
`b23ae2d7fd31ee56841af3930b31658ab286a2a3`

Current flagship branch head verified:
`b7bf9a42885867cc2f5f5cc00e327d0c4dd5f8ab`

Production: UNTOUCHED

---

# I. B-I / B-IR1 — RE-ADJUDICATION

Final B-I law lineage:

```text
3a6f7de09  B-I
17dacc69b  B-IR1 member-confirmation law
d23d07ceb  vocabulary conformance: member_confirmation_required
```

Independent source check confirms:

```text
posture unresolved
→ REFUSE posture_unresolved

Sanctuary
→ REFUSE sanctuary

standard + memberConfirmed = false
→ REFUSE member_confirmation_required

standard + memberConfirmed = true
→ persistence may proceed
```

## Ruling

> **B-I / B-IR1 = PASS.**

Evidence:

```text
reference laws       21/21
defeat candidates    18/18 dead
matrix               LETHAL + DISCRIMINATING
evidence class       E1
runtime persistence  ABSENT
```

This establishes the governing member-place law.

It does not authorize:
- member_observations table;
- migration;
- API;
- resume store;
- runtime write;
- deployment.

F5 remains separately authorized only by a future executable act.

---

# II. F7-C1 — INTENT-FIRST LAW ADJUDICATION

Final F7 law lineage:

```text
97e9c5d7e  F7-C1
b7bf9a428  required footer conformance only
```

No F7 law or behavior changed in the footer follow-up.

## Ruling

> **F7-C1 = PASS.**

Evidence:

```text
reference             15/15
defeat candidates     15/15 dead
matrix                 LETHAL + DISCRIMINATING
evidence class         E1
intent UI              ABSENT
reading runtime        NOT PROVEN
```

Accepted footer:

```text
INTENT-FIRST LAW GREEN
GREEN LAW · INTENT-FIRST CAPABILITY NOT YET IMPLEMENTED
```

Runtime implementation remains separate.

---

# III. F8-C1 — FIRST ARRIVAL / WORK-ROOT LAW ADJUDICATION

F8 law candidate:

`b51390c729770f92e749877ab76fd859391b9b5b`

Its F8 files remain byte-unmodified through current branch head `b7bf9a428`.

## Ruling

> **F8-C1 = PASS.**

Evidence:

```text
reference             16/16
defeat candidates     15/15 dead
matrix                 LETHAL + DISCRIMINATING
evidence class         E1
Work-root runtime      ABSENT
resume persistence     ABSENT
```

Accepted footer:

```text
FIRST-ARRIVAL LAW GREEN
GREEN LAW · FIRST-ARRIVAL CAPABILITY NOT YET IMPLEMENTED
```

---

# IV. Evidence Standing

These are Founder-accepted E1 law instruments.

They are **not E7 canonical admission** because the commits remain on the flagship branch and have not been admitted to `clean-main-no-secrets`.

Correct standing:

```text
B-I       E1 GREEN · FOUNDER ACCEPTED
F7-C1     E1 GREEN · FOUNDER ACCEPTED
F8-C1     E1 GREEN · FOUNDER ACCEPTED

canonical branch        unchanged
production              untouched
```

No merge authority is implied.

---

# V. F8-I0 — CURRENT-RUNTIME CENSUS

Authority: READ-ONLY  
Status: COMPLETE in this record

Question:

> Where does Work selection live today, and where should the new Work-root arrival state belong without creating a fourth Studio mode?

---

# VI. Current Product-Level Studio Root

Route:

`/writers-studio`

Implementation:

- `app/writers-studio/page.tsx`
- `app/writers-studio/HomeView.tsx`
- `app/writers-studio/homeState.ts`

This is a **real existing product surface**, not an invented navigation label.

It currently owns:

- Work listing/shelf;
- Work creation;
- blank manuscript creation;
- Work ↔ manuscript declaration;
- import entry;
- source/notes intake;
- unclaimed manuscript orientation;
- deletion/removal;
- existing Work selection;
- links into the writing host.

Therefore:

> `/writers-studio` is currently the product-shell **Work selection / Work shelf** surface.

It is not the same thing as the flagship's member-facing `Home` mode that was removed from `Write · Develop · Review`.

---

# VII. Important Distinction: Existing Home vs Flagship Home Defect

Two different concepts have been sharing the word `Home`.

## Existing `/writers-studio`

A real route with real capability:
- choose/create/import Works;
- open writing;
- manage the Work shelf.

## Retired flagship `Home`

A primary Studio mode/destination rendered beside Write/Develop/Review with no corresponding flagship room.

That second use was capability-false and was correctly removed.

Therefore:

> **The existence of `/writers-studio` does not justify restoring `Home` to flagship mode navigation.**

The route may remain a product-shell Work shelf.

The mode remains retired.

---

# VIII. Current Work Selection Authority

Work selection is already governed by two layers.

## Product-shell selection

At `/writers-studio`, the member chooses or creates a Work/manuscript.

New Work flow:

```text
POST living_work
→ POST blank manuscript
→ declare manuscript as Work expression
→ route to /writers-studio/rebuild?m=<manuscript>
```

Import routes similarly begin from the shell.

## Inside selected Work

`app/writers-studio/workContext.ts` derives current Work from:

```text
manuscript identity
+
member's explicit Work declarations
```

States:

```text
0 declaring Works → none
1 declaring Work  → exact Work
2+ declaring Works → ambiguous
```

No stored last Work is consulted.

No ranking chooses between declarations.

This existing law is compatible with F8.

---

# IX. Current Manuscript Identity

Selected manuscript travels through:

```text
?m=<manuscriptId>
```

owned by `canvasIdentity.ts`.

The newer resolver contract distinguishes:

```text
resolved
unresolved
ambiguous
empty
```

and explicitly rejects silent substitution when an exact requested identity cannot be resolved.

That is the correct authority substrate for Work-root entry.

---

# X. Current Place Identity

Within the selected manuscript, current place is addressed by:

```text
?s=<draftSectionId>
```

through the existing `placeInWork` grammar.

Mode switching may carry:

```text
Work identity + section identity
```

without inventing a new address grammar.

No durable per-Work resume state exists yet.

---

# XI. Existing Arrival Logic at Product-Shell Level

`homeState.ts` currently computes:

```text
CONTINUE
ORIENT
BEGIN
```

using real writing/manuscript facts.

It may feature a Work with member draft activity, but:

- it does not auto-open that Work;
- it shows alternatives;
- the member still chooses.

Therefore this is a **chooser/orientation surface**, not the forbidden cold-start automatic Work selection.

It should not be confused with the future selected-Work `RETURNING_WORK` state.

---

# XII. Current Canonical Working Host

Route:

`/writers-studio/rebuild?m=<manuscript>`

Implementation:

- `app/writers-studio/rebuild/page.tsx`
- `RebuildStudioClient.tsx`

This remains the existing canonical working host.

It already:

- receives exact manuscript identity;
- reads exact optional section identity;
- derives Work context;
- holds the manuscript;
- holds writing;
- hosts existing contextual MAIA/editorial surfaces;
- links back to `/writers-studio` as `All Works` / Workbench.

Therefore:

> **The selected-Work Work-root arrival state belongs with the working host, not with a new Home mode.**

---

# XIII. F8 Work-Root Ownership Ruling

The minimum product architecture should be:

```text
/writers-studio
PRODUCT-SHELL WORK SHELF / SELECTION
        ↓ explicit member selection
/writers-studio/rebuild?m=<id>
SELECTED-WORK HOST
        ↓
WORK-ROOT ARRIVAL STATE
        ↓
Write · Develop · Review
```

No fourth Studio mode.

No new Home route.

No global last-Work auto-open.

---

# XIV. What "Work-Root Arrival State" Means

Inside an already selected Work, before or over the normal working state, the host may recognize:

```text
NEW_WORK
EXISTING_WORK
RETURNING_WORK
IMPORTED_INCOMPLETE_WORK
UNREAD_WORK
STALE_READ_WORK
```

Then it resolves into the same Work's modes.

The state may be implemented as:

> **an arrival composition/state inside the selected-Work host**

rather than a separate route.

That is the preferred minimum.

---

# XV. Existing Legacy Navigation Conflict

The existing `StudioModeBar` / `STUDIO_MODES` still reflects an older mode grammar:

```text
Write
Develop
Explore
Review
Publish
```

with unavailable previews.

The flagship law is now:

```text
Write · Develop · Review
```

This is a real runtime reconciliation issue.

F8 must **not** solve it opportunistically unless its implementation act explicitly includes the selected-Work shell convergence.

The old mode bar is evidence of current runtime, not authority to restore Explore/Publish.

---

# XVI. Existing Studio Map

`STUDIO_MAP` still contains a real product-shell destination:

```text
Home → /writers-studio
```

This is acceptable **only in the broader product map meaning**:

> all Works / Studio shelf

It must not leak back into flagship primary mode navigation.

A future language cleanup may prefer:
- All Works
- Works
- Studio

over `Home`, but naming is not required to implement F8.

---

# XVII. Current Flagship Candidate Status

The new flagship components under:

`app/writers-studio/flagship/**`

have E4 controlled-component renders with fixture data.

They are not yet the selected-Work runtime host.

Therefore F8 implementation must not pretend that creating an arrival state in the test candidate makes `/writers-studio/rebuild` a flagship runtime.

Runtime integration remains a separate product act.

---

# XVIII. New Work

Current new-Work creation is already honest at the shell:

```text
create Work
create blank manuscript
declare belonging
route exact manuscript identity
```

F8 should reuse this substrate.

Do not invent a second new-Work creator in the flagship arrival state.

Once routed into the selected Work:

> First Arrival may recognize it as `NEW_WORK` and immediately offer writing.

---

# XIX. Imported / Incomplete Work

Current shell already has import/source intake and can surface unclaimed manuscripts.

F8 should not duplicate ingestion.

The selected Work host may truthfully describe:
- imported;
- incomplete;
- unnamed sections;

only where existing substrate supplies those facts.

---

# XX. Returning Work

Current product has no durable `member_resume`.

Until F5 (or equivalent) implements the accepted per-Work resume contract:

Allowed:
- selected Work identity;
- route-carried section;
- explicit Work context;
- existing stale-reading facts.

Not allowed:
- "You last worked here";
- automatic last mode;
- automatic last durable place.

The F8 runtime must degrade honestly until resume exists.

---

# XXI. Review Runtime Conflict

Current `/writers-studio/review` is an older **structure proposal review route**, not the new flagship Review mode.

Therefore:

> F8 must not route `Review` to `/writers-studio/review` merely because the path exists.

The new flagship Review runtime destination remains unresolved until integration work gives it a real host.

This is exactly the capability-honesty problem F8 exists to prevent.

---

# XXII. Develop Runtime

`/writers-studio/develop?m=<id>&s=<section>` is a real current route.

It can carry Work/place identity.

However its current visual/runtime implementation predates the final flagship Develop candidate.

So:

> route capability exists;
> flagship Develop runtime convergence is still separate.

---

# XXIII. F8-I0 Conclusion

The current product already has the two authority layers F8 needs:

```text
PRODUCT SHELL
/writers-studio
→ member selects/creates/imports a Work

SELECTED WORK
/writers-studio/rebuild?m=
→ exact manuscript
→ derived Work context
→ exact optional place
```

Therefore:

> **Do not build another Home.**
>
> **Do not build another Work chooser.**
>
> **Do not create another route merely for arrival.**

The minimum F8 implementation is an **arrival state within the selected-Work host**.

---

# XXIV. Exact Next F8 Boundary

The next executable F8 act should be:

> **`JARVIS-WRITERS-STUDIO-FLAGSHIP-FLOW-01 / F8-I1 — SELECTED-WORK ARRIVAL STATE IMPLEMENTATION` ONLY**

But do not open it yet without acknowledging one integration dependency:

> the current `/rebuild` runtime shell and the new flagship visual shell are not yet one runtime.

Therefore F8-I1 must declare whether it:

### Option A
implements only the state machine/data selection behind arrival, with no flagship shell integration;

or

### Option B
integrates the first-arrival composition into the selected-Work flagship host as part of a separately authorized runtime-convergence act.

Do not hide that architectural choice inside component work.

---

# XXV. Recommended Next Programme Step

Before F8-I1, resolve the selected-Work runtime convergence:

> **`FLAGSHIP-RUNTIME-CONVERGENCE-01 / C0 — CURRENT HOST ↔ FLAGSHIP HOST COMPOSITION CENSUS`**  
> READ-ONLY

Objective:

Map exactly:
- what `/writers-studio/rebuild` currently owns;
- what flagship Write/Develop/Review components own;
- which functions/state/data must remain canonical;
- which candidate components are presentation-only;
- what minimum host composition makes the accepted flagship a real runtime without replacing proven writing/editorial substrate.

This is the missing bridge between:
> beautiful governed candidate

and:
> actual Writer's Studio members use.

---

# XXVI. Programme Standing

```text
V10                         E6 PASS
B-I / B-IR1                 E1 PASS · Founder accepted
F7-C1                       E1 PASS · Founder accepted
F8-C1                       E1 PASS · Founder accepted
F8-I0                       READ-ONLY CENSUS COMPLETE

B-I runtime persistence     ABSENT
F7 runtime                  ABSENT
F8 arrival runtime          ABSENT
flagship runtime host       NOT YET CONVERGED
production                  UNTOUCHED
canonical                   b23ae2d7f
flagship branch head        b7bf9a428
```

---

# XXVII. Governing Product Ruling

> `/writers-studio` is the Work shelf and selection surface.
>
> A selected Work lives in the working host.
>
> First Arrival belongs inside that selected Work.
>
> Write, Develop, and Review are ways of being with the Work — not routes competing with a Home dashboard.

