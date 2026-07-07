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

## Honest limitations (verify before relying)

- **Not runtime-verified by the author** — type-clean (full-project typecheck passes for every changed file), but a live render was not run from the build environment. The steps above are the intended path; expect to smooth a rough edge on first local run.
- **The client selector** reads `/api/studio/people`, which resolves practitioner identity through a separate colab/identity layer this seed does not set up. The **Return page and subject threading do not depend on it** and are fully demoable; the live selector may show empty for the seeded demo member until that identity link exists.
- **Seeded portraits are list stubs** — enough for the Return list (title/kind/date). To show a *full* rendered portrait, generate one live in step 2.

## Gates preserved

No production deploy · no production account provisioning · no client data · consent boundary intact (drafts only, nothing delivered). When you choose to cross into a live pilot: deploy → Co-Lab 31/31 gate → Larry's practitioner account — each your explicit step.
