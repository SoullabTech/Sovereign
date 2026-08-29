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

The stub deliberately uses the manuscript from the WS2-01 finding —
`ce284751…`, *Elemental Alchemy (KDP print)*, 174 sections — because 174
sections is what the outline column has to survive, and a reference-sized
eleven would have flattered it.

## The three captures

- `ws2-03b-writers-studio-1680.png` — the wide room, all five columns of
  reference 04 present because the Work really has declared materials.
- `ws2-03b-identity-refusal.png` — `?m=a3ae67fd…`, an id the member does not
  own. The room names it and refuses. Nothing is substituted.
- `ws2-03b-identity-ambiguous.png` — three manuscripts, none named. The room
  asks instead of guessing.
