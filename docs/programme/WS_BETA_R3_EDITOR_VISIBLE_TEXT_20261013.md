# WS-BETA-R3 — preserve visibility of saved text in Edit

Status: isolated engineering correction, CLASS B draft, not installed.
Base: 5c872bcc5c98b41baec1ecf44515b1fc9c334f78.
Writer's Studio private synthetic preview at 127.0.0.1:3793.
No production, member or public change authorized by this packet.

## Human visual finding
October 13 founder Chrome private preview of a fictional 181-section
manuscript: Prose showed the existing saved "TEST ONLY" return note.
Switching to Edit displayed earlier paragraphs but the saved note near
the end of the section disappeared from view. Another panel said the
MAIA relationship list could not be read. These are separate symptoms.

Content-free, read-only inspection of the synthetic stage database
verified the return note remained present in both manuscript draft
sections and working draft records (two fictional copies).

## Root cause and exact narrow correction
WholeManuscriptSurface rendered its editable textarea with
rows = max(3, ceil(body.length/70)) and overflow:hidden.
The affected stored test section has 402 characters and ten explicit
source lines, but this formula allocated only six rows, before even
accounting for visual word wrapping. Thus the editor could conceal
saved content without actually losing it.

- A pure DOM sizing helper resets textarea height to auto, then sets
  the measured scrollHeight, i.e. the entire rendered content.
- Invoke it when each virtualized editor mounts and after onChange;
  observe the manuscript scroller and window width changes so prose
  rewraps without hidden tails.
- The native rows fallback now respects explicit newline count as
  well as the historic estimated character count.
- Existing section-id edit, capture-before-virtualized-unmount,
  section boundary protections, manuscript source, and save
  responsibilities remain unchanged.
- Do not infer a relationship/MAIA backend fix; its separate
  "could not be read" warning remains to be investigated.

## Tests and release gates
Five relevant offline Jest suites, 58 assertions PASS on this isolated
source. They cover whole-manuscript surface, virtualized section window,
section writing, Prose mode and the new sizing helper.

Do not switch the founder's current R3 private session while it is being
inspected. Next build the exact isolated correction and perform a
**browser-real** confirmation that the saved last line is visible
in Edit with correct width, can edit then save/reopen, and that
MAIA relationship unavailability does not silently modify text.
Keep real member Source/production restore and Class A beta release
held under existing privacy governance.

## October 13 R3 follow-up — Studio header displaced after return-to-Work

After entering a new fictional R3 SAVE CHECK sentence, the founder
observed the upper Studio bar clipped above the Chrome viewport, leaving
Home and other top-level navigation inaccessible. The synthetic database
had already confirmed the sentence in both saved draft and working draft.

Source investigation identified a separate scroll-ownership defect in the
continuous whole-manuscript surface: on every initial/rail section jump, its
useLayoutEffect called node.scrollIntoView with block=start. That
browser API may scroll every scrollable ancestor, including the outside
document. The observed displacement is consistent with that behavior,
though the exact physical cause awaits corrected-image browser witness.

This addition substitutes viewport.scrollTop = node.offsetTop after the
target shell is mounted and the owned scroller.current exists. The shell
is a direct child of the position:relative, overflowY:auto manuscript
scroller, so its offset is in the intended scroll coordinate system.
There are no window/document scrolling instructions. The virtualized
mount-first/scroll-second sequencing, focus/history and source writes
remain unchanged.

Two new source-contract regression checks assert:
- the rail or arrival target scroll uses the internal viewport only;
- the browser's outer window and ancestors are not scrolled directly;
- the inner scroller retains its own position:relative reference frame.

Updated five focused Jest suites: 60/60 PASS. This is source-level
evidence; an independent Chrome viewport test must verify the header
stays visible through Home -> Return to Work -> Edit and optional
chapter-rail navigation at the founder's normal window size.

The prior test image on localhost:3795 is left intact pending that
comparison. No public Soullab, live Work or real member Source changed.
