# SANCTUARY BOUNDARY FINDING — `manuscript_keeps` WRITE PATH

Raised under: `JARVIS_WS_BI_SANCTUARY_RESOLUTION_AND_TEST_RIDER_v1` §VI, which directs that an
existing path able to persist member content during Sanctuary be **recorded as a separate finding
and not opportunistically repaired inside B-I**. ⛔ This record repairs nothing. ⛔ No lane opened.

## What was read (read-only)

| Surface | Posture / Sanctuary reference |
|---|---|
| `app/api/sovereign/manuscripts/[id]/keeps/route.ts` (POST — the write) | **none** |
| `app/api/sovereign/keeps/route.ts` (GET) | none |
| `middleware.ts` · `lib/http/*.ts` | **no `TurnPosture` / `contentWritable`** |
| `lib/sanctuary/sanctuaryGuards.ts` `shouldPersistKeep` | guards the **Personal Wisdom Library** keep (`POST /api/library/keep`), ⛔ not `manuscript_keeps` |

## The finding

A manuscript keep — the member's own marked line, `(member, manuscript, section, verbatim_text)` —
is written with **no posture resolved and no Sanctuary check at any layer this census could see**:
not in the route, not in middleware, and there is no store module between the route and the
`INSERT` to carry one. `turnPosture.ts` states the constitutional posture as *protected stores refuse
content writes when the posture is sanctuary — and refuse when no resolvable posture is provided
at all (fail closed)*. The manuscript-keeps path is not a protected store today.

⭐ **Two objects share the word "keep" and sit on opposite sides of the boundary.** The library keep
is memory and is refused under Sanctuary. The manuscript keep is member-authored Work material and
is not checked at all. Whether the manuscript keep *should* be refused is governed by the same
founder ruling that just settled member observations (*"a member observation may exist ephemerally
in Sanctuary, but it may not cross into durable persistence"*) — a manuscript keep is the closest
existing object to a member observation, and the ruling's reasoning reaches it. ⛔ Applying it is a
separate act.

## Evidence class

**VERIFIED IN SOURCE** (absence of any guard on the named surfaces). ⛔ **NOT** verified at runtime;
no request was made; no production read.

## What this does not claim

- that a Sanctuary keep has ever been written in production (unmeasured);
- that the manuscript prose write (`saveSection`) should be Sanctuary-gated — a member's own
  manuscript is not session residue, and that question is not raised here;
- that B-I's member-observation contract is affected — it is not; its store refuses by law.

## Standing

```text
FINDING RECORDED · LANE NOT OPENED · NO REPAIR · PRODUCTION UNTOUCHED
next: founder decides whether manuscript_keeps inherits the member-observation ruling
```
