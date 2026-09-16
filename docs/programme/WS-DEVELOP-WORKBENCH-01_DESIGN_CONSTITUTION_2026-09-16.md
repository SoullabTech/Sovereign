# WS-DEVELOP-WORKBENCH-01 — design constitution

Founder-authored model, recorded before anything is built. Substrate findings
traced read-only at `b5bd7caa0`. ⛔ No implementation authorized.

## The rule

> **Write changes the manuscript. Develop helps the writer perceive the manuscript.**

Develop is a **mode of one Writer's Workbench**, not a destination. Separate
route is fine; separate experience is not. The centre column is sacred: it is
the same manuscript surface Write shows, and no report, ledger or extracted
excerpt may replace it. Develop surrounds the manuscript with another kind of
attention.

Three scopes, because they are the scales an author thinks at:

```
WORK  ↕  CHAPTER  ↕  PASSAGE
```

Everything already built — frozen readings, seven lenses, evidence anchors,
scope, staleness, provenance, conversations — sits behind those three.

## What the model asks for, against what exists

### ✅ Composable from substrate that is already there

| asked for | substrate |
|---|---|
| one gesture reads the whole chapter | `runChapterReview()` already runs all seven lenses per gesture |
| Chapter Review absorbed into Chapter-scope Develop | it commissions on `manuscriptId`, carries no Work dependency, survives the absorption unchanged |
| "What MAIA notices" | `ReviewFinding.observation` |
| synthesis-then-detail | `summary` is already a ≤150-char one-line projection of `observation` |
| *Reading details ▾* — date, scope, lens, version, status | `ReviewFinding.state: current \| superseded \| unmeasured`, plus the reading payload's own provenance |
| Develop may not casually edit the Work | precedent exists: the Ask library's write law is enforced by a constitutional test, not by discipline |

### ⛔ Three things the model needs that the substrate does not yet provide

**1 · The address cannot carry the place.**

```ts
app/writers-studio/develop/page.tsx:18
const manuscriptId = params?.get('m') ?? null;
```

That is the entire address. No chapter, no section, no passage, no scroll
place. *"Click Develop and you are still in Chapter 4, halfway down"* is not a
behaviour the room declined to implement — **the URL has no room to say it.**
This is the whole of *"the route boundary became an experiential boundary"*,
and it is the smallest, highest-leverage repair in the model.

`DevelopRoom.tsx:4` names the mismatch in its own first line — *"the room where
a writer encounters **a reading**"* — and `:74` already records a member seeing
a reading that "contradicted the outline they had just been looking at in
Write."

**2 · The gutter marker needs precision the presentation seam throws away.**

`EvidenceRef` carries a `passage` variant with a `CodePointRange { start, end }`
— code points, into an immutable revision, because INV-5 forbids offsets into
live prose. MAIA can and does anchor an observation to *these words*.

Then:

```ts
lib/writersStudio/rebuild/chapterReview.ts
for (const ref of o.evidenceRefs) {
  for (const id of sectionIdsOf(ref)) if (!ids.includes(id)) ids.push(id);
}
```

⚠️ **The range is discarded.** A finding anchored to paragraphs 12–15 reaches
the panel knowing only *"section X"*. `◇` beside the right paragraph, and the
centre highlighting the actual words rather than the panel quoting them, both
need the range that this loop drops. The fix is a widening at the seam, not new
cognition — but it is a real change and it is owed before the gutter exists.

**3 · "Why it may matter" does not exist, and is not presentation.**

`ReviewFinding` is `{ id · readingId · lens · observation · summary ·
sectionIds · state }`. There is no significance field and no way to derive one.

This is the one element of the model that cannot be composed. It is a claim
about consequence, and it sits exactly on the line the model itself draws:
**not observation, not prescription — interpretation.** Producing it is new
cognition and needs its own governance, not a panel slot. ⛔ It must not be
faked by reformatting `observation` under a second heading.

## One ruling owed before build: the 7 → 4 projection

The engine's lenses are seven:

```
structure · development · continuity · arc · voice · coherence · reader
```

The model's member-facing categories are four: **Movement · Continuity ·
Structure · Voice** — on the stated principle that *"we should not force the
writer to learn our ontology."* That principle is right.

⚠️ But three lenses — `arc`, `coherence`, `reader` — have no evident home in
the four. If the projection is not **total**, observations produced under those
lenses become unreachable: MAIA read for them, found something, and the writer
can never see it. If the projection is not **declared**, an observation is
displayed under a category name that is not the lens it was produced under,
which is a small misattribution of MAIA's own act.

Two properties are needed, and neither is a design preference:

- **total** — every lens lands somewhere the writer can reach.
- **declared** — the mapping is written down, and *Reading details ▾* can still
  name the lens the observation actually came from.

⛔ Do not resolve this by quietly dropping three lenses from the commission.
That would make the projection total by making the reading smaller.

## Boundaries carried from the model

- ⛔ The centre column is never replaced by a report or an excerpt.
- ⛔ Develop does not edit the Work. It may lead to revision through an explicit
  *Explore a direction*, which moves the writer into Write carrying context.
- ⛔ Observation and prescription stay separate. MAIA may notice without
  prescribing.
- ⛔ Provenance is preserved in full and moved to epistemic depth, never deleted
  to reduce clutter.
- Default is *"Read this chapter developmentally"* using the full architecture.
  Lens selection survives as *Focus the reading ▾*, advanced, not the entry.
- Mobile: two stances, `MANUSCRIPT` / `INSIGHTS`, a sheet over the manuscript —
  never five regions stacked into a 4,000-pixel page.

## Bidirectional navigation, as the coherence test

```
finding in the panel   → centre scrolls to its marker
marker in the gutter   → panel opens that observation
```

Both directions, or the mode is two surfaces sharing a screen.

## The act is an INVERSION, not a replacement

Founder refinement, same day. The current Develop page is a **reading archive
and commissioning interface**: readings are the navigation, a frozen report is
the central surface, the commissioning form holds a third of the workbench, and
the manuscript is not on screen at all. That architecture is coherent for
*storing* readings. It puts MAIA's output at the centre and the writer's book
offscreen.

**The current page becomes the machinery behind Develop.** Nothing is thrown
away; the foreground is inverted.

| current Develop | disposition |
|---|---|
| Studio shell · Develop tab · `/develop?m=` route | **keep** |
| frozen readings | **keep, subordinated** → `Current reading · Sep 10 ▾` |
| lens engine · observation provenance · staleness | **keep** |
| observation dialogue | **keep** |
| readings as the navigation | **replace** — the manuscript is the navigation |
| a long report as the central surface | **replace** |
| "Ask for a reading" form, permanently visible | **compress** → `Read this chapter` + `Focus the reading ▾` |
| manuscript absent | **fix fundamentally** |
| findings detached from prose | **anchor into the manuscript** |

The header subtitle — *"What MAIA noticed when she read this work, kept exactly
as she noticed it"* — is true, and it defines Develop as a repository of past
observations. The active mode already says where the writer is standing.

### `RESTS ON` becomes visible rather than enumerated

The epistemic machinery stays whole. What changes is where it is read.

```
today      RESTS ON · Section 13 · Section 12 · Section 17
becomes    RESTS ON ✓ visible in manuscript
           (and the sections are highlighted where the writer can see them)
```

Exact sections, code-point ranges, frozen version, coverage,
does-not-establish, current/superseded — all preserved, all moved under
*Reading details ▾*. ⛔ Nothing is deleted to reduce clutter. The surface stops
behaving like an epistemology report and starts behaving like an editorial
workspace.

### ⭐ One staging consequence worth taking

**"Related places" ships on data that already exists; the paragraph-precise
gutter marker does not.**

`ReviewFinding.sectionIds` is section-level and present today. So *"Related
places → A Vivid Dream · Preface · Chapter 1"*, each click moving the centre
manuscript to that place, is composable now — and it is most of the perceptual
gain, because the writer *sees* the relationship instead of reading a list of
ids.

The `◇` beside the right paragraph still needs the `CodePointRange` the
presentation seam discards. **So the inversion does not have to wait on that
widening.** Section-precision first; paragraph-precision when the seam is
widened deliberately, as its own act.

⛔ Do not approximate the marker's position in the meantime. A `◇` beside a
paragraph MAIA did not name is the interface asserting an anchor that does not
exist — the same class of defect as a fallback indistinguishable from success.

## What the realized mockup settles — and the one risk it adds

Founder mockup, same day, Chapter scope, Chapter 4 · §2 selected.

**Settled.** The inversion is drawn and it holds: the manuscript occupies the
centre at reading width, surrounded rather than replaced. The breadcrumb
`Part I › Chapter 4 › 2. The Dream` makes the locus *legible*, which is the
thing that was previously invisible — a writer can now see that Develop knows
where they are standing. Observation anatomy renders as specified: **What MAIA
noticed · Why it may matter · Evidence**, with `Ask MAIA about this` and
`Explore a direction` separated, and `Reading details ⌄` closed at the foot.
`Current` sits as a chip beside the reading title rather than as a column of
dates. `1 of 2` with prev/next replaces the wall of findings.

**⭐ `All Lenses ⌄` is probably the answer to the 7 → 4 ruling, and a good one.**
Four categories are the default projection; the control beside `6 Observations`
is the escape hatch to the engine's own vocabulary. That makes the projection
**total by disclosure** — nothing produced under `arc`, `coherence` or `reader`
becomes unreachable — while the writer is never made to learn the ontology to
get started. ⚠️ Confirm that is the intent; if `All Lenses` is only a filter
over the same four, three lenses are still invisible and the ruling is still
owed.

**⭐⭐ `Evidence · Chapter 4 · §2 · paragraphs 3–4` promotes the seam widening
from later to required.** That string is paragraph-precise. It cannot be
produced today: `findingsFromPayloads` collapses every `evidenceRef` to section
ids and drops the `CodePointRange`. The gutter `●` in the mockup sits beside
one specific paragraph for the same reason. **As drawn, this mockup needs the
range.** The staging note above still holds for *Related places* — those are
section-level and ship without it — but the Evidence line and the marker do
not. Either the widening lands with the inversion, or the Evidence line reads
at section precision until it does. ⛔ It must not be approximated.

**⚠️ THE RISK: the rail is mostly unbuilt.** The mockup's left column carries
`Materials · Structure · Notes · Versions · Goals`, `Conversations · Discover ·
Insights · Suggestions`, and `Find/Replace · Statistics · Timeline · Word Web ·
Export`. Most of those surfaces do not exist. The founder's own rule for this
programme is explicit:

> Do not invent fake mode functionality. If a mode is not implemented, keep
> existing honest behavior rather than creating a decorative clickable dead end.

Fourteen labels, each reading as a place to go, is fourteen chances to make the
Studio feel larger than it is and then smaller than it looked. This is the same
family as the fallback that reads as success: an affordance that names an
outcome it does not produce. **The rail must render only what exists, or render
the rest visibly as not-yet.** ⛔ Deciding which is a founder call, not an
implementation detail, and it should be made before the rail is built rather
than discovered by a member clicking `Word Web`.

## Standing

```
WS-DEVELOP-WORKBENCH-01   OPEN · design constitution recorded
model                     FOUNDER-AUTHORED · recorded verbatim in substance
address-carries-locus     ⛔ OWED · smallest, highest-leverage repair
evidence range at seam    ⛔ OWED · widening, not new cognition
"why it may matter"       ⛔ NEW COGNITION · own governance required
7 → 4 projection          ⚠️ RULING OWED · must be total and declared
implementation            ⛔ NOT AUTHORIZED
sequence                  behind Part A/B witness · b5bd7caa0 reconciliation
overlap                   WS-MAIA-WORK-CONTEXT-01, at one point only:
                          whether Develop resolves a declared Work
```
