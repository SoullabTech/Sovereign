# CONVERGENCE-01 — FOUNDER DEVICE ACCEPTANCE WALK

**Candidate:** `11b484ab12f10e057ddb7c13f4a4427703640fa0` (`companion/convergence-01`)
**Base:** `11bd40e3f` (`origin/claude/desktop-full-platform-01`)
**Canonical at time of writing:** `3e1bb7b2a21ede3e5d7fbcfb42297e497d4ee0b0`
**Status:** MERGE HOLD · PUSH HOLD · DEPLOY NOT AUTHORIZED · device walk is the only next act

---

## ⚠️ TWO FACTS TO HAVE BEFORE THE WALK

### 1. The three-file diff is the convergence delta, not the merge surface

The three-file production diff is measured against the **lineage base** `11bd40e3f`.
That base is **not in canonical** — it is 28 commits ahead of `3e1bb7b2a` and unmerged.

Measured against canonical, the merge candidate is:

```
31 commits · 80 files · +9393 / −3676
```

including **two database migrations**:

```
database/migrations/20260828000001_living_work_material_considerations.sql
database/migrations/20260828000002_field_note_responds_to.sql
```

and changes to `components/OracleConversation.tsx`, `components/voice/ContinuousConversation.tsx`,
`lib/maia/crossSurfaceAdoption.ts`, `app/maia/page.tsx`, `app/house/page.tsx`, and the
Now What? routes — all inherited from the full-platform lineage, none authored by
convergence.

**Consequence:** landing this is a schema-changing, multi-service deploy
(`scripts/deploy-production.sh deploy <SHA>`), **not** a quick `deploy-maia` rebuild.
The "governed merge path into the then-current canonical head" therefore carries the
whole lineage, not three files. That is a separate authorization from accepting the
convergence shape.

### 2. Custody: the candidate is not on any device that can run the walk

`companion/convergence-01` exists only in this remote container. `origin` carries only
`companion/01a-voice-wall` @ `4db04923b`. **PUSH is on HOLD**, so the branch has not been
published.

The walk runs on the Mac Studio. Transfer without pushing, using the three commits as a
patch series on top of a base that **is** already on origin:

```bash
# on the Mac Studio, in a WORKTREE — never in /Users/soullab/MAIA-SOVEREIGN itself
git fetch origin claude/desktop-full-platform-01
git worktree add ../convergence-01 11bd40e3f
cd ../convergence-01
git am 0001-*.patch 0002-*.patch 0003-*.patch
git rev-parse HEAD    # must print 11b484ab12f10e057ddb7c13f4a4427703640fa0
```

Patch sha256:

```
6fee0328…  0001  entitlements x-session-token carry
0b5e5650…  0002  MAIA-CONVERSATION-HARVEST-01 census
a3ec584a…  0003  rulings, fail-closed default session, steps 5–7
```

If `git rev-parse HEAD` does not print the candidate SHA exactly, **stop** — the walk
would be witnessing something other than the candidate, which is the failure mode the
witness instrument exists to refuse.

⚠️ Worktree note: `npm run preflight` will fail in a fresh worktree without
`cp /Users/soullab/MAIA-SOVEREIGN/.env.docker <worktree>/.env.docker` (known trap).

---

## Pre-walk

```bash
cd ../convergence-01/maia-desktop
npm test                      # expect 265/265 — re-establish source/test on the device
npm start                     # electron .
```

⛔ **Do not set `MAIA_WITNESS_MODE`.** The walk is of the *product* posture. Setting it
would grant the harness a microphone and invalidate steps 1 and 7.

---

## The walk

Nine steps. Each falsifies a convergence claim; none is a feature tour.

| # | Act | What would falsify | Implicates |
|---|---|---|---|
| 1 | Launch Desktop | mini MAIA appears as product startup | `main.js` · shell containment |
| 2 | House → Writer's Studio | Studio unreachable, or opens a Desktop copy | seam 1 · seam 7 |
| 3 | Open a real existing Work | Work is absent, empty, or Desktop-local | seam 2 |
| 4 | Work → MAIA | `/maia` opens unsituated; WS2 Work relationship lost | seam 3 |
| 5 | Grant mic on `/maia`; **complete one real spoken turn** | no grant, no transcript, or no canonical response | `platformPermission` · `defaultSessionPermission` |
| 6 | Navigate `/maia` → Studio **while capture is live/armed** | capture survives the departure | `shell.js` `hide()` / navigation revocation |
| 7 | Attempt mic on Studio / House / another governed surface | mic acquired anywhere but canonical MAIA; camera ever granted | `platformPermission` deny list |
| 8 | Return to the same Work | Work forked, reset, or state lost | seam 5 |
| 9 | Return to MAIA | a second/Desktop-specific conversation appears | seam 4 · `conversation.js` |

### Decisive failures

```
mini MAIA appears as product startup      FAIL
second MAIA/conversation appears          FAIL
Studio becomes a Desktop copy             FAIL
mic works outside canonical MAIA          FAIL
mic survives leaving canonical MAIA       FAIL
Work context disappears/forks             FAIL
spoken turn does not enter canon          FAIL
```

### Step 6 is the one the source cannot settle

Steps 1–5 and 7–9 are strongly predicted by the source/test evidence. **Step 6 is not.**
The known gap: House shown *over* a still-mounted `/maia` leaves a live `MediaStream`,
because `platformPermission` governs *acquisition*, not *continuation*. The ratified
amendment is explicit — *leaving `/maia` must revoke capture, not merely deny the next
permission request.* Whether the current `hide()`/navigation path already achieves this
structurally (the view is torn down) or leaves a live track is **exactly what step 6 is
for.** Expect this one to be the finding.

### Evidence to capture per step

Screen recording is enough for 1–4 and 8–9. For 5–7 also capture:

- macOS **menu-bar microphone indicator** — the one signal Electron cannot fake.
- `MAIA_DEBUG` / devtools console lines for the permission decision.
- For step 9: the `sessionId` MAIA answers on, compared against the phone/web thread.

---

## If the walk is green

`11b484ab1` becomes a merge candidate **with device evidence**. The governed merge path
then needs its own authorization, informed by fact 1 above: it lands 31 commits and two
migrations, on the then-current canonical head, via the full deploy path.

## If the walk finds a defect

**Do not merge around it.** Classify it against the three-file convergence first:

- Is it in `shell-policy.js` / `main.js` / `entitlements/route.ts`? → convergence defect, fix here.
- Is it in the inherited lineage (Studio, Work, `/maia`, Now What?)? → not convergence's
  to fix; record it against the owning lane.
- Is it the step-6 revocation gap? → that is a **known open seam**, deliberately not
  implemented pending the ruling on its shape (injecting into remote content vs. a
  governed channel). It is a finding, not a regression.

## Held untouched

`MAIA-CONVERSATION-CORE-01` — no work begins until this convergence is landed. That lane
should start from a Desktop architecture we have actually inhabited.
