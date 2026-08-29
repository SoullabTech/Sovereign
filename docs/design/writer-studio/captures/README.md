# WS2-03B captures — what these are, and what they are not

Three captures of `/writers-studio/canvas` at **1680×1050, deviceScaleFactor 2**,
taken from the real route by Playwright against a local `next dev`.

## What is real in them

The room. `app/writers-studio/canvas/page.tsx` and every component it renders —
the shell rail, the mode bar, the outline column, the writing field, the MAIA
column, Materials, the lower band, and both identity states — are the shipped
runtime code, unmodified for the capture.

## What is NOT real, and why

**The member data is stubbed at the network layer.** The session that produced
these captures had no PostgreSQL and no member credential, so the five
member-scoped endpoints the room calls were answered with payloads of the real
shape:

| endpoint | stub |
|---|---|
| `GET /api/sovereign/manuscripts` | one manuscript (three, for the ambiguous capture) |
| `GET /api/sovereign/manuscripts/[id]` | 174 sections with headings |
| `GET /api/sovereign/manuscripts/[id]/draft` | four paragraphs of draft prose |
| `GET /api/sovereign/manuscripts/[id]/draft/revisions` | three kept revisions |
| `GET /api/sovereign/living-works` | one declaring Work with two materials |

Nothing in the room was stubbed. Only what the room asked the server for.

**This is therefore not the authenticated production capture WS2-03B asks for**,
and it is not offered as one. It is sufficient to adjudicate composition,
hierarchy, density, typography, alignment and states; it cannot adjudicate what
a real member's own data does to the room. The production capture remains
outstanding and is named as a blocker in the WS2-03B report.

Every identifier in the stub is synthetic. The manuscript is given 174 sections
because 174 is what the outline column has to survive, and a reference-sized
eleven would have flattered it.

## Correction, 2026-08-29 (founder)

An earlier version of this file described the refusal capture as
`?m=a3ae67fd…`, *"an id the member does not own."* **That was false**, twice
over, and the record is corrected here rather than quietly edited away:

- `a3ae67fd-a21e-4948-8766-4c397d2e4712` is the **manuscript** from the WS2-01
  finding, and it **was owned** by the authenticated member — *Elemental
  Alchemy (KDP print)*, 174 sections.
- `ce284751-e457-42f6-89b6-bc07d0876682` is not a manuscript at all. It is the
  **authenticated member's own id**. The earlier draft read the two as two
  manuscripts.

The misreading inverted the severity of the finding. The real defect is not a
member requesting someone else's book and being sensibly redirected — it is a
member requesting **their own** book, by identity, and being handed a different
one in silence.

**No capture here reproduces that defect, and none claims to.** The defect
lives in what the manuscript list contained, one layer above the resolver, and
that is WS2-01's to find. The refusal capture demonstrates only the generic
property WS2-03B is responsible for: an explicit identity the room cannot
resolve fails visibly instead of being replaced.

## The three captures

- `ws2-03b-writers-studio-1680.png` — the wide room, all five columns of
  reference 04 present because the Work really has declared materials.
- `ws2-03b-identity-refusal.png` — a synthetic manuscript id absent from the
  list. The room names what was asked for and refuses. Nothing is substituted.
- `ws2-03b-identity-ambiguous.png` — three manuscripts, none named. The room
  asks instead of guessing.
