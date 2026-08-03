# Empty-state observation — existing shipped surfaces

```text
Status: OBSERVATION — NOT DESIGN — NOT REQUIREMENTS
```

**Question:** *What do existing shipped AIN OS surfaces communicate when they have no
user-created material yet?*

⛔ Not an evaluation of good or bad. ⛔ Not evidence about the future Now What? Home. ⛔ No
comparison against the constitution, no "violates", no redesign, no inference about member
feelings.

**Method:** source inspection of member-reachable surfaces on the working tree, 2026-08-03.
Language quoted verbatim from the components.

---

## OBSERVED

| Surface | Observed language | Actions | Communicates | Agency notes |
|---|---|---|---|---|
| **Moments** — `app/maia/moments/page.tsx:126` | *"nothing kept yet"* + *"In conversation, your own words carry a quiet "Keep this moment." What you keep waits here — exactly as you said it."* | none in the empty state | **invitation + system explanation** — states where the gesture lives and what the surface will hold | Attributes the act to the member (*your own words*, *what you keep*). No deficiency framing. Describes a gesture located elsewhere; the surface itself offers no action. |
| **Anchor history** — `app/maia/anchor/history/page.tsx:143` | *"nothing held yet"* | none in the empty state | **absence**, minimally stated | Three words. No instruction, no explanation, no next step. Neither invites nor withholds. |
| **Workbench Shelf** — `components/book-studio/workbench/Shelf.tsx:44-45` | *"No reviewed captures yet. Upload a file to begin."* (search-filtered variant: *"No captures match this search."*) | search input present; the named action (**Upload**) lives elsewhere in the Room | **instruction** — states a prerequisite and directs an action | The only one of the four that issues a directive (*Upload a file to begin*). Frames the state as a precondition not yet met. |
| **Book Studio drafts** — `app/book-studio/page.tsx:143` | *"No drafts yet. Move an idea here when it wants form."* | none in the empty state | **invitation + possibility** | Conditional, not directive — *"when it wants form"* leaves timing with the member. Attributes the move to the member. |

### System-authored meaning

**None found in any of the four.** No recommendations · no inferred next steps · no progress
language · no identity claims · no pattern claims. No counts, no timestamps, no "you have
been away" language.

### Reachability today

| Surface | Reachable |
|---|---|
| Moments | route exists; **no navigation door** is known to point at it |
| Anchor history | route exists |
| Workbench Shelf / Book Studio | **founder-gated** — `requireFounder` at `app/book-studio/page.tsx:5`, redirecting to `/signin?next=/book-studio` |

⚠️ Two of the four are not reachable by an ordinary member today. Their empty states are
observed **in source**, not in a member session.

---

## INFERENCE

*Possible design implications. Not conclusions.*

- Three distinct grammars are present across four surfaces: **bare absence** (*nothing held
  yet*), **invitation naming the member's act** (*what you keep*, *move an idea here*), and
  **instruction naming a system prerequisite** (*Upload a file to begin*).
- The two Moments/Anchor surfaces use lowercase, unpunctuated fragments; the two Studio
  surfaces use sentence case with a period. That may be deliberate register or may be lane
  drift — the source does not say which.
- Only the Shelf's empty state names an action, and that action is not on the surface where
  the sentence appears.
- Emptiness appears to be treated as a *state of the member's material*, not as a state of
  the member.

## UNKNOWN — requires a human walk

- Whether any of these read as invitation or as deficiency **to a person**, which the source
  cannot establish.
- Whether the two unreachable surfaces render as written when reached.
- Whether the empty state differs from a *withdrawn-to-empty* state on any of these
  surfaces — i.e. whether "never created" and "created then removed" are distinguishable.
- Whether other member surfaces with meaningful empty states exist beyond these four; this
  pass searched member routes and did not enumerate the practitioner Studio.

---

**Candidate input for Now What? S3 empty-state design**
