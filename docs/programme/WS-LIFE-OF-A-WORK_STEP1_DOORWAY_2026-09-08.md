# Life of a Work — Step 1 · Doorway reframing

**Lane:** Writer's Studio R&D · Life of a Work
**Authority:** FOUNDER RULING — WRITER'S STUDIO · LIFE OF A WORK (2026-09-08), Step 1 (AUTHORIZED)
**Branch:** `claude/writers-studio-experiences-afia8t`
**Status:** IMPLEMENTED · gates green · ⛔ NOT DEPLOYED · founder acceptance not performed

> The first shipped act is telling the truth about a capability Writer's Studio already has.

---

## 1. Thesis as ratified (recorded, not extended)

| | Ruling | Status |
|---|---|---|
| PT-1 | Encounter precedes intervention. A returned Work must first be encountered as a Work before Writer's Studio asks what should be done to it. | RATIFIED AS WRITTEN |
| PT-2 | Preserve / Restore / Redevelop / Continue constitute an **authority axis**, not `living_works.stage`. Enforced ultimately at the mutation boundary, not as descriptive workflow state. | RATIFIED AS WRITTEN |
| PT-3 | No content-working act may modify the historical Source from which a Working Draft was created. Work occurs only in a descendant representation. Explicit member-directed Source lifecycle acts are separately governed and must never be disguised as editing. **Custody against manuscript-working acts — not removal of the member's authority over their own Source.** | RATIFIED WITH AMENDMENT |
| PT-4 | The author declares lineage. MAIA may notice and propose a possible relationship between Works; she may neither assert nor persist lineage without explicit declaration. *There may be another Work here* — she may not make it true on the member's behalf. | RATIFIED WITH AMENDMENT |
| PT-5 | Whole Manuscript must preserve a genuine presence / reading condition. AI assistance must not make the manuscript inevitably an AI-covered editing surface. | RATIFIED AS WRITTEN |
| PT-6 | Rest is a legitimate condition of a Living Work. A Living Work does not have to be changing in order to remain alive. | RATIFIED AS WRITTEN |

Nothing in this record implements PT-1 through PT-6. It records the doorway act only.

---

## 2. Required discipline — as performed

### 2.1 Recover the exact existing doorway and import path

The doorway existed at **two render sites in one file**, `app/writers-studio/HomeView.tsx`:

| Site | Condition | Prior markup |
|---|---|---|
| Empty Studio (`kind === 'begin'`) | member has no Work | `<Link href={IMPORT_HREF}>Import writing</Link>`, quiet, beside the filled *Begin a new work* |
| Shelf footer | member already has Works | same link plus a `FolderInput` icon |

Import path: `IMPORT_HREF = '/press/manuscript?import=1'` (`app/writers-studio/studioMap.ts:129`).

**The recovery found a duplication risk the ruling did not name**: the same door was written twice, in two markup blocks, with no shared source of copy. A reframing applied to one site and not the other would have produced two different promises about one door.

### 2.2 Verify the change can remain presentation/framing only

Verified. The doorway is a `<Link>` to an existing route. Renaming it touches no handler, no query parameter, no schema, and no import mechanism. The import path is asserted unchanged by test.

### 2.3 / 2.4 Smallest bounded implementation

Three files:

- **`lib/writersStudio/returnDoorwayCopy.ts`** (new) — `RETURN_DOORWAY_COPY.label` / `.note`. Copy in one module, following the established Writer's Studio precedent (`sectionNavigationCopy.ts`, `DELETE_WORK_COPY`).
- **`app/writers-studio/HomeView.tsx`** — one local `ReturnDoorway` component reading that module, rendered at both sites (`<ReturnDoorway />`, `<ReturnDoorway withIcon />`); plus `QUIET_STACK`, a stacked variant of the existing `QUIET` style so the action can carry one quiet line beneath it.
- **`lib/writersStudio/__tests__/returnDoorwayCopy.test.ts`** (new) — 5 assertions.

**Rendered copy:**

> **Bring a work back to life**
> Import something you've written before and decide what, if anything, you want to do with it.

### 2.5 Ordinary acceptance path

| Gate | Result |
|---|---|
| `jest app/writers-studio lib/writersStudio` | **45 suites · 741 tests · 0 failed** |
| `lib/writersStudio/__tests__/returnDoorwayCopy.test.ts` | **5 passed** |
| `npm run typecheck` (no-regression, `tsconfig.ship.json`) | **229 errors vs baseline 239 · 0 regressions · exit 0** |
| `npm run check:no-supabase` | clean |

The 10 errors below baseline arrive from other lanes; **the baseline was NOT re-recorded** — re-baselining is a governed act and is not authorized here.

What the test pins, and why each assertion exists:

1. the label is the act, not the mechanism;
2. the note ends in `what, if anything` — the sovereignty clause;
3. the string `Import writing` is **gone from Home's rendered code** (comments stripped before scanning, per the C21 precedent: a prose ban must never read as the banned behaviour returning);
4. exactly **two** `<ReturnDoorway>` placements exist and neither restates the copy inline — the two doors cannot drift;
5. the doorway still opens `IMPORT_HREF`, and `IMPORT_HREF` is still `/press/manuscript?import=1` — Step 1 added no route.

---

## 3. What changed, exactly

- The Home doorway's **label**, at both render sites.
- A **second line** beneath that label, at both render sites.
- Where the copy lives: one module instead of two inline strings.

## 4. What did NOT change

- The import path, mechanism, route, and query parameter.
- Any handler, schema, migration, or table.
- `living_works.stage`; the Source; any working-draft behaviour.
- `IMPORT_HREF`'s **other two consumers**, deliberately left alone — they are not Home doorways and their copy does not contradict the reframing:
  - `app/writers-studio/canvas/page.tsx:1054` — "bring in existing writing"
  - `app/writers-studio/canvas/MaterialsDrawer.tsx:216` — "Bring something in"
- Encounter · Restore · Work→Work lineage · an intention object · WS2-08B (**HOLD unchanged**).
- Deployment. Nothing is live.

## 5. One judgement call, surfaced for the founder

The empty-Studio site carries a recorded design discipline (`WS-HOME-REDESIGN v0.2`, in-file): *"No lesson, no permission language... the room should not explain itself while you are trying to inhabit it."* The ruling's second line is an explanation, and it now renders there.

Read as compatible on this ground: the banned thing is explaining **what a Work can be**; this line says **what this door does**, and its operative clause — *what, if anything* — is a sovereignty statement, not pedagogy. **PT-6 is true at the door before the member walks through it**: bringing a work back commits them to nothing.

This is flagged rather than assumed. If the founder reads it the other way, the bounded correction is to render `.note` at the shelf-footer site only; the label change stands at both regardless.
