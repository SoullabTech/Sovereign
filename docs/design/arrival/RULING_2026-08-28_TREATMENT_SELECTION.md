# Arrival exploration — founder ruling and Treatment D

**Date:** 2026-08-28 · **Authority:** founder, step 4 of the authorized cinematic lane.
**Status:** exploration record. ⛔ Nothing adopted. `UnifiedAuth.tsx` untouched. The
Experience Contract's evidence fields remain deliberately unfilled.

---

## 1 · Ruling

```
ARRIVAL EXPLORATION A     REJECTED AS FINAL
                          retain: light-as-material principle
ARRIVAL EXPLORATION B     REJECTED
                          reason: meaning depends on motion; reduced-motion collapse
ARRIVAL EXPLORATION C     STRUCTURAL DONOR
                          retain: near-stillness · quieter action · containment-first hierarchy
NEXT                      ARRIVAL-TREATMENT-D
```

**Governing direction for this surface:**

> ### Stillness first. Light confirms depth; it does not announce it.

Which means: C's restrained hierarchy and quieter action · A's material light, substantially
reduced · no parallax · no ambient drift · no delayed orientation · one threshold gesture at most ·
nothing that disappears meaningfully under reduced motion. The mark must belong to the same
compositional field as the form — closer, lower, spatially integrated — so desktop reads as
intentional rather than merely spacious. **The 1440px weakness needs relationship, not scale.**

**Motion allowance — exactly one gesture:** on first arrival the field resolves from slight
optical softness into clarity (~400–700 ms), then complete stillness. Not movement through space.
Reduced motion starts at the resolved state.

---

## 2 · Two corrections to the record

Both are errors in the material the ruling was formed against. Recorded rather than quietly fixed,
because one of them changes what the ruling was reacting to.

### 2.1 The gold filled button was mine, not the product's

A and B carried a full-width `#D4AF37` filled primary action, and I reported it as loud. The
ruling reasonably read that as a critique of the arrival surface.

It is not. **The shipped primary action is `bg-maia-navy-700` — `#1E3A5F`, navy**
(`PRIMARY_BTN`, `UnifiedAuth.tsx:87`). Gold appears on that surface only as
`text-amber-300/90` on one `/signup` link. The filled gold CTA existed nowhere but in my
mockups.

So the ruling's judgment stands as a rule for the surface — *visual emphasis must not arrive
before relationship* — but it corrects an invention of the exploration, not a defect of the
product. On this axis the shipped arrival was already more restrained than A or B.

### 2.2 A, B and C all under-showed the door

They rendered three text links. The real `/signin` email step carries **five ways in**: Continue,
biometric, username + password as an explicit peer path, an `or` divider, and a Google/Apple row
(`UnifiedAuth.tsx:615–682`). The comments there record that the password path was deliberately
promoted out of footnote size in 2026-08-24 because returning members could not find it.

Every earlier treatment was therefore judged on a simplified door. **D carries the real action
set**, because "restrained action" is only proven against the actions that actually exist.

---

## 3 · Treatment D — `treatment-d-resolve.html`

C-derived, per the ruling.

| Ruling requirement | How D answers |
|---|---|
| stillness first | no card, ruled input, near-still; one gesture that ends |
| quieter action | every action outlined at equal weight; primary distinguished by **order** and one hairline of warmth, never by fill |
| A's material light, reduced | two low radial washes at ~8–10% opacity, centred on the **encounter** (46% height), not up at the mark |
| desktop spatial integration | a vignette gathers the column into one lit body against a darker surround — relationship, not scale |
| mark belongs to the encounter | 72px, sitting directly on the heading inside the same column |
| no parallax / no drift | none; the only transitions are focus responses |
| one non-load-bearing resolve | optical softness → clarity; layout, position and content are identical at frame one |
| reduced motion | starts resolved — `--blur-in:0px`, `--soft-in:1`, on the shared token (`MOTION_GRAMMAR §5.1`) |

A `reference-shipped.html` was built alongside it for the comparison the ruling asked for.
**It is a static reproduction, not a capture** — rebuilt from the literal values in
`UnifiedAuth.tsx` and `tailwind.config.js`. It cannot reproduce the real Holoflower, Spectral as a
loaded face, framer-motion's mount fade, or any runtime state. A true before/after needs a browser
capture of `/signin` on the Mac Studio or minisforum, and that is still owed.

---

## 4 · What the renders showed

Rendered at 390 · 768 · 1440 · 1728 and at 1440 with `prefers-reduced-motion: reduce`
(`shots-d/`). No console errors, no horizontal overflow, no vertical scroll at any width.

**Resolved — the desktop weakness that killed C.** At 1440 and 1728 the vignette plus the
gathered column hold the encounter together; the field falls away at the edges instead of
stranding the form in empty space. This was the ruling's central structural ask and it is met.

**Open — three findings, offered as findings:**

1. **The gesture is front-loaded, and lands sooner than the allowance intends.** Measured on the
   running page: `blur` 4.8px at 40 ms → 2.0px at 200 ms → 0.9px at 300 ms → visually resolved by
   ~420 ms, animation formally complete at 560 ms. So the *perceived* settle is roughly 300 ms,
   not 400–700. If the intent is a settle the eye can feel across that window, the easing is the
   thing to change (less front-loaded), not the duration. Worth deciding explicitly rather than
   letting the curve decide.
2. **The weight problem at the door is quantity, not treatment.** With every action equally
   restrained, the surface still resolves into three stacked full-width bars, a divider, an icon
   row and a footer link. Restraint of *style* cannot fix an abundance of *doors*. If the arrival
   still feels heavy in D, the honest next question is not visual — it is whether five ways in
   belong on first contact, or whether some belong one step further in. That is a product ruling,
   not a design one, and it is not mine to make.
3. **The loudest colour on the surface is now Google's.** With Soullab's own accent reduced to a
   hairline, the two four-colour third-party marks are the most saturated elements on the page.
   They are mandated by the providers and not freely restyleable. Naming it because "reduce our
   accent" quietly hands the visual centre to someone else's brand.

---

## 5 · A canon question this raised — not self-authorized

The ruling's line — *light confirms depth; it does not announce it* — is sharper than what
`SOULLAB_MOTION_GRAMMAR §6` currently says (*light behaves as material, not as effect*). It reads
like a candidate refinement of that clause.

**Not promoted.** It was stated as direction for this surface, and canon that generalizes a
one-surface judgment before a second surface has tested it is exactly the shelf-charter failure
the contracts README warns about. Recorded here; promote it only if a second threshold needs the
same rule.

---

## 6 · Status after step 4

```
docs/design/arrival/          exploration · A B C rejected/donor · D built · gate-free
docs/canon/SOULLAB_MOTION_GRAMMAR.md   canon · unchanged by this ruling
docs/design/contracts/arrival-threshold.md   covering · evidence deliberately unfilled
components/auth/UnifiedAuth.tsx        UNTOUCHED
```

Still owed before adoption can be considered: a real browser capture of the shipped `/signin` for
a true before/after, a decision on findings 1–3, and — only then — the contract's desktop and
mobile witness and its recorded experiential verification.

**The durable result of steps 1–4 is not a winning design.** It is that the arrival surface now
has a written list of what it must refuse: spectacle, ambiguity, motion-dependent identity, and
visual emphasis that arrives before relationship.
