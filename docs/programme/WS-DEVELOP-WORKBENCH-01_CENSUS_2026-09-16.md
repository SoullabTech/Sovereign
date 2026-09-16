# WS-DEVELOP-WORKBENCH-01 — implementation census

Read-only, at `b5bd7caa0`. ⛔ No implementation. Five questions, answered.

## Q1 · The locus substrate already exists, and Develop simply does not read it

`lib/writersStudio/placeInWork.ts` (WS2-05A) defines the whole vocabulary:

```
?m=<manuscript-id>&s=<draft-section-id>
```

⭐ **IDENTITY, NOT POSITION** — `s` is a draft-section uuid, deliberately not an
ordinal, because "a section inserted above would silently reopen a different
piece of the book, with no error and no way for the member to know." No new
database state; the URL is where the browser keeps the id the outline, the save
queue and the write path already speak.

```ts
export function locationForSection(pathname: string, search: string, sectionId: string | null): string
```

⭐⭐ **It takes `pathname` as an argument.** It is already generic over the
route. `/writers-studio/develop` can use it verbatim.

So Develop needs **no new locus mechanism**. `develop/page.tsx:18` reads `m` and
stops. What must travel: `m` and `s`. Selection (`start`/`end`) is a second,
separable question — the Write side carries it in component state, not the URL,
so preserving it across the mode boundary is a larger change and is **not** in
the smallest build.

## Q2 · None of the fourteen rail destinations exist, and five fakes already ship

```
materials · structure · notes · versions · goals            — no route
conversations · discover · insights · suggestions           — no route
find-replace · statistics · timeline · word-web · export     — no route
explore · publish (top nav)                                  — no route
develop · canvas · rebuild · review                          ROUTE
```

⚠️ Some concepts are implemented as **panels, not destinations** —
`MaterialsDrawer`, `StructureReview`, `StructuredOutline`, `WorkDrawer`,
`ReadingsEntry`, `WorkConversation` all exist inside `canvas/`. So "Materials"
is real; "a place called Materials" is not. The rail must not promise the
second because the first exists.

🔴 **And the dead end already ships.** `RebuildStudioClient.tsx:674`:

```tsx
{['Manuscript', 'Materials', 'Notes', 'Versions', 'Goals'].map((x, i) => (
  <div …><span>{x}</span><span>{x === 'Versions' ? '5' : x === 'Materials' ? '0' : ''}</span></div>
))}
```

A `<div>` — not a link, not a button — with a **hardcoded `5`** for Versions and
`0` for Materials. Five labels that look like navigation, one carrying a version
count that is a literal. The mockup expands this pattern from five to fourteen.

## Q3 · The range reaches the browser and is discarded one function later

`sectionIdsOf` is **not** the defect. It answers its own question correctly:

```ts
case 'section':
case 'passage':
  return [ref.sectionId];
```

A `passage` ref carries `range: CodePointRange`, and `sectionIdsOf` deliberately
returns only the section, because its contract is *which draft sections does
this depend on*.

The drop is that `findingsFromPayloads` calls **only** `sectionIdsOf` and never
keeps the ref:

```ts
for (const ref of o.evidenceRefs) {
  for (const id of sectionIdsOf(ref)) if (!ids.includes(id)) ids.push(id);
}
```

⭐ `o.evidenceRefs` is **already in the client**. The range is not missing from
the API, the contract or the reading. It is present, in the browser, and thrown
away by the projection. The smallest widening is one field on `ReviewFinding`;
`sectionIdsOf`, the reading contract and the cognition are untouched.

## Q4 · All seven lenses are already fully named for a member

`developPresentation.ts` carries, for every one of the seven, a member-facing
question and a ratified meaning:

```
development · structure · continuity · arc · voice · coherence · reader
LENS_QUESTION   e.g. voice: 'How does the voice hold?'
LENS_MEANING    e.g. arc:   'the shape of movement across the parts'
```

⭐ **So the 7 → 4 question is smaller than it looked: the four are not a new
ontology, they are four of the seven lenses.** `structure`, `continuity` and
`voice` appear under their own names; `development` is shown as **Movement**,
which is a rename of one lens, not a mapping table. `arc`, `coherence` and
`reader` are simply not in the default view.

**No mapping is needed. `All Lenses` is a filter, not a translation** — and it
needs no new copy, because every lens already has a question and a meaning.

⚠️ The one thing that must hold: the disclosure enumerates `LENS_ORDER`, so the
count of reachable lenses equals `LENS_ORDER.length`. A hand-written list of
seven would silently stop at seven when an eighth lens is added.

## Q5 · `WholeManuscriptSurface` is the centre pane, and it already navigates

`canvas/WholeManuscriptSurface.tsx` — *"the book, flowing down the page"*, 414
lines, and explicitly **a view of the same sections, not a second manuscript**.
Its props already carry both directions the mockup needs:

```
jumpTo · onJumpHandled     panel → centre   (open the finding's evidence)
onPlaceChange(sectionId)   centre → panel   (scope follows the reader)
```

⭐ **Bidirectional navigation is not new work.** It is wiring two props that
exist to a panel that does not yet.

⚠️ It mounts each section as its own editor. Develop must not edit, so the reuse
needs a read-only stance. Read-only section rendering already exists
(`RebuildAuthoredBody`'s `!section.editable` branch), so the pattern is present;
which component expresses it is an implementation call, ⛔ not licence to fork
the surface.

## Smallest viable build plan

Ordered by leverage per unit of risk. Each is separately reviewable.

**D1 · The locus crosses the mode boundary.** `/develop` reads `s` as well as
`m`; mode navigation preserves both; `locationForSection` is reused verbatim.
⛔ No new vocabulary, no new state, no selection yet. *This is the whole of
"click Develop and you are still in Chapter 4", and it is the smallest change
in the plan.*

**D2 · The rail tells the truth.** Render only destinations that exist; show the
rest visibly as not-yet or not at all. Remove the hardcoded `5`/`0`. ⛔ Not a
new rail — an honest one. Cheap, and it stops the mockup from shipping fourteen
dead ends.

**D3 · The manuscript takes the centre.** Mount `WholeManuscriptSurface` in
Develop, read-only, with `jumpTo` fed by panel selection and `onPlaceChange`
setting panel scope. The readings archive and the commissioning form move to
`Current reading ▾` and `Read this chapter` + `Focus the reading ▾`.

**D4 · The lens disclosure.** Four by default, `All Lenses` enumerating
`LENS_ORDER` with the existing questions and meanings.

**D5 · The evidence widening** — own act, own review. `ReviewFinding` carries
its `evidenceRefs`; the gutter marker and `§2 · paragraphs 3–4` become
producible. ⛔ Until D5 lands, Evidence reads at section precision and the
marker does not exist. It is never approximated.

⛔ **Not in this plan**: "Why it may matter" (new cognition, own governance),
selection preservation across modes, Work-scope manuscript map, mobile.

## Falsifiers

```
D1-F1  Write → Develop preserves (m, s); neither is dropped
D1-F2  Develop → Write preserves (m, s)
D1-F3  an `s` naming a section not in this manuscript REFUSES;
       it never silently opens another section or falls back to the first
D1-F4  place changes REPLACE, never PUSH — Back leaves the Work,
       it does not walk back through every section visited
D1-F5  Develop constructs no locus vocabulary of its own:
       no second param, no ordinal, no stored "last section"

D2-F1  every rail entry that looks like a destination has one
D2-F2  ⛔ no hardcoded counts anywhere in a rail
D2-F3  a concept implemented only as a panel is not presented as a place

D3-F1  Develop mounts no editor and reaches no write path
D3-F2  the centre is the SAME component Write uses — one composition
D3-F3  selecting a finding moves the centre; moving the centre moves scope
D3-F4  ⛔ no observation text is rendered where the manuscript belongs

D4-F1  reachable lens count === LENS_ORDER.length  (not a literal 7)
D4-F2  every lens shown carries its own LENS_QUESTION and LENS_MEANING
D4-F3  a lens outside the default four is reachable in at most one gesture
D4-F4  ⛔ the commission is never narrowed to make the projection total

D5-F1  a `passage` ref survives to ReviewFinding with its range intact
D5-F2  sectionIdsOf is unchanged
D5-F3  ⛔ no marker renders for a finding carrying no passage range
D5-F4  a code-point range is never reinterpreted as UTF-16 units
```

## Standing

```
census                  COMPLETE · read-only
locus mechanism         EXISTS · pathname-generic · Develop does not read it
rail destinations       0 of 14 · five decorative entries already shipped
evidence range          IN THE CLIENT · dropped by the projection
seven lenses            FULLY NAMED · no mapping table needed
centre pane             WholeManuscriptSurface · both nav props already present
implementation          ⛔ NOT AUTHORIZED
```
