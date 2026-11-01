# Beta Co-Lab — founder steps (COLAB-BETA-01 step 7)

```text
STATUS   Working note · founder checklist · not yet performed
WHEN     After PR #2033 (tester journey field) is deployed and production reports its SHA
WHO      Founder only (Co-Lab owner); no session creates the Co-Lab or sets the variable
SOURCE   canonical 7f86e1cef — components/team/CoLabTeamSwitcher.tsx · components/team/TeamSidebar.tsx
         app/api/team/channels/route.ts · app/api/team/invite/route.ts · lib/writersStudio/journeyServer.ts
```

## 0 · Before you start

- Production already holds a team named **`[Legacy 2026-10-21] Writer's Studio Beta Group · 9058a852`**
  (created 2026-09-06, 0 channels; read 2026-11-01). It was retired on 2026-10-21. **Do not reuse it.**
  Make a fresh Co-Lab so the journey's report-back lands somewhere with a clean history.
- Confirm the journey field is live: `/writers-studio` shows **Beta journey** at the bottom left.

## 1 · Create the Co-Lab (about a minute)

1. Open **soullab.life/team/general**, signed in as yourself.
2. Open the Co-Lab switcher at the top of the left sidebar and choose **New workspace**.
3. Name it **MAIA Beta Co-Lab** and press **Create**.
   The app makes you the owner, creates **#general** automatically and switches you into it.

## 2 · Add the other three channels

In the sidebar, use **Add channel** (the + beside Channels) three times. For each, leave **Private** unchecked:

| Name     | Slug       | Type             | Purpose                                                  |
|----------|------------|------------------|----------------------------------------------------------|
| Welcome  | `welcome`  | **Announcement** | Your notes to testers; read-mostly                       |
| Feedback | `feedback` | Channel          | **Where shared journey answers land** (Problems · Questions · Suggestions) |
| Bugs     | `bugs`     | Channel          | Concrete breakages                                       |

Leave the channels public within the Co-Lab. Membership of the Co-Lab is what governs who sees
them, and private channels would also need every tester added by hand.

## 3 · Read the #feedback channel id (read-only)

The app's channel URLs use the slug (`/team/feedback`), so the id isn't shown on screen.
Read it with one query:

```bash
ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -tAc \"SELECT c.id FROM team_channels c JOIN studio_teams t ON t.id = c.team_id WHERE t.name = 'MAIA Beta Co-Lab' AND c.slug = 'feedback' AND c.archived_at IS NULL\""
```

It must return **exactly one** UUID. If it returns none or two, stop: the name or slug doesn't match
what was created.

## 4 · Set the variable (takes effect at the next deploy)

Add one line to `~/MAIA-SOVEREIGN/.env.production` on minisforum:

```text
WRITERS_STUDIO_JOURNEY_COLAB_CHANNEL_ID=<the UUID from step 3>
```

⚠️ **Do not recreate the container by hand to pick it up** (`docker compose … up -d --no-deps maia`).
That path skips the deploy-lane lock and provenance check. This happened on 2026-09-07
(see the SCHEMA DRIFT note in CLAUDE.md). Let the variable ride the next deploy through
`scripts/pre-deploy-gate.sh deploy-maia <SHA>` or `scripts/deploy-production.sh deploy <SHA>`.
Until then, sharing fails closed: writers can still answer, and you can still read every answer
in the founder view.

## 5 · Invite the two pilot writers

From **Invite to Co-lab** in the sidebar (owner/admin only), invite each writer by email.
The invitation now has to name this Co-Lab, so it can't fall into Team Soullab by mistake.
They join as **members**. MAIA is not added as a participant: it stays invoked on request, never ambient.

## 6 · Check it worked

After the deploy that carries the variable, one pilot writer answers a journey question and chooses
**Share to Co-Lab → Problem**. Then:

- The message appears in **#feedback** under **the writer's own name**, not yours or MAIA's.
- The Co-Lab gate passes with `0 failed`, including section 6:
  ```bash
  ssh soullab@minisforum 'docker exec maia-sovereign sh -c "DATABASE_URL=\"\$DATABASE_URL\" npx tsx scripts/verify-constitution-colab.ts"'
  ```
- The writer withdraws that answer, and the #feedback copy disappears.

Only after this passes with both pilot writers do you invite the rest of the cohort (COLAB-BETA-01 step 8).
