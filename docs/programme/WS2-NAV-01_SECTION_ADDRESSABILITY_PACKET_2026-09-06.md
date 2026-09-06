# WS2-NAV-01 · Imported drafts are not section-addressable — JARVIS packet

```text
STATUS      DEFECT LOCATED · implementation NOT AUTHORIZED
IS THIS 08B NO. This is 08B's PREREQUISITE. 08B renders chapter hierarchy over
            addressable sections; this is what makes sections addressable at all.
            Shipping 08B first draws a chapter tree over a draft you still cannot
            click into.
BLOCKER     YES for the tester cohort. Every imported book lands here.
```

## The defect, in one line

The outline shows **Source** sections while the **working draft** is still one
continuous document, and clicking is only wired for the section-addressable mount.

## Evidence (read-only, this session)

```text
app/writers-studio/canvas/page.tsx:637   <ManuscriptOutline … onSelect={writing.goToSection}/>   clickable
app/writers-studio/canvas/page.tsx:647   <ManuscriptOutline … />  ← NO onSelect            NOT clickable

lib/writersStudio/writeStateClient.ts:65  'sections'              → mount 'sections'   (navigable)
lib/writersStudio/writeStateClient.ts:71  'continuous'            → mount 'worktable'  (dead outline)
lib/writersStudio/writeStateClient.ts:74  'continuous_unprovable' → mount 'worktable' + notice
lib/writersStudio/writeStateClient.ts:77  'no_draft'              → mount 'worktable'

notice text  "This draft's section breaks need your confirmation."
             — the same state the member reads as "too long to work with"

app/api/sovereign/manuscripts/[id]/draft/route.ts:~112
             `convert: true` is the EXPLICIT command that partitions a draft.
             Deliberately separate: conversion assigns durable identities that
             authored structure and developmental evidence both depend on.
```

So the two reported symptoms — *"can't click a section"* and *"too long to work
with"* — are one state, not two defects.

## The question this packet does NOT answer

**Where does conversion belong?** Three candidates, and the choice is a founder act,
because it decides whether identity assignment is automatic or authored:

```text
A  at ingest        import partitions the draft immediately
                    fastest for testers · but assigns durable identities with no member act
B  one member act   the canvas offers "confirm these section breaks" and the member accepts
                    matches the existing notice, and the 06A confirm covenant
C  unchanged        conversion stays a separate command; the outline stops pretending
                    otherwise and says plainly that navigation needs conversion first
```

B is the shape the existing copy already promises. A is the shape a tester expects.
They are not compatible: A authors structure without an act.

## Bounded job, once the shape is chosen

```text
IN SCOPE
  make the 'worktable' branch state its own condition instead of rendering a dead list
  wire the chosen conversion path (A, B or C)
  clickable section → scroll/goToSection, matching the 'sections' branch
  no schema change · no manuscript text mutation · no ALL-CAPS inference

OUT
  08B chapter hierarchy · 08C–08E · 07G · any developmental reading
```

## Acceptance

```text
import a book → outline rows are clickable, or the surface says exactly why not
click a section  → that section opens
reload           → same behaviour
no member text changes · zero characters
```

## Tester-facing note for tomorrow, independent of the fix

Accepted upload formats are `.docx` · `.pdf` · `.txt` · `.md`. `.epub`, `.pages`,
`.rtf`, `.odt` are refused. `.docx` is the only format proven in production
(08A witness F1). Caps that refuse an import outright: 25 MB file · 2M characters ·
400 sections.
