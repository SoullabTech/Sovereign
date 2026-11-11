# WS-DEVELOP-REFINEMENT-01 — design research: calm, focus and writer-chosen density

Date: 2026-11-10 · Status: RESEARCH NOTE, authorizes nothing · Lane: WS-DEVELOP-REFINEMENT-01 (not yet opened)
Input to: the ranked refinement list and the founder's three open decisions (what first, where the density control lives, per writer or per Work).

Method: web search only (8 searches). No member data, no repository source sent anywhere. Sources were read as search excerpts, not full papers; check the originals before quoting any figure.

## Bottom line

No study found tests ADHD writers in a long-form writing tool. The useful evidence is adjacent (menus in Word, IDE layouts, accessibility guidance) and mostly small or old. Read together it supports the founder's direction, with three cautions.

1. **Let the writer choose; don't let the system decide.** The best evidence (Findlater & McGrenere 2004; McGrenere et al. field study on Word 2000) found people preferred interfaces they customised themselves over ones that hid items automatically, and the automatic version was not faster. This matches the facet law already ruled: density is member-declared, never inferred.
2. **Calm is not best for everyone.** An IDE study of people with ADHD symptoms found a busy layout suited some and a sparse one suited others. So "calm" should be the default, not the only option, which is what the brief already says.
3. **Predictability matters as much as sparseness.** Things that appear and disappear on their own, or move, add load. Folded controls should always fold into the same known place.

## Findings

| # | Finding | Strength | Source |
|---|---|---|---|
| F1 | User-customised (adaptable) menus were preferred over system-adapted ones, and adapted ones were not faster | Controlled study, 27 people; plus field study, 20 people | Findlater & McGrenere 2004; McGrenere et al. |
| F2 | A two-interface design (a small personal interface plus a toggle to the full one) was favoured in a field trial of Word | Field study, 20 people | McGrenere et al. |
| F3 | Not every result agrees: one summary reports static menus fastest | Secondary summary | Al-Omar & Rigas 2008 |
| F4 | For people with ADHD symptoms, the best amount of on-screen load varied by person | Lab study | JetBrains / Neapolis IDE study |
| F5 | An adaptive interface lowered self-reported load for adults with ADHD traits | Preprint, 11 people, not peer-reviewed; and it is system-adaptive, which our canon rules out | AttentionGuard preprint |
| F6 | Some ADHD users prefer text to visualisations | Same preprint | AttentionGuard |
| F7 | Avoid unneeded pop-ups and animation; use personalisation to remove extraneous material; keep information within about three steps | W3C accessibility guidance | W3C COGA "Making Content Usable" |
| F8 | Progressive disclosure works only if the split between first-layer and second-layer features is right | Expert guidance | Nielsen Norman Group |
| F9 | Apply density consistently across the whole surface, not one component at a time; offer it as a user choice | Design-system guidance | Material Design |
| F10 | Writing tools use one quick toggle in and out of focus (iA Writer ⌘D, Scrivener Composition Mode); some writers find faded text disorienting and prefer the gentler typewriter mode | Product documentation and reviews, not research | iA, Literature & Latte |

## What this suggests for Develop (candidates, not decisions)

- **Two or three named levels, chosen by the writer** (F1, F2, F9). Calm / standard / all controls matches the evidence. The change should apply to the whole stage at once.
- **One toggle, always in the same place, with a keyboard shortcut** (F10). Leaving calm should take one action, never a settings page.
- **Asking MAIA is also a route in** ("show me all the controls"), so the writer never has to remember where a control went. This must change what is shown, never what MAIA writes.
- **Nothing appears, disappears or moves on its own** (F1, F7). No usage-based hiding, no "smart" reordering.
- **Get the first-layer set right** (F8). The ranked list should name, for each control, whether it belongs on the calm stage or one step away.
- **No new motion** (F7): folding and unfolding should be instant or near-instant.
- **Prefer words to icons or charts** where the two compete (F6), though this is weak evidence.
- **Calm is the default but not the verdict** (F4). The founder's walk and real writers' choices count more than this note.

## Effect on the founder's open decisions

- *Per writer or per Work:* the research doesn't settle it. Remembering the choice in the browser needs no schema change; remembering it across devices or per Work probably does, which this lane excludes.
- *Where the control lives:* the writing tools put it one keystroke away and visible on the stage; this note leans toward that over a settings page.

## Gaps

No research found on: ADHD and long-form writing tools specifically; Gmail's density setting; Microsoft Word's Focus mode. Most of the strongest evidence predates current AI writing assistants.

## Sources

- [Findlater & McGrenere 2004, static vs adaptive vs adaptable menus (PDF)](https://www.cs.ubc.ca/labs/edapt/papers/findlater2004.pdf)
- [McGrenere, Baecker & Booth 2002 (PDF)](https://www.cs.ubc.ca/~ksbooth/PUB/docs/JMcGrenere2002.pdf)
- [Field evaluation of an adaptable two-interface design](https://www.bohrium.com/paper-details/a-field-evaluation-of-an-adaptable-two-interface-design-for-feature-rich-software/811987932276588544-2615)
- [Gajos et al., design space for adaptive GUIs (PDF)](https://www.cs.ubc.ca/~conati/522/532b-2019/papers/gajosExploringDesignSpace.pdf)
- [Al-Omar & Rigas 2008 (PDF)](https://www.scitepress.org/Papers/2008/19119/19119.pdf)
- [JetBrains Research / Neapolis IDE perceptual-load study](https://ar5iv.labs.arxiv.org/html/2302.06376)
- [AttentionGuard preprint](https://arxiv.org/html/2602.07865v1)
- [University of St Andrews, designing for users with ADHD](https://digitalcommunications.wp.st-andrews.ac.uk/2025/02/12/designing-for-users-with-adhd/)
- [W3C COGA, Making Content Usable](https://www.w3.org/TR/2020/WD-coga-usable-20201211/Overview-mutiple-pages.html)
- [W3C COGA techniques](https://w3c.github.io/coga/techniques/)
- [Nielsen Norman Group, progressive disclosure](https://www.nngroup.com/alertbox/progressive-disclosure.html)
- [Material Design, applying density](https://material.io/design/layout/applying-density.html)
- [iA Writer Focus Mode](https://ia.net/writer/support/editor/focus-mode)
- [Scrivener, distraction-free writing](https://www.literatureandlatte.com/blog/distraction-free-writing-with-scrivener)
