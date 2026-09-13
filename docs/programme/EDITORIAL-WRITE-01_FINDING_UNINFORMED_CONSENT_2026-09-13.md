# EW-F1 — the staged diff produces uninformed consent

**Found by** founder, at the moment of authorizing the first manuscript change
**Subject** `9ca89fc54` · proposal `b18272d5` · *Elemental Alchemy* v34
**Disposition** ⛔ **SPECIMEN NOT SPENT.** The proposals stay open; the Work
stays at v34.

> *"I see the cryptic changes but we need a full interactive field like the
> Canvas to work this out. Otherwise, I'm trusting edits I don't understand."*

---

## 1. The finding

⭐⭐ **A consent surface that produces uninformed consent is worse than none.**
It manufactures the appearance of authorization. Everything this programme has
built — the exact-text guard, single-use acceptance, the id-only request, the
reread from storage — exists to make one sentence true: *the member saw this
exact change and authorized it.* A panel the member cannot read makes the
second half false while the record says it happened.

⛔ **Not spending the specimen was the correct act**, and the surface did its
job by making its own inadequacy visible BEFORE authorization rather than after.

## 2. What was actually wrong

```text
uth of the path becoming clear,        ← cut mid-word ("truth")
supported by the elements.
-- 34 of 216 --
35
Chapter 3: Understanding the
Trinity and the Toroidal Flow
WITNESS-ALPHA                          ← struck
```

| # | defect |
|---|---|
| 1 | the window is an arbitrary 140 code points, cut mid-word — it respects no sentence or paragraph boundary |
| 2 | it renders in a ~20-character gutter, so authored prose is read at a width it was never written for |
| 3 | ⭐⭐ **it is detached from the Work.** The manuscript pane beside it showed the FRONT MATTER. The writer can see the change and cannot LOCATE it |
| 4 | a deletion survives this; a replacement or a move would not be comprehensible at all |

⭐ Defect 3 is the real one. The others are dimensions; that one is a category
error about where evidence belongs.

## 3. ⭐⭐ THE CENSUS ANSWER — the in-place marking already exists

```text
app/writers-studio/field/FocusOverlay.tsx
  FocusOverlay({ body, start, end, paint })
  renders the whole body in transparent ink so glyphs land exactly,
  then marks the run

app/writers-studio/field/focusPaint.ts
  what a mark LOOKS like, per treatment, pure and falsifiable
  "Declaration is not rendering. This module is the place the two meet."
```

The Focus lane has been marking passages **inside the writer's manuscript** for
weeks. The proposal surface reimplemented a worse version of it as a fragment in
a side panel.

⛔ **Third time the door census has paid in this programme**: the write already
existed (`saveSectionInTransaction`), the append-only member-authored chain
already existed (standings), and now the in-place marking already exists. The
pattern is not "Soullab keeps rebuilding things" — it is that **each lane
reaches for a surface before asking what the Work already does.**

## 4. The shape this argues for — ⛔ NOT BUILT, founder ruling owed

> **Evidence belongs in the Work. The decision belongs in the panel.**

That is the Focus architecture's own division, applied here: the strip names the
places, the manuscript shows them.

```text
MANUSCRIPT (the writer's own reading surface)   PANEL (the decision)

  §23, opened and scrolled to the change          PROPOSED CHANGE
  the full section, at reading width              Section 23 · “…”
  the removal marked IN PLACE via FocusOverlay
                                                  1 change
  …the truth of the path becoming clear,
  supported by the elements.                      [ Keep unchanged ]
                                                  [ ACCEPT CHANGES ]
  -- 34 of 216 --
  Chapter 3: Understanding the Trinity…
  ~~WITNESS-ALPHA~~
```

What that changes in the panel: the prose fragment, `contextBefore` and
`contextAfter` **go away entirely**. The panel stops carrying evidence it is the
wrong shape to carry.

## 5. Open questions the founder owns

```text
Q1  does the Canvas NAVIGATE to the target section when a proposal is open,
    or does it refuse to show the surface until the writer is already there?
    (Moving the writer's view is an act; so is asking them to find it.)

Q2  for a replacement — not this specimen — is marking enough, or does the
    writer need a genuine before/after?

Q3  does the preview still carry text at all once the Work shows the change,
    or does it become coordinates + the decision only?
    ⭐ If coordinates only, the accept surface stops transporting prose
    entirely, which is a smaller disclosure surface than today's.
```

⭐ **Q3 is worth noticing.** The repair may make the consent surface carry LESS
of the member's Work than it does now, not more — the writer reads their own
manuscript, and the panel names a range.

## 6. Standing

```text
EW-F1                    OPEN · founder ruling owed
specimen                 UNSPENT · both proposals open · Work at v34
consent surface          BUILT but INADEQUATE for informed consent
in-place marking         EXISTS · FocusOverlay + focusPaint · unused here
manuscript               v34 · untouched
production               untouched
```

⛔ **Do not accept a proposal through the current surface.** Not because the
machinery is wrong — it is witnessed correct — but because an authorization the
member could not read is not the thing this lane set out to prove.
