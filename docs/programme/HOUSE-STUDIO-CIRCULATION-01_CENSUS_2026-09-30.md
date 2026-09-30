# HOUSE-STUDIO-CIRCULATION-01 — Census (read-only)

**Date:** 2026-09-30 · **Base:** canonical `04005ca7` · **Kind:** census / design reconciliation
**Standing:** ⛔ NO CODE CHANGED · ⛔ NO LANE OPENED · ⛔ NO CROSSING REGISTERED · founder rulings owed (§6)

Occasioned by the HOUSE-CONTEXT-04 proposal (context provider / `activeWork` / `activeIntent` /
stored context), inspected as 04D and found to duplicate existing governance and to breach
ratified law. This record fixes what the repository already says before any design proceeds.

---

## 1 · The defect (the only one this census establishes)

`app/house/page.tsx` lists up to two living Works under **WHAT'S ALIVE** and links every one of
them to bare `/writers-studio`. The member points at a specific Work; the identity is dropped at
the door. **That is the circulation gap.** Nothing else in the House→Studio path is broken.

## 2 · Existing authority (what must be built *through*, not around)

| Object | What it governs | Consequence |
|---|---|---|
| `lib/house/livingOrientation.ts` → `FACET_CROSSINGS` | Declarative crossing law: `from · to · gesture · carries · mode · authority · standing · evidence · law` | A new portal/provider would be a second, ungoverned copy. ⛔ Rejected. |
| `lib/house/facetCrossing.server.ts` → `ALLOWED_CROSSINGS` | **Content-carry** allowlist (server-built packets with excerpt + `returnHref`, ownership-validated) | ⚠️ Not the navigation layer. A pure identity-carrying navigation crossing does **not** belong here (§4.2). |
| `app/writers-studio/workContext.ts` (WS2-03B) | Current Work derived from member declarations; never stored; only manuscript id (`?m=`) persists; 0 / 1 / 2+ kept as three cases; *"first one" / "most recent" = a guess wearing the costume of a default* | `activeWork = livingWorks[0]`, `contextStore`, router state, `localStorage` all ⛔ refused by existing law. |
| `app/house/passingContext.ts` | Daily public quote only; *no member identity, private content or model input* | ⛔ Not a context spine; not to be merged with anything. |
| Intention custody (WRITERS-STUDIO-ELEMENTAL-ARRIVAL-01 §10) | MAIA may notice · reflect · propose · ask; **the member declares** | System-assigned `activeIntent` / *"Last movement: developing the transformation theme"* ⛔ refused. |

## 3 · Three findings that correct the 04D/05 plan

### 3.1 ⚠️ The House is not a crossing endpoint
`OrientationEndpoint = HousePlaceId | 'maia'`. The House lobby is the **whole**, not a place;
`from: 'house'` does not typecheck. Every existing crossing runs place→place or place→MAIA.
Registering `house-open-work-in-studio` therefore requires **either** (a) adding the lobby as an
endpoint — a vocabulary change to the crossing law, a governed act — **or** (b) declaring the
lobby→place entry as *not a facet crossing* (the lobby already links to places via
`HOUSE_PLACES[].href`, e.g. `writing → /writers-studio?from=house`, with no registry entry).
⛔ Not decided here.

### 3.2 ⚠️ WS2-03B resolves in the *opposite direction*
`resolveWorkContext(phase, works, manuscriptId)` maps **manuscript → Work**. Arrival with a Work
id needs **Work → manuscript**: the inverse relation over the *same* declarations
(`living_work_expressions` where `expressionType = 'manuscript'`). Lawful, because it reads the
same source of truth — but it is **new code**, not reuse, and must keep three cases as three:
0 manuscripts (Work exists without one — `/materials`, D-018 already models this) · 1 · 2+ (member
chooses; ⛔ no recency, ⛔ no first row).

### 3.3 ⚠️⚠️ The sharpest question: does a crossing gesture count as a declaration?
Member arrives from Work **W**, lands on manuscript **M**; M is also declared in **W2**.
WS2-03B then resolves `ambiguous` — honest, but it discards the choice the member made one click
earlier. The only ways to keep W are to carry it in the URL beside `?m=` or to store it, and
WS2-03B permits only the manuscript id to persist. So:

> **Is "I opened M *from* W" a member declaration of current context, scoped to this visit and
> valid only while W still declares M?**

Yes → a governed amendment to WS2-03B (a second URL-carried identity, re-validated on every
render so a withdrawn declaration cannot survive). No → arrival lands `ambiguous` and the member
re-chooses. ⛔ Not decided here. This, not button wording, is where the crossing law is set.

## 4 · Corrections to the proposed contract

1. ⛔ **`memberId` must not be carried.** Identity comes from the server session; a carried
   member id is a forgeable claim. The crossing carries `livingWorkId` only.
2. ⛔ **Not an `ALLOWED_CROSSINGS` entry** (see §2) — that table builds content packets.
   Navigation crossings (e.g. `astrology-discuss-with-maia`) live in the registry alone.
3. ⛔ **Arrival must re-validate ownership** of `livingWorkId` server-side and treat an unknown or
   foreign id as absent — the refusal discloses nothing (no title, no existence verdict).
4. ⛔ **"Recently entered: Elemental Alchemy" on return is stored state.** It needs a record
   somewhere; that is the second source of truth WS2-03B refused. The lawful return is the link
   back (`returnHref`), not a House memory of the visit.
5. ⛔ **Studio arrival menu may offer only what has substrate.** *"Review related material"* has
   none today; under `assertStudioMapHonest()` it may not appear. Lawful set: open the declared
   manuscript · choose among declared manuscripts · create/declare one.
6. ⚠️ **Gesture wording.** *Continue* presumes an unfinished state the system would have to
   infer; *Write* narrows the Studio to one act. **Open in Studio** names the place, not the
   member's purpose. Recommended, ⛔ not ruled.

## 5 · Adjacent observation (routed, not repaired)
`livingWorksForHouse()` is `ORDER BY updated_at DESC LIMIT 2` — WHAT'S ALIVE shows the two most
recently touched Works and silently omits the rest. Order is not ranking, but **truncation by
recency is a selection** the member did not make. ⛔ Outside this census; named so it is not
mistaken for settled.

## 6 · Founder rulings owed before any code

| # | Question | Recommendation (⛔ not taken) |
|---|---|---|
| R1 | Lane: convergence step, or own lane? | **Convergence step 2 (Work-primary composition)**, with the return path under step 3. Entering the Studio *by Work* is L1 directly; step 3 as chartered is the in-Studio breadcrumb + *Back to manuscript*, which this work touches only at the return. A separate lane would compete with the convergence gate (*no new product-capability lane until the spine is walked*). |
| R2 | House as crossing endpoint (§3.1) | (b) — lobby→place entry is not a facet crossing; carry the id on the existing `writing` place href. Smallest change; no vocabulary edit. |
| R3 | Crossing gesture as declaration (§3.3) | Ask the founder; genuinely open. |
| R4 | Visual authority | Commit the approved House screens (`ea-house.md`, currently only on the Mac Studio) before any House presentation change, so code follows approved experience. |

## 7 · Build shape, once R1–R4 are ruled (for orientation only)
1. House: each WHAT'S ALIVE Work links to `/writers-studio?from=house&work=<id>`.
2. Studio host: new intake param; server-validated ownership; Work → manuscript resolution
   (0 / 1 / 2+), no default.
3. Per R3: either carry W beside `?m=` with re-validation, or land `ambiguous` honestly.
4. Falsifiers before implementation (S3 Class-B discipline): *first-row default* · *recency
   default* · *foreign work id admitted* · *stored last-Work* · *withdrawn declaration survives
   via URL* — each a defeat candidate that must die.
5. Founder walk: House → choose Work → Studio asks the right question → return without loss of place.

⛔ No provider · ⛔ no store · ⛔ no inferred Work · ⛔ no inferred intent · ⛔ no MAIA
interpretation at the crossing · ⛔ field/relationship questions (HOUSE-FIELD-01) not opened.
