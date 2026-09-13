# EW-F2 · Section-view evidence and edit seam — census

**Status** READ-ONLY CENSUS. Nothing built, nothing repaired, no ruling made here.
**Authorized** founder, 2026-09-13, as step 1 of the approved sequence.
**Question** *What existing representation, if any, can show a proposal mark truthfully
inside Section view — and what seam, if any, can host proposal work mode?*

---

## S-01 · Section view has no overlay seam. Whole view has one.

`WholeManuscriptSurface` mounts a mark in three coordinated pieces:

- a wrapper carrying `position: relative`, present **only** when a room draws
- `renderSectionOverlay?.(section.id, body)` rendered before the textarea
- `padding: 0, margin: 0` on the textarea, again only when drawing

`SectionWritingSurface` has none of them. It renders a bare `<textarea>` and
accepts no overlay prop. The founder's reading is confirmed: this is **absence,
not misrouting**. `renderSectionOverlay` has exactly one consumer.

## S-02 · The missing seam is mechanical, and the geometry contract is already met

`FocusOverlay`'s `MIRROR` requires the editor to match its metrics exactly:
`lineHeight: 1.7`, `font: inherit`, zero padding and margin, no border.

Section view's textarea **already** carries `lineHeight: 1.7`, `font: inherit`,
`background: transparent`, `border: none`, `outline: none` — identical to
Whole's. Only the wrapper, the call, and the padding reset are absent.

So porting the existing mark into Section view is a port, not an invention.
No second marking mechanism is required. This answers the census question as
asked.

## S-03 · ⭐⭐ Section view ALREADY suspends write authority structurally

`SectionWritingSurface` carries a live `!active.editable` branch. It renders the
body as `<pre>` prose and **mounts no textarea at all**:

> This section can be read here but not yet edited.

Its comment states the reason: *"Offering a text box here would invite an edit
the server is guaranteed to refuse."*

Authority is suspended by **not mounting the control** — not by a `readOnly`
attribute, not by styling. The founder's ruling (*"structural, not styling …
the ordinary section writer is not mounted/writable"*) is already implemented
in this room, for a different reason, and can be built on rather than invented.

## S-04 · But `editable` is server-resolved, and the mount is a boundary

`editable` arrives inside `WriteState.sections[].editable` from `/write-state`.
`chooseMount` is fail-closed and its comment is explicit: the write mode is a
**mount boundary, not a prop update**, because `useSectionWriting` takes its
version and first active section AT MOUNT and resets only on `draftKey`.

`SectionWritingSurface`'s own header forbids the shortcut:

> WHAT THIS COMPONENT DOES NOT DECIDE. Identity, authority, versioning and the
> save lifecycle are all settled below it and it must not reinterpret any of
> them.

⛔ Therefore a client-side "there is a proposal here, so treat it as read-only"
is the wrong shape. It would place a second authority over writability beside
the one the server owns, which is the defect class this programme keeps finding.

⭐ `editable` is **per section**, which is exactly the granularity proposal work
mode needs: suspension scoped to the proposal's target section, with every other
section keeping normal write authority. The existing shape fits the ruling
without widening.

## S-05 · ⭐⭐ In proposal work mode the mark needs no mirror at all

`FocusOverlay` exists for one reason: text inside a `<textarea>` cannot be
styled, so the mark is painted as a transparent lockstep copy behind the
control. Every risk it carries — metric drift, padding coupling, the FOCUS-W3
code-point/code-unit boundary — is a cost of that constraint.

Proposal work mode removes the constraint. Where the manuscript is read-only
reference, there is no textarea to mirror, and CURRENT/PROPOSED can be **real
spans in real prose**.

This inverts the obvious assumption. Reusing Whole's overlay in Section view
solves the OLD problem — mark a passage inside a writable field. The ruled
design does not have that problem. The in-place diff rendering the founder
sketched is *easier* in the non-writable surface than in the writable one, with
no mirror-drift risk at all.

## What the census does NOT answer

- Whether the proposal-working surface is a third `WriteMount` or a variant of
  `sections`. Recommended: a third mount at the same fail-closed boundary.
- How `/write-state` learns of an open proposal. Recommended: the server
  resolves it, so writability keeps one authority.
- What happens to the rest of the room's write authority while a proposal is
  open. Recommended by S-04: scoped to the target section only.

⛔ All three are step 2, and none is decided here.

---

## Standing at census close

```
Section-view mark          PORTABLE — the geometry contract already holds
Section-view suspension    ALREADY STRUCTURAL — !editable mounts no control
authority over writability SERVER-OWNED — must not be reinterpreted client-side
mirror                     UNNECESSARY in proposal work mode
Whole view                 NOT REQUIRED — no mode change is implied
```

*A surface that stops writing does not need to fake the text it is marking.*
