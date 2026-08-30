# CONVERGENCE-01 — FOUNDER DEVICE ACCEPTANCE WALK

**Candidate:** `11b484ab12f10e057ddb7c13f4a4427703640fa0` (`companion/convergence-01`)
**Base:** `11bd40e3f` (`origin/claude/desktop-full-platform-01`)
**Canonical at time of writing:** `3e1bb7b2a21ede3e5d7fbcfb42297e497d4ee0b0`
**Status:** MERGE HOLD · PUSH HOLD · DEPLOY HOLD
**The walk is authorized as a DIAGNOSTIC / PRE-MERGE WITNESS.** A green walk does **not**
make `11b484ab1` merge-ready. Landing is a separate future ruling — see below.

---

## ⚠️ TWO FACTS TO HAVE BEFORE THE WALK

### 1. A green walk does not produce a merge candidate

The three-file diff describes what convergence added to `11bd40e3f`. It does **not**
describe what would enter canonical.

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

**Consequence.** This is a **full-platform landing with schema consequences.** A future
landing decision has to adjudicate the *entire* candidate against then-current canonical:
the full diff, migration review and replay implications, CI against the then-current
canonical head, and the governed full deploy path (`scripts/deploy-production.sh deploy
<SHA>`) if deployment were ever separately authorized. **No `deploy-maia` shortcut.**

A green device walk tells us the Desktop architecture is inhabitable. It does not
discharge any of the above.

### 2. Custody: thin exact-SHA bundle, not the patch series

`companion/convergence-01` exists only in this remote container. `origin` carries only
`companion/01a-voice-wall` @ `4db04923b`. **PUSH is on HOLD**, so the branch has not been
published.

⛔ **The patch series is a REVIEW artifact, not the custody mechanism.** `git am` does not
inherently reproduce the original commit IDs — commit metadata can change — so a
patch-applied tree cannot satisfy an exact-SHA witness. A thin bundle is made for exactly
this case: the base already exists on origin, so the bundle carries only the objects above
it while **preserving the exact commit identities**.

Built in the authoring container against a temporary ref pointing at the **code
candidate** — deliberately *not* the later walk-doc commits:

```bash
git update-ref refs/heads/witness/convergence-01 11b484ab12f10e057ddb7c13f4a4427703640fa0
git bundle create /tmp/companion-convergence-01.bundle \
  refs/heads/witness/convergence-01 ^11bd40e3f6078b6f6591701afc9c48f2f70eae15
git bundle verify /tmp/companion-convergence-01.bundle
shasum -a 256 /tmp/companion-convergence-01.bundle
git update-ref -d refs/heads/witness/convergence-01
```

Produced and verified:

```
companion-convergence-01.bundle          27,284 bytes
sha256   08af1f75d190cde9a0efb34bfaaf18e12bdbd6f5e5df6eb4ce713b4189cdad25
contains 11b484ab12f10e057ddb7c13f4a4427703640fa0  refs/heads/witness/convergence-01
requires 11bd40e3f6078b6f6591701afc9c48f2f70eae15
```

Temporary ref deleted after creation; confirmed absent.

On the Mac Studio, **without touching the root checkout**:

```bash
cd /Users/soullab/MAIA-SOVEREIGN
git fetch origin claude/desktop-full-platform-01
git bundle verify /path/to/companion-convergence-01.bundle
git fetch /path/to/companion-convergence-01.bundle \
  refs/heads/witness/convergence-01:refs/remotes/witness/convergence-01
git worktree add --detach /tmp/companion-convergence-witness 11b484ab12f10e057ddb7c13f4a4427703640fa0
git -C /tmp/companion-convergence-witness rev-parse HEAD
```

The final line must print exactly:

```
11b484ab12f10e057ddb7c13f4a4427703640fa0
```

**Otherwise, no witness.**

⚠️ `npm run preflight` fails in a fresh worktree without
`cp /Users/soullab/MAIA-SOVEREIGN/.env.docker <worktree>/.env.docker` (known trap). The
Desktop walk itself does not need preflight.

## Pre-walk

```bash
cd /tmp/companion-convergence-witness/maia-desktop
npm test                      # expect 265/265 — re-establish source/test on the device
npm start                     # electron .
```

⛔ **Do not set `MAIA_WITNESS_MODE`.** The walk is of the *product* posture. Setting it
would grant the harness a microphone and invalidate steps 1 and 7.

---

## The walk

Eleven legs. Each falsifies a convergence claim; none is a feature tour.

| # | Act | What would falsify | Implicates |
|---|---|---|---|
| 1 | Launch Desktop | mini MAIA appears as product startup | `main.js` · shell containment |
| 2 | House → Writer's Studio | Studio unreachable, or opens a Desktop copy | seam 1 · seam 7 |
| 3 | Open a real existing Work | Work is absent, empty, or Desktop-local | seam 2 |
| 4 | Work → MAIA | `/maia` opens unsituated; WS2 Work relationship lost | seam 3 |
| 5 | Grant mic on `/maia`; **complete one real spoken turn** | no grant, no transcript, or no canonical response | `platformPermission` · `defaultSessionPermission` |
| **6A** | Speak on `/maia` → navigate to `/house` | capture continues | lifecycle capture ownership (`11bd40e3f`) |
| **6B** | Speak on `/maia` → open a House presentation that **leaves `/maia` mounted** | capture continues | `maiaIsVisible()` — route-only |
| **6C** | Speak on `/maia` → **hide / minimize Desktop** | capture continues | `maiaIsVisible()` — no window signal |
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

### Step 6 is split, and it is NOT known-broken

⛔ **Correction to an earlier framing of mine.** I previously called route-exit revocation
a known gap. That was too strong, and there is counter-evidence in the exact base:
`11bd40e3f` **is** `DESKTOP-SOVEREIGN-STT-LIFECYCLE-01`, which explicitly repairs the case
where a member leaves `/maia` mid-sentence and the recorder continues behind the new
screen — lifecycle-owned capture, abort, track stopping, stale-generation rejection.

So **6A may already be green.** Do not pre-repair it.

The narrower issue the earlier framing did not discriminate is a **visibility-authority**
one, and it is source fact, not prediction:

```js
// maia-desktop/src/shell.js:150
function maiaIsVisible() {
  return place === PLATFORM && currentPath === PLATFORM_ENTRY_PATH;
}
```

That is: *platform view attached* **AND** *`currentPath === /maia`*. It does not inspect
`BrowserWindow` visibility or minimized state — and there is **no `isMinimized`, no
`.isVisible()`, and no `hide`/`minimize`/`blur` listener anywhere in `maia-desktop/src/`**
(verified by search). Meanwhile the policy's own contract requires that `/maia` be the
*visible active place*, and relies on the caller to supply that fact.

Two cases a route-only gate cannot distinguish:

- **6B** — the House can obscure the conversation while the URL may still be `/maia`.
- **6C** — the window can be hidden or minimized while the URL is still `/maia`.

The device walk is what tells us whether these expose a real gap. Do not code around a
prediction.

### If 6B or 6C fail

Classify **one bounded finding**:

```
DESKTOP-MAIA-VISIBILITY-REVOCATION-01
```

Required invariant:

> When canonical MAIA ceases to be **actually visible**, active capture is revoked even if
> the `/maia` document remains alive. **Permission denial alone is insufficient.**

Then repair only that seam and re-witness it. **No second MAIA. No general privileged
bridge. No Writer's Studio changes.**

### Evidence to capture per step

Screen recording is enough for 1–4 and 8–9. For 5, 6A–6C and 7 also capture:

- macOS **menu-bar microphone indicator** — the one signal Electron cannot fake, and the
  decisive evidence for 6A–6C: if it stays lit after MAIA stops being visible, capture
  survived, whatever the app reports about itself.
- `MAIA_DEBUG` / devtools console lines for the permission decision.
- For step 9: the `sessionId` MAIA answers on, compared against the phone/web thread.

---

## If the walk is green

The Desktop architecture is confirmed **inhabitable**. That is the whole claim.

`11b484ab1` does **not** thereby become merge-ready. Landing remains a separate future
ruling over the full 31-commit / 80-file / 2-migration candidate against then-current
canonical — full diff, migration replay implications, CI on that head, governed full
deploy path if deployment is ever separately authorized.

## If the walk finds a defect

**Do not merge around it.** Classify it against the three-file convergence first:

- Is it in `shell-policy.js` / `main.js` / `entitlements/route.ts`? → convergence defect, fix here.
- Is it in the inherited lineage (Studio, Work, `/maia`, Now What?)? → not convergence's
  to fix; record it against the owning lane.
- Is it 6B / 6C? → `DESKTOP-MAIA-VISIBILITY-REVOCATION-01`, bounded as above. Repair that
  seam only, then re-witness it.
- Is it 6A? → that *would* be a regression against `DESKTOP-SOVEREIGN-STT-LIFECYCLE-01`,
  which the base claims to have fixed. Classify it against that lane, not this one.

## Held untouched

`MAIA-CONVERSATION-CORE-01` — no work begins until this convergence is landed. That lane
should start from a Desktop architecture we have actually inhabited.
