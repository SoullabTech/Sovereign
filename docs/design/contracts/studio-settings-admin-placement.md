---
room: Studio Settings
human_activity: a member adjusting their own Studio settings; for owners (founder/CTO) only, the Admin section is where platform permissions are stewarded
surfaces:
  - app/studio/settings/page.tsx
change_class: structural
structural_rationale: The only change to this page is the import path and component name for the owner-only Admin section, which moved from components/studio/AdminManagementSection.tsx to components/admin/MemberPermissionsSection.tsx. It still renders only when activeSection is 'admin' and the viewer is an owner, and its data route refuses everyone else server-side (401/403). Every section a member can reach, along with its copy, layout, navigation and gestures, is unchanged. The owner-only section is an admin surface and now lives under components/admin/, which the design canon gate classifies as not member-facing.
principles:
  - CONSTITUTIONAL_DIRECTION_OF_AUTHORITY — platform permission stewardship stays with owners, enforced on the server, never by UI visibility
  - CAPABILITY HONESTY — a permission is shown as what it actually opens; admin level is not described as Pro or as content access
  - MAIA_SOVEREIGNTY_INVARIANTS — admin stewardship never reaches a member's relationship or conversation content
reference_surfaces:
  - app/studio/settings/page.tsx — the existing mounted Studio Settings room
  - docs/programme/ADMIN_MEMBER_PERMISSIONS_CENSUS_2026-11-07.md — census and design of the owner-only permissions view
shared_with_house: plain-language settings sections, truthful state, and a separation between what the interface shows and the authority the server enforces
distinct_to_room: settings are where a member governs their own Studio; the owner-only Admin section is platform stewardship, not a member surface
---

# Studio Settings — Structural Experience Contract (Admin placement)

This contract places the existing Studio Settings page under the design canon. The change it covers is structural.

The owner-only Admin section was rebuilt into a member-permissions view. Because only owners can reach it, its component moved to `components/admin/`. The settings page now imports it from that path, and that import is the page's only change. Members see the same page as before.

Any future change that a member can see on this page needs an experiential contract with screenshots.
