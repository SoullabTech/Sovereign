# WS2-05A — Structure Witness Record

**Head:** `20b8638c6`
**Book:** Elemental Alchemy, `a3ae67fd-a21e-4948-8766-4c397d2e4712`, 174 sections,
local dev. Kelly's own manuscript, not a fixture.
**Status:** structural safety PROVEN on the real book. Product reality PARTIAL.

Written as it stands, not as it will stand. The lines marked OUTSTANDING have
not happened, and nothing below should be read as if they had.

---

## Substrate gate — PASS

32 checks against live PostgreSQL 16, run twice: in the build container, and on
Kelly's own machine against `maia_consciousness` as his member id. The fixture
manuscript is created and deleted by the id the run created; Elemental Alchemy
was never read by it.

Kelly's correction gate A–G, all green:

```text
A · both concurrent creates succeed                        ok + ok
A · two concurrent creates leave no duplicate position     ok
B · top-level siblings are 0..n-1                          0,1,2
C · refuse a move leaving the SOURCE in two places          would_split_division
D · refuse appending a run separated from the division      would_split_division
E · refuse deleting a division that holds others            unit_has_children
E · the child and its memberships are intact                2 placements
F · promote the child out one level                         ok
F · the emptied parent can then be removed                  ok
G · flattening unchanged through the whole gate             ok
```

**Two of those had to earn it.**

*The trigger was proved independently of the service.* Raw SQL inserting
positions 4 and 6 into one unit — bypassing every code path — is refused at
COMMIT:

```text
ERROR: structural unit ba9b3f0a-… is not a contiguous part of the Work:
       2 sections spanning positions 4..6
```

*Test A was vacuous as first written.* Asserting only "no duplicate positions"
passes without the manuscript row lock too, because the deferred sibling-order
constraint kills one transaction instead. Rerun with the lock removed:
`ok + threw`, and B fell with it. It now asserts both concurrent creates
SUCCEED, which is what the lock actually buys.

---

## Real book — the defining property, PROVEN

Structure authored on Elemental Alchemy through the product's own HTTP route,
with a real session credential.

```text
before   8d0bc84f45bef77a94551b42bbc5bfeb | 380343 chars
         POST /api/sovereign/manuscripts/…/structure  200   (×2)
after    8d0bc84f45bef77a94551b42bbc5bfeb | 380343 chars
         units 2 · placements 0
```

The Work became structurally different while its writing stayed byte-identical.

The route returned the tree with all 174 sections in `unplacedSectionIds` —
**shown, not hidden**, on a real manuscript rather than a fixture. And the first
unplaced id, `1613add4-7ddb-4d95-b34c-7e11b4299162`, is the same uuid the canvas
had been carrying in `?s=`: one identity namespace, end to end.

**Precisely scoped.** `placements 0`. The real-book byte proof so far covers
CREATING divisions. Placement writes membership rows — which still touch no
text, and which the substrate gate exercises thoroughly — but that has not yet
been done against this book, and this record does not claim it.

---

## Product reality — PARTIAL

```text
inline authoring gesture          OUTSTANDING
hierarchical map on the real book OUTSTANDING
unplaced writing remains visible  proven at the route; not yet seen in the room
explicit promote/delete grammar   OUTSTANDING
place survives reload             OUTSTANDING
section visits don't pollute Back OUTSTANDING
```

`?s=<draft-section-uuid>` was observed in the address bar on `b05451e56`, so
place is being written to the location. That it *survives a reload* has not been
witnessed.

---

## What went wrong getting here, so it is not rediscovered

**The dev server kept dying.** Started with `&` and no `nohup`, it takes SIGHUP
when its terminal tab closes. Several "silent no-op" observations were the
server simply not listening — and `curl -s` prints nothing on a connection
failure, so the evidence looked like an empty response rather than an absent
server. Use `nohup … & disown`, and `curl -sS -i` so a failure can never be
silent.

**`window.prompt` was removed from the authoring gesture** (`20b8638c6`), and
that fix stands on its own merits: Chrome lets a viewer suppress dialogs for a
whole tab, after which the naming gesture returns null and the button appears to
do nothing at all. But it is NOT established that this was the defect being hit
— the browser was never observed emitting a create gesture against a live
server. Recorded as a correct change of unproven relevance.

---

## Not authorised

05B — MAIA-proposed structure. The ladder holds: a suggestion rendered where
authored structure renders has already become authorship. Nothing in this cut
proposes anything.
