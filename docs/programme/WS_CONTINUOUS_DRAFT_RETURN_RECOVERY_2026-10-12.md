# Writer's Studio — existing continuous-draft return recovery

Date: 2026-10-12
Standing: **ISOLATED ENGINEERING CANDIDATE. NOT DEPLOYED, NOT A BETA-RELEASE CLEARANCE.**
Branch: `fix/ws-jondi-continuous-return-20261012`, stacked on the draft first-writer pilot at `0ab048a057`.

## User-visible failure and privacy-preserving diagnosis

A returning writer could open Studio Home and see their existing Works, but using **Open** reached the near-blank Write error: “This manuscript is not section-addressable yet. The Studio will not guess at its structure.”

Read-only production metadata checks confirmed the relevant older manuscript has an existing **continuous** Working Draft, immutable Source sections, zero draft-section records, and a draft whose UTF-8 text differs from source-derived composition. No actual manuscript text or account credentials were read into this engineering branch; no member manuscript content was copied.

The installed reader has an arrival path for `no_draft` but rejects `continuous`, even where an edited draft is intact. It is not a browser restart or screen-size defect. Invoking the create-draft route, or automatically supplying `convert:true`, would not be an admissible fix for a diverged draft.

## Bounded recovery

- When the **member-scoped** `/api/writers-studio/rebuild/context` response for the requested manuscript returns `continuous`, the Write controller stops without any mutation and renders an accessible, contrasting recovery panel.
- The recovery panel offers an explicit **Open my existing draft** navigation gesture to `/writers-studio/canvas?m=<exact manuscript id>`.
- The original Canvas Worktable is the admitted client editor for continuous and `continuous_unprovable` drafts. The link does not ask it to seed, convert, re-import, or infer source boundaries.
- The manuscript id must equal the id from the authenticated server response. Invalid/unresolved responses cannot generate a recovery link.
- **Back to my Works** goes to Studio Home. Other error states now display legibly against their dark background.
- No SQL, storage writes, source upload, permission, automatic conversion, recovery-key action, content telemetry, or model call is added by this change.

## Acceptance

- Five focused Studio suites, **50/50 PASS**, including five new recovery tests, manuscript-seed guard, canvas route identity and continuous write-state mount.
- Real Chrome synthetic recovery panel at desktop and narrow-screen sizes **PASS**, exact address retained, no browser errors and zero network requests on render. Script: `scripts/witness/ws-jondi-continuous-recovery-browser-20261012.cjs`.
- Broader Studio test population at this patch: **1,497 pass / 6 fail**. The unchanged parent at `0ab048a057` has **1,492 pass / the same 6 fail**; no new failures.
- Unauthenticated GET to the production Canvas route still redirects to sign-in, not 404. **The writer's authenticated Canvas opening remains unverified** until a member performs it.

## Release STOP

Do not silently convert or overwrite the existing continuous draft, and do not promise a lossless conversion; the words have diverged from immutable Source. Do not make a new member account or substitute another Work. Production source-write Caddy fence remains in force. The unrelated encrypted-backup private-key/restore, crash-safe source custody, migration compatibility, independent review, exact certified application build, and explicit founder deployment approval gates remain outstanding.

An immediate **read-only user check** may use `https://soullab.life/writers-studio/canvas` (without an id) while signed in: select the correct existing manuscript and confirm the saved text appears. Do not authorize further editing until backup/recovery is verified. That check neither deploys this fix nor clears the production beta gate.
