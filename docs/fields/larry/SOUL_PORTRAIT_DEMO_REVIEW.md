# Soul Portrait Practitioner Pilot — Local Review Guide

**Branch:** `review/soul-portrait-practitioner-pilot` · **Status:** held at ready — no deploy, no production accounts, no client data. A locally-reviewable demo for Larry to evaluate and iterate on.

The demo is the practitioner arc **Create → Steward → Return** for Soul Portraits — the astrology-grounded recognitions a practitioner makes *for* a subject, held privately, revisited over time.

## What's in it

| Surface | Where | Notes |
|---|---|---|
| **Return** (body of work) | `/studio/soul-portraits` | The practitioner's portraits, owner-scoped, threaded by subject. The star of the demo. |
| **Create** | `/soul-portrait/generate` | Draft generator + a **client selector** to link the subject. |
| **Steward** | `/soul-portrait/preview/[id]` | Private draft review (owner-only). |
| **Feedback** | on the Return page | Keep/Change/Remove/Missing + 6 scores + one priority — demo-safe (never breaks the walkthrough). |

## Run it locally

```bash
# 1. worktree on the branch (isolated — never the shared tree)
git worktree add /tmp/sp-review review/soul-portrait-practitioner-pilot
cd /tmp/sp-review && ln -s "$(git -C /path/to/MAIA-SOVEREIGN rev-parse --show-toplevel)/node_modules" node_modules

# 2. apply the pilot migrations to your LOCAL db (idempotent)
psql -U soullab maia_consciousness -f database/migrations/20260702000004_soul_portrait_path_b_foundation.sql
psql -U soullab maia_consciousness -f database/migrations/20260704000001_soul_portrait_subject_person.sql
psql -U soullab maia_consciousness -f database/migrations/20260706120001_soul_portrait_review_feedback.sql

# 3. seed the fictional demo (member + practitioner + subjects + 3 draft portraits)
psql -U soullab maia_consciousness -f scripts/soul-portrait-demo-seed.sql

# 4. run, then sign in as the demo practitioner by setting the cookie:
npm run dev
#    in the browser console at localhost:3000:
#      document.cookie = 'maia_session=demo_soul_portrait_review; path=/'
#    then open /studio/soul-portraits
```

## The walkthrough to show Larry

1. **Return** — open `/studio/soul-portraits`. A body of work already there: two subjects, three drafts, threaded by who they're about. This is the "return later and see development accumulate" moment.
2. **Create** — `/soul-portrait/generate`, enter birth data, generate a live draft (~1 min). This is the real create.
3. **Steward** — land on the private preview. Nothing is published or shared.
4. **Return again** — back to `/studio/soul-portraits`; the new draft has joined the body of work.

## The review session (per Kelly's protocol)

1. **Observe silently** while Larry uses it.
2. **Ask him to narrate** where he hesitates or feels friction.
3. **Capture** via the feedback panel on the Return page: **Keep / Change / Remove / Missing**.
4. **Score:** Clarity · Professional fit · Trust · Recognition quality · Stewardship value · Likelihood of regular use.
5. **One prioritization question:** *"If we changed only one thing before the next session, what would make the biggest difference?"*

This turns the demo into evidence for the next iteration rather than a product pitch.

## Runtime-verified (2026-07-06)

Ran locally on the branch. The **Return page renders correctly in the dark Studio shell** — "Your body of work," threaded by subject (both demo subjects, three dated drafts), the feedback panel present, correct auth (no session → redirect to signin). Dark Studio theme fits.

The runtime pass **found and fixed two blocking seed gaps** (now in the seed):
1. `studio_people.team_id` (NOT NULL) → the seed creates a `studio_teams` row and scopes people to it.
2. `practitioners.member_id` → the link Studio identity resolves by (`getCurrentPractitioner`: `practitioners JOIN members ON member_id`). Without it, the whole `/studio` shell bounces the member as "not a practitioner." The seed now sets it.

**Browser auth for review** (the Studio shell reads `beta_user` from localStorage *and* the session cookie):
```js
localStorage.setItem('beta_user', JSON.stringify({ memberId: '00000000-0000-4000-a000-000000000d01' }));
document.cookie = 'maia_session=demo_soul_portrait_review; path=/';
document.cookie = 'colab_team_id=00000000-0000-4000-a000-000000000d08; path=/';
location.assign('/studio/soul-portraits');
```

## Honest limitations (non-blocking — the identity drift, not UI)

- **The client selector** now *authenticates* (`/api/studio/people` → 200) but returns **no people**: team *membership* resolves through a deeper colab layer the seed doesn't populate. Non-blocking — the Return page and subject threading are fully demoable, and a portrait can still be created by entering the name. Fully wiring the selector = the two-practitioner-system reconciliation ("make one thing true"), not a UI fix.
- **The "Soul Portraits" nav item** is registered but not shown in the rail for the demo portal — module visibility is filtered by `getVisibleModules(enabledModules, portalType)`. The page is reachable directly at `/studio/soul-portraits` and via "Create a new portrait." Enabling it in the rail is a portal-config choice, deferred.
- **Seeded portraits are list stubs** — enough for the Return list (title/kind/date). To show a *full* rendered portrait, generate one live in step 2.

## Gates preserved

No production deploy · no production account provisioning · no client data · consent boundary intact (drafts only, nothing delivered). When you choose to cross into a live pilot: deploy → Co-Lab 31/31 gate → Larry's practitioner account — each your explicit step.
