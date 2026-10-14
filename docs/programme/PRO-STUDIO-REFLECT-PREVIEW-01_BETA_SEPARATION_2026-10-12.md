# PRO-STUDIO-REFLECT-PREVIEW-01 — Separate client-free beta admission
Date: October 12, 2026. Target cohort week: October 12–18.

**Standing: source candidate only; no merge, deployment, invitation, paid plan or member-data authority.**

This revision adds only an invitation gate to the already-existing Reflect-first preview and its synthetic tests/Experience Contract. It deliberately excludes every Pro Studio R2/R4 database migration, Studio Settings, Descript, billing, recording, member client record, and clinical workflow change carried in the broader draft PR #1810.

## Bounded entry and economics

- Free MAIA remains unchanged. Reflect preview is a **separate arrival/orientation page**, not a more capable MAIA and not a paid professional workspace.
- `/pro-studio/reflect` requires a verified member session, `PRO_STUDIO_REFLECT_BETA_ENABLED=true`, and an exact verified member ID on `PRO_STUDIO_REFLECT_BETA_MEMBER_IDS`.
- An absent flag, empty allowlist, non-invited member or missing/revoked/expired session refuses the page. Do not inherit Field Lab tester status or professional role. No client records are read.
- The preview leads to the already-free `/maia/encounter` and back to `/home`. There is no dedicated Reflect storage, professional MAIA corpus, or cross-room continuity.
- Proposed Reflect $29/month remains **unpublished and inactive**. No beta invitation can confer product entitlements, override constitutional law, or confer access to any client's MAIA data.

## Independence and release train

This is designed for the coordinated Soullab beta as a **schema-free module that can be reviewed or held independently** of the R2/R4 settings migration. Draft PR #1810 remains the Class A professional Settings candidate with its own high-impact privacy, migration and real restore gates. Neither candidate automatically authorizes the other.

## Required acceptance

1. Exact dependency and source revision test run, Design Canon and sovereignty gates, independent code and UX review.
2. Full Next.js browser test using fictional auth sessions verifies invited ALLOW, noninvited DENY, missing flag DENY, revoked/expired claims DENY, and **no protected content** on streamed notFound.
3. Human founder exact-version visual acceptance and cohort participant consent/selection.
4. Release operator verifies the image digest and route/middleware behavior and enables only the approved cohort. No generic public access.
5. Writer’s Studio and other beta programmes retain separate human Class A and restore/rollback acceptance; do not combine into an all-or-nothing authority packet.

**Rollback:** disable `PRO_STUDIO_REFLECT_BETA_ENABLED` and verify the preview is absent even to previously invited fictional members; there is no schema/data rollback in this narrow change.

No email invitations, real member data, production configuration or billing is altered by this document.
