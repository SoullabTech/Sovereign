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
