# Arrival / House — Assembly Inventory (2026-07-22)

**Session role:** sole owner of Arrival, House, Opening, orientation, re-entry.
**Phase:** assembly, not discovery. Inventory only — nothing built.

Founder rulings in force:
- Arrival ontology = **member-invoked return**.
- Temporary implementation = **first visit only**.
- Returning members open **directly into conversation**.
- House provides **deliberate return to Arrival**.
- **Jewel = presence, not voice.**
- **One House, one renderer, one doorway.**
- Greeting suppression depends on **whether Arrival actually rendered**.

---

## 1. Inventory

### 1.1 Nothing is lost

| Artifact | Status |
|---|---|
| `components/maia/MaiaArrivalField.tsx` | **PRESERVED, 3 versions** (see 1.3) |
| `components/maia/MaiaHouseSheet.tsx` | **On `clean-main-no-secrets`**, 5352B, blob `39e4ae829d`, unchanged on every branch |
| Preservation branch | `origin/chore/arrival-field-preservation-2026-07-22` — EXISTS, +1/-2 vs main, commit `0a333abbf` |
| Working-tree `MaiaArrivalField.tsx` | untracked (`??`), 7970B — **byte-identical to the preservation blob** |

### 1.2 PR state

| PR | Branch | State | Base | Contains |
|---|---|---|---|---|
| **#686** | `fix/arrival-composition-wire` | **OPEN** | main (+3) | `MaiaArrivalField` new file; OracleConversation early-return; greeting suppression; MaiaShell `openMaiaHouse` listener |
| **#687** | `fix/arrival-completion-marker` | **OPEN** | main (+1) — **independent of #686** | `onMemberExpression`; marker fires on member speech, write-once |
| **#690** | `fix/arrival-send-target` | **OPEN** | **#686 (+1)** — strict superset of #686 | 44×44 send tap target |
| #689 | `fix/arrival-jewel-voice-wire` | **CLOSED** | forked from #686 c1 | jewel-as-voice — correctly closed, violates "jewel = presence" |
| #688 | `fix/legibility-and-duplication` | **MERGED** 07-23 02:11Z | — | transcript duplication (Session 2 territory) |

Unclaimed branch, **no PR**: `origin/fix/remove-house-doorway` (`770d4b96b`, +1/-2) — *"remove The House doorway from the returning surface."* **Conflicts with the "House → deliberate return" ruling.** Needs a founder disposition before assembly.

### 1.3 The three `MaiaArrivalField.tsx` lineages

| Ref | Size | Blob | Read |
|---|---|---|---|
| preservation branch + working tree | 7970B | `747a3974b7` | baseline ceremony |
| **#686** | 8867B | `4ca224086e` | +62/-51 vs baseline — composition/layout rework, jewel raised, House upper-left |
| **#690** | 9692B | `fb073ca6b6` | #686 + tap target |
| #689 (closed) | 11492B | `b56e7f5265` | jewel wired to voice — **do not restore** |

---

## 2. Live behavior on `clean-main-no-secrets`

- `feature-flags.ts`: `arrivalEntry: true` (default ON, kill-switch).
- `app/maia/page.tsx`: `hasArrived` defaults **true** (SSR-safe), flips false only when `localStorage.maia_has_arrived` is absent. Passes `arrivalMode={featureFlags.arrivalEntry && !hasArrived}` **to MaiaShell**.
- `markArrived()` currently fires from `onSessionActiveChange(active)` — **activation, not expression**.
- `MaiaShell.tsx` owns `houseOpen` + renders `MaiaHouseSheet`; House button present on both surfaces.
- `MaiaArrivalField` is **not referenced anywhere on main**. The composition is unwired in production.

---

## 3. Gaps between the rulings and the code

**G1 — Greeting suppression keys off the flag, not the render.**
#686 guards with `!sessionRestoredRef.current && !featureFlags.arrivalEntry`. `arrivalEntry` is default-ON for *everyone*, so a **returning** member (`hasArrived === true`, Arrival does not render) whose session was not restored gets **no greeting and no Arrival** — an empty surface. Violates "greeting suppression depends on whether Arrival actually rendered."

**G2 — OracleConversation cannot know whether Arrival rendered.**
`hasArrived` lives in `app/maia/page.tsx` and is passed only to `MaiaShell` as `arrivalMode`. `OracleConversation` receives the flag but not the marker, so it currently *cannot* satisfy G1. This is the single missing wire.

**G3 — #686 and #687 are independent branches touching the same two files.**
Both modify `components/OracleConversation.tsx`; #687 also rewrites the `onSessionActiveChange` call site in `app/maia/page.tsx` that #686 leaves alone. They must be sequenced, not merged in parallel.

**G4 — House has no deliberate return to Arrival.**
`MaiaHouseSheet` offers no affordance that re-opens Arrival. The ontology ruling (member-invoked return) has **no implementation**; only the temporary first-visit path exists. `fix/remove-house-doorway` pushes in the opposite direction.

**G5 — #690 supersedes #686.** Merging #686 then #690 is a no-op double-review; #690 already contains #686 whole.

---

## 4. House registry

**Correction to an earlier claim in this document:** there *is* a real House registry — `lib/navigation/maiaNav` (`MAIA_WORLDS` + `getVisibleBoundaries`), consumed directly by `MaiaHouseSheet` and audience-gated by `isFounder`. My first pass grepped for `houseRegistry` / `HOUSE_PLACES` and wrongly concluded none existed. Nothing was lost; the registry was never at risk.

---

## OUTCOME — shipped as PR #691 (2026-07-22)

Branch `feature/arrival-house-integration` off `clean-main-no-secrets`; 5 cherry-picked commits (#690 ×4, #687 ×1) + 1 integration commit. **Open, awaiting founder visual review before merge.**

Three defects found while assembling, all closed in the branch:
1. Greeting suppression *and* the renderer were both keyed to `featureFlags.arrivalEntry` (default-ON) — returning members met the first-visit ceremony on every fresh session.
2. Two "Open The House" buttons rendered during Arrival.
3. The Arrival render site sat inside a branch reserved for members who had not yet spoken, so the deliberate return rendered nothing.

Verified desktop + mobile across all three journeys; durable marker confirmed intact through the return. Enter-to-send unconfirmed via the automation harness — needs a human keypress at review.

---

## 5. Canonical integration base

**`origin/fix/arrival-send-target` (PR #690).**

It is a strict superset of #686 — it contains all three of #686's commits plus `2f86a8d2a`, carries the newest `MaiaArrivalField.tsx` (9692B), and is already based on `clean-main-no-secrets`. Nothing is gained by starting anywhere else.

```
git checkout -b feature/arrival-house-integration origin/fix/arrival-send-target
```

## 6. Disposition of each PR / branch

| Ref | Disposition | Reason |
|---|---|---|
| **#690** `fix/arrival-send-target` | **BASE** | superset of #686; newest composition |
| **#686** `fix/arrival-composition-wire` | **SUPERSEDED — close, do not merge** | every commit already in #690; zero loss |
| **#687** `fix/arrival-completion-marker` | **PARTIALLY REUSED — cherry-pick `96b41a8ee`** | independent of #686, so merge would conflict-by-parallel; the commit itself is wholly correct — it is the ruling *returning member = has spoken* |
| #689 `fix/arrival-jewel-voice-wire` | **DISCARD permanently** | jewel-as-voice; violates *jewel = presence* |
| `chore/arrival-field-preservation-2026-07-22` | **KEEP as insurance, do not merge** | a 7970B variant, not an ancestor of #686's 8867B — superseded by the composition rework, retains nothing unique |
| `fix/remove-house-doorway` (no PR) | **ABANDON** | removes the House doorway from the returning surface; directly contradicts *House → deliberate return*. Proceeding as abandoned. |

## 7. Assembly

```
fresh member     → Arrival
returning member → conversation
House            → deliberate return to Arrival
```

On `feature/arrival-house-integration`, in order:

1. **Cherry-pick `96b41a8ee`** (#687). Gives `onMemberExpression`; arrival ends at speech, not activation; marker write-once. → *returning member → conversation* becomes true for the right reason.
2. **Wire `arrivalRendered`** (closes G1+G2 — not in any branch, must be built). Pass the already-computed `featureFlags.arrivalEntry && !hasArrived` from `app/maia/page.tsx` into `OracleConversation`, and change the greeting guard from `!featureFlags.arrivalEntry` to `!arrivalRendered`. → *greeting suppression depends on whether Arrival actually rendered*. Without this, returning members hit an empty surface.
3. **Build the deliberate return** (G4 — not in any branch). One House entry that sets `hasArrived → false` for the session **without clearing the persisted `maia_has_arrived` marker**. Arrival as member-invoked return, not a reset. → *House → deliberate return*.

Ship as one PR against `clean-main-no-secrets`. #686, #687, #689 close on merge.

**Out of scope** (Session 2 owns): persistence, `exchange_id`, duplicate writes, #688 follow-ups.
**Preservation:** no branch deleted until this lands and is verified in production.
